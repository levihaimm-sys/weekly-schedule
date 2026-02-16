import {
  getLessonsByDate,
} from "@/lib/queries/dashboard";
import { getAllInstructors, getRecentChanges } from "@/lib/queries/schedule";
import { ensureFutureWeeks } from "@/lib/actions/schedule";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { DayLessonsViewer } from "@/components/dashboard/day-lessons-viewer";
import { RecentChangesList } from "@/components/dashboard/recent-changes-list";
import { startOfWeek, addDays, format } from "date-fns";

export default async function DashboardPage() {
  // Auto-replicate 2 months ahead on dashboard load (skip revalidate during render)
  await ensureFutureWeeks(8, true);

  // Build current week dates
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const today = format(now, "yyyy-MM-dd");
  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: format(d, "yyyy-MM-dd"),
      dayName: DAYS_SHORT[i] as string,
      displayDate: format(d, "dd/MM"),
    };
  });

  // Fetch all data in parallel
  const [instructors, recentChanges, ...dayLessonsResults] =
    await Promise.all([
      getAllInstructors(),
      getRecentChanges(),
      ...weekDates.map((d) => getLessonsByDate(d.date)),
    ]);

  // Build lessons-by-date map
  const lessonsByDate: Record<string, any[]> = {};
  weekDates.forEach((d, i) => {
    lessonsByDate[d.date] = dayLessonsResults[i] as any[];
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold md:text-2xl">לוח בקרה</h2>

      {/* Changes Section */}
      <RecentChangesList changes={recentChanges as any} instructors={instructors} />

      {/* Day Picker + Lessons */}
      <DayLessonsViewer
        weekDates={weekDates}
        lessonsByDate={lessonsByDate}
        instructors={instructors}
        initialDate={today}
      />
    </div>
  );
}
