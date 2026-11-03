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

export function ClientMonthlyStatsCard({
  stats,
  year,
  month,
}: {
  stats: ClientMonthlyStat[];
  year: number;
  month: number;
}) {
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
        <h3 className="text-lg font-bold">סיכום חודשי לפי לקוח</h3>
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
                  <td className="px-3 py-2 text-center text-red-600">{r.cancelled}</td>
                  <td className="px-3 py-2 text-center text-red-600">{fmtPct(r.cancelledPct)}</td>
                  <td className="px-3 py-2 text-center text-amber-700">{r.dayChanged}</td>
                  <td className="px-3 py-2 text-center text-amber-700">{fmtPct(r.dayChangedPct)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-bold">
                <td className="px-3 py-2">סה"כ</td>
                <td className="px-3 py-2 text-center">{totals.total}</td>
                <td className="px-3 py-2 text-center text-green-700">{totals.completed}</td>
                <td className="px-3 py-2 text-center text-red-600">{totals.cancelled}</td>
                <td className="px-3 py-2 text-center text-red-600">{fmtPct(pct(totals.cancelled, totals.total))}</td>
                <td className="px-3 py-2 text-center text-amber-700">{totals.dayChanged}</td>
                <td className="px-3 py-2 text-center text-amber-700">{fmtPct(pct(totals.dayChanged, totals.total))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
