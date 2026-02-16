import { getRecurringSchedule, getAllCities, getAllInstructors } from "@/lib/queries/schedule";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; instructor?: string; day?: string }>;
}) {
  const params = await searchParams;

  const [schedule, cities, instructors] = await Promise.all([
    getRecurringSchedule({
      city: params.city,
      instructorId: params.instructor,
      dayOfWeek: params.day ? parseInt(params.day) : undefined,
    }),
    getAllCities(),
    getAllInstructors(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold md:text-2xl">לוח זמנים קבוע</h2>
      </div>

      <ScheduleGrid
        schedule={schedule as any[]}
        cities={cities}
        instructors={instructors}
        currentFilters={params}
      />
    </div>
  );
}
