import { NextResponse } from "next/server";
import { createClient, getBotUser } from "@/bot/lib/db";
import { logActivity } from "@/bot/lib/activity";
import { askBot, askErrorMessage, type AskTurn } from "@/bot/lib/ask";
import { getSpace } from "@/bot/lib/space";

// Several Claude round trips plus database searches.
export const maxDuration = 120;

export async function POST(req: Request) {
  // /api is outside the middleware: check the weekly-schedule login here.
  const me = await getBotUser();
  if (!me || me.allowed.length === 0) return NextResponse.json({ error: "צריך להתחבר מחדש." }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "חסר ANTHROPIC_API_KEY בהגדרות הדשבורד (Vercel / .env.local)." }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as { history?: AskTurn[] } | null;
  const history = (body?.history ?? [])
    .filter((t) => (t.role === "user" || t.role === "assistant") && typeof t.text === "string" && t.text.trim())
    .slice(-12)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 4000) }));
  if (!history.length || history.at(-1)!.role !== "user") {
    return NextResponse.json({ error: "לא התקבלה שאלה." }, { status: 400 });
  }

  // Answer only from the world the user is in.
  const { space } = await getSpace();
  const supabase = await createClient();
  if (!space) return NextResponse.json({ error: "אין לך הרשאה לאף חשבון." }, { status: 403 });

  // What the owner asks is a strong hint of what he needs to know.
  await logActivity(supabase, space, "ask", null, { question: history.at(-1)!.text.slice(0, 500) });

  try {
    return NextResponse.json(await askBot(supabase, history, space));
  } catch (err) {
    console.error("ask failed", err);
    return NextResponse.json({ error: askErrorMessage(err) }, { status: 502 });
  }
}
