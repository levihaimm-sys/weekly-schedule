"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { regionsMatch, nameMatch } from "@/lib/utils/staffing";

const PATH = "/staffing";

// A lesson is "filled" as soon as ONE instructor is confirmed for it — קב' is a headcount
// display field (e.g. group/class number), not a "this many instructors required" gate.
// "Open" vs "partially filled" reacts to any assignment at all — placing a candidate (even
// before confirming) is already "assigning" from the admin's point of view.
async function recomputeNeedStatus(needId: string) {
  const supabase = createAdminClient();

  const { data: assignments } = await supabase
    .from("staffing_assignments")
    .select("is_confirmed")
    .eq("need_id", needId);

  const confirmedCount = (assignments ?? []).filter((a) => a.is_confirmed).length;
  const status = confirmedCount > 0 ? "filled" : (assignments ?? []).length > 0 ? "partially_filled" : "open";

  await supabase.from("staffing_needs").update({ status }).eq("id", needId);
}

// A slot can legitimately back several confirmed lessons the same day (one instructor
// teaching multiple groups back-to-back), so it should only flip back to "available" once
// NO other confirmed assignment still references it.
async function releaseAvailabilityIfUnused(
  supabase: ReturnType<typeof createAdminClient>,
  availabilityId: string,
  excludeAssignmentId: string
) {
  const { data: stillUsed } = await supabase
    .from("staffing_assignments")
    .select("id")
    .eq("availability_id", availabilityId)
    .eq("is_confirmed", true)
    .neq("id", excludeAssignmentId)
    .limit(1);

  if (!stillUsed?.length) {
    await supabase.from("staffing_availability").update({ status: "available" }).eq("id", availabilityId);
  }
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

// Edits an entire (instructor, region) row at once: renames/moves all its slots and
// reconciles the day checkboxes — adding rows for newly-checked days, deleting rows for
// unchecked ones, and updating the ones that stay (in case name/region/time also changed).
export async function updateAvailabilityGroup(data: {
  slotIds: string[];
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

  const { data: existingSlots, error: fetchError } = await supabase
    .from("staffing_availability")
    .select("id, day_of_week")
    .in("id", data.slotIds);

  if (fetchError) return { error: "שגיאה בעדכון: " + fetchError.message };

  const existingDays = new Set((existingSlots ?? []).map((s) => s.day_of_week));
  const newDays = new Set(data.days);

  const toDeleteIds = (existingSlots ?? []).filter((s) => !newDays.has(s.day_of_week)).map((s) => s.id);
  if (toDeleteIds.length) {
    await supabase.from("staffing_availability").delete().in("id", toDeleteIds);
  }

  const toUpdateIds = (existingSlots ?? []).filter((s) => newDays.has(s.day_of_week)).map((s) => s.id);
  if (toUpdateIds.length) {
    await supabase
      .from("staffing_availability")
      .update({
        instructor_name: name,
        region,
        time_period: data.time_period,
        start_time: data.start_time?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .in("id", toUpdateIds);
  }

  const toInsertDays = data.days.filter((d) => !existingDays.has(d));
  if (toInsertDays.length) {
    const rows = toInsertDays.map((day) => ({
      instructor_name: name,
      region,
      day_of_week: day,
      time_period: data.time_period,
      start_time: data.start_time?.trim() || null,
      notes: data.notes?.trim() || null,
    }));
    const { error } = await supabase.from("staffing_availability").insert(rows);
    if (error) return { error: "שגיאה בהוספה: " + error.message };
  }

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

// Re-uploading the same CSV should correct existing lessons, not duplicate them, so each
// row is matched to an existing need by (client, location, framework name, field) before
// deciding whether to insert or update.
export async function importNeeds(rows: ImportNeedRow[]) {
  if (!rows.length) return { success: true, inserted: 0, updated: 0, assigned: 0, errors: [] as string[] };

  const supabase = createAdminClient();

  let insertedCount = 0;
  let updatedCount = 0;
  let assigned = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const { instructor_name, ...need } = row;

    let matchQuery = supabase.from("staffing_needs").select("id").eq("client_name", need.client_name);
    matchQuery = need.location_name
      ? matchQuery.eq("location_name", need.location_name)
      : matchQuery.is("location_name", null);
    matchQuery = need.framework_name
      ? matchQuery.eq("framework_name", need.framework_name)
      : matchQuery.is("framework_name", null);
    matchQuery = need.field ? matchQuery.eq("field", need.field) : matchQuery.is("field", null);
    const { data: existingMatches } = await matchQuery.limit(1);
    const existing = existingMatches?.[0] ?? null;

    let needId: string;
    if (existing) {
      const { error } = await supabase.from("staffing_needs").update(need).eq("id", existing.id);
      if (error) {
        errors.push(`${need.client_name}: ${error.message}`);
        continue;
      }
      needId = existing.id;
      updatedCount++;
    } else {
      const { data: newNeed, error } = await supabase.from("staffing_needs").insert(need).select("id").single();
      if (error || !newNeed) {
        errors.push(`${need.client_name}: ${error?.message ?? "שגיאה"}`);
        continue;
      }
      needId = newNeed.id;
      insertedCount++;
    }

    const instructorName = instructor_name?.trim();
    if (instructorName) {
      const { data: existingAssignment } = await supabase
        .from("staffing_assignments")
        .select("id")
        .eq("need_id", needId)
        .eq("instructor_name", instructorName)
        .limit(1);

      if (!existingAssignment?.length) {
        const { data: candidateSlots } = await supabase
          .from("staffing_availability")
          .select("id, instructor_name, region, day_of_week")
          .eq("status", "available");

        const matchedSlot =
          (candidateSlots ?? []).find(
            (s) =>
              nameMatch(s.instructor_name, instructorName) &&
              regionsMatch(s.region, need.region) &&
              (need.day_of_week === null || s.day_of_week === null || s.day_of_week === need.day_of_week)
          ) ?? null;

        await supabase.from("staffing_assignments").insert({
          need_id: needId,
          instructor_name: instructorName,
          availability_id: matchedSlot?.id ?? null,
          assigned_day_of_week: need.day_of_week ?? matchedSlot?.day_of_week ?? null,
          is_confirmed: true,
        });

        if (matchedSlot) {
          await supabase.from("staffing_availability").update({ status: "assigned" }).eq("id", matchedSlot.id);
        }

        assigned++;
      }
    }

    await recomputeNeedStatus(needId);
  }

  revalidatePath(PATH);
  return { success: true, inserted: insertedCount, updated: updatedCount, assigned, errors };
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

  await recomputeNeedStatus(data.need_id);
  revalidatePath(PATH);
  return { success: true };
}

export async function confirmAssignment(id: string, assignedDayOfWeek?: number | null) {
  const supabase = createAdminClient();

  const { data: assignment, error: fetchError } = await supabase
    .from("staffing_assignments")
    .select("id, need_id, availability_id, instructor_name")
    .eq("id", id)
    .single();

  if (fetchError || !assignment) return { error: "שיבוץ לא נמצא" };

  let dayOfWeek = assignedDayOfWeek ?? null;
  let availabilityId = assignment.availability_id;

  if (availabilityId) {
    if (dayOfWeek === null || dayOfWeek === undefined) {
      const { data: availability } = await supabase
        .from("staffing_availability")
        .select("day_of_week")
        .eq("id", availabilityId)
        .single();
      dayOfWeek = availability?.day_of_week ?? null;
    }
  } else if (dayOfWeek !== null && dayOfWeek !== undefined) {
    // No slot was linked when this assignment was created (e.g. typed in manually and the
    // need's region text didn't match the instructor's availability region) — look one up now
    // by instructor + day so their availability still gets marked as taken once confirmed.
    // Not filtered by status: the same slot may already back another lesson that day.
    const { data: candidateSlots } = await supabase.from("staffing_availability").select("id, instructor_name, day_of_week");

    const nameMatches = (candidateSlots ?? []).filter((s) => nameMatch(s.instructor_name, assignment.instructor_name));

    const matchedSlot =
      nameMatches.find((s) => s.day_of_week === dayOfWeek) ?? nameMatches.find((s) => s.day_of_week === null) ?? null;

    if (matchedSlot) {
      availabilityId = matchedSlot.id;
      await supabase.from("staffing_assignments").update({ availability_id: availabilityId }).eq("id", id);
    }
  }

  if (availabilityId) {
    await supabase.from("staffing_availability").update({ status: "assigned" }).eq("id", availabilityId);
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
    await releaseAvailabilityIfUnused(supabase, assignment.availability_id, id);
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
    await releaseAvailabilityIfUnused(supabase, assignment.availability_id, id);
  }
  if (assignment?.need_id) {
    await recomputeNeedStatus(assignment.need_id);
  }

  revalidatePath(PATH);
  return { success: true };
}
