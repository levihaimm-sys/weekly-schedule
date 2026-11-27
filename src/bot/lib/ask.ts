import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import * as z from "zod/v4";
import type { createClient } from "@/bot/lib/db";

// "Ask the bot": Claude answers free-text questions about the owner's
// WhatsApp conversations by searching the saved messages itself.
// Every query runs with the logged-in user's Supabase session, so Row Level
// Security limits it to the accounts that user may see.

type Db = Awaited<ReturnType<typeof createClient>>;

export type AskTurn = { role: "user" | "assistant"; text: string };
export type Account = "personal" | "business";

const WORLD_PERSONAL = `השאלה נשאלת מתוך העולם הפרטי: יש לך גישה רק לחשבון הוואטסאפ הפרטי (משפחה, חברים, קבוצות). אם שואלים על משהו עסקי, ענה שזה נמצא בעולם העסקי ואפשר לעבור אליו במתג.`;
const WORLD_BUSINESS = `השאלה נשאלת מתוך העולם העסקי: יש לך גישה רק לחשבון הוואטסאפ העסקי (לקוחות, מועמדים, מדריכים). אם שואלים על משהו פרטי, ענה שזה נמצא בעולם הפרטי ואפשר לעבור אליו במתג.
יש לך גם את who_is: מי זה מי במערכת השיבוץ של העמותה (מדריכים, איפה ומתי הם מלמדים והשיעורים שלהם השבוע, צוות, אנשי קשר אצל לקוחות, מועמדים). השתמש בו כדי להבין מי כתב ובמה מדובר, ולשאלות כמו "מי מלמד ביום ג' בפתח תקווה".`;
export type AskResult = { answer: string; steps: string[]; costUsd: number };

const MODEL = process.env.ASK_MODEL || "claude-opus-5-5";
const TZ = "Asia/Jerusalem";

// $ per 1M tokens: input, cache read, output.
const PRICES: Record<string, { input: number; cacheRead: number; output: number }> = {
  "claude-opus-5-5": { input: 4, cacheRead: 0.2, output: 20 },
  "claude-sonnet-5-5": { input: 2, cacheRead: 0.1, output: 10 },
  "claude-haiku-5-5": { input: 0.1, cacheRead: 0.01, output: 0.5 },
};

const SYSTEM = `אתה העוזר האישי של בעל החשבון, ועונה על שאלות לגבי שיחות הוואטסאפ שלו (פרטיות וקבוצות).
כל ההודעות שהבוט קרא שמורות במאגר, ויש לך כלים לחפש בו. ענה רק על סמך מה שמצאת בכלים, אף פעם לא מהדמיון.

איך לעבוד:
- כשהשאלה מזכירה אדם או קבוצה, התחל ב-find_chats כדי למצוא את הצ'אט. אם יש כמה התאמות, בדוק את כולן או שאל למי הכוונה.
- החיפוש ב-search_messages מוצא מילה גם כשהיא חלק ממילה ארוכה ("טיול" מוצא "הטיול", "בטיולים"). חפש כמה ניסוחים ומילים נרדפות בבת אחת (למשל ["טיול", "צימר", "נופש", "צפון"]), ועדיף שורש קצר על פני מילה עם תחיליות.
- כשמצאת הודעה רלוונטית, קרא את ההקשר סביבה עם read_chat לפני שאתה מסיק מסקנות.
- לשאלות על עניינים מתמשכים ("מה קורה עם...", "מה הוחלט") בדוק גם את list_topics.
- אם לא מצאת, אמור זאת בפשטות ופרט מה חיפשת. אל תנחש.

איך לענות:
- בעברית, קצר וישיר: קודם התשובה, אחר כך הפרטים.
- ציין מי אמר, באיזה צ'אט ומתי (תאריך), וצטט משפט קצר כשזה עוזר.
- "אני" או "את/ה" בהודעות שסומנו from_me = בעל החשבון.
- בלי כותרות ובלי טבלאות. רשימה קצרה מותרת.`;

