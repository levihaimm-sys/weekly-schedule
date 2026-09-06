import { getWeekLessons, getAllInstructors } from "@/lib/queries/schedule";
import { ensureFutureWeeks } from "@/lib/actions/schedule";
import { format, addDays, startOfWeek } from "date-fns";
import { WeekNavigator } from "@/components/schedule/week-navigator";
import { WeeklyScheduleTable } from "@/components/schedule/weekly-schedule-table";

export const dynamic = "force-dynamic";

export default async function WeeklyScheduleTablePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;

  // Create missing weeks and sync in background (non-blocking) — same as /schedule/weekly
  ensureFutureWeeks(8, true);

  const baseDate = params.week ? new Date(params.week) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 4); // Thursday
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const [lessons, instructors] = await Promise.all([
    getWeekLessons(weekStartStr, weekEndStr),
    getAllInstructors(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">לוח שבועי טבלה</h2>
        <WeekNavigator weekStartStr={weekStartStr} weekEndStr={weekEndStr} basePath="/schedule/weekly-table" />
      </div>
      <WeeklyScheduleTable lessons={lessons as any[]} instructors={instructors} />
    </div>
  );
}
