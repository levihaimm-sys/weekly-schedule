"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { assertAccount, createClient } from "@/bot/lib/db";

const ACCOUNT = "business";
const ROLES = new Set(["instructor", "candidate", "client_contact", "team", "supplier", "other"]);
const STATUSES = new Set(["active", "inactive", "unknown"]);

// An answer to one of the bot's questions, or a free correction. The next
// learning run treats it as fact.
export async function addKnowledgeNote(formData: FormData) {
  const note = String(formData.get("note") ?? "").trim().slice(0, 4000);
  const question = String(formData.get("question") ?? "").trim().slice(0, 500) || null;
  if (!note) return;
  await assertAccount(ACCOUNT);
  const supabase = await createClient();
  const { error } = await supabase.from("knowledge_notes").insert({ account_id: ACCOUNT, question, note });
  if (error) throw new Error("השמירה נכשלה");
  revalidatePath("/bot/learn");
}

// "Learn now": the worker picks it up within ~10 minutes.
export async function learnNow() {
  await assertAccount(ACCOUNT);
  const supabase = await createClient();
  await supabase.from("preferences").update({ learning_requested_at: new Date().toISOString() }).eq("account_id", ACCOUNT);
  await logActivity(supabase, ACCOUNT, "learn_now");
  revalidatePath("/bot/learn");
}

// Correcting who someone is. Marked as set by the user, so the bot never changes it back.
export async function correctPerson(formData: FormData) {
  const jid = String(formData.get("jid") ?? "");
  const role = String(formData.get("role") ?? "");
  const status = String(formData.get("status") ?? "");
  const organization = String(formData.get("organization") ?? "").trim().slice(0, 120) || null;
  if (!jid || !ROLES.has(role) || !STATUSES.has(status)) return;
  await assertAccount(ACCOUNT);
  const supabase = await createClient();
  const { error } = await supabase
    .from("business_people")
    .update({ role, status, organization, source: "user", updated_at: new Date().toISOString() })
    .eq("account_id", ACCOUNT)
    .eq("jid", jid);
  if (error) throw new Error("השמירה נכשלה");
  await logActivity(supabase, ACCOUNT, "person_corrected", jid, { role, status, organization });
  revalidatePath("/bot/learn");
}
