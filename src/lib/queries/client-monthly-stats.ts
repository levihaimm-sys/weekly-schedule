import { createClient } from "@/lib/supabase/server";

export type ClientMonthlyStat = {
  client: string;
  total: number;
  completed: number;
  cancelled: number;
  dayChanged: number;
};

const PAGE_SIZE = 1000;

/**
 * Per-client lesson counts for one month. A lesson counts as "day changed"
 * when it is linked to a recurring_schedule row and fell on a different
 * weekday than that row's day_of_week (one-off lessons have no fixed day).
 */
export async function getClientMonthlyStats(year: number, month: number): Promise<ClientMonthlyStat[]> {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

  const lessons: any[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, lesson_date, status, client_name, recurring:recurring_schedule!lessons_recurring_item_id_fkey(day_of_week, client_name)")
      .gte("lesson_date", startDate)
      .lte("lesson_date", endDate)
      .order("id")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    lessons.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }

  const byClient = new Map<string, ClientMonthlyStat>();
  for (const l of lessons) {
    const recurring = Array.isArray(l.recurring) ? l.recurring[0] : l.recurring;
    const client = l.client_name || recurring?.client_name || "ללא לקוח";
    if (!byClient.has(client)) byClient.set(client, { client, total: 0, completed: 0, cancelled: 0, dayChanged: 0 });
    const s = byClient.get(client)!;
    s.total++;
    if (l.status === "completed") s.completed++;
    if (l.status === "cancelled") s.cancelled++;
    if (recurring && new Date(l.lesson_date + "T12:00:00").getDay() !== recurring.day_of_week) s.dayChanged++;
  }

  return [...byClient.values()].sort((a, b) => b.total - a.total);
}
