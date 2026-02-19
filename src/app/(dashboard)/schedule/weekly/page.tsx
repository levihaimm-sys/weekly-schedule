import { getWeekLessons, getAllInstructors, getAllCities } from "@/lib/queries/schedule";
import { ensureFutureWeeks } from "@/lib/actions/schedule";
import { format, addDays, startOfWeek } from "date-fns";
import { WeekNavigator } from "@/components/schedule/week-navigator";
import { WeeklyGrid } from "@/components/schedule/weekly-grid";
import Link from "next/link";

export default async function WeeklySchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; city?: string; instructor?: string }>;
}) {
  const params = await searchParams;

  // Auto-replicate 2 months ahead (skip revalidate during render)
  await ensureFutureWeeks(8, true);

  // Parse week from query or use current week
  const baseDate = params.week ? new Date(params.week) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 4); // Thursday
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const selectedCities = params.city ? params.city.split(",") : [];
  const selectedInstructors = params.instructor ? params.instructor.split(",") : [];

  const filters = {
    instructorIds: selectedInstructors.length > 0 ? selectedInstructors : undefined,
    cities: selectedCities.length > 0 ? selectedCities : undefined,
  };

  const [lessons, instructors, cities] = await Promise.all([
    getWeekLessons(weekStartStr, weekEndStr, filters),
    getAllInstructors(),
    getAllCities(),
  ]);

  // Build 5-day grid (Sun-Thu)
  const weekDates = Array.from({ length: 5 }, (_, i) =>
    format(addDays(weekStart, i), "yyyy-MM-dd")
  );
  const byDay: Record<string, typeof lessons> = {};
  for (const dateStr of weekDates) {
    byDay[dateStr] = [];
  }
  for (const lesson of lessons) {
    if (byDay[lesson.lesson_date]) {
      byDay[lesson.lesson_date].push(lesson);
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">לוח שבועי</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/schedule"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted md:px-4 md:py-2 md:text-sm"
            >
              לוח קבוע
            </Link>
          </div>
        </div>
        <WeekNavigator
          weekStartStr={weekStartStr}
          weekEndStr={weekEndStr}
          basePath="/schedule/weekly"
        />
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            אין שיעורים לשבוע הזה
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            השיעורים נוצרים אוטומטית מהלוח הקבוע
          </p>
        </div>
      ) : (
        <WeeklyGrid
          weekDates={weekDates}
          lessonsByDay={byDay as any}
          instructors={instructors}
          cities={cities}
          currentFilters={{ cities: selectedCities, instructors: selectedInstructors }}
        />
      )}

      <p className="text-sm text-muted-foreground">
        סה&quot;כ {lessons.length} שיעורים השבוע
      </p>
    </div>
  );
}
