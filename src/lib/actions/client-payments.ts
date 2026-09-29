"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PATH = "/client-payments";

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

export async function updateClientPaymentRate(
  clientName: string,
  city: string,
  data: {
    billing_mode: "per_lesson" | "fixed_monthly";
    rate_per_lesson: number;
    fixed_monthly_amount: number;
  }
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("client_payment_rates").upsert(
    {
      client_name: clientName,
      city,
      billing_mode: data.billing_mode,
      rate_per_lesson: data.rate_per_lesson,
      fixed_monthly_amount: data.fixed_monthly_amount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_name,city" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function setClientPaymentException(
  lessonId: string,
  clientName: string,
  amount: number,
  notes: string | null
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("client_payment_exceptions").upsert(
    {
      lesson_id: lessonId,
      client_name: clientName,
      amount,
      notes: notes?.trim() || null,
    },
    { onConflict: "lesson_id" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteClientPaymentException(lessonId: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("client_payment_exceptions")
    .delete()
    .eq("lesson_id", lessonId);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function addClientPaymentAdjustment(
  clientName: string,
  year: number,
  month: number,
  label: string,
  amount: number
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const trimmedLabel = label.trim();
  if (!trimmedLabel) return { error: "יש להזין תיאור להתאמה" };

  const { error } = await supabase.from("client_payment_adjustments").insert({
    client_name: clientName,
    year,
    month,
    label: trimmedLabel,
    amount,
  });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function deleteClientPaymentAdjustment(adjustmentId: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("client_payment_adjustments")
    .delete()
    .eq("id", adjustmentId);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}
