"use client";

import { useState, useTransition } from "react";
import { CLIENTS, DAYS_SHORT } from "@/lib/utils/constants";
import { getClientReportData, ClientReportData } from "@/lib/actions/reports";
import { Loader2, Download, Printer } from "lucide-react";

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatTime(t: string) {
  return t?.slice(0, 5) ?? "";
}

function getDayName(dateStr: string) {
  return DAYS_SHORT[new Date(dateStr).getDay()];
}

const statusLabel: Record<string, string> = {
  scheduled: "מתוכנן",
  completed: "הושלם",
  cancelled: "בוטל",
  substitute: "מחליף",
};

const statusColor: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-50 text-red-600",
  substitute: "bg-purple-50 text-purple-700",
};

export function ClientReportForm() {
  const now = new Date();
  const [client, setClient] = useState<string>(CLIENTS[0]);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [mode, setMode] = useState<"full" | "summary">("full");
  const [report, setReport] = useState<ClientReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await getClientReportData(client, month, year);
      if (result.error) {
        setError(result.error);
      } else {
        setReport(result.data!);
      }
    });
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports/generate-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: client, month, year, mode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "שגיאה ביצירת הדוח");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${client}-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setDownloading(false);
    }
  }

  // Group lessons by city
  const byCity = report
    ? report.lessons.reduce(
        (acc, lesson) => {
          if (!acc[lesson.city]) acc[lesson.city] = [];
          acc[lesson.city].push(lesson);
          return acc;
        },
        {} as Record<string, typeof report.lessons>
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">לקוח</label>
          <select
            value={client}
            onChange={(e) => { setClient(e.target.value); setReport(null); }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {CLIENTS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">חודש</label>
          <select
            value={month}
            onChange={(e) => { setMonth(Number(e.target.value)); setReport(null); }}
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
            onChange={(e) => { setYear(Number(e.target.value)); setReport(null); }}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">תצוגה</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "full" | "summary")}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="full">כולל פירוט שיעורים</option>
            <option value="summary">ללא פירוט (סיכום בלבד)</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          הצג דוח
        </button>
        <a
          href={`/api/reports/print/client?client=${encodeURIComponent(client)}&month=${month}&year=${year}&mode=${mode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Printer size={14} />
          הדפס PDF
        </a>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg border border-border px-5 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {downloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          PDF (ישן)
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {/* Report */}
      {report && byCity && (
        <div className="space-y-4">
          {/* Total summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'סה"כ שיעורים', value: report.total, color: "text-foreground" },
              { label: "הושלמו", value: report.completed, color: "text-green-600" },
              { label: "בוטלו", value: report.cancelled, color: "text-red-500" },
              { label: "אישורי גננת", value: report.teacherConfirmed, color: "text-emerald-600" },
              { label: "אישורי מדריכה", value: report.instructorConfirmed, color: "text-blue-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          {mode === "summary" ? (
            // Summary mode — per-city table
            <div className="overflow-x-auto rounded-xl border border-border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">עיר</th>
                    <th className="px-4 py-3 text-center">סה"כ</th>
                    <th className="px-4 py-3 text-center">הושלמו</th>
                    <th className="px-4 py-3 text-center">בוטלו</th>
                    <th className="px-4 py-3 text-center">אישורי גננת</th>
                    <th className="px-4 py-3 text-center">אישורי מדריכה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(byCity).map(([city, lessons]) => {
                    const cityCompleted = lessons.filter((l) => l.status === "completed").length;
                    const cityCancelled = lessons.filter((l) => l.status === "cancelled").length;
                    const cityTeacher = lessons.filter((l) => l.signerRole === "teacher").length;
                    const cityInstructor = lessons.filter((l) => l.signerRole === "instructor").length;
                    return (
                      <tr key={city} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 font-semibold">{city}</td>
                        <td className="px-4 py-2.5 text-center">{lessons.length}</td>
                        <td className="px-4 py-2.5 text-center font-medium text-green-700">{cityCompleted}</td>
                        <td className="px-4 py-2.5 text-center font-medium text-red-600">{cityCancelled}</td>
                        <td className="px-4 py-2.5 text-center">{cityTeacher}</td>
                        <td className="px-4 py-2.5 text-center">{cityInstructor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            // Full mode — per-city sections with lesson tables
            <div className="space-y-5">
              {Object.entries(byCity).map(([city, lessons]) => {
                const cityCompleted = lessons.filter((l) => l.status === "completed").length;
                const cityCancelled = lessons.filter((l) => l.status === "cancelled").length;
                const cityTeacher = lessons.filter((l) => l.signerRole === "teacher").length;
                const cityInstructor = lessons.filter((l) => l.signerRole === "instructor").length;

                return (
                  <div key={city} className="overflow-hidden rounded-xl border border-border bg-background">
                    {/* City header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-indigo-50 px-4 py-2.5">
                      <span className="font-semibold text-indigo-900">{city}</span>
                      <span className="text-xs text-muted-foreground">
                        {lessons.length} שיעורים | {cityCompleted} הושלמו | {cityCancelled} בוטלו | {cityTeacher} גננת | {cityInstructor} מדריכה
                      </span>
                    </div>
                    {/* Lessons table */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-right text-xs font-medium text-muted-foreground">
                            <th className="px-3 py-2">תאריך</th>
                            <th className="px-3 py-2">יום</th>
                            <th className="px-3 py-2">שעה</th>
                            <th className="px-3 py-2">גן</th>
                            <th className="px-3 py-2">מדריכה</th>
                            <th className="px-3 py-2">סטטוס</th>
                            <th className="px-3 py-2">אישור</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {lessons.map((lesson) => (
                            <tr key={lesson.id} className="hover:bg-muted/20">
                              <td className="px-3 py-2">{formatDate(lesson.lesson_date)}</td>
                              <td className="px-3 py-2 text-muted-foreground">{getDayName(lesson.lesson_date)}</td>
                              <td className="px-3 py-2" dir="ltr">{formatTime(lesson.start_time)}</td>
                              <td className="px-3 py-2 font-medium">{lesson.locationName}</td>
                              <td className="px-3 py-2">{lesson.instructorName}</td>
                              <td className="px-3 py-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[lesson.status] ?? ""}`}>
                                  {statusLabel[lesson.status] ?? lesson.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {lesson.signerRole === "teacher" ? (
                                  <div className="flex flex-col items-start gap-0.5">
                                    {lesson.signatureUrl && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={lesson.signatureUrl}
                                        alt="חתימה"
                                        className="h-7 w-16 object-contain"
                                      />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      גננת: {lesson.signerName}
                                    </span>
                                  </div>
                                ) : lesson.signerRole === "instructor" ? (
                                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">✓ מדריכה</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/60">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
