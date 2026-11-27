import { avatarKey } from "@/bot/components/Inbox";
import type { createClient } from "@/bot/lib/db";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

// Profile pictures for the people behind the cards on screen, keyed by
// avatarKey(account, jid). RLS keeps each account's pictures to those who
// may see that account. Missing table (migration not applied yet) = no pictures.
export async function loadAvatars(supabase: SupabaseClient, items: { account_id: string; chat_jid: string; sender_jid?: string | null }[]): Promise<Map<string, string>> {
  const jids = [...new Set(items.flatMap((i) => [i.chat_jid, i.sender_jid]).filter((j): j is string => Boolean(j)))];
  const map = new Map<string, string>();
  if (!jids.length) return map;
  const { data } = await supabase.from("avatars").select("account_id, jid, image").in("jid", jids).not("image", "is", null);
  for (const a of data ?? []) map.set(avatarKey(a.account_id, a.jid), a.image as string);
  return map;
}
