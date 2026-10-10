"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Download, Filter, Hand, Plus, RotateCcw, Trash2, X, XCircle } from "lucide-react";
import { updatePayRate, addPayBonus, deletePayBonus } from "@/lib/actions/payroll";
import {
  addManualLessons,
  deleteManualLessons,
  setPayeePaid,
  updateEmploymentSettings,
  setActivityOverride,
  addOfficeWorker,
  updateOfficeWorker,
  setOfficeWorkerHours,
  setInvoiceSent,
  setInvoiceOverride,
  addFixedExpense,
  deleteFixedExpense,
} from "@/lib/actions/profit-loss";

interface LessonData {
  id: string;
  lesson_date: string;
  signed: boolean;
  instructor_id: string;
  instructor_name: string;
  client_name: string;
  city: string;
}

interface PayRate {
  instructor_id: string;
  client_name: string;
  city: string;
  rate_per_lesson: number;
  travel_rate_per_day: number;
}

interface ClientRate {
  client_name: string;
  city: string;
  billing_mode: "per_lesson" | "fixed_monthly";
  rate_per_lesson: number;
  fixed_monthly_amount: number;
}

interface Settings {
  instructor_id: string;
  employment_type: "freelance" | "employee";
  employer_cost_pct: number;
  is_office: boolean;
}

interface OfficeWorker {
  id: string;
  full_name: string;
  employment_type: "freelance" | "employee";
  employer_cost_pct: number;
  hourly_rate: number;
}

interface Override {
  instructor_id: string;
  client_name: string;
  city: string;
  activity_count: number | null;
  work_days: number | null;
}

interface FixedExpense {
  id: string;
  label: string;
  amount: number;
  year: number | null;
  month: number | null;
}

// Lessons added by hand. instructor_id null = billed to the client only.
interface ManualLesson {
  id: string;
  instructor_id: string | null;
  client_name: string;
  city: string;
  lesson_count: number;
  work_days: number;
  note: string;
}

interface Bonus {
  id: string;
  instructor_id: string;
  label: string;
  amount: number;
}

interface Props {
  lessons: LessonData[];
  payRates: PayRate[];
  payExceptions: { lesson_id: string; amount: number }[];
  bonuses: Bonus[];
  clientRates: ClientRate[];
  clientExceptions: { lesson_id: string; amount: number }[];
  adjustments: { client_name: string; label: string; amount: number }[];
  settings: Settings[];
  overrides: Override[];
  fixedExpenses: FixedExpense[];
  officeWorkers: OfficeWorker[];
  officeHours: { worker_id: string; hours: number }[];
  invoicesSent: string[];
  invoiceOverrides: { client_name: string; city: string; activity_count: number }[];
  manualLessons: ManualLesson[];
  paid: string[];
  allInstructors: { id: string; full_name: string }[];
  year: number;
  month: number;
  monthLabel: string;
}

const DEFAULT_EMPLOYER_PCT = 25;

// Approximate Israeli employer costs on top of gross salary (2026, rounded — not payroll-exact).
const BL_THRESHOLD = 7522; // 60% of the average wage: reduced Bituach Leumi rate up to here
const BL_LOW = 0.0451; // employer Bituach Leumi + health, up to the threshold
const BL_HIGH = 0.076; // employer Bituach Leumi + health, above the threshold
const PENSION = 0.065; // employer pension contribution (mandatory pension order)
const SEVERANCE = 0.06; // severance contribution to the pension fund
const PROVISIONS = 0.06; // accrual for paid vacation days + recreation pay (דמי הבראה)

interface EmployerCosts {
  bituach: number;
  pension: number;
  severance: number;
  provisions: number;
  total: number;
}

// Pension, severance and vacation accrue on salary only; Bituach Leumi also on travel pay.
function employerCosts(pay: number, travel: number): EmployerCosts {
  const blBase = pay + travel;
  const bituach =
    Math.min(blBase, BL_THRESHOLD) * BL_LOW + Math.max(blBase - BL_THRESHOLD, 0) * BL_HIGH;
  const pension = pay * PENSION;
  const severance = pay * SEVERANCE;
  const provisions = pay * PROVISIONS;
  return { bituach, pension, severance, provisions, total: bituach + pension + severance + provisions };
}

