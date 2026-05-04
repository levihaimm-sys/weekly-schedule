"use client";

import { useState, useTransition } from "react";
import {
  getMonthlyClientSummary,
  ClientMonthlySummary,
} from "@/lib/actions/reports";
import { Loader2 } from "lucide-react";

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export function MonthlySummaryForm() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<ClientMonthlySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await getMonthlyClientSummary(month, year);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data!);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">חודש</label>
          <select
            value={month}
            onChange={(e) => { setMonth(Number(e.target.value)); setData(null); }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">שנה</label>
          <select
            value={year}
            onChange={(e) => { setYear(Number(e.target.value)); setData(null); }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          הצג סיכום
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {data && data.length === 0 && (
        <p className="rounded-xl border border-border bg-background py-10 text-center text-sm text-muted-foreground">
          אין נתונים לתקופה זו
        </p>
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((client) => (
            <div
              key={client.client}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              {/* Client header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-violet-50 px-4 py-2.5">
                <span className="font-semibold text-violet-900">{client.client}</span>
                <span className="text-xs text-muted-foreground">
                  {client.total} שיעורים | {client.completed} הושלמו | {client.cancelled} בוטלו | {client.teacherConfirmed} גננת | {client.instructorConfirmed} מדריכה
                </span>
              </div>

              {/* Per-city table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-right text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-2">עיר</th>
                    <th className="px-4 py-2 text-center">סה"כ</th>
                    <th className="px-4 py-2 text-center">הושלמו</th>
                    <th className="px-4 py-2 text-center">בוטלו</th>
                    <th className="px-4 py-2 text-center">אישורי גננת</th>
                    <th className="px-4 py-2 text-center">אישורי מדריכה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {client.cities.map((city) => (
                    <tr key={city.city} className="hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium">{city.city}</td>
                      <td className="px-4 py-2 text-center">{city.total}</td>
                      <td className="px-4 py-2 text-center font-medium text-green-700">{city.completed}</td>
                      <td className="px-4 py-2 text-center font-medium text-red-600">{city.cancelled}</td>
                      <td className="px-4 py-2 text-center">{city.teacherConfirmed}</td>
                      <td className="px-4 py-2 text-center">{city.instructorConfirmed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
