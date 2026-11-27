import Link from "next/link";
import { AppShell, PageBody } from "@/bot/components/AppShell";
import { AutoRefresh } from "@/bot/components/AutoRefresh";
import { btn } from "@/bot/components/Inbox";
import { SnoozeButton, SnoozedList } from "@/bot/components/TaskRow";
import { FromPersonalTag, WorkMoveButton } from "@/bot/components/WorkMove";
import { formatWhen } from "@/bot/lib/format";
import { requireSpace } from "@/bot/lib/space";
import { setTopicStatus } from "@/bot/actions/topics";

type Topic = {
  id: string;
  account_id: string;
  title: string;
  status: "active" | "resolved" | "dismissed";
  closed_by: "bot" | "user" | null;
  summary: string;
  decided: string[];
  waiting_on_me: string[];
  waiting_on_others: { who: string; what: string }[];
  next_step: string | null;
  chat_jids: string[];
  history: { at: string; change: string }[];
  last_activity_at: string | null;
  updated_at: string;
  work: boolean | null;
  snoozed_until: string | null;
};

export default async function TopicsPage({ searchParams }: { searchParams: Promise<{ closed?: string }> }) {
  const { supabase, space: active, allowed } = await requireSpace();
  const params = await searchParams;
  const showClosed = params.closed === "1";

  // Work topics from the personal number belong to the nonprofit space (and
  // only for users who may see the personal account).
  const cols = "id, account_id, title, status, closed_by, summary, decided, waiting_on_me, waiting_on_others, next_step, chat_jids, history, last_activity_at, updated_at, work, snoozed_until";
  const base = () =>
    supabase
      .from("topics")
      .select(cols)
      .in("status", showClosed ? ["resolved", "dismissed"] : ["active"])
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .limit(100);
  const [{ data }, { data: workData }] = await Promise.all([
    active === "personal" ? base().eq("account_id", "personal").or("work.is.null,work.eq.false") : base().eq("account_id", active),
    active === "business" && allowed.includes("personal") ? base().eq("account_id", "personal").eq("work", true) : Promise.resolve({ data: [] }),
  ]);
  const fetched = [...((data ?? []) as Topic[]), ...((workData ?? []) as Topic[])].sort((a, b) =>
    (b.last_activity_at ?? "").localeCompare(a.last_activity_at ?? ""),
  );
  // Postponed topics stay out of sight until their day comes.
  const nowIso = new Date().toISOString();
  const isSnoozed = (t: Topic) => !showClosed && Boolean(t.snoozed_until && t.snoozed_until > nowIso);
  const topics = fetched.filter((t) => !isSnoozed(t));
  const snoozedItems = fetched
    .filter(isSnoozed)
    .sort((a, b) => a.snoozed_until!.localeCompare(b.snoozed_until!))
    .map((t) => ({ table: "topics" as const, id: t.id, who: "", summary: t.title, until: t.snoozed_until! }));

  const chatName = new Map<string, { name: string; group: boolean }>();
  for (const acc of [...new Set(topics.map((t) => t.account_id))]) {
    const jids = [...new Set(topics.filter((t) => t.account_id === acc).flatMap((t) => t.chat_jids))];
    if (!jids.length) continue;
    const { data: chatRows } = await supabase.from("chats").select("jid, name, is_group").eq("account_id", acc).in("jid", jids);
    for (const c of chatRows ?? []) chatName.set(`${acc}:${c.jid}`, { name: (c.name as string | null) ?? (c.jid as string).split("@")[0], group: c.is_group as boolean });
  }

  const waitingCount = topics.reduce((n, t) => n + (t.waiting_on_me?.length ?? 0), 0);

  return (
    <AppShell current="/bot/topics">
      <AutoRefresh seconds={60} />
      <PageBody
        title="תמונת מצב"
        subtitle={
          showClosed
            ? "נושאים שנסגרו."
            : topics.length
              ? `${topics.length} נושאים פתוחים${waitingCount ? `, ${waitingCount} דברים מחכים לך` : ""}.`
              : "עוד אין נושאים פתוחים."
        }
        actions={
          <Link href={showClosed ? "/bot/topics" : "/bot/topics?closed=1"} className="text-sm text-muted hover:text-foreground">
            {showClosed ? "← לנושאים הפתוחים" : "נושאים שנסגרו"}
          </Link>
        }
      >

      {!showClosed && topics.length === 0 && (
        <section className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted space-y-1">
          <p>הבוט עובר על השיחות כל כמה דקות ובונה כרטיס לכל עניין מתמשך, גם כשהוא מתנהל בכמה צ&apos;אטים.</p>
          <p>נבדקים: קבוצות, צ&apos;אטים שסימנת &quot;חשוב&quot; וצ&apos;אטי עבודה.</p>
        </section>
      )}

      <ul className="space-y-4">
        {topics.map((t) => (
          <TopicCard key={t.id} topic={t} chatName={chatName} fromPersonal={active === "business" && t.account_id === "personal"} />
        ))}
      </ul>
      <SnoozedList items={snoozedItems} />
      </PageBody>
    </AppShell>
  );
}

