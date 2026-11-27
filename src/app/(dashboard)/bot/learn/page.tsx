import { redirect } from "next/navigation";
import { AppShell, PageBody } from "@/bot/components/AppShell";
import { btn } from "@/bot/components/Inbox";
import { formatWhen } from "@/bot/lib/format";
import { requireSpace } from "@/bot/lib/space";
import { addKnowledgeNote, correctPerson, learnNow } from "@/bot/actions/learn";

// "Getting to know the business": the weekly profile the bot builds, the
// suggestions that grow out of it, its questions to the owner, and the map
// of people (instructors, client contacts, candidates).

type Opportunity = { kind: "automation" | "procedure" | "screen"; title: string; what: string; why: string; evidence: string; confidence: "low" | "medium" | "high" };
type Profile = {
  overview: string;
  how_we_work: string;
  clients: { name: string; type: string; city: string | null; contacts: string[]; status: string; notes: string }[];
  processes: { name: string; steps: string[]; who: string; frequency: string; pain: string | null }[];
  recurring: { what: string; frequency: string; example: string }[];
  bottlenecks: { what: string; evidence: string }[];
  open_questions: string[];
  opportunities: Opportunity[];
  period_summary: string;
};
type Person = {
  jid: string;
  name: string | null;
  role: string;
  organization: string | null;
  city: string | null;
  specialty: string | null;
  status: "active" | "inactive" | "unknown";
  in_roster: boolean;
  notes: string | null;
  source: "roster" | "bot" | "user";
};

