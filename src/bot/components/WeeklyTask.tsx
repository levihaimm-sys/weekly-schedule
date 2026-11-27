import { makeWeeklyTask } from "@/bot/actions/weekly";
import { btn } from "@/bot/components/Inbox";
import type { createClient } from "@/bot/lib/db";

type Db = Awaited<ReturnType<typeof createClient>>;
export type Assignee = { ws_id: string; name: string | null };

// The fields both lists carry for the weekly-schedule link.
export type WsLink = {
  ws_request?: unknown;
  ws_task_id?: string | null;
  ws_status?: string | null;
  ws_error?: string | null;
};
export const WS_COLS = "ws_request, ws_task_id, ws_status, ws_error";

// Staff in weekly-schedule who can own a task. Empty when the link is off or
// this user cannot see the business account: then the button is not shown.
export async function getAssignees(supabase: Db): Promise<Assignee[]> {
  const { data } = await supabase.from("ws_people").select("ws_id, name").eq("kind", "team").not("ws_id", "is", null).order("name");
  return (data ?? []) as Assignee[];
}

export const WS_STATUS_LABELS: Record<string, string> = {
  pending: "ממתינה",
  in_progress: "בטיפול",
  completed: "בוצעה",
};

// "Make it a task" on a card: a small form that opens in place.
export function MakeTaskButton({
  table,
  id,
  summary,
  due,
  item,
  assignees,
}: {
  table: "tasks" | "requests";
  id: string;
  summary: string;
  due?: string | null;
  item: WsLink;
  assignees: Assignee[];
}) {
  if (!assignees.length || item.ws_task_id) return null;
  if (item.ws_request) return <span className="self-center text-sm text-muted">נשלח למערכת המשימות…</span>;
  const dueDay = due ? due.slice(0, 10) : "";
  return (
    <details className="text-sm">
      <summary className={`${btn.plain} list-none cursor-pointer [&::-webkit-details-marker]:hidden`}>הפוך למשימה</summary>
      <form action={makeWeeklyTask} className="mt-2 space-y-2 w-[min(28rem,80vw)] rounded-xl border border-line bg-sub/60 p-3">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <label className="block space-y-1">
          <span className="text-muted">מה המשימה</span>
          <textarea name="description" rows={2} defaultValue={summary} required className="w-full rounded-xl border border-line bg-card px-3 py-2" />
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="space-y-1">
            <span className="block text-muted">אחראי</span>
            <select name="assigned_to" className="rounded-xl border border-line bg-card px-3 py-2">
              {assignees.map((a) => (
                <option key={a.ws_id} value={a.ws_id}>
                  {a.name ?? "ללא שם"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-muted">עד מתי</span>
            <input type="date" name="due_date" defaultValue={dueDay} className="rounded-xl border border-line bg-card px-3 py-2" />
          </label>
          <label className="flex items-center gap-1.5 self-end pb-2">
            <input type="checkbox" name="urgent" />
            דחוף
          </label>
        </div>
        <button className={btn.primary}>ליצור משימה ב-weekly-schedule</button>
      </form>
    </details>
  );
}

// Items that moved to weekly-schedule: off the "missed" list, shown here until
// the task is completed there (then the worker closes them).
export function MovedToTasks({ items }: { items: { id: string; who: string; summary: string; ws_status?: string | null }[] }) {
  if (!items.length) return null;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-muted hover:text-foreground w-fit">
        {items.length === 1 ? "דבר אחד הועבר" : `${items.length} דברים הועברו`} למערכת המשימות ועוד לא בוצעו
      </summary>
      <ul className="mt-3 rounded-2xl border border-line bg-card divide-y divide-line">
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
            <span className="min-w-0">
              <b>{i.who}:</b> {i.summary}
            </span>
            <span className="rounded-md bg-accent-soft text-accent px-1.5 text-xs">{WS_STATUS_LABELS[i.ws_status ?? "pending"] ?? i.ws_status}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

// A note under a card when creating the task failed.
export function WsError({ item }: { item: WsLink }) {
  if (!item.ws_error) return null;
  return <p className="ps-[52px] text-sm text-red-600 dark:text-red-400">לא הצלחתי ליצור את המשימה: {item.ws_error}</p>;
}
