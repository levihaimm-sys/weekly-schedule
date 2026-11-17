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

// One color per bucket, used everywhere (charts, table numbers, legend)
const BUCKETS = [
  { key: "self", label: "לימד/ה בעצמו", color: "#16a34a" },
  { key: "absences", label: "חיסור", color: "#dc2626" },
  { key: "transferred", label: "הועבר למדריך אחר", color: "#2563eb" },
  { key: "cancelled", label: "בוטל", color: "#a8a29e" },
] as const;
type BucketKey = (typeof BUCKETS)[number]["key"];
type Counts = Record<BucketKey, number>;

type SortKey =
  | "instructorName" | "month" | "fixed" | "self" | "selfPct" | "absences" | "absencesElsewhere" | "transferred"
  | "cancelled" | "changed" | "coveredForOthers" | "cost" | "avgPrice";

const COL = "px-3 py-2 text-center tabular-nums";

function money(n: number | null) {
  return n === null ? "—" : n.toLocaleString("he-IL", { maximumFractionDigits: 0 });
}

function csvCell(value: string | number) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function emptyCounts(): Counts {
  return { self: 0, absences: 0, transferred: 0, cancelled: 0 };
}

// ─── Charts (plain SVG/CSS, no chart library) ─────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {BUCKETS.map((b) => (
        <span key={b.key} className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: b.color }} />
          {b.label}
        </span>
      ))}
    </div>
  );
}

