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

// ─── Charts (plain SVG/CSS, no chart library) ─────────────────────────────────

type MonthPoint = { month: number; absences: number; cancelled: number; held: number; cost: number };

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function MonthlyBars({
  data,
  selected,
  onSelect,
}: {
  data: MonthPoint[];
  selected: number;
  onSelect: (month: number) => void;
}) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.absences, d.cancelled)));
  const W = 480, H = 200, padL = 24, padB = 22, padT = 14;
  const innerW = W - padL, innerH = H - padB - padT;
  const slot = innerW / 12;
  const barW = slot * 0.32;
  const y = (v: number) => padT + innerH - (v / max) * innerH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" dir="ltr" role="img" aria-label="חיסורים וביטולים לפי חודש">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(max * t)} y2={y(max * t)} stroke="currentColor" opacity={0.1} />
          <text x={padL - 4} y={y(max * t) + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity={0.5}>
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const x0 = padL + i * slot + slot * 0.15;
        const dim = selected && selected !== d.month ? 0.35 : 1;
        return (
          <g key={d.month} onClick={() => onSelect(d.month)} style={{ cursor: "pointer" }} opacity={dim}>
            <rect x={padL + i * slot} y={padT} width={slot} height={innerH + padB} fill="transparent" />
            <rect x={x0} y={y(d.absences)} width={barW} height={padT + innerH - y(d.absences)} rx={2} fill="#dc2626" />
            <rect x={x0 + barW + 2} y={y(d.cancelled)} width={barW} height={padT + innerH - y(d.cancelled)} rx={2} fill="#f97316" />
            {d.absences > 0 && (
              <text x={x0 + barW / 2} y={y(d.absences) - 2} textAnchor="middle" fontSize="8" fill="#dc2626">{d.absences}</text>
            )}
            {d.cancelled > 0 && (
              <text x={x0 + barW * 1.5 + 2} y={y(d.cancelled) - 2} textAnchor="middle" fontSize="8" fill="#f97316">{d.cancelled}</text>
            )}
            <text x={padL + i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
              {MONTHS[i].slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function InstructorBars({ data }: { data: { name: string; absences: number; cancelled: number }[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">אין חיסורים או ביטולים בתקופה זו</p>;
  }
  const max = Math.max(1, ...data.map((d) => d.absences + d.cancelled));
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2 text-xs">
          <span className="w-28 shrink-0 truncate" title={d.name}>{d.name}</span>
          <div className="flex h-4 flex-1 overflow-hidden rounded bg-muted/40" dir="ltr">
            <div style={{ width: `${(d.absences / max) * 100}%`, background: "#dc2626" }} title={`חיסורים: ${d.absences}`} />
            <div style={{ width: `${(d.cancelled / max) * 100}%`, background: "#f97316" }} title={`ביטולים: ${d.cancelled}`} />
          </div>
          <span className="w-14 shrink-0 text-center tabular-nums text-muted-foreground">
            {d.absences} / {d.cancelled}
          </span>
        </div>
      ))}
    </div>
  );
}

function AvgPriceLine({ data }: { data: MonthPoint[] }) {
  const pts = data.map((d) => ({ month: d.month, v: d.held > 0 ? d.cost / d.held : null }));
  const vals = pts.map((p) => p.v).filter((v): v is number => v !== null);
  if (vals.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">אין נתונים</p>;
  const max = Math.max(...vals) * 1.1 || 1;
  const W = 960, H = 180, padL = 36, padB = 22, padT = 14;
  const slot = (W - padL) / 12;
  const x = (i: number) => padL + i * slot + slot / 2;
  const y = (v: number) => padT + (H - padB - padT) - (v / max) * (H - padB - padT);
  const line = pts
    .map((p, i) => (p.v === null ? null : `${x(i)},${y(p.v)}`))
    .filter(Boolean)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" dir="ltr" role="img" aria-label="מחיר ממוצע לשיעור לפי חודש">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(max * t)} y2={y(max * t)} stroke="currentColor" opacity={0.1} />
          <text x={padL - 4} y={y(max * t) + 3} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.5}>
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      <polyline points={line} fill="none" stroke="#2563eb" strokeWidth={2} />
      {pts.map((p, i) =>
        p.v === null ? null : (
          <g key={p.month}>
            <circle cx={x(i)} cy={y(p.v)} r={3.5} fill="#2563eb" />
            <text x={x(i)} y={y(p.v) - 7} textAnchor="middle" fontSize="10" fill="#2563eb">{Math.round(p.v)}</text>
          </g>
        )
      )}
      {MONTHS.map((m, i) => (
        <text key={m} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
          {m.slice(0, 3)}
        </text>
      ))}
    </svg>
  );
}

