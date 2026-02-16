import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LessonPlanEditor } from "@/components/lesson-plans/lesson-plan-editor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonPlanId: string }>;
}

export default async function EditLessonPlanPage({ params }: PageProps) {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/today");
  }

  const { lessonPlanId } = await params;

  // Get lesson plan
  const { data: lessonPlan, error } = await supabase
    .from("lesson_plans")
    .select("*")
    .eq("id", lessonPlanId)
    .single();

  if (error || !lessonPlan) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">שגיאה</h1>
        <p className="text-red-600">מערך השיעור לא נמצא</p>
      </div>
    );
  }

  // Get equipment for this lesson plan
  const { data: equipment } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `
      *,
      equipment:equipment(id, name)
    `
    )
    .eq("lesson_plan_id", lessonPlanId);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/lesson-plans/manage"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לניהול מערכים
        </Link>
        <h1 className="text-3xl font-bold mb-2">עריכת מערך שיעור</h1>
        <p className="text-gray-600">{lessonPlan.name}</p>
      </div>

      {/* Editor */}
      <LessonPlanEditor
        lessonPlan={lessonPlan}
        equipment={equipment?.map((e: any) => ({
          ...e,
          equipment_name: e.equipment.name,
        })) || []}
      />
    </div>
  );
}
