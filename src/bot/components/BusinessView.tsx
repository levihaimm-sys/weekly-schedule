import { createHash } from "node:crypto";
import { markBriefItemSeen, markBriefSeen, promoteBriefItem } from "@/bot/actions/brief";
import { requestBriefNow, setRequestStatus } from "@/bot/actions/requests";
import { createClient } from "@/bot/lib/db";
import { formatWhen, israelDay } from "@/bot/lib/format";
import { waitingLabel, workingHoursSince } from "@/bot/lib/business-hours";
import { Avatar, avatarKey, btn, firstName, SummaryAndQuote, tag } from "@/bot/components/Inbox";
import { phoneOf, ReplyButton, SnoozeButton } from "@/bot/components/TaskRow";
import { MakeTaskButton, WS_COLS, WsError, type Assignee, type WsLink } from "@/bot/components/WeeklyTask";

export type Role = "instructor" | "candidate" | "client" | "other";

export type Request = WsLink & {
  id: string;
  account_id: string;
  chat_jid: string;
  sender_jid?: string | null;
  sender_name: string | null;
  message_at: string;
  quote: string | null;
  summary: string;
  status: "open" | "promised" | "done" | "dismissed";
  close_reason: string | null;
  closed_by: "bot" | "user" | null;
  snoozed_until?: string | null;
  chats: { name: string | null; is_group: boolean; phone_jid: string | null; contact_role: Role | null } | null;
};

type BriefItem = {
  group: "instructors" | "candidates" | "clients" | "other";
  who: string;
  text: string;
  chat_jid?: string | null;
  promoted?: "important" | "remember";
};
type Brief = { day: string; items: BriefItem[]; open_requests: number; generated_at: string; seen_at: string | null; seen_items: string[] | null };

// An item is kept by a key made from its text, not its position (matches mark_brief_item_seen).
const itemKey = (text: string) => createHash("md5").update(text).digest("hex").slice(0, 12);
// Done = marked "ראיתי" on its own, or raised to "important" / "remember".
const itemDone = (b: Brief, item: BriefItem) => Boolean(item.promoted) || (b.seen_items ?? []).includes(itemKey(item.text));
// Seen = marked "ראיתי" after it was last written ("לעדכן עכשיו" makes it new
// again), or every item in it is done.
const isSeen = (b: Brief) => Boolean(b.seen_at && b.seen_at >= b.generated_at) || (b.items.length > 0 && b.items.every((i) => itemDone(b, i)));

function ItemSeenButton({ account, day, text }: { account: string; day: string; text: string }) {
  return (
    <form action={markBriefItemSeen}>
      <input type="hidden" name="account" value={account} />
      <input type="hidden" name="day" value={day} />
      <input type="hidden" name="key" value={itemKey(text)} />
      <button title="ראיתי, להוריד מכאן" className="rounded-lg border border-line px-2 py-0.5 text-xs text-muted hover:border-accent hover:bg-accent-soft hover:text-accent">
        ✓ ראיתי
      </button>
    </form>
  );
}

function SeenButton({ account, days, label }: { account: string; days: string[]; label: string }) {
  return (
    <form action={markBriefSeen}>
      <input type="hidden" name="account" value={account} />
      <input type="hidden" name="days" value={days.join(",")} />
      <button className={btn.plain}>{label}</button>
    </form>
  );
}

export const ROLE_LABELS: Record<Role, string> = {
  instructor: "מדריך/ה",
  candidate: "מועמד/ת",
  client: "לקוח",
  other: "אחר",
};

const ROLE_TAG: Record<Role, string> = {
  instructor: tag.indigo,
  candidate: tag.amber,
  client: tag.green,
  other: tag.gray,
};

const GROUPS:{ key: BriefItem["group"]; label: string }[] = [
  { key: "instructors", label: "מדריכים" },
  { key: "candidates", label: "מועמדים" },
  { key: "clients", label: "לקוחות" },
  { key: "other", label: "אחר" },
];

export const REQUEST_COLS = `id, account_id, chat_jid, sender_jid, sender_name, message_at, quote, summary, status, close_reason, closed_by, snoozed_until, ${WS_COLS}, chats(name, is_group, phone_jid, contact_role)`;

export function dayLabel(day: string): string {
  if (day === israelDay(new Date())) return "היום";
  if (day === israelDay(new Date(Date.now() - 86_400_000))) return "אתמול";
  const [, m, d] = day.split("-");
  return `${Number(d)}/${Number(m)}`;
}

