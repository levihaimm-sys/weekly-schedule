"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const PATH = "/camps";

interface CampRequestInput {
  client_name?: string | null;
  coordinator_name?: string | null;
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
  const { error } = await supabase.from("camp_requests").insert({
    client_name: data.client_name?.trim() || null,
    coordinator_name: data.coordinator_name?.trim() || null,
    area,
    camp_date: data.camp_date,
    num_groups: numGroups,
    start_time_note: data.start_time_note?.trim() || null,
    notes: data.notes?.trim() || null,
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };
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
      coordinator_name: data.coordinator_name?.trim() || null,
      area,
      camp_date: data.camp_date,
      num_groups: numGroups,
      start_time_note: data.start_time_note?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: "שגיאה בעדכון: " + error.message };
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
// with no candidates — for the common case of the same client sending another, very similar
// camp request. The admin edits whatever differs (date/area/etc.) on the copy afterwards.
export async function duplicateCampRequest(id: string) {
  const supabase = createAdminClient();
  const { data: original, error: fetchError } = await supabase
    .from("camp_requests")
    .select("client_name, coordinator_name, area, camp_date, num_groups, start_time_note, notes")
    .eq("id", id)
    .single();

  if (fetchError || !original) return { error: "בקשה לא נמצאה" };

  return addCampRequest(original);
}

// ----- Candidates (per camp-day, not per group — mirrors the staffing module's
// add-candidates/confirm pattern, except confirming here isn't exclusive: a day typically
// needs several confirmed instructors, one for each group.) -----

export async function addRequestCandidate(campRequestId: string, instructorId: string) {
  if (!instructorId) return { error: "יש לבחור מדריך/ה" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_request_candidates").insert({
    camp_request_id: campRequestId,
    instructor_id: instructorId,
  });

  if (error) {
    if (error.code === "23505") return { error: "המדריך/ה כבר מועמד/ת ליום הזה" };
    return { error: "שגיאה בהוספה: " + error.message };
  }
  revalidatePath(PATH);
  return { success: true };
}

export async function confirmRequestCandidate(candidateId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_request_candidates")
    .update({ is_confirmed: true })
    .eq("id", candidateId);
  if (error) return { error: "שגיאה באישור: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function unconfirmRequestCandidate(candidateId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_request_candidates")
    .update({ is_confirmed: false })
    .eq("id", candidateId);
  if (error) return { error: "שגיאה בביטול אישור: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function removeRequestCandidate(candidateId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_request_candidates").delete().eq("id", candidateId);
  if (error) return { error: "שגיאה בהסרה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}
