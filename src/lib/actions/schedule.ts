"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { startOfWeek, addDays, format } from "date-fns";
import { getTodayInIsrael, isHoliday, addMinutesToTimeString } from "@/lib/utils/date";
import { CLIENT_CITIES } from "@/lib/utils/constants";
import { parseLessonCsv } from "@/lib/utils/lesson-import-csv";
import { nameMatch, parseFreeTextDate } from "@/lib/utils/staffing";


/**
 * Replicates the master schedule (recurring_schedule) into concrete
 * lesson instances for a given week. Idempotent - skips if lessons
 * already exist for that week.
 *
 * IMPORTANT - About Duplicate Prevention:
 * - The weekly schedule is SUPPOSED to repeat (same lesson every week)
 * - Example: Monday 10:00 lesson should exist in week 1, week 2, week 3, etc.
 * - BUT: The same lesson should NOT appear twice in the SAME day!
 *
 * Protection against duplicates:
 * 1. This function checks if ANY lessons exist in target week (count > 0)
 * 2. Database constraint "unique_lesson_schedule" prevents duplicate lessons on same date
 *    (same instructor + location + date + time cannot be inserted twice)
 *
 * If you see duplicate lessons on the SAME date, it's a bug - check:
 * - Is this function being called multiple times accidentally?
 * - Is the constraint "unique_lesson_schedule" properly set up?
 */
export async function replicateWeekSchedule(targetDate?: string) {
  const supabase = await createClient();

  // Calculate the week boundaries (Sunday - Friday, Israel work week)
  const baseDate = targetDate ? new Date(targetDate) : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 5); // Friday

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  // Check if lessons already exist for this week
  const { count } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .gte("lesson_date", weekStartStr)
    .lte("lesson_date", weekEndStr);

  if (count && count > 0) {
    return {
      error: `כבר קיימים ${count} שיעורים לשבוע ${weekStartStr}. לא נוצרו שיעורים חדשים.`,
      existing: count,
    };
  }

  // Fetch master schedule
  const { data: masterSchedule, error: fetchError } = await supabase
    .from("recurring_schedule")
    .select("id, location_id, instructor_id, day_of_week, start_time, group_name");

  if (fetchError || !masterSchedule) {
    return { error: "שגיאה בטעינת הלוח הקבוע: " + fetchError?.message };
  }

  // Create lesson instances (skip holiday dates)
  const lessons = masterSchedule
    .map((entry) => {
      const lessonDate = addDays(weekStart, entry.day_of_week);
      return {
        recurring_item_id: entry.id,
        location_id: entry.location_id,
        instructor_id: entry.instructor_id,
        lesson_date: format(lessonDate, "yyyy-MM-dd"),
        start_time: entry.start_time,
        status: "scheduled",
      };
    })
    .filter((lesson) => !isHoliday(lesson.lesson_date));

  // Insert in batches
  let totalInserted = 0;
  for (let i = 0; i < lessons.length; i += 100) {
    const batch = lessons.slice(i, i + 100);
    const { data, error } = await supabase
      .from("lessons")
      .insert(batch)
      .select();

    if (error) {
      return {
        error: `שגיאה בהוספת שיעורים (batch ${i}): ${error.message}`,
        inserted: totalInserted,
      };
    }
    totalInserted += data?.length ?? 0;
  }

  revalidatePath("/dashboard");
  revalidatePath("/schedule/weekly");
  revalidatePath("/my-schedule");

  return {
    success: true,
    message: `נוצרו ${totalInserted} שיעורים לשבוע ${weekStartStr}`,
    inserted: totalInserted,
    weekStart: weekStartStr,
  };
}

/**
 * Update a single lesson (one-time change)
 */
