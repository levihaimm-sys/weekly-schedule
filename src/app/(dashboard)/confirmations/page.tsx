import { createAdminClient } from "@/lib/supabase/admin";
import { WeekNavigator } from "@/components/schedule/week-navigator";
import { ConfirmationsView } from "@/components/dashboard/confirmations-view";
import { format, addDays, startOfWeek } from "date-fns";

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
       location:locations!lessons_location_id_fkey(name, city)`
    )
    .gte("lesson_date", weekStartStr)
    .lte("lesson_date", weekEndStr)
    .order("lesson_date")
    .order("start_time");

  const allLessons = lessons ?? [];

  // Fetch signatures separately
  const lessonIds = allLessons.map((l) => l.id);
  const sigMap: Record<string, { signer_name: string; signer_role: string }> =
    {};
  if (lessonIds.length > 0) {
    const { data: signatures } = await supabase
      .from("signatures")
      .select("lesson_id, signer_name, signer_role")
      .in("lesson_id", lessonIds);
    for (const sig of signatures ?? []) {
      sigMap[sig.lesson_id] = {
        signer_name: sig.signer_name,
        signer_role: sig.signer_role,
      };
    }
  }

  // Flatten lessons for the client component
  const flatLessons = allLessons.map((l) => ({
    id: l.id,
    lesson_date: l.lesson_date,
    start_time: l.start_time,
    status: l.status,
    instructor_id: l.instructor_id,
    instructor_name: (l.instructor as any)?.full_name ?? "לא ידוע",
    location_name: (l.location as any)?.name ?? "",
    location_city: (l.location as any)?.city ?? "",
  }));

  // Unique instructors and clients for filters
  const instructorMap = new Map<string, string>();
  for (const l of flatLessons) {
    if (!instructorMap.has(l.instructor_id)) {
      instructorMap.set(l.instructor_id, l.instructor_name);
    }
  }
  const instructors = [...instructorMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "he"));

  const clients = [
    ...new Set(flatLessons.map((l) => l.location_name).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "he"));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
        מעקב אישורים
      </h2>

      <WeekNavigator
        weekStartStr={weekStartStr}
        weekEndStr={weekEndStr}
        basePath="/confirmations"
      />

      <ConfirmationsView
        lessons={flatLessons}
        sigMap={sigMap}
        instructors={instructors}
        clients={clients}
      />
    </div>
  );
}
