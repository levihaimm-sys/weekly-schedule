import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { coordinatorName, compareCoordinators, frameName, NO_COORDINATOR } from "@/lib/utils/client-report";
import { getTodayInIsrael, isHoliday } from "@/lib/utils/date";
import { buildXlsx, safeSheetName, XS, XlsxCell, XlsxSheet } from "@/lib/utils/xlsx-writer";

const CLIENT = "אפטר סקול";
// Sheet order the client asked for; any other coordinator follows alphabetically
const COORDINATOR_ORDER = ["עדי", "רותם", "ענבל", "תמי"];
const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const MONTHS_SHORT = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"];
const DAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

type Frame = { count: number; plans: Set<string> };
type CoordinatorDays = Map<number, Map<string, Frame>>; // day of month → "city - frame" → count

/** "עדי 054-996-3602" / "עדי אפטר סקול" → "עדי" */
function coordinatorKey(contact: string | null | undefined): string {
  const name = coordinatorName(contact);
  return name === NO_COORDINATOR ? name : name.split(/\s+/)[0];
}

function sortCoordinators(a: string, b: string): number {
  const ia = COORDINATOR_ORDER.indexOf(a);
  const ib = COORDINATOR_ORDER.indexOf(b);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return compareCoordinators(a, b);
}

function weekStartOf(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const month = Number(request.nextUrl.searchParams.get("month"));
    const year = Number(request.nextUrl.searchParams.get("year"));
    if (!month || month < 1 || month > 12 || !year) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const mm = String(month).padStart(2, "0");
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${year}-${mm}-01`;
    const monthEnd = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
    // Only lessons that already took place (up to today) — the rest of the month stays empty
    const today = getTodayInIsrael();
    const endDate = monthEnd < today ? monthEnd : today;

    const { data: recurringRows } = await supabase
      .from("recurring_schedule")
      .select("id, contact_name, group_name")
      .eq("client_name", CLIENT);
    const recurringIds = (recurringRows ?? []).map((r) => r.id);
    const recurringContact = new Map((recurringRows ?? []).map((r) => [r.id, r.contact_name as string | null]));
    const recurringGroup = new Map((recurringRows ?? []).map((r) => [r.id, r.group_name as string | null]));

    const lessonSelect = `id, lesson_date, status, contact_name, recurring_item_id, instructor_id, substitute_instructor_id,
         location:locations!lessons_location_id_fkey(name, city)`;

    const lessons: any[] = [];
    if (startDate <= endDate) {
      // A client's lessons come from its recurring rows, or are one-offs carrying the client name
      const [recurringRes, oneOffRes] = await Promise.all([
        recurringIds.length > 0
          ? supabase
              .from("lessons")
              .select(lessonSelect)
              .in("recurring_item_id", recurringIds)
              .gte("lesson_date", startDate)
              .lte("lesson_date", endDate)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("lessons")
          .select(lessonSelect)
          .eq("client_name", CLIENT)
          .gte("lesson_date", startDate)
          .lte("lesson_date", endDate),
      ]);
      if (recurringRes.error) throw recurringRes.error;
      if (oneOffRes.error) throw oneOffRes.error;
      const byId = new Map<string, any>();
      for (const l of [...(recurringRes.data ?? []), ...(oneOffRes.data ?? [])]) byId.set((l as any).id, l);
      lessons.push(...byId.values());
    }

    // Lesson plan names from the instructors' weekly assignments
    const instructorIds = [
      ...new Set(lessons.map((l) => l.substitute_instructor_id ?? l.instructor_id).filter(Boolean)),
    ];
    const planByWeek = new Map<string, string>();
    if (instructorIds.length > 0) {
      const { data: assignments } = await supabase
        .from("weekly_lesson_assignments")
        .select("instructor_id, week_start_date, lesson_plan:lesson_plans(name)")
        .in("instructor_id", instructorIds)
        .gte("week_start_date", weekStartOf(startDate))
        .lte("week_start_date", endDate);
      for (const a of assignments ?? []) {
        const name = (a as any).lesson_plan?.name;
        if (name) planByWeek.set(`${a.instructor_id}|${a.week_start_date}`, name);
      }
    }

    // coordinator → day → frame. Each distinct frame gets its own row; only lessons
    // at the same frame on the same day are summed into one row.
    const coordinators = new Map<string, CoordinatorDays>();
    const cancelledDays = new Map<string, Set<number>>();
    for (const l of lessons) {
      const coord = coordinatorKey(l.contact_name ?? recurringContact.get(l.recurring_item_id));
      const day = Number(l.lesson_date.slice(8, 10));
      if (!coordinators.has(coord)) coordinators.set(coord, new Map());
      if (l.status === "cancelled") {
        if (!cancelledDays.has(coord)) cancelledDays.set(coord, new Set());
        cancelledDays.get(coord)!.add(day);
        continue;
      }
      const days = coordinators.get(coord)!;
      if (!days.has(day)) days.set(day, new Map());
      const city = l.location?.city ?? "";
      const frame = frameName(recurringGroup.get(l.recurring_item_id), l.location?.name);
      const label = city ? `${city} - ${frame}` : frame;
      const frames = days.get(day)!;
      if (!frames.has(label)) frames.set(label, { count: 0, plans: new Set() });
      const f = frames.get(label)!;
      f.count++;
      const plan = planByWeek.get(`${l.substitute_instructor_id ?? l.instructor_id}|${weekStartOf(l.lesson_date)}`);
      if (plan) f.plans.add(plan);
    }

    if (coordinators.size === 0) {
      return NextResponse.json({ error: "אין שיעורים של אפטר סקול בחודש זה" }, { status: 404 });
    }

    const sheets: XlsxSheet[] = [...coordinators.keys()].sort(sortCoordinators).map((coord) =>
      buildSheet(coord, coordinators.get(coord)!, cancelledDays.get(coord) ?? new Set(), month, year, lastDay)
    );

    const xlsx = buildXlsx(sheets);
    const filename = encodeURIComponent(`דוח אפטר סקול ${MONTHS[month - 1]} ${year}.xlsx`);
    return new NextResponse(new Uint8Array(xlsx), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="afterschool-${year}-${mm}.xlsx"; filename*=UTF-8''${filename}`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "שגיאה לא ידועה";
    console.error("[reports/afterschool-monthly] error:", err);
    return NextResponse.json({ error: `שגיאה ביצירת הדוח: ${message}` }, { status: 500 });
  }
}

