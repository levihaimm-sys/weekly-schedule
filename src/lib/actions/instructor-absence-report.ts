"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveLessonClient } from "@/lib/utils/client-name";

export interface InstructorAbsenceRow {
  instructorId: string;
  instructorName: string;
  month: number;
  year: number;
  scheduled: number; // all lessons assigned to the instructor in the month
  held: number; // not cancelled (same basis as the payroll screen)
  absences: number;
  cancelled: number;
  lateness: number;
  coveredForOthers: number; // lessons this instructor took over as a substitute
  absencePct: number; // absences / scheduled
  // Owner only (null for everyone else)
  cost: number | null;
  avgPrice: number | null;
}

const PAGE = 1000;

async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>) {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

export async function getInstructorAbsenceReport(
  year: number
): Promise<{ data?: InstructorAbsenceRow[]; showCost?: boolean; error?: string }> {
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
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  try {
    const recurringRows = await fetchAll<{ id: string; client_name: string | null }>((f, t) =>
      admin.from("recurring_schedule").select("id, client_name").not("client_name", "is", null).range(f, t)
    );
    const clientByRecurringId = new Map(recurringRows.map((r) => [r.id, r.client_name as string]));

    const lessons = await fetchAll<any>((f, t) =>
      admin
        .from("lessons")
        .select(
          `id, lesson_date, status, instructor_id, substitute_instructor_id, recurring_item_id, client_name,
           instructor_absence_request, instructor_request_type,
           instructor:instructors!lessons_instructor_id_fkey(full_name),
           location:locations!lessons_location_id_fkey(city)`
        )
        .gte("lesson_date", startDate)
        .lte("lesson_date", endDate)
        .order("lesson_date")
        .order("id")
        .range(f, t)
    );

    // Names of instructors who only appear as substitutes
    const nameById = new Map<string, string>();
    for (const l of lessons) {
      if (l.instructor_id) nameById.set(l.instructor_id, l.instructor?.full_name ?? "לא ידוע");
    }
    const subOnlyIds = [
      ...new Set(
        lessons
          .map((l) => l.substitute_instructor_id as string | null)
          .filter((id): id is string => !!id && !nameById.has(id))
      ),
    ];
    if (subOnlyIds.length > 0) {
      const { data: subs } = await admin.from("instructors").select("id, full_name").in("id", subOnlyIds);
      for (const s of subs ?? []) nameById.set(s.id, s.full_name);
    }

    type Acc = {
      row: InstructorAbsenceRow;
      lessons: { id: string; date: string; client: string; city: string }[];
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
            scheduled: 0,
            held: 0,
            absences: 0,
            cancelled: 0,
            lateness: 0,
            coveredForOthers: 0,
            absencePct: 0,
            cost: null,
            avgPrice: null,
          },
          lessons: [],
        };
        map.set(key, a);
      }
      return a;
    }

    for (const l of lessons) {
      const month = Number(String(l.lesson_date).slice(5, 7));
      if (l.substitute_instructor_id && l.substitute_instructor_id !== l.instructor_id) {
        acc(l.substitute_instructor_id, month).row.coveredForOthers++;
      }
      if (!l.instructor_id) continue;
      const a = acc(l.instructor_id, month);
      a.row.scheduled++;

      const isAbsence = l.instructor_absence_request && l.instructor_request_type === "absence";
      const isLateness = l.instructor_absence_request && l.instructor_request_type === "lateness";
      // A lesson marked as an absence counts as an absence only (not also as a cancellation)
      if (isAbsence) a.row.absences++;
      else if (l.status === "cancelled") a.row.cancelled++;
      if (isLateness) a.row.lateness++;

      if (l.status !== "cancelled") {
        a.row.held++;
        a.lessons.push({
          id: l.id,
          date: l.lesson_date,
          client:
            resolveLessonClient(l.client_name, l.recurring_item_id, clientByRecurringId) ?? "אחר",
          city: l.location?.city ?? "",
        });
      }
    }

    if (showCost) {
      const rates = await fetchAll<any>((f, t) =>
        admin
          .from("instructor_pay_rates")
          .select("instructor_id, client_name, city, rate_per_lesson, travel_rate_per_day")
          .range(f, t)
      );
      const rateMap = new Map(rates.map((r) => [`${r.instructor_id}__${r.client_name}__${r.city}`, r]));

      const exceptions = await fetchAll<any>((f, t) =>
        admin.from("instructor_pay_exceptions").select("lesson_id, amount").range(f, t)
      );
      const exceptionMap = new Map(exceptions.map((e) => [e.lesson_id as string, Number(e.amount)]));

      const bonuses = await fetchAll<any>((f, t) =>
        admin.from("instructor_pay_bonuses").select("instructor_id, month, amount").eq("year", year).range(f, t)
      );
      const bonusByKey = new Map<string, number>();
      for (const b of bonuses) {
        const k = `${b.instructor_id}|${b.month}`;
        bonusByKey.set(k, (bonusByKey.get(k) ?? 0) + Number(b.amount));
      }

      for (const [key, a] of map) {
        const [instructorId] = key.split("|");
        // Same computation as the payroll screen: per client+city rate, exceptions replace the
        // rate, and travel is paid once per work day.
        const groups = new Map<string, typeof a.lessons>();
        for (const ls of a.lessons) {
          const gk = `${ls.client}__${ls.city}`;
          if (!groups.has(gk)) groups.set(gk, []);
          groups.get(gk)!.push(ls);
        }
        let total = 0;
        for (const [gk, gl] of groups) {
          const rate = rateMap.get(`${instructorId}__${gk}`);
          let regular = 0;
          let exTotal = 0;
          for (const ls of gl) {
            const ex = exceptionMap.get(ls.id);
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
        a.row.avgPrice = a.row.held > 0 ? total / a.row.held : 0;
      }
    }

    const rows = [...map.values()].map((a) => {
      a.row.absencePct = a.row.scheduled > 0 ? (a.row.absences / a.row.scheduled) * 100 : 0;
      return a.row;
    });
    rows.sort(
      (a, b) => a.instructorName.localeCompare(b.instructorName, "he") || a.month - b.month
    );
    return { data: rows, showCost };
  } catch (e: any) {
    return { error: "שגיאה בטעינת נתונים: " + (e?.message ?? "") };
  }
}
