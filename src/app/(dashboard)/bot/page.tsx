import { AppShell } from "@/bot/components/AppShell";
import { AutoRefresh } from "@/bot/components/AutoRefresh";
import { BriefBlock, MissedRequestCard, REQUEST_COLS, RequestStatusButton, type Request } from "@/bot/components/BusinessView";
import { Section } from "@/bot/components/Inbox";
import { isToRemember, MissedTaskCard, RememberRow, SnoozedList, TASK_COLS, TaskStatusButton, type Task } from "@/bot/components/TaskRow";
import { getAssignees, MovedToTasks } from "@/bot/components/WeeklyTask";
import { israelStartOfDay } from "@/bot/lib/business-hours";
import { israelDay, israelDayFromToday, longToday } from "@/bot/lib/format";
import { getSpace } from "@/bot/lib/space";
import { loadAvatars } from "@/bot/lib/avatars";

// The end-of-day check. Not another way to read WhatsApp: three levels.
// 1. Important: what got no response yet (and what the user raised to it).
// 2. Remember: practical notices and dates (school groups, things to bring).
// 3. What mattered today: the daily brief, even for things already handled.
//    Any brief item can be raised to "important" or "remember".
export default async function Home() {
  const { space } = await getSpace();
  return (
    <AppShell current="/bot">
      <AutoRefresh seconds={120} />
      <main className="mx-auto max-w-3xl px-4 md:px-8 py-6 md:py-10 space-y-10">
        {space === "business" ? <BusinessDay /> : space ? <PersonalDay /> : null}
      </main>
    </AppShell>
  );
}

function DayHeader({ missed }: { missed: number }) {
  return (
    <header className="space-y-3">
      <p className="text-sm text-muted">{longToday()}</p>
      {missed === 0 ? (
        <h1 className="text-3xl font-bold text-balance">
          <span className="text-accent">✓</span> אין משהו חשוב שמחכה לך
        </h1>
      ) : (
        <h1 className="text-3xl font-bold text-balance">
          {missed === 1 ? "דבר חשוב אחד" : `${missed} דברים חשובים`} מחכים לך
        </h1>
      )}
    </header>
  );
}

