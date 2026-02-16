import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, Music } from "lucide-react";
import {
  getInstructorCurrentWeekAssignment,
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

  console.log("[MyLessonPlanPage] User:", user.id);
  console.log("[MyLessonPlanPage] Profile:", profile);

  if (!profile?.instructor_id) {
    console.log("[MyLessonPlanPage] No instructor_id in profile");
    redirect("/instructor-login");
  }

  // Get current week assignment
  const assignment = await getInstructorCurrentWeekAssignment(
    profile.instructor_id
  );

  console.log("[MyLessonPlanPage] Assignment:", assignment ? "Found" : "Not found");

  if (!assignment) {
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

  // Get lesson plan with equipment details
  const lessonPlan = await getLessonPlanWithEquipment(assignment.lesson_plan.id);

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
            <h1 className="text-3xl font-bold text-foreground">
              {lessonPlan.name}
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

      {/* Equipment Card */}
      <div className="rounded-3xl bg-card p-7 shadow-md">
        <div className="flex items-center gap-3 mb-5">
          <Package className="w-6 h-6 text-foreground" />
          <h3 className="text-xl font-bold text-foreground">ציוד נדרש</h3>
        </div>

        {lessonPlan.equipment && lessonPlan.equipment.length > 0 ? (
          <ul className="space-y-3">
            {lessonPlan.equipment.map((item, idx) => (
              <li key={idx} className="flex items-center gap-4 p-4 bg-white/30 rounded-2xl">
                <span className="text-3xl font-bold text-foreground">{item.quantity}</span>
                <span className="text-lg font-semibold text-foreground">{item.equipment_name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base font-medium text-foreground/70">אין ציוד רשום למערך זה</p>
        )}
      </div>
    </div>
  );
}
