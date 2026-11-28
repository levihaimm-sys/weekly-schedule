import { getAllTasks, getAdminProfiles } from "@/lib/queries/tasks";
import { getUpcomingUnassignedLessons, getUpcomingScheduleChanges, getInstructorRequests } from "@/lib/queries/dashboard";
import { getAllInstructors } from "@/lib/queries/schedule";
import { getClientMonthlyStats } from "@/lib/queries/client-monthly-stats";
import { TaskManager } from "@/components/tasks/task-manager";
import { UrgentAlertsCard } from "@/components/dashboard/unassigned-lessons-card";
import { ScheduleChangesCard } from "@/components/dashboard/schedule-changes-card";
import { ClientMonthlyStatsCard } from "@/components/dashboard/client-monthly-stats-card";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { ListTodo } from "lucide-react";

// "2026-10" → { year: 2026, month: 10 }; defaults to the current month (Israel time)
function parseStatsMonth(value: string | undefined) {
  const match = value?.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year: Number(match[1]), month };
  }
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ statsMonth?: string }>;
}) {
  const { year: statsYear, month: statsMonth } = parseStatsMonth((await searchParams).statsMonth);

  const prevStats = new Date(statsYear, statsMonth - 2, 1);

  const [tasks, admins, unassigned, absenceRequests, scheduleChanges, instructors, clientStats, prevClientStats] = await Promise.all([
    getAllTasks(),
    getAdminProfiles(),
    getUpcomingUnassignedLessons(),
    getInstructorRequests(),
    getUpcomingScheduleChanges(),
    getAllInstructors(),
    getClientMonthlyStats(statsYear, statsMonth),
    getClientMonthlyStats(prevStats.getFullYear(), prevStats.getMonth() + 1),
  ]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">דשבורד</h2>
      <CollapsibleSection id="tasks" title="משימות" icon={<ListTodo size={18} />} tone="blue">
        <div className="p-4">
          <TaskManager tasks={tasks} admins={admins} />
        </div>
      </CollapsibleSection>
      <ClientMonthlyStatsCard stats={clientStats} prevStats={prevClientStats} year={statsYear} month={statsMonth} />

      <UrgentAlertsCard lessons={unassigned as any} absenceRequests={absenceRequests as any} instructors={instructors} />
      <ScheduleChangesCard changes={scheduleChanges as any} instructors={instructors} />
    </div>
  );
}