function AllClear({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-muted">{text}</p>;
}

// Remember: from today on, or recent ones without a date. An item that was
// postponed and came back counts as today's. Same on both sides.
function rememberDay(t: Task) {
  const today = israelDay(new Date());
  const back = t.snoozed_until ? israelDay(t.snoozed_until) : null;
  if (back === today) return today;
  return t.due_at ? israelDay(t.due_at) : null;
}

function rememberOf(open: Task[]) {
  const today = israelDay(new Date());
  const recent = Date.now() - 3 * 86_400_000;
  return open
    .filter(isToRemember)
    .filter((t) => {
      const d = rememberDay(t);
      return d ? d >= today : new Date(t.message_at ?? 0).getTime() >= recent;
    })
    .sort((a, b) => (rememberDay(a) ?? "9999").localeCompare(rememberDay(b) ?? "9999"));
}

function RememberList({ remember }: { remember: Task[] }) {
  const today = israelDay(new Date());
  const tomorrow = israelDayFromToday(1);
  const groups = [
    { label: "היום", list: remember.filter((t) => rememberDay(t) === today) },
    { label: "מחר", list: remember.filter((t) => rememberDay(t) === tomorrow) },
    { label: "בהמשך", list: remember.filter((t) => (rememberDay(t) ?? "") > tomorrow) },
    { label: "בלי תאריך", list: remember.filter((t) => !rememberDay(t)) },
  ].filter((g) => g.list.length);
  if (groups.length === 0) return <AllClear text="אין כרגע מה לזכור." />;
  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden divide-y divide-line">
      {groups.map((g) => (
        <div key={g.label}>
          <h3 className="px-4 pt-3 text-xs font-semibold tracking-wide text-accent">{g.label}</h3>
          <ul className="divide-y divide-line">
            {g.list.map((t) => (
              <RememberRow key={t.id} t={t} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- personal

async function PersonalDay() {
  const { supabase } = await getSpace();
  const start = israelStartOfDay().toISOString();
  const [{ data: openRows }, { data: closedRows }, { data: acc }, assignees] = await Promise.all([
    supabase.from("tasks").select(TASK_COLS).eq("account_id", "personal").eq("status", "open").order("message_at", { ascending: false }).limit(300),
    supabase.from("tasks").select(TASK_COLS).eq("account_id", "personal").eq("status", "auto_done").neq("close_reason", "קראת את ההודעה בטלפון").gte("closed_at", start).order("closed_at", { ascending: false }).limit(50),
    supabase.from("accounts").select("me_jids").eq("id", "personal").maybeSingle(),
    getAssignees(supabase),
  ]);
  // Tasks from his own messages are his promises ("אשלח לך מחר").
  const meJids = new Set((acc?.me_jids ?? []) as string[]);
  const isPromise = (t: Task) => Boolean(t.sender_jid && meJids.has(t.sender_jid));
  // Postponed items stay out of sight until their day comes.
  const nowIso = new Date().toISOString();
  const isSnoozed = (t: { snoozed_until?: string | null }) => Boolean(t.snoozed_until && t.snoozed_until > nowIso);
  // Work from the personal number lives in the nonprofit space, not here.
  const allOpen = ((openRows ?? []) as unknown as Task[]).filter((t) => t.work !== true);
  const snoozed = allOpen.filter(isSnoozed).sort((a, b) => a.snoozed_until!.localeCompare(b.snoozed_until!));
  const open = allOpen.filter((t) => !isSnoozed(t));
  const missed = open.filter((t) => !isToRemember(t) && !t.ws_task_id);
  const moved = open.filter((t) => t.ws_task_id);
  const closedToday = ((closedRows ?? []) as unknown as Task[]).filter((t) => t.work !== true);

  const remember = rememberOf(open);
  const avatars = await loadAvatars(supabase, missed);
  const snoozedItems = snoozed.map((t) => ({
    table: "tasks" as const,
    id: t.id,
    who: t.chats?.is_group ? (t.chats?.name ?? "") : (t.sender_name ?? t.chats?.name ?? ""),
    summary: t.summary,
    until: t.snoozed_until!,
  }));

  return (
    <>
      <DayHeader missed={missed.length} />

      <Section
        title="חשוב"
        tone="important"
        hint="בקשות ושאלות אליך שלא הגבת עליהן, דברים שהבטחת ועוד לא נראה שעשית, ומה שהעלית לכאן מהסיכום. כשאתה עונה או שולח בוואטסאפ, הם יורדים מכאן לבד."
        count={missed.length}
      >
        {missed.length === 0 ? (
          <AllClear text="אין בקשות שמחכות לך." />
        ) : (
          <ul className="space-y-3">
            {missed.map((t) => (
              <MissedTaskCard key={t.id} t={t} promise={isPromise(t)} assignees={assignees} avatars={avatars} />
            ))}
          </ul>
        )}
        <MovedToTasks items={moved.map((t) => ({ id: t.id, who: t.sender_name ?? t.chats?.name ?? "", summary: t.summary, ws_status: t.ws_status }))} />
      </Section>

      <Section
        title="לזכור"
        tone="remember"
        hint="הודעות מעשיות מהקבוצות ותאריכים: מה להביא, לשלם, לחתום, מתי. ב&quot;ללמד את הבוט&quot; אפשר לסמן מה חשוב לך לזכור ומה לא, והבוט ילמד מזה."
        count={remember.length}
      >
        <RememberList remember={remember} />
        <SnoozedList items={snoozedItems} />
      </Section>

      <Section title="סיכום היום" tone="brief" hint="הדברים המשמעותיים של היום, גם מה שכבר ראית או טיפלת בו. משהו שצריך להמשיך איתו? &quot;↑ לחשוב&quot; או &quot;↑ לזכור&quot;.">
        <BriefBlock account="personal" personal />
      </Section>

      {closedToday.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted hover:text-foreground w-fit">
            הבוט הוריד היום {closedToday.length} בקשות כי הגבת עליהן (לבדיקה)
          </summary>
          <ul className="mt-3 rounded-2xl border border-line bg-card divide-y divide-line">
            {closedToday.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="min-w-0">
                  <b>{t.sender_name ?? t.chats?.name ?? ""}:</b> {t.summary}
                  {t.close_reason && <span className="text-muted"> · {t.close_reason}</span>}
                </span>
                <TaskStatusButton id={t.id} account={t.account_id} status="open" label="לא טיפלתי, להחזיר" kind="quiet" />
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}

// ---------------------------------------------------------------- business

async function BusinessDay() {
  const { supabase, allowed } = await getSpace();
  const start = israelStartOfDay().toISOString();
  // Work that reached Haim's personal number. Only users who may see the
  // personal account get it (RLS too), so the team never sees his private chats.
  const seesPersonal = allowed.includes("personal");
  const [{ data: openRows }, { data: closedRows }, { data: pref }, assignees, { data: rememberRows }, { data: personalRows }, { data: acc }] = await Promise.all([
    supabase.from("requests").select(REQUEST_COLS).eq("account_id", "business").in("status", ["open", "promised"]).order("message_at").limit(300),
    supabase
      .from("requests")
      .select(REQUEST_COLS)
      .eq("account_id", "business")
      .eq("closed_by", "bot")
      .gte("closed_at", start)
      .order("closed_at", { ascending: false })
      .limit(100),
    supabase.from("preferences").select("urgent_after_hours").eq("account_id", "business").maybeSingle(),
    getAssignees(supabase),
    // Business "remember": what the bot noted from the chats, and what the user raised from the brief.
    supabase.from("tasks").select(TASK_COLS).eq("account_id", "business").eq("status", "open").order("message_at", { ascending: false }).limit(100),
    seesPersonal
      ? supabase.from("tasks").select(TASK_COLS).eq("account_id", "personal").eq("status", "open").eq("work", true).order("message_at", { ascending: false }).limit(100)
      : Promise.resolve({ data: [] }),
    seesPersonal ? supabase.from("accounts").select("me_jids").eq("id", "personal").maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const nowIso = new Date().toISOString();
  const remember = rememberOf(((rememberRows ?? []) as unknown as Task[]).filter((t) => !(t.snoozed_until && t.snoozed_until > nowIso)));
  const meJids = new Set(((acc as { me_jids?: string[] } | null)?.me_jids ?? []) as string[]);
  const fromPersonal = ((personalRows ?? []) as unknown as Task[]).filter((t) => !(t.snoozed_until && t.snoozed_until > nowIso) && !t.ws_task_id);
  const personalMissed = fromPersonal.filter((t) => !isToRemember(t));
  const today = israelDay(new Date());
  const personalRemember = fromPersonal.filter((t) => isToRemember(t) && (!t.due_at || israelDay(t.due_at) >= today));
  const everything = (openRows ?? []) as unknown as Request[];
  const isSnoozed = (r: Request) => Boolean(r.snoozed_until && r.snoozed_until > nowIso);
  const all = everything.filter((r) => !isSnoozed(r));
  const snoozedItems = everything
    .filter(isSnoozed)
    .sort((a, b) => a.snoozed_until!.localeCompare(b.snoozed_until!))
    .map((r) => ({ table: "requests" as const, id: r.id, who: r.sender_name ?? r.chats?.name ?? "", summary: r.summary, until: r.snoozed_until! }));
  const open = all.filter((r) => !r.ws_task_id);
  const moved = all.filter((r) => r.ws_task_id);
  const closedToday = (closedRows ?? []) as unknown as Request[];
  const urgentAfter = pref?.urgent_after_hours ?? 4;
  const avatars = await loadAvatars(supabase, [...open, ...personalMissed]);

  return (
    <>
      <DayHeader missed={open.length + personalMissed.length} />

      <Section title="חשוב" tone="important" hint="פניות של מדריכים, מועמדים ולקוחות שאף אחד בצוות לא ענה עליהן, ומה שהעלית לכאן מהסיכום. כשעונים בוואטסאפ, הן יורדות מכאן לבד." count={open.length}>
        {open.length === 0 ? (
          <AllClear text="כולם קיבלו תשובה." />
        ) : (
          <ul className="space-y-3">
            {open.map((r) => (
              <MissedRequestCard key={r.id} r={r} urgentAfter={urgentAfter} assignees={assignees} avatars={avatars} />
            ))}
          </ul>
        )}
        <MovedToTasks items={moved.map((r) => ({ id: r.id, who: r.sender_name ?? r.chats?.name ?? "", summary: r.summary, ws_status: r.ws_status }))} />
        <SnoozedList items={snoozedItems} />
      </Section>

      {personalMissed.length + personalRemember.length > 0 && (
        <Section
          title="עבודה שהגיעה לפרטי"
          hint="ענייני העמותה מהווצאפ הפרטי שלך: שירן, קבוצת המדריכים, ומדריכים ולקוחות שכתבו לך לפרטי. רק אתה רואה את זה. משהו כאן פרטי? &quot;זה פרטי&quot;, והבוט ילמד."
          count={personalMissed.length + personalRemember.length}
        >
          {personalMissed.length > 0 && (
            <ul className="space-y-3">
              {personalMissed.map((t) => (
                <MissedTaskCard key={t.id} t={t} promise={Boolean(t.sender_jid && meJids.has(t.sender_jid))} assignees={assignees} fromPersonal avatars={avatars} />
              ))}
            </ul>
          )}
          {personalRemember.length > 0 && (
            <ul className="rounded-2xl border border-line bg-card overflow-hidden divide-y divide-line">
              {personalRemember.map((t) => (
                <RememberRow key={t.id} t={t} fromPersonal />
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section
        title="לזכור"
        tone="remember"
        hint="תאריכים, שינויים בלו&quot;ז, היעדרויות והחלטות מהשיחות, וגם מה שהעלית לכאן מהסיכום. ב&quot;ללמד את הבוט&quot; אפשר לסמן מה חשוב לך לזכור ומה לא."
        count={remember.length}
      >
        <RememberList remember={remember} />
      </Section>

      <Section title="סיכום היום" tone="brief" hint="גם דברים שכבר טופלו, רק מה שמשמעותי. משהו שצריך להמשיך איתו? &quot;↑ לחשוב&quot; או &quot;↑ לזכור&quot;.">
        <BriefBlock account="business" personal={false} />
      </Section>

      {closedToday.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted hover:text-foreground w-fit">
            הבוט סגר היום {closedToday.length} פניות כי ענו עליהן (לבדיקה)
          </summary>
          <ul className="mt-3 rounded-2xl border border-line bg-card divide-y divide-line">
            {closedToday.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span className="min-w-0">
                  <b>{r.sender_name ?? r.chats?.name ?? ""}:</b> {r.summary}
                  {r.close_reason && <span className="text-muted"> · {r.close_reason}</span>}
                </span>
                <RequestStatusButton id={r.id} status="open" label="לא טופל, להחזיר" kind="quiet" />
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
