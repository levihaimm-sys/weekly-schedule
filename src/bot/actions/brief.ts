"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { assertAccount, createClient } from "@/bot/lib/db";

// "ראיתי": the brief(s) of these days leave the day page and fold into
// "סיכומים קודמים". days: comma-separated YYYY-MM-DD.
export async function markBriefSeen(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  const days = String(formData.get("days") ?? "")
    .split(",")
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (!account || !days.length) return;
  await assertAccount(account);
  const supabase = await createClient();
  const { error } = await supabase.from("daily_briefs").update({ seen_at: new Date().toISOString() }).eq("account_id", account).in("day", days);
  if (!error) await logActivity(supabase, account, "brief_seen", days.join(","), { days });
  revalidatePath("/bot");
}

// "ראיתי" on one item: it leaves the brief on the day page. key = itemKey(text).
export async function markBriefItemSeen(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  const day = String(formData.get("day") ?? "");
  const key = String(formData.get("key") ?? "");
  if (!account || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^[0-9a-f]{12}$/.test(key)) return;
  await assertAccount(account);
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_brief_item_seen", { acc: account, brief_day: day, item_key: key });
  if (!error) await logActivity(supabase, account, "brief_item_seen", `${day}:${key}`, {});
  revalidatePath("/bot");
}

// Raise an item of the daily brief to "important" or "remember". The database
// function checks access, creates the item in the brief's chat and marks the
// brief item, so a second click does nothing.
export async function promoteBriefItem(formData: FormData) {
  const account = String(formData.get("account") ?? "");
  const day = String(formData.get("day") ?? "");
  const idx = Number(formData.get("idx"));
  const target = String(formData.get("target") ?? "");
  if (!account || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isInteger(idx) || idx < 0) return;
  if (target !== "important" && target !== "remember") return;
  await assertAccount(account);

  const supabase = await createClient();
  const { error } = await supabase.rpc("promote_brief_item", { acc: account, brief_day: day, idx, target });
  if (!error) await logActivity(supabase, account, "brief_promote", `${day}:${idx}`, { target });
  revalidatePath("/bot");
}
