"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const PATH = "/camps";

interface CampRequestInput {
  client_name?: string | null;
  area: string;
  camp_date: string;
  num_groups: number;
  start_time_note?: string | null;
  notes?: string | null;
}

export async function addCampRequest(data: CampRequestInput) {
  const area = data.area.trim();
  if (!area) return { error: "יש להזין אזור/מיקום" };
  if (!data.camp_date) return { error: "יש להזין תאריך" };
  const numGroups = data.num_groups && data.num_groups > 0 ? Math.floor(data.num_groups) : 1;

  const supabase = createAdminClient();
  const { data: request, error } = await supabase
    .from("camp_requests")
    .insert({
      client_name: data.client_name?.trim() || null,
      area,
      camp_date: data.camp_date,
      num_groups: numGroups,
      start_time_note: data.start_time_note?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !request) return { error: "שגיאה בהוספה: " + (error?.message ?? "") };

  const groupRows = Array.from({ length: numGroups }, (_, i) => ({
    camp_request_id: request.id,
    group_number: i + 1,
  }));
  const { error: groupsError } = await supabase.from("camp_group_assignments").insert(groupRows);
  if (groupsError) return { error: "שגיאה ביצירת קבוצות: " + groupsError.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function updateCampRequest(id: string, data: CampRequestInput) {
  const area = data.area.trim();
  if (!area) return { error: "יש להזין אזור/מיקום" };
  if (!data.camp_date) return { error: "יש להזין תאריך" };
  const numGroups = data.num_groups && data.num_groups > 0 ? Math.floor(data.num_groups) : 1;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_requests")
    .update({
      client_name: data.client_name?.trim() || null,
      area,
      camp_date: data.camp_date,
      num_groups: numGroups,
      start_time_note: data.start_time_note?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: "שגיאה בעדכון: " + error.message };

  // Reconcile group rows to the new group count: drop groups numbered above the new
  // count, add rows for any missing numbers up to it. Lower-numbered groups (and any
  // instructor already assigned to them) are left untouched.
  const { data: existingGroups } = await supabase
    .from("camp_group_assignments")
    .select("id, group_number")
    .eq("camp_request_id", id);

  const existingNumbers = new Set((existingGroups ?? []).map((g) => g.group_number));

  const toDeleteIds = (existingGroups ?? []).filter((g) => g.group_number > numGroups).map((g) => g.id);
  if (toDeleteIds.length) {
    await supabase.from("camp_group_assignments").delete().in("id", toDeleteIds);
  }

  const toInsert = [];
  for (let n = 1; n <= numGroups; n++) {
    if (!existingNumbers.has(n)) toInsert.push({ camp_request_id: id, group_number: n });
  }
  if (toInsert.length) {
    await supabase.from("camp_group_assignments").insert(toInsert);
  }

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteCampRequest(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_requests").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function assignGroupInstructor(groupId: string, instructorId: string | null) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_group_assignments")
    .update({ instructor_id: instructorId })
    .eq("id", groupId);
  if (error) return { error: "שגיאה בשיבוץ: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function updateGroupNotes(groupId: string, notes: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_group_assignments")
    .update({ notes: notes.trim() || null })
    .eq("id", groupId);
  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}
