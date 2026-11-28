import Link from "next/link";
import { Icon } from "@/bot/components/Icon";
import { minutesAgo } from "@/bot/lib/format";
import { NAV, NAV_EXTRA, type NavItem } from "@/bot/lib/nav";
import { getSpace, type Space } from "@/bot/lib/space";

const TITLES: Record<Space, string> = { personal: "וואטסאפ פרטי", business: "וואטסאפ עסקי" };

// Each world's face: Haim's photo for personal, the nonprofit's logo for business.
function SpaceBadge({ space }: { space: Space }) {
  const logo = space === "business";
  return (
    <span className={`shrink-0 ${logo ? "h-10" : "size-10"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo ? "/bot/space/business-logo.png" : "/bot/space/personal.webp"}
        alt=""
        className={logo ? "h-full w-auto rounded-md bg-white" : "size-full object-cover rounded-full ring-1 ring-line"}
      />
    </span>
  );
}

// The frame of every bot page: a header saying which WhatsApp this is, the
// connection status, and that world's tabs. The world itself is picked from
// the weekly-schedule sidebar (/bot?space=...).
export async function AppShell({ current, children }: { current: string; children: React.ReactNode }) {
  const { supabase, space } = await getSpace();

  const [{ count: open }, { data: acc }] = space
    ? await Promise.all([
        space === "personal"
          ? supabase
              .from("tasks")
              .select("id, chats!inner(priority)", { count: "exact", head: true })
              .eq("account_id", "personal")
              .eq("status", "open")
              .in("type", ["action", "question_to_me"])
              .neq("chats.priority", "background")
              .is("ws_task_id", null)
          : supabase.from("requests").select("id", { count: "exact", head: true }).eq("account_id", "business").in("status", ["open", "promised"]).is("ws_task_id", null),
        supabase.from("accounts").select("connection_status, last_seen_at").eq("id", space).maybeSingle(),
      ])
    : [{ count: 0 }, { data: null }];
  const seen = minutesAgo(acc?.last_seen_at);
  const connected = acc?.connection_status === "connected" && seen !== null && seen < 3;

  const navLink = (item: NavItem) => {
    const on = item.href === current;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={on ? "page" : undefined}
        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 whitespace-nowrap border text-sm ${
          on ? "bg-card border-line shadow-[0_1px_2px_rgba(16,24,40,0.06)] font-semibold" : "border-transparent text-foreground/75 hover:bg-card/70"
        }`}
      >
        <Icon name={item.icon} className={`size-4 ${on ? "text-accent" : "text-muted"}`} />
        {item.label}
        {item.count && (open ?? 0) > 0 && (
          <span className="rounded-full bg-accent-soft text-accent px-1.5 text-xs font-semibold">{open}</span>
        )}
      </Link>
    );
  };

  return (
    <div data-space={space ?? undefined} className="wa -m-4 md:-m-6 min-h-[calc(100dvh-4rem)] bg-background">
      <div className="border-b border-line bg-sub px-4 py-3 md:px-8 space-y-3">
        <div className="flex items-center gap-3">
          {space && <SpaceBadge space={space} />}
          <h1 className="text-xl font-bold text-accent">{space ? TITLES[space] : "וואטסאפ"}</h1>
          <Link
            href="/bot/connection"
            className="ms-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-card"
            title={connected ? "מחובר" : "לא מחובר"}
          >
            <span className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="hidden sm:inline">{connected ? "מחובר" : "לא מחובר"}</span>
          </Link>
        </div>
        {space && (
          <nav className="flex gap-1 overflow-x-auto -mx-1 px-1">
            {[...NAV[space], ...NAV_EXTRA.filter((i) => i.href !== "/bot/connection")].map(navLink)}
          </nav>
        )}
      </div>

      {space && !connected && current !== "/bot/connection" && (
        <Link href="/bot/connection" className="block bg-red-50 text-red-800 border-b border-red-200 px-4 py-2 text-sm">
          ה{TITLES[space]} לא מחובר כרגע. למסך החיבור ←
        </Link>
      )}
      {space ? (
        children
      ) : (
        <p className="m-6 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4 text-sm">המשתמש הזה עדיין לא קיבל הרשאה לאף חשבון.</p>
      )}
    </div>
  );
}

// Standard page body for the simple pages (not the inbox).
export function PageBody({ title, subtitle, actions, children }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 md:px-8 py-5 md:py-8 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}
