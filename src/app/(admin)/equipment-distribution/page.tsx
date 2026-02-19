import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EquipmentDistributionManager } from "@/components/equipment/equipment-distribution-manager";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function EquipmentDistributionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/today");
  }

  // Get current week's Sunday
  const now = new Date();
  const dayOfWeek = now.getDay();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);
  const weekStartDate = sunday.toISOString().split("T")[0];

  // Get all instructors with their current week assignments
  const { data: instructors } = await supabase
    .from("instructors")
    .select(
      `
      id,
      full_name,
      route
    `
    )
    .order("route", { ascending: true })
    .order("full_name");

  // Get current week assignments
  const { data: assignments } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `
      id,
      instructor_id,
      lesson_plan_id,
      equipment_distributed,
      equipment_distributed_at,
      lesson_plan:lesson_plans(
        id,
        name,
        category
      )
    `
    )
    .eq("week_start_date", weekStartDate);

  // Get all lesson plans for dropdown
  const { data: allLessonPlans } = await supabase
    .from("lesson_plans")
    .select("id, name, category, week_number")
    .order("category")
    .order("week_number");

  // Create a map of instructor assignments
  const assignmentMap = new Map(
    (assignments || []).map((a) => [
      a.instructor_id,
      {
        ...a,
        lesson_plan: Array.isArray(a.lesson_plan)
          ? a.lesson_plan[0] ?? null
          : a.lesson_plan,
      },
    ])
  );

  // Combine data
  const instructorData = (instructors || []).map((instructor) => ({
    ...instructor,
    assignment: assignmentMap.get(instructor.id) || null,
  }));

  return (
    <div className="space-y-6">
      <Link href="/lesson-plans" className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit">
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">חלוקת ציוד</h2>
        <p className="text-muted-foreground mt-1">
          ניהול חלוקת ציוד למדריכים לשבוע הנוכחי
        </p>
      </div>

      <EquipmentDistributionManager
        instructors={instructorData}
        allLessonPlans={allLessonPlans || []}
        weekStartDate={weekStartDate}
      />
    </div>
  );
}
