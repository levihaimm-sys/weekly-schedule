"use server";

import { revalidatePath } from "next/cache";
import { assertAccount, createClient, myAccounts } from "@/bot/lib/db";

export async function savePreferences(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  await assertAccount(account);
  const rules = String(formData.get("rules") ?? "").slice(0, 8000);
  const learning = formData.get("learning_mode") === "on";
  const workKeywords = String(formData.get("work_keywords") ?? "")
    .split(/[,،\n]/)
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 50);
  const supabase = await createClient();
  await supabase
    .from("preferences")
    .update({ rules, learning_mode: learning, work_keywords: workKeywords, updated_at: new Date().toISOString() })
    .eq("account_id", account);
  revalidatePath("/bot/preferences");
  revalidatePath("/bot/chats");
  revalidatePath("/bot");
}

export async function deleteFeedback(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("task_feedback").delete().eq("id", id).in("account_id", await myAccounts());
  revalidatePath("/bot/preferences");
}
