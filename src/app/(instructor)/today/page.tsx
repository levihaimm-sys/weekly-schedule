import { createClient } from "@/lib/supabase/server";
import { formatTime, getTodayInIsrael, getNowInIsrael } from "@/lib/utils/date";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { MapPin, Clock, Navigation, Package } from "lucide-react";
import { getWazeUrl } from "@/lib/utils/waze";
import { redirect } from "next/navigation";
import { InstructorReportButton } from "@/components/schedule/instructor-report-button";
import { LessonConfirmButtons } from "@/components/schedule/lesson-confirm-buttons";
import { getInstructorCurrentWeekAssignment } from "@/lib/queries/lesson-plans";
import { EquipmentConfirmationList } from "@/components/lesson-plans/equipment-confirmation";
import { format } from "date-fns";

export default async function TodayPage() {
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

  const today = getTodayInIsrael();
  const now = getNowInIsrael();

  // Parallel: fetch today's lessons + weekly assignment at the same time
  const [lessonsResult, assignment] = await Promise.all([
    supabase
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
      .eq("lesson_date", today)
      .order("start_time"),
    getInstructorCurrentWeekAssignment(profile.instructor_id),
  ]);

  const todayLessons = lessonsResult.data;

  // Parallel: fetch signatures + equipment confirmations
  const lessonIds = (todayLessons ?? []).map((l) => l.id);

  const [signaturesResult, equipmentResult] = await Promise.all([
    lessonIds.length > 0
      ? supabase
          .from("signatures")
          .select("lesson_id, signer_name, signer_role, signature_url")
          .in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] as any[] }),
    assignment
      ? supabase
          .from("equipment_confirmations")
          .select(`*, equipment:equipment(id, name)`)
          .eq("assignment_id", assignment.id)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const sigMap: Record<string, { signer_name: string; signer_role: string; signature_url: string | null }> = {};
  for (const sig of signaturesResult.data ?? []) {
    sigMap[sig.lesson_id] = {
      signer_name: sig.signer_name,
      signer_role: sig.signer_role,
      signature_url: sig.signature_url,
    };
  }

  const equipmentConfirmations: any[] = equipmentResult.data ?? [];
  const allConfirmed = equipmentConfirmations.every((c: any) => c.is_confirmed);
  const shouldShowEquipmentConfirmation = equipmentConfirmations.length > 0 && !allConfirmed;

  const dayOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][now.getDay()];
  const dateStr = now.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
  const isSunday = now.getDay() === 0;
  const isMonday = now.getDay() === 1;
  const canConfirmEquipment = isSunday || isMonday;


  return (
    <div className="space-y-8">
      {/* Greeting Section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">שלום, {profile.display_name}</h2>
        <p className="text-base text-muted-foreground">
          {dayOfWeek}, {dateStr}
        </p>
      </div>

      {/* Equipment Confirmation - Show if equipment distributed and not all confirmed */}
      {shouldShowEquipmentConfirmation && equipmentConfirmations.length > 0 && canConfirmEquipment && (
        <div className="rounded-3xl bg-secondary p-7 shadow-md ring-2 ring-warning/30 ring-offset-2">
          <div className="mb-6 flex items-center gap-4">
            <div className="rounded-2xl bg-white/40 p-3">
              <Package className="text-foreground" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">אישור קבלת ציוד</h3>
              <p className="mt-1 text-sm font-medium text-foreground/70">
                {canConfirmEquipment
                  ? "יש לאשר קבלת ציוד עד יום שני בערב"
                  : "ניתן לאשר קבלת ציוד רק בימי ראשון ושני"}
              </p>
            </div>
          </div>
          <EquipmentConfirmationList
            confirmations={equipmentConfirmations}
            assignmentId={assignment!.id}
            canConfirm={canConfirmEquipment}
          />
        </div>
      )}

      {/* Today's Lessons */}
      <div className="space-y-5">
        {/* Day header - like in weekly schedule but with written background */}
        <div className="flex items-center gap-3 rounded-2xl px-5 py-4 shadow-sm bg-secondary">
          <span className="text-2xl font-bold text-foreground">
            {DAYS_SHORT[now.getDay()]}
          </span>
          <span className="text-base font-semibold text-foreground/70">
            {format(now, "dd/MM")}
          </span>
          <span className="rounded-2xl bg-white/40 px-3 py-1.5 text-xs font-bold text-foreground">
            היום
          </span>
          {todayLessons && todayLessons.length > 0 && (
            <span className="rounded-full bg-white/40 px-3 py-1 text-sm font-bold text-foreground">
              {todayLessons.length}
            </span>
          )}
        </div>

        {!todayLessons || todayLessons.length === 0 ? (
          <div className="rounded-2xl bg-card/50 p-6 text-center shadow-sm">
            <p className="text-base font-medium text-muted-foreground">אין שיעורים להיום</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayLessons.map((lesson: any) => {
              const hasRequest = lesson.instructor_absence_request;
              const isScheduled = lesson.status === "scheduled";
              const isConfirmed = !!sigMap[lesson.id];

              // Calculate if lesson has started + 10 minutes
              const lessonDateTime = new Date(`${lesson.lesson_date}T${lesson.start_time}`);
              const tenMinutesAfterStart = new Date(lessonDateTime.getTime() + 10 * 60 * 1000);
              const hasStartedPlus10 = now >= tenMinutesAfterStart;
              const lessonNotStartedYet = now < lessonDateTime;

              return (
                <div key={lesson.id} className="rounded-2xl border-2 border-gray-300 p-4 space-y-3">
                  {/* Lesson card - matching weekly schedule style */}
                  <div
                    className={`rounded-2xl bg-card p-5 shadow-sm ${
                      hasRequest
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
                                : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {isConfirmed
                          ? "✓ אושר"
                          : lesson.status === "scheduled"
                            ? "מתוכנן"
                            : lesson.status}
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
                          📢 {lesson.instructor_request_type === "absence"
                            ? "חיסור"
                            : lesson.instructor_request_type === "lateness"
                              ? "איחור צפוי"
                              : "הודעה"}{" "}
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

                  {/* Waze button */}
                  {lesson.location?.street && lesson.location?.city && (
                    <a
                      href={getWazeUrl(
                        lesson.location.street,
                        lesson.location.city
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#33CCFF] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2bb8e6] active:scale-[0.98]"
                    >
                      <Navigation size={16} />
                      ניווט ב-Waze
                    </a>
                  )}

                  {/* Report button - only before lesson starts, without existing request */}
                  {!hasRequest && !isConfirmed && isScheduled && lessonNotStartedYet && (
                    <InstructorReportButton lessonId={lesson.id} />
                  )}

                  {/* Confirmation buttons - only 10 minutes after lesson start, or if already confirmed */}
                  {isScheduled && (isConfirmed || hasStartedPlus10) && (
                    <LessonConfirmButtons
                      lessonId={lesson.id}
                      locationName={lesson.location?.name ?? ""}
                      startTime={lesson.start_time}
                      signature={sigMap[lesson.id] ?? null}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
