"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const description = (formData.get("description") as string)?.trim();
  const urgency = formData.get("urgency") as string;
  const assignedTo = formData.get("assigned_to") as string;
  const dueDate = (formData.get("due_date") as string) || null;

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

  const { error } = await supabase.from("tasks").insert({
    description,
    urgency: urgency || "normal",
    assigned_to: assignedTo,
    created_by: user.id,
    due_date: dueDate,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(taskId: string, formData: FormData) {
  const description = (formData.get("description") as string)?.trim();
  const urgency = formData.get("urgency") as string;
  const assignedTo = formData.get("assigned_to") as string;
  const dueDate = (formData.get("due_date") as string) || null;
  const status = formData.get("status") as string;

  if (!description) {
    return { error: "יש להזין תיאור למשימה" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      description,
      urgency,
      assigned_to: assignedTo,
      due_date: dueDate,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}
