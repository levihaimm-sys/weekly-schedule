import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { ProfitLossView } from "@/components/profit-loss/profit-loss-view";
import { resolveLessonClient } from "@/lib/utils/client-name";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

// Legacy fallback for old/orphan lessons that have no client_name on the lesson
// itself and no recurring_schedule link to pull one from. Same map used in
// מעקב אישורים, שכר מדריכים ותשלום לקוחות.
const CITY_TO_CLIENT: Record<string, string> = {
  "פת": "טומשין",
  "גבעתיים": "טומשין",
  "ראש העין": "טומשין",
  "באר יעקב": "טומשין",
  "גבעתיים כצנלסון": "טומשין כצנלסון",
  "הוד השרון": "עיריית הוד השרון",
  "נחל שורק": "אופק",
  "נס ציונה": "ינוקא",
};

const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const NONE = ["__none__"];
const PAGE = 1000;
const ID_CHUNK = 150;

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_owner")
    .eq("id", session?.user?.id ?? "")
    .single();

  if (!profile?.is_owner) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const now = new Date();
  const selectedMonth = params.month ? new Date(params.month + "-01") : now;
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;
  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthLabel = `${MONTHS_HEBREW[month - 1]} ${year}`;
  const prevMonthStr = format(subMonths(selectedMonth, 1), "yyyy-MM");
  const nextMonthStr = format(addMonths(selectedMonth, 1), "yyyy-MM");
  const currentMonthStr = format(now, "yyyy-MM");
  const selectedMonthStr = format(selectedMonth, "yyyy-MM");

  const admin = createAdminClient();

  // Same lesson source and client/city resolution as שכר מדריכים and תשלום לקוחות.
  // Paged: a full month (incl. future scheduled lessons) can exceed PostgREST's 1000-row cap.
  const lessons: any[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data } = await admin
      .from("lessons")
      .select(
        `id, lesson_date, status, instructor_id, recurring_item_id, client_name,
         instructor:instructors!lessons_instructor_id_fkey(id, full_name),
         location:locations!lessons_location_id_fkey(city)`
      )
      .gte("lesson_date", monthStart)
      .lte("lesson_date", monthEnd)
      .neq("status", "cancelled")
      .order("id")
      .range(from, from + PAGE - 1);
    lessons.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }

  const allLessons = lessons.filter((l) => l.instructor_id);

  const recurringIds = [
    ...new Set(allLessons.map((l) => l.recurring_item_id).filter(Boolean)),
  ] as string[];
  const recurringClientMap = new Map<string, string>();
  if (recurringIds.length > 0) {
    const { data: recurringRows } = await admin
      .from("recurring_schedule")
      .select("id, client_name")
      .in("id", recurringIds);
    for (const row of recurringRows ?? []) {
      if (row.client_name) recurringClientMap.set(row.id, row.client_name);
    }
  }

  const lessonIds: string[] = allLessons.map((l) => l.id);

  // A month's lesson ids don't fit in one `.in()` URL — query them in chunks.
  async function byLessonIds<T>(table: string, columns: string): Promise<T[]> {
    const out: T[] = [];
    for (let i = 0; i < lessonIds.length; i += ID_CHUNK) {
      const { data } = await admin
        .from(table)
        .select(columns)
        .in("lesson_id", lessonIds.slice(i, i + ID_CHUNK));
      out.push(...((data ?? []) as T[]));
    }
    return out;
  }

  const [signatures, payExceptions, clientExceptions] = await Promise.all([
    byLessonIds<{ lesson_id: string }>("signatures", "lesson_id"),
    byLessonIds<{ lesson_id: string; amount: number }>("instructor_pay_exceptions", "lesson_id, amount"),
    byLessonIds<{ lesson_id: string; amount: number }>("client_payment_exceptions", "lesson_id, amount"),
  ]);
  const signedIds = new Set(signatures.map((s) => s.lesson_id));

  const flatLessons = allLessons.map((l) => {
    const city = (l.location as any)?.city ?? "";
    const clientName =
      resolveLessonClient(l.client_name, l.recurring_item_id, recurringClientMap) ??
      CITY_TO_CLIENT[city] ??
      "אחר";
    return {
      id: l.id,
      lesson_date: l.lesson_date,
      signed: signedIds.has(l.id),
      instructor_id: l.instructor_id as string,
      instructor_name: (l.instructor as any)?.full_name ?? "לא ידוע",
      client_name: clientName,
      city,
    };
  });

  const instructorIds = [...new Set(flatLessons.map((l) => l.instructor_id))];
  const clientNames = [...new Set(flatLessons.map((l) => l.client_name))];
  const iIds = instructorIds.length > 0 ? instructorIds : NONE;
  const cNames = clientNames.length > 0 ? clientNames : NONE;

  const [
    payRatesRes,
    bonusesRes,
    clientRatesRes,
    adjustmentsRes,
    settingsRes,
    overridesRes,
    fixedRes,
    officeWorkersRes,
    officeHoursRes,
    invoiceStatusRes,
  ] = await Promise.all([
    admin
      .from("instructor_pay_rates")
      .select("instructor_id, client_name, city, rate_per_lesson, travel_rate_per_day")
      .in("instructor_id", iIds),
    admin
      .from("instructor_pay_bonuses")
      .select("instructor_id, amount")
      .eq("year", year)
      .eq("month", month)
      .in("instructor_id", iIds),
    admin
      .from("client_payment_rates")
      .select("client_name, city, billing_mode, rate_per_lesson, fixed_monthly_amount")
      .in("client_name", cNames),
    admin
      .from("client_payment_adjustments")
      .select("client_name, label, amount")
      .eq("year", year)
      .eq("month", month)
      .in("client_name", cNames),
    // All settings, not just this month's instructors — office workers may have no lessons.
    admin
      .from("instructor_employment_settings")
      .select("instructor_id, employment_type, employer_cost_pct, is_office"),
    admin
      .from("pl_activity_overrides")
      .select("instructor_id, client_name, city, activity_count, work_days")
      .eq("year", year)
      .eq("month", month),
    admin
      .from("pl_fixed_expenses")
      .select("id, label, amount, year, month")
      .or(`year.is.null,and(year.eq.${year},month.eq.${month})`)
      .order("created_at"),
    admin
      .from("pl_office_workers")
      .select("id, full_name, employment_type, employer_cost_pct, hourly_rate")
      .eq("is_active", true)
      .order("full_name"),
    admin
      .from("pl_office_worker_hours")
      .select("worker_id, hours")
      .eq("year", year)
      .eq("month", month),
    admin
      .from("pl_invoice_status")
      .select("client_name")
      .eq("year", year)
      .eq("month", month),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          רווח והפסד
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          עמוד זה גלוי רק עבורך ואינו מוצג למנהלים אחרים
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-orange-500 shrink-0" />
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Link
            href={`/profit-loss?month=${prevMonthStr}`}
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronRight size={16} />
          </Link>
          <Link
            href={`/profit-loss?month=${currentMonthStr}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedMonthStr === currentMonthStr
                ? "bg-secondary text-[#1C1917]"
                : "hover:bg-muted"
            }`}
          >
            חודש נוכחי
          </Link>
          <Link
            href={`/profit-loss?month=${nextMonthStr}`}
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronLeft size={16} />
          </Link>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {monthLabel}
        </span>
      </div>

      <ProfitLossView
        lessons={flatLessons}
        payRates={payRatesRes.data ?? []}
        payExceptions={payExceptions}
        bonuses={bonusesRes.data ?? []}
        clientRates={clientRatesRes.data ?? []}
        clientExceptions={clientExceptions}
        adjustments={adjustmentsRes.data ?? []}
        settings={settingsRes.data ?? []}
        overrides={overridesRes.data ?? []}
        fixedExpenses={fixedRes.data ?? []}
        officeWorkers={officeWorkersRes.data ?? []}
        officeHours={officeHoursRes.data ?? []}
        invoicesSent={(invoiceStatusRes.data ?? []).map((r) => r.client_name)}
        year={year}
        month={month}
        monthLabel={monthLabel}
      />
    </div>
  );
}
