// Shared CSV format for the schedule-side lesson importers (one-time lessons + permanent
// schedule), kept identical to the "לקוחות ושיעורים נדרשים" (staffing needs) import format
// from the next-year staffing screen, so the same exported/prepared file works everywhere.

export const LESSON_CSV_HEADERS = [
  "לקוח", "עיר", "כתובת", "מתחם", "גננת/רכזת", "איש קשר", "קב'", "מסגרת", "שם המסגרת", "חוג", "יום",
  "שעת התחלה", "משך שיעור", "תאריך התחלה", "הערות", "מדריך/ה משובץ/ת",
];

export const DAY_NAME_TO_INDEX: Record<string, number> = {
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

export function csvField(value: string | number | null | undefined): string {
  const str = (value ?? "").toString();
  return `"${str.replace(/"/g, '""')}"`;
}

// Minimal RFC4180-style CSV parser: handles quoted fields with embedded commas, quotes and newlines
export function parseCsvTable(text: string): string[][] {
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

export interface LessonCsvRow {
  client_name: string;
  city: string | null;
  address: string | null;
  location_name: string | null;
  manager_name: string | null;
  contact_name: string | null;
  group_count: number;
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

export function parseLessonCsv(text: string): { rows: LessonCsvRow[]; skipped: number } {
  const table = parseCsvTable(text);
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

  const rows: LessonCsvRow[] = [];
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
      city: city || null,
      address: cell(line, iAddress) || null,
      location_name: complex || null,
      manager_name: cell(line, iManager) || null,
      contact_name: cell(line, iContact) || null,
      group_count: groupText && !Number.isNaN(Number(groupText)) ? Number(groupText) : 1,
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

const SAMPLE_ROW = [
  "טומשין", "הרצליה", "נורדאו 26, הרצליה", "ברנדיס", "רינת 054-8646513", "משה כהן 050-1234567", "3", 'בי"ס',
  "בית ספר עתידים", "תאטרון", "חמישי", "13:50", "40", "01/09/2026", "יש חניה בסמוך למתחם", "אודי",
];

export function buildLessonSampleCsv(): string {
  const headerRow = LESSON_CSV_HEADERS.map(csvField).join(",");
  const sampleRow = SAMPLE_ROW.map(csvField).join(",");
  return [headerRow, sampleRow].join("\r\n");
}

export function downloadLessonCsvTemplate(filename: string) {
  const bom = "﻿";
  const blob = new Blob([bom + buildLessonSampleCsv()], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
