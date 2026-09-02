"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { ClientRecord } from "@/types/database";

export async function addClient(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "נדרש שם לקוח" };

  const legalName = (formData.get("legal_name") as string)?.trim();
  const orgType = (formData.get("org_type") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const region = (formData.get("region") as string)?.trim();
  const contactName = (formData.get("contact_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const website = (formData.get("website") as string)?.trim();
  const priority = (formData.get("priority") as string)?.trim();
  const status = (formData.get("status") as string)?.trim();

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    name,
    legal_name: legalName || null,
    org_type: orgType || null,
    category: category || null,
    region: region || null,
    primary_contact_name: contactName || null,
    primary_contact_phone: phone || null,
    primary_contact_email: email || null,
    website: website || null,
    priority: priority || null,
    status: status || "potential_client",
  });

  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { success: true };
}

export async function updateClient(
  id: string,
  data: Partial<Omit<ClientRecord, "id" | "created_at">>
) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(data).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { success: true };
}

export async function toggleClientArchive(id: string, isArchived: boolean) {
  return updateClient(id, { is_archived: isArchived });
}

export async function bulkArchiveClients(ids: string[], isArchived: boolean) {
  if (!ids.length) return { success: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ is_archived: isArchived })
    .in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { success: true };
}

export async function bulkDeleteClients(ids: string[]) {
  if (!ids.length) return { success: true };
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { success: true };
}

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { success: true };
}

/**
 * Link recurring schedule rows to a client by exact client_name text match.
 * Used to connect the free-text `client_name` on recurring_schedule (carried
 * over from staffing/CSV imports) to a client-portal-enabled client record.
 */
export async function linkRecurringScheduleByName(clientId: string, nameText: string) {
  const trimmed = nameText.trim();
  if (!trimmed) return { error: "יש להזין שם לחיפוש" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recurring_schedule")
    .update({ client_id: clientId })
    .is("client_id", null)
    .ilike("client_name", trimmed)
    .select("id");

  if (error) return { error: "שגיאה בקישור: " + error.message };

  revalidatePath("/clients");
  return { success: true, linked: data?.length ?? 0 };
}

export async function addClientActivity(clientId: string, note: string) {
  if (!note.trim()) return { error: "יש להזין תוכן" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("client_activities").insert({
    client_id: clientId,
    note: note.trim(),
  });

  if (error) return { error: "שגיאה בשמירה: " + error.message };

  return { success: true };
}
