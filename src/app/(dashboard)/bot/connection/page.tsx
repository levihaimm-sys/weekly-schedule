import QRCode from "qrcode";
import { AppShell, PageBody } from "@/bot/components/AppShell";
import { AutoRefresh } from "@/bot/components/AutoRefresh";
import { CostCard } from "@/bot/components/CostCard";
import { ACCOUNT_LABELS, formatWhen, minutesAgo } from "@/bot/lib/format";
import { requireSpace, SPACES } from "@/bot/lib/space";
import { requestConnect } from "@/bot/actions/connection";

type Account = {
  id: string;
  display_name: string;
  connection_status: "connected" | "connecting" | "disconnected" | "needs_qr" | "pairing";
  qr_code: string | null;
  last_connected_at: string | null;
  last_seen_at: string | null;
  last_error: string | null;
  classifier_error: string | null;
  classifier_ok_at: string | null;
};

const STATUS: Record<Account["connection_status"], { label: string; color: string }> = {
  connected: { label: "מחובר", color: "bg-emerald-500" },
  connecting: { label: "מתחבר...", color: "bg-amber-500" },
  pairing: { label: "מחכה לסריקת QR", color: "bg-amber-500" },
  needs_qr: { label: "לא מחובר, צריך לסרוק QR", color: "bg-red-500" },
  disconnected: { label: "מנותק", color: "bg-red-500" },
};

export default async function ConnectionPage() {
  const { supabase, space } = await requireSpace();
  const { data } = await supabase
    .from("accounts")
    .select("id, display_name, connection_status, qr_code, last_connected_at, last_seen_at, last_error, classifier_error, classifier_ok_at")
    .eq("id", space);
  const accounts = (data ?? []) as Account[];

  return (
    <AppShell current="/bot/connection">
    <PageBody title="חיבור לוואטסאפ" subtitle={`החשבון ה${SPACES[space].label}`}>
      <AutoRefresh seconds={3} />

      {accounts.map((a) => (
        <AccountCard key={a.id} account={a} />
      ))}

      <CostCard />

      <details className="text-sm text-muted">
        <summary className="cursor-pointer">איך סורקים?</summary>
        <ol className="list-decimal pr-5 mt-2 space-y-1">
          <li>פותחים וואטסאפ בטלפון של החשבון הנכון.</li>
          <li>הגדרות ← מכשירים מקושרים ← קישור מכשיר.</li>
          <li>מכוונים את המצלמה לקוד שמופיע כאן. הקוד מתחלף כל כמה שניות, זה תקין.</li>
        </ol>
        <p className="mt-2">
          הטלפון צריך להתחבר לאינטרנט לפחות פעם ב-14 יום, אחרת וואטסאפ מנתק את הבוט.
        </p>
      </details>
    </PageBody>
    </AppShell>
  );
}

async function AccountCard({ account: a }: { account: Account }) {
  const seen = minutesAgo(a.last_seen_at);
  const workerAlive = seen !== null && seen < 3;
  const status = STATUS[a.connection_status];
  const canRequest = workerAlive && (a.connection_status === "needs_qr" || a.connection_status === "disconnected");
  const qrSvg =
    workerAlive && a.connection_status === "pairing" && a.qr_code
      ? await QRCode.toString(a.qr_code, { type: "svg", margin: 1, width: 280 })
      : null;

  return (
    <section className="rounded-2xl border border-line bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{ACCOUNT_LABELS[a.id] ?? a.display_name}</h2>
        <span className="flex items-center gap-2 text-sm">
          <span className={`inline-block size-2.5 rounded-full ${workerAlive ? status.color : "bg-neutral-400"}`} />
          {workerAlive ? status.label : "הבוט לא רץ"}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted">
        <dt>התחבר לאחרונה</dt>
        <dd>{formatWhen(a.last_connected_at) || "אף פעם"}</dd>
        <dt>סימן חיים מהבוט</dt>
        <dd>{seen === null ? "אף פעם" : seen < 1 ? "עכשיו" : `לפני ${seen} דקות`}</dd>
        <dt>זיהוי משימות</dt>
        <dd className={a.classifier_error ? "text-amber-700 dark:text-amber-300" : ""}>
          {a.classifier_error ?? (a.classifier_ok_at ? `עובד (בדיקה אחרונה ${formatWhen(a.classifier_ok_at)})` : "עוד לא רץ")}
        </dd>
      </dl>

      {a.last_error && (
        <p className="rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200 p-3 text-sm">
          {a.last_error}
        </p>
      )}

      {qrSvg && (
        <div className="flex justify-center">
          <div
            className="rounded-xl bg-white p-2 w-[280px] max-w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        </div>
      )}

      {canRequest && (
        <form action={requestConnect}>
          <input type="hidden" name="account" value={a.id} />
          <button className="w-full rounded-xl bg-accent text-background hover:opacity-90 font-medium py-2.5">
            {a.connection_status === "needs_qr" ? "הצג קוד QR לחיבור" : "התחבר מחדש"}
          </button>
        </form>
      )}

      {!workerAlive && (
        <p className="text-sm text-neutral-500">
          הבוט (ה-Worker) לא שלח סימן חיים ב-3 הדקות האחרונות, לכן אין חיבור לוואטסאפ.
        </p>
      )}
    </section>
  );
}
