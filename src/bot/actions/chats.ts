"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { assertAccount, createClient } from "@/bot/lib/db";

const PRIORITIES = new Set(["important", "normal", "background", "ignore"]);

export async function setChatPriority(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  const jid = String(formData.get("jid") ?? "");
  const priority = String(formData.get("priority") ?? "");
  if (!account || !jid || !PRIORITIES.has(priority)) return;
  await assertAccount(account);

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("chats")
    .update({ priority, priority_source: "user" })
    .eq("account_id", account)
    .eq("jid", jid)
    .select("name")
    .maybeSingle();
  if (error) throw new Error("השמירה נכשלה");
  await logActivity(supabase, account, "chat_priority", jid, { priority, chat: row?.name });
  revalidatePath("/bot/chats");
}

// Work marking: "true" / "false" pin it, anything else goes back to automatic (by name).
export async function setChatWork(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  const jid = String(formData.get("jid") ?? "");
  const raw = String(formData.get("work") ?? "");
  if (!account || !jid) return;
  await assertAccount(account);
  const work = raw === "true" ? true : raw === "false" ? false : null;

  const supabase = await createClient();
  const { error } = await supabase.from("chats").update({ work }).eq("account_id", account).eq("jid", jid);
  if (error) throw new Error("השמירה נכשלה");
  await logActivity(supabase, account, "chat_work", jid, { work });
  revalidatePath("/bot/chats");
  revalidatePath("/bot");
}
