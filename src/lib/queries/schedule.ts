import { createClient } from "@/lib/supabase/server";
import { getTodayInIsrael } from "@/lib/utils/date";

export async function getRecurringSchedule(filters?: {
  instructorIds?: string[];
  cities?: string[];
  dayOfWeek?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("recurring_schedule")
    .select(
      `
      id,
      day_of_week,
      start_time,
      group_name,
      instructor:instructors!recurring_schedule_instructor_id_fkey(id, full_name),
      location:locations!recurring_schedule_location_id_fkey(id, name, city, street, age_group)
    `
    )
    .order("day_of_week")
    .order("start_time");

  if (filters?.instructorIds && filters.instructorIds.length > 0) {
    query = query.in("instructor_id", filters.instructorIds);
  }
  if (filters?.dayOfWeek !== undefined) {
    query = query.eq("day_of_week", filters.dayOfWeek);
  }

  const { data } = await query;

  // Filter by cities client-side (joined field)
  if (filters?.cities && filters.cities.length > 0 && data) {
    return data.filter(
      (item: any) => filters.cities!.includes(item.location?.city)
    );
  }

  return data ?? [];
}

export async function getWeekLessons(
  weekStart: string,
  weekEnd: string,
  filters?: { instructorIds?: string[]; cities?: string[] }
) {
  const supabase = await createClient();

  let query = supabase
    .from("lessons")
    .select(
      `
      id,
      recurring_item_id,
      instructor_id,
      lesson_date,
      start_time,
      status,
      change_notes,
      instructor_absence_request,
      instructor_request_handled,
      instructor_request_type,
      instructor_notes,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      substitute_instructor:instructors!lessons_substitute_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city, street, age_group)
    `
    )
    .gte("lesson_date", weekStart)
    .lte("lesson_date", weekEnd)
    .order("lesson_date")
    .order("start_time");

  if (filters?.instructorIds && filters.instructorIds.length > 0) {
    query = query.in("instructor_id", filters.instructorIds);
  }

  const { data } = await query;

  // Filter by cities client-side (joined field)
  if (filters?.cities && filters.cities.length > 0 && data) {
    return data.filter((item: any) => filters.cities!.includes(item.location?.city));
  }

  return data ?? [];
}

/**
 * Get future lessons with changes (requests, cancellations, notes).
 * Only returns lessons from today onward.
 */
export async function getRecentChanges() {
  const supabase = await createClient();
  const today = getTodayInIsrael();

  const { data } = await supabase
    .from("lessons")
    .select(
      `
      id,
      lesson_date,
      start_time,
      status,
      change_notes,
      instructor_absence_request,
      instructor_request_handled,
      instructor_request_type,
      instructor_notes,
      recurring_item_id,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city)
    `
    )
    .gte("lesson_date", today)
    .or(
      "change_notes.neq.,instructor_absence_request.eq.true,status.neq.scheduled"
    )
    .order("lesson_date")
    .order("start_time")
    .limit(50);

  return data ?? [];
}

export async function getAllCities() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("locations")
    .select("city")
    .order("city");

  const unique = [...new Set(data?.map((d) => d.city).filter(Boolean))];
  return unique;
}

export async function getAllInstructors() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("instructors")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");

  return data ?? [];
}