/** Stacked monthly bars. January is on the right (RTL). */
function MonthlyStack({
  data,
  selected,
  onSelect,
}: {
  data: Counts[];
  selected: number;
  onSelect: (month: number) => void;
}) {
  const totals = data.map((d) => d.self + d.absences + d.transferred + d.cancelled);
  const max = Math.max(1, ...totals);
  const W = 720, H = 260, padT = 18, padB = 24;
  const innerH = H - padT - padB;
  const slot = W / 12;
  const barW = slot * 0.62;
  const scale = (v: number) => (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="הרכב שיעורי הלוח הקבוע לפי חודש">
      <line x1={0} x2={W} y1={padT + innerH} y2={padT + innerH} stroke="currentColor" opacity={0.2} />
      {data.map((d, i) => {
        const month = i + 1;
        const cx = W - (i + 0.5) * slot;
        const x = cx - barW / 2;
        const dim = selected && selected !== month ? 0.3 : 1;
        let yCursor = padT + innerH;
        return (
          <g key={month} onClick={() => onSelect(month)} style={{ cursor: "pointer" }} opacity={dim}>
            <rect x={cx - slot / 2} y={0} width={slot} height={H} fill="transparent" />
            {BUCKETS.map((b) => {
              const v = d[b.key];
              if (!v) return null;
              const h = scale(v);
              yCursor -= h;
              return (
                <g key={b.key}>
                  <rect x={x} y={yCursor} width={barW} height={h} fill={b.color}>
                    <title>{`${MONTHS[i]} – ${b.label}: ${v}`}</title>
                  </rect>
                  {h >= 13 && (
                    <text x={cx} y={yCursor + h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">
                      {v}
                    </text>
                  )}
                </g>
              );
            })}
            {totals[i] > 0 && (
              <text x={cx} y={yCursor - 5} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.6}>
                {totals[i]}
              </text>
            )}
            <text x={cx} y={H - 6} textAnchor="middle" fontSize="12" fill="currentColor" opacity={selected === month ? 1 : 0.7} fontWeight={selected === month ? 700 : 400}>
              {MONTHS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** One 100%-stacked bar per instructor, worst (lowest self %) first. */
function InstructorStack({
  data,
  onSelect,
}: {
  data: { name: string; counts: Counts; fixed: number }[];
  onSelect: (name: string) => void;
}) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">אין שיעורים מהלוח הקבוע בתקופה זו</p>;
  }
  return (
    <div className="space-y-1.5">
      {data.map((d) => {
        const pct = d.fixed > 0 ? Math.round((d.counts.self / d.fixed) * 100) : 0;
        return (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onSelect(d.name)}
              className="w-28 shrink-0 truncate text-right hover:underline"
              title={`הצג רק את ${d.name}`}
            >
              {d.name}
            </button>
            <div className="flex h-5 flex-1 overflow-hidden rounded bg-muted/40">
              {BUCKETS.map((b) => {
                const v = d.counts[b.key];
                if (!v) return null;
                const w = (v / d.fixed) * 100;
                return (
                  <div
                    key={b.key}
                    className="flex items-center justify-center text-[10px] font-semibold text-white"
                    style={{ width: `${w}%`, background: b.color }}
                    title={`${b.label}: ${v}`}
                  >
                    {w >= 8 ? v : ""}
                  </div>
                );
              })}
            </div>
            <span
              className={`w-20 shrink-0 text-center tabular-nums font-medium ${
                pct < 80 ? "text-red-600" : pct < 95 ? "text-amber-600" : "text-green-700"
              }`}
            >
              {pct}% מתוך {d.fixed}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function AvgPriceLine({ data }: { data: { cost: number; paid: number }[] }) {
  const pts = data.map((d, i) => ({ i, v: d.paid > 0 ? d.cost / d.paid : null }));
  const vals = pts.map((p) => p.v).filter((v): v is number => v !== null);
  if (vals.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">אין נתונים</p>;
  const max = Math.max(...vals) * 1.15 || 1;
  const W = 720, H = 180, padT = 20, padB = 24;
  const slot = W / 12;
  const x = (i: number) => W - (i + 0.5) * slot;
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const line = pts.filter((p) => p.v !== null).map((p) => `${x(p.i)},${y(p.v!)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="מחיר ממוצע לשיעור לפי חודש">
      <line x1={0} x2={W} y1={H - padB} y2={H - padB} stroke="currentColor" opacity={0.2} />
      <polyline points={line} fill="none" stroke="#7c3aed" strokeWidth={2.5} />
      {pts.map((p) =>
        p.v === null ? null : (
          <g key={p.i}>
            <circle cx={x(p.i)} cy={y(p.v)} r={4} fill="#7c3aed" />
            <text x={x(p.i)} y={y(p.v) - 9} textAnchor="middle" fontSize="11" fontWeight="600" fill="#7c3aed">
              ₪{Math.round(p.v)}
            </text>
          </g>
        )
      )}
      {MONTHS.map((m, i) => (
        <text key={m} x={x(i)} y={H - 6} textAnchor="middle" fontSize="12" fill="currentColor" opacity={0.7}>
          {m}
        </text>
      ))}
    </svg>
  );
}

// ─── Report ───────────────────────────────────────────────────────────────────

export function InstructorAbsenceForm({ instructors }: { instructors: { full_name: string }[] }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<InstructorAbsenceRow[] | null>(null);
  const [showCost, setShowCost] = useState(false);
  const [until, setUntil] = useState<string | null>(null);
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterMonth, setFilterMonth] = useState(0); // 0 = all months
  const [showSubsOnly, setShowSubsOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("selfPct");
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
        setUntil(res.until ?? null);
      }
    });
  }

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "instructorName" || key === "month" || key === "selfPct" ? "asc" : "desc");
    }
  }

  // Instructors without fixed slots (substitutes only) are hidden unless asked for
  const baseRows = useMemo(
    () => (rows ?? []).filter((r) => showSubsOnly || r.fixed > 0),
    [rows, showSubsOnly]
  );

  const byInstructorRows = useMemo(
    () => baseRows.filter((r) => !filterInstructor || r.instructorName === filterInstructor),
    [baseRows, filterInstructor]
  );

  const monthly = useMemo(() => {
    const m = MONTHS.map(() => ({ ...emptyCounts(), cost: 0, paid: 0 }));
    for (const r of byInstructorRows) {
      const t = m[r.month - 1];
      t.self += r.self;
      t.absences += r.absences;
      t.transferred += r.transferred;
      t.cancelled += r.cancelled;
      t.cost += r.cost ?? 0;
      t.paid += r.paidLessons;
    }
    return m;
  }, [byInstructorRows]);

  const perInstructor = useMemo(() => {
    const map = new Map<string, { name: string; counts: Counts; fixed: number }>();
    for (const r of baseRows) {
      if (filterMonth && r.month !== filterMonth) continue;
      if (r.fixed === 0) continue;
      const e = map.get(r.instructorId) ?? { name: r.instructorName, counts: emptyCounts(), fixed: 0 };
      e.counts.self += r.self;
      e.counts.absences += r.absences;
      e.counts.transferred += r.transferred;
      e.counts.cancelled += r.cancelled;
      e.fixed += r.fixed;
      map.set(r.instructorId, e);
    }
    return [...map.values()]
      .filter((e) => !filterInstructor || e.name === filterInstructor)
      .sort((a, b) => a.counts.self / a.fixed - b.counts.self / b.fixed || b.fixed - a.fixed)
      .slice(0, 25);
  }, [baseRows, filterMonth, filterInstructor]);

  const visible = useMemo(() => {
    const list = byInstructorRows.filter((r) => !filterMonth || r.month === filterMonth);
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? -1;
      const bv = b[sortKey] ?? -1;
      const cmp =
        typeof av === "string" ? av.localeCompare(String(bv), "he") : (av as number) - (bv as number);
      return cmp * dir || a.instructorName.localeCompare(b.instructorName, "he") || a.month - b.month;
    });
  }, [byInstructorRows, filterMonth, sortKey, sortDir]);

  const totals = useMemo(() => {
    const t = { fixed: 0, self: 0, absences: 0, absencesElsewhere: 0, transferred: 0, cancelled: 0, changed: 0, coveredForOthers: 0, cost: 0, paid: 0 };
    for (const r of visible) {
      t.fixed += r.fixed;
      t.self += r.self;
      t.absences += r.absences;
      t.absencesElsewhere += r.absencesElsewhere;
      t.transferred += r.transferred;
      t.cancelled += r.cancelled;
      t.changed += r.changed;
      t.coveredForOthers += r.coveredForOthers;
      t.cost += r.cost ?? 0;
      t.paid += r.paidLessons;
    }
    return t;
  }, [visible]);

  function downloadCsv() {
    const header = [
      "מדריך", "חודש", "שיעורים בלוח הקבוע", "לימד/ה בעצמו", "% לימד/ה בעצמו", "חיסורים",
      "חיסורים בשיעורים לא קבועים", "הועברו למדריך אחר", "בוטלו", "שינויים בלוח השבועי", "מילא/ה מקום",
    ];
    if (showCost) header.push("עלות", "מחיר ממוצע לשיעור");
    const lines: (string | number)[][] = [header];
    for (const r of visible) {
      const line: (string | number)[] = [
        r.instructorName, MONTHS[r.month - 1], r.fixed, r.self, r.selfPct.toFixed(1), r.absences,
        r.absencesElsewhere, r.transferred, r.cancelled, r.changed, r.coveredForOthers,
      ];
      if (showCost) line.push(Math.round(r.cost ?? 0), (r.avgPrice ?? 0).toFixed(2));
      lines.push(line);
    }
    const csv = lines.map((l) => l.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `אמינות לוח קבוע לפי מדריך ${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function Th({ k, label, color }: { k: SortKey; label: string; color?: string }) {
    const active = sortKey === k;
    return (
      <th className="px-3 py-2.5 text-center first:text-right">
        <button
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-1 font-medium hover:text-foreground ${active ? "text-foreground" : ""}`}
        >
          {color && <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />}
          {label}
          {active && (sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
        </button>
      </th>
    );
  }

  const selectCls = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const scopeLabel = `${filterInstructor || "כל המדריכים"}${filterMonth ? ` · ${MONTHS[filterMonth - 1]}` : ""}`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        לכל מדריך: מה קרה לשיעורים שהיו שלו בלוח הקבוע באותו תאריך (לפי היסטוריית הלוח הקבוע והשבועי).
        חיסור = שיעור שלא לימדו בפועל (חיסור שלא טופל או שיעור בלי מדריך, כמו "השלמות" בלוח השבועי).
        חיסור שקיבל מחליף נספר כ"הועבר למדריך אחר". נספרים רק שיעורים שכבר עברו.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">שנה</label>
          <select value={year} onChange={(e) => { setYear(Number(e.target.value)); setRows(null); }} className={selectCls}>
            {[2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">חודש</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className={selectCls}>
            <option value={0}>כל החודשים</option>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">מדריך</label>
          <select value={filterInstructor} onChange={(e) => setFilterInstructor(e.target.value)} className={selectCls}>
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
        {rows && (
          <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={showSubsOnly} onChange={(e) => setShowSubsOnly(e.target.checked)} />
            הצג גם מדריכים בלי משבצות קבועות
          </label>
        )}
        {(filterInstructor || filterMonth) && rows && (
          <button
            onClick={() => { setFilterInstructor(""); setFilterMonth(0); }}
            className="pb-2 text-xs text-primary hover:underline"
          >
            נקה סינון
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {rows && (
        <>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">שיעורי הלוח הקבוע לפי חודש – {filterInstructor || "כל המדריכים"}</h4>
              <Legend />
            </div>
            <MonthlyStack
              data={monthly}
              selected={filterMonth}
              onSelect={(m) => setFilterMonth(m === filterMonth ? 0 : m)}
            />
            <p className="mt-1 text-xs text-muted-foreground">לחיצה על חודש מסננת אותו. לחיצה נוספת מבטלת.</p>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">
                כמה מהשיעורים הקבועים כל מדריך לימד בעצמו – {filterMonth ? MONTHS[filterMonth - 1] : `כל ${year}`}
              </h4>
              <Legend />
            </div>
            <InstructorStack data={perInstructor} onSelect={setFilterInstructor} />
          </div>

          {showCost && (
            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="mb-3 text-sm font-semibold">מחיר ממוצע לשיעור לפי חודש – {filterInstructor || "כל המדריכים"}</h4>
              <AvgPriceLine data={monthly} />
            </div>
          )}
        </>
      )}

      {rows && visible.length === 0 && (
        <p className="rounded-xl border border-border bg-background py-10 text-center text-sm text-muted-foreground">
          אין נתונים לתקופה זו
        </p>
      )}

      {visible.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {scopeLabel}{until ? ` · עד ${until.split("-").reverse().join("/")}` : ""}. לחיצה על כותרת עמודה ממיינת לפיה.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                  <Th k="instructorName" label="מדריך" />
                  <Th k="month" label="חודש" />
                  <Th k="fixed" label="בלוח הקבוע" />
                  <Th k="self" label="לימד/ה" color="#16a34a" />
                  <Th k="selfPct" label="% לימד/ה" />
                  <Th k="absences" label="חיסורים" color="#dc2626" />
                  <Th k="absencesElsewhere" label="חיסורים בשיעור לא קבוע" />
                  <Th k="transferred" label="הועברו" color="#2563eb" />
                  <Th k="cancelled" label="בוטלו" color="#a8a29e" />
                  <Th k="changed" label="שינויים" />
                  <Th k="coveredForOthers" label="מילא/ה מקום" />
                  {showCost && <Th k="cost" label="עלות" />}
                  {showCost && <Th k="avgPrice" label="מחיר ממוצע" />}
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={`${r.instructorId}-${r.month}`} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium">{r.instructorName}</td>
                    <td className="px-3 py-2 text-center">{MONTHS[r.month - 1]}</td>
                    <td className={COL}>{r.fixed}</td>
                    <td className={COL}>{r.self}</td>
                    <td className={`${COL} font-semibold ${r.fixed === 0 ? "text-muted-foreground" : r.selfPct < 80 ? "text-red-600" : r.selfPct < 95 ? "text-amber-600" : "text-green-700"}`}>
                      {r.fixed > 0 ? `${Math.round(r.selfPct)}%` : "—"}
                    </td>
                    <td className={`${COL} ${r.absences ? "font-semibold text-red-600" : "text-muted-foreground"}`}>{r.absences}</td>
                    <td className={`${COL} ${r.absencesElsewhere ? "text-red-600" : "text-muted-foreground"}`}>{r.absencesElsewhere}</td>
                    <td className={`${COL} ${r.transferred ? "font-semibold text-blue-600" : "text-muted-foreground"}`}>{r.transferred}</td>
                    <td className={`${COL} ${r.cancelled ? "" : "text-muted-foreground"}`}>{r.cancelled}</td>
                    <td className={`${COL} ${r.changed ? "" : "text-muted-foreground"}`}>{r.changed}</td>
                    <td className={`${COL} ${r.coveredForOthers ? "" : "text-muted-foreground"}`}>{r.coveredForOthers}</td>
                    {showCost && <td className={COL}>₪{money(r.cost)}</td>}
                    {showCost && <td className={COL}>₪{money(r.avgPrice)}</td>}
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/30 text-xs font-semibold">
                  <td colSpan={2} className="px-3 py-2 text-muted-foreground">סה"כ</td>
                  <td className={COL}>{totals.fixed}</td>
                  <td className={COL}>{totals.self}</td>
                  <td className={COL}>{totals.fixed > 0 ? `${Math.round((totals.self / totals.fixed) * 100)}%` : "—"}</td>
                  <td className={COL}>{totals.absences}</td>
                  <td className={COL}>{totals.absencesElsewhere}</td>
                  <td className={COL}>{totals.transferred}</td>
                  <td className={COL}>{totals.cancelled}</td>
                  <td className={COL}>{totals.changed}</td>
                  <td className={COL}>{totals.coveredForOthers}</td>
                  {showCost && <td className={COL}>₪{money(totals.cost)}</td>}
                  {showCost && <td className={COL}>₪{money(totals.paid > 0 ? totals.cost / totals.paid : 0)}</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