export async function updateLesson(
  lessonId: string,
  updates: {
    instructor_id?: string | null;
    substitute_instructor_id?: string;
    status?: string;
    change_notes?: string;
    start_time?: string;
    lesson_date?: string;
  }
) {
  const supabase = await createClient();

  // If this lesson had a pending instructor request, mark it as handled
  const { data: lesson } = await supabase
    .from("lessons")
    .select("instructor_absence_request, instructor_request_handled")
    .eq("id", lessonId)
    .single();

  const finalUpdates: Record<string, any> = { ...updates };
  // Mark as one-time change so the sync mechanism won't reset this lesson
  finalUpdates.is_one_time_change = true;
  if (lesson?.instructor_absence_request && !lesson.instructor_request_handled) {
    finalUpdates.instructor_request_handled = true;
  }

  const { error } = await supabase
    .from("lessons")
    .update(finalUpdates)
    .eq("id", lessonId);

  if (error) {
    return { error: "שגיאה בעדכון השיעור: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/schedule/weekly");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Update the master schedule (permanent change)
 */
export async function updateRecurringSchedule(
  recurringId: string,
  updates: {
    instructor_id?: string | null;
    start_time?: string;
    location_id?: string;
    day_of_week?: number;
    group_name?: string | null;
    address?: string | null;
    client_name?: string | null;
    contact_name?: string | null;
    manager_name?: string | null;
    manager_phone?: string | null;
    framework?: string | null;
    framework_name?: string | null;
    field?: string | null;
    lesson_duration?: number | null;
    lessons_count?: number | null;
    notes?: string | null;
  }
) {
  const supabase = createAdminClient();

  // Build clean updates: include null values (to clear fields), skip undefined
  const cleanUpdates: Record<string, string | number | null> = {};
  if (updates.instructor_id !== undefined) cleanUpdates.instructor_id = updates.instructor_id;
  if (updates.start_time) cleanUpdates.start_time = updates.start_time;
  if (updates.location_id) cleanUpdates.location_id = updates.location_id;
  if (updates.day_of_week !== undefined) cleanUpdates.day_of_week = updates.day_of_week;
  if (updates.group_name !== undefined) cleanUpdates.group_name = updates.group_name;
  if (updates.address !== undefined) cleanUpdates.address = updates.address;
  if (updates.client_name !== undefined) cleanUpdates.client_name = updates.client_name;
  if (updates.contact_name !== undefined) cleanUpdates.contact_name = updates.contact_name;
  if (updates.manager_name !== undefined) cleanUpdates.manager_name = updates.manager_name;
  if (updates.manager_phone !== undefined) cleanUpdates.manager_phone = updates.manager_phone;
  if (updates.framework !== undefined) cleanUpdates.framework = updates.framework;
  if (updates.framework_name !== undefined) cleanUpdates.framework_name = updates.framework_name;
  if (updates.field !== undefined) cleanUpdates.field = updates.field;
  if (updates.lesson_duration !== undefined) cleanUpdates.lesson_duration = updates.lesson_duration;
  if (updates.lessons_count !== undefined) cleanUpdates.lessons_count = updates.lessons_count;
  if (updates.notes !== undefined) cleanUpdates.notes = updates.notes;

  if (Object.keys(cleanUpdates).length === 0) {
    return { error: "אין שינויים לשמור" };
  }

  const { error, data } = await supabase
    .from("recurring_schedule")
    .update(cleanUpdates)
    .eq("id", recurringId)
    .select();

  if (error) {
    return { error: "שגיאה בעדכון הלוח הקבוע: " + error.message };
  }

  if (!data || data.length === 0) {
    return { error: "לא נמצא שיעור קבוע עם ID: " + recurringId };
  }

  // --- Propagate changes to future lesson instances (from next week onward) ---
  const today = getTodayInIsrael();
  const nextSunday = format(
    startOfWeek(addDays(new Date(today), 7), { weekStartsOn: 0 }),
    "yyyy-MM-dd"
  );

  const updatedItem = data[0];
  const dayChanged = updates.day_of_week !== undefined;

  if (dayChanged) {
    // Day changed: existing lesson dates are wrong — delete and recreate

    // Find the horizon: max lesson_date for this recurring item
    const { data: lastLesson } = await supabase
      .from("lessons")
      .select("lesson_date")
      .eq("recurring_item_id", recurringId)
      .gte("lesson_date", nextSunday)
      .order("lesson_date", { ascending: false })
      .limit(1);

    // Delete all future lessons for this recurring item (skip one-time changes)
    const { error: delError } = await supabase
      .from("lessons")
      .delete()
      .eq("recurring_item_id", recurringId)
      .gte("lesson_date", nextSunday)
      .or("is_one_time_change.is.null,is_one_time_change.eq.false");

    if (delError) {
      return { error: "שגיאה במחיקת שיעורים עתידיים: " + delError.message };
    }

    // Recreate lessons with the new day_of_week up to the horizon
    if (lastLesson && lastLesson.length > 0) {
      const horizon = new Date(lastLesson[0].lesson_date);
      const newLessons: Array<{
        recurring_item_id: string;
        location_id: string;
        instructor_id: string | null;
        lesson_date: string;
        start_time: string;
        status: string;
      }> = [];

      let weekStart = startOfWeek(new Date(nextSunday), { weekStartsOn: 0 });
      while (weekStart <= horizon) {
        const lessonDate = addDays(weekStart, updatedItem.day_of_week);
        newLessons.push({
          recurring_item_id: updatedItem.id,
          location_id: updatedItem.location_id,
          instructor_id: updatedItem.instructor_id,
          lesson_date: format(lessonDate, "yyyy-MM-dd"),
          start_time: updatedItem.start_time,
          status: "scheduled",
        });
        weekStart = addDays(weekStart, 7);
      }

      if (newLessons.length > 0) {
        const { error: insertError } = await supabase
          .from("lessons")
          .insert(newLessons);

        if (insertError) {
          return { error: "שגיאה ביצירת שיעורים חדשים: " + insertError.message };
        }
      }
    }
  } else {
    // Simple change (instructor, time, location): update future lessons in-place
    const lessonUpdates: Record<string, string | null> = {};
    if (cleanUpdates.instructor_id !== undefined)
      lessonUpdates.instructor_id = cleanUpdates.instructor_id as string | null;
    if (cleanUpdates.start_time)
      lessonUpdates.start_time = cleanUpdates.start_time as string;
    if (cleanUpdates.location_id)
      lessonUpdates.location_id = cleanUpdates.location_id as string;

    if (Object.keys(lessonUpdates).length > 0) {
      const { error: lessonsError } = await supabase
        .from("lessons")
        .update(lessonUpdates)
        .eq("recurring_item_id", recurringId)
        .gte("lesson_date", nextSunday)
        .or("is_one_time_change.is.null,is_one_time_change.eq.false");

      if (lessonsError) {
        return { error: "שגיאה בעדכון שיעורים עתידיים: " + lessonsError.message };
      }
    }
  }

  revalidatePath("/schedule");
  revalidatePath("/schedule/weekly");
  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Apply a permanent change: updates the recurring schedule AND
 * all future lesson instances linked to it (from today onward).
 */
export async function applyPermanentChange(
  recurringId: string,
  _currentLessonId: string,
  updates: {
    instructor_id?: string | null;
    start_time?: string;
  }
) {
  const supabase = createAdminClient();

  // Build clean updates: include null values (to clear fields), skip undefined
  const cleanUpdates: Record<string, string | null> = {};
  if (updates.instructor_id !== undefined) cleanUpdates.instructor_id = updates.instructor_id;
  if (updates.start_time) cleanUpdates.start_time = updates.start_time;

  if (Object.keys(cleanUpdates).length === 0) {
    return { error: "אין שינויים לשמור" };
  }

  // 1. Update the master schedule
  const { error: recurringError } = await supabase
    .from("recurring_schedule")
    .update(cleanUpdates)
    .eq("id", recurringId);

  if (recurringError) {
    return { error: "שגיאה בעדכון הלוח הקבוע: " + recurringError.message };
  }

  // 2. Update all future lessons from this recurring item (today + forward)
  const today = getTodayInIsrael();
  const { error: lessonsError } = await supabase
    .from("lessons")
    .update(cleanUpdates)
    .eq("recurring_item_id", recurringId)
    .gte("lesson_date", today);

  if (lessonsError) {
    return { error: "שגיאה בעדכון שיעורים עתידיים: " + lessonsError.message };
  }

  // Clear absence flags on affected lessons — new instructor makes them normal again
  await supabase
    .from("lessons")
    .update({ instructor_absence_request: false, instructor_request_handled: false })
    .eq("recurring_item_id", recurringId)
    .gte("lesson_date", today)
    .eq("instructor_absence_request", true);

  revalidatePath("/schedule");
  revalidatePath("/schedule/weekly");
  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Delete a recurring schedule item and all future lessons created from it.
 * IMPORTANT: This is a permanent change that affects all future weeks.
 * Use deleteLesson() for one-time changes to a single lesson.
 */
export async function deleteRecurringScheduleItem(recurringItemId: string) {
  const supabase = createAdminClient();
  const today = getTodayInIsrael();

  // Delete all future lessons created from this recurring item
  const { error: deleteLessonsError } = await supabase
    .from("lessons")
    .delete()
    .eq("recurring_item_id", recurringItemId)
    .gte("lesson_date", today);

  if (deleteLessonsError) {
    return {
      error: "שגיאה במחיקת שיעורים עתידיים: " + deleteLessonsError.message,
    };
  }

  // Delete the recurring schedule item
  const { error: deleteRecurringError } = await supabase
    .from("recurring_schedule")
    .delete()
    .eq("id", recurringItemId);

  if (deleteRecurringError) {
    return {
      error: "שגיאה במחיקת לוח קבוע: " + deleteRecurringError.message,
    };
  }

  revalidatePath("/schedule");
  revalidatePath("/schedule/weekly");
  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Delete multiple recurring schedule items and all their future lessons at once
 * (multi-select bulk delete on the fixed-schedule screen).
 */
export async function bulkDeleteRecurringScheduleItems(recurringItemIds: string[]) {
  const supabase = createAdminClient();
  const today = getTodayInIsrael();

  const { error: deleteLessonsError } = await supabase
    .from("lessons")
    .delete()
    .in("recurring_item_id", recurringItemIds)
    .gte("lesson_date", today);

  if (deleteLessonsError) {
    return { error: "שגיאה במחיקת שיעורים עתידיים: " + deleteLessonsError.message };
  }

  const { error: deleteRecurringError } = await supabase
    .from("recurring_schedule")
    .delete()
    .in("id", recurringItemIds);

  if (deleteRecurringError) {
    return { error: "שגיאה במחיקת לוח קבוע: " + deleteRecurringError.message };
  }

  revalidatePath("/schedule");
  revalidatePath("/schedule/weekly");
  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Sync future lessons with the recurring schedule.
 * Resets any future lesson (from next week onward) that drifted from
 * its recurring schedule entry back to the master values.
 * Lessons marked with is_one_time_change=true are preserved.
 *
 * Uses admin client to bypass RLS and ensure reliability.
 */
export async function syncFutureWeeksWithRecurring() {
  const admin = createAdminClient();
  const today = getTodayInIsrael();
  const nextSunday = format(
    startOfWeek(addDays(new Date(today), 7), { weekStartsOn: 0 }),
    "yyyy-MM-dd"
  );

  // 1. Get all future lessons (from next week onward) that have a recurring_item_id
  const { data: futureLessons, error: fetchError } = await admin
    .from("lessons")
    .select("id, recurring_item_id, instructor_id, start_time, lesson_date, location_id, is_one_time_change")
    .not("recurring_item_id", "is", null)
    .gte("lesson_date", nextSunday);

  if (fetchError || !futureLessons || futureLessons.length === 0) return;

  // 2. Get the recurring schedule for comparison
  const { data: recurring } = await admin
    .from("recurring_schedule")
    .select("id, instructor_id, start_time, day_of_week, location_id");

  if (!recurring || recurring.length === 0) return;

  // Build lookup: recurring_id → master values
  const recurringMap = new Map(
    recurring.map((r) => [r.id, {
      instructor_id: r.instructor_id,
      start_time: r.start_time,
      day_of_week: r.day_of_week,
      location_id: r.location_id,
    }])
  );

  // 3. Find lessons that differ from their recurring entry and need reset
  // Skip lessons marked as one-time changes (intentional overrides)
  const resetByRecurring = new Map<string, string[]>();
  const wrongDayLessons: Array<{ id: string; recurring_item_id: string; lesson_date: string }> = [];

  for (const lesson of futureLessons) {
    // Skip lessons explicitly marked as one-time changes
    if (lesson.is_one_time_change) continue;

    const master = recurringMap.get(lesson.recurring_item_id!);
    if (!master) continue;

    // Check if the lesson is on the wrong day of the week
    const lessonDayOfWeek = new Date(lesson.lesson_date + "T00:00:00").getDay();
    if (lessonDayOfWeek !== master.day_of_week) {
      wrongDayLessons.push({
        id: lesson.id,
        recurring_item_id: lesson.recurring_item_id!,
        lesson_date: lesson.lesson_date,
      });
      continue; // Will be handled separately (delete + recreate)
    }

    const instructorDiffers = lesson.instructor_id !== master.instructor_id;
    const timeDiffers =
      lesson.start_time?.slice(0, 5) !== master.start_time?.slice(0, 5);

    if (instructorDiffers || timeDiffers) {
      const rid = lesson.recurring_item_id!;
      if (!resetByRecurring.has(rid)) resetByRecurring.set(rid, []);
      resetByRecurring.get(rid)!.push(lesson.id);
    }
  }

  // 4a. Fix lessons on the wrong day: delete and recreate with correct date
  if (wrongDayLessons.length > 0) {
    const wrongIds = wrongDayLessons.map((l) => l.id);
    await admin.from("lessons").delete().in("id", wrongIds);

    // Recreate each lesson with the correct date (same week, correct day_of_week)
    const recreated = wrongDayLessons
      .map((lesson) => {
        const master = recurringMap.get(lesson.recurring_item_id)!;
        const lessonWeekStart = startOfWeek(new Date(lesson.lesson_date + "T00:00:00"), { weekStartsOn: 0 });
        const correctDate = addDays(lessonWeekStart, master.day_of_week);
        return {
          recurring_item_id: lesson.recurring_item_id,
          location_id: master.location_id,
          instructor_id: master.instructor_id,
          lesson_date: format(correctDate, "yyyy-MM-dd"),
          start_time: master.start_time,
          status: "scheduled",
        };
      })
      .filter((lesson) => !isHoliday(lesson.lesson_date));

    if (recreated.length > 0) {
      await admin.from("lessons").insert(recreated);
    }
  }

  // 4b. Reset each drifted lesson (correct day, wrong instructor/time) to master values
  for (const [recurringId, lessonIds] of resetByRecurring) {
    const master = recurringMap.get(recurringId);
    if (!master) continue;

    await admin
      .from("lessons")
      .update({
        instructor_id: master.instructor_id,
        start_time: master.start_time,
      })
      .in("id", lessonIds);
  }

  // 5. Clean up: clear is_one_time_change for past lessons (no longer relevant)
  const thisWeekStart = format(
    startOfWeek(new Date(today), { weekStartsOn: 0 }),
    "yyyy-MM-dd"
  );
  await admin
    .from("lessons")
    .update({ is_one_time_change: false })
    .eq("is_one_time_change", true)
    .lt("lesson_date", thisWeekStart);
}

/**
 * Ensure lessons exist for the next N weeks (auto-replication).
 * Can be called from server components (skipRevalidate=true) or server actions.
 *
 * Also syncs future lessons with the recurring schedule to ensure
 * temporary changes don't persist beyond their intended week.
 */
export async function ensureFutureWeeks(weeksAhead = 8, skipRevalidate = false) {
  const supabase = await createClient();

  const now = new Date();
  let created = 0;

  for (let w = 0; w < weeksAhead; w++) {
    const targetDate = addDays(now, w * 7);
    const wkStart = startOfWeek(targetDate, { weekStartsOn: 0 });
    const wkEnd = addDays(wkStart, 5);
    const wkStartStr = format(wkStart, "yyyy-MM-dd");
    const wkEndStr = format(wkEnd, "yyyy-MM-dd");

    const { count } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .gte("lesson_date", wkStartStr)
      .lte("lesson_date", wkEndStr);

    if (count && count > 0) continue;

    const { data: masterSchedule } = await supabase
      .from("recurring_schedule")
      .select("id, location_id, instructor_id, day_of_week, start_time");

    if (!masterSchedule || masterSchedule.length === 0) continue;

    const lessons = masterSchedule
      .map((entry) => ({
        recurring_item_id: entry.id,
        location_id: entry.location_id,
        instructor_id: entry.instructor_id,
        lesson_date: format(addDays(wkStart, entry.day_of_week), "yyyy-MM-dd"),
        start_time: entry.start_time,
        status: "scheduled",
      }))
      .filter((lesson) => !isHoliday(lesson.lesson_date));

    if (lessons.length === 0) continue;

    const { data } = await supabase.from("lessons").insert(lessons).select();
    created += data?.length ?? 0;
  }

  // Sync future weeks with recurring schedule (reset drifted lessons)
  await syncFutureWeeksWithRecurring();

  if (created > 0 && !skipRevalidate) {
    revalidatePath("/schedule/weekly");
    revalidatePath("/dashboard");
    revalidatePath("/my-schedule");
  }

  return { success: true, created };
}

/**
 * Instructor submits a request (absence, lateness, or other message).
 */
export async function submitInstructorRequest(
  lessonId: string,
  requestType: "absence" | "lateness" | "other",
  notes?: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lessons")
    .update({
      instructor_absence_request: true,
      instructor_request_type: requestType,
      instructor_notes: notes || null,
    })
    .eq("id", lessonId);

  if (error) {
    return { error: "שגיאה בשליחת הבקשה: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");
  revalidatePath("/confirm-lessons");

  return { success: true };
}

/**
 * Create a one-time manual lesson (not linked to recurring schedule).
 */
export async function createManualLesson(data: {
  instructor_id?: string | null;
  location_id: string;
  lesson_date: string;
  start_time: string;
  status?: string;
  change_notes?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("lessons").insert({
    instructor_id: data.instructor_id || null,
    location_id: data.location_id,
    lesson_date: data.lesson_date,
    start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
    status: data.status ?? "scheduled",
    change_notes: data.change_notes || null,
    is_one_time_change: true,
    recurring_item_id: null,
  });

  if (error) {
    return { error: "שגיאה ביצירת השיעור: " + error.message };
  }

  revalidatePath("/schedule/weekly");
  revalidatePath("/schedule/weekly-overview");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Create a new location (gan) on the fly.
 */
export async function createLocation(data: {
  name: string;
  city: string;
}) {
  const supabase = await createClient();

  const { data: loc, error } = await supabase
    .from("locations")
    .insert({ name: data.name.trim(), city: data.city.trim() })
    .select("id")
    .single();

  if (error) {
    return { error: "שגיאה ביצירת המיקום: " + error.message };
  }

  revalidatePath("/schedule/weekly");
  revalidatePath("/locations");

  return { success: true, id: loc.id as string };
}

const CITY_ALIASES: Record<string, string> = {
  "פתח תקווה": "פת",
};

function normalizeCity(city: string): string {
  const clean = city.replace(/["']/g, "").trim();
  return CITY_ALIASES[clean] ?? clean;
}

function parseDate(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dmy = /^(\d{1,2})[\/.\\-](\d{1,2})[\/.\\-](\d{2,4})$/.exec(raw);
  if (!dmy) return null;
  const year = dmy[3].length === 2 ? 2000 + parseInt(dmy[3]) : parseInt(dmy[3]);
  return `${year}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
}

// One-time lessons import — same CSV format as the staffing-needs import (needs-csv.tsx),
// but each row lands directly in `lessons` as a one-off occurrence rather than a
// recurring_schedule master row. Fields that lessons has no column for (address, manager,
// contact, framework, field) are folded into change_notes so the data isn't lost.
export async function bulkImportLessons(csvText: string) {
  const supabase = await createClient();

  const { rows: csvRows, skipped: skippedNoClient } = parseLessonCsv(csvText);

  if (csvRows.length === 0) {
    return {
      error:
        "לא נמצאו שורות תקינות בקובץ. יש לוודא שיש כותרות בעברית (לקוח, עיר, מתחם, תאריך התחלה, שעת התחלה וכו') ושבכל שורה יש לקוח, עיר או מתחם.",
    };
  }

  const { data: allLocations } = await supabase
    .from("locations")
    .select("id, name, city");
  const { data: allInstructors } = await supabase
    .from("instructors")
    .select("id, full_name")
    .in("status", ["active", "substitute"]);

  // mutable maps — auto-created locations get added during the loop.
  // Keyed by city+name to avoid cross-city name collisions (e.g. "גן כרכום"
  // exists in both ראש העין and פת); name-only map is a fallback for rows
  // that don't carry a city.
  const locationMapByCityName = new Map(
    (allLocations ?? []).map((l) => [`${(l.city ?? "").trim()}||${l.name.trim()}`, l.id])
  );
  const locationMapByNameOnly = new Map(
    (allLocations ?? []).map((l) => [l.name.trim(), l.id])
  );
  const instructorMap = new Map(
    (allInstructors ?? []).map((i) => [i.full_name.trim(), i.id])
  );

  const rows: {
    instructor_id: string | null;
    location_id: string;
    lesson_date: string;
    start_time: string;
    status: string;
    change_notes: string | null;
    is_one_time_change: boolean;
    recurring_item_id: null;
  }[] = [];
  const errors: string[] = [];

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const rowLabel = `שורה ${i + 2} (${row.client_name})`;

    const gardenName = row.location_name || row.client_name;
    const cityName = normalizeCity(row.city ?? "");

    // Find or auto-create location. When the row carries a city, match/create
    // by city+name; only fall back to name-only matching for rows that have
    // no city column at all.
    let locationId: string | undefined = cityName
      ? locationMapByCityName.get(`${cityName}||${gardenName}`)
      : locationMapByNameOnly.get(gardenName);
    if (!locationId) {
      const { data: newLoc, error: locErr } = await supabase
        .from("locations")
        .insert({ name: gardenName, city: cityName })
        .select("id")
        .single();
      if (locErr || !newLoc) {
        errors.push(`${rowLabel}: שגיאה ביצירת מיקום "${gardenName}": ${locErr?.message}`);
        continue;
      }
      locationId = newLoc.id as string;
      locationMapByCityName.set(`${cityName}||${gardenName}`, locationId);
      locationMapByNameOnly.set(gardenName, locationId);
    }

    let instructorId: string | null = null;
    const instructorName = row.instructor_name?.trim();
    if (instructorName) {
      instructorId = instructorMap.get(instructorName) ?? null;
      if (!instructorId) {
        errors.push(`${rowLabel}: מדריך/ה לא נמצא/ה "${instructorName}"`);
        continue;
      }
    }

    const dateVal = parseDate(row.start_date ?? "");
    if (!dateVal) {
      errors.push(`${rowLabel}: תאריך התחלה לא תקין "${row.start_date ?? ""}"`);
      continue;
    }

    const timeVal = row.start_time ?? "";
    if (!timeVal || !/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeVal)) {
      errors.push(`${rowLabel}: שעת התחלה לא תקינה "${timeVal}"`);
      continue;
    }

    const startTime = timeVal.length <= 5 ? `${timeVal.padStart(5, "0")}:00` : timeVal;

    const extraNotes = [
      row.address ? `כתובת: ${row.address}` : null,
      row.manager_name ? `גננת/רכזת: ${row.manager_name}` : null,
      row.contact_name ? `איש קשר: ${row.contact_name}` : null,
      row.framework || row.framework_name
        ? `מסגרת: ${[row.framework, row.framework_name].filter(Boolean).join(" - ")}`
        : null,
      row.field ? `חוג: ${row.field}` : null,
    ].filter((v): v is string => !!v);
    const changeNotes = [row.notes, ...extraNotes].filter(Boolean).join(" · ") || null;

    const lessonsCount = row.group_count > 1 ? row.group_count : 1;
    if (lessonsCount > 1 && !row.lesson_duration) {
      errors.push(`${rowLabel}: יש ${lessonsCount} שיעורים (קב') אך לא הוגדר משך שיעור`);
      continue;
    }

    for (let slot = 0; slot < lessonsCount; slot++) {
      const slotStartTime =
        slot === 0 ? startTime : addMinutesToTimeString(startTime, slot * row.lesson_duration);
      rows.push({
        instructor_id: instructorId,
        location_id: locationId,
        lesson_date: dateVal,
        start_time: slotStartTime,
        status: "scheduled",
        change_notes: changeNotes,
        is_one_time_change: true,
        recurring_item_id: null,
      });
    }
  }

  if (rows.length === 0) {
    return { error: "אין שורות תקינות לייבוא", details: errors };
  }

  // Pre-filter duplicates by checking existing lessons for the same dates
  const uniqueDates = [...new Set(rows.map((r) => r.lesson_date))];
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("instructor_id, location_id, lesson_date, start_time")
    .in("lesson_date", uniqueDates);

  const existingKeys = new Set(
    (existingLessons ?? []).map(
      (e) => `${e.instructor_id}|${e.location_id}|${e.lesson_date}|${e.start_time}`
    )
  );

  const newRows = rows.filter(
    (r) => !existingKeys.has(`${r.instructor_id}|${r.location_id}|${r.lesson_date}|${r.start_time}`)
  );
  const skippedDuplicates = rows.length - newRows.length;

  const BATCH_SIZE = 100;
  let inserted = 0;
  for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
    const batch = newRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("lessons").insert(batch);
    if (error) {
      errors.push(`שגיאת הכנסה בבאצ׳ ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  revalidatePath("/schedule/weekly");
  revalidatePath("/schedule/weekly-overview");
  revalidatePath("/schedule/weekly-table");
  revalidatePath("/dashboard");

  return {
    success: true,
    inserted,
    skipped: skippedNoClient + skippedDuplicates,
    details: errors.length > 0 ? errors : undefined,
  };
}

// Permanent-schedule import — same CSV format, but each row becomes a recurring_schedule
// master row (like matching a staffing need to an instructor does) plus its concrete weekly
// lesson instances going forward. Unlike the one-time import, an instructor is required here
// since recurring_schedule rows always belong to one.
export async function bulkImportRecurringSchedule(csvText: string) {
  const supabase = createAdminClient();

  const { rows: csvRows, skipped: skippedNoClient } = parseLessonCsv(csvText);

  if (csvRows.length === 0) {
    return {
      error:
        "לא נמצאו שורות תקינות בקובץ. יש לוודא שיש כותרות בעברית (לקוח, עיר, מתחם, יום, שעת התחלה, מדריך/ה משובץ/ת וכו') ושבכל שורה יש לקוח, עיר או מתחם.",
    };
  }

  const [{ data: instructorRows }, { data: locationRows }, { data: recurringRows }] = await Promise.all([
    supabase.from("instructors").select("id, full_name").in("status", ["active", "substitute"]),
    supabase.from("locations").select("id, name, city"),
    supabase.from("recurring_schedule").select("instructor_id, location_id, day_of_week, start_time"),
  ]);

  const instructorList = instructorRows ?? [];
  // mutable — new sites (new cities/frameworks not yet in the locations module) get
  // auto-created during the loop below and reused for later rows.
  const locationList = locationRows ? [...locationRows] : [];
  const existingKeys = new Set(
    (recurringRows ?? []).map((r) => `${r.instructor_id}|${r.location_id}|${r.day_of_week}|${r.start_time}`)
  );

  const today = new Date();
  const eightWeeksFromToday = addDays(today, 8 * 7);

  let created = 0;
  let skippedDuplicates = 0;
  const errors: string[] = [];

  for (const row of csvRows) {
    const reasons: string[] = [];

    if (row.day_of_week === null) reasons.push('לא זוהה יום תקין (יש להשתמש בשם יום, למשל "חמישי")');
    if (!row.start_time) reasons.push("לא הוגדרה שעת התחלה");

    const instructorName = row.instructor_name?.trim();
    let instructorId: string | null = null;
    if (!instructorName) {
      reasons.push("לא הוגדר/ה מדריך/ה — לא ניתן להוסיף ללוח הקבוע בלי מדריך/ה משובץ/ת");
    } else {
      const exact = instructorList.find((inst) => inst.full_name.trim() === instructorName);
      if (exact) {
        instructorId = exact.id;
      } else {
        const fuzzy = instructorList.filter((inst) => nameMatch(inst.full_name, instructorName));
        if (fuzzy.length === 1) {
          instructorId = fuzzy[0].id;
        } else if (fuzzy.length > 1) {
          reasons.push(`נמצאו כמה מדריכים מתאימים ל-"${instructorName}", יש לתקן את השם לשם המלא`);
        } else {
          reasons.push(`המדריך/ה "${instructorName}" לא נמצא/ה ברשימת המדריכים הפעילים`);
        }
      }
    }

    const city = normalizeCity(row.city ?? "");
    const candidateNames = [row.location_name, row.client_name].filter(
      (n): n is string => !!n && n.trim() !== ""
    );
    let locationId: string | null = null;
    for (const candidateName of candidateNames) {
      const match = locationList.find((l) => (l.city ?? "").trim() === city && l.name.trim() === candidateName.trim());
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
      reasons.push(city ? `לא ניתן היה ליצור/למצוא מיקום ב-${city}` : "לא הוגדרה עיר, לא ניתן ליצור מיקום");
    }

    const lessonsCount = row.group_count > 1 ? row.group_count : 1;
    if (lessonsCount > 1 && !row.lesson_duration) {
      reasons.push("יש כמה שיעורים (קב') אך לא הוגדר משך שיעור, לא ניתן לחשב את שעות ההתחלה הנוספות");
    }

    if (reasons.length > 0) {
      errors.push(`${row.client_name}: ${reasons.join("; ")}`);
      continue;
    }

    const startDateParsed = parseFreeTextDate(row.start_date) ?? today;
    const dow = row.day_of_week as number;
    const dayDiff = (dow - startDateParsed.getDay() + 7) % 7;
    const firstOccurrence = addDays(startDateParsed, dayDiff);
    const normalizedStartTime = row.start_time!.length === 5 ? `${row.start_time}:00` : row.start_time!;
    const horizon =
      eightWeeksFromToday > addDays(firstOccurrence, 8 * 7) ? eightWeeksFromToday : addDays(firstOccurrence, 8 * 7);

    let rowErrorMessage: string | null = null;
    for (let slot = 0; slot < lessonsCount; slot++) {
      const slotStartTime =
        slot === 0 ? normalizedStartTime : addMinutesToTimeString(normalizedStartTime, slot * row.lesson_duration);

      const key = `${instructorId}|${locationId}|${dow}|${slotStartTime}`;
      if (existingKeys.has(key)) {
        skippedDuplicates++;
        continue;
      }

      const { data: recurringRow, error: recurringError } = await supabase
        .from("recurring_schedule")
        .insert({
          instructor_id: instructorId,
          location_id: locationId,
          day_of_week: dow,
          start_time: slotStartTime,
          group_name: row.framework_name || row.field || null,
          client_name: row.client_name,
          address: row.address,
          manager_name: row.manager_name,
          contact_name: row.contact_name,
          framework: row.framework,
          framework_name: row.framework_name,
          field: row.field,
          lesson_duration: row.lesson_duration,
          lessons_count: row.group_count,
          notes: row.notes,
        })
        .select("id")
        .single();

      if (recurringError || !recurringRow) {
        rowErrorMessage = recurringError?.message ?? "שגיאה לא ידועה";
        break;
      }
      existingKeys.add(key);

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
            location_id: locationId!,
            instructor_id: instructorId!,
            lesson_date: format(lessonDate, "yyyy-MM-dd"),
            start_time: slotStartTime,
            status: "scheduled",
          });
        }
        weekStart = addDays(weekStart, 7);
      }

      for (let b = 0; b < lessonRows.length; b += 100) {
        const batch = lessonRows.slice(b, b + 100);
        await supabase
          .from("lessons")
          .upsert(batch, { onConflict: "instructor_id,location_id,lesson_date,start_time", ignoreDuplicates: true });
      }

      created++;
    }

    if (rowErrorMessage) {
      errors.push(`${row.client_name}: שגיאה ביצירת הלוח הקבוע: ${rowErrorMessage}`);
    }
  }

  revalidatePath("/schedule");
  revalidatePath("/schedule/weekly");
  revalidatePath("/schedule/weekly-table");
  revalidatePath("/schedule/weekly-overview");
  revalidatePath("/dashboard");

  return {
    success: true,
    created,
    skipped: skippedNoClient + skippedDuplicates,
    details: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Mark a schedule change as "seen" (dismiss from active view).
 */
export async function markChangeAsSeen(lessonId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_change_seen")
    .upsert({ lesson_id: lessonId }, { onConflict: "lesson_id" });

  if (error) {
    return { error: "שגיאה בסימון שינוי: " + error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Unmark a schedule change as "seen" (restore to active view).
 */
export async function unmarkChangeAsSeen(lessonId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_change_seen")
    .delete()
    .eq("lesson_id", lessonId);

  if (error) {
    return { error: "שגיאה בביטול סימון: " + error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Bulk update multiple lessons at once (for multi-select actions).
 */
export async function bulkDeleteLessons(lessonIds: string[]) {
  const supabase = await createClient();

  const { error } = await supabase.from("lessons").delete().in("id", lessonIds);

  if (error) {
    return { error: "שגיאה במחיקת שיעורים: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/schedule/weekly");
  revalidatePath("/my-schedule");

  return { success: true };
}

export async function bulkUpdateLessons(
  lessonIds: string[],
  updates: {
    instructor_id?: string | null;
    status?: string;
    change_notes?: string;
    location_id?: string;
    start_time?: string;
    lesson_date?: string;
  }
) {
  const supabase = await createClient();

  const finalUpdates: Record<string, any> = { ...updates, is_one_time_change: true };

  // Reassigning the instructor or moving the lesson to a different day resolves
  // a pending absence — clear the flags so it no longer shows as an absence.
  if (updates.instructor_id !== undefined || updates.lesson_date !== undefined) {
    finalUpdates.instructor_absence_request = false;
    finalUpdates.instructor_request_handled = false;
  }

  const { error } = await supabase
    .from("lessons")
    .update(finalUpdates)
    .in("id", lessonIds);

  if (error) {
    return { error: "שגיאה בעדכון שיעורים: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/schedule/weekly");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Bulk permanent change: updates the recurring schedule rows behind the given
 * recurring_item_ids AND all their future lesson instances (today onward).
 * Mirrors applyPermanentChange but for multiple recurring items sharing the
 * same instructor/time update in one multi-select action.
 */
export async function bulkApplyPermanentChange(
  recurringItemIds: string[],
  updates: {
    instructor_id?: string | null;
    start_time?: string;
    manager_name?: string | null;
    day_of_week?: number;
  }
) {
  const supabase = createAdminClient();
  const uniqueIds = Array.from(new Set(recurringItemIds));

  if (uniqueIds.length === 0) {
    return { error: "לא נבחרו שיעורים מהלוח הקבוע" };
  }

  const cleanUpdates: Record<string, string | number | null> = {};
  if (updates.instructor_id !== undefined) cleanUpdates.instructor_id = updates.instructor_id;
  if (updates.start_time) cleanUpdates.start_time = updates.start_time;
  if (updates.manager_name !== undefined) cleanUpdates.manager_name = updates.manager_name;
  if (updates.day_of_week !== undefined) cleanUpdates.day_of_week = updates.day_of_week;

  if (Object.keys(cleanUpdates).length === 0) {
    return { error: "אין שינויים לשמור" };
  }

  const { error: recurringError } = await supabase
    .from("recurring_schedule")
    .update(cleanUpdates)
    .in("id", uniqueIds);

  if (recurringError) {
    return { error: "שגיאה בעדכון הלוח הקבוע: " + recurringError.message };
  }

  const today = getTodayInIsrael();

  if (updates.day_of_week !== undefined) {
    // Day changed: existing future lesson dates fall on the old day of week, so — same as the
    // single-item path in updateRecurringSchedule() — delete and recreate them on the new day,
    // per item since each keeps its own instructor/time/location.
    const { data: items, error: itemsError } = await supabase
      .from("recurring_schedule")
      .select("id, location_id, instructor_id, start_time, day_of_week")
      .in("id", uniqueIds);

    if (itemsError) {
      return { error: "שגיאה בקריאת הלוח הקבוע: " + itemsError.message };
    }

    for (const item of items ?? []) {
      const { data: lastLesson } = await supabase
        .from("lessons")
        .select("lesson_date")
        .eq("recurring_item_id", item.id)
        .gte("lesson_date", today)
        .order("lesson_date", { ascending: false })
        .limit(1);

      const { error: delError } = await supabase
        .from("lessons")
        .delete()
        .eq("recurring_item_id", item.id)
        .gte("lesson_date", today)
        .or("is_one_time_change.is.null,is_one_time_change.eq.false");

      if (delError) {
        return { error: "שגיאה במחיקת שיעורים עתידיים: " + delError.message };
      }

      if (lastLesson && lastLesson.length > 0) {
        const horizon = new Date(lastLesson[0].lesson_date);
        const newLessons: Array<{
          recurring_item_id: string;
          location_id: string;
          instructor_id: string | null;
          lesson_date: string;
          start_time: string;
          status: string;
        }> = [];

        let weekStart = startOfWeek(new Date(today), { weekStartsOn: 0 });
        while (weekStart <= horizon) {
          const lessonDate = addDays(weekStart, item.day_of_week);
          if (format(lessonDate, "yyyy-MM-dd") >= today) {
            newLessons.push({
              recurring_item_id: item.id,
              location_id: item.location_id,
              instructor_id:
                cleanUpdates.instructor_id !== undefined
                  ? (cleanUpdates.instructor_id as string | null)
                  : item.instructor_id,
              lesson_date: format(lessonDate, "yyyy-MM-dd"),
              start_time: cleanUpdates.start_time ? (cleanUpdates.start_time as string) : item.start_time,
              status: "scheduled",
            });
          }
          weekStart = addDays(weekStart, 7);
        }

        if (newLessons.length > 0) {
          const { error: insertError } = await supabase.from("lessons").insert(newLessons);
          if (insertError) {
            return { error: "שגיאה ביצירת שיעורים חדשים: " + insertError.message };
          }
        }
      }
    }
  } else {
    const lessonUpdates: Record<string, string | null> = {};
    if (cleanUpdates.instructor_id !== undefined) lessonUpdates.instructor_id = cleanUpdates.instructor_id as string | null;
    if (cleanUpdates.start_time) lessonUpdates.start_time = cleanUpdates.start_time as string;

    if (Object.keys(lessonUpdates).length > 0) {
      const { error: lessonsError } = await supabase
        .from("lessons")
        .update(lessonUpdates)
        .in("recurring_item_id", uniqueIds)
        .gte("lesson_date", today);

      if (lessonsError) {
        return { error: "שגיאה בעדכון שיעורים עתידיים: " + lessonsError.message };
      }
    }

    await supabase
      .from("lessons")
      .update({ instructor_absence_request: false, instructor_request_handled: false })
      .in("recurring_item_id", uniqueIds)
      .gte("lesson_date", today)
      .eq("instructor_absence_request", true);
  }

  revalidatePath("/schedule");
  revalidatePath("/schedule/weekly");
  revalidatePath("/dashboard");
  revalidatePath("/my-schedule");

  return { success: true };
}

/**
 * Admin clears an instructor request completely (removes it).
 */
export async function clearInstructorRequest(lessonId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lessons")
    .update({
      instructor_absence_request: false,
      instructor_request_type: null,
      instructor_notes: null,
      instructor_request_handled: false,
    })
    .eq("id", lessonId);

  if (error) {
    return { error: "שגיאה בעדכון: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/schedule/weekly");

  return { success: true };
}
