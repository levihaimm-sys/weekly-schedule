"use client";

import { useRef, useState } from "react";
import { Download, Upload, Loader2, X } from "lucide-react";
import { importNeeds } from "@/lib/actions/staffing";

const CSV_HEADERS = [
  "לקוח", "עיר", "כתובת", "מתחם", "גננת/רכזת", "איש קשר", "קב'", "מסגרת", "שם המסגרת", "חוג", "יום",
  "שעת התחלה", "משך שיעור", "תאריך התחלה", "הערות", "מדריך/ה משובץ/ת",
];

const DAY_NAME_TO_INDEX: Record<string, number> = {
  "ראשון": 0,
  "יום ראשון": 0,
  "שני": 1,
  "יום שני": 1,
  "שלישי": 2,
  "יום שלישי": 2,
  "רביעי": 3,
  "יום רביעי": 3,
  "חמישי": 4,
  "יום חמישי": 4,
  "שישי": 5,
  "יום שישי": 5,
  "שבת": 6,
};

function csvField(value: string | null | undefined) {
  const str = (value ?? "").toString();
  return `"${str.replace(/"/g, '""')}"`;
}

function buildSampleCsv() {
  const headerRow = CSV_HEADERS.map(csvField).join(",");
  const sampleRow = [
    "טומשין", "הרצליה", "נורדאו 26, הרצליה", "ברנדיס", "רינת 054-8646513", "משה כהן 050-1234567", "3", 'בי"ס',
    "בית ספר עתידים", "תאטרון", "חמישי", "13:50", "40", "01/09/2026", "יש חניה בסמוך למתחם", "אודי",
  ]
    .map(csvField)
    .join(",");
  return [headerRow, sampleRow].join("\r\n");
}

