import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Music } from "lucide-react";
import {
  getInstructorCurrentWeekAssignment,
  getInstructorNextWeekAssignment,
  getOrCreateEquipmentConfirmations,
  getLessonPlanWithEquipment,
} from "@/lib/queries/lesson-plans";
import { EquipmentConfirmationList } from "@/components/lesson-plans/equipment-confirmation";
import { PdfViewerWrapper } from "@/components/lesson-plans/pdf-viewer-wrapper";

export const dynamic = "force-dynamic";

/**
 * Helper: Check if today is Sunday or Monday
 * Equipment confirmation is only allowed on these days
 */
function canConfirmEquipmentToday(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  return dayOfWeek === 0 || dayOfWeek === 1; // 0 = Sunday, 1 = Monday
}

/**
 * Helper: Get Sunday of current week
 */
function getSundayOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

export default async function MyLessonPlanPage() {
  const supabase = await createClient();

  // Get current user's instructor ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/instructor-login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("instructor_id, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.instructor_id) {
    redirect("/instructor-login");
  }

  // Parallel: fetch current + next week assignments simultaneously
  const [assignment, nextWeekAssignment] = await Promise.all([
    getInstructorCurrentWeekAssignment(profile.instructor_id),
    getInstructorNextWeekAssignment(profile.instructor_id),
  ]);

  if (!assignment || !assignment.lesson_plan?.id) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">המערך השבועי שלי</h1>
        <div className="rounded-3xl bg-secondary p-10 text-center shadow-md">
          <p className="text-2xl font-bold text-foreground">
            לא נמצא מערך שיעור עבור השבוע הנוכחי
          </p>
          <p className="text-base font-medium text-foreground/70 mt-3">
            אנא פנה למנהל המערכת
          </p>
        </div>
      </div>
    );
  }

  // Parallel: fetch lesson plans for current + next week
  const [lessonPlan, nextWeekPlan] = await Promise.all([
    getLessonPlanWithEquipment(assignment.lesson_plan.id),
    nextWeekAssignment?.lesson_plan?.id
      ? getLessonPlanWithEquipment(nextWeekAssignment.lesson_plan.id)
      : Promise.resolve(null),
  ]);

  if (!lessonPlan) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">המערך השבועי שלי</h1>
        <div className="rounded-3xl bg-destructive/20 p-10 text-center shadow-md">
          <p className="text-2xl font-bold text-destructive">שגיאה בטעינת מערך השיעור</p>
        </div>
      </div>
    );
  }

  // Get or create equipment confirmations
  const confirmations = await getOrCreateEquipmentConfirmations(
    profile.instructor_id,
    assignment.id,
    lessonPlan.id
  );

  const canConfirm = canConfirmEquipmentToday();
  const sunday = getSundayOfWeek();
  const weekEndDate = new Date(sunday);
  weekEndDate.setDate(sunday.getDate() + 6);

  return (
    <div className="space-y-6">
      {/* Header with green background */}
      <div className="rounded-3xl bg-accent p-7 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">
              מערך שבועי: {lessonPlan.name}
            </h1>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            {lessonPlan.playlist_url && (
              <a
                href={lessonPlan.playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-tertiary rounded-2xl font-bold text-foreground shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Music className="w-5 h-5" />
                מוזיקה
              </a>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer - Maximum Width */}
      <div>
        <PdfViewerWrapper pdfPath={lessonPlan.pdf_path} lessonName={lessonPlan.name} />
      </div>

      {/* Next Week Section */}
      {nextWeekAssignment && nextWeekPlan && (
        <>
          <h2 className="text-3xl font-bold text-foreground text-center mt-8">
            מערך לשבוע הבא:
          </h2>

          {/* Next Week Header - same layout as current week */}
          <div className="rounded-3xl bg-accent p-7 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">
                  מערך שבועי: {nextWeekPlan.name}
                </h1>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                {nextWeekPlan.playlist_url && (
                  <a
                    href={nextWeekPlan.playlist_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-tertiary rounded-2xl font-bold text-foreground shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    <Music className="w-5 h-5" />
                    מוזיקה
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Next Week PDF Viewer */}
          {nextWeekPlan.pdf_path && (
            <div>
              <PdfViewerWrapper pdfPath={nextWeekPlan.pdf_path} lessonName={nextWeekPlan.name} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
