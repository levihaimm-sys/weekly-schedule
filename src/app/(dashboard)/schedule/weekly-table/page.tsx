import { getRecurringSchedule, getAllInstructors } from "@/lib/queries/schedule";
import { WeeklyScheduleTable } from "@/components/schedule/weekly-schedule-table";
import type { RecurringScheduleWithDetails } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function WeeklyScheduleTablePage() {
  const [schedule, instructors] = await Promise.all([getRecurringSchedule(), getAllInstructors()]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">לוח שבועי טבלה</h2>
      <WeeklyScheduleTable schedule={schedule as RecurringScheduleWithDetails[]} instructors={instructors} />
    </div>
  );
}
