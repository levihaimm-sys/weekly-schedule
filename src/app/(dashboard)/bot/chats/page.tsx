import Link from "next/link";
import { AppShell, PageBody } from "@/bot/components/AppShell";
import { PrioritySelect } from "@/bot/components/PrioritySelect";
import { WorkToggle } from "@/bot/components/WorkToggle";
import { nameIsWork } from "@/bot/lib/work";
import { formatWhen } from "@/bot/lib/format";
import { requireSpace } from "@/bot/lib/space";

type Chat = {
  account_id: string;
  jid: string;
  name: string | null;
  is_group: boolean;
  priority: string;
  last_message_at: string | null;
  archived: boolean;
  work: boolean | null;
  pinned: boolean;
  muted: boolean;
  priority_source: string;
};

type Activity = { account_id: string; chat_jid: string; incoming: number; outgoing: number };

type Suggestion = { chat: Chat; priority: string | null; reason: string; score: number };

// Who is worth marking: chats pinned or muted on the phone, and people who
// write (and get answers). Only chats the user hasn't marked yet.
function suggest(chat: Chat, act: Activity | undefined): Suggestion | null {
  const incoming = act?.incoming ?? 0;
  const outgoing = act?.outgoing ?? 0;
  const talk = incoming + 3 * outgoing;
  if (chat.pinned) return { chat, priority: "important", reason: "נעוץ אצלך בטלפון", score: 1_000_000 + talk };
  // Muted is NOT a hint: people mute noisy groups they still need to follow
  // (school groups), so muting stays only a 🔕 tag.
  if (chat.is_group || chat.archived || incoming === 0) return null;
  const msgs = `${incoming} הודעות ממנו`;
  if (outgoing > 0 && incoming >= 2) return { chat, priority: "important", reason: `${msgs}, ואתה עונה (${outgoing})`, score: talk };
  return { chat, priority: null, reason: `${msgs} ב-30 הימים האחרונים`, score: talk };
}

const SUGGESTED_LABEL: Record<string, string> = { important: "מומלץ: חשוב" };

const CHAT_COLUMNS = "account_id, jid, name, is_group, priority, last_message_at, archived, work, pinned, muted, priority_source";

// No name known: show the phone number in local form (054-123-4567).
function fallbackName(c: Chat): string {
  if (c.is_group) return "קבוצה בלי שם";
  if (c.jid.endsWith("@lid")) return "איש קשר לא מזוהה";
  const n = c.jid.split("@")[0];
  if (n.startsWith("972") && n.length === 12) return `0${n.slice(3, 5)}-${n.slice(5, 8)}-${n.slice(8)}`;
  return `+${n}`;
}

function displayName(c: Chat): string {
  return c.name && !c.name.startsWith("+") ? c.name : fallbackName(c);
}

const KINDS = [
  { value: "", label: "הכול" },
  { value: "groups", label: "👥 קבוצות" },
  { value: "private", label: "👤 פרטיים" },
];

