import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMetaConfig, listCampaignSummaries, STATUS_LABELS, type CampaignSummary } from "@/lib/meta/ads";
import { fmtDate, fmtIls, fmtInt, MetaSetupNotice } from "./shared";

export const dynamic = "force-dynamic";

// Owner-only: recruitment campaigns from the Meta ad account (read-only).
export default async function AdCampaignsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_owner")
    .eq("id", session?.user?.id ?? "")
    .single();
  if (!profile?.is_owner) redirect("/dashboard");

  const cfg = getMetaConfig();

  let campaigns: CampaignSummary[] = [];
  let error: string | null = null;
  if (cfg) {
    try {
      campaigns = await listCampaignSummaries(cfg);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  const withSpend = campaigns.filter((c) => c.spend > 0 || c.status === "ACTIVE");
  const totalSpend = withSpend.reduce((s, c) => s + c.spend, 0);
  const totalLeads = withSpend.reduce((s, c) => s + c.leads, 0);
  const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">קמפייני גיוס</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          נתונים מחשבון המודעות במטא. ליד = שיחת וואטסאפ שהמודעה פתחה. מתעדכן כל 15 דקות.
        </p>
      </div>

      {!cfg && <MetaSetupNotice />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          לא הצלחתי לקרוא ממטא: {error}
        </div>
      )}

      {cfg && !error && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="קמפיינים פעילים" value={fmtInt(activeCount)} />
            <Stat label="הוצאה כוללת" value={fmtIls(totalSpend)} />
            <Stat label="לידים (שיחות)" value={fmtInt(totalLeads)} />
            <Stat label="עלות ממוצעת לליד" value={totalLeads ? fmtIls(totalSpend / totalLeads) : "—"} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="text-start">
                  <th className="px-3 py-2 text-start font-medium">קמפיין</th>
                  <th className="px-3 py-2 text-start font-medium">סטטוס</th>
                  <th className="px-3 py-2 text-start font-medium">תקציב יומי</th>
                  <th className="px-3 py-2 text-start font-medium">הוצאה</th>
                  <th className="px-3 py-2 text-start font-medium">לידים</th>
                  <th className="px-3 py-2 text-start font-medium">עלות לליד</th>
                  <th className="px-3 py-2 text-start font-medium">ימי ריצה</th>
                  <th className="px-3 py-2 text-start font-medium">תקופה</th>
                </tr>
              </thead>
              <tbody>
                {withSpend.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                      אין עדיין קמפיינים עם נתונים.
                    </td>
                  </tr>
                )}
                {withSpend.map((c) => {
                  const st = STATUS_LABELS[c.status] ?? { label: c.status, className: "bg-stone-100 text-stone-600" };
                  return (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2">
                        <Link href={`/ad-campaigns/${c.id}`} className="font-medium text-[#1C1917] hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}>{st.label}</span>
                      </td>
                      <td className="px-3 py-2">{c.dailyBudget ? fmtIls(c.dailyBudget) : "—"}</td>
                      <td className="px-3 py-2">{fmtIls(c.spend)}</td>
                      <td className="px-3 py-2">{fmtInt(c.leads)}</td>
                      <td className="px-3 py-2 font-semibold">{c.costPerLead != null ? fmtIls(c.costPerLead) : "—"}</td>
                      <td className="px-3 py-2">{fmtInt(c.activeDays)}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {c.firstDay ? `${fmtDate(c.firstDay)} – ${fmtDate(c.lastDay!)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold text-[#1C1917]">{value}</div>
    </div>
  );
}
