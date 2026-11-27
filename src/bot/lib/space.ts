import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, getBotUser, type BotAccount } from "@/bot/lib/db";
import { BOT_SPACE_COOKIE } from "@/bot/lib/nav";

// The WhatsApp section is split into two separate worlds: personal and business.
// The chosen world is kept in a cookie so it stays the same across pages;
// every page shows only that world's data.

export type Space = BotAccount;

export const SPACE_COOKIE = BOT_SPACE_COOKIE;

export const SPACES: Record<Space, { label: string; sub: string; letter: string }> = {
  personal: { label: "פרטי", sub: "משימות אישיות", letter: "פ" },
  business: { label: "עמותה", sub: "פניות, מדריכים, וגם עבודה מהפרטי", letter: "ע" },
};

export function isSpace(v: unknown): v is Space {
  return v === "personal" || v === "business";
}

// Logged-in user, the worlds they may see, and the active one.
// space is null when the user has no world at all.
export async function getSpace() {
  const me = await getBotUser();
  if (!me) redirect("/login");
  const supabase = await createClient();
  const allowed = me.allowed;
  const saved = (await cookies()).get(SPACE_COOKIE)?.value;
  const space: Space | null = isSpace(saved) && allowed.includes(saved) ? saved : (allowed[0] ?? null);
  return { supabase, user: me, allowed, space };
}

// For pages that make no sense without a world.
export async function requireSpace() {
  const ctx = await getSpace();
  if (!ctx.space) redirect("/dashboard");
  return { ...ctx, space: ctx.space as Space };
}
