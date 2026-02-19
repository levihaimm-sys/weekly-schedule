import { getAllTasks, getAdminProfiles } from "@/lib/queries/tasks";
import { TaskManager } from "@/components/tasks/task-manager";

export default async function TasksPage() {
  const [tasks, admins] = await Promise.all([
    getAllTasks(),
    getAdminProfiles(),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl text-[#1C1917]">משימות</h1>
      <TaskManager tasks={tasks} admins={admins} />
    </div>
  );
}
