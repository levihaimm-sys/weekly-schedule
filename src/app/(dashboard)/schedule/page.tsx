import { getRecurringSchedule, getAllCities, getAllInstructors } from "@/lib/queries/schedule";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; instructor?: string; day?: string }>;
}) {
  const params = await searchParams;

  const selectedCities = params.city ? params.city.split(",") : [];
  const selectedInstructors = params.instructor ? params.instructor.split(",") : [];

  const [schedule, cities, instructors] = await Promise.all([
    getRecurringSchedule({
      dayOfWeek: params.day ? parseInt(params.day) : undefined,
    }),
    getAllCities(),
    getAllInstructors(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">לוח קבוע</h2>
        <Link
          href="/schedule/import-recurring"
          className="rounded-lg border border-border bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 md:px-4 md:py-2 md:text-sm"
        >
          ייבוא שיעורים
        </Link>
      </div>

      <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4 text-center">
        <p className="font-bold text-orange-800">כל שינוי כאן נשמר באופן קבוע בלוז</p>
      </div>

      <ScheduleGrid
        schedule={schedule as any[]}
        cities={cities}
        instructors={instructors}
        currentFilters={{ cities: selectedCities, instructors: selectedInstructors, day: params.day }}
      />
    </div>
  );
}
