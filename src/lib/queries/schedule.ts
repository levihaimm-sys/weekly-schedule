import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
      address,
      client_name,
      contact_name,
      manager_name,
      manager_phone,
      framework,
      framework_name,
      field,
      lesson_duration,
      lessons_count,
      notes,
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
  filters?: { instructorIds?: string[]; cities?: string[]; changesOnly?: boolean }
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
      client_name,
      address,
      manager_name,
      manager_phone,
      contact_name,
      framework,
      framework_name,
      field,
      lesson_duration,
      lessons_count,
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
  if (filters?.changesOnly) {
    query = query.or(
      "is_one_time_change.eq.true,instructor_absence_request.eq.true,status.neq.scheduled"
    );
  }

  const { data } = await query;

  // Framework name, address and client live on the recurring_schedule template for lessons
  // spawned from the fixed schedule — attach them here so the weekly view can display/edit them
  // without a per-row join. One-time lessons (no recurring_item_id, e.g. imported via
  // bulkImportLessons) carry these same fields directly on the lesson row instead, so fall back
  // to the lesson's own value whenever there's no recurring master to read from.
  if (data && data.length > 0) {
    const recurringIds = [...new Set(data.map((l: any) => l.recurring_item_id).filter(Boolean))];
    const recurringById = new Map<string, any>();
    if (recurringIds.length > 0) {
      const { data: recurringRows } = await supabase
        .from("recurring_schedule")
        .select(
          "id, group_name, address, client_name, contact_name, manager_name, manager_phone, framework, framework_name, field, lesson_duration, lessons_count, notes"
        )
        .in("id", recurringIds);
      for (const r of recurringRows ?? []) recurringById.set(r.id, r);
    }
    for (const lesson of data as any[]) {
      const recurring = lesson.recurring_item_id ? recurringById.get(lesson.recurring_item_id) : undefined;
      lesson.group_name = recurring?.group_name ?? null;
      lesson.address = recurring?.address ?? lesson.address ?? null;
      lesson.client_name = recurring?.client_name ?? lesson.client_name ?? null;
      lesson.contact_name = recurring?.contact_name ?? lesson.contact_name ?? null;
      lesson.manager_name = recurring?.manager_name ?? lesson.manager_name ?? null;
      lesson.manager_phone = recurring?.manager_phone ?? lesson.manager_phone ?? null;
      lesson.framework = recurring?.framework ?? lesson.framework ?? null;
      lesson.framework_name = recurring?.framework_name ?? lesson.framework_name ?? null;
      lesson.field = recurring?.field ?? lesson.field ?? null;
      lesson.lesson_duration = recurring?.lesson_duration ?? lesson.lesson_duration ?? null;
      lesson.lessons_count = recurring?.lessons_count ?? lesson.lessons_count ?? null;
      lesson.notes = recurring?.notes ?? null;
    }
  }

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

export const getAllCities = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase.from("locations").select("city").order("city");
    const unique = [...new Set(data?.map((d) => d.city).filter(Boolean))];
    return unique;
  },
  ["all-cities"],
  { revalidate: 300 }
);

export const getAllLocations = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("locations")
      .select("id, name, city, street")
      .order("city")
      .order("name");
    return data ?? [];
  },
  ["all-locations"],
  { revalidate: 300 }
);

export const getAllInstructors = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("instructors")
      .select("id, full_name")
      .in("status", ["active", "substitute"])
      .order("full_name");
    return data ?? [];
  },
  ["all-instructors"],
  { revalidate: 120, tags: ["instructors"] }
);

/**
 * Public client-portal lookup: resolves a portal token to its client, then the
 * client's upcoming lessons (via the recurring_schedule rows linked to it).
 * Uses the admin client since this is read by unauthenticated visitors — the
 * random token is the only access control.
 */
export async function getClientPortalData(token: string) {
  const supabase = createAdminClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
    .eq("portal_token", token)
    .single();

  if (!client) return null;

  const { data: recurringRows } = await supabase
    .from("recurring_schedule")
    .select("id, group_name, framework_name")
    .eq("client_id", client.id);

  const recurringIds = (recurringRows ?? []).map((r) => r.id);
  if (recurringIds.length === 0) {
    return { client, lessons: [] };
  }

  const recurringById = new Map((recurringRows ?? []).map((r) => [r.id, r]));

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `
      id,
      recurring_item_id,
      lesson_date,
      start_time,
      status,
      instructor:instructors!lessons_instructor_id_fkey(id, full_name),
      location:locations!lessons_location_id_fkey(id, name, city, street)
    `
    )
    .in("recurring_item_id", recurringIds)
    .gte("lesson_date", getTodayInIsrael())
    .order("lesson_date")
    .order("start_time")
    .limit(200);

  const enriched = (lessons ?? []).map((lesson: any) => {
    const recurring = recurringById.get(lesson.recurring_item_id);
    return {
      ...lesson,
      framework: recurring?.group_name ?? recurring?.framework_name ?? null,
    };
  });

  return { client, lessons: enriched };
}