const KIND: Record<Opportunity["kind"], { label: string; tone: string }> = {
  automation: { label: "אוטומציה", tone: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" },
  procedure: { label: "נוהל", tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
  screen: { label: "מסך באפליקציה", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
};
const CONF: Record<Opportunity["confidence"], string> = { low: "השערה ראשונית", medium: "סביר", high: "בטוח למדי" };
const ROLE: Record<string, string> = {
  instructor: "מדריך/ה",
  candidate: "מועמד/ת",
  client_contact: "איש קשר אצל לקוח",
  team: "צוות",
  supplier: "ספק",
  other: "אחר",
};
const STATUS: Record<Person["status"], string> = { active: "פעיל/ה", inactive: "לא פעיל/ה", unknown: "לא ידוע" };

export default async function LearnPage() {
  const { supabase, space } = await requireSpace();
  if (space !== "business") redirect("/bot");

  const [{ data: runs }, { data: peopleRows }, { data: notes }, { data: pref }] = await Promise.all([
    supabase.from("business_knowledge").select("id, period_start, period_end, profile, stats, generated_at").eq("account_id", "business").order("generated_at", { ascending: false }).limit(1),
    supabase.from("business_people").select("jid, name, role, organization, city, specialty, status, in_roster, notes, source").eq("account_id", "business").order("name").limit(3000),
    supabase.from("knowledge_notes").select("id, question, note, used_at, created_at").eq("account_id", "business").order("created_at", { ascending: false }).limit(30),
    supabase.from("preferences").select("learning_requested_at").eq("account_id", "business").maybeSingle(),
  ]);
  const run = runs?.[0];
  const profile = run?.profile as Profile | undefined;
  const stats = (run?.stats ?? {}) as Record<string, number>;
  const people = (peopleRows ?? []) as Person[];
  const pending = pref?.learning_requested_at && (!run || new Date(pref.learning_requested_at) > new Date(run.generated_at));
  const answered = new Set((notes ?? []).map((n) => n.question).filter(Boolean));

  const instructors = people.filter((p) => p.role === "instructor");
  const activeInstructors = instructors.filter((p) => p.status === "active");
  const clientContacts = people.filter((p) => p.role === "client_contact");
  const byOrg = new Map<string, Person[]>();
  for (const p of clientContacts) {
    const k = p.organization ?? "לקוח לא ידוע";
    byOrg.set(k, [...(byOrg.get(k) ?? []), p]);
  }
  const candidates = people.filter((p) => p.role === "candidate");
  const others = people.filter((p) => !["instructor", "client_contact", "candidate"].includes(p.role));

  return (
    <AppShell current="/bot/learn">
      <PageBody
        title="הכרת העסק"
        subtitle={
          run
            ? `עודכן ${formatWhen(run.generated_at)} · ${stats.weeks_of_data ?? "?"} שבועות של נתונים · ${stats.focus_messages ?? 0} הודעות עם שירן בתקופה האחרונה`
            : "הבוט לומד את העסק מתוך השיחות, ומעדכן פעם בשבוע במוצאי שבת."
        }
        actions={
          <form action={learnNow}>
            <button className={btn.plain} disabled={Boolean(pending)}>
              {pending ? "לומד… (עד 10 דקות)" : "ללמוד עכשיו"}
            </button>
          </form>
        }
      >
        {!profile && (
          <section className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted space-y-2 leading-relaxed">
            <p>עוד אין תמונה של העסק. בכל שבוע הבוט קורא את מה שקרה ומעדכן כאן פרופיל אחד שמצטבר:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>
                <b className="text-foreground">השיחה בינך לבין שירן</b> נקראת במלואה, כולל תמלול של הודעות קוליות. זה המקור הכי חשוב.
              </li>
              <li>הפניות, סיכומי היום והצ&apos;אטים העמוסים במספר העמותה.</li>
              <li>מה שעשית בדשבורד ומה ששאלת את הבוט.</li>
            </ul>
            <p>אחרי 3–4 שבועות יופיעו כאן הצעות מדורגות: אוטומציות, נהלים ומסכים חדשים.</p>
          </section>
        )}

        {profile && (
          <>
            {profile.period_summary && <p className="rounded-xl bg-accent-soft px-4 py-3 leading-relaxed">{profile.period_summary}</p>}

            <Block title="הצעות לייעול" hint={profile.opportunities.length ? "מדורגות, החשובה ראשונה" : "עוד מוקדם להצעות. הן יופיעו כשיצטבר מספיק."}>
              <ul className="space-y-3">
                {profile.opportunities.map((o, i) => (
                  <li key={i} className="rounded-xl border border-line p-4 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${KIND[o.kind]?.tone ?? ""}`}>{KIND[o.kind]?.label ?? o.kind}</span>
                      <b>{o.title}</b>
                      <span className="text-xs text-muted ms-auto">{CONF[o.confidence]}</span>
                    </div>
                    <p className="leading-relaxed">{o.what}</p>
                    <p className="text-sm">
                      <b>למה:</b> {o.why}
                    </p>
                    <p className="text-sm text-muted">
                      <b>על סמך:</b> {o.evidence}
                    </p>
                  </li>
                ))}
              </ul>
            </Block>

            {profile.open_questions.length > 0 && (
              <Block title="שאלות אליך" hint="כל תשובה מלמדת את הבוט יותר מכל שבוע של הודעות">
                <ul className="space-y-3">
                  {profile.open_questions.map((q, i) => (
                    <li key={i} className="space-y-1.5">
                      <p className="font-medium">{q}</p>
                      {answered.has(q) ? (
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">✓ ענית. ייכנס בעדכון הבא.</p>
                      ) : (
                        <form action={addKnowledgeNote} className="flex gap-2">
                          <input type="hidden" name="question" value={q} />
                          <input name="note" required placeholder="התשובה שלך…" className="flex-1 min-w-0 rounded-lg border border-line bg-card px-3 py-1.5 text-sm" />
                          <button className={btn.primary}>שמור</button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <Block title="העסק בקצרה">
              <p className="leading-relaxed whitespace-pre-line">{profile.overview}</p>
              {profile.how_we_work && (
                <>
                  <p className="font-semibold mt-3 mb-1">איך אתם עובדים</p>
                  <p className="leading-relaxed whitespace-pre-line">{profile.how_we_work}</p>
                </>
              )}
            </Block>

            {profile.processes.length > 0 && (
              <Block title="תהליכים שחוזרים">
                <ul className="space-y-3">
                  {profile.processes.map((p, i) => (
                    <li key={i}>
                      <p>
                        <b>{p.name}</b> <span className="text-sm text-muted">· {p.frequency} · {p.who}</span>
                      </p>
                      <ol className="list-decimal pr-5 text-sm space-y-0.5 mt-1">
                        {p.steps.map((s, j) => <li key={j}>{s}</li>)}
                      </ol>
                      {p.pain && <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">איפה זה כואב: {p.pain}</p>}
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {(profile.recurring.length > 0 || profile.bottlenecks.length > 0) && (
              <div className="grid md:grid-cols-2 gap-5">
                {profile.recurring.length > 0 && (
                  <Block title="שאלות ובקשות שחוזרות">
                    <ul className="space-y-2 text-sm">
                      {profile.recurring.map((r, i) => (
                        <li key={i}>
                          <b>{r.what}</b> <span className="text-muted">({r.frequency})</span>
                          <p className="text-muted">למשל: {r.example}</p>
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
                {profile.bottlenecks.length > 0 && (
                  <Block title="איפה דברים נתקעים">
                    <ul className="space-y-2 text-sm">
                      {profile.bottlenecks.map((b, i) => (
                        <li key={i}>
                          <b>{b.what}</b>
                          <p className="text-muted">{b.evidence}</p>
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
              </div>
            )}

            {profile.clients.length > 0 && (
              <Block title={`לקוחות (${profile.clients.length})`}>
                <ul className="divide-y divide-line text-sm">
                  {profile.clients.map((c, i) => (
                    <li key={i} className="py-2">
                      <p>
                        <b>{c.name}</b> <span className="text-muted">· {c.type}{c.city ? ` · ${c.city}` : ""} · {c.status}</span>
                      </p>
                      {c.contacts.length > 0 && <p className="text-muted">אנשי קשר: {c.contacts.join(", ")}</p>}
                      {c.notes && <p>{c.notes}</p>}
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </>
        )}

        <Block title="מי זה מי" hint={`${activeInstructors.length} מדריכים פעילים מתוך ${instructors.length} · ${clientContacts.length} אנשי קשר אצל ${byOrg.size} לקוחות · ${candidates.length} מועמדים`}>
          <PeopleGroup title={`מדריכים פעילים (${activeInstructors.length})`} people={activeInstructors} open />
          <PeopleGroup title={`מדריכים, סטטוס לא ידוע או לא פעילים (${instructors.length - activeInstructors.length})`} people={instructors.filter((p) => p.status !== "active")} />
          {[...byOrg].map(([org, list]) => (
            <PeopleGroup key={org} title={`${org} (${list.length})`} people={list} />
          ))}
          <PeopleGroup title={`מועמדים (${candidates.length})`} people={candidates} />
          <PeopleGroup title={`צוות ואחרים (${others.length})`} people={others} />
          <p className="text-xs text-muted mt-2">המדריכים הפעילים נלקחים מהקבוצה &quot;מדריכי עמותה פעילים&quot;. מה שתתקן כאן נשמר, והבוט לא ישנה אותו.</p>
        </Block>

        <Block title="תיקון או הערה" hint="משהו שהבוט הבין לא נכון, או משהו שחשוב שידע">
          <form action={addKnowledgeNote} className="space-y-2">
            <textarea name="note" required rows={3} placeholder='למשל: "רוית היא המנהלת הפדגוגית, לא מדריכה. היא אחראית על ההכשרות."' className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm" />
            <button className={btn.primary}>שמור</button>
          </form>
          {(notes ?? []).length > 0 && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-muted w-fit">מה כבר אמרת לבוט ({notes!.length})</summary>
              <ul className="mt-2 space-y-1.5">
                {notes!.map((n) => (
                  <li key={n.id}>
                    <span className="text-xs text-muted">{formatWhen(n.created_at)}{n.used_at ? " · נלמד" : " · ייכנס בעדכון הבא"}</span>
                    {n.question && <p className="text-muted">{n.question}</p>}
                    <p>{n.note}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </Block>
      </PageBody>
    </AppShell>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-line p-5">
      <div className="mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function PeopleGroup({ title, people, open = false }: { title: string; people: Person[]; open?: boolean }) {
  if (!people.length) return null;
  return (
    <details open={open} className="border-t border-line first:border-t-0 py-2">
      <summary className="cursor-pointer font-semibold w-fit">{title}</summary>
      <ul className="mt-2 divide-y divide-line text-sm">
        {people.map((p) => (
          <li key={p.jid} className="py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="min-w-40 flex-1">
              <b>{p.name ?? p.jid.split("@")[0]}</b>
              <span className="text-muted">
                {[p.city, p.specialty].filter(Boolean).length ? ` · ${[p.city, p.specialty].filter(Boolean).join(" · ")}` : ""}
                {p.in_roster ? " · בקבוצת הפעילים" : ""}
                {p.source === "user" ? " · תוקן על ידך" : ""}
              </span>
              {p.notes && <span className="block text-muted text-xs">{p.notes}</span>}
            </span>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted">תיקון</summary>
              <form action={correctPerson} className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                <input type="hidden" name="jid" value={p.jid} />
                <select name="role" defaultValue={p.role} className="rounded border border-line bg-card px-1.5 py-1">
                  {Object.entries(ROLE).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <select name="status" defaultValue={p.status} className="rounded border border-line bg-card px-1.5 py-1">
                  {Object.entries(STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <input name="organization" defaultValue={p.organization ?? ""} placeholder="לקוח / ארגון" className="w-32 rounded border border-line bg-card px-1.5 py-1" />
                <button className={btn.quiet}>שמור</button>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </details>
  );
}
