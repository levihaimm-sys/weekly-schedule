// Formatting helpers and the setup notice for the recruitment-campaigns pages.

const ils = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 2 });
const int = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });

export const fmtIls = (n: number) => ils.format(n);
export const fmtInt = (n: number) => int.format(n);
export const fmtPct = (n: number | null) => (n == null ? "—" : `${n.toFixed(2)}%`);

/** "2026-11-28" -> "28.11.26" */
export function fmtDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split("-");
  return `${day}.${m}.${y.slice(2)}`;
}

export function MetaSetupNotice() {
  return (
    <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">החיבור למטא עוד לא הוגדר.</p>
      <p>
        צריך להוסיף ב-Vercel (וגם ב-<code>.env.local</code>) את המשתנים <code>META_ACCESS_TOKEN</code> ו-
        <code>META_AD_ACCOUNT_ID</code> ולפרסם מחדש.
      </p>
    </div>
  );
}
