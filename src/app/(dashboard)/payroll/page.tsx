import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { PayrollView } from "@/components/payroll/payroll-view";
import { resolveLessonClient } from "@/lib/utils/client-name";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

// Legacy fallback for old/orphan lessons that have no client_name on the lesson
// itself and no recurring_schedule link to pull one from. Same map used in מעקב אישורים.
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

export default async function PayrollPage({
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
  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthLabel = `${MONTHS_HEBREW[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
  const prevMonthStr = format(subMonths(selectedMonth, 1), "yyyy-MM");
  const nextMonthStr = format(addMonths(selectedMonth, 1), "yyyy-MM");
  const currentMonthStr = format(now, "yyyy-MM");
  const selectedMonthStr = format(selectedMonth, "yyyy-MM");

  const admin = createAdminClient();

  // Same source as מעקב אישורים: all lessons in the selected month, with the same
  // client/city resolution logic (lesson's own client_name, then its recurring_schedule
  // row's client_name, then the legacy city map).
  const { data: lessons } = await admin
    .from("lessons")
    .select(
      `id, lesson_date, start_time, status, instructor_id, recurring_item_id, client_name,
       instructor:instructors!lessons_instructor_id_fkey(id, full_name),
       location:locations!lessons_location_id_fkey(city)`
    )
    .gte("lesson_date", monthStart)
    .lte("lesson_date", monthEnd)
    .order("lesson_date")
    .order("start_time");

  const allLessons = (lessons ?? []).filter((l) => l.instructor_id);

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

  const flatLessons = allLessons.map((l) => {
    const city = (l.location as any)?.city ?? "";
    const clientName =
      resolveLessonClient(l.client_name, l.recurring_item_id, recurringClientMap) ??
      CITY_TO_CLIENT[city] ??
      "אחר";
    return {
      id: l.id,
      lesson_date: l.lesson_date,
      start_time: l.start_time,
      status: l.status,
      instructor_id: l.instructor_id as string,
      instructor_name: (l.instructor as any)?.full_name ?? "לא ידוע",
      client_name: clientName,
      city,
    };
  });

  const instructorIds = [...new Set(flatLessons.map((l) => l.instructor_id))];

  const { data: rates } = await admin
    .from("instructor_pay_rates")
    .select("instructor_id, client_name, city, rate_per_lesson, travel_rate_per_day")
    .in("instructor_id", instructorIds.length > 0 ? instructorIds : ["__none__"]);

  const lessonIds = flatLessons.map((l) => l.id);
  const { data: exceptions } = await admin
    .from("instructor_pay_exceptions")
    .select("lesson_id, instructor_id, amount, notes")
    .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["__none__"]);

  const { data: bonuses } = await admin
    .from("instructor_pay_bonuses")
    .select("id, instructor_id, year, month, label, amount")
    .eq("year", selectedMonth.getFullYear())
    .eq("month", selectedMonth.getMonth() + 1)
    .in("instructor_id", instructorIds.length > 0 ? instructorIds : ["__none__"]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          שכר מדריכים
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          עמוד זה גלוי רק עבורך ואינו מוצג למנהלים אחרים
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-orange-500 shrink-0" />
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Link
            href={`/payroll?month=${prevMonthStr}`}
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronRight size={16} />
          </Link>
          <Link
            href={`/payroll?month=${currentMonthStr}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedMonthStr === currentMonthStr
                ? "bg-secondary text-[#1C1917]"
                : "hover:bg-muted"
            }`}
          >
            חודש נוכחי
          </Link>
          <Link
            href={`/payroll?month=${nextMonthStr}`}
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronLeft size={16} />
          </Link>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {monthLabel}
        </span>
      </div>

      <PayrollView
        lessons={flatLessons}
        rates={rates ?? []}
        exceptions={exceptions ?? []}
        bonuses={bonuses ?? []}
        year={selectedMonth.getFullYear()}
        month={selectedMonth.getMonth() + 1}
      />
    </div>
  );
}
