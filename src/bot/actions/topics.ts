"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { createClient, myAccounts } from "@/bot/lib/db";

// "resolved" = done, "dismissed" = not a topic, "active" = reopen.
export async function setTopicStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["active", "resolved", "dismissed"].includes(status)) return;
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("topics")
    .update({ status, closed_by: status === "active" ? null : "user", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("account_id", await myAccounts())
    .select("account_id, title")
    .maybeSingle();
  if (error) throw new Error("השמירה נכשלה");
  if (row) await logActivity(supabase, row.account_id, "topic_status", id, { status, title: row.title });
  revalidatePath("/bot/topics");
}
