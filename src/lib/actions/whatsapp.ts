"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizePhoneToE164,
  buildReminderMessages,
  sendWhatsAppTemplate,
  logWhatsAppMessage,
  type LessonLine,
  formatDateShort,
  buildLessonSlot,
} from "@/lib/whatsapp";

// ---------------------------------------------------------------------------
// Toggle opt-in
// ---------------------------------------------------------------------------

export async function toggleWhatsAppOptIn(instructorId: string, optIn: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("instructors")
    .update({ whatsapp_opt_in: optIn })
    .eq("id", instructorId);

  if (error) return { error: error.message };
  revalidatePath("/whatsapp");
  revalidatePath("/instructors");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Preview — what WOULD be sent for a given date
// ---------------------------------------------------------------------------

export interface PreviewMessage {
  instructorId: string;
  instructorName: string;
  phone: string;
  phoneValid: boolean;
  optIn: boolean;
  templateName: string;
  params: string[];
  fullText: string;
  lessonCount: number;
}

export async function previewReminders(targetDate: string): Promise<{
  messages: PreviewMessage[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data: lessons, error: lessonsErr } = await supabase
    .from("lessons")
    .select(
      `id, instructor_id, start_time, status,
       manager_name, manager_phone, contact_name, framework_name, address,
       location:locations!lessons_location_id_fkey(name, city)`
    )
    .eq("lesson_date", targetDate)
    .neq("status", "cancelled")
    .order("start_time");

  if (lessonsErr) return { messages: [], error: lessonsErr.message };

  const byInstructor: Record<string, typeof lessons> = {};
  for (const lesson of lessons ?? []) {
    if (!lesson.instructor_id) continue;
    if (!byInstructor[lesson.instructor_id]) byInstructor[lesson.instructor_id] = [];
    byInstructor[lesson.instructor_id].push(lesson);
  }

  const instructorIds = Object.keys(byInstructor);
  if (instructorIds.length === 0) return { messages: [] };

  const { data: instructors } = await supabase
    .from("instructors")
    .select("id, full_name, phone, whatsapp_opt_in")
    .in("id", instructorIds);

  const instMap = new Map((instructors ?? []).map((i) => [i.id, i]));
  const allMessages: PreviewMessage[] = [];

  for (const [instructorId, instLessons] of Object.entries(byInstructor)) {
    const inst = instMap.get(instructorId);
    if (!inst) continue;

    const phone = normalizePhoneToE164(inst.phone ?? "");
    const firstName = inst.full_name.split(" ")[0];

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

    const dateLabel = formatDateShort(targetDate);
    const chunks: LessonLine[][] = [];
    for (let i = 0; i < lines.length; i += 5) {
      chunks.push(lines.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      const count = chunk.length;
      const templateName = `instructor_day_reminder_${count}`;
      const params = [firstName, dateLabel, ...chunk.map(buildLessonSlot)];

      const slotsText = chunk.map(buildLessonSlot).join("\n");
      const fullText = `היי ${firstName},\nמזכירים לך שהיום ${dateLabel} את מלמדת:\n${slotsText}\nבהצלחה!\nחיים בתנועה\n(זו הודעה אוטומטית)`;

      allMessages.push({
        instructorId,
        instructorName: inst.full_name,
        phone: phone ?? inst.phone ?? "",
        phoneValid: !!phone,
        optIn: inst.whatsapp_opt_in ?? false,
        templateName,
        params,
        fullText,
        lessonCount: instLessons.length,
      });
    }
  }

  // Sort: opt-in first, then by name
  allMessages.sort((a, b) => {
    if (a.optIn !== b.optIn) return a.optIn ? -1 : 1;
    return a.instructorName.localeCompare(b.instructorName, "he");
  });

  return { messages: allMessages };
}

// ---------------------------------------------------------------------------
// Manual send for one instructor
// ---------------------------------------------------------------------------

export async function sendReminderToInstructor(instructorId: string, targetDate: string) {
  const supabase = createAdminClient();

  const { data: inst } = await supabase
    .from("instructors")
    .select("id, full_name, phone")
    .eq("id", instructorId)
    .single();

  if (!inst) return { error: "מדריכה לא נמצאה" };

  const phone = normalizePhoneToE164(inst.phone ?? "");
  if (!phone) return { error: `מספר טלפון לא תקין: "${inst.phone}"` };

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      `id, instructor_id, start_time, status,
       manager_name, manager_phone, contact_name, address,
       location:locations!lessons_location_id_fkey(name, city)`
    )
    .eq("lesson_date", targetDate)
    .eq("instructor_id", instructorId)
    .neq("status", "cancelled")
    .order("start_time");

  if (!lessons || lessons.length === 0) return { error: "אין שיעורים ביום הזה" };

  const firstName = inst.full_name.split(" ")[0];
  const lines: LessonLine[] = lessons.map((l: any) => {
    const loc = l.location as { name: string; city: string } | null;
    const locationLabel = loc ? `${loc.name}, ${loc.city}` : l.address ?? "מיקום לא ידוע";
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

  const messages = buildReminderMessages(instructorId, firstName, phone, targetDate, lines);
  const results = [];

  for (const msg of messages) {
    const result = await sendWhatsAppTemplate(msg.phone, msg.templateName, msg.params);
    await logWhatsAppMessage({
      instructorId,
      phone: msg.phone,
      templateName: msg.templateName,
      params: msg.params,
      status: result.status,
      providerMessageId: result.providerMessageId,
      error: result.error,
      targetDate,
    });
    results.push(result);
  }

  revalidatePath("/whatsapp");
  const failed = results.filter((r) => r.status === "failed");
  if (failed.length > 0) return { error: failed[0].error ?? "שליחה נכשלה" };
  return { success: true, status: results[0]?.status };
}

// ---------------------------------------------------------------------------
// Message log
// ---------------------------------------------------------------------------

export async function getWhatsAppLog(limit = 100) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("whatsapp_messages")
    .select(
      `id, phone, template_name, template_params, status, provider_message_id, error, target_date, created_at,
       instructor:instructors!whatsapp_messages_instructor_id_fkey(id, full_name)`
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
