"use server";

import { revalidatePath } from "next/cache";
import { assertAccount, createClient } from "@/bot/lib/db";

// Asks the worker to connect (and show a QR if the account isn't paired).
// RLS only lets the user touch accounts they are allowed to see.
export async function requestConnect(formData: FormData) {
  const accountId = await assertAccount(String(formData.get("account") ?? ""));
  const supabase = await createClient();
  await supabase
    .from("accounts")
    .update({ pair_requested_at: new Date().toISOString() })
    .eq("id", accountId);
  revalidatePath("/bot/connection");
}
