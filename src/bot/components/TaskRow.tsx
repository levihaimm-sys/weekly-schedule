import { giveFeedback, setTaskStatus, snoozeItem } from "@/bot/actions/tasks";
import { ago, formatDay, formatWhen, israelDayFromToday } from "@/bot/lib/format";
import { Avatar, avatarKey, btn, firstName, SummaryAndQuote, tag } from "@/bot/components/Inbox";
import { Icon } from "@/bot/components/Icon";
import { MakeTaskButton, WS_COLS, WsError, type Assignee, type WsLink } from "@/bot/components/WeeklyTask";
import { FromPersonalTag, WorkMoveButton } from "@/bot/components/WorkMove";

export type Task = WsLink & {
  id: string;
  account_id: string;
  chat_jid: string;
  source_message_id: string | null;
  sender_name: string | null;
  message_at: string | null;
  quote: string | null;
  summary: string;
  type: "action" | "question_to_me" | "info_to_remember" | "deadline";
  due_at: string | null;
  urgent: boolean;
  status: "open" | "done" | "dismissed" | "auto_done";
  close_reason: string | null;
  closed_at?: string | null;
  sender_jid?: string | null;
  snoozed_until?: string | null;
  work?: boolean | null;
  chats: { name: string | null; is_group: boolean; phone_jid: string | null; work: boolean | null; priority: string | null } | null;
};

export const TASK_COLS = `id, account_id, chat_jid, source_message_id, sender_name, sender_jid, message_at, quote, summary, type, due_at, urgent, status, close_reason, closed_at, snoozed_until, work, ${WS_COLS}, chats(name, is_group, phone_jid, work, priority)`;

export const TYPE_LABELS: Record<Task["type"], string> = {
  action: "לעשות",
  question_to_me: "שאלה אליך",
  info_to_remember: "לזכור",
  deadline: "מועד",
};

// "Did I miss it?" items ask for a response. School/background groups and
// dates or things to remember go to the "remember" list instead.
export function isToRemember(t: Task): boolean {
  return t.chats?.priority === "background" || t.type === "info_to_remember" || t.type === "deadline";
}

export function phoneOf(chatJid: string, phoneJid: string | null | undefined): string | null {
  const jid = phoneJid ?? (chatJid.endsWith("@s.whatsapp.net") ? chatJid : null);
  return jid ? jid.split("@")[0].split(":")[0] : null;
}

export function TaskStatusButton({ id, account, status, label, kind = "plain" }: { id: string; account: string; status: string; label: string; kind?: keyof typeof btn }) {
  return (
    <form action={setTaskStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="account" value={account} />
      <button className={btn[kind]}>{label}</button>
    </form>
  );
}

export function ReplyButton({ phone, chatName, sender, at }: { phone: string | null; chatName: string; sender: string; at: string | null }) {
  if (phone) {
    return (
      <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className={`${btn.plain} inline-flex items-center gap-1.5`}>
        <Icon name="reply" className="size-4" />
        להגיב
      </a>
    );
  }
  return (
    <details className="relative">
      <summary className={`${btn.plain} list-none cursor-pointer inline-flex items-center gap-1.5 [&::-webkit-details-marker]:hidden`}>
        <Icon name="reply" className="size-4" />
        להגיב
      </summary>
      <p className="absolute z-10 start-0 mt-1 w-64 rounded-xl border border-line bg-card p-3 text-sm shadow-lg">
        בוואטסאפ, בקבוצה <b>{chatName}</b>, ההודעה של <b>{sender}</b> מ-<b>{formatWhen(at)}</b>
      </p>
    </details>
  );
}

export type SnoozeTable = "tasks" | "requests" | "topics";

// "לדחות": tomorrow in one click, or any later day.
export function SnoozeButton({ table, id }: { table: SnoozeTable; id: string }) {
  return (
    <details className="text-sm">
      <summary className={`${btn.quiet} list-none cursor-pointer inline-flex items-center gap-1 [&::-webkit-details-marker]:hidden`}>לדחות</summary>
      <div className="mt-2 w-60 rounded-xl border border-line bg-sub/40 p-3 space-y-3">
        <form action={snoozeItem}>
          <input type="hidden" name="table" value={table} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="day" value="tomorrow" />
          <button className={`${btn.primary} w-full`}>
            למחר
          </button>
        </form>
        <form action={snoozeItem} className="space-y-2">
          <input type="hidden" name="table" value={table} />
          <input type="hidden" name="id" value={id} />
          <label className="block text-xs text-muted">
            או לתאריך אחר
            <input type="date" name="day" required min={israelDayFromToday(1)} className="mt-1 w-full rounded-lg border border-line bg-card px-2 py-1.5 text-sm text-foreground" />
          </label>
          <button className={`${btn.plain} w-full`}>לדחות לתאריך הזה</button>
        </form>
      </div>
    </details>
  );
}

// "Teach the bot": 👍 / 👎 with an optional note, fed to the classifier.
function TeachBot({ t, good, bad, placeholder }: { t: Task; good: string; bad: string; placeholder: string }) {
  return (
    <details className="text-sm">
      <summary className={`${btn.quiet} list-none cursor-pointer [&::-webkit-details-marker]:hidden`}>ללמד את הבוט</summary>
      <form action={giveFeedback} className="mt-2 space-y-2 w-[min(28rem,80vw)]">
        <input type="hidden" name="id" value={t.id} />
        <input type="hidden" name="account" value={t.account_id} />
        <textarea name="note" rows={2} placeholder={placeholder} className="w-full rounded-xl border border-line bg-card px-3 py-2" />
        {/* Radios, not two submit buttons: the clicked button's value does not reach the server action. */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { v: "good", label: `👍 ${good}` },
            { v: "bad", label: `👎 ${bad}` },
          ].map((o) => (
            <label key={o.v} className={`${btn.plain} cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-accent`}>
              <input type="radio" name="verdict" value={o.v} required className="sr-only" />
              {o.label}
            </label>
          ))}
          <button className={btn.primary}>לשמור</button>
        </div>
      </form>
    </details>
  );
}

