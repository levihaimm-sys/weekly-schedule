import { getAllTasks, getAdminProfiles } from "@/lib/queries/tasks";
import { getUpcomingUnassignedLessons, getUpcomingScheduleChanges } from "@/lib/queries/dashboard";
import { getAllInstructors } from "@/lib/queries/schedule";
import { TaskManager } from "@/components/tasks/task-manager";
import { UnassignedLessonsCard } from "@/components/dashboard/unassigned-lessons-card";
import { ScheduleChangesCard } from "@/components/dashboard/schedule-changes-card";

export default async function DashboardPage() {
  const [tasks, admins, unassigned, scheduleChanges, instructors] = await Promise.all([
    getAllTasks(),
    getAdminProfiles(),
    getUpcomingUnassignedLessons(),
    getUpcomingScheduleChanges(),
    getAllInstructors(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">דשבורד</h2>
      <TaskManager tasks={tasks} admins={admins} />

      <UnassignedLessonsCard lessons={unassigned} instructors={instructors} />
      <ScheduleChangesCard changes={scheduleChanges} instructors={instructors} />
    </div>
  );
}
