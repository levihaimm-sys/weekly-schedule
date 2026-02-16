import { createClient } from "@/lib/supabase/server";
import { DAYS_HEBREW, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/date";
import { MapPin, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { redirect } from "next/navigation";
import { LessonConfirmButtons } from "@/components/schedule/lesson-confirm-buttons";
import { InstructorReportButton } from "@/components/schedule/instructor-report-button";
import { MonthSelector } from "@/components/schedule/month-selector";
import { ConfirmLessonsFilters } from "@/components/schedule/confirm-lessons-filters";

const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export default async function ConfirmLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; garden?: string; city?: string; date?: string }>;
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

  // Determine which month to show
  const now = new Date();
  const selectedMonth = params.month
    ? new Date(params.month + "-01")
    : now;
  const monthStart = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
  const monthLabel = `${MONTHS_HEBREW[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;
  const currentMonthStr = format(now, "yyyy-MM");
  const prevMonthStr = format(subMonths(now, 1), "yyyy-MM");

  // Build query for lessons
  let query = supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      instructor_absence_request,
      instructor_request_type,
      instructor_notes,
      location:locations!lessons_location_id_fkey(id, name, city, street)
    `
    )
    .eq("instructor_id", profile.instructor_id);

  // Apply date filters
  if (params.date) {
    // Specific date
    query = query.eq("lesson_date", params.date);
  } else {
    // Month range
    query = query.gte("lesson_date", monthStart).lte("lesson_date", monthEnd);
  }

  query = query.order("lesson_date").order("start_time");

  const { data: lessons } = await query;

  // Fetch signatures
  const lessonIds = (lessons ?? []).map((l) => l.id);
  const sigMap: Record<
    string,
    { signer_name: string; signer_role: string; signature_url: string | null }
  > = {};
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

  // Apply client-side filters (for location data)
  let filteredLessons = lessons ?? [];
  
  if (params.garden) {
    filteredLessons = filteredLessons.filter((l: any) =>
      l.location?.name?.toLowerCase().includes(params.garden!.toLowerCase())
    );
  }
  
  if (params.city) {
    filteredLessons = filteredLessons.filter((l: any) =>
      l.location?.city?.toLowerCase().includes(params.city!.toLowerCase())
    );
  }

  const allLessons = filteredLessons;
  const confirmedCount = allLessons.filter((l) => sigMap[l.id]).length;
  const scheduledCount = allLessons.filter(
    (l) => l.status === "scheduled" || l.status === "completed"
  ).length;

  // Get unique cities and gardens for filter options
  const allLessonsData = lessons ?? [];
  const uniqueCities = Array.from(
    new Set(allLessonsData.map((l: any) => l.location?.city).filter(Boolean))
  ).sort();
  const uniqueGardens = Array.from(
    new Set(allLessonsData.map((l: any) => l.location?.name).filter(Boolean))
  ).sort();

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-foreground print:text-3xl">
        דיווחים - {profile.display_name}
      </h2>

      {/* Month selector */}
      <MonthSelector
        currentMonthStr={currentMonthStr}
        prevMonthStr={prevMonthStr}
        selectedMonth={params.month ?? currentMonthStr}
        monthLabel={monthLabel}
      />

      {/* Filters */}
      <ConfirmLessonsFilters
        cities={uniqueCities as string[]}
        gardens={uniqueGardens as string[]}
        currentFilters={{
          garden: params.garden,
          city: params.city,
          date: params.date,
        }}
      />

      {/* Summary - COMPACT */}
      <div className="flex items-center gap-3 rounded-2xl bg-success/10 px-5 py-3 shadow-sm">
        <CheckCircle size={20} className="text-success" />
        <span className="font-bold text-base text-foreground">
          {confirmedCount} מאושרים מתוך {scheduledCount} שיעורים
        </span>
      </div>

      {/* Lessons list - COMPACT spacing */}
      <div className="space-y-2">
        {allLessons.length === 0 ? (
          <div className="rounded-2xl bg-card p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-muted-foreground">אין שיעורים בחודש זה</p>
          </div>
        ) : (
          allLessons.map((lesson: any) => {
            const isConfirmed = !!sigMap[lesson.id];
            const lessonDate = new Date(lesson.lesson_date);
            const dayName = DAYS_HEBREW[lessonDate.getDay()];
            const dateStr = format(lessonDate, "dd/MM");

            // Calculate if lesson has started + 10 minutes
            const now = new Date();
            const lessonDateTime = new Date(`${lesson.lesson_date}T${lesson.start_time}`);
            const tenMinutesAfterStart = new Date(lessonDateTime.getTime() + 10 * 60 * 1000);
            const hasStartedPlus10 = now >= tenMinutesAfterStart;
            const isFutureLesson = !hasStartedPlus10 && !isConfirmed && lesson.status !== "cancelled" && !lesson.instructor_absence_request;

            return (
              <div key={lesson.id}>
                <div
                  className={`rounded-2xl p-4 shadow-sm ${
                    isConfirmed
                      ? "bg-success/10"
                      : lesson.status === "cancelled"
                        ? "bg-destructive/10"
                        : lesson.instructor_absence_request
                          ? "bg-orange-50"
                          : "bg-card"
                  }`}
                >
                  {/* Top row: lesson info + status badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-foreground">
                          {dayName} {dateStr}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-foreground/70">
                          <Clock size={12} />
                          {formatTime(lesson.start_time)}
                        </span>
                      </div>
                      <p className="font-semibold text-base text-foreground truncate">{lesson.location?.name}</p>
                      <div className="flex items-center gap-1 text-xs text-foreground/60 mt-0.5">
                        <MapPin size={11} />
                        {lesson.location?.city}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isConfirmed ? (
                        <span className="rounded-xl bg-success/20 px-2 py-1 text-[10px] font-bold text-success">
                          ✓ מאושר
                        </span>
                      ) : lesson.status === "cancelled" ? (
                        <span className="rounded-xl bg-destructive/20 px-2 py-1 text-[10px] font-bold text-destructive">
                          בוטל
                        </span>
                      ) : lesson.instructor_absence_request ? (
                        <span className="flex items-center gap-1 rounded-xl bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
                          <AlertTriangle size={12} />
                          {INSTRUCTOR_REQUEST_TYPES[lesson.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES] ?? "דווח"}
                        </span>
                      ) : hasStartedPlus10 ? (
                        <LessonConfirmButtons
                          lessonId={lesson.id}
                          locationName={lesson.location?.name ?? ""}
                          startTime={lesson.start_time}
                          signature={null}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Report buttons for future lessons - full width below */}
                  {isFutureLesson && (
                    <div className="mt-3 border-t border-border/50 pt-3">
                      <InstructorReportButton lessonId={lesson.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
