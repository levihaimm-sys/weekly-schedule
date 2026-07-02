import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WEBHOOK_SECRET = process.env.RECRUITMENT_WEBHOOK_SECRET;

function parseName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

// Parse structured fields out of a raw email body text (Hebrew CV emails)
function parseEmailBody(body: string): {
  full_name?: string;
  phone?: string;
  email?: string;
  area?: string;
} {
  const result: Record<string, string> = {};

  // Israeli phone numbers: 05X-XXXXXXX / 0XXXXXXXXX
  const phoneMatch = body.match(/\b(0[5-9]\d[\s\-]?\d{3}[\s\-]?\d{4})\b/);
  if (phoneMatch) result.phone = phoneMatch[1].replace(/[\s]/g, "-");

  // Name after Hebrew/English label
  const nameMatch = body.match(
    /(?:^|[\n\r])\s*(?:שם(?:\s+מלא)?|name)\s*[:\-–]\s*(.+)/im
  );
  if (nameMatch) result.full_name = nameMatch[1].trim().replace(/<[^>]+>/g, "");

  // Email address in body
  const emailMatch = body.match(
    /\b([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/
  );
  if (emailMatch) result.email = emailMatch[1];

  // Area / city
  const areaMatch = body.match(
    /(?:^|[\n\r])\s*(?:עיר|אזור|מקום\s+מגורים|עיר\s+מגורים|יישוב|city|location)\s*[:\-–]\s*(.+)/im
  );
  if (areaMatch) result.area = areaMatch[1].trim().replace(/<[^>]+>/g, "");

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (WEBHOOK_SECRET && body.secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Support both structured fields AND raw email body from Make.com
    let { full_name, phone, area, email, inquiry_date, cv_text } = body;
    const email_body: string | undefined = body.email_body;
    const email_subject: string | undefined = body.email_subject;

    // If structured fields missing, try to parse from email body
    if (email_body && (!full_name || !phone)) {
      const parsed = parseEmailBody(email_body);
      full_name = full_name || parsed.full_name;
      phone = phone || parsed.phone;
      email = email || parsed.email;
      area = area || parsed.area;
    }

    if (!full_name) {
      return NextResponse.json({ error: "Missing full_name" }, { status: 400 });
    }

    const { first_name, last_name } = parseName(full_name);
    const admin = createAdminClient();

    // Skip duplicate by phone
    if (phone?.trim()) {
      const { data: existing } = await admin
        .from("recruitment_candidates")
        .select("id")
        .eq("phone", phone.trim())
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: true, id: existing.id, duplicate: true });
      }
    }

    const { data: candidate, error } = await admin
      .from("recruitment_candidates")
      .insert({
        first_name,
        last_name,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        area: area?.trim() || null,
        inquiry_date: inquiry_date || new Date().toISOString().slice(0, 10),
        status: "pending",
        is_new: true,
      })
      .select("id")
      .single();

    if (error || !candidate) {
      console.error("[recruitment/inbound] Insert error:", error?.message);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    // Save CV text or raw email body as first activity note
    const noteContent = cv_text?.trim() || email_body?.trim();
    if (noteContent) {
      const label = cv_text?.trim()
        ? "קורות חיים (מייל אוטומטי)"
        : `מייל נכנס${email_subject ? `: ${email_subject}` : ""}`;
      await admin.from("recruitment_activities").insert({
        candidate_id: candidate.id,
        note: `${label}:\n\n${noteContent}`,
      });
    }

    return NextResponse.json({ success: true, id: candidate.id });
  } catch (err) {
    console.error("[recruitment/inbound] Unexpected error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
