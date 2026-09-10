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
  const { error: groupsError } = await supabase.from("camp_groups").insert(groupRows);
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
  // count (their candidates cascade-delete with them), add rows for any missing numbers
  // up to it. Lower-numbered groups (and their candidates) are left untouched.
  const { data: existingGroups } = await supabase
    .from("camp_groups")
    .select("id, group_number")
    .eq("camp_request_id", id);

  const existingNumbers = new Set((existingGroups ?? []).map((g) => g.group_number));

  const toDeleteIds = (existingGroups ?? []).filter((g) => g.group_number > numGroups).map((g) => g.id);
  if (toDeleteIds.length) {
    await supabase.from("camp_groups").delete().in("id", toDeleteIds);
  }

  const toInsert = [];
  for (let n = 1; n <= numGroups; n++) {
    if (!existingNumbers.has(n)) toInsert.push({ camp_request_id: id, group_number: n });
  }
  if (toInsert.length) {
    await supabase.from("camp_groups").insert(toInsert);
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

// Copies a request's own fields (area, date, client, group count, notes) into a new request
// with fresh, empty (no-candidate) groups — for the common case of the same client sending
// another, very similar camp request. The admin edits whatever differs (date/area/etc.) on
// the copy afterwards.
export async function duplicateCampRequest(id: string) {
  const supabase = createAdminClient();
  const { data: original, error: fetchError } = await supabase
    .from("camp_requests")
    .select("client_name, area, camp_date, num_groups, start_time_note, notes")
    .eq("id", id)
    .single();

  if (fetchError || !original) return { error: "בקשה לא נמצאה" };

  return addCampRequest(original);
}

// ----- Group candidates (mirrors the staffing module's add-candidates/confirm-one pattern) -----

export async function addGroupCandidate(groupId: string, instructorId: string) {
  if (!instructorId) return { error: "יש לבחור מדריך/ה" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_group_candidates").insert({
    group_id: groupId,
    instructor_id: instructorId,
  });

  if (error) {
    if (error.code === "23505") return { error: "המדריך/ה כבר מועמד/ת לקבוצה הזו" };
    return { error: "שגיאה בהוספה: " + error.message };
  }
  revalidatePath(PATH);
  return { success: true };
}

// Confirming a candidate is exclusive within its group — a group needs exactly one
// instructor, so confirming one un-confirms any other candidate already confirmed there.
export async function confirmGroupCandidate(candidateId: string) {
  const supabase = createAdminClient();

  const { data: candidate, error: fetchError } = await supabase
    .from("camp_group_candidates")
    .select("id, group_id")
    .eq("id", candidateId)
    .single();

  if (fetchError || !candidate) return { error: "מועמד/ת לא נמצא/ה" };

  await supabase
    .from("camp_group_candidates")
    .update({ is_confirmed: false })
    .eq("group_id", candidate.group_id)
    .neq("id", candidateId);

  const { error } = await supabase
    .from("camp_group_candidates")
    .update({ is_confirmed: true })
    .eq("id", candidateId);

  if (error) return { error: "שגיאה באישור: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function unconfirmGroupCandidate(candidateId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_group_candidates")
    .update({ is_confirmed: false })
    .eq("id", candidateId);
  if (error) return { error: "שגיאה בביטול אישור: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function removeGroupCandidate(candidateId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_group_candidates").delete().eq("id", candidateId);
  if (error) return { error: "שגיאה בהסרה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}
