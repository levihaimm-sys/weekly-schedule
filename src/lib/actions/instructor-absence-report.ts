"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveLessonClient } from "@/lib/utils/client-name";

/**
 * Fixed-schedule reliability report.
 *
 * Every lesson generated from the fixed schedule (recurring_item_id) is attributed to the
 * instructor who OWNED that fixed slot on the lesson's date — not to whoever is currently
 * assigned on the lesson. This way an absence stays with the regular instructor even after
 * the lesson was handed to a substitute. The fixed instructor comes from the fixed vs weekly
 * board data only (see fixedInstructorOf). A lesson with no fixed instructor is not counted.
 *
 * Each past fixed lesson falls into exactly one bucket (in this priority order):
 *   absence     — marked as an instructor absence
 *   cancelled   — status cancelled
 *   transferred — taught by someone other than the slot owner (or left with no instructor)
 *   self        — taught by the slot owner
 */
export interface InstructorAbsenceRow {
  instructorId: string;
  instructorName: string;
  month: number;
  year: number;
  fixed: number; // past lessons generated from this instructor's fixed slots
  self: number;
  absences: number; // absences on this instructor's own fixed lessons
  absencesElsewhere: number; // absences marked on them in lessons that aren't their fixed slots
  transferred: number;
  cancelled: number;
  changed: number; // fixed lessons manually changed on the weekly board (is_one_time_change)
  selfPct: number; // self / fixed * 100
  coveredForOthers: number; // other instructors' fixed lessons this instructor taught
  // Owner only (null for everyone else) — same computation as the payroll screen
  cost: number | null;
  avgPrice: number | null;
  paidLessons: number;
}

const PAGE = 1000;

async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
) {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

function todayInIsrael() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" }); // yyyy-mm-dd
}