// One item in "maybe you missed": who, what they need, and quick actions.
// promise: the owner promised this himself ("אשלח לך מחר").
// avatars: "account|jid" -> profile picture (see avatarKey).
export function MissedTaskCard({ t, promise = false, assignees = [], fromPersonal = false, avatars }: { t: Task; promise?: boolean; assignees?: Assignee[]; fromPersonal?: boolean; avatars?: Map<string, string> }) {
  const isGroup = t.chats?.is_group ?? false;
  const chatName = t.chats?.name ?? (isGroup ? "קבוצה" : "צ'אט פרטי");
  const sender = t.sender_name ?? "לא ידוע";
  const who = promise ? chatName : sender;
  // A promise shows the chat it was made in; otherwise whoever wrote.
  const face = avatars?.get(avatarKey(t.account_id, promise || !isGroup ? t.chat_jid : t.sender_jid));
  return (
    <li className="rounded-2xl border border-line bg-card p-4 space-y-3">
      <div className="flex gap-3">
        <Avatar name={who} src={face} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
            {promise ? (
              <>
                <span className={`${tag.base} ${tag.accent}`}>הבטחת</span>
                <b className="text-base">{isGroup ? `בקבוצה ${chatName}` : `ל${chatName}`}</b>
              </>
            ) : (
              <>
                <b className="text-base">{sender}</b>
                {isGroup && <span className="text-muted">בקבוצה {chatName}</span>}
              </>
            )}
            <span className="text-muted">· {ago(t.message_at)}</span>
            {promise && t.due_at && <span className="text-muted">· עד {formatWhen(t.due_at)}</span>}
            {t.urgent && <span className={`${tag.base} ${tag.red}`}>דחוף</span>}
            {fromPersonal && <FromPersonalTag />}
          </p>
          <SummaryAndQuote summary={t.summary} quote={t.quote} by={promise ? "אתה" : firstName(sender)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 ps-[52px]">
        <TaskStatusButton id={t.id} account={t.account_id} status="done" label={promise ? "עשיתי" : "טיפלתי"} kind="primary" />
        <ReplyButton phone={isGroup ? null : phoneOf(t.chat_jid, t.chats?.phone_jid)} chatName={chatName} sender={sender} at={t.message_at} />
        <MakeTaskButton table="tasks" id={t.id} summary={t.summary} due={t.due_at} item={t} assignees={assignees} />
        <SnoozeButton table="tasks" id={t.id} />
        <TaskStatusButton id={t.id} account={t.account_id} status="dismissed" label="לא חשוב" kind="quiet" />
        <TeachBot t={t} good="טוב שהצגת" bad="לא היה צריך" placeholder="למה כן או למה לא?" />
        {t.account_id === "personal" && <WorkMoveButton table="tasks" id={t.id} work={t.work} />}
      </div>
      <WsError item={t} />
    </li>
  );
}

// One line in "remember": what, from where, a check-off, postpone, and
// "teach the bot" (👍 important to remember / 👎 not needed).
export function RememberRow({ t, fromPersonal = false }: { t: Task; fromPersonal?: boolean }) {
  const where = t.chats?.is_group ? t.chats?.name : t.sender_name;
  return (
    <li className="px-4 py-3 space-y-1.5">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 size-2 rounded-full bg-accent shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="leading-snug">{t.summary}</p>
          <p className="text-xs text-muted">
            {where}
            {t.due_at && ` · ${formatWhen(t.due_at)}`}
            {fromPersonal && (
              <>
                {" "}
                <FromPersonalTag />
              </>
            )}
          </p>
        </div>
        <TaskStatusButton id={t.id} account={t.account_id} status="done" label="✓" kind="quiet" />
      </div>
      <div className="flex flex-wrap gap-1 ps-5">
        <SnoozeButton table="tasks" id={t.id} />
        <TeachBot t={t} good="חשוב לזכור" bad="לא צריך לזכור" placeholder="מה חשוב לך לזכור ומה לא? למשל: מהקבוצה של הכיתה רק תשלומים וטפסים" />
        {t.account_id === "personal" && <WorkMoveButton table="tasks" id={t.id} work={t.work} />}
      </div>
    </li>
  );
}

// Postponed items, folded away, with a way to bring each one back now.
export function SnoozedList({ items }: { items: { table: SnoozeTable; id: string; who: string; summary: string; until: string }[] }) {
  if (!items.length) return null;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-muted hover:text-foreground w-fit">{items.length === 1 ? "דבר אחד נדחה" : `${items.length} דברים נדחו`}</summary>
      <ul className="mt-3 rounded-2xl border border-line bg-card divide-y divide-line">
        {items.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <span className="min-w-0">
              {s.who && <b>{s.who}: </b>}
              {s.summary}
              <span className="text-muted"> · יחזור {formatDay(s.until)}</span>
            </span>
            <form action={snoozeItem}>
              <input type="hidden" name="table" value={s.table} />
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="day" value="now" />
              <button className={btn.quiet}>להחזיר עכשיו</button>
            </form>
          </li>
        ))}
      </ul>
    </details>
  );
}
