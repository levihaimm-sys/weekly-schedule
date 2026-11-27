"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { israelStartOfDay } from "@/bot/lib/business-hours";
import { israelDayFromToday } from "@/bot/lib/format";
import { assertAccount, createClient, myAccounts } from "@/bot/lib/db";

const REASONS: Record<string, string | null> = {
  done: "סומן כטופל",
  dismissed: "סומן כלא רלוונטי",
  open: null,
};

async function updateStatus(id: string, status: string, reason?: string | null) {
  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("tasks")
    .update({
      status,
      close_reason: reason !== undefined ? reason : REASONS[status],
      closed_at: status === "open" ? null : now,
      updated_at: now,
    })
    .eq("id", id)
    .in("account_id", await myAccounts())
    .select("account_id, summary, type")
    .maybeSingle();
  if (row) await logActivity(supabase, row.account_id, "task_status", id, { status, summary: row.summary, type: row.type });
}

// Close / reopen a task. RLS limits this to the user's accounts, and column
// grants limit it to status fields.
export async function setTaskStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in REASONS)) return;
  await updateStatus(id, status);
  // "Not relevant" is also a learning signal for the classifier.
  if (status === "dismissed") {
    const account = await assertAccount(String(formData.get("account") ?? ""));
    const supabase = await createClient();
    await supabase.from("task_feedback").insert({ task_id: id, account_id: account, verdict: "bad" });
  }
  revalidatePath("/bot");
}

// Postpone an open task or request to a day ("tomorrow" or YYYY-MM-DD): it
// leaves the day view and comes back at 06:00 Israel time that day.
// day "now" brings it back now.
export async function snoozeItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const table = String(formData.get("table") ?? "");
  let day = String(formData.get("day") ?? "").trim();
  if (!id || !day || (table !== "tasks" && table !== "requests" && table !== "topics")) return;
  if (day === "tomorrow") day = israelDayFromToday(1);
  let until: string | null = null;
  if (day !== "now") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day <= israelDayFromToday(0)) return;
    until = new Date(israelStartOfDay(new Date(`${day}T12:00:00Z`)).getTime() + 6 * 3_600_000).toISOString();
  }
  const supabase = await createClient();
  const { data: row } = await supabase
    .from(table)
    .update({ snoozed_until: until })
    .eq("id", id)
    .in("account_id", await myAccounts())
    .select(table === "topics" ? "account_id, summary:title" : "account_id, summary")
    .maybeSingle<{ account_id: string; summary: string }>();
  if (row) await logActivity(supabase, row.account_id, until ? "snooze" : "unsnooze", id, { table, day: until ? day : null, summary: row.summary });
  revalidatePath(table === "topics" ? "/bot/topics" : "/bot");
}

// 👍 / 👎 with an optional note. 👎 also removes the task from the list.
export async function giveFeedback(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const account = String(formData.get("account") ?? "");
  const verdict = String(formData.get("verdict") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000) || null;
  if (!id || !account || (verdict !== "good" && verdict !== "bad")) return;
  await assertAccount(account);

  const supabase = await createClient();
  await supabase.from("task_feedback").insert({ task_id: id, account_id: account, verdict, note });
  await logActivity(supabase, account, "task_feedback", id, { verdict, note });
  if (verdict === "bad") await updateStatus(id, "dismissed", "לא רלוונטי (משוב)");
  revalidatePath("/bot");
}