export async function getInstructorAbsenceReport(
  year: number
): Promise<{ data?: InstructorAbsenceRow[]; showCost?: boolean; until?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) return { error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_owner")
    .eq("id", session.user.id)
    .single();
  if (profile?.role !== "admin") return { error: "אין הרשאה" };
  const showCost = !!profile?.is_owner;

  const admin = createAdminClient();
  const today = todayInIsrael();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31` < today ? `${year}-12-31` : today;
  if (endDate < startDate) return { data: [], showCost, until: endDate };

  try {
    const [recurringRows, instructors] = await Promise.all([
      fetchAll<{ id: string; instructor_id: string | null; client_name: string | null }>((f, t) =>
        admin.from("recurring_schedule").select("id, instructor_id, client_name").range(f, t)
      ),
      fetchAll<{ id: string; full_name: string }>((f, t) =>
        admin.from("instructors").select("id, full_name").range(f, t)
      ),
    ]);
    const ownerBySlot = new Map(recurringRows.map((r) => [r.id, r.instructor_id]));
    const clientBySlot = new Map(
      recurringRows.filter((r) => r.client_name).map((r) => [r.id, r.client_name as string])
    );
    const nameById = new Map(instructors.map((i) => [i.id, i.full_name]));

    const lessons = await fetchAll<any>((f, t) =>
      admin
        .from("lessons")
        .select(
          `id, lesson_date, status, instructor_id, substitute_instructor_id, recurring_item_id, client_name,
           is_one_time_change, instructor_absence_request, instructor_request_type,
           location:locations!lessons_location_id_fkey(city)`
        )
        .gte("lesson_date", startDate)
        .lte("lesson_date", endDate)
        .order("lesson_date")
        .order("id")
        .range(f, t)
    );

    const isAbsenceLesson = (l: any) =>
      !!l.instructor_absence_request && l.instructor_request_type === "absence";

    // Fixed-schedule history: every edit of the fixed schedule stores the row as it was
    // BEFORE the edit (schedule_undo_log.before_recurring). Edits apply from their date onward,
    // so the slot's instructor on a given date is the "before" value of the first edit made
    // AFTER that date, or the current fixed-schedule instructor if no later edit exists.
    const undoRows = await fetchAll<{
      created_at: string;
      label: string | null;
      created_recurring_ids: string[] | null;
      before_recurring: any[] | null;
      before_lessons: any[] | null;
    }>((f, t) =>
      admin
        .from("schedule_undo_log")
        .select("created_at, label, before_recurring, before_lessons, created_recurring_ids")
        .order("created_at")
        .range(f, t)
    );
    const slotHistory = new Map<string, { date: string; instructorId: string | null }[]>();
    // Per-lesson edit history, in order. An edit that also touched the fixed schedule
    // (has before_recurring) is a fixed-board edit; anything else is a weekly-board edit.
    const lessonEvents = new Map<
      string,
      { kind: "fixed" | "weekly" | "absence"; ins: string | null }[]
    >();
    const absentees = new Map<string, Set<string>>();
    const firstAbsSeen = new Set<string>();
    const slotCreated = new Map<string, string>();
    for (const u of undoRows) {
      const date = new Date(u.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      for (const id of u.created_recurring_ids ?? []) {
        if (!slotCreated.has(id)) slotCreated.set(id, date);
      }
      for (const r of Array.isArray(u.before_recurring) ? u.before_recurring : []) {
        if (!r?.id) continue;
        const list = slotHistory.get(r.id) ?? [];
        list.push({ date, instructorId: r.instructor_id ?? null });
        slotHistory.set(r.id, list);
      }
      const isAbsenceMarking = (u.label ?? "").startsWith("סימון חיסור");
      const isFixedEdit = Array.isArray(u.before_recurring) && u.before_recurring.length > 0;
      for (const b of Array.isArray(u.before_lessons) ? u.before_lessons : []) {
        if (!b?.id) continue;
        const list = lessonEvents.get(b.id) ?? [];
        list.push({
          kind: isFixedEdit ? "fixed" : isAbsenceMarking ? "absence" : "weekly",
          ins: b.instructor_id ?? null,
        });
        lessonEvents.set(b.id, list);
        // Who the absence was marked on: the instructor on the lesson at the moment of marking,
        // or — for an absence that already existed (e.g. reported by the instructor in the app) —
        // the instructor on the lesson the first time the log saw it marked.
        if (b.instructor_id && (isAbsenceMarking || (b.instructor_absence_request && !firstAbsSeen.has(b.id)))) {
          const set = absentees.get(b.id) ?? new Set<string>();
          set.add(b.instructor_id);
          absentees.set(b.id, set);
        }
        if (b.instructor_absence_request) firstAbsSeen.add(b.id);
      }
    }
    /**
     * The fixed-schedule instructor of a lesson = the fixed board's row for its slot as it was
     * on the lesson's date — never the lesson's own (weekly-board) instructor:
     * - slot created after that date → it wasn't in the fixed board yet → no fixed instructor;
     * - otherwise the "before" value of the first fixed-board edit made after that date
     *   (an edit made on the lesson's own date already applies to it);
     * - no such edit → the current fixed-board row.
     */
    function fixedInstructorOf(l: any): string | null {
      const slot: string = l.recurring_item_id;
      const created = slotCreated.get(slot);
      if (created && created > l.lesson_date) return null;
      const later = slotHistory.get(slot)?.find((h) => h.date > l.lesson_date);
      if (later) return later.instructorId;
      return ownerBySlot.get(slot) ?? null;
    }
    // Changed on the weekly board: flagged as a one-time change, or touched by a weekly edit
    function changedOnWeeklyBoard(l: any): boolean {
      return !!l.is_one_time_change || !!lessonEvents.get(l.id)?.some((e) => e.kind === "weekly");
    }

    type Acc = {
      row: InstructorAbsenceRow;
      paid: { id: string; date: string; client: string; city: string }[];
    };
    const map = new Map<string, Acc>();
    function acc(instructorId: string, month: number): Acc {
      const key = `${instructorId}|${month}`;
      let a = map.get(key);
      if (!a) {
        a = {
          row: {
            instructorId,
            instructorName: nameById.get(instructorId) ?? "לא ידוע",
            month,
            year,
            fixed: 0,
            self: 0,
            absences: 0,
            absencesElsewhere: 0,
            transferred: 0,
            cancelled: 0,
            changed: 0,
            selfPct: 0,
            coveredForOthers: 0,
            cost: null,
            avgPrice: null,
            paidLessons: 0,
          },
          paid: [],
        };
        map.set(key, a);
      }
      return a;
    }

    for (const l of lessons) {
      const month = Number(String(l.lesson_date).slice(5, 7));
      const taughtBy: string | null = l.substitute_instructor_id ?? l.instructor_id ?? null;
      const owner = l.recurring_item_id ? fixedInstructorOf(l) : null;

      // Instructors the absence was marked on (from the log); without a log entry, the absence
      // belongs to the lesson's fixed instructor (or whoever is on it, for one-off lessons)
      let absentSet: Set<string> = new Set();
      if (isAbsenceLesson(l)) {
        absentSet = absentees.get(l.id) ?? new Set();
        if (absentSet.size === 0) {
          const who = owner ?? l.instructor_id;
          if (who) absentSet = new Set([who]);
        }
        for (const who of absentSet) {
          if (who !== owner) acc(who, month).row.absencesElsewhere++;
        }
      }

      // Fixed-schedule reliability, attributed to the slot owner
      if (owner) {
        const a = acc(owner, month);
        a.row.fixed++;
        if (changedOnWeeklyBoard(l)) a.row.changed++;
        if (absentSet.has(owner)) a.row.absences++;
        else if (l.status === "cancelled") a.row.cancelled++;
        else if (taughtBy !== owner) a.row.transferred++;
        else a.row.self++;

        if (taughtBy && taughtBy !== owner && l.status !== "cancelled") {
          acc(taughtBy, month).row.coveredForOthers++;
        }
      }

      // Pay basis — identical to the payroll screen: lessons on the instructor, not cancelled
      if (l.instructor_id && l.status !== "cancelled") {
        acc(l.instructor_id, month).paid.push({
          id: l.id,
          date: l.lesson_date,
          client: resolveLessonClient(l.client_name, l.recurring_item_id, clientBySlot) ?? "אחר",
          city: l.location?.city ?? "",
        });
      }
    }

    if (showCost) {
      const [rates, exceptions, bonuses] = await Promise.all([
        fetchAll<any>((f, t) =>
          admin
            .from("instructor_pay_rates")
            .select("instructor_id, client_name, city, rate_per_lesson, travel_rate_per_day")
            .range(f, t)
        ),
        fetchAll<any>((f, t) =>
          admin.from("instructor_pay_exceptions").select("lesson_id, amount").range(f, t)
        ),
        fetchAll<any>((f, t) =>
          admin
            .from("instructor_pay_bonuses")
            .select("instructor_id, month, amount")
            .eq("year", year)
            .range(f, t)
        ),
      ]);
      const rateMap = new Map(
        rates.map((r) => [`${r.instructor_id}__${r.client_name}__${r.city}`, r])
      );
      const exceptionMap = new Map(exceptions.map((e) => [e.lesson_id as string, Number(e.amount)]));
      const bonusByKey = new Map<string, number>();
      for (const b of bonuses) {
        const k = `${b.instructor_id}|${b.month}`;
        bonusByKey.set(k, (bonusByKey.get(k) ?? 0) + Number(b.amount));
      }

      for (const [key, a] of map) {
        const [instructorId] = key.split("|");
        const groups = new Map<string, typeof a.paid>();
        for (const p of a.paid) {
          const gk = `${p.client}__${p.city}`;
          if (!groups.has(gk)) groups.set(gk, []);
          groups.get(gk)!.push(p);
        }
        let total = 0;
        for (const [gk, gl] of groups) {
          const rate = rateMap.get(`${instructorId}__${gk}`);
          let regular = 0;
          let exTotal = 0;
          for (const p of gl) {
            const ex = exceptionMap.get(p.id);
            if (ex !== undefined) exTotal += ex;
            else regular++;
          }
          const workDays = new Set(gl.map((x) => x.date)).size;
          total +=
            regular * Number(rate?.rate_per_lesson ?? 0) +
            exTotal +
            workDays * Number(rate?.travel_rate_per_day ?? 0);
        }
        total += bonusByKey.get(key) ?? 0;
        a.row.cost = total;
        a.row.avgPrice = a.paid.length > 0 ? total / a.paid.length : 0;
      }
    }

    const rows = [...map.values()].map((a) => {
      a.row.paidLessons = a.paid.length;
      a.row.selfPct = a.row.fixed > 0 ? (a.row.self / a.row.fixed) * 100 : 0;
      return a.row;
    });
    rows.sort(
      (a, b) => a.instructorName.localeCompare(b.instructorName, "he") || a.month - b.month
    );
    return { data: rows, showCost, until: endDate };
  } catch (e: any) {
    return { error: "שגיאה בטעינת נתונים: " + (e?.message ?? "") };
  }
}
