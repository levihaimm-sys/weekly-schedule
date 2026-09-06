"use client";

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { bulkImportRecurringSchedule } from "@/lib/actions/schedule";
import { CITY_TO_CLIENT } from "@/lib/utils/constants";
import { buildLessonSampleCsv, downloadLessonCsvTemplate, parseCsvTable } from "@/lib/utils/lesson-import-csv";

const EXAMPLE_CSV = buildLessonSampleCsv().replace("\r\n", "\n");

export function BulkImportRecurringSchedule({
  locations,
  instructors,
}: {
  locations: { id: string; name: string; city: string | null }[];
  instructors: { id: string; full_name: string }[];
}) {
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [rawCsv, setRawCsv] = useState("");
  const [result, setResult] = useState<{
    success?: boolean;
    created?: number;
    skipped?: number;
    error?: string;
    details?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawCsv(text);
      setPreview(parseCsvTable(text));
      setResult(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!rawCsv) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await bulkImportRecurringSchedule(rawCsv);
      setResult(res);
      if (res.success) {
        setPreview(null);
        setRawCsv("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    downloadLessonCsvTemplate("שיעורים לדוגמא.csv");
  }

  return (
    <div className="space-y-6">
      {/* Format info */}
      <div className="rounded-xl border border-border bg-white p-4 space-y-3">
        <h3 className="font-semibold text-lg">פורמט הקובץ</h3>
        <p className="text-xs text-muted-foreground">
          זהה לפורמט הייבוא במסך &quot;לקוחות ושיעורים נדרשים&quot; (שיבוץ שנה הבאה) — קובץ שהוכן שם מתאים גם כאן.
        </p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>עמודות חובה:</strong> לקוח / עיר / מתחם (לפחות אחת מהן לזיהוי המיקום), יום, שעת התחלה,
            מדריך/ה משובץ/ת
          </p>
          <p>
            <strong>עמודות אופציונליות:</strong> כתובת, גננת/רכזת, איש קשר, קב&apos;, מסגרת, שם המסגרת, חוג,
            משך שיעור, תאריך התחלה, הערות
          </p>
          <p>
            כל שורה תיכנס באופן קבוע ללוח (חוזרת כל שבוע ביום ובשעה שצוינו) ותיצור מיד גם את השיעורים הקרובים בלוח
            השבועי. עמודת &quot;תאריך התחלה&quot; קובעת רק ממתי להתחיל את החזרה השבועית (אם ריקה — מהיום). אם יש
            קב&apos; (כמות שיעורים) גדולה מ-1, ייווצרו כמה שיעורים קבועים באותו יום בזה אחר זה לפי משך השיעור.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre" dir="ltr">
          {EXAMPLE_CSV}
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            הורד תבנית CSV
          </button>
        </div>
      </div>

      {/* Reference lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <details className="rounded-xl border border-border bg-white p-4">
          <summary className="font-medium cursor-pointer">
            שמות מיקומים ({locations.length})
          </summary>
          <div className="mt-2 max-h-48 overflow-y-auto text-sm space-y-0.5">
            {locations.map((l) => {
              const client = l.city ? CITY_TO_CLIENT[l.city] : null;
              return (
                <div key={l.id} className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{l.name}</span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {client ?? l.city ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        </details>
        <details className="rounded-xl border border-border bg-white p-4">
          <summary className="font-medium cursor-pointer">
            שמות מדריכים ({instructors.length})
          </summary>
          <div className="mt-2 max-h-48 overflow-y-auto text-sm space-y-0.5">
            {instructors.map((i) => (
              <div key={i.id} className="text-muted-foreground">
                {i.full_name}
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Upload */}
      <div className="rounded-xl border-2 border-dashed border-border bg-white p-8 text-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
          id="recurring-csv-upload"
        />
        <label
          htmlFor="recurring-csv-upload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <span className="text-sm font-medium">לחץ לבחירת קובץ CSV</span>
          <span className="text-xs text-muted-foreground">
            או גרור קובץ לכאן
          </span>
        </label>
      </div>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <div className="rounded-xl border border-border bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              תצוגה מקדימה ({preview.length - 1} שורות)
            </h3>
            <button
              onClick={handleImport}
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "מייבא..." : `ייבא ${preview.length - 1} שיעורים קבועים`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="ltr">
              <thead>
                <tr className="border-b">
                  {preview[0].map((col, i) => (
                    <th key={i} className="px-2 py-1 text-right font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(1, 11).map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1 text-right">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {preview.length > 11 && (
                  <tr>
                    <td
                      colSpan={preview[0].length}
                      className="px-2 py-1 text-center text-muted-foreground"
                    >
                      ...ועוד {preview.length - 11} שורות
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl border p-4 ${
            result.success
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {result.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>נוספו {result.created} שיעורים קבועים בהצלחה</span>
                {result.skipped ? (
                  <span className="text-sm text-muted-foreground">
                    ({result.skipped} שורות דולגו)
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>{result.error}</span>
              </>
            )}
          </div>
          {result.details && result.details.length > 0 && (
            <div className="mt-2 text-sm space-y-0.5 text-muted-foreground">
              {result.details.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