function TopicCard({ topic: t, chatName, fromPersonal }: { topic: Topic; chatName: Map<string, { name: string; group: boolean }>; fromPersonal: boolean }) {
  const open = t.status === "active";
  return (
    <li className="rounded-2xl bg-card border border-foreground/15 shadow-sm p-5 space-y-3">
      <div>
        <h2 className="text-lg font-bold leading-snug text-accent">
          {t.title} {fromPersonal && <FromPersonalTag />}
        </h2>
        <p className="text-xs text-muted">
          פעילות אחרונה {formatWhen(t.last_activity_at)}
          {!open && ` · ${t.status === "dismissed" ? "סומן כלא נושא" : t.closed_by === "bot" ? "הבוט זיהה שהסתיים" : "סגרת"}`}
        </p>
      </div>

      <p className="leading-relaxed">{t.summary}</p>

      {t.waiting_on_me?.length > 0 && (
        <Section title="מחכה לך" tone="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
          {t.waiting_on_me.map((w, i) => <li key={i}>{w}</li>)}
        </Section>
      )}

      {t.next_step && (
        <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm">
          <b>הצעד הבא:</b> {t.next_step}
        </p>
      )}

      {t.waiting_on_others?.length > 0 && (
        <Section title="מחכים לאחרים">
          {t.waiting_on_others.map((w, i) => (
            <li key={i}>
              <b>{w.who}</b>: {w.what}
            </li>
          ))}
        </Section>
      )}

      {t.decided?.length > 0 && (
        <Section title="הוחלט">
          {t.decided.map((d, i) => <li key={i}>{d}</li>)}
        </Section>
      )}

      {t.chat_jids.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          {t.chat_jids.map((j) => {
            const c = chatName.get(`${t.account_id}:${j}`);
            return (
              <span key={j} className="rounded-full bg-sub border border-line px-2 py-0.5 text-foreground/70">
                {c?.group ? "👥 " : "👤 "}
                {c?.name ?? j.split("@")[0]}
              </span>
            );
          })}
        </div>
      )}

      {t.history?.length > 0 && (
        <details className="text-sm text-muted">
          <summary className="cursor-pointer w-fit">מה השתנה ({t.history.length})</summary>
          <ul className="mt-2 space-y-1">
            {t.history.map((h, i) => (
              <li key={i}>
                <span className="text-xs">{formatWhen(h.at)}</span> · <span className="text-foreground">{h.change}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {open ? (
          <>
            <StatusButton id={t.id} status="resolved" label="העניין הסתיים" className={btn.primary} />
            <SnoozeButton table="topics" id={t.id} />
            <StatusButton id={t.id} status="dismissed" label="לא נושא בשבילי" className={btn.plain} />
            {t.account_id === "personal" && <WorkMoveButton table="topics" id={t.id} work={t.work} />}
          </>
        ) : (
          <StatusButton id={t.id} status="active" label="פתח מחדש" className={btn.plain} />
        )}
      </div>
    </li>
  );
}

function Section({ title, tone, children }: { title: string; tone?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${tone ?? "border-line"}`}>
      <p className="font-semibold mb-1">{title}</p>
      <ul className="list-disc pr-5 space-y-0.5">{children}</ul>
    </div>
  );
}

function StatusButton({ id, status, label, className }: { id: string; status: string; label: string; className: string }) {
  return (
    <form action={setTopicStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={className}>{label}</button>
    </form>
  );
}
