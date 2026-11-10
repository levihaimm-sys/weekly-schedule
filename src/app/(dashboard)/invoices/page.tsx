import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { InvoicesView } from "@/components/invoices/invoices-view";
import { resolveLessonClient } from "@/lib/utils/client-name";
import { MonthNavigator } from "@/components/ui/month-navigator";

export const dynamic = "force-dynamic";

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

export default async function InvoicesPage({
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
  const selectedYear = selectedMonth.getFullYear();
  const selectedMonthNum = selectedMonth.getMonth() + 1;

  const admin = createAdminClient();

  // Load invoice groups (clients that have splits configured)
  const { data: groups } = await admin
    .from("client_invoice_groups")
    .select("*")
    .order("client_name")
    .order("sort_order");

  const allGroups = groups ?? [];
  if (allGroups.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">חשבוניות</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            מעקב הפקת חשבוניות ללקוחות
          </p>
        </div>
        <MonthNavigator
          basePath="/invoices"
          selectedMonthStr={selectedMonthStr}
          currentMonthStr={currentMonthStr}
        />
        <InvoicesView clients={[]} year={selectedYear} month={selectedMonthNum} />
      </div>
    );
  }

  // Unique client names that have invoice groups
  const clientNames = [...new Set(allGroups.map((g) => g.client_name))];

  // Load all lessons for the month
  const { data: lessons } = await admin
    .from("lessons")
    .select(
      `id, lesson_date, start_time, status, recurring_item_id, client_name,
       location:locations!lessons_location_id_fkey(name, city)`
    )
    .gte("lesson_date", monthStart)
    .lte("lesson_date", monthEnd)
    .order("lesson_date");

  const allLessons = lessons ?? [];

  // Resolve client names via recurring_schedule
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

  // Load rates for these clients
  const { data: rates } = await admin
    .from("client_payment_rates")
    .select("client_name, city, billing_mode, rate_per_lesson, fixed_monthly_amount")
    .in("client_name", clientNames);

  const rateMap = new Map<string, { billing_mode: string; rate_per_lesson: number; fixed_monthly_amount: number }>();
  for (const r of rates ?? []) {
    rateMap.set(`${r.client_name}__${r.city}`, r);
  }

  // Load existing invoice records for this month
  const groupIds = allGroups.map((g) => g.id);
  const { data: invoices } = await admin
    .from("client_invoices")
    .select("*")
    .eq("year", selectedYear)
    .eq("month", selectedMonthNum)
    .in("group_id", groupIds);

  // Build per-client data
  const clientsData = clientNames.map((clientName) => {
    const clientGroups = allGroups.filter((g) => g.client_name === clientName);
    const clientInvoices = (invoices ?? []).filter(
      (inv) => clientGroups.some((g) => g.id === inv.group_id)
    );

    // Filter lessons for this client
    const clientLessons = allLessons.filter((l) => {
      const city = (l.location as any)?.city ?? "";
      const resolved =
        resolveLessonClient(l.client_name, l.recurring_item_id, recurringClientMap) ??
        CITY_TO_CLIENT[city] ??
        null;
      return resolved === clientName;
    });

    // Aggregate by location name
    const locMap = new Map<string, {
      location_name: string;
      city: string;
      lesson_count: number;
      cancelled_count: number;
    }>();

    for (const l of clientLessons) {
      const locName = (l.location as any)?.name ?? "לא ידוע";
      const city = (l.location as any)?.city ?? "";
      if (!locMap.has(locName)) {
        locMap.set(locName, { location_name: locName, city, lesson_count: 0, cancelled_count: 0 });
      }
      const entry = locMap.get(locName)!;
      if (l.status === "cancelled") {
        entry.cancelled_count++;
      } else {
        entry.lesson_count++;
      }
    }

    const locationLessons = [...locMap.values()].map((loc) => {
      const rate = rateMap.get(`${clientName}__${loc.city}`);
      return {
        ...loc,
        rate_per_lesson: rate?.rate_per_lesson ?? 0,
        billing_mode: (rate?.billing_mode ?? "per_lesson") as "per_lesson" | "fixed_monthly",
        fixed_monthly_amount: rate?.fixed_monthly_amount ?? 0,
      };
    });

    return {
      client_name: clientName,
      groups: clientGroups,
      invoices: clientInvoices,
      locationLessons,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">חשבוניות</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          מעקב הפקת חשבוניות ללקוחות
        </p>
      </div>

      <MonthNavigator
        basePath="/invoices"
        selectedMonthStr={selectedMonthStr}
        currentMonthStr={currentMonthStr}
      />

      <InvoicesView
        clients={clientsData}
        year={selectedYear}
        month={selectedMonthNum}
      />
    </div>
  );
}
