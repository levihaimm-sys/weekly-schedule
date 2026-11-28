// Read-only access to the Meta (Facebook/Instagram) ad account, for the owner's
// recruitment-campaigns page. Server-side only: the token never reaches the browser.
// Nothing here creates, changes or spends anything in Meta.
//
// Env (Vercel + .env.local):
//   META_ACCESS_TOKEN   - system-user token with ads_read on the ad account
//   META_AD_ACCOUNT_ID  - e.g. act_1527220515209944
//   META_GRAPH_VERSION  - optional, defaults to v23.0

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v23.0";
const REVALIDATE_SECONDS = 900; // numbers are refreshed at most every 15 minutes

// A WhatsApp/Messenger conversation that the ad started = one "lead" for recruitment.
export const LEAD_ACTION = "onsite_conversion.messaging_conversation_started_7d";

export type MetaConfig = { token: string; accountId: string };

export function getMetaConfig(): MetaConfig | null {
  const token = process.env.META_ACCESS_TOKEN;
  const raw = process.env.META_AD_ACCOUNT_ID;
  if (!token || !raw) return null;
  const accountId = raw.startsWith("act_") ? raw : `act_${raw}`;
  return { token, accountId };
}

type GraphPage<T> = { data: T[]; paging?: { next?: string } };

async function graphGet<T>(cfg: MetaConfig, path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return graphFetch<T>(cfg, url.toString());
}

