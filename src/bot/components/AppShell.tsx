import Link from "next/link";
import { setSpace } from "@/bot/actions/space";
import { Icon } from "@/bot/components/Icon";
import { minutesAgo } from "@/bot/lib/format";
import { NAV, type NavItem } from "@/bot/lib/nav";
import { getSpace, SPACES, type Space } from "@/bot/lib/space";

// Each world's face: Haim's photo for personal, the nonprofit's full logo
// ("חיים בתנועה", it names the world by itself) for business.
function SpaceBadge({ space, small = false }: { space: Space; small?: boolean }) {
  const logo = space === "business";
  return (
    <span data-space={space} className={`shrink-0 ${logo ? "h-10" : small ? "size-7" : "size-9"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo ? "/bot/space/business-logo.png" : "/bot/space/personal.webp"}
        alt={SPACES[space].label}
        className={logo ? "h-full w-auto rounded-md bg-white" : "size-full object-cover rounded-full ring-1 ring-line"}
      />
    </span>
  );
}

// The frame of every page: a light sidebar (top bar on phones) with the world
// switcher, that world's menu, and the connection status.
export async function AppShell({ current, children }: { current: string; children: React.ReactNode }) {
  const { supabase, allowed, space } = await getSpace();

  const [{ count: personalOpen }, { count: businessOpen }, { data: accounts }] = await Promise.all([
    allowed.includes("personal")
      ? supabase
          .from("tasks")
          .select("id, chats!inner(priority)", { count: "exact", head: true })
          .eq("account_id", "personal")
          .eq("status", "open")
          .in("type", ["action", "question_to_me"])
          .neq("chats.priority", "background")
          .is("ws_task_id", null)
      : Promise.resolve({ count: 0 }),
    allowed.includes("business")
      ? supabase.from("requests").select("id", { count: "exact", head: true }).eq("account_id", "business").in("status", ["open", "promised"]).is("ws_task_id", null)
      : Promise.resolve({ count: 0 }),
    supabase.from("accounts").select("id, connection_status, last_seen_at"),
  ]);
  const openOf: Record<Space, number> = { personal: personalOpen ?? 0, business: businessOpen ?? 0 };
  const acc = (accounts ?? []).find((a) => a.id === space);
  const seen = minutesAgo(acc?.last_seen_at);
  const connected = acc?.connection_status === "connected" && seen !== null && seen < 3;

  const switcher = space && (
    <div className="relative">
      {allowed.length > 1 ? (
        // One press switches: both worlds sit side by side, the active one raised.
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-sub p-1">
          {allowed.map((s) => {
            const on = s === space;
            return (
              <form key={s} action={setSpace} className="relative min-w-0">
                <input type="hidden" name="space" value={s} />
                {/* The other world's waiting count: always the same corner of its button. */}
                {!on && openOf[s] > 0 && (
                  <span
                    data-space={s}
                    className="pointer-events-none absolute z-10 top-1 end-1 min-w-[17px] h-[17px] grid place-items-center rounded-full bg-accent text-background px-1 text-[10px] font-semibold leading-none"
                  >
                    {openOf[s]}
                  </span>
                )}
                <button
                  aria-pressed={on}
                  disabled={on}
                  title={openOf[s] ? `${openOf[s]} דברים חשובים מחכים` : undefined}
                  className={`w-full h-12 flex items-center gap-2 rounded-xl ps-2 pe-5 text-start transition ${s === "business" ? "justify-center" : ""} ${
                    on
                      ? "bg-accent-soft ring-2 ring-accent text-accent font-bold shadow-[0_2px_6px_rgba(16,24,40,0.12)] cursor-default"
                      : "text-foreground/60 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:bg-card/70 cursor-pointer"
                  }`}
                >
                  <SpaceBadge space={s} small />
                  {s !== "business" && <span className="truncate">{SPACES[s].label}</span>}
                </button>
              </form>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-3 py-2.5">
          <SpaceBadge space={space} />
          <b>{SPACES[space].label}</b>
        </div>
      )}
    </div>
  );

  // The menu itself is in weekly-schedule's sidebar. On phones the sidebar
  // hides behind a button, so the same menu also shows here as a strip.
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
        {item.count && space && openOf[space] > 0 && (
          <span className="rounded-full bg-accent-soft text-accent px-1.5 text-xs font-semibold">{openOf[space]}</span>
        )}
      </Link>
    );
  };

  return (
    <div data-space={space ?? undefined} className="wa -m-4 md:-m-6 min-h-[calc(100dvh-4rem)] bg-background">
      <div className="border-b border-line bg-sub px-4 py-3 md:px-8 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">{switcher}</div>
          <Link
            href="/bot/connection"
            className="ms-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-card"
            title={connected ? "מחובר" : "לא מחובר"}
          >
            <span className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
            {connected ? "מחובר לוואטסאפ" : "לא מחובר"}
          </Link>
        </div>
        {space && <nav className="md:hidden flex gap-1 overflow-x-auto -mx-1 px-1">{NAV[space].map(navLink)}</nav>}
      </div>

      {space && !connected && current !== "/bot/connection" && (
        <Link href="/bot/connection" className="block bg-red-50 text-red-800 border-b border-red-200 px-4 py-2 text-sm">
          החשבון ה{SPACES[space].label} לא מחובר לוואטסאפ כרגע. למסך החיבור ←
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
