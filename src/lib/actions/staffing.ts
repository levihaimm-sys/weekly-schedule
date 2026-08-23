"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { regionsMatch } from "@/lib/utils/staffing";

const PATH = "/staffing";

async function recomputeNeedStatus(needId: string) {
  const supabase = createAdminClient();

  const [{ data: need }, { data: assignments }] = await Promise.all([
    supabase.from("staffing_needs").select("lessons_count").eq("id", needId).single(),
    supabase.from("staffing_assignments").select("is_confirmed").eq("need_id", needId),
  ]);

  if (!need) return;

  const confirmedCount = (assignments ?? []).filter((a) => a.is_confirmed).length;
  const status =
    confirmedCount === 0 ? "open" : confirmedCount >= need.lessons_count ? "filled" : "partially_filled";

  await supabase.from("staffing_needs").update({ status }).eq("id", needId);
}

// ----- Availability (instructor side, free-text name) -----

export async function addAvailability(data: {
  instructor_name: string;
  region: string;
  days: (number | null)[];
  time_period: string;
  start_time?: string | null;
  notes?: string | null;
}) {
  const name = data.instructor_name.trim();
  const region = data.region.trim();
  if (!name) return { error: "יש להזין שם מדריך" };
  if (!region) return { error: "יש להזין אזור עבודה" };
  if (!data.days.length) return { error: "יש לבחור לפחות יום אחד" };

  const supabase = createAdminClient();
  const rows = data.days.map((day) => ({
    instructor_name: name,
    region,
    day_of_week: day,
    time_period: data.time_period,
    start_time: data.start_time?.trim() || null,
    notes: data.notes?.trim() || null,
  }));

  const { error } = await supabase.from("staffing_availability").insert(rows);

  if (error) return { error: "שגיאה בהוספה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function updateAvailability(
  id: string,
  data: {
    instructor_name: string;
    region: string;
    day_of_week: number | null;
    time_period: string;
    start_time?: string | null;
    notes?: string | null;
  }
) {
  const name = data.instructor_name.trim();
  const region = data.region.trim();
  if (!name) return { error: "יש להזין שם מדריך" };
  if (!region) return { error: "יש להזין אזור עבודה" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("staffing_availability")
    .update({
      instructor_name: name,
      region,
      day_of_week: data.day_of_week,
      time_period: data.time_period,
      start_time: data.start_time?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteAvailability(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_availability").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

// ----- Needs (client lesson slots side, free-text client name) -----

export async function addNeed(data: {
  client_name: string;
  region?: string | null;
  location_name?: string | null;
  address?: string | null;
  manager_name?: string | null;
  contact_name?: string | null;
  framework?: string | null;
  framework_name?: string | null;
  start_date?: string | null;
  day_of_week?: number | null;
  time_period?: string | null;
  start_time?: string | null;
  field?: string | null;
  lessons_count?: number;
  notes?: string | null;
}) {
  const clientName = data.client_name.trim();
  if (!clientName) return { error: "יש להזין שם לקוח" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_needs").insert({
    client_name: clientName,
    region: data.region?.trim() || null,
    location_name: data.location_name?.trim() || null,
    address: data.address?.trim() || null,
    manager_name: data.manager_name?.trim() || null,
    contact_name: data.contact_name?.trim() || null,
    framework: data.framework?.trim() || null,
    framework_name: data.framework_name?.trim() || null,
    start_date: data.start_date?.trim() || null,
    day_of_week: data.day_of_week ?? null,
    time_period: data.time_period || null,
    start_time: data.start_time?.trim() || null,
    field: data.field?.trim() || null,
    lessons_count: data.lessons_count && data.lessons_count > 0 ? data.lessons_count : 1,
    notes: data.notes?.trim() || null,
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function updateNeed(
  id: string,
  data: {
    client_name: string;
    region?: string | null;
    location_name?: string | null;
    address?: string | null;
    manager_name?: string | null;
    contact_name?: string | null;
    framework?: string | null;
    framework_name?: string | null;
    start_date?: string | null;
    day_of_week?: number | null;
    time_period?: string | null;
    start_time?: string | null;
    field?: string | null;
    lessons_count?: number;
    notes?: string | null;
  }
) {
  const clientName = data.client_name.trim();
  if (!clientName) return { error: "יש להזין שם לקוח" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("staffing_needs")
    .update({
      client_name: clientName,
      region: data.region?.trim() || null,
      location_name: data.location_name?.trim() || null,
      address: data.address?.trim() || null,
      manager_name: data.manager_name?.trim() || null,
      contact_name: data.contact_name?.trim() || null,
      framework: data.framework?.trim() || null,
      framework_name: data.framework_name?.trim() || null,
      start_date: data.start_date?.trim() || null,
      day_of_week: data.day_of_week ?? null,
      time_period: data.time_period || null,
      start_time: data.start_time?.trim() || null,
      field: data.field?.trim() || null,
      lessons_count: data.lessons_count && data.lessons_count > 0 ? data.lessons_count : 1,
      notes: data.notes?.trim() || null,
    })
    .eq("id", id);

  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

interface ImportNeedRow {
  client_name: string;
  region: string | null;
  address: string | null;
  location_name: string | null;
  manager_name: string | null;
  contact_name: string | null;
  lessons_count: number;
  framework: string | null;
  framework_name: string | null;
  field: string | null;
  day_of_week: number | null;
  start_time: string | null;
  start_date: string | null;
  notes: string | null;
  // Not a staffing_needs column — used below to auto-create a confirmed assignment
  // linked to (and consuming) a matching availability slot, if one exists.
  instructor_name: string | null;
}

export async function importNeeds(rows: ImportNeedRow[]) {
  if (!rows.length) return { success: true, inserted: 0, assigned: 0, errors: [] as string[] };

  const supabase = createAdminClient();

  const needsPayload = rows.map(({ instructor_name, ...need }) => need);
  const { data: inserted, error } = await supabase.from("staffing_needs").insert(needsPayload).select("id");

  if (error || !inserted) return { success: false, inserted: 0, assigned: 0, errors: [error?.message ?? "שגיאה בייבוא"] };

  let assigned = 0;

  for (let i = 0; i < inserted.length; i++) {
    const row = rows[i];
    const needId = inserted[i].id;
    const instructorName = row.instructor_name?.trim();
    if (!instructorName) continue;

    const { data: candidateSlots } = await supabase
      .from("staffing_availability")
      .select("id, region, day_of_week")
      .eq("instructor_name", instructorName)
      .eq("status", "available");

    const matchedSlot =
      (candidateSlots ?? []).find(
        (s) =>
          regionsMatch(s.region, row.region) &&
          (row.day_of_week === null || s.day_of_week === null || s.day_of_week === row.day_of_week)
      ) ?? null;

    await supabase.from("staffing_assignments").insert({
      need_id: needId,
      instructor_name: instructorName,
      availability_id: matchedSlot?.id ?? null,
      assigned_day_of_week: row.day_of_week ?? matchedSlot?.day_of_week ?? null,
      is_confirmed: true,
    });

    if (matchedSlot) {
      await supabase.from("staffing_availability").update({ status: "assigned" }).eq("id", matchedSlot.id);
    }

    const status = row.lessons_count <= 1 ? "filled" : "partially_filled";
    await supabase.from("staffing_needs").update({ status }).eq("id", needId);

    assigned++;
  }

  revalidatePath(PATH);
  return { success: true, inserted: rows.length, assigned, errors: [] as string[] };
}

export async function deleteNeed(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_needs").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

// Manual override — bypasses the automatic open/partially_filled/filled computation
// so the admin can force a status directly (e.g. call a lesson "done" early).
export async function updateNeedStatus(id: string, status: "open" | "partially_filled" | "filled") {
  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_needs").update({ status }).eq("id", id);
  if (error) return { error: "שגיאה בעדכון סטטוס: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

// ----- Assignments (matching side) -----

export async function addAssignmentCandidate(data: {
  need_id: string;
  instructor_name: string;
  availability_id?: string | null;
  notes?: string | null;
}) {
  const name = data.instructor_name.trim();
  if (!name) return { error: "יש להזין שם מדריך" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_assignments").insert({
    need_id: data.need_id,
    instructor_name: name,
    availability_id: data.availability_id || null,
    notes: data.notes?.trim() || null,
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function confirmAssignment(id: string, assignedDayOfWeek?: number | null) {
  const supabase = createAdminClient();

  const { data: assignment, error: fetchError } = await supabase
    .from("staffing_assignments")
    .select("id, need_id, availability_id")
    .eq("id", id)
    .single();

  if (fetchError || !assignment) return { error: "שיבוץ לא נמצא" };

  let dayOfWeek = assignedDayOfWeek ?? null;
  if (assignment.availability_id) {
    if (dayOfWeek === null || dayOfWeek === undefined) {
      const { data: availability } = await supabase
        .from("staffing_availability")
        .select("day_of_week")
        .eq("id", assignment.availability_id)
        .single();
      dayOfWeek = availability?.day_of_week ?? null;
    }
    await supabase.from("staffing_availability").update({ status: "assigned" }).eq("id", assignment.availability_id);
  }

  const { error } = await supabase
    .from("staffing_assignments")
    .update({ is_confirmed: true, assigned_day_of_week: dayOfWeek })
    .eq("id", id);

  if (error) return { error: "שגיאה באישור: " + error.message };

  await recomputeNeedStatus(assignment.need_id);
  revalidatePath(PATH);
  return { success: true };
}

export async function unconfirmAssignment(id: string) {
  const supabase = createAdminClient();

  const { data: assignment, error: fetchError } = await supabase
    .from("staffing_assignments")
    .select("id, need_id, availability_id")
    .eq("id", id)
    .single();

  if (fetchError || !assignment) return { error: "שיבוץ לא נמצא" };

  if (assignment.availability_id) {
    await supabase.from("staffing_availability").update({ status: "available" }).eq("id", assignment.availability_id);
  }

  const { error } = await supabase
    .from("staffing_assignments")
    .update({ is_confirmed: false })
    .eq("id", id);

  if (error) return { error: "שגיאה בביטול אישור: " + error.message };

  await recomputeNeedStatus(assignment.need_id);
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteAssignment(id: string) {
  const supabase = createAdminClient();

  const { data: assignment } = await supabase
    .from("staffing_assignments")
    .select("id, need_id, availability_id, is_confirmed")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("staffing_assignments").delete().eq("id", id);
  if (error) return { error: "שגיאה במחיקה: " + error.message };

  if (assignment?.is_confirmed && assignment.availability_id) {
    await supabase.from("staffing_availability").update({ status: "available" }).eq("id", assignment.availability_id);
  }
  if (assignment?.need_id) {
    await recomputeNeedStatus(assignment.need_id);
  }

  revalidatePath(PATH);
  return { success: true };
}
