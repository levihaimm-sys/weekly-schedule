import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizePhoneToE164,
  buildReminderMessages,
  sendWhatsAppTemplate,
  hasReminderBeenSent,
  logWhatsAppMessage,
  type LessonLine,
} from "@/lib/whatsapp";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow manual override: ?date=2026-11-09
  const dateParam = request.nextUrl.searchParams.get("date");
  const force = request.nextUrl.searchParams.get("force") === "true";

  // Cron runs at both 04:00 and 05:00 UTC to cover DST.
  // Only send when Israel local hour is 7 (or when forced / manual date).
  if (!dateParam && !force) {
    const israelHour = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jerusalem",
      hour: "numeric",
      hour12: false,
    });
    if (parseInt(israelHour, 10) !== 7) {
      return NextResponse.json({ skipped: true, reason: "Not 07:00 Israel time" });
    }
  }

  const targetDate = dateParam ?? getTodayIsrael();
  const result = await sendDailyReminders(targetDate);
  return NextResponse.json(result);
}

// Also support POST for manual sends from admin UI
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const targetDate = body.date ?? getTodayIsrael();
  const instructorId: string | undefined = body.instructorId;

  const result = await sendDailyReminders(targetDate, instructorId);
  return NextResponse.json(result);
}

function getTodayIsrael(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jerusalem" });
}

export async function sendDailyReminders(
  targetDate: string,
  singleInstructorId?: string
) {
  const supabase = createAdminClient();

  // 1. Fetch all non-cancelled lessons for the target date, with location info
  let lessonsQuery = supabase
    .from("lessons")
    .select(
      `id, instructor_id, start_time, status,
       manager_name, manager_phone, contact_name, framework_name, address,
       location:locations!lessons_location_id_fkey(name, city)`
    )
    .eq("lesson_date", targetDate)
    .neq("status", "cancelled")
    .order("start_time");

  if (singleInstructorId) {
    lessonsQuery = lessonsQuery.eq("instructor_id", singleInstructorId);
  }

  const { data: lessons, error: lessonsErr } = await lessonsQuery;
  if (lessonsErr) {
    return { error: "Failed to fetch lessons: " + lessonsErr.message };
  }

  // 2. Group lessons by instructor
  const byInstructor: Record<string, typeof lessons> = {};
  for (const lesson of lessons ?? []) {
    if (!lesson.instructor_id) continue;
    if (!byInstructor[lesson.instructor_id]) byInstructor[lesson.instructor_id] = [];
    byInstructor[lesson.instructor_id].push(lesson);
  }

  const instructorIds = Object.keys(byInstructor);
  if (instructorIds.length === 0) {
    return { sent: 0, skipped: 0, errors: 0, messages: [] };
  }

  // 3. Fetch instructor details (only opted-in, unless single send)
  let instQuery = supabase
    .from("instructors")
    .select("id, full_name, phone, whatsapp_opt_in")
    .in("id", instructorIds);

  if (!singleInstructorId) {
    instQuery = instQuery.eq("whatsapp_opt_in", true);
  }

  const { data: instructors } = await instQuery;
  const instMap = new Map((instructors ?? []).map((i) => [i.id, i]));

  // 4. Build and send messages
  const results: Array<{
    instructorId: string;
    instructorName: string;
    phone: string;
    templateName: string;
    params: string[];
    status: string;
    error?: string;
  }> = [];

  let sent = 0, skipped = 0, errors = 0;

  for (const [instructorId, instLessons] of Object.entries(byInstructor)) {
    const inst = instMap.get(instructorId);
    if (!inst) { skipped++; continue; }

    const phone = normalizePhoneToE164(inst.phone ?? "");
    if (!phone) {
      const errMsg = `Invalid phone for ${inst.full_name}: "${inst.phone}"`;
      console.error(`[WhatsApp] ${errMsg}`);
      await logWhatsAppMessage({
        instructorId,
        phone: inst.phone ?? "",
        templateName: "N/A",
        params: [],
        status: "failed",
        error: errMsg,
        targetDate,
      });
      errors++;
      continue;
    }

    // Dedup check
    const alreadySent = await hasReminderBeenSent(instructorId, targetDate);
    if (alreadySent) { skipped++; continue; }

    // Build lesson lines
    const lines: LessonLine[] = instLessons.map((l: any) => {
      const loc = l.location as { name: string; city: string } | null;
      const locationLabel = loc
        ? `${loc.name}, ${loc.city}`
        : l.address ?? "מיקום לא ידוע";

      let contactLabel: string | null = null;
      if (l.manager_name && l.manager_phone) {
        contactLabel = `${l.manager_name} ${l.manager_phone}`;
      } else if (l.manager_name) {
        contactLabel = l.manager_name;
      } else if (l.contact_name) {
        contactLabel = l.contact_name;
      }

      return { start_time: l.start_time, locationLabel, contactLabel };
    });

    // First name only
    const firstName = inst.full_name.split(" ")[0];

    const messages = buildReminderMessages(instructorId, firstName, phone, targetDate, lines);

    for (const msg of messages) {
      const result = await sendWhatsAppTemplate(msg.phone, msg.templateName, msg.params);

      await logWhatsAppMessage({
        instructorId: msg.instructorId,
        phone: msg.phone,
        templateName: msg.templateName,
        params: msg.params,
        status: result.status,
        providerMessageId: result.providerMessageId,
        error: result.error,
        targetDate: msg.targetDate,
      });

      results.push({
        instructorId: msg.instructorId,
        instructorName: msg.instructorName,
        phone: msg.phone,
        templateName: msg.templateName,
        params: msg.params,
        status: result.status,
        error: result.error,
      });

      if (result.status === "failed") errors++;
      else sent++;
    }
  }

  return { sent, skipped, errors, messages: results };
}
