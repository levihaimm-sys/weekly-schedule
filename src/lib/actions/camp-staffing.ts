"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const PATH = "/camps";

// ----- Needs -----

async function recomputeNeedStatus(needId: string) {
  const supabase = createAdminClient();
  const { data: assignments } = await supabase
    .from("camp_staffing_assignments")
    .select("is_confirmed")
    .eq("need_id", needId);

  const confirmedCount = (assignments ?? []).filter((a) => a.is_confirmed).length;
  const status = confirmedCount > 0 ? "filled" : (assignments ?? []).length > 0 ? "partially_filled" : "open";
  await supabase.from("camp_staffing_needs").update({ status }).eq("id", needId);
}

export async function addCampNeed(data: {
  camp_session_id: string;
  client_name: string;
  area?: string | null;
  camp_date: string;
  num_groups?: number;
  start_time?: string | null;
  field?: string | null;
  framework?: string | null;
  address?: string | null;
  contact_name?: string | null;
  notes?: string | null;
}) {
  const clientName = data.client_name.trim();
  if (!clientName) return { error: "יש להזין שם לקוח" };
  if (!data.camp_date) return { error: "יש להזין תאריך" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_staffing_needs").insert({
    camp_session_id: data.camp_session_id,
    client_name: clientName,
    area: data.area?.trim() || null,
    camp_date: data.camp_date,
    num_groups: data.num_groups && data.num_groups > 0 ? data.num_groups : 1,
    start_time: data.start_time?.trim() || null,
    field: data.field?.trim() || null,
    framework: data.framework?.trim() || null,
    address: data.address?.trim() || null,
    contact_name: data.contact_name?.trim() || null,
    notes: data.notes?.trim() || null,
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function updateCampNeed(
  id: string,
  data: {
    client_name: string;
    area?: string | null;
    camp_date: string;
    num_groups?: number;
    start_time?: string | null;
    field?: string | null;
    framework?: string | null;
    address?: string | null;
    contact_name?: string | null;
    notes?: string | null;
  }
) {
  const clientName = data.client_name.trim();
  if (!clientName) return { error: "יש להזין שם לקוח" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("camp_staffing_needs")
    .update({
      client_name: clientName,
      area: data.area?.trim() || null,
      camp_date: data.camp_date,
      num_groups: data.num_groups && data.num_groups > 0 ? data.num_groups : 1,
      start_time: data.start_time?.trim() || null,
      field: data.field?.trim() || null,
      framework: data.framework?.trim() || null,
      address: data.address?.trim() || null,
      contact_name: data.contact_name?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function updateCampNeedStatus(id: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_staffing_needs").update({ status }).eq("id", id);
  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteCampNeed(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_staffing_needs").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

// ----- Availability -----

export async function addCampAvailability(data: {
  camp_session_id: string;
  instructor_name: string;
  area: string;
  dates: (string | null)[];
  notes?: string | null;
}) {
  const name = data.instructor_name.trim();
  const area = data.area.trim();
  if (!name) return { error: "יש להזין שם מדריך" };
  if (!area) return { error: "יש להזין אזור" };
  if (!data.dates.length) return { error: "יש לבחור לפחות תאריך אחד" };

  const supabase = createAdminClient();
  const rows = data.dates.map((date) => ({
    camp_session_id: data.camp_session_id,
    instructor_name: name,
    area,
    camp_date: date,
    notes: data.notes?.trim() || null,
  }));

  const { error } = await supabase.from("camp_staffing_availability").insert(rows);
  if (error) return { error: "שגיאה בהוספה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function updateCampAvailabilityRowInfo(data: {
  slotIds: string[];
  instructor_name?: string;
  area?: string;
  notes?: string;
}) {
  const update: Record<string, string | null> = {};
  if (data.instructor_name !== undefined) {
    const name = data.instructor_name.trim();
    if (!name) return { error: "יש להזין שם מדריך" };
    update.instructor_name = name;
  }
  if (data.area !== undefined) {
    const area = data.area.trim();
    if (!area) return { error: "יש להזין אזור" };
    update.area = area;
  }
  if (data.notes !== undefined) {
    update.notes = data.notes.trim() || null;
    update.status_updated_at = new Date().toISOString();
  }
  if (Object.keys(update).length === 0) return { success: true };

  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_staffing_availability").update(update).in("id", data.slotIds);
  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteCampAvailability(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_staffing_availability").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

// ----- Assignments -----

export async function addCampAssignment(data: {
  need_id: string;
  instructor_name: string;
  availability_id?: string | null;
}) {
  const name = data.instructor_name.trim();
  if (!name) return { error: "יש להזין שם מדריך" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("camp_staffing_assignments").insert({
    need_id: data.need_id,
    instructor_name: name,
    availability_id: data.availability_id || null,
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };
  await recomputeNeedStatus(data.need_id);
  revalidatePath(PATH);
  return { success: true };
}

export async function confirmCampAssignment(id: string) {
  const supabase = createAdminClient();

  const { data: assignment } = await supabase
    .from("camp_staffing_assignments")
    .select("id, need_id, availability_id")
    .eq("id", id)
    .single();

  if (!assignment) return { error: "שיבוץ לא נמצא" };

  if (assignment.availability_id) {
    await supabase
      .from("camp_staffing_availability")
      .update({ status: "assigned" })
      .eq("id", assignment.availability_id);
  }

  const { error } = await supabase
    .from("camp_staffing_assignments")
    .update({ is_confirmed: true })
    .eq("id", id);

  if (error) return { error: "שגיאה באישור: " + error.message };
  await recomputeNeedStatus(assignment.need_id);
  revalidatePath(PATH);
  return { success: true };
}

export async function unconfirmCampAssignment(id: string) {
  const supabase = createAdminClient();

  const { data: assignment } = await supabase
    .from("camp_staffing_assignments")
    .select("id, need_id, availability_id")
    .eq("id", id)
    .single();

  if (!assignment) return { error: "שיבוץ לא נמצא" };

  if (assignment.availability_id) {
    const { data: stillUsed } = await supabase
      .from("camp_staffing_assignments")
      .select("id")
      .eq("availability_id", assignment.availability_id)
      .eq("is_confirmed", true)
      .neq("id", id)
      .limit(1);
    if (!stillUsed?.length) {
      await supabase
        .from("camp_staffing_availability")
        .update({ status: "available" })
        .eq("id", assignment.availability_id);
    }
  }

  const { error } = await supabase
    .from("camp_staffing_assignments")
    .update({ is_confirmed: false })
    .eq("id", id);

  if (error) return { error: "שגיאה בביטול: " + error.message };
  await recomputeNeedStatus(assignment.need_id);
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteCampAssignment(id: string) {
  const supabase = createAdminClient();

  const { data: assignment } = await supabase
    .from("camp_staffing_assignments")
    .select("id, need_id, availability_id, is_confirmed")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("camp_staffing_assignments").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };

  if (assignment?.is_confirmed && assignment.availability_id) {
    const { data: stillUsed } = await supabase
      .from("camp_staffing_assignments")
      .select("id")
      .eq("availability_id", assignment.availability_id)
      .eq("is_confirmed", true)
      .neq("id", id)
      .limit(1);
    if (!stillUsed?.length) {
      await supabase
        .from("camp_staffing_availability")
        .update({ status: "available" })
        .eq("id", assignment.availability_id);
    }
  }
  if (assignment?.need_id) {
    await recomputeNeedStatus(assignment.need_id);
  }

  revalidatePath(PATH);
  return { success: true };
}