function israelTime(iso: string) {
  return new Date(iso).toLocaleString("he-IL", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MsgRow = {
  account_id: string;
  chat_jid: string;
  chat_name?: string | null;
  id: string;
  sender_name: string | null;
  from_me: boolean;
  sent_at: string;
  body: string | null;
  kind: string;
};

function line(m: MsgRow, withChat: boolean) {
  const who = m.from_me ? "אני" : (m.sender_name ?? "לא ידוע");
  const where = withChat ? ` | ${m.chat_name ?? m.chat_jid.split("@")[0]} [${m.account_id}/${m.chat_jid}]` : "";
  const body = m.body ?? `(${m.kind})`;
  return `${israelTime(m.sent_at)}${where} | ${who}: ${body.length > 600 ? body.slice(0, 600) + "…" : body}`;
}

// Every tool is limited to one account: the world the user is in.
function makeTools(db: Db, steps: string[], account: Account) {
  const findChats = betaZodTool({
    name: "find_chats",
    description:
      "Find chats (private or groups) whose name contains the given text. Returns account, chat_jid, name, whether it is a group and when it was last active. Use the chat_jid with the other tools.",
    inputSchema: z.object({
      name: z.string().describe("Part of the contact or group name, e.g. 'מיטל'"),
    }),
    run: async ({ name }) => {
      steps.push(`חיפוש צ'אט: ${name}`);
      const { data, error } = await db
        .from("chats")
        .select("account_id, jid, name, is_group, last_message_at")
        .eq("account_id", account)
        .ilike("name", `%${name.replace(/[%_\\]/g, "\\$&")}%`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(15);
      if (error) return `error: ${error.message}`;
      if (!data?.length) return "No chat with that name.";
      return data
        .map(
          (c) =>
            `${c.is_group ? "group" : "private"} | ${c.name} | account=${c.account_id} chat_jid=${c.jid} | last message ${c.last_message_at ? israelTime(c.last_message_at) : "never"}`,
        )
        .join("\n");
    },
  });

  const searchMessages = betaZodTool({
    name: "search_messages",
    description:
      "Search saved messages for ANY of the given words (substring match, case-insensitive). Newest first. Optionally limit to chats, a sender, or a date range.",
    inputSchema: z.object({
      words: z.array(z.string()).min(1).max(10).describe("Words or short phrases; a message matching any of them is returned"),
      chat_jids: z.array(z.string()).optional().describe("Only these chats (from find_chats)"),
      from_sender: z.string().optional().describe("Part of the sender's name, or 'me' for the owner's own messages"),
      since: z.string().optional().describe("ISO date/time, inclusive"),
      until: z.string().optional().describe("ISO date/time, exclusive"),
      limit: z.number().int().min(1).max(100).optional().describe("Default 40"),
    }),
    run: async ({ words, chat_jids, from_sender, since, until, limit }) => {
      steps.push(`חיפוש הודעות: ${words.join(", ")}`);
      const max = limit ?? 40;
      const args = {
        words,
        in_chats: chat_jids?.length ? chat_jids : null,
        from_sender: from_sender ?? null,
        since: since ?? null,
        until: until ?? null,
      };
      let { data, error } = await db.rpc("search_messages", { ...args, max_rows: max, in_account: account });
      if (error && /in_account|function/i.test(error.message)) {
        // Database not yet migrated (0014): search everything and keep this account only.
        ({ data, error } = await db.rpc("search_messages", { ...args, max_rows: 200 }));
        data = ((data ?? []) as MsgRow[]).filter((m) => m.account_id === account).slice(0, max);
      }
      if (error) return `error: ${error.message}`;
      const rows = (data ?? []) as MsgRow[];
      if (!rows.length) return "No messages found.";
      return rows.map((m) => line(m, true)).join("\n");
    },
  });

  const readChat = betaZodTool({
    name: "read_chat",
    description:
      "Read messages of one chat in time order. Give 'around' (ISO time of a message you found) to see the context around it; without it you get the latest messages.",
    inputSchema: z.object({
      chat_jid: z.string(),
      around: z.string().optional().describe("ISO time to center on"),
      count: z.number().int().min(5).max(120).optional().describe("How many messages, default 40"),
    }),
    run: async ({ chat_jid, around, count }) => {
      const n = count ?? 40;
      steps.push("קריאת שיחה");
      const base = () =>
        db
          .from("messages")
          .select("account_id, chat_jid, id, sender_name, from_me, sent_at, body, kind")
          .eq("account_id", account)
          .eq("chat_jid", chat_jid);
      let rows: MsgRow[];
      if (around) {
        const [before, after] = await Promise.all([
          base().lt("sent_at", around).order("sent_at", { ascending: false }).limit(Math.ceil(n / 2)),
          base().gte("sent_at", around).order("sent_at", { ascending: true }).limit(Math.floor(n / 2)),
        ]);
        if (before.error || after.error) return `error: ${(before.error ?? after.error)!.message}`;
        rows = [...((before.data ?? []) as MsgRow[]).reverse(), ...((after.data ?? []) as MsgRow[])];
      } else {
        const r = await base().order("sent_at", { ascending: false }).limit(n);
        if (r.error) return `error: ${r.error.message}`;
        rows = ((r.data ?? []) as MsgRow[]).reverse();
      }
      if (!rows.length) return "No messages in this chat.";
      return rows.map((m) => line(m, false)).join("\n");
    },
  });

  const listTopics = betaZodTool({
    name: "list_topics",
    description:
      "Ongoing matters the bot tracks across chats (status card per topic: summary, what was decided, what waits on the owner or others). Includes closed topics. Optional text filter on title/summary.",
    inputSchema: z.object({
      query: z.string().optional().describe("Part of the title or summary"),
    }),
    run: async ({ query }) => {
      steps.push(`נושאים${query ? `: ${query}` : ""}`);
      let q = db
        .from("topics")
        .select("account_id, title, status, summary, decided, waiting_on_me, waiting_on_others, next_step, last_activity_at")
        .eq("account_id", account)
        .order("last_activity_at", { ascending: false, nullsFirst: false })
        .limit(20);
      if (query) {
        const s = query.replace(/[%_\\,()]/g, " ");
        q = q.or(`title.ilike.%${s}%,summary.ilike.%${s}%`);
      }
      const { data, error } = await q;
      if (error) return `error: ${error.message}`;
      if (!data?.length) return "No topics.";
      return JSON.stringify(data);
    },
  });

  // Who is who in the management system (weekly-schedule): business only.
  const whoIs = betaZodTool({
    name: "who_is",
    description:
      "Look up people in the nonprofit's management system (weekly-schedule): instructors with their fixed weekly schedule and this week's lessons, staff, client contacts and recruitment candidates. Search by part of a name, a phone number, a place/organization or a city. Reliable data; use it to know who someone is and where and when they teach.",
    inputSchema: z.object({
      query: z.string().describe("Part of a name, phone, place or city, e.g. 'מיכל' or 'רימון' or 'פתח תקווה'"),
      kind: z.enum(["instructor", "team", "client_contact", "candidate"]).optional(),
    }),
    run: async ({ query, kind }) => {
      steps.push(`חיפוש במערכת השיבוץ: ${query}`);
      const q = query.replace(/[%_\\,()]/g, " ").trim();
      const digits = q.replace(/\D/g, "");
      let req = db.from("ws_people").select("kind, name, phone, organization, city, summary").limit(25);
      if (kind) req = req.eq("kind", kind);
      req = digits.length >= 6
        ? req.like("phone", `%${digits.replace(/^0/, "")}%`)
        : req.or(`name.ilike.%${q}%,organization.ilike.%${q}%,city.ilike.%${q}%,summary.ilike.%${q}%`);
      const { data, error } = await req;
      if (error) return `error: ${error.message}`;
      if (!data?.length) return "No one found in the management system.";
      return data.map((p) => `${p.kind} | ${p.name ?? ""} | ${p.phone ?? "no phone"} | ${p.summary ?? ""}`).join("\n");
    },
  });

  return account === "business" ? [findChats, searchMessages, readChat, listTopics, whoIs] : [findChats, searchMessages, readChat, listTopics];
}

export async function askBot(db: Db, history: AskTurn[], account: Account): Promise<AskResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const steps: string[] = [];
  const now = israelTime(new Date().toISOString());
  const world = account === "business" ? WORLD_BUSINESS : WORLD_PERSONAL;

  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t, i) =>
    i === history.length - 1 && t.role === "user"
      ? { role: "user", content: `(עכשיו: ${now}, שעון ישראל)\n${t.text}` }
      : { role: t.role, content: t.text },
  );

  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 16000,
    max_iterations: 12,
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: world },
    ],
    output_config: { effort: "medium" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    tools: makeTools(db, steps, account),
    messages,
  });

  let cost = 0;
  let input = 0;
  let output = 0;
  let last: Anthropic.Beta.BetaMessage | undefined;
  for await (const message of runner) {
    last = message;
    const p = PRICES[message.model] ?? PRICES[MODEL] ?? PRICES["claude-opus-5-5"];
    const u = message.usage;
    const fresh = (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
    const cached = u.cache_read_input_tokens ?? 0;
    input += fresh + cached;
    output += u.output_tokens ?? 0;
    cost += (fresh * p.input + cached * p.cacheRead + (u.output_tokens ?? 0) * p.output) / 1_000_000;
  }

  await db.from("api_usage").insert({ account_id: account, model: MODEL, input_tokens: input, output_tokens: output, cost_usd: cost });

  if (!last) return { answer: "לא התקבלה תשובה.", steps, costUsd: cost };
  if (last.stop_reason === "refusal") return { answer: "Claude סירב לענות על השאלה הזו.", steps, costUsd: cost };
  const text = last.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  const cut = last.stop_reason === "tool_use" ? "\n\n(החיפוש נעצר לפני שהסתיים, נסה לשאול שאלה ממוקדת יותר.)" : "";
  return { answer: (text || "לא הצלחתי לנסח תשובה.") + cut, steps, costUsd: cost };
}

export function askErrorMessage(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) return "מפתח ה-API של Claude לא תקין. צריך לבדוק את ANTHROPIC_API_KEY בדשבורד.";
  if (err instanceof Anthropic.RateLimitError) return "יותר מדי בקשות ל-Claude כרגע. נסה שוב בעוד דקה.";
  if (err instanceof Anthropic.BadRequestError && /credit/i.test(err.message)) return "נגמר הקרדיט בחשבון ה-API של Claude.";
  if (err instanceof Anthropic.APIConnectionError) return "אין חיבור ל-Claude. נסה שוב.";
  if (err instanceof Anthropic.APIError) return `שגיאה מ-Claude (${err.status ?? "?"}). נסה שוב.`;
  return "משהו השתבש. נסה שוב.";
}
