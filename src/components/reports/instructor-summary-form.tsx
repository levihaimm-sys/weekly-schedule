"use client";

import { useState, useTransition } from "react";
import {
  getInstructorMonthlySummary,
  InstructorMonthlySummary,
} from "@/lib/actions/reports";
import { Loader2 } from "lucide-react";

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const COL = "px-4 py-2 text-center tabular-nums";
const COL_LABEL = "px-4 py-2";

export function InstructorSummaryForm() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<InstructorMonthlySummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await getInstructorMonthlySummary(month, year);
      if (result.error) setError(result.error);
      else setData(result.data!);
    });
  }

  return (
    <div className="space-y-4">
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
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                <th className="w-[28%] px-4 py-2.5">לקוח</th>
                <th className="w-[12%] px-4 py-2.5 text-center">סה"כ</th>
                <th className="w-[12%] px-4 py-2.5 text-center">הושלמו</th>
                <th className="w-[12%] px-4 py-2.5 text-center">בוטלו</th>
                <th className="w-[18%] px-4 py-2.5 text-center">אישורי גננת</th>
                <th className="w-[18%] px-4 py-2.5 text-center">אישורי מדריכה</th>
              </tr>
            </thead>
            <tbody>
              {data.map((instructor) => (
                <>
                  {/* Instructor group header */}
                  <tr key={`h-${instructor.instructorName}`} className="border-y border-border bg-orange-50">
                    <td colSpan={6} className="px-4 py-2 font-semibold text-orange-900">
                      {instructor.instructorName}
                    </td>
                  </tr>

                  {/* Client rows */}
                  {instructor.clients.map((client) => (
                    <tr
                      key={`${instructor.instructorName}-${client.client}`}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <td className={`${COL_LABEL} pr-8`}>{client.client}</td>
                      <td className={COL}>{client.total}</td>
                      <td className={`${COL} font-medium text-green-700`}>{client.completed}</td>
                      <td className={`${COL} font-medium text-red-600`}>{client.cancelled}</td>
                      <td className={COL}>{client.teacherConfirmed}</td>
                      <td className={COL}>{client.instructorConfirmed}</td>
                    </tr>
                  ))}

                  {/* Instructor total row */}
                  <tr key={`t-${instructor.instructorName}`} className="border-b-2 border-border bg-muted/30 font-semibold text-xs">
                    <td className={`${COL_LABEL} pr-8 text-muted-foreground`}>סה"כ</td>
                    <td className={COL}>{instructor.total}</td>
                    <td className={`${COL} text-green-700`}>{instructor.completed}</td>
                    <td className={`${COL} text-red-600`}>{instructor.cancelled}</td>
                    <td className={COL}>{instructor.teacherConfirmed}</td>
                    <td className={COL}>{instructor.instructorConfirmed}</td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
