"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { assertAccount, createClient, myAccounts } from "@/bot/lib/db";

const REASONS: Record<string, string | null> = {
  done: "סומן כטופל",
  dismissed: "סומן כלא רלוונטי",
  open: null,
};

// Close / reopen an open request. RLS limits this to the user's accounts, and
// column grants limit it to status fields.
export async function setRequestStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in REASONS)) return;
  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("requests")
    .update({
      status,
      closed_by: status === "open" ? null : "user",
      close_reason: REASONS[status],
      closed_at: status === "open" ? null : now,
      updated_at: now,
    })
    .eq("id", id)
    .in("account_id", await myAccounts())
    .select("account_id, summary, sender_name, message_at")
    .maybeSingle();
  if (row) {
    await logActivity(supabase, row.account_id, "request_status", id, {
      status,
      summary: row.summary,
      who: row.sender_name,
      waited_hours: Math.round((Date.now() - new Date(row.message_at).getTime()) / 360_000) / 10,
    });
  }
  revalidatePath("/bot");
}

// "Make the brief now": the worker picks it up within a few minutes.
export async function requestBriefNow(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  if (!account) return;
  await assertAccount(account);
  const supabase = await createClient();
  await supabase.from("preferences").update({ brief_requested_at: new Date().toISOString() }).eq("account_id", account);
  await logActivity(supabase, account, "brief_now");
  revalidatePath("/bot");
}
