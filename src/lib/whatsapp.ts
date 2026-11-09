import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Phone normalization — Israeli numbers to E.164
// ---------------------------------------------------------------------------

export function normalizePhoneToE164(raw: string): string | null {
  const digits = raw.replace(/[\s\-()]+/g, "");

  // Already E.164
  if (/^\+972\d{9}$/.test(digits)) return digits;

  // International without +
  if (/^972\d{9}$/.test(digits)) return "+" + digits;

  // Local 0XX-XXXXXXX (10 digits)
  if (/^0\d{9}$/.test(digits)) return "+972" + digits.slice(1);

  return null;
}

// ---------------------------------------------------------------------------
// Template-message builder
// ---------------------------------------------------------------------------

export interface LessonLine {
  start_time: string;
  locationLabel: string;       // e.g. "גן רימון, גבעתיים"
  contactLabel: string | null; // e.g. "דנה 050-1234567"
}

export function buildLessonSlot(line: LessonLine): string {
  const time = line.start_time.slice(0, 5); // HH:MM
  let slot = `${time} | ${line.locationLabel}`;
  if (line.contactLabel) {
    slot += ` | איש קשר: ${line.contactLabel}`;
  }
  // Meta rules: no newlines/tabs inside a slot, no 4 consecutive spaces, trim
  return slot.replace(/[\n\r\t]/g, " ").replace(/ {4,}/g, "   ").trim();
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

export interface ReminderMessage {
  instructorId: string;
  instructorName: string;
  phone: string;           // E.164
  templateName: string;
  params: string[];         // {{1}}, {{2}}, ...
  targetDate: string;
}

/**
 * Build reminder messages for one instructor.
 * Returns 1 or 2 messages (split at 5 lessons per template).
 */
export function buildReminderMessages(
  instructorId: string,
  firstName: string,
  phone: string,
  targetDate: string,
  lessons: LessonLine[]
): ReminderMessage[] {
  const dateLabel = formatDateShort(targetDate);
  const messages: ReminderMessage[] = [];

  const chunks: LessonLine[][] = [];
  for (let i = 0; i < lessons.length; i += 5) {
    chunks.push(lessons.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const count = chunk.length;
    const templateName = `instructor_day_reminder_${count}`;
    const params = [firstName, dateLabel, ...chunk.map(buildLessonSlot)];
    messages.push({
      instructorId,
      instructorName: firstName,
      phone,
      templateName,
      params,
      targetDate,
    });
  }

  return messages;
}

// ---------------------------------------------------------------------------
// Send via Telnyx WhatsApp API (or dry-run)
// ---------------------------------------------------------------------------

interface SendResult {
  status: "dry_run" | "sent" | "failed";
  providerMessageId?: string;
  error?: string;
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
): Promise<SendResult> {
  const mode = process.env.WHATSAPP_MODE ?? "dry_run";

  if (mode !== "live") {
    console.log(`[WhatsApp DRY_RUN] To: ${to} | Template: ${templateName}`);
    console.log(`[WhatsApp DRY_RUN] Params:`, params);
    return { status: "dry_run" };
  }

  const apiKey = process.env.TELNYX_API_KEY;
  const from = process.env.TELNYX_WHATSAPP_FROM;
  if (!apiKey || !from) {
    return { status: "failed", error: "Missing TELNYX_API_KEY or TELNYX_WHATSAPP_FROM" };
  }

  try {
    const res = await fetch("https://api.telnyx.com/v2/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messaging_profile_id: from,
        to,
        type: "whatsapp",
        template: {
          name: templateName,
          language: { code: "he" },
          components: [
            {
              type: "body",
              parameters: params.map((p) => ({ type: "text", text: p })),
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { status: "failed", error: `${res.status}: ${body.slice(0, 500)}` };
    }

    const json = await res.json();
    const msgId = json?.data?.id ?? null;
    return { status: "sent", providerMessageId: msgId };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Log to DB + dedup check
// ---------------------------------------------------------------------------

export async function hasReminderBeenSent(
  instructorId: string,
  targetDate: string
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("whatsapp_messages")
    .select("id")
    .eq("instructor_id", instructorId)
    .eq("target_date", targetDate)
    .in("status", ["dry_run", "sent"])
    .limit(1);
  return (data?.length ?? 0) > 0;
}

export async function logWhatsAppMessage(msg: {
  instructorId: string;
  phone: string;
  templateName: string;
  params: string[];
  status: "dry_run" | "sent" | "failed";
  providerMessageId?: string;
  error?: string;
  targetDate: string;
}) {
  const supabase = createAdminClient();
  await supabase.from("whatsapp_messages").insert({
    instructor_id: msg.instructorId,
    phone: msg.phone,
    template_name: msg.templateName,
    template_params: msg.params,
    status: msg.status,
    provider_message_id: msg.providerMessageId ?? null,
    error: msg.error ?? null,
    target_date: msg.targetDate,
  });
}
