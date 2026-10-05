"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Download, Filter, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { updatePayRate } from "@/lib/actions/payroll";
import {
  updateEmploymentSettings,
  setActivityOverride,
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

interface Props {
  lessons: LessonData[];
  payRates: PayRate[];
  payExceptions: { lesson_id: string; amount: number }[];
  bonuses: { instructor_id: string; amount: number }[];
  clientRates: ClientRate[];
  clientExceptions: { lesson_id: string; amount: number }[];
  adjustments: { client_name: string; amount: number }[];
  settings: Settings[];
  overrides: Override[];
  fixedExpenses: FixedExpense[];
  year: number;
  month: number;
  monthLabel: string;
}

const DEFAULT_EMPLOYER_PCT = 25;

const TABS = [
  { key: "detail", label: "פירוט מדריכים" },
  { key: "payroll", label: "ריכוז שכר" },
  { key: "operators", label: "הכנסות מול הוצאות" },
  { key: "report", label: "דיווח לשכר" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function money(n: number) {
  return n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
}

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

const TH = "px-3 py-2 text-center font-semibold whitespace-nowrap";
const TD = "px-3 py-1.5 text-center tabular-nums whitespace-nowrap";
const TD_LABEL = "px-3 py-1.5 whitespace-nowrap";

function computeReport(
  {
    lessons, payRates, payExceptions, bonuses, clientRates, clientExceptions,
    adjustments, settings, overrides, fixedExpenses,
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

    const allRows = [...rowLessons.entries()].map(([k, ls]) => {
      const first = ls[0];
      const s = settingsMap.get(first.instructor_id);
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
      const activityCount = countOverride ?? signedCount;
      const workDays = daysOverride ?? signedDays;

      // Per-lesson exceptions from שכר מדריכים shift the total by their delta from the rate.
      let exceptionDelta = 0;
      for (const l of signed) {
        const ex = payExMap.get(l.id);
        if (ex !== undefined) exceptionDelta += ex - ratePerLesson;
      }

      const pay = activityCount * ratePerLesson + exceptionDelta;
      const travel = workDays * travelPerDay;
      const employerCost =
        employmentType === "employee" ? ((pay + travel) * employerPct) / 100 : 0;

      return {
        key: k,
        instructorId: first.instructor_id,
        instructorName: first.instructor_name,
        clientName: first.client_name,
        city: first.city,
        employmentType,
        employerPct,
        isOffice,
        hasRate: !!rate,
        ratePerLesson,
        travelPerDay,
        signedCount,
        signedDays,
        countOverride,
        daysOverride,
        activityCount,
        workDays,
        signedLessons: signed,
        pay,
        travel,
        employerCost,
        total: pay + travel + employerCost,
      };
    });

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
      if (f.onlyOverridden && r.countOverride === null && r.daysOverride === null) return false;
      if (f.onlyMissingRate && r.hasRate) return false;
      return true;
    });

    const isFiltered = rows.length !== allRows.length;
    // Client adjustments have no instructor/city — only meaningful unfiltered or filtered by client.
    const adjustmentsApply =
      !f.instructorId && !f.city && !f.employment && !f.onlyOverridden && !f.onlyMissingRate;

    // Instructors
    const bonusByInstructor = new Map<string, number>();
    for (const b of bonuses) {
      bonusByInstructor.set(b.instructor_id, (bonusByInstructor.get(b.instructor_id) ?? 0) + Number(b.amount));
    }

    const instructorMap = new Map<string, typeof rows>();
    for (const r of rows) {
      if (!instructorMap.has(r.instructorId)) instructorMap.set(r.instructorId, []);
      instructorMap.get(r.instructorId)!.push(r);
    }

    const instructors = [...instructorMap.entries()].map(([id, rs]) => {
      const f = rs[0];
      const bonus = bonusByInstructor.get(id) ?? 0;
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
        workDays: rs.reduce((s, r) => s + r.workDays, 0),
        activities,
        pay,
        travel,
        bonus,
        deposit,
        employerCost,
        total,
        average: activities > 0 ? total / activities : 0,
      };
    });
    instructors.sort((a, b) => a.name.localeCompare(b.name, "he"));

    // Operators: client × city
    const operatorMap = new Map<string, typeof rows>();
    for (const r of rows) {
      const k = `${r.clientName}__${r.city}`;
      if (!operatorMap.has(k)) operatorMap.set(k, []);
      operatorMap.get(k)!.push(r);
    }

    const operators = [...operatorMap.entries()].map(([k, rs]) => {
      const rate = clientRateMap.get(k);
      const activities = rs.reduce((s, r) => s + r.activityCount, 0);
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
        clientName: rs[0].clientName,
        city: rs[0].city,
        rate,
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

    const adjustmentsTotal = adjustmentsApply
      ? adjustments
          .filter((a) => !f.client || a.client_name === f.client)
          .reduce((s, a) => s + Number(a.amount), 0)
      : 0;
    const income = operators.reduce((s, o) => s + o.income, 0) + adjustmentsTotal;
    const wageCost = instructors.reduce((s, i) => s + i.total, 0);
    const fixedTotal = fixedExpenses.reduce((s, e) => s + Number(e.amount), 0);

    return {
      allRows,
      isFiltered,
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

  // Theme by position in the unfiltered list so an instructor keeps its color when filtering.
  const themeByInstructor = useMemo(() => {
    const m = new Map<string, (typeof THEMES)[number]>();
    options.instructors.forEach(([id], idx) => m.set(id, THEMES[idx % THEMES.length]));
    return m;
  }, [options.instructors]);

  const unpricedRows = data.rows.filter((r) => !r.hasRate).length;
  const unpricedOperators = data.operators.filter((o) => !o.rate).length;

  function exportCsv() {
    const lines: (string | number)[][] = [];
    lines.push([`רווח והפסד - ${monthLabel}${data.isFiltered ? " (מסונן)" : ""}`]);
    lines.push([]);
    lines.push(["פירוט מדריכים"]);
    lines.push(["העסקה", "מדריך", "לקוח", "עיר", "תשלום לפעילות", "נסיעות ליום", "ימי עבודה", "פעילויות", 'סה"כ פעילויות', "נסיעות", "הוצאות העסקה", 'סה"כ']);
    for (const r of data.rows) {
      lines.push([
        r.isOffice ? "משרד" : r.employmentType === "employee" ? "שכיר/ה" : "עצמאי/ת",
        r.instructorName, r.clientName, r.city, r.ratePerLesson, r.travelPerDay,
        r.workDays, r.activityCount, Math.round(r.pay), Math.round(r.travel),
        Math.round(r.employerCost), Math.round(r.total),
      ]);
    }
    lines.push([]);
    lines.push(["ריכוז שכר"]);
    lines.push(["העסקה", "מדריך", "ימי עבודה", "פעילויות", "תשלום על פעילויות", "נסיעות", "תיקונים/תוספות", 'סה"כ להפקדה', "הוצאות העסקה", 'סה"כ עלות', "ממוצע לפעילות"]);
    for (const i of data.instructors) {
      lines.push([
        i.isOffice ? "משרד" : i.employmentType === "employee" ? "שכיר/ה" : "עצמאי/ת",
        i.name, i.workDays, i.activities, Math.round(i.pay), Math.round(i.travel),
        Math.round(i.bonus), Math.round(i.deposit), Math.round(i.employerCost),
        Math.round(i.total), Math.round(i.average),
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

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        options={options}
        shown={data.rows.length}
        total={data.allRows.length}
      />

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

      {data.rows.length > 0 && tab === "detail" && (
        <DetailTable
          rows={data.rows}
          instructors={data.instructors}
          themeByInstructor={themeByInstructor}
          year={year}
          month={month}
          run={run}
        />
      )}
      {data.rows.length > 0 && tab === "payroll" && (
        <PayrollTable instructors={data.instructors} run={run} />
      )}
      {tab === "operators" && (
        <div className="space-y-4">
          {data.rows.length > 0 && (
            <OperatorsTable
              operators={data.operators}
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
      {data.rows.length > 0 && tab === "report" && (
        <ReportTable instructors={data.instructors.filter((i) => i.employmentType === "employee")} />
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
  year,
  month,
  run,
}: {
  rows: Data["rows"];
  instructors: Data["instructors"];
  themeByInstructor: Map<string, (typeof THEMES)[number]>;
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
    // Typing back the signature-based value clears the override.
    const count = field === "count" ? (v === r.signedCount ? null : v) : r.countOverride;
    const days = field === "days" ? (v === r.signedDays ? null : v) : r.daysOverride;
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

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        פעילויות וימי עבודה מחושבים מהחתימות. ניתן לתקן ידנית - ערך מתוקן מסומן בכתום; מחיקת
        הערך מחזירה לחישוב מהחתימות. תעריפים נשמרים ועוברים לחודשים הבאים.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
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
          {instructors.map((ins) => {
            const theme = themeByInstructor.get(ins.id) ?? THEMES[0];
            const insRows = rows.filter((r) => r.instructorId === ins.id);
            return (
              <tbody key={ins.id} className="border-t-[6px] border-background">
                <tr
                  className={`${theme.header} font-bold`}
                  style={{ boxShadow: `inset -4px 0 0 ${theme.accent}` }}
                >
                  <td className={`${TD_LABEL} ${theme.text}`} colSpan={3}>
                    <span className="flex items-center gap-2">
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
                          + תוספות ₪{money(ins.bonus)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={TD}>{ins.workDays}</td>
                  <td className={TD}>{ins.activities}</td>
                  <td className={TD}>{money(ins.pay)}</td>
                  <td className={TD}>{money(ins.travel)}</td>
                  <td className={TD}>{money(ins.employerCost)}</td>
                  <td className={`${TD} ${theme.text}`}>₪{money(ins.total - ins.bonus)}</td>
                </tr>
            {insRows.map((r) => (
              <tr
                key={r.key}
                className={`border-b border-border/50 ${!r.hasRate ? "bg-red-50/60" : ""}`}
                style={{ boxShadow: `inset -4px 0 0 ${theme.accent}` }}
              >
                <td className={`${TD_LABEL} ps-8`}>
                  {r.clientName}
                  {r.city && <span className="ms-1 text-xs text-muted-foreground">{r.city}</span>}
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
                    title={`מהחתימות: ${r.signedDays}`}
                    onSave={(v) => saveOverride(r, "days", v)}
                  />
                </td>
                <td className={TD}>
                  <span className="inline-flex items-center gap-1">
                    <NumberCell
                      value={r.activityCount}
                      width="w-14"
                      highlight={r.countOverride !== null}
                      title={`מהחתימות: ${r.signedCount}`}
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
              </tbody>
            );
          })}
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/40 font-bold">
              <td className={TD_LABEL} colSpan={3}>{'סה"כ (ללא תוספות)'}</td>
              <td className={TD}>{totals.workDays}</td>
              <td className={TD}>{totals.activities}</td>
              <td className={TD}>{money(totals.pay)}</td>
              <td className={TD}>{money(totals.travel)}</td>
              <td className={TD}>{money(totals.employerCost)}</td>
              <td className={TD}>{money(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function PayrollTable({ instructors, run }: { instructors: Data["instructors"]; run: Run }) {
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
        סוג העסקה ואחוז הוצאות מעסיק נשמרים לכל מדריך ועוברים לחודשים הבאים. תיקונים/תוספות
        מגיעים מהתוספות במסך שכר מדריכים.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <th className={TH}>העסקה</th>
              <th className={TH}>% מעסיק</th>
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
                  {g.items.map((i) => (
                    <tr key={i.id} className="border-b border-border/50">
                      <td className={TD}>
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
                      </td>
                      <td className={TD}>
                        {i.employmentType === "employee" ? (
                          <NumberCell
                            value={i.employerPct}
                            width="w-14"
                            onSave={(v) => save(i, { employer_cost_pct: v ?? DEFAULT_EMPLOYER_PCT })}
                          />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className={`${TD_LABEL} font-medium`}>{i.name}</td>
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
}: {
  operators: Data["operators"];
  adjustmentsTotal: number;
}) {
  const t = operators.reduce(
    (s, o) => ({
      activities: s.activities + o.activities,
      income: s.income + o.income,
      expenses: s.expenses + o.expenses,
      diff: s.diff + o.diff,
    }),
    { activities: 0, income: 0, expenses: 0, diff: 0 }
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        תעריפי לקוחות מגיעים ממסך תשלום לקוחות. הוצאות הדרכה כוללות תשלום, נסיעות והוצאות העסקה
        (ללא תוספות חודשיות למדריך).
      </p>
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
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

function ReportTable({ instructors }: { instructors: Data["instructors"] }) {
  if (instructors.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
        אין עובדים שכירים החודש. ניתן לסמן מדריך כשכיר/ה בלשונית ריכוז שכר.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-background">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-amber-100/70 text-xs">
            <th className={`${TH} text-start`}>עובד</th>
            <th className={TH}>ימי עבודה</th>
            <th className={TH}>שעות / פעילויות</th>
            <th className={TH}>שכר</th>
            <th className={TH}>תשלום נסיעות</th>
            <th className={TH}>תוספות</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((i) => (
            <tr key={i.id} className="border-b border-border/50">
              <td className={`${TD_LABEL} font-medium`}>{i.name}</td>
              <td className={TD}>{i.workDays}</td>
              <td className={TD}>{i.activities}</td>
              <td className={TD}>₪{money(i.pay)}</td>
              <td className={TD}>₪{money(i.travel)}</td>
              <td className={TD}>{i.bonus ? `₪${money(i.bonus)}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
