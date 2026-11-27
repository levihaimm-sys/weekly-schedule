import { createClient } from "@/bot/lib/db";

// Monthly budget from the spec: "up to a few tens of dollars a month".
const MONTHLY_TARGET_USD = Number(process.env.MONTHLY_TARGET_USD ?? 40);

// Claude bills in dollars; shown in shekels at an approximate rate (set USD_ILS to update).
const USD_ILS = Number(process.env.USD_ILS ?? 3.6);
const usd = (n: number) => {
  const ils = n * USD_ILS;
  return `₪${ils.toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export async function CostCard() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { data } = await supabase
    .from("api_usage")
    .select("cost_usd, input_tokens, output_tokens, created_at")
    .gte("created_at", monthStart.toISOString())
    .limit(100000);
  const rows = data ?? [];

  const month = rows.reduce((s, r) => s + Number(r.cost_usd), 0);
  const today = rows
    .filter((r) => new Date(r.created_at) >= dayStart)
    .reduce((s, r) => s + Number(r.cost_usd), 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysSoFar = Math.max(1, (now.getTime() - monthStart.getTime()) / 86_400_000);
  const projected = (month / daysSoFar) * daysInMonth;
  const over = projected > MONTHLY_TARGET_USD;

  return (
    <section className="rounded-2xl border border-line bg-card p-5 space-y-2">
      <h2 className="font-bold">עלות הבוט (Claude)</h2>
      <p className="text-xs text-muted">החשבון אצל Claude משותף, אז זו העלות של שני העולמות יחד. בשקלים, לפי שער של כ-{USD_ILS} ₪ לדולר.</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm text-muted">
        <dt>היום</dt>
        <dd>{usd(today)}</dd>
        <dt>החודש עד עכשיו</dt>
        <dd>{usd(month)} ({rows.length.toLocaleString("he-IL")} בדיקות)</dd>
        <dt>צפי לכל החודש</dt>
        <dd className={over ? "text-red-600 font-semibold" : ""}>{usd(projected)}</dd>
      </dl>
      {over && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 p-3 text-sm">
          הצפי עובר את היעד של {usd(MONTHLY_TARGET_USD)} לחודש. כדאי לסמן קבוצות רועשות כ&quot;רקע&quot; או &quot;להתעלם&quot; במסך הצ&apos;אטים.
        </p>
      )}
    </section>
  );
}
