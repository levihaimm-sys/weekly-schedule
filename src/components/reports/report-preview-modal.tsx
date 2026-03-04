"use client";

import { X, Download, Loader2 } from "lucide-react";

// ─── City Report Preview ──────────────────────────────────────────────────────

export interface CityLessonPreviewRow {
  date: string;
  dayOfWeek: number;
  time: string;
  locationName: string;
  instructorName: string;
  status: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerRole?: string | null;
}

export interface CityReportPreviewData {
  city: string;
  month: number;
  year: number;
  lessons: CityLessonPreviewRow[];
}

interface CityReportPreviewModalProps {
  data: CityReportPreviewData;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}

export function CityReportPreviewModal({
  data,
  onClose,
  onDownload,
  downloading,
}: CityReportPreviewModalProps) {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;
  const teacherConfirmed = data.lessons.filter((l) => l.signerRole === "teacher").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-background p-6 shadow-xl"
        dir="rtl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">דוח עיר חודשי — {data.city}</h2>
            <p className="text-sm text-muted-foreground">
              {MONTHS_HEBREW[data.month - 1]} {data.year}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted" aria-label="סגור">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 text-center">תאריך</th>
                <th className="p-2 text-center">יום</th>
                <th className="p-2 text-center">שעה</th>
                <th className="p-2 text-center">מיקום</th>
                <th className="p-2 text-center">מדריך</th>
                <th className="p-2 text-center">סטטוס</th>
                <th className="p-2 text-center">אישור</th>
              </tr>
            </thead>
            <tbody>
              {data.lessons.map((lesson, i) => (
                <tr key={i} className={i % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="p-2 text-center">{lesson.date}</td>
                  <td className="p-2 text-center">{HEBREW_DAYS[lesson.dayOfWeek]}</td>
                  <td className="p-2 text-center">{lesson.time}</td>
                  <td className="p-2 text-center">{lesson.locationName}</td>
                  <td className="p-2 text-center">{lesson.instructorName}</td>
                  <td className="p-2 text-center">{statusToHebrew(lesson.status)}</td>
                  <td className="p-2 text-center">
                    {lesson.signerRole === "teacher" ? (
                      <div className="flex flex-col items-center gap-0.5">
                        {lesson.signatureUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={lesson.signatureUrl} alt="חתימה" className="h-6 w-14 object-contain" />
                        )}
                        <span className="text-xs text-muted-foreground">גננת: {lesson.signerName}</span>
                      </div>
                    ) : lesson.signerRole === "instructor" ? (
                      <span className="text-blue-600">&#10003; מדריכה</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
          סה&quot;כ שיעורים: {data.lessons.length} | הושלמו: {completed} | בוטלו: {cancelled} | אישור גננת: {teacherConfirmed}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={onDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {downloading ? "מוריד..." : "הורד PDF"}
          </button>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Instructor Report Preview ────────────────────────────────────────────────


const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function statusToHebrew(status: string) {
  const map: Record<string, string> = {
    scheduled: "מתוכנן",
    completed: "הושלם",
    cancelled: "בוטל",
    substitute: "מחליף",
  };
  return map[status] ?? status;
}

export interface LessonPreviewRow {
  date: string;
  dayOfWeek: number;
  time: string;
  locationName: string;
  city: string;
  status: string;
  signatureUrl?: string | null;
  signerName?: string | null;
  signerRole?: string | null;
}

export interface ReportPreviewData {
  instructorName: string;
  month: number;
  year: number;
  lessons: LessonPreviewRow[];
}

interface ReportPreviewModalProps {
  data: ReportPreviewData;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}

export function ReportPreviewModal({
  data,
  onClose,
  onDownload,
  downloading,
}: ReportPreviewModalProps) {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;
  const teacherConfirmed = data.lessons.filter((l) => l.signerRole === "teacher").length;
  const instructorConfirmed = data.lessons.filter((l) => l.signerRole === "instructor").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl bg-background p-6 shadow-xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">דוח חודשי — {data.instructorName}</h2>
            <p className="text-sm text-muted-foreground">
              {MONTHS_HEBREW[data.month - 1]} {data.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-2 text-center">תאריך</th>
                <th className="p-2 text-center">יום</th>
                <th className="p-2 text-center">שעה</th>
                <th className="p-2 text-center">מיקום</th>
                <th className="p-2 text-center">עיר</th>
                <th className="p-2 text-center">סטטוס</th>
                <th className="p-2 text-center">אישור</th>
              </tr>
            </thead>
            <tbody>
              {data.lessons.map((lesson, i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? "bg-muted/30" : ""}
                >
                  <td className="p-2 text-center">{lesson.date}</td>
                  <td className="p-2 text-center">{HEBREW_DAYS[lesson.dayOfWeek]}</td>
                  <td className="p-2 text-center">{lesson.time}</td>
                  <td className="p-2 text-center">{lesson.locationName}</td>
                  <td className="p-2 text-center">{lesson.city}</td>
                  <td className="p-2 text-center">{statusToHebrew(lesson.status)}</td>
                  <td className="p-2 text-center">
                    {lesson.signerRole === "teacher" ? (
                      <div className="flex flex-col items-center gap-0.5">
                        {lesson.signatureUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={lesson.signatureUrl}
                            alt="חתימה"
                            className="h-6 w-14 object-contain"
                          />
                        )}
                        <span className="text-xs text-muted-foreground">
                          גננת: {lesson.signerName}
                        </span>
                      </div>
                    ) : lesson.signerRole === "instructor" ? (
                      <span className="text-blue-600">&#10003; מדריכה</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
          סה&quot;כ שיעורים: {data.lessons.length} | הושלמו: {completed} | בוטלו:{" "}
          {cancelled} | אישור גננת: {teacherConfirmed} | אישור מדריכה:{" "}
          {instructorConfirmed}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onDownload}
            disabled={downloading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloading ? "מוריד..." : "הורד PDF"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
