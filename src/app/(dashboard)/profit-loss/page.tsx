import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ProfitLossView } from "@/components/profit-loss/profit-loss-view";
import { MonthNavigator } from "@/components/ui/month-navigator";

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

const PAGE = 1000;

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const selectedMonth = params.month ? new Date(params.month + "-01") : now;
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;
  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthLabel = `${MONTHS_HEBREW[month - 1]} ${year}`;
  const currentMonthStr = format(now, "yyyy-MM");
  const selectedMonthStr = format(selectedMonth, "yyyy-MM");

  const admin = createAdminClient();

  // Only lessons up to today matter: future lessons can't be signed yet, so they'd never count.
  const todayIL = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Jerusalem" });
  const lessonsEnd = monthEnd < todayIL ? monthEnd : todayIL;

  // Same lesson source and client/city resolution as שכר מדריכים and תשלום לקוחות.
  // Signatures, exceptions and the recurring row's client are embedded, so the whole month
  // comes back in one round-trip instead of dozens of chunked lookups.
  async function loadLessons() {
    const out: any[] = [];
    if (lessonsEnd < monthStart) return out;
    for (let from = 0; ; from += PAGE) {
      const { data } = await admin
        .from("lessons")
        .select(
          `id, lesson_date, instructor_id, client_name,
           instructor:instructors!lessons_instructor_id_fkey(full_name),
           location:locations!lessons_location_id_fkey(city),
           recurring:recurring_schedule!lessons_recurring_item_id_fkey(client_name),
           signatures(lesson_id),
           pay_ex:instructor_pay_exceptions(amount),
           client_ex:client_payment_exceptions(amount)`
        )
        .gte("lesson_date", monthStart)
        .lte("lesson_date", lessonsEnd)
        .neq("status", "cancelled")
        .not("instructor_id", "is", null)
        .order("id")
        .range(from, from + PAGE - 1);
      out.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
    return out;
  }

  // Embedded one-to-one relations come back as an object or a one-item array.
  const first = (v: any) => (Array.isArray(v) ? v[0] : v) ?? null;

  // Everything that doesn't depend on the lesson list runs in parallel with it (incl. the owner check).
  const [
    lessons,
    profileRes,
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
    invoiceOverridesRes,
    manualLessonsRes,
    paidRes,
    instructorsRes,
  ] = await Promise.all([
    loadLessons(),
    (async () => {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return supabase
        .from("profiles")
        .select("is_owner")
        .eq("id", session?.user?.id ?? "")
        .single();
    })(),
    admin
      .from("instructor_pay_rates")
      .select("instructor_id, client_name, city, rate_per_lesson, travel_rate_per_day"),
    admin
      .from("instructor_pay_bonuses")
      .select("id, instructor_id, label, amount")
      .eq("year", year)
      .eq("month", month),
    admin
      .from("client_payment_rates")
      .select("client_name, city, billing_mode, rate_per_lesson, fixed_monthly_amount"),
    admin
      .from("client_payment_adjustments")
      .select("client_name, label, amount")
      .eq("year", year)
      .eq("month", month),
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
    admin
      .from("pl_invoice_overrides")
      .select("client_name, city, activity_count")
      .eq("year", year)
      .eq("month", month),
    admin
      .from("pl_manual_lessons")
      .select("id, instructor_id, client_name, city, lesson_count, work_days, note")
      .eq("year", year)
      .eq("month", month)
      .order("created_at"),
    admin
      .from("pl_payee_paid")
      .select("payee_id")
      .eq("year", year)
      .eq("month", month),
    // For adding manual lessons to an instructor who has no lessons this month.
    admin
      .from("instructors")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  if (!profileRes.data?.is_owner) {
    redirect("/dashboard");
  }

  const payExceptions: { lesson_id: string; amount: number }[] = [];
  const clientExceptions: { lesson_id: string; amount: number }[] = [];

  const flatLessons = lessons.map((l) => {
    const city = first(l.location)?.city ?? "";
    const recurringClient = first(l.recurring)?.client_name?.trim() || null;
    const clientName =
      l.client_name?.trim() || recurringClient || CITY_TO_CLIENT[city] || "אחר";
    const payEx = first(l.pay_ex);
    if (payEx) payExceptions.push({ lesson_id: l.id, amount: payEx.amount });
    const clientEx = first(l.client_ex);
    if (clientEx) clientExceptions.push({ lesson_id: l.id, amount: clientEx.amount });
    return {
      id: l.id as string,
      lesson_date: l.lesson_date as string,
      signed: !!first(l.signatures),
      instructor_id: l.instructor_id as string,
      instructor_name: first(l.instructor)?.full_name ?? "לא ידוע",
      client_name: clientName as string,
      city: city as string,
    };
  });

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

      <MonthNavigator
        basePath="/profit-loss"
        selectedMonthStr={selectedMonthStr}
        currentMonthStr={currentMonthStr}
      />

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
        invoiceOverrides={invoiceOverridesRes.data ?? []}
        manualLessons={manualLessonsRes.data ?? []}
        paid={(paidRes.data ?? []).map((r) => r.payee_id)}
        allInstructors={instructorsRes.data ?? []}
        year={year}
        month={month}
        monthLabel={monthLabel}
      />
    </div>
  );
}
