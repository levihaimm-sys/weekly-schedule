"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PATH = "/profit-loss";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_owner")
    .eq("id", session?.user?.id ?? "")
    .single();

  if (!profile?.is_owner) {
    return { supabase: null, error: "אין הרשאה לצפות בעמוד זה" as const };
  }
  return { supabase, error: null };
}

export async function updateEmploymentSettings(
  instructorId: string,
  data: {
    employment_type: "freelance" | "employee";
    employer_cost_pct: number;
    is_office: boolean;
  }
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("instructor_employment_settings").upsert(
    {
      instructor_id: instructorId,
      employment_type: data.employment_type,
      employer_cost_pct: data.employer_cost_pct,
      is_office: data.is_office,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "instructor_id" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

// Pass null for a field to fall back to the signature-based value.
export async function setActivityOverride(
  instructorId: string,
  clientName: string,
  city: string,
  year: number,
  month: number,
  data: { activity_count: number | null; work_days: number | null }
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const match = { instructor_id: instructorId, client_name: clientName, city, year, month };

  const { error } =
    data.activity_count === null && data.work_days === null
      ? await supabase.from("pl_activity_overrides").delete().match(match)
      : await supabase.from("pl_activity_overrides").upsert(
          { ...match, ...data, updated_at: new Date().toISOString() },
          { onConflict: "instructor_id,client_name,city,year,month" }
        );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function addOfficeWorker(fullName: string, hourlyRate: number) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const name = fullName.trim();
  if (!name) return { error: "יש להזין שם" };

  const { error } = await supabase
    .from("pl_office_workers")
    .insert({ full_name: name, hourly_rate: hourlyRate });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function updateOfficeWorker(
  workerId: string,
  patch: Partial<{
    employment_type: "freelance" | "employee";
    employer_cost_pct: number;
    hourly_rate: number;
    is_active: boolean;
  }>
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("pl_office_workers").update(patch).eq("id", workerId);

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function setOfficeWorkerHours(
  workerId: string,
  year: number,
  month: number,
  hours: number
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("pl_office_worker_hours").upsert(
    { worker_id: workerId, year, month, hours, updated_at: new Date().toISOString() },
    { onConflict: "worker_id,year,month" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function setInvoiceSent(
  clientName: string,
  year: number,
  month: number,
  sent: boolean
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const match = { client_name: clientName, year, month };
  const { error } = sent
    ? await supabase
        .from("pl_invoice_status")
        .upsert({ ...match, sent_at: new Date().toISOString() }, { onConflict: "client_name,year,month" })
    : await supabase.from("pl_invoice_status").delete().match(match);

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

// Billed activity count on the client invoice. Pass null to fall back to the instructor rows.
export async function setInvoiceOverride(
  clientName: string,
  city: string,
  year: number,
  month: number,
  activityCount: number | null
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const match = { client_name: clientName, city, year, month };
  const { error } =
    activityCount === null
      ? await supabase.from("pl_invoice_overrides").delete().match(match)
      : await supabase.from("pl_invoice_overrides").upsert(
          { ...match, activity_count: activityCount, updated_at: new Date().toISOString() },
          { onConflict: "client_name,city,year,month" }
        );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

// Lessons entered by hand. instructorId null = billed to the client only (no instructor pay).
export async function addManualLessons(data: {
  instructorId: string | null;
  clientName: string;
  city: string;
  year: number;
  month: number;
  lessonCount: number;
  workDays: number;
  note: string;
}) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const clientName = data.clientName.trim();
  if (!clientName) return { error: "יש לבחור לקוח" };
  if (!(data.lessonCount > 0)) return { error: "יש להזין מספר שיעורים" };

  const { error } = await supabase.from("pl_manual_lessons").insert({
    instructor_id: data.instructorId,
    client_name: clientName,
    city: data.city.trim(),
    year: data.year,
    month: data.month,
    lesson_count: Math.round(data.lessonCount),
    work_days: Math.max(0, Math.round(data.workDays)),
    note: data.note.trim(),
  });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteManualLessons(id: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("pl_manual_lessons").delete().eq("id", id);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

// payeeId: instructor id, or "office__<worker id>" for office workers.
export async function setPayeePaid(payeeId: string, year: number, month: number, paid: boolean) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const match = { payee_id: payeeId, year, month };
  const { error } = paid
    ? await supabase
        .from("pl_payee_paid")
        .upsert({ ...match, paid_at: new Date().toISOString() }, { onConflict: "payee_id,year,month" })
    : await supabase.from("pl_payee_paid").delete().match(match);

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function addFixedExpense(
  label: string,
  amount: number,
  recurring: boolean,
  year: number,
  month: number
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const trimmedLabel = label.trim();
  if (!trimmedLabel) return { error: "יש להזין תיאור להוצאה" };

  const { error } = await supabase.from("pl_fixed_expenses").insert({
    label: trimmedLabel,
    amount,
    year: recurring ? null : year,
    month: recurring ? null : month,
  });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteFixedExpense(id: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("pl_fixed_expenses").delete().eq("id", id);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}
