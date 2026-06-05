import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { CLIENT_CITIES } from "@/lib/utils/constants";

const HEBREW_DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
const MONTHS_HEBREW = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
function statusLabel(s: string) {
  return ({ scheduled:"מתוכנן", completed:"הושלם", cancelled:"בוטל", substitute:"מחליף" } as Record<string,string>)[s] ?? s;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const p = request.nextUrl.searchParams;
  const clientName = p.get("client") ?? "";
  const month = parseInt(p.get("month") ?? "1");
  const year  = parseInt(p.get("year")  ?? "2026");
  const mode     = p.get("mode") ?? "full";
  const showSigs = p.get("sigs") !== "0";

  const cities = CLIENT_CITIES[clientName];
  if (!cities?.length) return new NextResponse("לקוח לא נמצא", { status: 404 });

  const startDate = `${year}-${String(month).padStart(2,"0")}-01`;
  const endDate   = `${year}-${String(month).padStart(2,"0")}-${new Date(year,month,0).getDate()}`;

  const { data: locations } = await supabase.from("locations").select("id,city").in("city", cities);
  const locationIds = (locations ?? []).map((l: any) => l.id);
  if (!locationIds.length) return new NextResponse("אין שיעורים לתקופה זו", { status: 404 });

  const { data: rawLessons } = await supabase
    .from("lessons")
    .select("id,lesson_date,start_time,status,instructor:instructors!lessons_instructor_id_fkey(full_name),location:locations!lessons_location_id_fkey(name,city)")
    .in("location_id", locationIds)
    .gte("lesson_date", startDate).lte("lesson_date", endDate)
    .order("lesson_date").order("start_time");

  const lessons = rawLessons ?? [];
  if (!lessons.length) return new NextResponse("אין שיעורים לתקופה זו", { status: 404 });

  const lessonIds = lessons.map((l: any) => l.id);
  const { data: sigs } = await supabase.from("signatures").select("lesson_id,signer_name,signer_role,signature_url").in("lesson_id", lessonIds);
  const sigMap = new Map((sigs ?? []).map((s: any) => [s.lesson_id, s]));

  // Build city-grouped data
  const cityMap = new Map<string, { lessons: any[]; total: number; completed: number; cancelled: number; teacherConf: number; instrConf: number }>();
  for (const city of cities) cityMap.set(city, { lessons: [], total: 0, completed: 0, cancelled: 0, teacherConf: 0, instrConf: 0 });

  for (const lesson of lessons as any[]) {
    const city = lesson.location?.city ?? "";
    if (!cityMap.has(city)) continue;
    const d = cityMap.get(city)!;
    const sig = sigMap.get(lesson.id) as any;
    d.total++;
    if (lesson.status === "completed") d.completed++;
    if (lesson.status === "cancelled") d.cancelled++;
    if (sig?.signer_role === "teacher") d.teacherConf++;
    if (sig?.signer_role === "instructor") d.instrConf++;
    d.lessons.push({ lesson, sig });
  }

  let tableHtml = "";

  if (mode === "full") {
    for (const [city, cityData] of cityMap.entries()) {
      if (!cityData.total) continue;
      const rows = cityData.lessons.map(({ lesson, sig }: any, i: number) => {
        const d = new Date(lesson.lesson_date + "T12:00:00");
        const sigCell = showSigs ? (() => {
          if (sig?.signer_role === "teacher") {
            return `<td>${sig.signature_url ? `<img src="${sig.signature_url}" style="max-height:22px;max-width:60px;display:block;margin:0 auto">` : ""}<div style="font-size:7pt;color:#666">${sig.signer_name ?? ""}</div></td>`;
          } else if (sig?.signer_role) {
            return `<td style="color:#2563eb">מאושר</td>`;
          }
          return "<td>—</td>";
        })() : "";
        return `<tr style="${i%2===1?"background:#f9f9fb":""}">
          <td>${d.toLocaleDateString("he-IL")}</td>
          <td>${HEBREW_DAYS[d.getDay()]}</td>
          <td>${lesson.start_time.slice(0,5)}</td>
          <td>${lesson.location?.name ?? "—"}</td>
          <td>${lesson.instructor?.full_name ?? "—"}</td>
          <td>${statusLabel(lesson.status)}</td>
          ${sigCell}
        </tr>`;
      }).join("");

      const cityConf = cityData.teacherConf + cityData.instrConf;
      tableHtml += `
        <div style="background:#e0e7ff;padding:5pt 8pt;margin-top:12pt;margin-bottom:3pt;font-weight:700;font-size:10pt;border-radius:2pt">
          ${city}
          <div style="font-size:7.5pt;color:#4b5563;margin-top:2pt;font-weight:400">סה"כ: ${cityData.total} | הושלמו: ${cityData.completed} | בוטלו: ${cityData.cancelled}${showSigs ? ` | מאושר: ${cityConf}` : ""}</div>
        </div>
        <table>
          <thead><tr><th>תאריך</th><th>יום</th><th>שעה</th><th>מיקום</th><th>מדריכה</th><th>סטטוס</th>${showSigs ? "<th>אישור</th>" : ""}</tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }
  } else {
    const summaryRows = [...cityMap.entries()].filter(([, d]) => d.total > 0).map(([city, d], i) => `
      <tr style="${i%2===1?"background:#f9f9fb":""}">
        <td style="font-weight:700">${city}</td>
        <td>${d.total}</td>
        <td style="color:#16a34a">${d.completed}</td>
        <td style="color:#dc2626">${d.cancelled}</td>
        <td>${d.teacherConf}</td>
        <td>${d.instrConf}</td>
      </tr>`).join("");
    tableHtml = `<table>
      <thead><tr><th>עיר</th><th>סה"כ</th><th>הושלמו</th><th>בוטלו</th><th>אישור גננת</th><th>אישור מדריכה</th></tr></thead>
      <tbody>${summaryRows}</tbody>
    </table>`;
  }

  const totalCompleted = lessons.filter((l: any) => l.status === "completed").length;
  const totalCancelled = lessons.filter((l: any) => l.status === "cancelled").length;
  const totalConf      = [...sigMap.values()].filter((s: any) => s.signer_role).length;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>דוח לקוח — ${clientName}</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Heebo',Arial,sans-serif;font-size:10pt;direction:rtl;color:#111;padding:20px}
@page{size:A4;margin:18mm 15mm 20mm}
h1{text-align:center;font-size:17pt;font-weight:700;margin-bottom:4pt}
.sub{text-align:center;font-size:11pt;color:#555;margin-bottom:14pt}
hr{border:none;border-top:1px solid #ddd;margin:10pt 0}
table{width:100%;border-collapse:collapse;font-size:8.5pt}
thead tr{background:#2563eb;color:#fff}
th{padding:5pt;text-align:center;font-weight:700}
td{padding:4pt 5pt;text-align:center;border-bottom:.5pt solid #e4e4e7;vertical-align:middle}
.summary{margin-top:12pt;background:#f4f4f5;padding:8pt 10pt;font-size:9pt;border-radius:3pt}
.footer{text-align:center;font-size:7.5pt;color:#aaa;margin-top:10pt}
.toolbar{display:flex;gap:10px;margin-bottom:16pt;justify-content:center}
.toolbar button{padding:8px 20px;border-radius:8px;border:none;cursor:pointer;font-family:'Heebo',Arial,sans-serif;font-size:11pt;font-weight:700}
.btn-print{background:#2563eb;color:#fff}.btn-back{background:#f4f4f5;color:#333}
@media print{.toolbar{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}thead{display:table-header-group}}
</style>
</head>
<body>
<div class="toolbar">
  <button class="btn-print" onclick="window.print()">🖨️ הדפס / שמור כ-PDF</button>
  <button class="btn-back" onclick="history.back()">← חזור</button>
</div>
<h1>חיים בתנועה - דוח לקוח חודשי</h1>
<div class="sub">${clientName}<br>${MONTHS_HEBREW[month-1]} ${year}</div>
<hr>
${tableHtml}
<div class="summary">סה"כ: ${lessons.length} | הושלמו: ${totalCompleted} | בוטלו: ${totalCancelled}${showSigs ? ` | מאושר: ${totalConf}` : ""}</div>
<div class="footer">הופק אוטומטית על ידי מערכת חיים בתנועה | ${new Date().toLocaleDateString("he-IL")}</div>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
