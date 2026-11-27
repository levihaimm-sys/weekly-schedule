"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { assertAccount, createClient } from "@/bot/lib/db";

// "This is work" / "this is private" on a task or topic from the personal
// number. Moves it between the private space and the nonprofit space, and the
// bot learns from it (work_source = 'user' is never overridden).
export async function setWork(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const work = String(formData.get("work") ?? "") === "true";
  if (!id || (table !== "tasks" && table !== "topics")) return;
  await assertAccount("personal");
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from(table)
    .update({ work, work_source: "user", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("account_id", "personal")
    .select("account_id")
    .maybeSingle();
  if (error) throw new Error("השמירה נכשלה");
  if (row) await logActivity(supabase, row.account_id, "work_mark", id, { table, work });
  revalidatePath("/bot");
  revalidatePath("/bot/topics");
}
