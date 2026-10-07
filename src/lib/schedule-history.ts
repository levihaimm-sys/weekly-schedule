import { createAdminClient } from "@/lib/supabase/admin";

type Admin = ReturnType<typeof createAdminClient>;
type Row = Record<string, any>;

const PAGE = 1000;
const ID_CHUNK = 200;
const UNDO_RETENTION_DAYS = 30;

/**
 * Fields that live only on the recurring_schedule row and are read live by past lessons
 * (name, frame, address...). Changing one of them would rewrite history, so the row's past
 * lessons are first moved onto a frozen copy — see archivePastLessons().
 */
const TEMPLATE_FIELDS = [
  "group_name",
  "client_name",
  "client_id",
  "address",
  "contact_name",
  "manager_name",
  "manager_phone",
  "framework",
  "framework_name",
  "field",
  "lesson_duration",
  "lessons_count",
  "notes",
];

function chunk<T>(items: T[], size = ID_CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function selectPaged(build: (from: number, to: number) => PromiseLike<{ data: Row[] | null; error: any }>) {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export function templateChanged(current: Row, updates: Row): boolean {
  return TEMPLATE_FIELDS.some(
    (f) => updates[f] !== undefined && (updates[f] ?? null) !== (current[f] ?? null)
  );
}

/**
 * Freezes history before a fixed-schedule row's template fields change: rows that already have
 * lessons before `today` get an archived copy (archived_at = today) holding the current values,
 * and those past lessons are re-pointed to it. Lessons from today onward stay on the live row.
 * Returns the ids of the archived copies.
 */
export async function archivePastLessons(admin: Admin, rows: Row[], today: string): Promise<string[]> {
  const archivedIds: string[] = [];
  for (const row of rows) {
    const { count } = await admin
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("recurring_item_id", row.id)
      .lt("lesson_date", today);
    if (!count) continue;

    const { id: _id, ...values } = row;
    const { data: copy, error } = await admin
      .from("recurring_schedule")
      .insert({ ...values, archived_at: today })
      .select("id")
      .single();
    if (error || !copy) throw new Error("שגיאה בשמירת היסטוריית הלוח הקבוע: " + (error?.message ?? ""));

    const { error: moveError } = await admin
      .from("lessons")
      .update({ recurring_item_id: copy.id })
      .eq("recurring_item_id", row.id)
      .lt("lesson_date", today);
    if (moveError) throw new Error("שגיאה בשמירת היסטוריית הלוח הקבוע: " + moveError.message);

    archivedIds.push(copy.id);
  }
  return archivedIds;
}

/** Ids (of the given recurring rows) that have lessons before `today`. */
export async function idsWithPastLessons(admin: Admin, recurringIds: string[], today: string): Promise<Set<string>> {
  const found = new Set<string>();
  for (const ids of chunk(recurringIds)) {
    const rows = await selectPaged((from, to) =>
      admin.from("lessons").select("recurring_item_id").in("recurring_item_id", ids).lt("lesson_date", today).range(from, to)
    );
    for (const r of rows) found.add(r.recurring_item_id);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Undo log
// ---------------------------------------------------------------------------

export interface UndoScope {
  recurringIds?: string[];
  lessonIds?: string[];
  /**
   * Only snapshot lessons of `recurringIds` dated on/after this day. Use it when the change can't
   * touch earlier lessons — saves fetching a row's whole history on every edit.
   */
  since?: string;
}

export interface UndoSnapshot {
  recurring: Row[];
  lessons: Row[];
}

async function fetchScope(admin: Admin, scope: UndoScope, columns = "*"): Promise<UndoSnapshot> {
  const recurringIds = [...new Set(scope.recurringIds ?? [])];
  const lessonIds = [...new Set(scope.lessonIds ?? [])];

  const recurringTask = Promise.all(
    chunk(recurringIds).map(async (ids) => {
      const { data, error } = await admin.from("recurring_schedule").select(columns).in("id", ids);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Row[];
    })
  );

  const byRecurringTask = Promise.all(
    chunk(recurringIds).map((ids) =>
      selectPaged((from, to) => {
        let q = admin.from("lessons").select(columns).in("recurring_item_id", ids);
        if (scope.since) q = q.gte("lesson_date", scope.since);
        return q.order("id").range(from, to) as unknown as PromiseLike<{ data: Row[] | null; error: any }>;
      })
    )
  );

  const byIdTask = Promise.all(
    chunk(lessonIds).map(async (ids) => {
      const { data, error } = await admin.from("lessons").select(columns).in("id", ids);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Row[];
    })
  );

  const [recurring, byRecurring, byId] = await Promise.all([recurringTask, byRecurringTask, byIdTask]);
  const lessonsById = new Map<string, Row>();
  for (const r of [...byRecurring.flat(), ...byId.flat()]) lessonsById.set(r.id, r);

  return { recurring: recurring.flat(), lessons: [...lessonsById.values()] };
}

/** Snapshot the rows a change is about to touch. Call before the change. */
export async function captureUndo(admin: Admin, scope: UndoScope): Promise<UndoSnapshot> {
  return fetchScope(admin, scope);
}

/**
 * Record an undo entry after the change. `scope` is the final scope (including any ids the
 * change created) — every row in it that wasn't in the snapshot counts as created by the change.
 * Never throws: failing to log undo must not fail the change itself.
 */
export async function commitUndo(admin: Admin, label: string, before: UndoSnapshot, scope: UndoScope) {
  try {
    // Only ids are needed here (to spot rows the change created), not full rows.
    const after = await fetchScope(admin, scope, "id");
    const beforeRecurring = new Set(before.recurring.map((r) => r.id));
    const beforeLessons = new Set(before.lessons.map((r) => r.id));

    const cutoff = new Date(Date.now() - UNDO_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await Promise.all([
      admin.from("schedule_undo_log").insert({
        label,
        before_recurring: before.recurring,
        before_lessons: before.lessons,
        created_recurring_ids: after.recurring.map((r) => r.id).filter((id) => !beforeRecurring.has(id)),
        created_lesson_ids: after.lessons.map((r) => r.id).filter((id) => !beforeLessons.has(id)),
      }),
      admin.from("schedule_undo_log").delete().lt("created_at", cutoff),
    ]);
  } catch (e) {
    console.error("commitUndo failed:", e);
  }
}

/**
 * Restore the state saved in an undo entry: put back the "before" rows (re-creating deleted ones
 * with their original ids) and remove rows the change created.
 */
export async function applyUndo(admin: Admin, entry: Row) {
  const beforeRecurring: Row[] = entry.before_recurring ?? [];
  const beforeLessons: Row[] = entry.before_lessons ?? [];
  const createdRecurring: string[] = entry.created_recurring_ids ?? [];
  const createdLessons: string[] = entry.created_lesson_ids ?? [];

  // 1. Recurring rows first, so restored lessons can point at them again.
  for (const rows of chunk(beforeRecurring)) {
    const { error } = await admin.from("recurring_schedule").upsert(rows, { onConflict: "id" });
    if (error) throw new Error("שגיאה בשחזור הלוח הקבוע: " + error.message);
  }
  // 2. Remove lessons the change created (frees their slots for the restored ones).
  for (const ids of chunk(createdLessons)) {
    const { error } = await admin.from("lessons").delete().in("id", ids);
    if (error) throw new Error("שגיאה בשחזור שיעורים: " + error.message);
  }
  // 3. Restore lessons as they were.
  for (const rows of chunk(beforeLessons)) {
    const { error } = await admin.from("lessons").upsert(rows, { onConflict: "id" });
    if (error) throw new Error("שגיאה בשחזור שיעורים: " + error.message);
  }
  // 4. Remove recurring rows the change created (e.g. archived copies) — nothing points at them now.
  for (const ids of chunk(createdRecurring)) {
    const { error } = await admin.from("recurring_schedule").delete().in("id", ids);
    if (error) throw new Error("שגיאה בשחזור הלוח הקבוע: " + error.message);
  }
}
