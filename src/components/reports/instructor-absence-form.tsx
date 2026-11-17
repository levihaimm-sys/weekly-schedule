"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Download, Loader2 } from "lucide-react";
import {
  getInstructorAbsenceReport,
  InstructorAbsenceRow,
} from "@/lib/actions/instructor-absence-report";

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

type SortKey =
  | "instructorName" | "month" | "scheduled" | "held" | "absences" | "absencePct"
  | "cancelled" | "lateness" | "coveredForOthers" | "cost" | "avgPrice";

const COL = "px-3 py-2 text-center tabular-nums";

function money(n: number | null) {
  return n === null ? "—" : n.toLocaleString("he-IL", { maximumFractionDigits: 2 });
}

function csvCell(value: string | number) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function InstructorAbsenceForm({ instructors }: { instructors: { full_name: string }[] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<InstructorAbsenceRow[] | null>(null);
  const [showCost, setShowCost] = useState(false);
  const [filterInstructor, setFilterInstructor] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("instructorName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    setError(null);
    startTransition(async () => {
      const res = await getInstructorAbsenceReport(year);
      if (res.error) setError(res.error);
      else {
        setRows(res.data ?? []);
        setShowCost(!!res.showCost);
      }
    });
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "instructorName" || key === "month" ? "asc" : "desc");
    }
  }

  const visible = useMemo(() => {
    if (!rows) return [];
    const list = rows.filter((r) => !filterInstructor || r.instructorName === filterInstructor);
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? -1;
      const bv = b[sortKey] ?? -1;
      const cmp =
        typeof av === "string"
          ? av.localeCompare(String(bv), "he")
          : (av as number) - (bv as number);
      return (
        cmp * dir ||
        a.instructorName.localeCompare(b.instructorName, "he") ||
        a.month - b.month
      );
    });
  }, [rows, filterInstructor, sortKey, sortDir]);

  const totals = useMemo(() => {
    const t = { scheduled: 0, held: 0, absences: 0, cancelled: 0, lateness: 0, coveredForOthers: 0, cost: 0 };
    for (const r of visible) {
      t.scheduled += r.scheduled;
      t.held += r.held;
      t.absences += r.absences;
      t.cancelled += r.cancelled;
      t.lateness += r.lateness;
      t.coveredForOthers += r.coveredForOthers;
      t.cost += r.cost ?? 0;
    }
    return t;
  }, [visible]);

  function downloadCsv() {
    const header = ["מדריך", "חודש", "שיעורים משובצים", "התקיימו", "חיסורים", "% חיסורים", "ביטולים", "איחורים", "מילוי מקום"];
    if (showCost) header.push("עלות", "מחיר ממוצע לשיעור");
    const lines: (string | number)[][] = [header];
    for (const r of visible) {
      const line: (string | number)[] = [
        r.instructorName, MONTHS[r.month - 1], r.scheduled, r.held, r.absences,
        r.absencePct.toFixed(1), r.cancelled, r.lateness, r.coveredForOthers,
      ];
      if (showCost) line.push(r.cost ?? 0, (r.avgPrice ?? 0).toFixed(2));
      lines.push(line);
    }
    const csv = lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `חיסורים וביטולים לפי מדריך ${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function Th({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k;
    return (
      <th className="px-3 py-2.5 text-center first:text-right">
        <button
          onClick={() => toggleSort(k)}
          className="inline-flex items-center gap-1 font-medium hover:text-foreground"
        >
          {label}
          {active && (sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">שנה</label>
          <select
            value={year}
            onChange={(e) => { setYear(Number(e.target.value)); setRows(null); }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {[2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">מדריך</label>
          <select
            value={filterInstructor}
            onChange={(e) => setFilterInstructor(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">כל המדריכים</option>
            {instructors.map((i) => <option key={i.full_name} value={i.full_name}>{i.full_name}</option>)}
          </select>
        </div>
        <button
          onClick={load}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          הצג דוח
        </button>
        {rows && rows.length > 0 && (
          <button
            onClick={downloadCsv}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download size={14} />
            ייצוא לאקסל
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {rows && visible.length === 0 && (
        <p className="rounded-xl border border-border bg-background py-10 text-center text-sm text-muted-foreground">
          אין נתונים לתקופה זו
        </p>
      )}

      {visible.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            לחיצה על כותרת עמודה ממיינת לפיה. חיסור נספר פעם אחת (לא גם כביטול). "התקיימו" = שיעורים שלא בוטלו, כמו במסך שכר מדריכים.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <Th k="instructorName" label="מדריך" />
                  <Th k="month" label="חודש" />
                  <Th k="scheduled" label="משובצים" />
                  <Th k="held" label="התקיימו" />
                  <Th k="absences" label="חיסורים" />
                  <Th k="absencePct" label="% חיסורים" />
                  <Th k="cancelled" label="ביטולים" />
                  <Th k="lateness" label="איחורים" />
                  <Th k="coveredForOthers" label="מילוי מקום" />
                  {showCost && <Th k="cost" label="עלות" />}
                  {showCost && <Th k="avgPrice" label="מחיר ממוצע" />}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={`${r.instructorId}-${r.month}`} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium">{r.instructorName}</td>
                    <td className="px-3 py-2 text-center">{MONTHS[r.month - 1]}</td>
                    <td className={COL}>{r.scheduled}</td>
                    <td className={`${COL} text-green-700`}>{r.held}</td>
                    <td className={`${COL} font-medium ${r.absences ? "text-red-600" : ""}`}>{r.absences}</td>
                    <td className={COL}>{r.absencePct.toFixed(1)}%</td>
                    <td className={`${COL} ${r.cancelled ? "text-orange-600" : ""}`}>{r.cancelled}</td>
                    <td className={COL}>{r.lateness}</td>
                    <td className={COL}>{r.coveredForOthers}</td>
                    {showCost && <td className={COL}>₪{money(r.cost)}</td>}
                    {showCost && <td className={COL}>₪{money(r.avgPrice)}</td>}
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/30 text-xs font-semibold">
                  <td colSpan={2} className="px-3 py-2 text-muted-foreground">סה"כ</td>
                  <td className={COL}>{totals.scheduled}</td>
                  <td className={COL}>{totals.held}</td>
                  <td className={COL}>{totals.absences}</td>
                  <td className={COL}>
                    {totals.scheduled > 0 ? ((totals.absences / totals.scheduled) * 100).toFixed(1) : "0.0"}%
                  </td>
                  <td className={COL}>{totals.cancelled}</td>
                  <td className={COL}>{totals.lateness}</td>
                  <td className={COL}>{totals.coveredForOthers}</td>
                  {showCost && <td className={COL}>₪{money(totals.cost)}</td>}
                  {showCost && (
                    <td className={COL}>₪{money(totals.held > 0 ? totals.cost / totals.held : 0)}</td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
