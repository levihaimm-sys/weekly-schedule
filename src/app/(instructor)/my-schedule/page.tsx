import { createClient } from "@/lib/supabase/server";
import { DAYS_HEBREW, DAYS_SHORT, LESSON_STATUS, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { formatTime, formatDateShort, getTodayInIsrael, getNowInIsrael } from "@/lib/utils/date";
import { MapPin, Clock } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { WeekNavigator } from "@/components/schedule/week-navigator";
import { redirect } from "next/navigation";

export default async function MySchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get instructor profile
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

  // Calculate week boundaries
  const baseDate = params.week ? new Date(params.week) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 5);
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");
  
  const today = getTodayInIsrael();
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay();

  // Check if current week
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const isCurrentWeek = format(currentWeekStart, "yyyy-MM-dd") === weekStartStr;

  // Get lessons for this week
  const { data: weekLessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      change_notes,
      instructor_absence_request,
      instructor_request_type,
      instructor_notes,
      location:locations!lessons_location_id_fkey(id, name, city, street, age_group)
    `
    )
    .eq("instructor_id", profile.instructor_id)
    .gte("lesson_date", weekStartStr)
    .lte("lesson_date", weekEndStr)
    .order("lesson_date")
    .order("start_time");

  // Fetch signatures for this week's lessons
  const lessonIds = (weekLessons ?? []).map((l) => l.id);
  const sigMap: Record<string, { signer_name: string; signer_role: string; signature_url: string | null }> = {};
  if (lessonIds.length > 0) {
    const { data: signatures } = await supabase
      .from("signatures")
      .select("lesson_id, signer_name, signer_role, signature_url")
      .in("lesson_id", lessonIds);
    for (const sig of signatures ?? []) {
      sigMap[sig.lesson_id] = {
        signer_name: sig.signer_name,
        signer_role: sig.signer_role,
        signature_url: sig.signature_url,
      };
    }
  }

  // Build days
  const weekDates = Array.from({ length: 6 }, (_, i) => ({
    date: format(addDays(weekStart, i), "yyyy-MM-dd"),
    dayName: DAYS_SHORT[i],
    displayDate: format(addDays(weekStart, i), "dd/MM"),
  }));

  const byDay: Record<string, any[]> = {};
  for (const d of weekDates) byDay[d.date] = [];
  for (const lesson of weekLessons ?? []) {
    if (byDay[lesson.lesson_date]) byDay[lesson.lesson_date].push(lesson);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">שלום, {profile.display_name}</h2>
        {isCurrentWeek && (
          <p className="text-sm text-muted-foreground">
            {DAYS_HEBREW[dayOfWeek]} | {formatDateShort(new Date())}
          </p>
        )}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <WeekNavigator
          weekStartStr={weekStartStr}
          weekEndStr={weekEndStr}
          basePath="/my-schedule"
        />
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-5">
        {weekDates.map(({ date, dayName, displayDate }, index) => {
          const dayLessons = byDay[date] ?? [];
          const isToday = date === today;

          // Uniform pastel background for all days
          const dayBg = "bg-accent";

          return (
            <div key={date} className="space-y-3">
              {/* Day header - BOLD and COLORFUL */}
              <div
                className={`flex items-center gap-3 rounded-2xl px-5 py-4 shadow-sm ${dayBg} ${
                  isToday ? "ring-2 ring-foreground ring-offset-2" : ""
                }`}
              >
                <span className="text-2xl font-bold text-foreground">
                  {dayName}
                </span>
                <span className="text-base font-semibold text-foreground/70">
                  {displayDate}
                </span>
                {isToday && (
                  <span className="rounded-2xl bg-foreground px-3 py-1.5 text-xs font-bold text-background">
                    היום
                  </span>
                )}
                {dayLessons.length > 0 && (
                  <span className="rounded-full bg-white/40 px-3 py-1 text-sm font-bold text-foreground">
                    {dayLessons.length}
                  </span>
                )}
              </div>

              {dayLessons.length === 0 ? (
                <div className="rounded-2xl bg-card/50 p-6 text-center shadow-sm">
                  <p className="text-base font-medium text-muted-foreground">אין שיעורים</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayLessons.map((lesson: any) => {
                    const hasRequest = lesson.instructor_absence_request;
                    const requestType = lesson.instructor_request_type as
                      | keyof typeof INSTRUCTOR_REQUEST_TYPES
                      | null;
                    const isConfirmed = !!sigMap[lesson.id];

                    return (
                      <div key={lesson.id} className="space-y-3">
                        {/* Lesson card - compact version */}
                        <div
                          className={`rounded-2xl bg-card p-5 shadow-sm ${
                            isConfirmed
                              ? "ring-2 ring-success ring-offset-1"
                              : hasRequest
                                ? "ring-2 ring-warning ring-offset-1"
                                : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock size={18} className="text-foreground/70" />
                                <span className="text-2xl font-bold text-foreground">
                                  {formatTime(lesson.start_time)}
                                </span>
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {lesson.location?.name}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-foreground/70">
                                <MapPin size={14} />
                                <span>
                                  {lesson.location?.city}
                                  {lesson.location?.street
                                    ? `, ${lesson.location.street}`
                                    : ""}
                                </span>
                              </div>
                              {lesson.location?.age_group && (
                                <span className="inline-block rounded-xl bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                                  גיל {lesson.location.age_group}
                                </span>
                              )}
                            </div>
                            <span
                              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${
                                isConfirmed
                                  ? "bg-success/20 text-success"
                                  : lesson.status === "completed"
                                    ? "bg-success/20 text-success"
                                    : lesson.status === "cancelled"
                                      ? "bg-destructive/20 text-destructive"
                                      : "bg-primary/20 text-primary"
                              }`}
                            >
                              {isConfirmed
                                ? "✓ אושר"
                                : (LESSON_STATUS[
                                    lesson.status as keyof typeof LESSON_STATUS
                                  ] ?? lesson.status)}
                            </span>
                          </div>

                          {lesson.change_notes && (
                            <div className="mt-3 rounded-xl bg-warning/10 px-3 py-2">
                              <p className="text-sm font-semibold text-foreground">
                                ⚠️ {lesson.change_notes}
                              </p>
                            </div>
                          )}

                          {hasRequest && (
                            <div className="mt-3 rounded-xl bg-warning/10 px-3 py-2">
                              <span className="text-sm font-bold text-foreground">
                                📢 {requestType
                                  ? INSTRUCTOR_REQUEST_TYPES[requestType]
                                  : "בקשה"}{" "}
                                נשלחה
                              </span>
                              {lesson.instructor_notes && (
                                <span className="text-sm font-medium text-foreground/80">
                                  {" "}- {lesson.instructor_notes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
