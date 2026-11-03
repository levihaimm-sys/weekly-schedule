"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ClientMonthlyStat } from "@/lib/queries/client-monthly-stats";

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

type Row = ClientMonthlyStat & { cancelledPct: number; dayChangedPct: number };
type SortKey = keyof Row;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "client", label: "לקוח" },
  { key: "total", label: "מתוכננים" },
  { key: "completed", label: "בוצעו" },
  { key: "cancelled", label: "בוטלו" },
  { key: "cancelledPct", label: "% ביטול" },
  { key: "dayChanged", label: "שינוי יום" },
  { key: "dayChangedPct", label: "% שינוי יום" },
];

const pct = (n: number, total: number) => (total ? (n / total) * 100 : 0);
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

// Negative metrics: the 3 highest (non-zero) values in each column are shown in red
const NEGATIVE_KEYS = ["cancelled", "cancelledPct", "dayChanged", "dayChangedPct"] as const;
type NegativeKey = (typeof NEGATIVE_KEYS)[number];

function top3Threshold(values: number[]) {
  const sorted = values.filter((v) => v > 0).sort((a, b) => b - a);
  return sorted.length ? sorted[Math.min(2, sorted.length - 1)] : Infinity;
}

function PctCell({ value, prev, red }: { value: number; prev: number | undefined; red: boolean }) {
  return (
    <td className={`px-3 py-2 text-center ${red ? "font-semibold text-red-600" : ""}`}>
      {fmtPct(value)}
      {prev !== undefined && (
        <span className="ms-1 text-xs font-normal text-muted-foreground">({fmtPct(prev)})</span>
      )}
    </td>
  );
}

export function ClientMonthlyStatsCard({
  stats,
  prevStats,
  year,
  month,
}: {
  stats: ClientMonthlyStat[];
  prevStats: ClientMonthlyStat[];
  year: number;
  month: number;
}) {
  const prevByClient = new Map(prevStats.map((s) => [s.client, s]));
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows: Row[] = stats.map((s) => ({
    ...s,
    cancelledPct: pct(s.cancelled, s.total),
    dayChangedPct: pct(s.dayChanged, s.total),
  }));
  rows.sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string, "he") : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totals = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      completed: acc.completed + s.completed,
      cancelled: acc.cancelled + s.cancelled,
      dayChanged: acc.dayChanged + s.dayChanged,
    }),
    { total: 0, completed: 0, cancelled: 0, dayChanged: 0 }
  );
  const prevTotals = prevStats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      cancelled: acc.cancelled + s.cancelled,
      dayChanged: acc.dayChanged + s.dayChanged,
    }),
    { total: 0, cancelled: 0, dayChanged: 0 }
  );

  const thresholds = Object.fromEntries(
    NEGATIVE_KEYS.map((k) => [k, top3Threshold(rows.map((r) => r[k]))])
  ) as Record<NegativeKey, number>;
  const isRed = (r: Row, k: NegativeKey) => r[k] > 0 && r[k] >= thresholds[k];
  const prevPct = (client: string, k: "cancelled" | "dayChanged") => {
    const p = prevByClient.get(client);
    return p ? pct(p[k], p.total) : undefined;
  };

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir(key === "client" ? "asc" : "desc");
    }
  }

  function changeMonth(value: string) {
    router.push(`/dashboard?statsMonth=${value}`);
  }

  // Month options: the last 12 months up to and including the current one
  const now = new Date();
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { value: `${d.getFullYear()}-${d.getMonth() + 1}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
  });

  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-lg font-bold">סיכום חודשי לפי לקוח</h3>
          <p className="text-xs text-muted-foreground">בסוגריים: האחוז בחודש הקודם</p>
        </div>
        <select
          value={`${year}-${month}`}
          onChange={(e) => changeMonth(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        >
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">אין שיעורים בחודש זה</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
                {COLUMNS.map((c) => (
                  <th key={c.key} className={`px-3 py-2 ${c.key === "client" ? "text-right" : "text-center"}`}>
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {c.label}
                      {sortKey === c.key ? (
                        sortDir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.client} className="hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{r.client}</td>
                  <td className="px-3 py-2 text-center">{r.total}</td>
                  <td className="px-3 py-2 text-center text-green-700">{r.completed}</td>
                  <td className={`px-3 py-2 text-center ${isRed(r, "cancelled") ? "font-semibold text-red-600" : ""}`}>{r.cancelled}</td>
                  <PctCell value={r.cancelledPct} prev={prevPct(r.client, "cancelled")} red={isRed(r, "cancelledPct")} />
                  <td className={`px-3 py-2 text-center ${isRed(r, "dayChanged") ? "font-semibold text-red-600" : ""}`}>{r.dayChanged}</td>
                  <PctCell value={r.dayChangedPct} prev={prevPct(r.client, "dayChanged")} red={isRed(r, "dayChangedPct")} />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-bold">
                <td className="px-3 py-2">סה"כ</td>
                <td className="px-3 py-2 text-center">{totals.total}</td>
                <td className="px-3 py-2 text-center text-green-700">{totals.completed}</td>
                <td className="px-3 py-2 text-center">{totals.cancelled}</td>
                <PctCell
                  value={pct(totals.cancelled, totals.total)}
                  prev={prevTotals.total ? pct(prevTotals.cancelled, prevTotals.total) : undefined}
                  red={false}
                />
                <td className="px-3 py-2 text-center">{totals.dayChanged}</td>
                <PctCell
                  value={pct(totals.dayChanged, totals.total)}
                  prev={prevTotals.total ? pct(prevTotals.dayChanged, prevTotals.total) : undefined}
                  red={false}
                />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
