"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { startOfWeek, addDays, format } from "date-fns";
import { regionsMatch, nameMatch, parseFreeTextDate } from "@/lib/utils/staffing";

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

// Lightweight inline-edit action for the availability table: updates only the fields the
// user actually touched (name / region / status notes) across every slot in the row, without
// disturbing per-slot day/time data the way updateAvailabilityGroup does.
export async function updateAvailabilityRowInfo(data: {
  slotIds: string[];
  instructor_name?: string;
  region?: string;
  notes?: string;
}) {
  const update: Record<string, string | null> = {};
  if (data.instructor_name !== undefined) {
    const name = data.instructor_name.trim();
    if (!name) return { error: "יש להזין שם מדריך" };
    update.instructor_name = name;
  }
  if (data.region !== undefined) {
    const region = data.region.trim();
    if (!region) return { error: "יש להזין אזור עבודה" };
    update.region = region;
  }
  if (data.notes !== undefined) {
    update.notes = data.notes.trim() || null;
    update.status_updated_at = new Date().toISOString();
  }
  if (Object.keys(update).length === 0) return { success: true };

  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_availability").update(update).in("id", data.slotIds);
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

// ----- Potential instructors (focused pre-recruitment list) -----

export async function addPotentialInstructor(data: {
  full_name: string;
  phone?: string | null;
  region?: string | null;
  field?: string | null;
  offered_amount?: number | null;
}) {
  const fullName = data.full_name.trim();
  if (!fullName) return { error: "יש להזין שם" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_potential_instructors").insert({
    full_name: fullName,
    phone: data.phone?.trim() || null,
    region: data.region?.trim() || null,
    field: data.field?.trim() || null,
    offered_amount: data.offered_amount ?? null,
  });

  if (error) return { error: "שגיאה בהוספה: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

// Lightweight inline-edit action, matching updateAvailabilityRowInfo's shape: only updates the
// fields actually touched. Editing last_contact_note stamps last_contact_at with the current
// time so the table can show "when was this person last contacted".
export async function updatePotentialInstructor(
  id: string,
  data: {
    full_name?: string;
    phone?: string | null;
    region?: string | null;
    field?: string | null;
    offered_amount?: number | null;
    notes?: string | null;
    last_contact_note?: string | null;
  }
) {
  const update: Record<string, string | number | null> = {};
  if (data.full_name !== undefined) {
    const fullName = data.full_name.trim();
    if (!fullName) return { error: "יש להזין שם" };
    update.full_name = fullName;
  }
  if (data.phone !== undefined) update.phone = data.phone?.trim() || null;
  if (data.region !== undefined) update.region = data.region?.trim() || null;
  if (data.field !== undefined) update.field = data.field?.trim() || null;
  if (data.offered_amount !== undefined) update.offered_amount = data.offered_amount;
  if (data.notes !== undefined) update.notes = data.notes?.trim() || null;
  if (data.last_contact_note !== undefined) {
    update.last_contact_note = data.last_contact_note?.trim() || null;
    update.last_contact_at = new Date().toISOString();
  }
  if (Object.keys(update).length === 0) return { success: true };

  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_potential_instructors").update(update).eq("id", id);
  if (error) return { error: "שגיאה בעדכון: " + error.message };
  revalidatePath(PATH);
  return { success: true };
}

export async function deletePotentialInstructor(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_potential_instructors").delete().eq("id", id);
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
  lesson_duration?: number | null;
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
    lesson_duration: data.lesson_duration && data.lesson_duration > 0 ? data.lesson_duration : 40,
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
    lesson_duration?: number | null;
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
      lesson_duration: data.lesson_duration && data.lesson_duration > 0 ? data.lesson_duration : 40,
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

// Bulk inline-edit for the matching table's multi-select bar: only updates the fields the
// admin actually filled in, leaving the rest of each selected need untouched.
export async function bulkUpdateNeeds(
  ids: string[],
  data: {
    start_date?: string;
    contact_name?: string;
    field?: string;
    lessons_count?: number;
  }
) {
  if (ids.length === 0) return { success: true };

  const update: Record<string, string | number | null> = {};
  if (data.start_date !== undefined) update.start_date = data.start_date.trim() || null;
  if (data.contact_name !== undefined) update.contact_name = data.contact_name.trim() || null;
  if (data.field !== undefined) update.field = data.field.trim() || null;
  if (data.lessons_count !== undefined) update.lessons_count = data.lessons_count > 0 ? data.lessons_count : 1;
  if (Object.keys(update).length === 0) return { success: true };

  const supabase = createAdminClient();
  const { error } = await supabase.from("staffing_needs").update(update).in("id", ids);
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
  lesson_duration: number | null;
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
    matchQuery = need.start_time
      ? matchQuery.eq("start_time", need.start_time)
      : matchQuery.is("start_time", null);
    matchQuery = need.day_of_week !== null && need.day_of_week !== undefined
      ? matchQuery.eq("day_of_week", need.day_of_week)
      : matchQuery.is("day_of_week", null);
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
          // Only record a day here when the need itself has none — otherwise this would freeze
          // a copy of need.day_of_week that goes stale the next time the need's day is corrected.
          assigned_day_of_week: need.day_of_week === null || need.day_of_week === undefined ? matchedSlot?.day_of_week ?? null : null,
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
// so the admin can force a status directly (e.g. call a lesson "done" early, or mark a
// tentative placement as a confirmed "safe" assignment).
export async function updateNeedStatus(
  id: string,
  status: "open" | "partially_filled" | "safe_assignment" | "filled"
) {
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

// Clears the "already moved to the fixed schedule" marker on an assignment so it can be
// converted again — needed when the admin deleted the resulting recurring_schedule/lesson
// rows by hand (e.g. after a mistaken conversion) and now wants to redo it.
export async function resetAssignmentConversion(id: string) {
  const { error } = await createAdminClient()
    .from("staffing_assignments")
    .update({ converted_at: null })
    .eq("id", id);

  if (error) return { error: "שגיאה באיפוס: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

// ----- Converting confirmed staffing lessons into the real production schedule -----

interface ConversionIssue {
  client_name: string;
  field: string | null;
  framework_name: string | null;
  reasons: string[];
}

// Grabs each selected need's not-yet-converted confirmed assignments, resolves the free-text
// instructor/location names against the real tables, and — only for the ones that fully
// resolve — creates a recurring_schedule row plus its concrete lesson instances. Anything that
// can't be resolved is reported back instead of guessed at (per need, one bad group shouldn't
// block the others under the same need from converting).
export async function convertAssignmentsToSchedule(needIds: string[]) {
  if (!needIds.length) return { converted: 0, issues: [] as ConversionIssue[] };

  const supabase = createAdminClient();

  const [{ data: needs }, { data: assignments }, { data: instructors }, { data: locations }] = await Promise.all([
    supabase
      .from("staffing_needs")
      .select(
        "id, client_name, region, location_name, framework_name, field, day_of_week, start_time, start_date, " +
          "address, manager_name, contact_name, framework, lesson_duration, lessons_count, notes"
      )
      .in("id", needIds),
    supabase
      .from("staffing_assignments")
      .select("id, need_id, instructor_name, assigned_day_of_week, is_confirmed, converted_at")
      .in("need_id", needIds)
      .eq("is_confirmed", true)
      .is("converted_at", null),
    supabase.from("instructors").select("id, full_name"),
    supabase.from("locations").select("id, name, city"),
  ]);

  // Mutable — new sites (new cities/frameworks not yet in the locations module)
  // get auto-created during the loop below and reused for later assignments.
  const locationList = locations ? [...locations] : [];

  const issues: ConversionIssue[] = [];
  let converted = 0;

  const today = new Date();
  const eightWeeksFromToday = addDays(today, 8 * 7);

  for (const need of needs ?? []) {
    const needAssignments = (assignments ?? []).filter((a) => a.need_id === need.id);

    if (needAssignments.length === 0) {
      issues.push({
        client_name: need.client_name,
        field: need.field,
        framework_name: need.framework_name,
        reasons: ["אין מדריך/ה מאושר/ת שטרם הועבר/ה"],
      });
      continue;
    }

    for (const assignment of needAssignments) {
      const reasons: string[] = [];

      // need.day_of_week is the live, editable value (corrected via re-import or manual edit);
      // assigned_day_of_week only matters as a fallback for "flexible" needs where the day was
      // chosen per-instructor at confirm time and the need itself has no fixed day.
      const dayOfWeek = need.day_of_week ?? assignment.assigned_day_of_week;
      if (dayOfWeek === null || dayOfWeek === undefined) reasons.push("לא נקבע יום בשבוע");

      const startTimeRaw = need.start_time;
      if (!startTimeRaw) reasons.push("לא הוגדרה שעת התחלה");

      let instructorId: string | null = null;
      const exactInstructor = (instructors ?? []).find(
        (i) => i.full_name.trim() === assignment.instructor_name.trim()
      );
      if (exactInstructor) {
        instructorId = exactInstructor.id;
      } else {
        const fuzzy = (instructors ?? []).filter((i) => nameMatch(i.full_name, assignment.instructor_name));
        if (fuzzy.length === 1) {
          instructorId = fuzzy[0].id;
        } else if (fuzzy.length > 1) {
          reasons.push(`נמצאו כמה מדריכים מתאימים ל-"${assignment.instructor_name}", יש לתקן את השם לשם המלא`);
        } else {
          reasons.push(`המדריך/ה "${assignment.instructor_name}" לא קיים/ת ברשימת המדריכים`);
        }
      }

      const city = (need.region ?? "").trim();
      const candidateNames = [need.location_name, need.framework_name].filter(
        (n): n is string => !!n && n.trim() !== ""
      );
      let locationId: string | null = null;
      for (const candidateName of candidateNames) {
        const match = locationList.find((l) => l.city.trim() === city && l.name.trim() === candidateName.trim());
        if (match) {
          locationId = match.id;
          break;
        }
      }
      if (!locationId && candidateNames.length > 0 && city) {
        const newLocationName = candidateNames[0];
        const { data: newLoc, error: locationError } = await supabase
          .from("locations")
          .insert({ name: newLocationName, city })
          .select("id, name, city")
          .single();
        if (newLoc && !locationError) {
          locationId = newLoc.id;
          locationList.push(newLoc);
        }
      }
      if (!locationId) {
        const tried = candidateNames.length > 0 ? candidateNames.map((n) => `"${n}"`).join(" / ") : "(לא הוגדר שם מסגרת/מתחם)";
        reasons.push(
          `לא ניתן היה ליצור מיקום ב-${city || "?"}: נבדק ${tried} — יש להוסיף את המיקום ידנית במודול המיקומים או לתקן את השם`
        );
      }

      if (reasons.length > 0) {
        issues.push({ client_name: need.client_name, field: need.field, framework_name: need.framework_name, reasons });
        continue;
      }

      const startDateParsed = parseFreeTextDate(need.start_date) ?? today;
      const dow = dayOfWeek as number;
      const dayDiff = (dow - startDateParsed.getDay() + 7) % 7;
      const firstOccurrence = addDays(startDateParsed, dayDiff);
      const normalizedStartTime = startTimeRaw!.length === 5 ? `${startTimeRaw}:00` : startTimeRaw!;

      const { data: recurringRow, error: recurringError } = await supabase
        .from("recurring_schedule")
        .insert({
          instructor_id: instructorId,
          location_id: locationId,
          day_of_week: dow,
          start_time: normalizedStartTime,
          group_name: need.framework_name || need.field || null,
          // Not shown on the fixed/weekly schedule screens yet, but kept so this context
          // isn't lost once the staffing need is matched off — ready for whenever a field
          // is added to display it.
          client_name: need.client_name,
          address: need.address,
          manager_name: need.manager_name,
          contact_name: need.contact_name,
          framework: need.framework,
          framework_name: need.framework_name,
          field: need.field,
          lesson_duration: need.lesson_duration,
          lessons_count: need.lessons_count,
          notes: need.notes,
        })
        .select("id")
        .single();

      if (recurringError || !recurringRow) {
        issues.push({
          client_name: need.client_name,
          field: need.field,
          framework_name: need.framework_name,
          reasons: [`שגיאה ביצירת הלוח הקבוע: ${recurringError?.message ?? "שגיאה לא ידועה"}`],
        });
        continue;
      }

      const horizon = eightWeeksFromToday > addDays(firstOccurrence, 8 * 7) ? eightWeeksFromToday : addDays(firstOccurrence, 8 * 7);
      const lessonRows: {
        recurring_item_id: string;
        location_id: string;
        instructor_id: string;
        lesson_date: string;
        start_time: string;
        status: string;
      }[] = [];
      let weekStart = startOfWeek(firstOccurrence, { weekStartsOn: 0 });
      while (weekStart <= horizon) {
        const lessonDate = addDays(weekStart, dow);
        if (lessonDate >= firstOccurrence) {
          lessonRows.push({
            recurring_item_id: recurringRow.id,
            location_id: locationId,
            instructor_id: instructorId,
            lesson_date: format(lessonDate, "yyyy-MM-dd"),
            start_time: normalizedStartTime,
            status: "scheduled",
          });
        }
        weekStart = addDays(weekStart, 7);
      }

      for (let i = 0; i < lessonRows.length; i += 100) {
        const batch = lessonRows.slice(i, i + 100);
        await supabase
          .from("lessons")
          .upsert(batch, { onConflict: "instructor_id,location_id,lesson_date,start_time", ignoreDuplicates: true });
      }

      await supabase.from("staffing_assignments").update({ converted_at: new Date().toISOString() }).eq("id", assignment.id);
      converted++;
    }
  }

  revalidatePath(PATH);
  revalidatePath("/schedule/weekly");
  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");

  return { converted, issues };
}
