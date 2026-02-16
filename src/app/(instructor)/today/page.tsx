import { createClient } from "@/lib/supabase/server";
import { formatTime, getTodayInIsrael, getNowInIsrael } from "@/lib/utils/date";
import { MapPin, Clock, Navigation, CheckCircle, BookOpen, Package } from "lucide-react";
import { getWazeUrl } from "@/lib/utils/waze";
import { redirect } from "next/navigation";
import { InstructorReportButton } from "@/components/schedule/instructor-report-button";
import { LessonConfirmButtons } from "@/components/schedule/lesson-confirm-buttons";
import { getInstructorCurrentWeekAssignment, getOrCreateEquipmentConfirmations } from "@/lib/queries/lesson-plans";
import { EquipmentConfirmationList } from "@/components/lesson-plans/equipment-confirmation";
import Link from "next/link";

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

  // Get today's lessons
  const { data: todayLessons, error: lessonsError } = await supabase
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
    .order("start_time");


  // Fetch signatures
  const lessonIds = (todayLessons ?? []).map((l) => l.id);
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

  const dayOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][now.getDay()];
  const dateStr = now.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
  const isSunday = now.getDay() === 0;
  const isMonday = now.getDay() === 1;
  const canConfirmEquipment = isSunday || isMonday;

  // Get weekly assignment and equipment
  const assignment = await getInstructorCurrentWeekAssignment(profile.instructor_id);
  let equipmentConfirmations: any[] = [];
  let shouldShowEquipmentConfirmation = false;
  
  if (assignment) {
    // Check if there are any equipment confirmations for this assignment
    const { data: existingConfirmations } = await supabase
      .from("equipment_confirmations")
      .select(
        `
        *,
        equipment:equipment(id, name)
      `
      )
      .eq("assignment_id", assignment.id);

    if (existingConfirmations && existingConfirmations.length > 0) {
      equipmentConfirmations = existingConfirmations;
      
      // Show equipment confirmation if not all items are confirmed yet
      const allConfirmed = equipmentConfirmations.every((c: any) => c.is_confirmed);
      shouldShowEquipmentConfirmation = !allConfirmed;
    }
  }

  return (
    <div className="space-y-8">
      {/* Greeting Section */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">שלום, {profile.display_name}</h2>
        <p className="text-base text-muted-foreground">
          {dayOfWeek}, {dateStr}
        </p>
      </div>

      {/* Weekly Lesson Plan Link */}
      {assignment && (
        <Link
          href="/my-lesson-plan"
          className="block rounded-3xl bg-accent p-7 shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white/40 p-3">
              <BookOpen className="text-foreground" size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground leading-tight">המערך השבועי שלי</h3>
              <p className="mt-1.5 text-base font-semibold text-foreground/80 truncate">
                {assignment.lesson_plan?.name}
              </p>
            </div>
            <div className="text-foreground text-2xl shrink-0">←</div>
          </div>
        </Link>
      )}

      {/* Equipment Confirmation - Show if equipment distributed and not all confirmed */}
      {shouldShowEquipmentConfirmation && equipmentConfirmations.length > 0 && (
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

      {/* Today's Lessons Header */}
      <div className="pt-2">
        <h3 className="text-2xl font-bold text-foreground">השיעורים שלי היום</h3>
      </div>

      {/* Today's lessons */}
      <div className="space-y-5">
        {!todayLessons || todayLessons.length === 0 ? (
          <div className="rounded-3xl bg-card p-16 text-center shadow-md">
            <p className="text-3xl font-bold text-foreground">
              אין שיעורים להיום 🎉
            </p>
            <p className="mt-3 text-base font-medium text-muted-foreground">
              תהנה מהיום החופשי!
            </p>
          </div>
        ) : (
          todayLessons.map((lesson: any, index: number) => {
            const hasRequest = lesson.instructor_absence_request;
            const isScheduled = lesson.status === "scheduled";
            const isConfirmed = !!sigMap[lesson.id];

            // Calculate if lesson has started + 10 minutes
            const lessonDateTime = new Date(`${lesson.lesson_date}T${lesson.start_time}`);
            const tenMinutesAfterStart = new Date(lessonDateTime.getTime() + 10 * 60 * 1000);
            const hasStartedPlus10 = now >= tenMinutesAfterStart;
            const lessonNotStartedYet = now < lessonDateTime;

            // Pastel color backgrounds - cycle through them
            const cardColors = [
              "bg-accent", // Light mint
              "bg-secondary", // Soft peach
              "bg-primary", // Sage green
              "bg-tertiary", // Soft pink
            ];
            const cardBg = cardColors[index % cardColors.length];

            return (
              <div key={lesson.id} className="space-y-3">
                {/* Lesson card */}
                <div
                  className={`rounded-3xl p-7 shadow-md transition-all ${cardBg} ${
                    isConfirmed
                      ? "ring-2 ring-success ring-offset-2"
                      : hasRequest
                        ? "ring-2 ring-warning ring-offset-2"
                        : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Time - HUGE like in the inspiration */}
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/40 p-2.5">
                          <Clock size={18} className="text-foreground/70" />
                        </div>
                        <span className="text-4xl font-bold text-foreground tracking-tight">
                          {formatTime(lesson.start_time)}
                        </span>
                      </div>

                      {/* Location name */}
                      <p className="text-xl font-bold text-foreground">
                        {lesson.location?.name}
                      </p>

                      {/* Address */}
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <MapPin size={16} />
                        <span>
                          {lesson.location?.city}
                          {lesson.location?.street
                            ? `, ${lesson.location.street}`
                            : ""}
                        </span>
                      </div>

                      {/* Age group badge */}
                      {lesson.location?.age_group && (
                        <span className="inline-block rounded-2xl bg-white/40 px-4 py-1.5 text-xs font-bold text-foreground">
                          גיל {lesson.location.age_group}
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <span
                      className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ${
                        isConfirmed
                          ? "bg-white/50 text-foreground"
                          : lesson.status === "completed"
                            ? "bg-white/50 text-foreground"
                            : lesson.status === "cancelled"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-white/30 text-foreground"
                      }`}
                    >
                      {isConfirmed
                        ? "✓ אושר"
                        : lesson.status === "scheduled"
                          ? "מתוכנן"
                          : lesson.status}
                    </span>
                  </div>

                  {/* Change notes */}
                  {lesson.change_notes && (
                    <div className="mt-5 rounded-2xl bg-white/30 px-4 py-3">
                      <p className="text-sm font-semibold text-foreground/90">
                        ⚠️ {lesson.change_notes}
                      </p>
                    </div>
                  )}

                  {/* Request notification */}
                  {hasRequest && (
                    <div className="mt-5 flex items-start gap-2 rounded-2xl bg-white/30 px-4 py-3">
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
                          - {lesson.instructor_notes}
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
                    className="flex items-center justify-center gap-3 rounded-2xl bg-[#6B6560] px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-[#5a524e] hover:shadow-lg active:scale-[0.98]"
                  >
                    <Navigation size={22} />
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
          })
        )}
      </div>
    </div>
  );
}
