"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const TASK_SELECT = `
  id, description, urgency, assigned_to, created_by, due_date, status, status_note,
  next_action, is_priority, parent_id, created_at, updated_at,
  assignee:profiles!tasks_assigned_to_fkey(id, display_name),
  creator:profiles!tasks_created_by_fkey(id, display_name)
`;

const PATCHABLE_FIELDS = [
  "description",
  "urgency",
  "assigned_to",
  "due_date",
  "status",
  "status_note",
  "next_action",
  "is_priority",
] as const;

type TaskPatch = Partial<Record<(typeof PATCHABLE_FIELDS)[number], string | boolean | null>>;

/** Update only the given fields of a task (fast path for inline edits). */
export async function patchTask(taskId: string, patch: TaskPatch) {
  const update: Record<string, string | boolean | null> = {};
  for (const key of PATCHABLE_FIELDS) {
    if (key in patch) update[key] = patch[key] ?? null;
  }
  if ("description" in update && !String(update.description ?? "").trim()) {
    return { error: "יש להזין תיאור למשימה" };
  }

  const supabase = await createClient();

  if (typeof update.status === "string") {
    const blocked = await openSubtasksError(supabase, taskId, update.status);
    if (blocked) return { error: blocked };
  }

  const { error } = await supabase
    .from("tasks")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function createTask(formData: FormData) {
  const description = (formData.get("description") as string)?.trim();
  const urgency = formData.get("urgency") as string;
  const assignedTo = formData.get("assigned_to") as string;
  const dueDate = (formData.get("due_date") as string) || null;
  const statusNote = (formData.get("status_note") as string)?.trim() || "";
  const nextAction = (formData.get("next_action") as string)?.trim() || "";
  const isPriority = formData.get("is_priority") === "true" || formData.get("is_priority") === "on";
  const parentId = (formData.get("parent_id") as string) || null;

  if (!description) {
    return { error: "יש להזין תיאור למשימה" };
  }
  if (!assignedTo) {
    return { error: "יש לבחור אחראי לטיפול" };
  }

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "לא מחובר" };
  }

  const { data, error } = await supabase.from("tasks").insert({
    description,
    urgency: urgency || "normal",
    assigned_to: assignedTo,
    created_by: user.id,
    due_date: dueDate,
    status_note: statusNote,
    next_action: nextAction,
    is_priority: isPriority,
    parent_id: parentId,
  }).select(TASK_SELECT).single();

  if (error) {
    return { error: error.message };
  }

  // No revalidatePath: the task list updates itself on the client, and
  // re-rendering the whole dashboard on every change made edits slow.
  return { success: true, task: data };
}

/** A task can be completed only when all of its subtasks are completed. */
async function openSubtasksError(
  supabase: Awaited<ReturnType<typeof createClient>>,
  taskId: string,
  status: string
) {
  if (status !== "completed") return null;
  const { count } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", taskId)
    .neq("status", "completed");
  return count && count > 0 ? "יש להשלים קודם את כל תתי המשימות" : null;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();

  const blocked = await openSubtasksError(supabase, taskId, status);
  if (blocked) return { error: blocked };

  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateTask(taskId: string, formData: FormData) {
  const description = (formData.get("description") as string)?.trim();
  const urgency = formData.get("urgency") as string;
  const assignedTo = formData.get("assigned_to") as string;
  const dueDate = (formData.get("due_date") as string) || null;
  const status = formData.get("status") as string;
  const statusNote = (formData.get("status_note") as string) ?? "";
  const nextAction = (formData.get("next_action") as string) ?? "";
  const isPriority = formData.get("is_priority") === "true";

  if (!description) {
    return { error: "יש להזין תיאור למשימה" };
  }

  const supabase = await createClient();

  const blocked = await openSubtasksError(supabase, taskId, status);
  if (blocked) return { error: blocked };

  const { error } = await supabase
    .from("tasks")
    .update({
      description,
      urgency,
      assigned_to: assignedTo,
      due_date: dueDate,
      status,
      status_note: statusNote,
      next_action: nextAction,
      is_priority: isPriority,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Auto-create an urgent task (used by system triggers).
 * Assigns to the first admin profile found.
 */
export async function createAutoTask(description: string, dueDate?: string) {
  const supabase = await createClient();

  // Find first admin to assign to (also used as created_by)
  const { data: admin } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (!admin) return;

  await supabase.from("tasks").insert({
    description,
    urgency: "urgent",
    assigned_to: admin.id,
    created_by: admin.id,
    due_date: dueDate ?? null,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
