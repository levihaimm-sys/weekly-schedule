"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/bot/lib/activity";
import { createClient, myAccounts } from "@/bot/lib/db";

const TABLES = new Set(["tasks", "requests"]);

// "Make it a task in weekly-schedule". The dashboard only records the wish;
// the worker (which alone holds weekly-schedule's key) creates the task there
// within half a minute and links it back.
export async function makeWeeklyTask(formData: FormData) {
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const description = String(formData.get("description") ?? "").trim().slice(0, 500);
  const assignedTo = String(formData.get("assigned_to") ?? "") || null;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const urgent = formData.get("urgent") === "on";
  if (!TABLES.has(table) || !id || !description) return;
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from(table)
    .update({
      ws_request: { description, assigned_to: assignedTo, due_date: dueDate, urgency: urgent ? "urgent" : "normal", at: new Date().toISOString() },
      ws_error: null,
    })
    .eq("id", id)
    .in("account_id", await myAccounts())
    .select("account_id")
    .maybeSingle();
  if (row) await logActivity(supabase, row.account_id, "make_weekly_task", id, { table, description, assigned_to: assignedTo, due_date: dueDate, urgent });
  revalidatePath("/bot");
}