export function InstructorAbsenceForm({ instructors }: { instructors: { full_name: string }[] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<InstructorAbsenceRow[] | null>(null);
  const [showCost, setShowCost] = useState(false);
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterMonth, setFilterMonth] = useState(0); // 0 = all months
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

  // Rows filtered by instructor only: feeds the yearly month-by-month chart
  const byInstructorRows = useMemo(
    () => (rows ?? []).filter((r) => !filterInstructor || r.instructorName === filterInstructor),
    [rows, filterInstructor]
  );

  const monthly = useMemo(() => {
    const m = MONTHS.map((_, i) => ({ month: i + 1, absences: 0, cancelled: 0, held: 0, cost: 0 }));
    for (const r of byInstructorRows) {
      const t = m[r.month - 1];
      t.absences += r.absences;
      t.cancelled += r.cancelled;
      t.held += r.held;
      t.cost += r.cost ?? 0;
    }
    return m;
  }, [byInstructorRows]);

  const perInstructor = useMemo(() => {
    const map = new Map<string, { name: string; absences: number; cancelled: number }>();
    for (const r of byInstructorRows) {
      if (filterMonth && r.month !== filterMonth) continue;
      const e = map.get(r.instructorId) ?? { name: r.instructorName, absences: 0, cancelled: 0 };
      e.absences += r.absences;
      e.cancelled += r.cancelled;
      map.set(r.instructorId, e);
    }
    return [...map.values()]
      .filter((e) => e.absences + e.cancelled > 0)
      .sort((a, b) => b.absences + b.cancelled - (a.absences + a.cancelled))
      .slice(0, 15);
  }, [byInstructorRows, filterMonth]);

  const visible = useMemo(() => {
    if (!rows) return [];
    const list = rows.filter(
      (r) =>
        (!filterInstructor || r.instructorName === filterInstructor) &&
        (!filterMonth || r.month === filterMonth)
    );
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
  }, [rows, filterInstructor, filterMonth, sortKey, sortDir]);

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
          <label className="mb-1 block text-xs font-medium text-muted-foreground">חודש</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value={0}>כל החודשים</option>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
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

      {rows && rows.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="mb-1 text-sm font-semibold">
              חיסורים וביטולים לפי חודש{filterInstructor ? ` – ${filterInstructor}` : " – כל המדריכים"}
            </h4>
            <Legend items={[["#dc2626", "חיסורים"], ["#f97316", "ביטולים"]]} />
            <MonthlyBars data={monthly} selected={filterMonth} onSelect={(m) => setFilterMonth(m === filterMonth ? 0 : m)} />
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <h4 className="mb-1 text-sm font-semibold">
              לפי מדריך{filterMonth ? ` – ${MONTHS[filterMonth - 1]}` : " – כל השנה"}
            </h4>
            <Legend items={[["#dc2626", "חיסורים"], ["#f97316", "ביטולים"]]} />
            <InstructorBars data={perInstructor} />
          </div>
          {showCost && (
            <div className="rounded-xl border border-border bg-background p-4 lg:col-span-2">
              <h4 className="mb-1 text-sm font-semibold">מחיר ממוצע לשיעור לפי חודש (₪)</h4>
              <AvgPriceLine data={monthly} />
            </div>
          )}
        </div>
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
