import { createClient } from "@/lib/supabase/server";
import { DAYS_HEBREW } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/date";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { MonthNavigator } from "@/components/instructor/month-navigator";

export const dynamic = "force-dynamic";

export default async function MonthlySchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("instructor_id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.instructor_id) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        לא נמצא פרופיל מדריך מקושר
      </div>
    );
  }

  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const monthStartStr = format(monthStart, "yyyy-MM-dd");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      location:locations!lessons_location_id_fkey(name, city, street)
    `
    )
    .eq("instructor_id", profile.instructor_id)
    .gte("lesson_date", monthStartStr)
    .lte("lesson_date", monthEndStr)
    .neq("status", "cancelled")
    .order("lesson_date")
    .order("start_time");

  const totalLessons = lessons?.length ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-[#1C1917]">
          תצוגה חודשית - {profile.display_name}
        </h2>
      </div>

      <MonthNavigator year={year} month={month} />

      <div className="rounded-2xl bg-card px-5 py-4 shadow-sm">
        <span className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground text-lg">{totalLessons}</span>{" "}
          שיעורים בחודש
        </span>
      </div>

      {totalLessons === 0 ? (
        <div className="rounded-2xl bg-card/50 p-8 text-center shadow-sm">
          <p className="text-base font-medium text-muted-foreground">
            אין שיעורים בחודש זה
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-right font-semibold text-foreground/70">
                  תאריך
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/70">
                  יום
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/70">
                  שעה
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/70">
                  שם הגן
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/70">
                  עיר
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/70">
                  כתובת
                </th>
              </tr>
            </thead>
            <tbody>
              {(lessons ?? []).map((lesson: any, idx: number) => {
                const date = new Date(lesson.lesson_date + "T00:00:00");
                const dayOfWeek = date.getDay();
                const dateDisplay = format(date, "dd/MM/yyyy");

                return (
                  <tr
                    key={lesson.id}
                    className={`border-b border-border/50 ${
                      idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{dateDisplay}</td>
                    <td className="px-4 py-3">{DAYS_HEBREW[dayOfWeek]}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatTime(lesson.start_time)}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {lesson.location?.name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {lesson.location?.city ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {lesson.location?.street ?? "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
