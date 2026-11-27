import type { createClient } from "@/bot/lib/db";

type Db = Awaited<ReturnType<typeof createClient>>;

// What the user DOES in the dashboard (closed a request, changed a priority,
// asked the bot...). The weekly learning run reads it to see how the work is
// really done. Never blocks or breaks the action itself.
export async function logActivity(
  supabase: Db,
  account: string | null,
  action: string,
  targetId?: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    await supabase.from("activity_log").insert({ account_id: account || null, action, target_id: targetId ?? null, details });
  } catch {
    // logging is best effort
  }
}
