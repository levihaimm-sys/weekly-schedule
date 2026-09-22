"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PATH = "/payroll";

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

export async function updatePayRate(
  instructorId: string,
  clientName: string,
  city: string,
  data: { rate_per_lesson: number; travel_rate_per_day: number }
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("instructor_pay_rates").upsert(
    {
      instructor_id: instructorId,
      client_name: clientName,
      city,
      rate_per_lesson: data.rate_per_lesson,
      travel_rate_per_day: data.travel_rate_per_day,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "instructor_id,client_name,city" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function setPayException(
  lessonId: string,
  instructorId: string,
  amount: number,
  notes: string | null
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("instructor_pay_exceptions").upsert(
    {
      lesson_id: lessonId,
      instructor_id: instructorId,
      amount,
      notes: notes?.trim() || null,
    },
    { onConflict: "lesson_id" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function deletePayException(lessonId: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("instructor_pay_exceptions")
    .delete()
    .eq("lesson_id", lessonId);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function addPayBonus(
  instructorId: string,
  year: number,
  month: number,
  label: string,
  amount: number
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const trimmedLabel = label.trim();
  if (!trimmedLabel) return { error: "יש להזין תיאור לתוספת" };

  const { error } = await supabase.from("instructor_pay_bonuses").insert({
    instructor_id: instructorId,
    year,
    month,
    label: trimmedLabel,
    amount,
  });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function deletePayBonus(bonusId: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("instructor_pay_bonuses")
    .delete()
    .eq("id", bonusId);

  if (error) return { error: "שגיאה במחיקה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}