/** One sheet in the client's form layout: a row per day, or per frame on days with several. */
function buildSheet(
  coord: string,
  days: CoordinatorDays,
  cancelledDays: Set<number>,
  month: number,
  year: number,
  lastDay: number
): XlsxSheet {
  const mm = String(month).padStart(2, "0");
  const rows: XlsxSheet["rows"] = new Map();
  const set = (r: number, cells: XlsxCell[], height?: number) => rows.set(r, { cells, height });

  set(1, [{ col: 1, value: `דו"ח שעות ${MONTHS[month - 1]} ${year}`, style: XS.title }]);
  set(2, [
    { col: 1, value: "מתאריך:", style: XS.label },
    { col: 2, value: `01/${mm}/${String(year).slice(2)}`, style: XS.yellow },
    { col: 3, style: XS.yellow },
  ]);
  set(4, [
    { col: 1, value: "רכזת", style: XS.labelBold },
    { col: 2, value: coord, style: XS.yellowBold },
    ...[3, 4, 5].map((col) => ({ col, style: XS.yellowBold })),
  ]);
  set(
    6,
    ["תאריך", "יום", "מס' הפעלות", "שם בית הספר/גן", "שם המערך/ נושא השיעור", "הערות"].map((value, i) => ({
      col: i + 1,
      value,
      style: XS.header,
    })),
    32
  );

  const first = 7;
  let r = first;
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${mm}-${String(d).padStart(2, "0")}`;
    const dow = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
    const weekend = dow === 5 || dow === 6;
    const frames = days.get(d);
    const entries = frames
      ? [...frames.entries()].sort(([a], [b]) => a.localeCompare(b, "he"))
      : [null];
    const noActivity = !frames && !weekend && (isHoliday(dateStr) || cancelledDays.has(d));

    for (const entry of entries) {
      const plain = weekend ? XS.weekend : XS.body;
      const bold = weekend ? XS.weekendBold : XS.bodyBold;
      set(r, [
        { col: 1, value: `${String(d).padStart(2, "0")}-${MONTHS_SHORT[month - 1]}`, style: bold },
        { col: 2, value: DAYS[dow], style: bold },
        { col: 3, value: entry ? entry[1].count : undefined, style: plain },
        entry
          ? { col: 4, value: entry[0], style: plain }
          : { col: 4, value: noActivity ? (isHoliday(dateStr) ? "אין פעילות - חג" : "אין פעילות") : undefined, style: noActivity ? bold : plain },
        { col: 5, value: entry ? [...entry[1].plans].join(" / ") : undefined, style: plain },
        { col: 6, style: plain },
      ]);
      r++;
    }
  }

  const total = r;
  set(total, [
    { col: 1, value: 'סה"כ שעות', style: XS.total },
    { col: 2, style: XS.total },
    { col: 3, formula: `SUM(C${first}:C${total - 1})`, style: XS.total },
    ...[4, 5, 6].map((col) => ({ col, style: XS.total })),
  ]);

  return {
    name: safeSheetName(coord),
    rows,
    colWidths: [11, 6, 11, 45, 30, 22],
    merges: ["B2:C2", "B4:E4", `A${total}:B${total}`],
    rightToLeft: true,
    freezeRows: 6,
    printTitleRow: 6,
  };
}
