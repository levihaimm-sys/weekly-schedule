"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const PATH = "/invoices";

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
    return { supabase: null, error: "אין הרשאה" as const };
  }
  return { supabase, error: null };
}

export async function markInvoiceSent(
  clientName: string,
  groupId: string,
  year: number,
  month: number,
  amount: number,
  invoiceNumber?: string
) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("client_invoices").upsert(
    {
      client_name: clientName,
      group_id: groupId,
      year,
      month,
      amount,
      invoice_number: invoiceNumber?.trim() || null,
      sent_at: new Date().toISOString(),
    },
    { onConflict: "group_id,year,month" }
  );

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function unmarkInvoiceSent(invoiceId: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("client_invoices")
    .update({ sent_at: null })
    .eq("id", invoiceId);

  if (error) return { error: "שגיאה בעדכון: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}

export async function updateInvoiceNotes(invoiceId: string, notes: string) {
  const { supabase, error: authError } = await requireOwner();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("client_invoices")
    .update({ notes: notes.trim() || null })
    .eq("id", invoiceId);

  if (error) return { error: "שגיאה בעדכון: " + error.message };

  revalidatePath(PATH);
  return { success: true };
}