const TABS = [
  { key: "detail", label: "פירוט מדריכים" },
  { key: "office", label: "שעות משרד" },
  { key: "payroll", label: "ריכוז שכר" },
  { key: "operators", label: "הכנסות מול הוצאות" },
  { key: "invoices", label: "חשבוניות ללקוחות" },
  { key: "report", label: "דיווח לשכר" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function money(n: number) {
  return n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
}

// Pseudo-client for manually entered office hours (no lessons, no client billing).
const OFFICE_CLIENT = "שעות משרד";

type RowKind = "lesson" | "office";

function key3(a: string, b: string, c: string) {
  return `${a}__${b}__${c}`;
}

function csvCell(value: string | number) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

interface Filters {
  instructorId: string;
  client: string;
  city: string;
  employment: "" | "freelance" | "employee" | "office";
  onlyOverridden: boolean;
  onlyMissingRate: boolean;
}

const EMPTY_FILTERS: Filters = {
  instructorId: "",
  client: "",
  city: "",
  employment: "",
  onlyOverridden: false,
  onlyMissingRate: false,
};

// Cycled per instructor purely to make instructor blocks visually distinguishable.
const THEMES = [
  { accent: "#3b82f6", header: "bg-blue-50", text: "text-blue-800" },
  { accent: "#a855f7", header: "bg-purple-50", text: "text-purple-800" },
  { accent: "#10b981", header: "bg-emerald-50", text: "text-emerald-800" },
  { accent: "#f59e0b", header: "bg-amber-50", text: "text-amber-800" },
  { accent: "#f43f5e", header: "bg-rose-50", text: "text-rose-800" },
  { accent: "#06b6d4", header: "bg-cyan-50", text: "text-cyan-800" },
  { accent: "#6366f1", header: "bg-indigo-50", text: "text-indigo-800" },
  { accent: "#f97316", header: "bg-orange-50", text: "text-orange-800" },
];

// Tables scroll inside their own box so the sticky header stays visible while scrolling.
const SCROLL_BOX = "max-h-[75vh] overflow-auto rounded-xl border border-border bg-background";

const TH = "px-3 py-2 text-center font-semibold whitespace-nowrap";
const TD = "px-3 py-1.5 text-center tabular-nums whitespace-nowrap";
const TD_LABEL = "px-3 py-1.5 whitespace-nowrap";

function computeReport(
  {
    lessons, payRates, payExceptions, bonuses, clientRates, clientExceptions,
    adjustments, settings, overrides, fixedExpenses, officeWorkers, officeHours, invoiceOverrides,
    manualLessons, paid, allInstructors,
  }: Props,
  f: Filters
) {
    const payRateMap = new Map(payRates.map((r) => [key3(r.instructor_id, r.client_name, r.city), r]));
    const payExMap = new Map(payExceptions.map((e) => [e.lesson_id, Number(e.amount)]));
    const clientRateMap = new Map(clientRates.map((r) => [`${r.client_name}__${r.city}`, r]));
    const clientExMap = new Map(clientExceptions.map((e) => [e.lesson_id, Number(e.amount)]));
    const overrideMap = new Map(overrides.map((o) => [key3(o.instructor_id, o.client_name, o.city), o]));
    const settingsMap = new Map(settings.map((s) => [s.instructor_id, s]));

    // Rows: instructor × client × city
    const rowLessons = new Map<string, LessonData[]>();
    for (const l of lessons) {
      const k = key3(l.instructor_id, l.client_name, l.city);
      if (!rowLessons.has(k)) rowLessons.set(k, []);
      rowLessons.get(k)!.push(l);
    }

    // Manual lessons: with an instructor they add to that row (creating it if needed);
    // without one they're billed to the client only (see operators below).
    const manualByRow = new Map<string, ManualLesson[]>();
    const clientManual = new Map<string, ManualLesson[]>();
    for (const m of manualLessons) {
      const map = m.instructor_id ? manualByRow : clientManual;
      const k = m.instructor_id
        ? key3(m.instructor_id, m.client_name, m.city)
        : `${m.client_name}__${m.city}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    for (const k of manualByRow.keys()) {
      if (!rowLessons.has(k)) rowLessons.set(k, []);
    }
    const instructorNames = new Map(allInstructors.map((i) => [i.id, i.full_name]));

    const allRows = [...rowLessons.entries()].map(([k, ls]) => {
      const manual = manualByRow.get(k) ?? [];
      const src = ls[0] ?? null;
      const m0 = manual[0];
      const instructorId = src?.instructor_id ?? m0.instructor_id!;
      const s = settingsMap.get(instructorId);
      const employmentType = s?.employment_type ?? "freelance";
      const employerPct = s ? Number(s.employer_cost_pct) : DEFAULT_EMPLOYER_PCT;
      const isOffice = s?.is_office ?? false;

      const rate = payRateMap.get(k);
      const ratePerLesson = Number(rate?.rate_per_lesson ?? 0);
      const travelPerDay = Number(rate?.travel_rate_per_day ?? 0);

      const signed = ls.filter((l) => l.signed);
      const signedCount = signed.length;
      const signedDays = new Set(signed.map((l) => l.lesson_date)).size;

      const ov = overrideMap.get(k);
      const countOverride = ov?.activity_count ?? null;
      const daysOverride = ov?.work_days ?? null;
      const manualCount = manual.reduce((s, m) => s + Number(m.lesson_count), 0);
      const manualDays = manual.reduce((s, m) => s + Number(m.work_days), 0);
      const activityCount = (countOverride ?? signedCount) + manualCount;
      const workDays = (daysOverride ?? signedDays) + manualDays;

      // Per-lesson exceptions from שכר מדריכים shift the total by their delta from the rate.
      let exceptionDelta = 0;
      for (const l of signed) {
        const ex = payExMap.get(l.id);
        if (ex !== undefined) exceptionDelta += ex - ratePerLesson;
      }

      const pay = activityCount * ratePerLesson + exceptionDelta;
      const travel = workDays * travelPerDay;
      const employerCost = 0; // filled in per employee below

      return {
        key: k,
        kind: "lesson" as RowKind,
        instructorId,
        instructorName: src?.instructor_name ?? instructorNames.get(instructorId) ?? "לא ידוע",
        clientName: src?.client_name ?? m0.client_name,
        city: src?.city ?? m0.city,
        employmentType,
        employerPct,
        isOffice,
        officeRate: 0,
        hasRate: !!rate,
        ratePerLesson,
        travelPerDay,
        signedCount,
        signedDays,
        countOverride,
        daysOverride,
        activityCount,
        workDays,
        manualCount,
        manualDays,
        manualLessons: manual,
        signedLessons: signed,
        pay,
        travel,
        employerCost,
        total: pay + travel + employerCost,
      };
    });

    // Office workers: a separate list (not instructors), hours entered manually per month.
    const hoursByWorker = new Map(officeHours.map((h) => [h.worker_id, Number(h.hours)]));
    for (const w of officeWorkers) {
      const employmentType = w.employment_type;
      const employerPct = Number(w.employer_cost_pct);
      const officeRate = Number(w.hourly_rate);
      const hours = hoursByWorker.get(w.id) ?? 0;
      const pay = hours * officeRate;
      const employerCost = 0; // filled in per employee below
      allRows.push({
        key: `office__${w.id}`,
        kind: "office",
        instructorId: `office__${w.id}`,
        instructorName: w.full_name,
        clientName: OFFICE_CLIENT,
        city: "",
        employmentType,
        employerPct,
        isOffice: true,
        officeRate,
        hasRate: officeRate > 0,
        ratePerLesson: officeRate,
        travelPerDay: 0,
        signedCount: hours,
        signedDays: 0,
        countOverride: null,
        daysOverride: null,
        activityCount: hours,
        workDays: 0,
        manualCount: 0,
        manualDays: 0,
        manualLessons: [] as ManualLesson[],
        signedLessons: [],
        pay,
        travel: 0,
        employerCost,
        total: pay + employerCost,
      });
    }

    // Employer costs for employees are computed on the whole month's salary (the Bituach
    // Leumi rate depends on the monthly total), then spread over the employee's rows.
    const costByEmployee = new Map<string, EmployerCosts>();
    const employeeRows = new Map<string, typeof allRows>();
    for (const r of allRows) {
      if (r.employmentType !== "employee") continue;
      if (!employeeRows.has(r.instructorId)) employeeRows.set(r.instructorId, []);
      employeeRows.get(r.instructorId)!.push(r);
    }
    for (const [id, rs] of employeeRows) {
      const pay = rs.reduce((s, r) => s + r.pay, 0);
      const travel = rs.reduce((s, r) => s + r.travel, 0);
      const costs = employerCosts(pay, travel);
      costByEmployee.set(id, costs);
      const gross = pay + travel;
      for (const r of rs) {
        r.employerCost = gross > 0 ? (costs.total * (r.pay + r.travel)) / gross : 0;
        r.total = r.pay + r.travel + r.employerCost;
      }
    }

    allRows.sort(
      (a, b) =>
        a.instructorName.localeCompare(b.instructorName, "he") ||
        `${a.clientName}${a.city}`.localeCompare(`${b.clientName}${b.city}`, "he")
    );

    const rows = allRows.filter((r) => {
      if (f.instructorId && r.instructorId !== f.instructorId) return false;
      if (f.client && r.clientName !== f.client) return false;
      if (f.city && r.city !== f.city) return false;
      if (f.employment === "office" && !r.isOffice) return false;
      if ((f.employment === "freelance" || f.employment === "employee") &&
          (r.isOffice || r.employmentType !== f.employment)) return false;
      if (f.onlyOverridden && r.countOverride === null && r.daysOverride === null && r.manualCount === 0)
        return false;
      if (f.onlyMissingRate && r.hasRate) return false;
      return true;
    });

    const isFiltered = rows.length !== allRows.length;
    // Client adjustments have no instructor/city — only meaningful unfiltered or filtered by client.
    const adjustmentsApply =
      !f.instructorId && !f.city && !f.employment && !f.onlyOverridden && !f.onlyMissingRate;

    // Instructors
    const bonusByInstructor = new Map<string, Bonus[]>();
    for (const b of bonuses) {
      if (!bonusByInstructor.has(b.instructor_id)) bonusByInstructor.set(b.instructor_id, []);
      bonusByInstructor.get(b.instructor_id)!.push(b);
    }
    const paidSet = new Set(paid);

    const instructorMap = new Map<string, typeof rows>();
    for (const r of rows) {
      if (!instructorMap.has(r.instructorId)) instructorMap.set(r.instructorId, []);
      instructorMap.get(r.instructorId)!.push(r);
    }

    const instructors = [...instructorMap.entries()].map(([id, rs]) => {
      const f = rs[0];
      const bonusItems = bonusByInstructor.get(id) ?? [];
      const bonus = bonusItems.reduce((s, b) => s + Number(b.amount), 0);
      const pay = rs.reduce((s, r) => s + r.pay, 0);
      const travel = rs.reduce((s, r) => s + r.travel, 0);
      const employerCost = rs.reduce((s, r) => s + r.employerCost, 0);
      const activities = rs.reduce((s, r) => s + r.activityCount, 0);
      const deposit = pay + travel + bonus;
      const total = deposit + employerCost;
      return {
        id,
        name: f.instructorName,
        employmentType: f.employmentType,
        employerPct: f.employerPct,
        isOffice: f.isOffice,
        isOfficeWorker: f.kind === "office",
        officeRate: f.officeRate,
        // Full-month breakdown; only exact when the view isn't filtered down to part of her rows.
        costs: costByEmployee.get(id) ?? null,
        workDays: rs.reduce((s, r) => s + r.workDays, 0),
        activities,
        pay,
        travel,
        bonus,
        bonusItems,
        paid: paidSet.has(id),
        deposit,
        employerCost,
        total,
        average: activities > 0 ? total / activities : 0,
      };
    });
    instructors.sort((a, b) => a.name.localeCompare(b.name, "he"));

    // Operators: client × city
    const operatorMap = new Map<string, { clientName: string; city: string; rows: typeof rows }>();
    for (const r of rows.filter((r) => r.kind === "lesson")) {
      const k = `${r.clientName}__${r.city}`;
      if (!operatorMap.has(k)) operatorMap.set(k, { clientName: r.clientName, city: r.city, rows: [] });
      operatorMap.get(k)!.rows.push(r);
    }

    // Invoice count corrections are per client × city, so they only hold when the view
    // isn't narrowed down to some of the instructors working there.
    const invoiceOverridesApply =
      !f.instructorId && !f.employment && !f.onlyOverridden && !f.onlyMissingRate;
    const invoiceOverrideMap = new Map(
      invoiceOverrides.map((o) => [`${o.client_name}__${o.city}`, Number(o.activity_count)])
    );

    // Client-only manual lessons follow the same rule, plus the client/city filters.
    if (invoiceOverridesApply) {
      for (const [k, ms] of clientManual) {
        const { client_name, city } = ms[0];
        if ((f.client && client_name !== f.client) || (f.city && city !== f.city)) continue;
        if (!operatorMap.has(k)) operatorMap.set(k, { clientName: client_name, city, rows: [] });
      }
    }

    const operators = [...operatorMap.entries()].map(([k, { clientName, city, rows: rs }]) => {
      const rate = clientRateMap.get(k);
      const manual = invoiceOverridesApply ? clientManual.get(k) ?? [] : [];
      const manualCount = manual.reduce((s, m) => s + Number(m.lesson_count), 0);
      // What the invoice would show without a correction: instructor rows + client-only manual.
      const rowActivities = rs.reduce((s, r) => s + r.activityCount, 0) + manualCount;
      const invoiceOverride = invoiceOverridesApply ? invoiceOverrideMap.get(k) ?? null : null;
      const activities = invoiceOverride ?? rowActivities;
      let income = 0;
      if (rate?.billing_mode === "fixed_monthly") {
        income = activities > 0 ? Number(rate.fixed_monthly_amount) : 0;
      } else {
        const clientRate = Number(rate?.rate_per_lesson ?? 0);
        income = activities * clientRate;
        for (const r of rs) {
          for (const l of r.signedLessons) {
            const ex = clientExMap.get(l.id);
            if (ex !== undefined) income += ex - clientRate;
          }
        }
      }
      const expenses = rs.reduce((s, r) => s + r.total, 0);
      const diff = income - expenses;

      return {
        key: k,
        clientName,
        city,
        rate,
        manualLessons: manual,
        manualCount,
        instructorManualCount: rs.reduce((s, r) => s + r.manualCount, 0),
        rowActivities,
        invoiceOverride,
        activities,
        income,
        expenses,
        diff,
        avgIncome: activities > 0 ? income / activities : null,
        avgProfit: activities > 0 ? diff / activities : null,
      };
    });
    operators.sort((a, b) =>
      `${a.clientName}${a.city}`.localeCompare(`${b.clientName}${b.city}`, "he")
    );

    const appliedAdjustments = adjustmentsApply
      ? adjustments.filter((a) => !f.client || a.client_name === f.client)
      : [];
    const adjustmentsTotal = appliedAdjustments.reduce((s, a) => s + Number(a.amount), 0);

    // Invoices: one per client, broken down by city.
    const invoiceMap = new Map<string, { cities: typeof operators; adjustments: typeof appliedAdjustments }>();
    for (const o of operators) {
      if (!invoiceMap.has(o.clientName)) invoiceMap.set(o.clientName, { cities: [], adjustments: [] });
      invoiceMap.get(o.clientName)!.cities.push(o);
    }
    for (const a of appliedAdjustments) {
      invoiceMap.get(a.client_name)?.adjustments.push(a);
    }
    const invoices = [...invoiceMap.entries()]
      .map(([clientName, v]) => ({
        clientName,
        cities: v.cities,
        adjustments: v.adjustments,
        activities: v.cities.reduce((s, c) => s + c.activities, 0),
        total:
          v.cities.reduce((s, c) => s + c.income, 0) +
          v.adjustments.reduce((s, a) => s + Number(a.amount), 0),
      }))
      .sort((a, b) => a.clientName.localeCompare(b.clientName, "he"));
    const income = operators.reduce((s, o) => s + o.income, 0) + adjustmentsTotal;
    const wageCost = instructors.reduce((s, i) => s + i.total, 0);
    const fixedTotal = fixedExpenses.reduce((s, e) => s + Number(e.amount), 0);

    const officeCost = rows
      .filter((r) => r.kind === "office")
      .reduce((s, r) => s + r.total, 0);

    return {
      allRows,
      isFiltered,
      invoices,
      officeCost,
      rows,
      instructors,
      operators,
      adjustmentsTotal,
      income,
      wageCost,
      fixedTotal,
      // A filtered view is a slice of the month — fixed expenses only count against the whole.
      profit: income - wageCost - (isFiltered ? 0 : fixedTotal),
    };
}

type Data = ReturnType<typeof computeReport>;
type Run = (action: Promise<{ error?: string; success?: boolean }>) => Promise<void>;

export function ProfitLossView(props: Props) {
  const { fixedExpenses, year, month, monthLabel } = props;
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("detail");
  const [error, setError] = useState<string | null>(null);

  async function run(action: Promise<{ error?: string; success?: boolean }>) {
    const result = await action;
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const data = useMemo(() => computeReport(props, filters), [props, filters]);

  const options = useMemo(() => {
    const instructors = new Map<string, string>();
    const clients = new Set<string>();
    const cities = new Set<string>();
    for (const r of data.allRows) {
      instructors.set(r.instructorId, r.instructorName);
      clients.add(r.clientName);
      if (r.city) cities.add(r.city);
    }
    const he = (a: string, b: string) => a.localeCompare(b, "he");
    return {
      instructors: [...instructors.entries()].sort((a, b) => he(a[1], b[1])),
      clients: [...clients].sort(he),
      cities: [...cities].sort(he),
    };
  }, [data.allRows]);

  // Client/city suggestions for manual lessons: everything seen this month plus every priced client.
  const pickOptions = useMemo(() => {
    const clients = new Set(options.clients.filter((c) => c !== OFFICE_CLIENT));
    const cities = new Set(options.cities);
    for (const r of props.clientRates) {
      clients.add(r.client_name);
      if (r.city) cities.add(r.city);
    }
    const he = (a: string, b: string) => a.localeCompare(b, "he");
    return { clients: [...clients].sort(he), cities: [...cities].sort(he) };
  }, [options, props.clientRates]);

  // Theme by position in the unfiltered list so an instructor keeps its color when filtering.
  const themeByInstructor = useMemo(() => {
    const m = new Map<string, (typeof THEMES)[number]>();
    options.instructors.forEach(([id], idx) => m.set(id, THEMES[idx % THEMES.length]));
    return m;
  }, [options.instructors]);

  // Lessons that already took place but have no signature yet — not counted until signed.
  const today = new Date().toLocaleDateString("sv-SE");
  const unsignedPast = props.lessons.filter((l) => !l.signed && l.lesson_date <= today).length;

  const unpricedRows = data.rows.filter((r) => !r.hasRate).length;
  const unpricedOperators = data.operators.filter((o) => !o.rate).length;

  function exportCsv() {
    const lines: (string | number)[][] = [];
    lines.push([`רווח והפסד - ${monthLabel}${data.isFiltered ? " (מסונן)" : ""}`]);
    lines.push([]);
    lines.push(["פירוט מדריכים"]);
    lines.push(["העסקה", "מדריך", "לקוח", "עיר", "תשלום לפעילות", "נסיעות ליום", "ימי עבודה", "פעילויות", "מתוכן ידני", 'סה"כ פעילויות', "נסיעות", "הוצאות העסקה", 'סה"כ']);
    for (const r of data.rows) {
      lines.push([
        r.isOffice ? "משרד" : r.employmentType === "employee" ? "שכיר/ה" : "עצמאי/ת",
        r.instructorName, r.clientName, r.city, r.ratePerLesson, r.travelPerDay,
        r.workDays, r.activityCount, r.manualCount || "", Math.round(r.pay), Math.round(r.travel),
        Math.round(r.employerCost), Math.round(r.total),
      ]);
    }
    lines.push([]);
    lines.push(["ריכוז שכר"]);
    lines.push(["העסקה", "מדריך", "ימי עבודה", "פעילויות", "תשלום על פעילויות", "נסיעות", "תיקונים/תוספות", 'סה"כ להפקדה', "הוצאות העסקה", 'סה"כ עלות', "ממוצע לפעילות", "שולם"]);
    for (const i of data.instructors) {
      lines.push([
        i.isOffice ? "משרד" : i.employmentType === "employee" ? "שכיר/ה" : "עצמאי/ת",
        i.name, i.workDays, i.activities, Math.round(i.pay), Math.round(i.travel),
        Math.round(i.bonus), Math.round(i.deposit), Math.round(i.employerCost),
        Math.round(i.total), Math.round(i.average), i.paid ? "כן" : "",
      ]);
    }
    lines.push([]);
    lines.push(["הכנסות מול הוצאות"]);
    lines.push(["לקוח", "עיר", "פעילויות", "תשלום לפעילות", "הכנסות", "הוצאות הדרכה", "הפרש", "ממוצע הכנסה לפעילות", "ממוצע רווח לפעילות"]);
    for (const o of data.operators) {
      lines.push([
        o.clientName, o.city, o.activities,
        o.rate?.billing_mode === "fixed_monthly" ? "קבוע" : Number(o.rate?.rate_per_lesson ?? 0),
        Math.round(o.income), Math.round(o.expenses), Math.round(o.diff),
        o.avgIncome === null ? "" : Math.round(o.avgIncome),
        o.avgProfit === null ? "" : Math.round(o.avgProfit),
      ]);
    }
    lines.push([]);
    lines.push(['סה"כ הכנסות', Math.round(data.income)]);
    lines.push(['סה"כ עלות שכר', Math.round(data.wageCost)]);
    lines.push(['סה"כ הוצאות קבועות', Math.round(data.fixedTotal)]);
    lines.push(["רווח", Math.round(data.profit)]);

    const csv = lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
    const bom = "﻿"; // UTF-8 BOM so Excel opens Hebrew correctly
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `רווח והפסד ${monthLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label='סה"כ הכנסות צפויות' value={data.income} className="text-blue-700" />
        <Kpi label='סה"כ עלות שכר' value={data.wageCost} className="text-red-700" />
        <Kpi label='סה"כ הוצאות קבועות' value={data.fixedTotal} className="text-amber-700" />
        <Kpi
          label={data.isFiltered ? "רווח (ללא הוצאות קבועות)" : "רווח"}
          value={data.profit}
          className={data.profit >= 0 ? "text-emerald-700" : "text-red-700"}
        />
      </div>

      <ClientSummary
        invoices={data.invoices}
        sent={new Set(props.invoicesSent)}
        year={year}
        month={month}
        run={run}
      />

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        options={options}
        shown={data.rows.length}
        total={data.allRows.length}
      />

      {unsignedPast > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            {unsignedPast} שיעורים שכבר התקיימו החודש טרם נחתמו ולכן אינם נספרים. הם ייכנסו לחישוב
            אוטומטית לאחר החתימה (או בתיקון ידני בלשונית פירוט מדריכים).
          </span>
        </div>
      )}

      {(unpricedRows > 0 || unpricedOperators > 0) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            {unpricedRows > 0 && `${unpricedRows} שורות ללא תעריף מדריך. `}
            {unpricedOperators > 0 &&
              `${unpricedOperators} לקוחות ללא תעריף לקוח (יש להגדיר במסך תשלום לקוחות).`}
          </span>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-secondary text-[#1C1917]" : "hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Download size={14} />
          ייצוא לאקסל
        </button>
      </div>

      {data.rows.length === 0 && (
        <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
          {data.allRows.length === 0 ? "אין שיעורים להצגה בחודש זה" : "אין תוצאות לסינון הנוכחי"}
        </div>
      )}

      {tab === "office" && (
        <div className="space-y-3">
          <OfficeHoursTable
            rows={data.rows.filter((r) => r.kind === "office")}
            year={year}
            month={month}
            run={run}
          />
          <OfficeWorkerAdder run={run} />
        </div>
      )}
      {tab === "detail" && (
        <ManualLessonAdder
          instructors={props.allInstructors}
          clients={pickOptions.clients}
          cities={pickOptions.cities}
          year={year}
          month={month}
          run={run}
        />
      )}
      {data.rows.length > 0 && tab === "detail" && (
        <DetailTable
          rows={data.rows.filter((r) => r.kind === "lesson")}
          instructors={data.instructors.filter((i) => !i.isOfficeWorker)}
          themeByInstructor={themeByInstructor}
          pickOptions={pickOptions}
          year={year}
          month={month}
          run={run}
        />
      )}
      {data.rows.length > 0 && tab === "payroll" && (
        <PayrollTable instructors={data.instructors} year={year} month={month} run={run} />
      )}
      {tab === "operators" && (
        <div className="space-y-4">
          {data.rows.length > 0 && (
            <OperatorsTable
              operators={data.operators}
              officeCost={data.officeCost}
              adjustmentsTotal={data.adjustmentsTotal}
            />
          )}
          <FixedExpensesSection
            expenses={fixedExpenses}
            total={data.fixedTotal}
            year={year}
            month={month}
            run={run}
          />
        </div>
      )}
      {tab === "invoices" && (
        <ManualLessonAdder
          clients={pickOptions.clients}
          cities={pickOptions.cities}
          year={year}
          month={month}
          run={run}
        />
      )}
      {data.invoices.length > 0 && tab === "invoices" && (
        <InvoicesTab
          invoices={data.invoices}
          monthLabel={monthLabel}
          sent={new Set(props.invoicesSent)}
          year={year}
          month={month}
          run={run}
        />
      )}
      {data.rows.length > 0 && tab === "report" && (
        <ReportTable
          instructors={data.instructors.filter((i) => i.employmentType === "employee")}
          rows={data.rows}
        />
      )}
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  options,
  shown,
  total,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  options: { instructors: [string, string][]; clients: string[]; cities: string[] };
  shown: number;
  total: number;
}) {
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const active = shown !== total || JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const SELECT = "rounded-md border border-border bg-background px-2 py-1 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-3">
      <Filter size={15} className="text-muted-foreground" />
      <select value={filters.instructorId} onChange={(e) => set({ instructorId: e.target.value })} className={SELECT}>
        <option value="">כל המדריכים</option>
        {options.instructors.map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
      <select value={filters.client} onChange={(e) => set({ client: e.target.value })} className={SELECT}>
        <option value="">כל הלקוחות</option>
        {options.clients.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select value={filters.city} onChange={(e) => set({ city: e.target.value })} className={SELECT}>
        <option value="">כל הערים</option>
        {options.cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={filters.employment}
        onChange={(e) => set({ employment: e.target.value as Filters["employment"] })}
        className={SELECT}
      >
        <option value="">כל סוגי ההעסקה</option>
        <option value="freelance">עצמאי/ת</option>
        <option value="employee">שכיר/ה</option>
        <option value="office">משרד</option>
      </select>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={filters.onlyOverridden}
          onChange={(e) => set({ onlyOverridden: e.target.checked })}
        />
        תיקון ידני בלבד
      </label>
      <label className="flex items-center gap-1 text-sm">
        <input
          type="checkbox"
          checked={filters.onlyMissingRate}
          onChange={(e) => set({ onlyMissingRate: e.target.checked })}
        />
        ללא תעריף בלבד
      </label>
      {active && (
        <>
          <span className="text-xs text-muted-foreground">
            מוצגות {shown} מתוך {total} שורות
          </span>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <X size={12} />
            נקה סינון
          </button>
        </>
      )}
    </div>
  );
}

function ClientSummary({
  invoices,
  sent,
  year,
  month,
  run,
}: {
  invoices: Data["invoices"];
  sent: Set<string>;
  year: number;
  month: number;
  run: Run;
}) {
  if (invoices.length === 0) return null;
  const total = invoices.reduce((s, i) => s + i.total, 0);
  const sentCount = invoices.filter((i) => sent.has(i.clientName)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2 text-sm">
        <span className="font-semibold">סיכום לקוחות</span>
        <span className="text-xs text-muted-foreground">
          נשלחו {sentCount} מתוך {invoices.length} חשבוניות · {'סה"כ לתשלום'} ₪{money(total)}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className={`${TH} text-start`}>לקוח</th>
            <th className={TH}>פעילויות</th>
            <th className={TH}>{'סה"כ לתשלום'}</th>
            <th className={TH}>חשבונית</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const isSent = sent.has(inv.clientName);
            return (
              <tr key={inv.clientName} className="border-b border-border/50 last:border-0">
                <td className={`${TD_LABEL} font-medium`}>{inv.clientName}</td>
                <td className={TD}>{inv.activities}</td>
                <td className={`${TD} font-semibold`}>₪{money(inv.total)}</td>
                <td className={TD}>
                  <button
                    type="button"
                    onClick={() => run(setInvoiceSent(inv.clientName, year, month, !isSent))}
                    title={isSent ? "סמן כלא נשלחה" : "סמן כנשלחה"}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isSent ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isSent ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isSent ? "נשלחה" : "לא נשלחה"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border bg-muted font-bold">
            <td className={TD_LABEL}>{'סה"כ'}</td>
            <td className={TD}>{invoices.reduce((s, i) => s + i.activities, 0)}</td>
            <td className={TD}>₪{money(total)}</td>
            <td className={TD}>{sentCount}/{invoices.length}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function OfficeHoursTable({
  rows,
  year,
  month,
  run,
}: {
  rows: Data["rows"];
  year: number;
  month: number;
  run: Run;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background py-8 text-center text-muted-foreground">
        אין עובדות משרד. ניתן להוסיף למטה.
      </div>
    );
  }

  const workerId = (r: Data["rows"][number]) => r.instructorId.replace(/^office__/, "");

  function saveWorker(
    r: Data["rows"][number],
    patch: Parameters<typeof updateOfficeWorker>[1]
  ) {
    run(updateOfficeWorker(workerId(r), patch));
  }

  function removeWorker(r: Data["rows"][number]) {
    if (!confirm(`להסיר את ${r.instructorName} מרשימת עובדי המשרד? (החודשים הקודמים לא יושפעו)`)) return;
    saveWorker(r, { is_active: false });
  }

  const total = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        עובדות משרד לא מזינות שעות במערכת - יש להזין כאן את מספר השעות לכל חודש. התעריף לשעה
        נשמר ועובר לחודשים הבאים.
      </p>
      <div className={SCROLL_BOX}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted text-xs text-muted-foreground">
              <th className={`${TH} text-start`}>עובד/ת</th>
              <th className={TH}>העסקה</th>
              <th className={TH}>תעריף לשעה</th>
              <th className={TH}>שעות החודש</th>
              <th className={TH}>שכר</th>
              <th className={TH}>הוצאות העסקה</th>
              <th className={TH}>{'סה"כ עלות'}</th>
              <th className={TH} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-border/50">
                <td className={`${TD_LABEL} font-medium`}>{r.instructorName}</td>
                <td className={TD}>
                  <select
                    value={r.employmentType}
                    onChange={(e) => saveWorker(r, { employment_type: e.target.value as "freelance" | "employee" })}
                    className="rounded-md border border-border bg-background px-1 py-0.5 text-xs"
                  >
                    <option value="freelance">עצמאי/ת</option>
                    <option value="employee">שכיר/ה</option>
                  </select>
                </td>
                <td className={TD}>
                  <NumberCell value={r.officeRate} onSave={(v) => saveWorker(r, { hourly_rate: v ?? 0 })} />
                </td>
                <td className={TD}>
                  <NumberCell
                    value={r.activityCount}
                    highlight
                    onSave={(v) => run(setOfficeWorkerHours(workerId(r), year, month, v ?? 0))}
                  />
                </td>
                <td className={TD}>₪{money(r.pay)}</td>
                <td className={TD}>₪{money(r.employerCost)}</td>
                <td className={`${TD} font-semibold`}>₪{money(r.total)}</td>
                <td className={TD}>
                  <button
                    type="button"
                    onClick={() => removeWorker(r)}
                    className="text-muted-foreground hover:text-red-600"
                    title="הסרה מרשימת עובדי המשרד"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted font-bold">
              <td className={TD_LABEL} colSpan={3}>{'סה"כ שעות משרד'}</td>
              <td className={TD}>{rows.reduce((s, r) => s + r.activityCount, 0)}</td>
              <td className={TD}>₪{money(rows.reduce((s, r) => s + r.pay, 0))}</td>
              <td className={TD}>₪{money(rows.reduce((s, r) => s + r.employerCost, 0))}</td>
              <td className={TD}>₪{money(total)}</td>
              <td className={TD} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function OfficeWorkerAdder({ run }: { run: Run }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");

  async function add() {
    const r = Number(rate) || 0;
    if (!name.trim()) return;
    await run(addOfficeWorker(name, r));
    setName("");
    setRate("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <Plus size={14} />
        הוספת עובד/ת משרד
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-background p-3 text-sm">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="שם מלא"
        className="min-w-[10rem] rounded-md border border-border bg-background px-2 py-1"
      />
      <input
        type="number"
        dir="ltr"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        placeholder="תעריף לשעה"
        className="w-28 rounded-md border border-border bg-background px-2 py-1 text-right"
      />
      <button
        type="button"
        onClick={add}
        className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
      >
        הוסף
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground">
        ביטול
      </button>
      <span className="w-full text-xs text-muted-foreground">
        העובד/ת יופיעו מעכשיו בכל חודש - רק להזין את מספר השעות. רשימה זו נפרדת מרשימת המדריכים.
      </span>
    </div>
  );
}

function CostBreakdown({ costs }: { costs: EmployerCosts }) {
  const items = [
    ["ביטוח לאומי", costs.bituach],
    ["פנסיה", costs.pension],
    ["פיצויים", costs.severance],
    ["חופשה והבראה", costs.provisions],
  ] as const;
  return (
    <div className="space-y-0.5 text-[11px] leading-tight text-muted-foreground">
      {items.map(([label, v]) => (
        <div key={label} className="flex justify-between gap-2">
          <span>{label}</span>
          <span className="tabular-nums">₪{money(v)}</span>
        </div>
      ))}
    </div>
  );
}

function Kpi({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${className}`}>₪{money(value)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function employmentLabel(r: { isOffice: boolean; employmentType: string }) {
  if (r.isOffice) return "משרד";
  return r.employmentType === "employee" ? "שכיר/ה" : "עצמאי/ת";
}

// Number input that saves on blur. Empty input saves null (= back to the default).
function NumberCell({
  value,
  onSave,
  highlight,
  title,
  width = "w-16",
}: {
  value: number;
  onSave: (v: number | null) => void;
  highlight?: boolean;
  title?: string;
  width?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  function commit() {
    if (draft.trim() === "") {
      onSave(null);
      return;
    }
    const n = Number(draft);
    if (Number.isNaN(n) || n === value) {
      setDraft(String(value));
      return;
    }
    onSave(n);
  }

  return (
    <input
      type="number"
      min={0}
      dir="ltr"
      title={title}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={`${width} rounded-md border px-1.5 py-0.5 text-center tabular-nums ${
        highlight ? "border-orange-300 bg-orange-50 font-semibold text-orange-800" : "border-border bg-background"
      }`}
    />
  );
}

function DetailTable({
  rows,
  instructors,
  themeByInstructor,
  pickOptions,
  year,
  month,
  run,
}: {
  rows: Data["rows"];
  instructors: Data["instructors"];
  themeByInstructor: Map<string, (typeof THEMES)[number]>;
  pickOptions: { clients: string[]; cities: string[] };
  year: number;
  month: number;
  run: Run;
}) {
  function saveRate(r: Data["rows"][number], field: "rate" | "travel", v: number | null) {
    run(
      updatePayRate(r.instructorId, r.clientName, r.city, {
        rate_per_lesson: field === "rate" ? v ?? 0 : r.ratePerLesson,
        travel_rate_per_day: field === "travel" ? v ?? 0 : r.travelPerDay,
      })
    );
  }

  function saveOverride(r: Data["rows"][number], field: "count" | "days", v: number | null) {
    // The cell shows override + manual lessons, so the override is what's left after the manual part.
    // Typing back the signature-based value clears the override.
    const base = (manual: number) => (v === null ? null : Math.max(0, v - manual));
    const c = base(r.manualCount);
    const d = base(r.manualDays);
    const count = field === "count" ? (c === r.signedCount ? null : c) : r.countOverride;
    const days = field === "days" ? (d === r.signedDays ? null : d) : r.daysOverride;
    run(
      setActivityOverride(r.instructorId, r.clientName, r.city, year, month, {
        activity_count: count,
        work_days: days,
      })
    );
  }

  const totals = rows.reduce(
    (t, r) => ({
      workDays: t.workDays + r.workDays,
      activities: t.activities + r.activityCount,
      pay: t.pay + r.pay,
      travel: t.travel + r.travel,
      employerCost: t.employerCost + r.employerCost,
      total: t.total + r.total,
    }),
    { workDays: 0, activities: 0, pay: 0, travel: 0, employerCost: 0, total: 0 }
  );
  const bonusTotal = instructors.reduce((s, i) => s + i.bonus, 0);
  const paidCount = instructors.filter((i) => i.paid).length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        פעילויות וימי עבודה מחושבים מהחתימות. ניתן לתקן ידנית - ערך מתוקן מסומן בכתום; מחיקת
        הערך מחזירה לחישוב מהחתימות. שיעורים שהוספו ידנית מסומנים בסגול ונכללים גם בחשבונית
        ללקוח. תעריפים נשמרים ועוברים לחודשים הבאים. שולם ל-{paidCount} מתוך {instructors.length} מדריכים.
      </p>
      <div className={SCROLL_BOX}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted text-xs text-muted-foreground">
              <th className={`${TH} text-start`}>מדריך / לקוח</th>
              <th className={TH}>תשלום לפעילות</th>
              <th className={TH}>נסיעות ליום</th>
              <th className={TH}>ימי עבודה</th>
              <th className={TH}>פעילויות</th>
              <th className={TH}>{'סה"כ פעילויות'}</th>
              <th className={TH}>נסיעות</th>
              <th className={TH}>הוצאות העסקה</th>
              <th className={TH}>{'סה"כ'}</th>
            </tr>
          </thead>
          {instructors.map((ins, idx) => {
            const theme = themeByInstructor.get(ins.id) ?? THEMES[0];
            const insRows = rows.filter((r) => r.instructorId === ins.id);
            return (
              <Fragment key={ins.id}>
              {idx > 0 && (
                <tbody aria-hidden>
                  <tr>
                    <td colSpan={9} className="h-3 p-0" />
                  </tr>
                </tbody>
              )}
              {/* Black frame around each instructor's block */}
              <tbody className="border-2 border-black">
                <tr className={`${theme.header} border-b border-black/30 font-bold`}>
                  <td className={`${TD_LABEL} ${theme.text}`} colSpan={3}>
                    <span className="flex items-center gap-2">
                      <PaidToggle
                        paid={ins.paid}
                        onChange={(p) => run(setPayeePaid(ins.id, year, month, p))}
                      />
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      {ins.name}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          ins.employmentType === "employee" && !ins.isOffice
                            ? "bg-orange-100 text-orange-700"
                            : "bg-white/70 text-muted-foreground"
                        }`}
                      >
                        {employmentLabel(ins)}
                      </span>
                      {ins.bonus !== 0 && (
                        <span className="text-[11px] font-normal text-muted-foreground">
                          כולל תוספות ₪{money(ins.bonus)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={TD}>{ins.workDays}</td>
                  <td className={TD}>{ins.activities}</td>
                  <td className={TD}>{money(ins.pay)}</td>
                  <td className={TD}>{money(ins.travel)}</td>
                  <td className={TD}>{money(ins.employerCost)}</td>
                  <td className={`${TD} ${theme.text}`}>₪{money(ins.total)}</td>
                </tr>
            {insRows.map((r) => (
              <tr
                key={r.key}
                className={`border-b border-border/50 ${!r.hasRate ? "bg-red-50/60" : ""}`}
              >
                <td className={`${TD_LABEL} ps-8`}>
                  {r.clientName}
                  {r.city && <span className="ms-1 text-xs text-muted-foreground">{r.city}</span>}
                  {r.manualCount > 0 && (
                    <ManualBadge
                      count={r.manualCount}
                      title={r.manualLessons
                        .map((m) => `+${m.lesson_count}${m.note ? ` - ${m.note}` : ""}`)
                        .join("\n")}
                    />
                  )}
                  {!r.hasRate && (
                    <span className="ms-2 text-[11px] font-bold text-red-600">ללא תעריף</span>
                  )}
                </td>
                <td className={TD}>
                  <NumberCell value={r.ratePerLesson} onSave={(v) => saveRate(r, "rate", v)} />
                </td>
                <td className={TD}>
                  <NumberCell value={r.travelPerDay} onSave={(v) => saveRate(r, "travel", v)} />
                </td>
                <td className={TD}>
                  <NumberCell
                    value={r.workDays}
                    width="w-14"
                    highlight={r.daysOverride !== null}
                    title={`מהחתימות: ${r.signedDays}${r.manualDays ? ` + ידני ${r.manualDays}` : ""}`}
                    onSave={(v) => saveOverride(r, "days", v)}
                  />
                </td>
                <td className={TD}>
                  <span className="inline-flex items-center gap-1">
                    <NumberCell
                      value={r.activityCount}
                      width="w-14"
                      highlight={r.countOverride !== null}
                      title={`מהחתימות: ${r.signedCount}${r.manualCount ? ` + ידני ${r.manualCount}` : ""}`}
                      onSave={(v) => saveOverride(r, "count", v)}
                    />
                    {r.countOverride !== null && (
                      <button
                        type="button"
                        title={`חזרה לחתימות (${r.signedCount})`}
                        onClick={() => saveOverride(r, "count", null)}
                        className="text-muted-foreground hover:text-orange-700"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </span>
                </td>
                <td className={TD}>{money(r.pay)}</td>
                <td className={TD}>{money(r.travel)}</td>
                <td className={TD}>{money(r.employerCost)}</td>
                <td className={`${TD} font-semibold`}>{money(r.total)}</td>
              </tr>
            ))}
                <InstructorExtrasRow
                  instructor={ins}
                  rows={insRows}
                  pickOptions={pickOptions}
                  year={year}
                  month={month}
                  run={run}
                />
              </tbody>
              </Fragment>
            );
          })}
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/40 font-bold">
              <td className={TD_LABEL} colSpan={3}>
                {'סה"כ'}
                {bonusTotal !== 0 && (
                  <span className="ms-2 text-xs font-normal text-muted-foreground">
                    כולל תוספות ₪{money(bonusTotal)}
                  </span>
                )}
              </td>
              <td className={TD}>{totals.workDays}</td>
              <td className={TD}>{totals.activities}</td>
              <td className={TD}>{money(totals.pay)}</td>
              <td className={TD}>{money(totals.travel)}</td>
              <td className={TD}>{money(totals.employerCost)}</td>
              <td className={TD}>{money(totals.total + bonusTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function PaidToggle({ paid, onChange }: { paid: boolean; onChange: (paid: boolean) => void }) {
  return (
    <label
      title={paid ? "סמן כלא שולם" : "סמן ששולם"}
      className={`flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${
        paid
          ? "border-emerald-400 bg-emerald-100 text-emerald-800"
          : "border-border bg-white/70 text-muted-foreground"
      }`}
    >
      <input
        type="checkbox"
        checked={paid}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-emerald-600"
      />
      {paid ? "שולם" : "לא שולם"}
    </label>
  );
}

function ManualBadge({ count, title }: { count: number; title?: string }) {
  return (
    <span
      title={title}
      className="ms-2 inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[11px] font-semibold text-purple-800"
    >
      <Hand size={10} />
      ידני +{count}
    </span>
  );
}

const CHIP = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";

// Bottom row of each instructor block: manually added lessons, special additions, and the add forms.
function InstructorExtrasRow({
  instructor,
  rows,
  pickOptions,
  year,
  month,
  run,
}: {
  instructor: Data["instructors"][number];
  rows: Data["rows"];
  pickOptions: { clients: string[]; cities: string[] };
  year: number;
  month: number;
  run: Run;
}) {
  const [open, setOpen] = useState<"" | "lessons" | "bonus">("");
  const manual = rows.flatMap((r) => r.manualLessons);

  return (
    <tr className="bg-white">
      <td colSpan={8} className="px-3 py-1.5 ps-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">תוספת מיוחדת:</span>
          {manual.map((m) => (
            <span key={m.id} className={`${CHIP} bg-purple-100 text-purple-800`}>
              <Hand size={10} />
              {m.client_name}
              {m.city && ` ${m.city}`} +{m.lesson_count} שיעורים
              {m.work_days > 0 && ` · ${m.work_days} ימים`}
              {m.note && <span className="text-purple-600">({m.note})</span>}
              <button
                type="button"
                title="מחיקת השיעורים הידניים"
                onClick={() => confirm("למחוק את השיעורים שהוספו ידנית?") && run(deleteManualLessons(m.id))}
                className="hover:text-red-600"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {instructor.bonusItems.map((b) => (
            <span key={b.id} className={`${CHIP} bg-amber-100 text-amber-800`}>
              {b.label} ₪{money(Number(b.amount))}
              <button
                type="button"
                title="מחיקת התוספת"
                onClick={() => confirm(`למחוק את התוספת "${b.label}"?`) && run(deletePayBonus(b.id))}
                className="hover:text-red-600"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setOpen(open === "bonus" ? "" : "bonus")}
            className="flex items-center gap-0.5 text-xs text-blue-600 hover:underline"
          >
            <Plus size={12} />
            תוספת
          </button>
          <button
            type="button"
            onClick={() => setOpen(open === "lessons" ? "" : "lessons")}
            className="flex items-center gap-0.5 text-xs text-purple-700 hover:underline"
          >
            <Plus size={12} />
            שיעורים ידנית
          </button>
        </div>
        {open === "bonus" && (
          <BonusAdder
            onAdd={(label, amount) => run(addPayBonus(instructor.id, year, month, label, amount))}
            onClose={() => setOpen("")}
          />
        )}
        {open === "lessons" && (
          <ManualLessonAdder
            presetInstructorId={instructor.id}
            clients={pickOptions.clients}
            cities={pickOptions.cities}
            year={year}
            month={month}
            run={run}
            startOpen
            onClose={() => setOpen("")}
          />
        )}
      </td>
      <td className={`${TD} text-amber-800`}>{instructor.bonus !== 0 ? money(instructor.bonus) : ""}</td>
    </tr>
  );
}

function BonusAdder({
  onAdd,
  onClose,
}: {
  onAdd: (label: string, amount: number) => Promise<void>;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  async function add() {
    const amt = Number(amount);
    if (!label.trim() || !amount || Number.isNaN(amt)) return;
    await onAdd(label, amt);
    onClose();
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
      <input
        autoFocus
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="תיאור (למשל: בונוס, החזר חניה)"
        className="min-w-[12rem] rounded-md border border-border bg-background px-2 py-1"
      />
      <input
        type="number"
        dir="ltr"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder="סכום"
        className="w-24 rounded-md border border-border bg-background px-2 py-1 text-right"
      />
      <button
        type="button"
        onClick={add}
        className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
      >
        הוסף
      </button>
      <button type="button" onClick={onClose} className="text-xs text-muted-foreground">
        ביטול
      </button>
    </div>
  );
}

// Adds lessons by hand. With `instructors` (or a preset instructor) they count for the instructor's
// pay and the client's invoice; without, they're billed to the client only.
function ManualLessonAdder({
  instructors,
  presetInstructorId,
  clients,
  cities,
  year,
  month,
  run,
  startOpen,
  onClose,
}: {
  instructors?: { id: string; full_name: string }[];
  presetInstructorId?: string;
  clients: string[];
  cities: string[];
  year: number;
  month: number;
  run: Run;
  startOpen?: boolean;
  onClose?: () => void;
}) {
  const forInstructor = !!instructors || !!presetInstructorId;
  const [open, setOpen] = useState(!!startOpen);
  const [instructorId, setInstructorId] = useState(presetInstructorId ?? "");
  const [client, setClient] = useState("");
  const [city, setCity] = useState("");
  const [count, setCount] = useState("");
  const [days, setDays] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const INPUT = "rounded-md border border-border bg-background px-2 py-1";
  const listId = `ml-${presetInstructorId ?? (forInstructor ? "ins" : "client")}`;

  function close() {
    setOpen(false);
    onClose?.();
  }

  async function add() {
    const n = Number(count);
    if ((forInstructor && !instructorId) || !client.trim() || !(n > 0)) return;
    setSaving(true);
    await run(
      addManualLessons({
        instructorId: forInstructor ? instructorId : null,
        clientName: client,
        city,
        year,
        month,
        lessonCount: n,
        workDays: Number(days) || 0,
        note,
      })
    );
    setSaving(false);
    setClient("");
    setCity("");
    setCount("");
    setDays("");
    setNote("");
    close();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm font-medium text-purple-700 hover:underline"
      >
        <Hand size={14} />
        {forInstructor ? "הוספת שיעורים ידנית למדריך" : "הוספת שיעורים ידנית ללקוח (לחשבונית בלבד)"}
      </button>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-sm ${
        startOpen ? "mt-1.5" : "rounded-xl border border-dashed border-purple-300 bg-purple-50/50 p-3"
      }`}
    >
      {instructors && !presetInstructorId && (
        <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className={INPUT}>
          <option value="">בחירת מדריך</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>{i.full_name}</option>
          ))}
        </select>
      )}
      <input
        list={`${listId}-clients`}
        value={client}
        onChange={(e) => setClient(e.target.value)}
        placeholder="לקוח"
        className={`${INPUT} w-36`}
      />
      <datalist id={`${listId}-clients`}>
        {clients.map((c) => <option key={c} value={c} />)}
      </datalist>
      <input
        list={`${listId}-cities`}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="עיר"
        className={`${INPUT} w-28`}
      />
      <datalist id={`${listId}-cities`}>
        {cities.map((c) => <option key={c} value={c} />)}
      </datalist>
      <input
        type="number"
        min={1}
        dir="ltr"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        placeholder="שיעורים"
        className={`${INPUT} w-20 text-right`}
      />
      {forInstructor && (
        <input
          type="number"
          min={0}
          dir="ltr"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="ימי עבודה"
          title="ימי עבודה נוספים לחישוב נסיעות (לא חובה)"
          className={`${INPUT} w-24 text-right`}
        />
      )}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="הערה (לא חובה)"
        className={`${INPUT} min-w-[8rem] flex-1`}
      />
      <button
        type="button"
        onClick={add}
        disabled={saving}
        className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        הוסף
      </button>
      <button type="button" onClick={close} className="text-xs text-muted-foreground">
        ביטול
      </button>
      {!startOpen && (
        <span className="w-full text-xs text-muted-foreground">
          {forInstructor
            ? "השיעורים יתווספו לשכר המדריך לפי התעריף שלו בלקוח/עיר, וייכללו גם בחשבונית ללקוח. יסומנו בסגול כ'ידני'."
            : "השיעורים יתווספו לחשבונית של הלקוח בלבד (ללא שכר מדריך). יסומנו בסגול כ'ידני'."}
        </span>
      )}
    </div>
  );
}

function PayrollTable({
  instructors,
  year,
  month,
  run,
}: {
  instructors: Data["instructors"];
  year: number;
  month: number;
  run: Run;
}) {
  const groups = [
    { label: "עצמאי/ת", items: instructors.filter((i) => !i.isOffice && i.employmentType === "freelance") },
    { label: "שכיר/ה", items: instructors.filter((i) => !i.isOffice && i.employmentType === "employee") },
    { label: "משרד", items: instructors.filter((i) => i.isOffice) },
  ];

  function sum(items: Data["instructors"]) {
    return items.reduce(
      (t, i) => ({
        workDays: t.workDays + i.workDays,
        activities: t.activities + i.activities,
        pay: t.pay + i.pay,
        travel: t.travel + i.travel,
        bonus: t.bonus + i.bonus,
        deposit: t.deposit + i.deposit,
        employerCost: t.employerCost + i.employerCost,
        total: t.total + i.total,
      }),
      { workDays: 0, activities: 0, pay: 0, travel: 0, bonus: 0, deposit: 0, employerCost: 0, total: 0 }
    );
  }

  function save(i: Data["instructors"][number], patch: Partial<{ employment_type: "freelance" | "employee"; employer_cost_pct: number; is_office: boolean }>) {
    run(
      updateEmploymentSettings(i.id, {
        employment_type: i.employmentType,
        employer_cost_pct: i.employerPct,
        is_office: i.isOffice,
        ...patch,
      })
    );
  }

  const instructorsOnly = sum([...groups[0].items, ...groups[1].items]);
  const grand = sum(instructors);

  function totalRow(label: string, t: ReturnType<typeof sum>, strong?: boolean) {
    return (
      <tr className={strong ? "border-y-2 border-border bg-blue-100/60 text-base font-bold" : "bg-amber-50 font-semibold"}>
        <td className={TD_LABEL} colSpan={3}>{label}</td>
        <td className={TD}>{t.workDays}</td>
        <td className={TD}>{t.activities}</td>
        <td className={TD}>{money(t.pay)}</td>
        <td className={TD}>{money(t.travel)}</td>
        <td className={TD}>{money(t.bonus)}</td>
        <td className={TD}>{money(t.deposit)}</td>
        <td className={TD}>{money(t.employerCost)}</td>
        <td className={TD}>{money(t.total)}</td>
        <td className={TD}>{t.activities > 0 ? money(t.total / t.activities) : "—"}</td>
      </tr>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        סוג העסקה נשמר לכל מדריך ועובר לחודשים הבאים. תיקונים/תוספות מגיעים מהתוספות במסך שכר
        מדריכים. הוצאות מעסיק לשכירים מחושבות אוטומטית לפי החישוב המקובל בישראל (הערכה, לא
        תלוש מדויק): ביטוח לאומי מעסיק (4.51% עד ₪7,522, 7.6% מעל), פנסיה 6.5%, פיצויים 6%,
        והפרשה לחופשה והבראה כ-6%.
      </p>
      <div className={SCROLL_BOX}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted text-xs text-muted-foreground">
              <th className={TH}>העסקה</th>
              <th className={TH}>פירוט הוצאות מעסיק</th>
              <th className={`${TH} text-start`}>מדריך</th>
              <th className={TH}>ימי עבודה</th>
              <th className={TH}>פעילויות</th>
              <th className={TH}>תשלום על פעילויות</th>
              <th className={TH}>נסיעות</th>
              <th className={TH}>תיקונים/תוספות</th>
              <th className={TH}>{'סה"כ להפקדה'}</th>
              <th className={TH}>הוצאות העסקה</th>
              <th className={TH}>{'סה"כ עלות'}</th>
              <th className={TH}>ממוצע לפעילות</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) =>
              g.items.length === 0 ? null : (
                <Fragment key={g.label}>
                  {g.label === "משרד" && (
                    <>
                      <tr>
                        <td colSpan={12} className="h-4 p-0" />
                      </tr>
                      <tr className="bg-slate-700 text-white">
                        <td colSpan={12} className="px-3 py-1.5 text-sm font-bold">
                          עובדי משרד
                        </td>
                      </tr>
                    </>
                  )}
                  {g.items.map((i) => (
                    <tr key={i.id} className="border-b border-border/50">
                      <td className={TD}>
                        {i.isOfficeWorker ? (
                          <span className="text-xs text-muted-foreground">{employmentLabel({ isOffice: false, employmentType: i.employmentType })}</span>
                        ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <select
                            value={i.employmentType}
                            onChange={(e) => save(i, { employment_type: e.target.value as "freelance" | "employee" })}
                            className="rounded-md border border-border bg-background px-1 py-0.5 text-xs"
                          >
                            <option value="freelance">עצמאי/ת</option>
                            <option value="employee">שכיר/ה</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={i.isOffice}
                              onChange={(e) => save(i, { is_office: e.target.checked })}
                            />
                            משרד
                          </label>
                        </span>
                        )}
                      </td>
                      <td className={TD}>
                        {i.costs ? (
                          <CostBreakdown costs={i.costs} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className={`${TD_LABEL} font-medium`}>
                        <span className="flex items-center gap-2">
                          <PaidToggle
                            paid={i.paid}
                            onChange={(p) => run(setPayeePaid(i.id, year, month, p))}
                          />
                          {i.name}
                        </span>
                      </td>
                      <td className={TD}>{i.workDays}</td>
                      <td className={TD}>{i.activities}</td>
                      <td className={TD}>{money(i.pay)}</td>
                      <td className={TD}>{money(i.travel)}</td>
                      <td className={TD}>{money(i.bonus)}</td>
                      <td className={`${TD} font-semibold text-blue-700`}>{money(i.deposit)}</td>
                      <td className={TD}>{money(i.employerCost)}</td>
                      <td className={`${TD} font-semibold`}>{money(i.total)}</td>
                      <td className={TD}>{i.activities > 0 ? money(i.average) : "—"}</td>
                    </tr>
                  ))}
                  {totalRow(`${g.label} סה"כ`, sum(g.items))}
                  {g.label === "שכיר/ה" && totalRow('סה"כ מדריכים', instructorsOnly, true)}
                </Fragment>
              )
            )}
          </tbody>
          <tfoot>
            {totalRow("סכום כולל", grand, true)}
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function OperatorsTable({
  operators,
  adjustmentsTotal,
  officeCost,
}: {
  operators: Data["operators"];
  adjustmentsTotal: number;
  officeCost: number;
}) {
  const t = operators.reduce(
    (s, o) => ({
      activities: s.activities + o.activities,
      income: s.income + o.income,
      expenses: s.expenses + o.expenses,
      diff: s.diff + o.diff,
    }),
    { activities: 0, income: 0, expenses: officeCost, diff: -officeCost }
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        תעריפי לקוחות מגיעים ממסך תשלום לקוחות. הוצאות הדרכה כוללות תשלום, נסיעות והוצאות העסקה
        (ללא תוספות חודשיות למדריך).
      </p>
      <div className={SCROLL_BOX}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted text-xs text-muted-foreground">
              <th className={`${TH} text-start`}>מפעיל</th>
              <th className={TH}>פעילויות</th>
              <th className={TH}>תשלום המפעיל לפעילות</th>
              <th className={TH}>הכנסות</th>
              <th className={TH}>הוצאות הדרכה</th>
              <th className={TH}>הפרש</th>
              <th className={TH}>ממוצע הכנסה לפעילות</th>
              <th className={TH}>ממוצע רווח לפעילות</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((o) => (
              <tr key={o.key} className={`border-b border-border/50 ${!o.rate ? "bg-red-50/60" : ""}`}>
                <td className={`${TD_LABEL} font-medium`}>
                  {o.clientName}
                  {o.city && <span className="ms-1 text-xs text-muted-foreground">{o.city}</span>}
                </td>
                <td className={TD}>{o.activities}</td>
                <td className={TD}>
                  {!o.rate ? (
                    <span className="text-xs font-bold text-red-600">לא הוגדר</span>
                  ) : o.rate.billing_mode === "fixed_monthly" ? (
                    <span className="text-xs">קבוע ₪{money(Number(o.rate.fixed_monthly_amount))}</span>
                  ) : (
                    `₪${money(Number(o.rate.rate_per_lesson))}`
                  )}
                </td>
                <td className={`${TD} text-blue-700`}>₪{money(o.income)}</td>
                <td className={TD}>₪{money(o.expenses)}</td>
                <td className={`${TD} font-semibold ${o.diff < 0 ? "text-red-600" : "text-emerald-700"}`}>
                  ₪{money(o.diff)}
                </td>
                <td className={TD}>{o.avgIncome === null ? "—" : `₪${money(o.avgIncome)}`}</td>
                <td className={`${TD} ${o.avgProfit !== null && o.avgProfit < 0 ? "text-red-600" : ""}`}>
                  {o.avgProfit === null ? "—" : `₪${money(o.avgProfit)}`}
                </td>
              </tr>
            ))}
            {adjustmentsTotal !== 0 && (
              <tr className="border-b border-border/50 text-muted-foreground">
                <td className={TD_LABEL} colSpan={3}>התאמות לקוחות (ממסך תשלום לקוחות)</td>
                <td className={TD}>₪{money(adjustmentsTotal)}</td>
                <td className={TD} colSpan={4} />
              </tr>
            )}
            {officeCost !== 0 && (
              <tr className="border-b border-border/50 text-muted-foreground">
                <td className={TD_LABEL} colSpan={3}>{OFFICE_CLIENT}</td>
                <td className={TD}>₪0</td>
                <td className={TD}>₪{money(officeCost)}</td>
                <td className={`${TD} text-red-600`}>₪{money(-officeCost)}</td>
                <td className={TD} colSpan={2} />
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-blue-100/60 font-bold">
              <td className={TD_LABEL}>{'סה"כ'}</td>
              <td className={TD}>{t.activities}</td>
              <td className={TD} />
              <td className={TD}>₪{money(t.income + adjustmentsTotal)}</td>
              <td className={TD}>₪{money(t.expenses)}</td>
              <td className={TD}>₪{money(t.diff + adjustmentsTotal)}</td>
              <td className={TD}>{t.activities > 0 ? `₪${money((t.income + adjustmentsTotal) / t.activities)}` : "—"}</td>
              <td className={TD}>{t.activities > 0 ? `₪${money((t.diff + adjustmentsTotal) / t.activities)}` : "—"}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function FixedExpensesSection({
  expenses,
  total,
  year,
  month,
  run,
}: {
  expenses: FixedExpense[];
  total: number;
  year: number;
  month: number;
  run: Run;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(true);
  const [adding, setAdding] = useState(false);

  async function add() {
    const amt = Number(amount);
    if (!label.trim() || !amount || Number.isNaN(amt)) return;
    setAdding(true);
    await run(addFixedExpense(label, amt, recurring, year, month));
    setAdding(false);
    setLabel("");
    setAmount("");
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-3 text-sm font-semibold">הוצאות קבועות</p>

      {expenses.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                {e.label}
                <span className="ms-2 text-xs text-muted-foreground">
                  {e.year === null ? "כל חודש" : "החודש בלבד"}
                </span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium tabular-nums">₪{money(Number(e.amount))}</span>
                <button
                  type="button"
                  onClick={() => run(deleteFixedExpense(e.id))}
                  className="text-muted-foreground hover:text-red-600"
                  title={e.year === null ? "מחיקה מכל החודשים" : "מחיקה"}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-1.5 text-sm font-semibold">
            <span>{'סה"כ הוצאות קבועות'}</span>
            <span className="tabular-nums">₪{money(total)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="תיאור (למשל: שכירות מחסן, ביטוח)"
          className="min-w-[10rem] flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <input
          type="number"
          dir="ltr"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="סכום"
          className="w-24 rounded-md border border-border bg-background px-2 py-1 text-right text-sm"
        />
        <select
          value={recurring ? "recurring" : "once"}
          onChange={(e) => setRecurring(e.target.value === "recurring")}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="recurring">כל חודש</option>
          <option value="once">החודש בלבד</option>
        </select>
        <button
          type="button"
          onClick={add}
          disabled={adding}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <Plus size={13} />
          הוסף
        </button>
      </div>
    </div>
  );
}

function ReportTable({
  instructors,
  rows,
}: {
  instructors: Data["instructors"];
  rows: Data["rows"];
}) {
  if (instructors.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
        אין עובדים שכירים החודש. ניתן לסמן מדריך כשכיר/ה בלשונית ריכוז שכר.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        סיכום לדיווח בלבד. נסיעות ליום מוגדרות בלשונית פירוט מדריכים.
      </p>
      <div className={SCROLL_BOX}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-amber-100 text-xs">
              <th className={`${TH} text-start`}>עובד / עיר</th>
              <th className={TH}>ימי עבודה</th>
              <th className={TH}>שעות / פעילויות</th>
              <th className={TH}>שכר</th>
              <th className={TH}>נסיעות ליום</th>
              <th className={TH}>תשלום נסיעות</th>
              <th className={TH}>תוספות</th>
            </tr>
          </thead>
          {instructors.map((i) => (
            <tbody key={i.id} className="border-t-[6px] border-background">
              <tr className="bg-amber-50 font-bold">
                <td className={TD_LABEL}>{i.name}</td>
                <td className={TD}>{i.workDays}</td>
                <td className={TD}>{i.activities}</td>
                <td className={TD}>₪{money(i.pay)}</td>
                <td className={TD} />
                <td className={TD}>₪{money(i.travel)}</td>
                <td className={TD}>{i.bonus ? `₪${money(i.bonus)}` : "—"}</td>
              </tr>
              {rows
                .filter((r) => r.instructorId === i.id)
                .map((r) => (
                  <tr key={r.key} className="border-b border-border/50">
                    <td className={`${TD_LABEL} ps-8`}>
                      {r.city || "—"}
                      <span className="ms-1 text-xs text-muted-foreground">{r.clientName}</span>
                    </td>
                    <td className={TD}>{r.workDays}</td>
                    <td className={TD}>{r.activityCount}</td>
                    <td className={TD}>₪{money(r.pay)}</td>
                    <td className={TD}>
                      {r.kind === "office" ? "—" : `₪${money(r.travelPerDay)}`}
                    </td>
                    <td className={TD}>₪{money(r.travel)}</td>
                    <td className={TD} />
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

function InvoicesTab({
  invoices,
  monthLabel,
  sent,
  year,
  month,
  run,
}: {
  invoices: Data["invoices"];
  monthLabel: string;
  sent: Set<string>;
  year: number;
  month: number;
  run: Run;
}) {
  const sentCount = invoices.filter((i) => sent.has(i.clientName)).length;
  function rateLabel(c: Data["operators"][number]) {
    if (!c.rate) return "לא הוגדר";
    if (c.rate.billing_mode === "fixed_monthly") return "סכום חודשי קבוע";
    return `₪${money(Number(c.rate.rate_per_lesson))}`;
  }

  function saveCount(c: Data["operators"][number], v: number | null) {
    // Typing back the instructor-rows value clears the correction.
    const count = v === null || v === c.rowActivities ? null : Math.max(0, Math.round(v));
    run(setInvoiceOverride(c.clientName, c.city, year, month, count));
  }

  function exportInvoice(inv: Data["invoices"][number]) {
    const lines: (string | number)[][] = [
      [`${inv.clientName} - ${monthLabel}`],
      [],
      ["עיר", "פעילויות", "תעריף", "סכום"],
    ];
    for (const c of inv.cities) {
      const rate = c.rate?.billing_mode === "fixed_monthly" ? "קבוע" : Number(c.rate?.rate_per_lesson ?? 0);
      lines.push([c.city, c.activities, rate, Math.round(c.income)]);
    }
    for (const a of inv.adjustments) {
      lines.push([a.label, "", "", Math.round(Number(a.amount))]);
    }
    lines.push([]);
    lines.push(['סה"כ לחשבונית', inv.activities, "", Math.round(inv.total)]);

    const csv = lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `חשבונית ${inv.clientName} ${monthLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const grand = invoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
          sentCount === invoices.length
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {sentCount === invoices.length ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        {sentCount === invoices.length
          ? `כל החשבוניות לחודש ${monthLabel} נשלחו (${sentCount})`
          : `נשלחו ${sentCount} מתוך ${invoices.length} חשבוניות לחודש ${monthLabel}`}
      </div>
      <p className="text-xs text-muted-foreground">
        {`ריכוז לחשבונית לכל לקוח, לפי עיר. הכמויות מבוססות על
        החתימות כולל תיקונים ידניים, וניתן לתקן אותן כאן לחשבונית בלבד (ערך מתוקן מסומן בכתום; מחיקה מחזירה לחישוב).
        התעריפים מגיעים ממסך תשלום לקוחות. סה"כ כל החשבוניות: ₪${money(grand)}`}
      </p>
      {invoices.map((inv) => {
        const isSent = sent.has(inv.clientName);
        return (
        <div
          key={inv.clientName}
          className={`overflow-hidden rounded-xl border bg-background ${isSent ? "border-emerald-300" : "border-border"}`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 ${
              isSent ? "bg-emerald-50" : "bg-blue-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <label
                className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${
                  isSent
                    ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSent}
                  onChange={(e) => run(setInvoiceSent(inv.clientName, year, month, e.target.checked))}
                  className="h-4 w-4 accent-emerald-600"
                />
                נשלחה חשבונית
              </label>
            <div>
              <p className="font-bold text-blue-900">{inv.clientName}</p>
              <p className="text-xs text-muted-foreground">
                {inv.activities} פעילויות · {inv.cities.length} ערים
              </p>
            </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tabular-nums text-blue-900">₪{money(inv.total)}</span>
              <button
                type="button"
                onClick={() => exportInvoice(inv)}
                className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
              >
                <Download size={12} />
                ייצוא
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className={`${TH} text-start`}>עיר</th>
                <th className={TH}>פעילויות</th>
                <th className={TH}>תעריף</th>
                <th className={TH}>סכום</th>
              </tr>
            </thead>
            <tbody>
              {inv.cities.map((c) => (
                <tr key={c.key} className="border-b border-border/50">
                  <td className={TD_LABEL}>
                    {c.city || "—"}
                    {c.instructorManualCount + c.manualCount > 0 && (
                      <ManualBadge
                        count={c.instructorManualCount + c.manualCount}
                        title={[
                          c.instructorManualCount > 0 && `${c.instructorManualCount} דרך מדריכים`,
                          c.manualCount > 0 && `${c.manualCount} ללקוח בלבד`,
                        ].filter(Boolean).join("\n")}
                      />
                    )}
                    {c.manualLessons.map((m) => (
                      <span key={m.id} className={`${CHIP} ms-1 bg-purple-50 text-purple-700`}>
                        +{m.lesson_count}
                        {m.note && ` ${m.note}`}
                        <button
                          type="button"
                          title="מחיקת השיעורים הידניים"
                          onClick={() => confirm("למחוק את השיעורים שהוספו ידנית?") && run(deleteManualLessons(m.id))}
                          className="hover:text-red-600"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </td>
                  <td className={TD}>
                    <span className="inline-flex items-center gap-1">
                      <NumberCell
                        value={c.activities}
                        width="w-14"
                        highlight={c.invoiceOverride !== null}
                        title={`לפי פירוט מדריכים${c.manualCount ? " + ידני" : ""}: ${c.rowActivities}`}
                        onSave={(v) => saveCount(c, v)}
                      />
                      {c.invoiceOverride !== null && (
                        <button
                          type="button"
                          title={`חזרה לחישוב (${c.rowActivities})`}
                          onClick={() => saveCount(c, null)}
                          className="text-muted-foreground hover:text-orange-700"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </span>
                  </td>
                  <td className={`${TD} ${!c.rate ? "text-red-600" : ""}`}>{rateLabel(c)}</td>
                  <td className={TD}>₪{money(c.income)}</td>
                </tr>
              ))}
              {inv.adjustments.map((a, idx) => (
                <tr key={`adj-${idx}`} className="border-b border-border/50">
                  <td className={TD_LABEL} colSpan={3}>{a.label}</td>
                  <td className={TD}>₪{money(Number(a.amount))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-blue-50 font-bold">
                <td className={TD_LABEL}>{'סה"כ לחשבונית'}</td>
                <td className={TD}>{inv.activities}</td>
                <td className={TD} />
                <td className={TD}>₪{money(inv.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        );
      })}
    </div>
  );
}