async function graphFetch<T>(cfg: MetaConfig, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  const body = await res.json();
  if (!res.ok || body?.error) {
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Meta: ${msg}`);
  }
  return body as T;
}

async function graphGetAll<T>(cfg: MetaConfig, path: string, params: Record<string, string>): Promise<T[]> {
  const out: T[] = [];
  let page = await graphGet<GraphPage<T>>(cfg, path, { limit: "500", ...params });
  out.push(...page.data);
  // Follow paging; a safety cap keeps a runaway loop from hanging the page.
  for (let i = 0; page.paging?.next && i < 20; i++) {
    page = await graphFetch<GraphPage<T>>(cfg, page.paging.next);
    out.push(...page.data);
  }
  return out;
}

// ---------- shapes ----------

type ActionRow = { action_type: string; value: string };

type RawInsight = {
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  actions?: ActionRow[];
  date_start: string;
  date_stop: string;
};

export type Metrics = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  /** spend / leads, null when there are no leads */
  costPerLead: number | null;
  /** clicks / impressions in %, null without impressions */
  ctr: number | null;
};

export type CampaignSummary = Metrics & {
  id: string;
  name: string;
  status: string; // effective_status
  objective: string;
  createdTime: string;
  dailyBudget: number | null; // ILS, sum of ad-set daily budgets
  firstDay: string | null; // first day with spend/impressions
  lastDay: string | null;
  activeDays: number;
};

export type AdRow = Metrics & { id: string; name: string; adSetName: string; status: string };
export type DayRow = { date: string; spend: number; leads: number; impressions: number; clicks: number };

function num(v: string | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function leadsOf(actions?: ActionRow[]): number {
  return num(actions?.find((a) => a.action_type === LEAD_ACTION)?.value);
}

function toMetrics(r?: RawInsight): Metrics {
  const spend = num(r?.spend);
  const impressions = num(r?.impressions);
  const clicks = num(r?.clicks);
  const leads = leadsOf(r?.actions);
  return {
    spend,
    impressions,
    reach: num(r?.reach),
    clicks,
    leads,
    costPerLead: leads > 0 ? spend / leads : null,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : null,
  };
}

const INSIGHT_FIELDS = "spend,impressions,reach,clicks,actions";

// ---------- queries ----------

type RawCampaign = {
  id: string;
  name: string;
  effective_status: string;
  objective: string;
  created_time: string;
};
type RawAdSet = { campaign_id: string; daily_budget?: string; effective_status: string };

/** Every campaign in the ad account, with lifetime numbers and run days. */
export async function listCampaignSummaries(cfg: MetaConfig): Promise<CampaignSummary[]> {
  const [campaigns, adSets, totals, daily] = await Promise.all([
    graphGetAll<RawCampaign>(cfg, `${cfg.accountId}/campaigns`, {
      fields: "id,name,effective_status,objective,created_time",
    }),
    graphGetAll<RawAdSet>(cfg, `${cfg.accountId}/adsets`, {
      fields: "campaign_id,daily_budget,effective_status",
    }),
    graphGetAll<RawInsight>(cfg, `${cfg.accountId}/insights`, {
      level: "campaign",
      date_preset: "maximum",
      fields: `campaign_id,${INSIGHT_FIELDS}`,
    }),
    graphGetAll<RawInsight>(cfg, `${cfg.accountId}/insights`, {
      level: "campaign",
      date_preset: "maximum",
      time_increment: "1",
      fields: "campaign_id,spend,impressions",
    }),
  ]);

  const totalById = new Map(totals.map((t) => [t.campaign_id!, t]));

  const budgetById = new Map<string, number>();
  for (const s of adSets) {
    if (!s.daily_budget || s.effective_status === "DELETED" || s.effective_status === "ARCHIVED") continue;
    budgetById.set(s.campaign_id, (budgetById.get(s.campaign_id) ?? 0) + num(s.daily_budget) / 100);
  }

  const daysById = new Map<string, string[]>();
  for (const d of daily) {
    if (num(d.spend) <= 0 && num(d.impressions) <= 0) continue;
    const list = daysById.get(d.campaign_id!) ?? [];
    list.push(d.date_start);
    daysById.set(d.campaign_id!, list);
  }

  return campaigns
    .map((c) => {
      const days = (daysById.get(c.id) ?? []).sort();
      return {
        id: c.id,
        name: c.name.replace(/‏/g, "").trim(),
        status: c.effective_status,
        objective: c.objective,
        createdTime: c.created_time,
        dailyBudget: budgetById.get(c.id) ?? null,
        firstDay: days[0] ?? null,
        lastDay: days[days.length - 1] ?? null,
        activeDays: days.length,
        ...toMetrics(totalById.get(c.id)),
      };
    })
    .sort((a, b) => b.createdTime.localeCompare(a.createdTime));
}

/** One campaign: its summary, per-ad numbers and spend/leads per day. */
export async function getCampaignDetail(
  cfg: MetaConfig,
  campaignId: string
): Promise<{ summary: CampaignSummary; ads: AdRow[]; days: DayRow[] } | null> {
  if (!/^\d+$/.test(campaignId)) return null;

  const [campaign, adSets, total, adInsights, ads, daily] = await Promise.all([
    graphGet<RawCampaign>(cfg, campaignId, { fields: "id,name,effective_status,objective,created_time" }),
    graphGetAll<RawAdSet>(cfg, `${campaignId}/adsets`, { fields: "campaign_id,daily_budget,effective_status" }),
    graphGetAll<RawInsight>(cfg, `${campaignId}/insights`, { date_preset: "maximum", fields: INSIGHT_FIELDS }),
    graphGetAll<RawInsight>(cfg, `${campaignId}/insights`, {
      level: "ad",
      date_preset: "maximum",
      fields: `ad_id,ad_name,adset_name,${INSIGHT_FIELDS}`,
    }),
    graphGetAll<{ id: string; name: string; effective_status: string; adset?: { name: string } }>(
      cfg,
      `${campaignId}/ads`,
      { fields: "id,name,effective_status,adset{name}" }
    ),
    graphGetAll<RawInsight>(cfg, `${campaignId}/insights`, {
      date_preset: "maximum",
      time_increment: "1",
      fields: "spend,impressions,clicks,actions",
    }),
  ]);

  const days: DayRow[] = daily
    .map((d) => ({
      date: d.date_start,
      spend: num(d.spend),
      leads: leadsOf(d.actions),
      impressions: num(d.impressions),
      clicks: num(d.clicks),
    }))
    .filter((d) => d.spend > 0 || d.impressions > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const budget = adSets
    .filter((s) => s.daily_budget && s.effective_status !== "DELETED" && s.effective_status !== "ARCHIVED")
    .reduce((sum, s) => sum + num(s.daily_budget) / 100, 0);

  const summary: CampaignSummary = {
    id: campaign.id,
    name: campaign.name.replace(/‏/g, "").trim(),
    status: campaign.effective_status,
    objective: campaign.objective,
    createdTime: campaign.created_time,
    dailyBudget: budget > 0 ? budget : null,
    firstDay: days[0]?.date ?? null,
    lastDay: days[days.length - 1]?.date ?? null,
    activeDays: days.length,
    ...toMetrics(total[0]),
  };

  // Ads with numbers, plus ads that have not delivered yet.
  const insightByAd = new Map(adInsights.map((r) => [r.ad_id!, r]));
  const adRows: AdRow[] = ads
    .map((a) => {
      const r = insightByAd.get(a.id);
      return {
        id: a.id,
        name: a.name.replace(/‏/g, "").trim(),
        adSetName: (a.adset?.name ?? r?.adset_name ?? "").replace(/‏/g, "").trim(),
        status: a.effective_status,
        ...toMetrics(r),
      };
    })
    .sort((a, b) => b.spend - a.spend);

  return { summary, ads: adRows, days };
}

// ---------- labels ----------

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "פעיל", className: "bg-emerald-100 text-emerald-800" },
  PAUSED: { label: "מושהה", className: "bg-stone-200 text-stone-700" },
  CAMPAIGN_PAUSED: { label: "קמפיין מושהה", className: "bg-stone-200 text-stone-700" },
  ADSET_PAUSED: { label: "סדרה מושהית", className: "bg-stone-200 text-stone-700" },
  PENDING_REVIEW: { label: "בבדיקה", className: "bg-amber-100 text-amber-800" },
  IN_PROCESS: { label: "בעיבוד", className: "bg-amber-100 text-amber-800" },
  WITH_ISSUES: { label: "יש בעיה", className: "bg-red-100 text-red-700" },
  DISAPPROVED: { label: "נדחה", className: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "בארכיון", className: "bg-stone-100 text-stone-500" },
  DELETED: { label: "נמחק", className: "bg-stone-100 text-stone-500" },
};

export function adsManagerCampaignUrl(cfg: MetaConfig, campaignId: string): string {
  const act = cfg.accountId.replace(/^act_/, "");
  return `https://adsmanager.facebook.com/adsmanager/manage/adsets?act=${act}&selected_campaign_ids=${campaignId}`;
}
