import { createAdminClient } from "@/lib/supabase/admin";
import { ConfirmationsView } from "@/components/dashboard/confirmations-view";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { resolveLessonClient } from "@/lib/utils/client-name";

import Link from "next/link";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

// Legacy fallback for old/orphan lessons that have no client_name on the lesson
// itself and no recurring_schedule link to pull one from.
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

export default async function ConfirmationsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
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

  const supabase = createAdminClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `id, lesson_date, start_time, status, instructor_id, recurring_item_id, client_name,
       instructor:instructors!lessons_instructor_id_fkey(full_name),
       location:locations!lessons_location_id_fkey(name, city)`
    )
    .gte("lesson_date", monthStart)
    .lte("lesson_date", monthEnd)
    .order("lesson_date")
    .order("start_time");

  const allLessons = lessons ?? [];

  // Fetch signatures separately
  const lessonIds = allLessons.map((l) => l.id);
  const sigMap: Record<string, { signer_name: string; signer_role: string }> = {};
  if (lessonIds.length > 0) {
    const { data: signatures } = await supabase
      .from("signatures")
      .select("lesson_id, signer_name, signer_role")
      .in("lesson_id", lessonIds);
    for (const sig of signatures ?? []) {
      sigMap[sig.lesson_id] = {
        signer_name: sig.signer_name,
        signer_role: sig.signer_role,
      };
    }
  }

  // Client name per recurring_schedule row (the source of truth for lessons
  // generated from the weekly/fixed schedule, same as the reports page uses).
  const recurringIds = [
    ...new Set(allLessons.map((l) => l.recurring_item_id).filter(Boolean)),
  ] as string[];
  const recurringClientMap = new Map<string, string>();
  if (recurringIds.length > 0) {
    const { data: recurringRows } = await supabase
      .from("recurring_schedule")
      .select("id, client_name")
      .in("id", recurringIds);
    for (const row of recurringRows ?? []) {
      if (row.client_name) recurringClientMap.set(row.id, row.client_name);
    }
  }

  // Flatten lessons, resolving the real client name: the lesson's own
  // client_name (one-off lessons), then the linked recurring_schedule row's
  // client_name (weekly/fixed schedule lessons), then the legacy city map.
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
      instructor_id: l.instructor_id,
      instructor_name: (l.instructor as any)?.full_name ?? "לא ידוע",
      location_name: (l.location as any)?.name ?? "",
      location_city: city,
      client_name: clientName,
    };
  });

  // Unique instructors for filter
  const instructorMap = new Map<string, string>();
  for (const l of flatLessons) {
    if (!instructorMap.has(l.instructor_id)) {
      instructorMap.set(l.instructor_id, l.instructor_name);
    }
  }
  const instructors = [...instructorMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));

  // Clients that actually appear in this month's data
  const clientsInData = [
    ...new Set(flatLessons.map((l) => l.client_name)),
  ].sort((a, b) => a.localeCompare(b, "he"));

  // Reverse map: client -> cities (for linking to weekly schedule)
  const clientToCities: Record<string, string[]> = {};
  for (const l of flatLessons) {
    if (!l.location_city) continue;
    if (!clientToCities[l.client_name]) clientToCities[l.client_name] = [];
    if (!clientToCities[l.client_name].includes(l.location_city)) {
      clientToCities[l.client_name].push(l.location_city);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
        מעקב אישורים
      </h2>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-orange-500 shrink-0" />
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Link
            href={`/confirmations?month=${prevMonthStr}`}
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronRight size={16} />
          </Link>
          <Link
            href={`/confirmations?month=${currentMonthStr}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedMonthStr === currentMonthStr
                ? "bg-secondary text-[#1C1917]"
                : "hover:bg-muted"
            }`}
          >
            חודש נוכחי
          </Link>
          <Link
            href={`/confirmations?month=${nextMonthStr}`}
            className="flex items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronLeft size={16} />
          </Link>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {monthLabel}
        </span>
      </div>

      <ConfirmationsView
        lessons={flatLessons}
        sigMap={sigMap}
        instructors={instructors}
        clients={clientsInData}
        clientToCities={clientToCities}
      />
    </div>
  );
}
