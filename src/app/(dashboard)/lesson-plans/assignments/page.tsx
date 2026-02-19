import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentsOverview, getLessonPlansByCategory } from "@/lib/queries/lesson-plans";
import { AssignmentsOverviewTable } from "@/components/lesson-plans/assignments-overview-table";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
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

  // Get overview data, lesson plans, and rotation-ordered instructors
  const [overviewData, lessonPlansByCategory, { data: allInstructors }] = await Promise.all([
    getAssignmentsOverview(),
    getLessonPlansByCategory(),
    supabase
      .from("instructors")
      .select("id, full_name, rotation_order")
      .eq("is_active", true)
      .not("rotation_order", "is", null)
      .order("rotation_order"),
  ]);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Link href="/lesson-plans" className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit">
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">הקצאות שבועיות</h2>
        <p className="text-sm text-muted-foreground">
          מבט-על על חלוקת מערכי השיעור בין המדריכות. לחצי על תא לעריכה.
        </p>
      </div>

      <AssignmentsOverviewTable
        assignments={overviewData.assignments}
        instructorCities={overviewData.instructorCities}
        currentWeekStart={overviewData.currentWeekStart}
        lessonPlansByCategory={lessonPlansByCategory}
        orderedInstructors={(allInstructors ?? []) as any}
      />
    </div>
  );
}
