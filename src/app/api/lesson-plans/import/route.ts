import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ImportRow {
  date: string; // YYYY-MM-DD
  assignments: { instructorName: string; lessonPlanName: string }[];
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { rows }: { rows: ImportRow[] } = await req.json();

  // Load all instructors and lesson plans for name → id mapping
  const [{ data: instructors }, { data: lessonPlans }] = await Promise.all([
    supabase.from("instructors").select("id, full_name"),
    supabase.from("lesson_plans").select("id, name"),
  ]);

  const instructorMap = new Map<string, string>(
    (instructors ?? []).map((i) => [i.full_name.trim(), i.id])
  );
  const lessonPlanMap = new Map<string, string>(
    (lessonPlans ?? []).map((lp) => [lp.name.trim(), lp.id])
  );

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const unknownInstructors = new Set<string>();
  const unknownLessonPlans = new Set<string>();

  for (const row of rows) {
    for (const { instructorName, lessonPlanName } of row.assignments) {
      if (!lessonPlanName || lessonPlanName === "—") {
        skipped++;
        continue;
      }

      const instructorId = instructorMap.get(instructorName.trim());
      const lessonPlanId = lessonPlanMap.get(lessonPlanName.trim());

      if (!instructorId) {
        unknownInstructors.add(instructorName);
        skipped++;
        continue;
      }
      if (!lessonPlanId) {
        unknownLessonPlans.add(lessonPlanName);
        skipped++;
        continue;
      }

      // Check for existing assignment
      const { data: existing } = await supabase
        .from("weekly_lesson_assignments")
        .select("id")
        .eq("instructor_id", instructorId)
        .eq("week_start_date", row.date)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("weekly_lesson_assignments")
          .update({ lesson_plan_id: lessonPlanId, is_permanent_change: false })
          .eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("weekly_lesson_assignments").insert({
          instructor_id: instructorId,
          lesson_plan_id: lessonPlanId,
          week_start_date: row.date,
          is_permanent_change: false,
        });
        created++;
      }
    }
  }

  return NextResponse.json({
    created,
    updated,
    skipped,
    unknownInstructors: [...unknownInstructors],
    unknownLessonPlans: [...unknownLessonPlans],
  });
}
