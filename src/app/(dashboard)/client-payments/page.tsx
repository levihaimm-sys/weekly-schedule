import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ClientPaymentsView } from "@/components/client-payments/client-payments-view";
import { resolveLessonClient } from "@/lib/utils/client-name";
import { MonthNavigator } from "@/components/ui/month-navigator";

export const dynamic = "force-dynamic";

// Legacy fallback for old/orphan lessons that have no client_name on the lesson
// itself and no recurring_schedule link to pull one from. Same map used in
// מעקב אישורים ובשכר מדריכים.
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

export default async function ClientPaymentsPage({
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
  const currentMonthStr = format(now, "yyyy-MM");
  const selectedMonthStr = format(selectedMonth, "yyyy-MM");

  const admin = createAdminClient();

  // Same source as מעקב אישורים ושכר מדריכים: all lessons in the selected
  // month, with the same client/city resolution logic (lesson's own
  // client_name, then its recurring_schedule row's client_name, then the
  // legacy city map).
  const { data: lessons } = await admin
    .from("lessons")
    .select(
      `id, lesson_date, start_time, status, recurring_item_id, client_name,
       location:locations!lessons_location_id_fkey(city)`
    )
    .gte("lesson_date", monthStart)
    .lte("lesson_date", monthEnd)
    .order("lesson_date")
    .order("start_time");

  const allLessons = lessons ?? [];

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
      client_name: clientName,
      city,
    };
  });

  const clientNames = [...new Set(flatLessons.map((l) => l.client_name))];

  const { data: rates } = await admin
    .from("client_payment_rates")
    .select("client_name, city, billing_mode, rate_per_lesson, fixed_monthly_amount")
    .in("client_name", clientNames.length > 0 ? clientNames : ["__none__"]);

  const lessonIds = flatLessons.map((l) => l.id);
  const { data: exceptions } = await admin
    .from("client_payment_exceptions")
    .select("lesson_id, client_name, amount, notes")
    .in("lesson_id", lessonIds.length > 0 ? lessonIds : ["__none__"]);

  const { data: adjustments } = await admin
    .from("client_payment_adjustments")
    .select("id, client_name, year, month, label, amount")
    .eq("year", selectedMonth.getFullYear())
    .eq("month", selectedMonth.getMonth() + 1)
    .in("client_name", clientNames.length > 0 ? clientNames : ["__none__"]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          תשלום לקוחות
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          עמוד זה גלוי רק עבורך ואינו מוצג למנהלים אחרים
        </p>
      </div>

      <MonthNavigator
        basePath="/client-payments"
        selectedMonthStr={selectedMonthStr}
        currentMonthStr={currentMonthStr}
      />

      <ClientPaymentsView
        lessons={flatLessons}
        rates={rates ?? []}
        exceptions={exceptions ?? []}
        adjustments={adjustments ?? []}
        year={selectedMonth.getFullYear()}
        month={selectedMonth.getMonth() + 1}
      />
    </div>
  );
}
