import { createClient as createSupabase } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient as createWsClient } from "@/lib/supabase/server";

// The WhatsApp bot keeps its own database (private messages stay out of the
// nonprofit's database). Users log in to weekly-schedule only, so the bot
// database cannot see them: this server code checks who is logged in and which
// bot accounts they may see (profiles.wa_accounts), then uses the service role.
// Every query must therefore filter by an allowed account itself.

export type BotAccount = "personal" | "business";
const isAccount = (v: unknown): v is BotAccount => v === "personal" || v === "business";

// The logged-in weekly-schedule admin and the bot accounts they may see.
export const getBotUser = cache(async () => {
  const ws = await createWsClient();
  const {
    data: { user },
  } = await ws.auth.getUser();
  if (!user) return null;
  const { data: profile } = await ws.from("profiles").select("role, wa_accounts").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return null;
  const allowed = ((profile?.wa_accounts ?? []) as string[]).filter(isAccount);
  return { id: user.id, allowed };
});

function botClient() {
  const url = process.env.BOT_SUPABASE_URL;
  const key = process.env.BOT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("BOT_SUPABASE_URL / BOT_SUPABASE_SERVICE_ROLE_KEY are not set");
  return createSupabase(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Bot database client. Only for a logged-in admin with at least one bot account.
export const createClient = cache(async () => {
  const me = await getBotUser();
  if (!me) redirect("/login");
  if (me.allowed.length === 0) redirect("/dashboard");
  return botClient();
});

export type Db = Awaited<ReturnType<typeof createClient>>;

// The accounts the logged-in user may touch: add .in("account_id", ...) to
// every update by id.
export async function myAccounts(): Promise<BotAccount[]> {
  return (await getBotUser())?.allowed ?? [];
}

// Throws unless the logged-in user may see this account.
export async function assertAccount(account: unknown): Promise<BotAccount> {
  const me = await getBotUser();
  if (!me || !isAccount(account) || !me.allowed.includes(account)) throw new Error("not allowed");
  return account;
}
