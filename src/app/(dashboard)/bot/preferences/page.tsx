import { AppShell, PageBody } from "@/bot/components/AppShell";
import { btn } from "@/bot/components/Inbox";
import { formatWhen } from "@/bot/lib/format";
import { requireSpace } from "@/bot/lib/space";
import { deleteFeedback, savePreferences } from "@/bot/actions/preferences";

type Pref = { account_id: string; rules: string; learning_mode: boolean; updated_at: string; work_keywords: string[] };
type Feedback = {
  id: number;
  account_id: string;
  verdict: "good" | "bad";
  note: string | null;
  created_at: string;
  tasks: { summary: string; sender_name: string | null; chats: { name: string | null } | null } | null;
};

const EXAMPLE = `דוגמאות:
- בקבוצת ועד הבית מעניין אותי רק תשלומים ותקלות.
- כל מה שקשור לאמא (רופאים, תרופות, תורים) תמיד חשוב ודחוף.
- הזמנות לאירועים: רק תאריך ומקום, בלי "מי מגיע".
- הודעות של מיטל בקבוצת האחים תמיד להציג.`;

export default async function PreferencesPage() {
  const { supabase, space } = await requireSpace();
  const [{ data: pref }, { data: fb }] = await Promise.all([
    supabase.from("preferences").select("account_id, rules, learning_mode, updated_at, work_keywords").eq("account_id", space).maybeSingle(),
    supabase
      .from("task_feedback")
      .select("id, account_id, verdict, note, created_at, tasks(summary, sender_name, chats(name))")
      .eq("account_id", space)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  const p = pref as Pref | null;
  const feedback = (fb ?? []) as unknown as Feedback[];
  const field = "w-full rounded-xl border border-line bg-card px-3 py-2";

  return (
    <AppShell current="/bot/preferences">
      <PageBody
        title="מה מעניין אותי"
        subtitle="כאן מלמדים את הבוט מה חשוב לך. כל מה שכתוב כאן, וגם כל 👍 / 👎 שנתת, נשלח לבוט בכל בדיקה."
      >
        {p && (
          <form action={savePreferences} className="rounded-2xl border border-line bg-card p-5 space-y-4">
            <input type="hidden" name="account" value={p.account_id} />
            <label className="block space-y-1.5">
              <span className="font-semibold">מה חשוב לי ומה לא</span>
              <textarea name="rules" defaultValue={p.rules} rows={7} placeholder={EXAMPLE} className={`${field} text-sm leading-relaxed`} />
            </label>
            <label className="block text-sm space-y-1.5">
              <span>
                <b>מילים שמסמנות עבודה</b> (מופרדות בפסיק). צ&apos;אט או שולח שהשם שלו מכיל אחת מהן מסומנים &quot;עבודה&quot;.
              </span>
              <input name="work_keywords" defaultValue={(p.work_keywords ?? []).join(", ")} placeholder="למשל: טומשין, אפטר, קיטו" className={field} />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="learning_mode" defaultChecked={p.learning_mode} className="mt-1 accent-[var(--accent)]" />
              <span>
                <b>מצב למידה</b>: הבוט מדווח בנדיבות, גם על דברים שהוא לא בטוח בהם, כדי שתוכל לסמן מה כן ומה לא. כשהבוט כבר מכיר אותך, מכבים כדי לקבל
                רשימה נקייה יותר.
              </span>
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">עודכן {formatWhen(p.updated_at)}</span>
              <button className={`${btn.primary} px-5 py-2`}>שמירה</button>
            </div>
          </form>
        )}

        <section className="space-y-2">
          <h2 className="font-bold">המשוב שנתת ({feedback.length})</h2>
          {feedback.length === 0 ? (
            <p className="text-sm text-muted">עוד אין משוב. בכל משימה יש &quot;ללמד את הבוט&quot;, ו&quot;לא רלוונטי&quot; נספר גם הוא כמשוב.</p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
              {feedback.map((f) => (
                <li key={f.id} className="p-3 text-sm flex gap-3 justify-between">
                  <div className="min-w-0 space-y-0.5">
                    <p>
                      {f.verdict === "good" ? "👍" : "👎"} {f.tasks?.summary ?? "(משימה נמחקה)"}
                    </p>
                    <p className="text-xs text-muted">
                      {f.tasks?.chats?.name ? `${f.tasks.chats.name} · ` : ""}
                      {formatWhen(f.created_at)}
                    </p>
                    {f.note && <p className="text-foreground/80">&quot;{f.note}&quot;</p>}
                  </div>
                  <form action={deleteFeedback}>
                    <input type="hidden" name="id" value={f.id} />
                    <button className="text-xs text-muted hover:text-red-600" title="מחיקת המשוב">
                      מחיקה
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </PageBody>
    </AppShell>
  );
}
