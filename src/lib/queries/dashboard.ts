import { createClient } from "@/lib/supabase/server";
import { formatDateShort, getTodayInIsrael, getNowInIsrael } from "@/lib/utils/date";
import { startOfWeek, addDays, format, nextSunday, nextMonday } from "date-fns";

export async function getDashboardStats() {
  const supabase = await createClient();
  const today = getTodayInIsrael();

  const [
    { count: todayLessons },
    { count: activeInstructors },
    { count: totalLocations },
    { count: totalRecurring },
  ] = await Promise.all([
    supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("lesson_date", today),
    supabase
      .from("instructors")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("locations").select("*", { count: "exact", head: true }),
    supabase
      .from("recurring_schedule")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    todayLessons: todayLessons ?? 0,
    activeInstructors: activeInstructors ?? 0,
    totalLocations: totalLocations ?? 0,
    totalRecurring: totalRecurring ?? 0,
  };
}

export async function getTodayLessons() {
  const today = getTodayInIsrael();
  return getLessonsByDate(today);
}

export async function getLessonsByDate(date: string) {
  const supabase = await createClient();

  // Fetch lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      recurring_item_id,
      lesson_date,
      start_time,
      status,
      change_notes,
      instructor_absence_request,
      instructor_request_handled,
      instructor_request_type,
      instructor_notes,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city, street, age_group)
    `
    )
    .eq("lesson_date", date)
    .order("start_time");

  if (!lessons || lessons.length === 0) return [];

  // Fetch signatures separately to avoid JOIN duplicates
  const lessonIds = lessons.map((l) => l.id);
  const { data: signatures } = await supabase
    .from("signatures")
    .select("lesson_id, signer_name, signer_role")
    .in("lesson_id", lessonIds);

  // Build signature map
  const sigMap = new Map(
    (signatures ?? []).map((s) => [s.lesson_id, { signer_name: s.signer_name, signer_role: s.signer_role }])
  );

  // Attach signatures to lessons
  return lessons.map((lesson) => ({
    ...lesson,
    signature: sigMap.get(lesson.id) ?? null,
  }));
}

export async function getRecentLessons(limit = 10) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city)
    `
    )
    .order("lesson_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Get lessons this week that have no instructor assigned.
 */
export async function getUnassignedLessonsThisWeek() {
  const supabase = await createClient();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = addDays(weekStart, 4); // Thursday
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  const { data } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      location:locations!lessons_location_id_fkey(id, name, city)
    `
    )
    .is("instructor_id", null)
    .gte("lesson_date", weekStartStr)
    .lte("lesson_date", weekEndStr)
    .order("lesson_date")
    .order("start_time");

  return data ?? [];
}

/**
 * Compute the end date for "upcoming" queries.
 * Normally: today + 1 day (2 days total).
 * On Thursday (day 4): extends to next Monday (covers Thu, Sun, Mon).
 */
function getUpcomingEndDate(): string {
  const now = getNowInIsrael();
  const dayOfWeek = now.getDay(); // 0=Sun .. 4=Thu
  if (dayOfWeek === 4) {
    // Thursday: extend to next Monday
    const mon = nextMonday(now);
    return format(mon, "yyyy-MM-dd");
  }
  // Default: today + 1 day
  return format(addDays(now, 1), "yyyy-MM-dd");
}

/**
 * Get upcoming lessons (next 2 days, extended on Thursday) with no instructor.
 */
export async function getUpcomingUnassignedLessons() {
  const supabase = await createClient();
  const today = getTodayInIsrael();
  const endDate = getUpcomingEndDate();

  const { data } = await supabase
    .from("lessons")
    .select(
      `
      id,
      recurring_item_id,
      lesson_date,
      start_time,
      status,
      location:locations!lessons_location_id_fkey(id, name, city, age_group)
    `
    )
    .is("instructor_id", null)
    .gte("lesson_date", today)
    .lte("lesson_date", endDate)
    .neq("status", "cancelled")
    .order("lesson_date")
    .order("start_time");

  return data ?? [];
}

/**
 * Get lessons where the assigned instructor differs from the recurring schedule instructor.
 * Includes seen status and past 30 days for the "ראיתי" tab.
 */
export async function getUpcomingScheduleChanges() {
  const supabase = await createClient();
  const today = getTodayInIsrael();
  const endDate = getUpcomingEndDate();
  const pastDate = format(addDays(new Date(today), -30), "yyyy-MM-dd");

  // Fetch lessons from past 30 days through upcoming end date
  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      recurring_item_id,
      lesson_date,
      start_time,
      status,
      instructor_id,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city, age_group)
    `
    )
    .not("recurring_item_id", "is", null)
    .not("instructor_id", "is", null)
    .gte("lesson_date", pastDate)
    .lte("lesson_date", endDate)
    .neq("status", "cancelled")
    .order("lesson_date")
    .order("start_time");

  if (!lessons || lessons.length === 0) return [];

  // Fetch the recurring schedule entries to compare instructors
  const recurringIds = [...new Set(lessons.map((l) => l.recurring_item_id!))];
  const { data: recurringItems } = await supabase
    .from("recurring_schedule")
    .select("id, instructor_id, instructor:instructors(id, full_name)")
    .in("id", recurringIds);

  if (!recurringItems) return [];

  const recurringMap = new Map(
    recurringItems.map((r) => [r.id, r])
  );

  // Filter to only lessons where instructor changed
  const changedLessons = lessons.filter((lesson) => {
    const recurring = recurringMap.get(lesson.recurring_item_id!);
    if (!recurring) return false;
    return lesson.instructor_id !== recurring.instructor_id;
  });

  if (changedLessons.length === 0) return [];

  // Fetch seen status for all changed lessons
  const changedIds = changedLessons.map((l) => l.id);
  const { data: seenItems } = await supabase
    .from("schedule_change_seen")
    .select("lesson_id")
    .in("lesson_id", changedIds);

  const seenSet = new Set((seenItems ?? []).map((s) => s.lesson_id));

  return changedLessons.map((lesson) => {
    const recurring = recurringMap.get(lesson.recurring_item_id!)!;
    const recurringInstructor = Array.isArray(recurring.instructor)
      ? recurring.instructor[0]
      : recurring.instructor;
    return {
      ...lesson,
      recurring_instructor: recurringInstructor as { id: string; full_name: string } | null,
      is_seen: seenSet.has(lesson.id),
    };
  });
}

/**
 * Get lessons with instructor requests (absence, lateness, other).
 */
export async function getInstructorRequests() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      instructor_notes,
      instructor_request_type,
      instructor_request_handled,
      recurring_item_id,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city)
    `
    )
    .eq("instructor_absence_request", true)
    .eq("instructor_request_handled", false)
    .gte("lesson_date", getTodayInIsrael())
    .order("lesson_date")
    .order("start_time");

  return data ?? [];
}
