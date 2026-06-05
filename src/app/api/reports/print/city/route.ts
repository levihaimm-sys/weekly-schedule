import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  const city  = p.get("city") ?? "";
  const month = parseInt(p.get("month") ?? "1");
  const year  = parseInt(p.get("year")  ?? "2026");
  const showSigs = p.get("sigs") !== "0";

  const startDate = `${year}-${String(month).padStart(2,"0")}-01`;
  const endDate   = `${year}-${String(month).padStart(2,"0")}-${new Date(year,month,0).getDate()}`;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,lesson_date,start_time,status,location:locations!lessons_location_id_fkey(name,city),instructor:instructors!lessons_instructor_id_fkey(full_name)")
    .eq("location.city", city)
    .gte("lesson_date", startDate).lte("lesson_date", endDate)
    .order("lesson_date").order("start_time");

  if (!lessons?.length) return new NextResponse("אין שיעורים לתקופה זו", { status: 404 });

  const lessonIds = lessons.map((l: any) => l.id);
  const { data: sigs } = await supabase.from("signatures").select("lesson_id,signer_name,signer_role,signature_url").in("lesson_id", lessonIds);
  const sigMap = new Map((sigs ?? []).map((s: any) => [s.lesson_id, s]));

  const rows = lessons.map((lesson: any, i: number) => {
    const sig = sigMap.get(lesson.id) as any;
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
      <td>${(lesson.location as any)?.name ?? "—"}</td>
      <td>${(lesson.instructor as any)?.full_name ?? "—"}</td>
      <td>${statusLabel(lesson.status)}</td>
      ${sigCell}
    </tr>`;
  }).join("");

  const completed   = lessons.filter((l:any) => l.status==="completed").length;
  const cancelled   = lessons.filter((l:any) => l.status==="cancelled").length;
  const totalConf   = [...sigMap.values()].filter((s:any) => s.signer_role).length;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
<meta charset="UTF-8">
<title>דוח עיר — ${city}</title>
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
<h1>חיים בתנועה - דוח עיר חודשי</h1>
<div class="sub">${city}<br>${MONTHS_HEBREW[month-1]} ${year}</div>
<hr>
<table>
<thead><tr><th>תאריך</th><th>יום</th><th>שעה</th><th>מיקום</th><th>מדריך</th><th>סטטוס</th>${showSigs ? "<th>אישור</th>" : ""}</tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="summary">סה"כ שיעורים: ${lessons.length} | הושלמו: ${completed} | בוטלו: ${cancelled}${showSigs ? ` | מאושר: ${totalConf}` : ""}</div>
<div class="footer">הופק אוטומטית על ידי מערכת חיים בתנועה | ${new Date().toLocaleDateString("he-IL")}</div>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
