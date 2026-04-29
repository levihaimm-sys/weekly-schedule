"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ClientRecord } from "@/types/database";

export async function addClient(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "נדרש שם לקוח" };

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({ name });

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

export async function deleteClient(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/clients");
  return { success: true };
}
