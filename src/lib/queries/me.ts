import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// The logged-in user and their profile, once per request. The admin layout and
// the WhatsApp bot pages both need it; cache() makes them share one query.
// getClaims() checks the login token locally when the project signs tokens with
// asymmetric keys, so it usually costs no round trip to Supabase Auth.
export const getMe = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_owner, can_view_payroll, wa_accounts")
    .eq("id", userId)
    .maybeSingle();
  return { userId, profile };
});