export function RequestStatusButton({ id, status, label, kind = "plain" }: { id: string; status: string; label: string; kind?: keyof typeof btn }) {
  return (
    <form action={setRequestStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={btn[kind]}>{label}</button>
    </form>
  );
}

// A request that may have been lost: nobody on the team answered it.
// avatars: "account|jid" -> profile picture (see avatarKey).
export function MissedRequestCard({ r, urgentAfter, assignees = [], avatars }: { r: Request; urgentAfter: number; assignees?: Assignee[]; avatars?: Map<string, string> }) {
  const isGroup = r.chats?.is_group ?? false;
  const chatName = r.chats?.name ?? (isGroup ? "קבוצה" : "צ'אט פרטי");
  const who = r.sender_name ?? chatName;
  const role = r.chats?.contact_role;
  const late = workingHoursSince(r.message_at) >= urgentAfter;
  const face = avatars?.get(avatarKey(r.account_id, isGroup ? r.sender_jid : r.chat_jid));
  return (
    <li className="rounded-2xl border border-line bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <Avatar name={who} src={face} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
            <b className="text-base">{who}</b>
            {role && role !== "other" && <span className={`${tag.base} ${ROLE_TAG[role]}`}>{ROLE_LABELS[role]}</span>}
            {isGroup && <span className="text-muted">בקבוצה {chatName}</span>}
            <span className={late ? "text-red-600 dark:text-red-400 font-medium" : "text-muted"}>· ממתין {waitingLabel(r.message_at)}</span>
            {r.status === "promised" && <span className={`${tag.base} ${tag.amber}`}>הבטחתם לחזור</span>}
          </p>
          <SummaryAndQuote summary={r.summary} quote={r.quote} by={firstName(who)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 ps-[52px]">
        <RequestStatusButton id={r.id} status="done" label="טופל" kind="primary" />
        <ReplyButton phone={isGroup ? null : phoneOf(r.chat_jid, r.chats?.phone_jid)} chatName={chatName} sender={who} at={r.message_at} />
        <MakeTaskButton table="requests" id={r.id} summary={r.summary} item={r} assignees={assignees} />
        <SnoozeButton table="requests" id={r.id} />
        <RequestStatusButton id={r.id} status="dismissed" label="לא צריך" kind="quiet" />
      </div>
      <WsError item={r} />
    </li>
  );
}

const PROMOTED_LABELS = { important: "הועבר לחשוב", remember: "הועבר ללזכור" } as const;

// "Raise it": move a brief item up to "important" or "remember".
function PromoteButtons({ account, day, idx, item }: { account: string; day: string; idx: number; item: BriefItem }) {
  if (item.promoted) {
    return <span className="shrink-0 rounded-md bg-accent-soft text-accent px-1.5 text-xs">{PROMOTED_LABELS[item.promoted]}</span>;
  }
  if (!item.chat_jid) return null;
  const button = (target: "important" | "remember", label: string) => (
    <form action={promoteBriefItem}>
      <input type="hidden" name="account" value={account} />
      <input type="hidden" name="day" value={day} />
      <input type="hidden" name="idx" value={idx} />
      <input type="hidden" name="target" value={target} />
      <button className="rounded-lg px-2 py-0.5 text-xs text-muted hover:bg-sub hover:text-foreground">{label}</button>
    </form>
  );
  return (
    <span className="shrink-0 flex gap-0.5 opacity-60 group-hover:opacity-100 focus-within:opacity-100">
      {button("important", "↑ לחשוב")}
      {button("remember", "↑ לזכור")}
    </span>
  );
}

// active: the brief on the day page — done items are hidden and each item gets
// "✓ ראיתי". Otherwise (older briefs) everything is shown as it was.
function BriefItems({ brief, personal, account, active = false }: { brief: Brief; personal: boolean; account: string; active?: boolean }) {
  const day = brief.day;
  const indexed = brief.items.map((item, idx) => ({ item, idx })).filter((x) => !active || !itemDone(brief, x.item));
  const row = ({ item, idx }: { item: BriefItem; idx: number }, sep: string) => (
    <div className="group flex items-start gap-2">
      <p className="flex-1 min-w-0 leading-relaxed">
        <b>
          {item.who}
          {sep}
        </b>{" "}
        {item.text}
      </p>
      <span className="shrink-0 flex items-center gap-1">
        <PromoteButtons account={account} day={day} idx={idx} item={item} />
        {active && <ItemSeenButton account={account} day={day} text={item.text} />}
      </span>
    </div>
  );
  if (personal) {
    return (
      <ol className="divide-y divide-line">
        {indexed.map((x) => (
          <li key={x.idx} className="px-4 py-3">
            {row(x, ".")}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <div className="divide-y divide-line">
      {GROUPS.map((g) => {
        const list = indexed.filter((x) => x.item.group === g.key);
        if (!list.length) return null;
        return (
          <div key={g.key} className="px-4 py-3 space-y-1.5">
            <h3 className="text-xs font-semibold tracking-wide text-accent">{g.label}</h3>
            <ul className="space-y-1.5">
              {list.map((x) => (
                <li key={x.idx}>{row(x, ":")}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// "What mattered today": every brief not yet marked "ראיתי" (newest first, so
// days missed pile up here instead of vanishing), seen ones folded away.
export async function BriefBlock({ account, personal }: { account: string; personal: boolean }) {
  const supabase = await createClient();
  const [{ data: briefs }, { data: pref }] = await Promise.all([
    supabase.from("daily_briefs").select("day, items, open_requests, generated_at, seen_at, seen_items").eq("account_id", account).order("day", { ascending: false }).limit(14),
    supabase.from("preferences").select("brief_requested_at, brief_hour").eq("account_id", account).maybeSingle(),
  ]);
  const all = (briefs ?? []) as unknown as Brief[];
  const latest = all[0];
  const unseen = all.filter((b) => !isSeen(b));
  const older = all.filter(isSeen).slice(0, 7);
  const isToday = latest?.day === israelDay(new Date());
  const pending = Boolean(pref?.brief_requested_at && (!latest || new Date(pref.brief_requested_at) > new Date(latest.generated_at)));
  const hour = pref?.brief_hour ?? 20;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          {!latest ? "עוד אין סיכום. הסיכום נכתב כל ערב, או בלחיצה על \"לכתוב עכשיו\"." : isToday ? `נכתב ${formatWhen(latest.generated_at)}` : `הסיכום של היום ייכתב ב-${hour}:00`}
        </span>
        <span className="flex flex-wrap gap-1.5">
          {unseen.length > 1 && <SeenButton account={account} days={unseen.map((b) => b.day)} label={`✓ ראיתי את כל ה-${unseen.length}`} />}
          <form action={requestBriefNow}>
            <input type="hidden" name="account" value={account} />
            <button disabled={pending} className={`${btn.quiet} disabled:opacity-50`}>
              {pending ? "הסיכום בהכנה…" : isToday ? "לעדכן עכשיו" : "לכתוב עכשיו"}
            </button>
          </form>
        </span>
      </div>
      {latest && unseen.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-muted">✓ ראית את כל הסיכומים.</p>
      )}
      {unseen.map((b) => {
        const done = b.items.filter((i) => itemDone(b, i)).length;
        return (
          <div key={b.day} className="rounded-2xl border border-line bg-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-line bg-sub/60 text-sm">
              <span className="text-muted">
                הסיכום של <b className="text-foreground">{dayLabel(b.day)}</b>
                {done > 0 && ` · נשארו ${b.items.length - done} מתוך ${b.items.length}`}
              </span>
              <SeenButton account={account} days={[b.day]} label={b.items.length > 1 ? "✓ ראיתי הכל" : "✓ ראיתי"} />
            </div>
            {b.items.length === 0 ? (
              <p className="px-4 py-6 text-muted">יום שקט: לא היה משהו משמעותי.</p>
            ) : (
              <BriefItems brief={b} personal={personal} account={account} active />
            )}
          </div>
        );
      })}
      {older.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted hover:text-foreground w-fit">סיכומים קודמים</summary>
          <div className="mt-3 space-y-3">
            {older.map((b) => (
              <div key={b.day} className="rounded-2xl border border-line bg-card overflow-hidden">
                <h3 className="px-4 py-2 border-b border-line font-semibold">{dayLabel(b.day)}</h3>
                {b.items.length ? <BriefItems brief={b} personal={personal} account={account} /> :<p className="px-4 py-3 text-muted">יום שקט.</p>}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
