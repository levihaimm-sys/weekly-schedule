"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { startOfWeek, addDays, format } from "date-fns";
import { getTodayInIsrael } from "@/lib/utils/date";

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

  // Create lesson instances
  const lessons = masterSchedule.map((entry) => {
    const lessonDate = addDays(weekStart, entry.day_of_week);
    return {
      recurring_item_id: entry.id,
      location_id: entry.location_id,
      instructor_id: entry.instructor_id,
      lesson_date: format(lessonDate, "yyyy-MM-dd"),
      start_time: entry.start_time,
      status: "scheduled",
    };
  });

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
  if (lesson?.instructor_absence_request && !lesson?.instructor_request_handled) {
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
  }
) {
  const supabase = createAdminClient();

  // Build clean updates: include null values (to clear fields), skip undefined
  const cleanUpdates: Record<string, string | number | null> = {};
  if (updates.instructor_id !== undefined) cleanUpdates.instructor_id = updates.instructor_id;
  if (updates.start_time) cleanUpdates.start_time = updates.start_time;
  if (updates.location_id) cleanUpdates.location_id = updates.location_id;
  if (updates.day_of_week !== undefined) cleanUpdates.day_of_week = updates.day_of_week;

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

    // Delete all future lessons for this recurring item
    const { error: delError } = await supabase
      .from("lessons")
      .delete()
      .eq("recurring_item_id", recurringId)
      .gte("lesson_date", nextSunday);

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
        .gte("lesson_date", nextSunday);

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
 * Ensure lessons exist for the next N weeks (auto-replication).
 * Can be called from server components (skipRevalidate=true) or server actions.
 *
 * IMPORTANT - About Weekly Schedule:
 * - The organization's schedule repeats weekly (same lessons every week)
 * - This function creates lesson instances for multiple weeks ahead
 * - Example: If today is week 1, it creates lessons for weeks 1-8
 *
 * Duplicate Prevention:
 * - Checks if lessons exist in each week before creating (line 241: if count > 0, skip)
 * - Database constraint "unique_lesson_schedule" prevents same lesson appearing twice on same date
 * - If you see duplicates on SAME date, check if this function ran concurrently
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

    const lessons = masterSchedule.map((entry) => ({
      recurring_item_id: entry.id,
      location_id: entry.location_id,
      instructor_id: entry.instructor_id,
      lesson_date: format(addDays(wkStart, entry.day_of_week), "yyyy-MM-dd"),
      start_time: entry.start_time,
      status: "scheduled",
    }));

    const { data } = await supabase.from("lessons").insert(lessons).select();
    created += data?.length ?? 0;
  }

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
