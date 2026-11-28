import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { adsManagerCampaignUrl, getCampaignDetail, getMetaConfig, STATUS_LABELS } from "@/lib/meta/ads";
import { fmtDate, fmtIls, fmtInt, fmtPct, MetaSetupNotice } from "../shared";

export const dynamic = "force-dynamic";

// Owner-only: one recruitment campaign - totals, per-ad numbers and daily rows.
export default async function AdCampaignPage({ params }: { params: Promise<{ campaignId: string }> }) {
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

  const { campaignId } = await params;
  const cfg = getMetaConfig();
  if (!cfg) {
    return (
      <div className="space-y-6">
        <BackLink />
        <MetaSetupNotice />
      </div>
    );
  }

  let detail: Awaited<ReturnType<typeof getCampaignDetail>> = null;
  let error: string | null = null;
  try {
    detail = await getCampaignDetail(cfg, campaignId);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          לא הצלחתי לקרוא ממטא: {error}
        </div>
      </div>
    );
  }
  if (!detail) notFound();

  const { summary: c, ads, days } = detail;
  const st = STATUS_LABELS[c.status] ?? { label: c.status, className: "bg-stone-100 text-stone-600" };
  const maxSpend = Math.max(1, ...days.map((d) => d.spend));

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl text-[#1C1917]">{c.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}>{st.label}</span>
            {c.firstDay && (
              <span>
                {fmtDate(c.firstDay)} – {fmtDate(c.lastDay!)} · {fmtInt(c.activeDays)} ימי ריצה
              </span>
            )}
          </div>
        </div>
        <a
          href={adsManagerCampaignUrl(cfg, c.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <ExternalLink size={16} />
          פתח במנהל המודעות
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <Stat label="הוצאה" value={fmtIls(c.spend)} />
        <Stat label="לידים (שיחות)" value={fmtInt(c.leads)} />
        <Stat label="עלות לליד" value={c.costPerLead != null ? fmtIls(c.costPerLead) : "—"} strong />
        <Stat label="תקציב יומי" value={c.dailyBudget ? fmtIls(c.dailyBudget) : "—"} />
        <Stat label="חשיפות" value={fmtInt(c.impressions)} />
        <Stat label="אנשים שנחשפו" value={fmtInt(c.reach)} />
        <Stat label="אחוז הקלקה" value={fmtPct(c.ctr)} />
      </div>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-[#1C1917]">לפי מודעה</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-start font-medium">מודעה</th>
                <th className="px-3 py-2 text-start font-medium">סטטוס</th>
                <th className="px-3 py-2 text-start font-medium">הוצאה</th>
                <th className="px-3 py-2 text-start font-medium">לידים</th>
                <th className="px-3 py-2 text-start font-medium">עלות לליד</th>
                <th className="px-3 py-2 text-start font-medium">חשיפות</th>
                <th className="px-3 py-2 text-start font-medium">אחוז הקלקה</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    אין מודעות בקמפיין.
                  </td>
                </tr>
              )}
              {ads.map((a) => {
                const ast = STATUS_LABELS[a.status] ?? { label: a.status, className: "bg-stone-100 text-stone-600" };
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="font-medium text-[#1C1917]">{a.name}</div>
                      {a.adSetName && <div className="text-xs text-muted-foreground">{a.adSetName}</div>}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ast.className}`}>{ast.label}</span>
                    </td>
                    <td className="px-3 py-2">{fmtIls(a.spend)}</td>
                    <td className="px-3 py-2">{fmtInt(a.leads)}</td>
                    <td className="px-3 py-2 font-semibold">{a.costPerLead != null ? fmtIls(a.costPerLead) : "—"}</td>
                    <td className="px-3 py-2">{fmtInt(a.impressions)}</td>
                    <td className="px-3 py-2">{fmtPct(a.ctr)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-[#1C1917]">לפי יום</h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-start font-medium">תאריך</th>
                <th className="px-3 py-2 text-start font-medium">הוצאה</th>
                <th className="px-3 py-2 text-start font-medium">לידים</th>
                <th className="px-3 py-2 text-start font-medium">עלות לליד</th>
              </tr>
            </thead>
            <tbody>
              {days.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                    הקמפיין עוד לא רץ.
                  </td>
                </tr>
              )}
              {[...days].reverse().map((d) => (
                <tr key={d.date} className="border-t border-border">
                  <td className="px-3 py-2">{fmtDate(d.date)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-20">{fmtIls(d.spend)}</span>
                      <span
                        className="h-2 rounded-full bg-primary/60"
                        style={{ width: `${Math.round((d.spend / maxSpend) * 120)}px` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">{fmtInt(d.leads)}</td>
                  <td className="px-3 py-2">{d.leads ? fmtIls(d.spend / d.leads) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/ad-campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowRight size={16} />
      כל הקמפיינים
    </Link>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold ${strong ? "text-primary" : "text-[#1C1917]"}`}>{value}</div>
    </div>
  );
}
