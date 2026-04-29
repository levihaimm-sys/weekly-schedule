import { createAdminClient } from "@/lib/supabase/admin";
import { ConfirmationsView } from "@/components/dashboard/confirmations-view";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { CITY_TO_CLIENT, CLIENTS } from "@/lib/utils/constants";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

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
      `id, lesson_date, start_time, status, instructor_id,
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

  // Flatten lessons, add client name via city mapping
  const flatLessons = allLessons.map((l) => {
    const city = (l.location as any)?.city ?? "";
    return {
      id: l.id,
      lesson_date: l.lesson_date,
      start_time: l.start_time,
      status: l.status,
      instructor_id: l.instructor_id,
      instructor_name: (l.instructor as any)?.full_name ?? "לא ידוע",
      location_name: (l.location as any)?.name ?? "",
      location_city: city,
      client_name: (CITY_TO_CLIENT as Record<string, string>)[city] ?? "אחר",
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
      />
    </div>
  );
}
