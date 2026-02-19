import { createClient } from "@/lib/supabase/server";
import type { TaskWithProfiles } from "@/types/database";

export async function getAllTasks(filters?: {
  status?: string;
  assignedTo?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(
      `
      id,
      description,
      urgency,
      assigned_to,
      created_by,
      due_date,
      status,
      created_at,
      updated_at,
      assignee:profiles!tasks_assigned_to_fkey(id, display_name),
      creator:profiles!tasks_created_by_fkey(id, display_name)
    `
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.assignedTo && filters.assignedTo !== "all") {
    query = query.eq("assigned_to", filters.assignedTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return (data ?? []) as unknown as TaskWithProfiles[];
}

export async function getAdminProfiles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("role", "admin")
    .order("display_name");

  if (error) {
    console.error("Error fetching admin profiles:", error);
    return [];
  }

  return data ?? [];
}
