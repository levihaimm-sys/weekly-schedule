import { getWeekLessons, getRecurringSchedule, getAllInstructors, getAllCities } from "@/lib/queries/schedule";
import { format, addDays, startOfWeek } from "date-fns";
import { WeekNavigator } from "@/components/schedule/week-navigator";
import { WeeklyOverviewGrid } from "@/components/schedule/weekly-overview-grid";

export const dynamic = "force-dynamic";

export default async function WeeklyOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; city?: string; instructor?: string; changes?: string; view?: string }>;
}) {
  const params = await searchParams;

  const baseDate = params.week ? new Date(params.week) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 4);
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const selectedCities = params.city ? params.city.split(",") : [];
  const selectedInstructors = params.instructor ? params.instructor.split(",") : [];
  const changesOnly = params.changes === "1";
  const isFixedView = params.view === "fixed";

  const weekDates = Array.from({ length: 5 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd")
  );

  const [instructors, cities] = await Promise.all([
    getAllInstructors(),
    getAllCities(),
  ]);

  const byDay: Record<string, any[]> = {};
  for (const dateStr of weekDates) {
    byDay[dateStr] = [];
  }

  let totalCount = 0;

  if (isFixedView) {
    // Show the fixed (recurring) schedule for this week — no one-time changes
    const recurringItems = await getRecurringSchedule({
      instructorIds: selectedInstructors.length > 0 ? selectedInstructors : undefined,
      cities: selectedCities.length > 0 ? selectedCities : undefined,
    });

    for (const item of recurringItems) {
      const dateStr = format(addDays(weekStart, item.day_of_week), "yyyy-MM-dd");
      if (byDay[dateStr]) {
        byDay[dateStr].push({
          id: item.id,
          lesson_date: dateStr,
          start_time: item.start_time,
          status: "scheduled",
          instructor_absence_request: false,
          instructor: item.instructor,
          location: item.location,
        });
      }
    }
    totalCount = recurringItems.length;
  } else {
    const filters = {
      instructorIds: selectedInstructors.length > 0 ? selectedInstructors : undefined,
      cities: selectedCities.length > 0 ? selectedCities : undefined,
      changesOnly,
    };

    const lessons = await getWeekLessons(weekStartStr, weekEndStr, filters);
    for (const lesson of lessons) {
      if (byDay[lesson.lesson_date]) {
        byDay[lesson.lesson_date].push(lesson);
      }
    }
    totalCount = lessons.length;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#1C1917]">תצוגת פלאפון שבועית</h2>
      <WeekNavigator
        weekStartStr={weekStartStr}
        weekEndStr={weekEndStr}
        basePath="/schedule/weekly-overview"
      />

      <WeeklyOverviewGrid
        weekDates={weekDates}
        lessonsByDay={byDay as any}
        instructors={instructors}
        cities={cities}
        currentFilters={{ cities: selectedCities, instructors: selectedInstructors, changesOnly }}
        isFixedView={isFixedView}
      />

      <p className="text-sm text-muted-foreground">
        סה&quot;כ {totalCount} שיעורים
        {isFixedView && " (לוז קבוע)"}
      </p>
    </div>
  );
}
