import { createAdminClient } from "@/lib/supabase/admin";
import { WeekNavigator } from "@/components/schedule/week-navigator";
import { AdminConfirmButton } from "@/components/dashboard/admin-confirm-button";
import { format, addDays, startOfWeek } from "date-fns";
import { formatTime } from "@/lib/utils/date";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfirmationsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const baseDate = params.week ? new Date(params.week) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 4);
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const supabase = createAdminClient();

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `id, lesson_date, start_time, status, instructor_id,
       instructor:instructors!lessons_instructor_id_fkey(full_name),
       location:locations!lessons_location_id_fkey(name, city),
       signatures(signer_name, signer_role)`
    )
    .gte("lesson_date", weekStartStr)
    .lte("lesson_date", weekEndStr)
    .order("lesson_date")
    .order("start_time");

  // Group by instructor
  const byInstructor = new Map<
    string,
    { name: string; lessons: typeof lessons }
  >();
  for (const lesson of lessons ?? []) {
    const iId = lesson.instructor_id;
    const iName = (lesson.instructor as any)?.full_name ?? "לא ידוע";
    if (!byInstructor.has(iId)) byInstructor.set(iId, { name: iName, lessons: [] });
    byInstructor.get(iId)!.lessons!.push(lesson as any);
  }

  const sortedInstructors = [...byInstructor.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "he")
  );

  const now = new Date();
  const allLessons = lessons ?? [];
  const totalCount = allLessons.length;
  const confirmedCount = allLessons.filter(
    (l) => (l.signatures as any[])?.length > 0
  ).length;
  const cancelledCount = allLessons.filter((l) => l.status === "cancelled").length;
  const pendingCount = totalCount - confirmedCount - cancelledCount;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">מעקב אישורים</h2>

      <WeekNavigator
        weekStartStr={weekStartStr}
        weekEndStr={weekEndStr}
        basePath="/confirmations"
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'סה"כ שיעורים', value: totalCount, color: "text-foreground" },
          { label: "אושרו", value: confirmedCount, color: "text-green-600" },
          { label: "ממתינים", value: pendingCount, color: "text-orange-600" },
          { label: "בוטלו", value: cancelledCount, color: "text-red-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-background p-4 text-center"
          >
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Per instructor */}
      <div className="space-y-4">
        {sortedInstructors.length === 0 && (
          <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
            אין שיעורים בשבוע זה
          </div>
        )}
        {sortedInstructors.map(({ name, lessons: iLessons }) => {
          const active = (iLessons as any[]).filter((l) => l.status !== "cancelled");
          const confirmed = active.filter(
            (l) => (l.signatures as any[])?.length > 0
          ).length;
          const allDone = confirmed === active.length && active.length > 0;

          return (
            <div
              key={name}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              {/* Instructor header */}
              <div
                className={`flex items-center justify-between px-4 py-3 ${
                  allDone ? "bg-green-50" : "bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  {allDone ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-orange-500" />
                  )}
                  <span className="font-semibold">{name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {confirmed}/{active.length} אושרו
                </span>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-border">
                {(iLessons as any[]).map((lesson) => {
                  const sig = (lesson.signatures as any[])?.[0];
                  const isConfirmed = !!sig;
                  const isCancelled = lesson.status === "cancelled";
                  const lessonTime = new Date(
                    `${lesson.lesson_date}T${lesson.start_time}`
                  );
                  const isPast = lessonTime < now;

                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        isCancelled ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="w-12 shrink-0 text-muted-foreground">
                          {format(new Date(lesson.lesson_date), "dd/MM")}
                        </span>
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="w-12 shrink-0">
                          {formatTime(lesson.start_time)}
                        </span>
                        <span className="font-medium">
                          {(lesson.location as any)?.name}
                        </span>
                        <span className="text-muted-foreground">
                          {(lesson.location as any)?.city}
                        </span>
                      </div>

                      <div className="shrink-0">
                        {isConfirmed ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              sig.signer_role === "teacher"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            ✓ {sig.signer_role === "teacher" ? "גננת" : "מדריכה"}
                          </span>
                        ) : isCancelled ? (
                          <span className="text-xs text-muted-foreground">בוטל</span>
                        ) : isPast ? (
                          <AdminConfirmButton
                            lessonId={lesson.id}
                            instructorName={name}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">עתידי</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