export function downloadSampleCsv() {
  const bom = "﻿";
  const blob = new Blob([bom + buildSampleCsv()], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "שיעורים לדוגמא.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Minimal RFC4180-style CSV parser: handles quoted fields with embedded commas, quotes and newlines
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // ignore — line break handled on \n
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

interface ParsedNeedRow {
  client_name: string;
  region: string | null;
  address: string | null;
  location_name: string | null;
  manager_name: string | null;
  contact_name: string | null;
  lessons_count: number;
  framework: string | null;
  framework_name: string | null;
  field: string | null;
  day_of_week: number | null;
  start_time: string | null;
  lesson_duration: number;
  start_date: string | null;
  notes: string | null;
  instructor_name: string | null;
}

function parseImportCsv(text: string): { rows: ParsedNeedRow[]; skipped: number } {
  const table = parseCsv(text);
  if (table.length === 0) return { rows: [], skipped: 0 };

  const headers = table[0].map((h) => h.trim());
  const idx = (label: string) => headers.indexOf(label);
  const iClient = idx("לקוח");
  const iCity = idx("עיר");
  const iAddress = idx("כתובת");
  const iComplex = idx("מתחם");
  const iManager = idx("גננת/רכזת");
  const iContact = idx("איש קשר");
  const iGroup = idx("קב'");
  const iFramework = idx("מסגרת");
  const iFrameworkName = idx("שם המסגרת");
  const iField = idx("חוג");
  const iDay = idx("יום");
  const iStartTime = idx("שעת התחלה");
  const iDuration = idx("משך שיעור");
  const iDate = idx("תאריך התחלה");
  const iNotes = idx("הערות");
  const iInstructor = idx("מדריך/ה משובץ/ת");

  const cell = (line: string[], i: number) => (i >= 0 ? (line[i] ?? "").trim() : "");

  const rows: ParsedNeedRow[] = [];
  let skipped = 0;

  for (const line of table.slice(1)) {
    const client = cell(line, iClient);
    const city = cell(line, iCity);
    const complex = cell(line, iComplex);
    const clientName = client || complex || city;
    if (!clientName) {
      skipped++;
      continue;
    }
    const dayText = cell(line, iDay);
    const groupText = cell(line, iGroup);
    const durationText = cell(line, iDuration);

    rows.push({
      client_name: clientName,
      region: city || null,
      address: cell(line, iAddress) || null,
      location_name: complex || null,
      manager_name: cell(line, iManager) || null,
      contact_name: cell(line, iContact) || null,
      lessons_count: groupText && !Number.isNaN(Number(groupText)) ? Number(groupText) : 1,
      framework: cell(line, iFramework) || null,
      framework_name: cell(line, iFrameworkName) || null,
      field: cell(line, iField) || null,
      day_of_week: DAY_NAME_TO_INDEX[dayText] ?? null,
      start_time: cell(line, iStartTime) || null,
      lesson_duration: durationText && !Number.isNaN(Number(durationText)) ? Number(durationText) : 40,
      start_date: cell(line, iDate) || null,
      notes: cell(line, iNotes) || null,
      instructor_name: cell(line, iInstructor) || null,
    });
  }

  return { rows, skipped };
}

export function NeedsImportModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedNeedRow[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<{ inserted: number; updated: number; assigned: number; errors: string[] } | null>(
    null
  );

  function handleFile(file: File) {
    setParseError(null);
    setImportError(null);
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const { rows, skipped: skippedCount } = parseImportCsv(text);
      if (rows.length === 0) {
        setParseError("לא נמצאו שורות תקינות בקובץ. יש לוודא שיש כותרות בעברית (לקוח, עיר, כתובת, מתחם וכו') ושבכל שורה יש לקוח, עיר או מתחם.");
      }
      setParsedRows(rows);
      setSkipped(skippedCount);
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleImport() {
    setImporting(true);
    setImportError(null);
    try {
      const res = await importNeeds(parsedRows);
      setResult({ inserted: res.inserted, updated: res.updated, assigned: res.assigned, errors: res.errors });
      onImported();
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "שגיאה לא צפויה בייבוא. נסה שוב.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">ייבוא שיעורים מ-CSV</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        {result ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
              נוספו {result.inserted} שיעורים חדשים ועודכנו {result.updated} שיעורים קיימים (לפי לקוח, מתחם, שם מסגרת וחוג
              תואמים).
              {result.assigned > 0 && ` בנוסף, ${result.assigned} שובצו אוטומטית למדריך/ה שצוין/ה (וסומנו כמאושרים).`}
            </div>
            {result.errors.length > 0 && (
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                {result.errors.map((e, i) => (
                  <p key={i}>{e}</p>
                ))}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              עמודות: לקוח, עיר, כתובת, מתחם, גננת/רכזת, איש קשר, קב&apos;, מסגרת, שם המסגרת, חוג, יום, שעת התחלה, משך שיעור, תאריך התחלה, הערות, מדריך/ה משובץ/ת. אפשר להוריד קובץ לדוגמא כדי לראות את המבנה המדויק.
              אם ממלאים את עמודת המדריך/ה — השיבוץ ייווצר אוטומטית ויקושר למשבצת זמינות פנויה תואמת (אזור ויום), ואותה משבצת תסומן כתפוסה.
              העלאה חוזרת של אותו קובץ מעדכנת שיעורים קיימים (לפי לקוח + מתחם + שם מסגרת + חוג תואמים) במקום ליצור כפילויות.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Upload size={16} />
              {fileName ?? "בחר קובץ CSV"}
            </button>

            {parseError && <p className="mb-3 text-xs text-red-600">{parseError}</p>}
            {importError && (
              <p className="mb-3 text-xs text-red-600">
                {importError} אם זה חוזר על עצמו, נסה לרענן את הדף ולנסות שוב.
              </p>
            )}

            {parsedRows.length > 0 && (
              <div className="mb-3 space-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                <p>{parsedRows.length} שורות תקינות ייובאו</p>
                {skipped > 0 && <p className="text-amber-700">{skipped} שורות דולגו (חסר לקוח, עיר ומתחם)</p>}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={parsedRows.length === 0 || importing}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {parsedRows.length > 0 ? `ייבא ${parsedRows.length} שיעורים` : "ייבא"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SampleCsvButton() {
  return (
    <button
      onClick={downloadSampleCsv}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Download size={14} />
      הורד CSV לדוגמא
    </button>
  );
}