function chatsHref(params: { q?: string; kind?: string }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.kind) sp.set("kind", params.kind);
  const s = sp.toString();
  return s ? `/bot/chats?${s}` : "/bot/chats";
}

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string }> }) {
  const { q, kind } = await searchParams;
  const { supabase, space } = await requireSpace();
  let query = supabase
    .from("chats")
    .select(CHAT_COLUMNS)
    .eq("account_id", space)
    .order("pinned", { ascending: false })
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true, nullsFirst: false })
    .limit(500);
  const term = (q ?? "").replace(/[,()%*\\]/g, " ").trim();
  if (term) {
    const digits = term.replace(/\D/g, "").replace(/^0/, "");
    query = digits.length >= 4 ? query.or(`name.ilike.%${term}%,jid.ilike.%${digits}%`) : query.ilike("name", `%${term}%`);
  }
  if (kind === "groups") query = query.eq("is_group", true);
  if (kind === "private") query = query.eq("is_group", false);
  const showSuggestions = !term && !kind;
  const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [{ data }, { data: prefs }, { data: candidates }, { data: activity }] = await Promise.all([
    query,
    supabase.from("preferences").select("account_id, work_keywords").eq("account_id", space),
    showSuggestions
      ? supabase
          .from("chats")
          .select(CHAT_COLUMNS)
          .eq("account_id", space)
          .eq("priority_source", "auto")
          .or(`pinned.eq.true,last_message_at.gte.${monthAgo}`)
          .limit(1000)
      : Promise.resolve({ data: [] }),
    supabase.from("chat_activity").select("account_id, chat_jid, incoming, outgoing").eq("account_id", space).limit(5000),
  ]);
  const chats = (data ?? []) as Chat[];
  // Active = wrote in the last 30 days (also "ignore" chats: their time is
  // tracked even though their messages aren't stored).
  const active = chats.filter((c) => c.last_message_at && c.last_message_at >= monthAgo);
  const quiet = chats.filter((c) => !(c.last_message_at && c.last_message_at >= monthAgo));
  const keywordsOf = new Map((prefs ?? []).map((p) => [p.account_id as string, (p.work_keywords ?? []) as string[]]));
  const activityOf = new Map(((activity ?? []) as Activity[]).map((a) => [`${a.account_id}|${a.chat_jid}`, a]));
  const suggestions = ((candidates ?? []) as Chat[])
    .map((c) => suggest(c, activityOf.get(`${c.account_id}|${c.jid}`)))
    .filter((s): s is Suggestion => s !== null && s.priority !== s.chat.priority)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  return (
    <AppShell current="/bot/chats">
    <PageBody title={space === "business" ? "אנשי קשר" : "צ'אטים"} subtitle="מה הבוט שומר ובודק בכל צ'אט">
      <details className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">
        <summary className="cursor-pointer font-medium text-neutral-800 dark:text-neutral-200">מה כל סימון עושה? (לחיצה אחת שומרת)</summary>
        <ul className="mt-2 space-y-2">
          <li>
            <b className="text-emerald-700 dark:text-emerald-400">חשוב</b>: ההודעות נשמרות והבוט מחפש בהן משימות, תמיד. זה הסימון היחיד שגורם
            לבוט לבדוק צ&apos;אט פרטי בחשבון הפרטי, וגם צ&apos;אט בארכיון.
          </li>
          <li>
            <b>רגיל</b>: ההודעות נשמרות. בקבוצה הבוט מחפש משימות. בצ&apos;אט פרטי בחשבון הפרטי ההודעות רק נשמרות ולא נבדקות.
          </li>
          <li>
            <b className="text-amber-600 dark:text-amber-400">רקע</b>: ההודעות נשמרות, אבל משימה נוצרת רק כשמזכירים אותך בשם או מתייגים אותך.
            מתאים לקבוצות גדולות ורועשות.
          </li>
          <li>
            <b className="text-red-600 dark:text-red-400">להתעלם</b>: הבוט לא שומר ולא בודק את הצ&apos;אט, ומוחק מה שכבר נשמר ממנו. לא עולה כסף.
            צ&apos;אט שמעבירים לארכיון בטלפון מסומן כך אוטומטית, אלא אם סימנת אותו כאן ידנית.
          </li>
        </ul>
        <p className="mt-2">
          <b className="text-violet-700 dark:text-violet-400">💼 עבודה</b>: סימון נוסף, בלי קשר לשאר. משימות מהצ&apos;אט מקבלות תג &quot;עבודה&quot; ואפשר לסנן אותן,
          וגם צ&apos;אט פרטי של עבודה נבדק. צ&apos;אט שהשם שלו מכיל מילת עבודה (במסך &quot;מה מעניין אותי&quot;) מסומן אוטומטית.
        </p>
        <p className="mt-2">בכל הסימונים: הודעה שקראת בטלפון לא הופכת למשימה.</p>
      </details>

      {suggestions.length > 0 && (
        <section className="space-y-2">
          <div>
            <h2 className="font-bold">כדאי לסמן</h2>
            <p className="text-sm text-neutral-500">
              מי שנעוץ אצלך בטלפון, ומי שכותב לך בחודש האחרון. לחיצה על כל סימון, גם &quot;רגיל&quot;, מורידה את הצ&apos;אט מהרשימה הזו.
            </p>
          </div>
          <ul className="divide-y divide-line rounded-2xl bg-card border border-accent/40">
            {suggestions.map(({ chat: c, priority, reason }) => (
              <li key={`s-${c.account_id}-${c.jid}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">
                    {c.is_group ? "👥 " : ""}{displayName(c)}
                    {priority && (
                      <span className="ms-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-normal text-emerald-800 dark:text-emerald-300">
                        {SUGGESTED_LABEL[priority]}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">{reason}</p>
                </div>
                <PrioritySelect account={c.account_id} jid={c.jid} value={c.priority} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="flex gap-1.5 text-sm" aria-label="סוג צ'אט">
        {KINDS.map((k) => {
          const on = (kind ?? "") === k.value;
          return (
            <Link
              key={k.value}
              href={chatsHref({ q, kind: k.value })}
              aria-current={on ? "page" : undefined}
              className={`rounded-full border px-3 py-1 ${on ? "bg-sub border-line font-semibold" : "border-line text-muted hover:bg-sub"}`}
            >
              {k.label}
            </Link>
          );
        })}
      </nav>

      <form method="get" className="flex flex-wrap gap-2 text-sm">
        {kind && <input type="hidden" name="kind" value={kind} />}
        <input name="q" defaultValue={q ?? ""} placeholder="חיפוש לפי שם או מספר" className="rounded-xl border border-line bg-card px-3 py-2 flex-1 min-w-40" />
        <button className="rounded-xl bg-accent text-background px-4 py-2 font-medium">חפש</button>
        {q && <Link href={chatsHref({ kind })} className="px-2 py-2 text-muted hover:underline">נקה</Link>}
      </form>

      {chats.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
          אין צ&apos;אטים להצגה.
        </section>
      ) : (
        <>
          {[
            { title: "פעילים בחודש האחרון", list: active },
            { title: "בלי הודעות בחודש האחרון", list: quiet },
          ]
            .filter((g) => g.list.length > 0)
            .map((g) => (
              <section key={g.title} className="space-y-2">
                <h2 className="font-bold">
                  {g.title} <span className="font-normal text-neutral-500">({g.list.length})</span>
                </h2>
                <ul className="divide-y divide-line rounded-2xl bg-card border border-line">
                  {g.list.map((c) => {
                    const act = activityOf.get(`${c.account_id}|${c.jid}`);
                    const count = act ? act.incoming + act.outgoing : 0;
                    return (
                      <li key={`${c.account_id}-${c.jid}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {c.is_group ? "👥 " : ""}{displayName(c)}
                          </p>
                          <p className="text-xs text-muted">
                            {[
                              c.pinned && "📌 נעוץ",
                              c.muted && "🔕 מושתק",
                              c.archived && "בארכיון",
                              c.last_message_at && `הודעה אחרונה ${formatWhen(c.last_message_at)}`,
                              count > 0 && `${count} הודעות בחודש`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PrioritySelect account={c.account_id} jid={c.jid} value={c.priority} />
                          <WorkToggle account={c.account_id} jid={c.jid} marked={c.work} byName={nameIsWork(c.name, keywordsOf.get(c.account_id) ?? [])} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
        </>
      )}
    </PageBody>
    </AppShell>
  );
}
