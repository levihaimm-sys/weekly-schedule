// Shared bits for the end-of-day screen and the other pages.

const AVATAR_COLORS = ["#C2410C", "#7C3AED", "#0369A1", "#15803D", "#BE123C", "#B45309", "#1D4ED8", "#0F766E", "#9333EA", "#4D7C0F"];

// The WhatsApp profile picture when the worker has it, else the first letter
// of the name on a color of its own.
export function Avatar({ name, size = "md", src }: { name: string; size?: "sm" | "md"; src?: string | null }) {
  const dim = size === "sm" ? "size-8" : "size-10";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- a data: URL, nothing for next/image to optimize
    return <img src={src} alt="" className={`${dim} rounded-full object-cover shrink-0 bg-sub`} aria-hidden />;
  }
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const letter = name.replace(/[^\p{L}\p{N}]/gu, "")[0] ?? "?";
  return (
    <span
      className={`grid place-items-center rounded-full text-white font-semibold shrink-0 ${dim} ${size === "sm" ? "text-xs" : "text-sm"}`}
      style={{ background: AVATAR_COLORS[h % AVATAR_COLORS.length] }}
      aria-hidden
    >
      {letter}
    </span>
  );
}

// A label on a card (role, "urgent", ...): solid enough to catch the eye.
export const tag = {
  base: "rounded-md px-1.5 py-0.5 text-xs font-semibold",
  accent: "bg-accent-soft text-accent",
  red: "bg-red-600 text-white",
  amber: "bg-amber-500 text-amber-950",
  indigo: "bg-indigo-600 text-white",
  green: "bg-emerald-600 text-white",
  gray: "bg-sub text-foreground border border-line",
};

// What the bot understood vs. what the person actually wrote: the bot's
// line is marked "בוט:", the person's words sit in a chat bubble under
// their first name.
export function SummaryAndQuote({ summary, quote, by }: { summary: string; quote: string | null; by: string }) {
  return (
    <div className="space-y-2 pt-0.5">
      <p className="text-[15px] font-medium leading-snug">
        <span className="me-1.5 text-xs font-semibold text-accent align-[1px]">בוט:</span>
        {summary}
      </p>
      {quote && (
        <div className="w-fit max-w-full rounded-2xl rounded-ss-sm bg-sub px-3 py-2 text-sm leading-relaxed">
          <span className="block text-xs font-semibold text-muted">{by}:</span>
          {quote}
        </div>
      )}
    </div>
  );
}

export function avatarKey(account: string, jid: string | null | undefined): string {
  return `${account}|${jid ?? ""}`;
}

// "טל שרעבי מועמד גבעתיים" -> "טל": enough to say whose words these are.
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export const btn = {
  primary: "rounded-lg px-3 py-1.5 text-sm font-medium bg-accent text-background hover:opacity-90",
  plain: "rounded-lg px-3 py-1.5 text-sm font-medium border border-line bg-card hover:bg-sub",
  quiet: "rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-sub hover:text-foreground",
};

// A titled block on the end-of-day page.
// Each level of the day page gets its own color, so the eye finds it fast.
const SECTION_TONES = {
  accent: { text: "text-accent", bar: "bg-accent", badge: "bg-accent-soft text-accent" },
  important: {
    text: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  },
  remember: {
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  brief: {
    text: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
} as const;

export function Section({
  title,
  hint,
  count,
  actions,
  tone,
  children,
}: {
  title: string;
  hint?: string;
  count?: number;
  actions?: React.ReactNode;
  tone?: keyof typeof SECTION_TONES;
  children: React.ReactNode;
}) {
  const t = tone ? SECTION_TONES[tone] : null;
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className={t ? `flex items-center gap-2 text-xl font-bold ${t.text}` : "text-lg font-bold"}>
            {t && <span aria-hidden className={`h-6 w-1.5 rounded-full ${t.bar}`} />}
            {title}
            {count !== undefined && count > 0 && (
              <span className={`${t ? "" : "ms-2 "}rounded-full ${t ? t.badge : "bg-accent-soft text-accent"} px-2 text-sm align-middle tabular-nums`}>{count}</span>
            )}
          </h2>
          {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
