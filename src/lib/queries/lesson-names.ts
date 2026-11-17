import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveFrameworkName } from "@/lib/utils/framework-label";

// Sets each lesson's framework_name to exactly the name the admin weekly board shows for it
// (group_name on the recurring template first, see getWeekLessons), so instructor screens and
// reports never name a lesson differently from the office. Lessons need recurring_item_id,
// framework, framework_name and location.name selected.
export async function attachBoardNames(supabase: SupabaseClient, lessons: any[]) {
  const recurringIds = [...new Set(lessons.map((l) => l.recurring_item_id).filter(Boolean))];
  const recurringById = new Map<string, any>();
  // Chunked for the same URL-length reason as getWeekLessons.
  for (let i = 0; i < recurringIds.length; i += 80) {
    const { data } = await supabase
      .from("recurring_schedule")
      .select("id, group_name, framework, framework_name")
      .in("id", recurringIds.slice(i, i + 80));
    for (const r of data ?? []) recurringById.set(r.id, r);
  }
  for (const lesson of lessons) {
    const recurring = lesson.recurring_item_id ? recurringById.get(lesson.recurring_item_id) : undefined;
    lesson.framework_name =
      resolveFrameworkName({
        group_name: recurring?.group_name ?? null,
        framework_name: recurring?.framework_name ?? lesson.framework_name,
        framework: recurring?.framework ?? lesson.framework,
        location: lesson.location,
      }) || null;
  }
}
