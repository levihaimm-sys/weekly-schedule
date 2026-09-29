import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { addDays, format } from "date-fns";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { WeekNavigator } from "@/components/equipment/week-navigator";
import { getNowInIsrael, getWeekStart } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function WeeklyEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/today");
  }

  const { week } = await searchParams;
  let weekStartDate: string;
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    weekStartDate = week;
  } else {
    // Default to the upcoming week (next Sunday), not the current one.
    const nextSunday = addDays(getWeekStart(getNowInIsrael()), 7);
    weekStartDate = format(nextSunday, "yyyy-MM-dd");
  }

  const { data: instructors } = await supabase
    .from("instructors")
    .select("id, full_name, address, rotation_order")
    .eq("is_active", true)
    .not("rotation_order", "is", null)
    .order("rotation_order");

  const { data: assignments } = await supabase
    .from("weekly_lesson_assignments")
    .select(
      `instructor_id, lesson_plan_id,
       lesson_plan:lesson_plans(id, name, category)`
    )
    .eq("week_start_date", weekStartDate);

  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [
      a.instructor_id,
      Array.isArray(a.lesson_plan) ? a.lesson_plan[0] ?? null : a.lesson_plan,
    ])
  );

  const lessonPlanIds = [
    ...new Set([...assignmentMap.values()].filter(Boolean).map((lp) => lp!.id)),
  ];

  const { data: equipmentRows } = await supabase
    .from("lesson_plan_equipment")
    .select(
      `lesson_plan_id, quantity, instructor_quantity,
       equipment:equipment(name)`
    )
    .in("lesson_plan_id", lessonPlanIds.length > 0 ? lessonPlanIds : ["__none__"]);

  const equipmentByPlan = new Map<
    string,
    { name: string; quantity: number }[]
  >();
  for (const row of equipmentRows ?? []) {
    const equipmentName = (row.equipment as any)?.name ?? "";
    if (!equipmentByPlan.has(row.lesson_plan_id)) {
      equipmentByPlan.set(row.lesson_plan_id, []);
    }
    equipmentByPlan.get(row.lesson_plan_id)!.push({
      name: equipmentName,
      quantity: row.instructor_quantity ?? row.quantity,
    });
  }

  const rows = (instructors ?? []).map((instructor) => {
    const lessonPlan = assignmentMap.get(instructor.id) ?? null;
    const equipment = lessonPlan ? equipmentByPlan.get(lessonPlan.id) ?? [] : [];
    return { ...instructor, lessonPlan, equipment };
  });

  return (
    <div className="space-y-6">
      <Link
        href="/lesson-plans"
        className="flex items-center gap-1 text-sm text-orange-600 hover:underline w-fit"
      >
        <ArrowRight size={14} />
        חזרה לציוד
      </Link>

      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">
          רשימת ציוד למדריכות
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          לפי סדר הקצאת ציוד: איזה מערך ואיזה ציוד כל מדריכה תקבל
        </p>
      </div>

      <WeekNavigator currentWeek={weekStartDate} />

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
              <th className="px-3 py-2 text-center">#</th>
              <th className="px-3 py-2 text-start">מדריכה</th>
              <th className="px-3 py-2 text-start">מערך</th>
              <th className="px-3 py-2 text-start">ציוד</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-2 text-center text-muted-foreground">
                  {idx + 1}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.full_name}</div>
                  {r.address && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin size={11} className="shrink-0" />
                      {r.address}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  {r.lessonPlan ? (
                    r.lessonPlan.name
                  ) : (
                    <span className="text-muted-foreground">לא שובץ מערך</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {r.equipment.length > 0 ? (
                    <span>
                      {r.equipment
                        .map((e) => `${e.name} x${e.quantity}`)
                        .join(", ")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            אין מדריכות עם סדר הקצאה מוגדר. ניתן להגדיר סדר בעמוד{" "}
            <Link href="/lesson-plans/assignments" className="text-orange-600 hover:underline">
              הקצאות שבועיות
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
