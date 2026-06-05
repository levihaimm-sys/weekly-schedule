// Browser-based print-to-PDF for Hebrew reports.
// Opens a new window with properly styled HTML and auto-triggers the print dialog.
// The browser handles Hebrew/RTL rendering natively — no PDF library needed.

import type { ReportPreviewData, LessonPreviewRow } from "@/components/reports/report-preview-modal";
import type { CityReportPreviewData, CityLessonPreviewRow } from "@/components/reports/report-preview-modal";
import type { ClientReportData } from "@/lib/actions/reports";

const HEBREW_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    scheduled: "מתוכנן",
    completed: "הושלם",
    cancelled: "בוטל",
    substitute: "מחליף",
  };
  return map[status] ?? status;
}

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Heebo', Arial, sans-serif;
    font-size: 10pt;
    direction: rtl;
    color: #111;
  }
  @page { size: A4; margin: 18mm 15mm 22mm; }
  h1 { text-align: center; font-size: 17pt; font-weight: 700; margin-bottom: 3pt; }
  .subtitle { text-align: center; font-size: 11pt; color: #555; margin-bottom: 12pt; }
  hr { border: none; border-top: 1px solid #ddd; margin: 8pt 0; }
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  thead tr { background: #2563eb !important; color: #fff; }
  th { padding: 5pt; text-align: center; font-weight: 700; }
  td { padding: 4.5pt 5pt; text-align: center; border-bottom: 0.5pt solid #e4e4e7; vertical-align: middle; }
  tr.alt { background: #f9f9fb; }
  .sig-img { display: block; margin: 0 auto; max-height: 24pt; max-width: 65pt; object-fit: contain; }
  .sig-name { font-size: 7pt; color: #666; }
  .instructor-ack { color: #2563eb; }
  .summary {
    margin-top: 10pt;
    background: #f4f4f5;
    border-radius: 3pt;
    padding: 7pt 10pt;
    font-size: 9pt;
  }
  .city-header {
    background: #e0e7ff;
    padding: 5pt 8pt;
    margin-top: 12pt;
    margin-bottom: 3pt;
    font-weight: 700;
    font-size: 10pt;
    border-radius: 2pt;
  }
  .city-sub { font-size: 7.5pt; color: #4b5563; margin-top: 2pt; font-weight: 400; }
  .footer {
    position: fixed;
    bottom: 6mm;
    left: 0; right: 0;
    text-align: center;
    font-size: 7.5pt;
    color: #aaa;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    thead { display: table-header-group; }
  }
`;

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap" rel="stylesheet">`;

// No auto-print script needed — printing is triggered from the parent via iframe.contentWindow.print()

function signerCell(
  signerRole?: string | null,
  signatureUrl?: string | null,
  signerName?: string | null,
): string {
  if (signerRole === "teacher") {
    return `<div>
      ${signatureUrl ? `<img class="sig-img" src="${signatureUrl}" alt="">` : ""}
      <div class="sig-name">גננת: ${signerName ?? ""}</div>
    </div>`;
  }
  if (signerRole === "instructor") {
    return `<span class="instructor-ack">✓ מדריכה</span>`;
  }
  return "—";
}

function buildHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${FONT_LINK}
  <style>${BASE_CSS}</style>
</head>
<body>${body}</body>
</html>`;
}

// Inject report HTML into the current page, hide everything else, print, then clean up.
// This uses window.print() directly — works in every browser with no popups needed.
function printViaInjection(title: string, body: string): void {
  const CONTAINER_ID = "__rpt_print__";
  const STYLE_ID = "__rpt_style__";

  // Clean up any leftover from a previous call
  document.getElementById(CONTAINER_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();

  const originalTitle = document.title;
  document.title = title;

  // Inject the report content into the page
  const container = document.createElement("div");
  container.id = CONTAINER_ID;
  container.innerHTML = body;
  document.body.appendChild(container);

  // Add print CSS: hide everything except the report container
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap');
    @media print {
      body > *:not(#${CONTAINER_ID}) { display: none !important; }
      #${CONTAINER_ID} {
        display: block !important;
        font-family: 'Heebo', Arial, sans-serif;
        font-size: 10pt;
        direction: rtl;
        color: #111;
      }
      ${BASE_CSS}
      @page { size: A4; margin: 18mm 15mm 22mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;
  document.head.appendChild(style);

  window.print();

  // Restore page after print dialog closes (window.print() is synchronous)
  document.title = originalTitle;
  document.getElementById(CONTAINER_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
}

// Stubs kept for backward compatibility with form imports
export function openLoadingWindow(): Window { return window; }
export function fillPrintWindow(_win: Window, title: string, body: string): void {
  printViaInjection(title, body);
}

// ─── Instructor Report ───────────────────────────────────────────────────────

export function buildInstructorReportHtml(data: ReportPreviewData): { title: string; body: string } {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;
  const teacherConf = data.lessons.filter((l) => l.signerRole === "teacher").length;
  const instrConf = data.lessons.filter((l) => l.signerRole === "instructor").length;

  const rows = data.lessons
    .map(
      (l: LessonPreviewRow, i: number) => `
      <tr class="${i % 2 === 1 ? "alt" : ""}">
        <td>${l.date}</td>
        <td>${HEBREW_DAYS[l.dayOfWeek]}</td>
        <td>${l.time}</td>
        <td>${l.locationName}</td>
        <td>${l.city}</td>
        <td>${statusLabel(l.status)}</td>
        <td>${signerCell(l.signerRole, l.signatureUrl, l.signerName)}</td>
      </tr>`,
    )
    .join("");

  return {
    title: `דוח חודשי — ${data.instructorName}`,
    body: `
      <h1>חיים בתנועה - דוח חודשי</h1>
      <div class="subtitle">${data.instructorName}<br>${MONTHS_HEBREW[data.month - 1]} ${data.year}</div>
      <hr>
      <table>
        <thead><tr>
          <th>תאריך</th><th>יום</th><th>שעה</th><th>מיקום</th><th>עיר</th><th>סטטוס</th><th>אישור</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="summary">
        סה"כ שיעורים: ${data.lessons.length} | הושלמו: ${completed} | בוטלו: ${cancelled} | אישור גננת: ${teacherConf} | אישור מדריכה: ${instrConf}
      </div>
      <div class="footer">הופק אוטומטית על ידי מערכת חיים בתנועה | ${new Date().toLocaleDateString("he-IL")}</div>`,
  };
}

export function printInstructorReport(data: ReportPreviewData): void {
  const { title, body } = buildInstructorReportHtml(data);
  printViaInjection(title, body);
}

// ─── City Report ─────────────────────────────────────────────────────────────

export function buildCityReportHtml(data: CityReportPreviewData): { title: string; body: string } {
  const completed = data.lessons.filter((l) => l.status === "completed").length;
  const cancelled = data.lessons.filter((l) => l.status === "cancelled").length;
  const teacherConf = data.lessons.filter((l) => l.signerRole === "teacher").length;

  const rows = data.lessons
    .map(
      (l: CityLessonPreviewRow, i: number) => `
      <tr class="${i % 2 === 1 ? "alt" : ""}">
        <td>${l.date}</td>
        <td>${HEBREW_DAYS[l.dayOfWeek]}</td>
        <td>${l.time}</td>
        <td>${l.locationName}</td>
        <td>${l.instructorName}</td>
        <td>${statusLabel(l.status)}</td>
        <td>${signerCell(l.signerRole, l.signatureUrl, l.signerName)}</td>
      </tr>`,
    )
    .join("");

  return {
    title: `דוח עיר — ${data.city}`,
    body: `
      <h1>חיים בתנועה - דוח עיר חודשי</h1>
      <div class="subtitle">${data.city}<br>${MONTHS_HEBREW[data.month - 1]} ${data.year}</div>
      <hr>
      <table>
        <thead><tr>
          <th>תאריך</th><th>יום</th><th>שעה</th><th>מיקום</th><th>מדריך</th><th>סטטוס</th><th>אישור</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="summary">
        סה"כ שיעורים: ${data.lessons.length} | הושלמו: ${completed} | בוטלו: ${cancelled} | אישור גננת: ${teacherConf}
      </div>
      <div class="footer">הופק אוטומטית על ידי מערכת חיים בתנועה | ${new Date().toLocaleDateString("he-IL")}</div>`,
  };
}

export function printCityReport(data: CityReportPreviewData): void {
  const { title, body } = buildCityReportHtml(data);
  printViaInjection(title, body);
}

// ─── Client Report ────────────────────────────────────────────────────────────

export function printClientReport(
  data: ClientReportData,
  clientName: string,
  month: number,
  year: number,
  mode: "full" | "summary",
): void {
  const byCity = data.lessons.reduce(
    (acc, l) => {
      if (!acc[l.city]) acc[l.city] = [];
      acc[l.city].push(l);
      return acc;
    },
    {} as Record<string, ClientReportLesson[]>,
  );

  const totalCompleted = data.completed;
  const totalCancelled = data.cancelled;
  const totalTeacher = data.teacherConfirmed;
  const totalInstructor = data.instructorConfirmed;

  let tableHtml = "";

  if (mode === "full") {
    for (const [city, lessons] of Object.entries(byCity)) {
      const cc = lessons.filter((l) => l.status === "completed").length;
      const ca = lessons.filter((l) => l.status === "cancelled").length;
      const tc = lessons.filter((l) => l.signerRole === "teacher").length;
      const ic = lessons.filter((l) => l.signerRole === "instructor").length;

      tableHtml += `
        <div class="city-header">
          ${city}
          <div class="city-sub">סה"כ: ${lessons.length} | הושלמו: ${cc} | בוטלו: ${ca} | גננת: ${tc} | מדריכה: ${ic}</div>
        </div>
        <table>
          <thead><tr>
            <th>תאריך</th><th>יום</th><th>שעה</th><th>מיקום</th><th>מדריכה</th><th>סטטוס</th><th>אישור</th>
          </tr></thead>
          <tbody>
            ${lessons
              .map(
                (l, i) => `
              <tr class="${i % 2 === 1 ? "alt" : ""}">
                <td>${l.lesson_date.split("-").reverse().join(".")}</td>
                <td>${HEBREW_DAYS[new Date(l.lesson_date + "T12:00:00").getDay()]}</td>
                <td>${l.start_time?.slice(0, 5) ?? ""}</td>
                <td>${l.locationName ?? ""}</td>
                <td>${l.instructorName ?? ""}</td>
                <td>${statusLabel(l.status)}</td>
                <td>${signerCell(l.signerRole, l.signatureUrl, l.signerName)}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
    }
  } else {
    // Summary mode
    tableHtml = `
      <table>
        <thead><tr>
          <th>עיר</th><th>סה"כ</th><th>הושלמו</th><th>בוטלו</th><th>אישור גננת</th><th>אישור מדריכה</th>
        </tr></thead>
        <tbody>
          ${Object.entries(byCity)
            .map(
              ([city, lessons], i) => `
            <tr class="${i % 2 === 1 ? "alt" : ""}">
              <td><strong>${city}</strong></td>
              <td>${lessons.length}</td>
              <td style="color:#16a34a">${lessons.filter((l) => l.status === "completed").length}</td>
              <td style="color:#dc2626">${lessons.filter((l) => l.status === "cancelled").length}</td>
              <td>${lessons.filter((l) => l.signerRole === "teacher").length}</td>
              <td>${lessons.filter((l) => l.signerRole === "instructor").length}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`;
  }

  const body = `
    <h1>חיים בתנועה - דוח לקוח חודשי</h1>
    <div class="subtitle">${clientName}<br>${MONTHS_HEBREW[month - 1]} ${year}</div>
    <hr>
    ${tableHtml}
    <div class="summary">
      סה"כ: ${data.lessons.length} | הושלמו: ${totalCompleted} | בוטלו: ${totalCancelled} | אישור גננת: ${totalTeacher} | אישור מדריכה: ${totalInstructor}
    </div>
    <div class="footer">הופק אוטומטית על ידי מערכת חיים בתנועה | ${new Date().toLocaleDateString("he-IL")}</div>`;

  openPrintWindow(`דוח לקוח — ${clientName}`, body);
}
