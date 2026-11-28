"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  Users,
  FileText,
  BookOpen,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  LayoutGrid,
  Building2,
  ClipboardCheck,
  UserSearch,
  GitMerge,
  Table,
  Tent,
  Banknote,
  TrendingUp,
  FlaskConical,
  Receipt,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/lib/actions/auth";
import type { BotSpace } from "@/bot/lib/nav";

type NavItem = { href: string; label: string; icon: typeof ClipboardList };
type NavSection = { title: string | null; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [{ href: "/dashboard", label: "דשבורד", icon: ClipboardList }],
  },
  {
    title: "לוח זמנים",
    items: [
      { href: "/schedule/weekly", label: "לוח שבועי - אריחים", icon: CalendarClock },
      { href: "/schedule/weekly-table", label: "לוח שבועי - טבלה", icon: Table },
      { href: "/schedule", label: "לוח קבוע", icon: CalendarDays },
      { href: "/schedule/weekly-overview", label: "תצוגת פלאפון שבועית", icon: LayoutGrid },
    ],
  },
  {
    title: "אנשים",
    items: [
      { href: "/instructors", label: "מדריכים", icon: Users },
      { href: "/recruitment", label: "גיוס", icon: UserSearch },
      { href: "/clients", label: "לקוחות", icon: Building2 },
    ],
  },
  {
    title: "תפעול",
    items: [
      { href: "/lesson-plans", label: "ציוד", icon: Package },
      { href: "/lesson-plans/assignments", label: "הקצאות שבועיות", icon: BookOpen },
      { href: "/camps", label: "קייטנות", icon: Tent },
      { href: "/staffing", label: "שיבוץ שנה הבאה", icon: GitMerge },
    ],
  },
  {
    title: "מעקב ודיווח",
    items: [
      { href: "/confirmations", label: "מעקב אישורים", icon: ClipboardCheck },
      { href: "/reports", label: "דוחות", icon: FileText },
      { href: "/whatsapp", label: "תזכורות WhatsApp", icon: MessageCircle },
    ],
  },
];

const OPEN_KEY = "admin-sidebar-open";

function isItemActive(href: string, pathname: string): boolean {
  switch (href) {
    case "/bot":
      return pathname === "/bot" || pathname.startsWith("/bot/");
    case "/schedule":
      return pathname === "/schedule";
    case "/lesson-plans":
      return (
        pathname === "/lesson-plans" ||
        pathname === "/lesson-plans/inventory" ||
        pathname === "/lesson-plans/confirmations-review" ||
        pathname === "/lesson-plans/equipment-report" ||
        pathname === "/lesson-plans/weekly-equipment" ||
        pathname === "/equipment-distribution"
      );
    case "/lesson-plans/assignments":
    case "/schedule/weekly-overview":
    case "/schedule/weekly-table":
      return pathname.startsWith(href);
    case "/schedule/weekly":
      return (
        pathname.startsWith("/schedule/weekly") &&
        !pathname.startsWith("/schedule/weekly-overview") &&
        !pathname.startsWith("/schedule/weekly-table")
      );
    default:
      return pathname === href || pathname.startsWith(href + "/");
  }
}

export function AdminSidebar({
  isOwner = false,
  canViewPayroll = false,
  botSpace = null,
}: {
  isOwner?: boolean;
  canViewPayroll?: boolean;
  /** WhatsApp bot world this user is in, or null when they may not see the bot. */
  botSpace?: BotSpace | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections: NavSection[] = isOwner
    ? [
        ...NAV_SECTIONS,
        {
          title: "אישי",
          items: [
            { href: "/payroll", label: "שכר מדריכים", icon: Banknote },
            { href: "/invoices", label: "חשבוניות", icon: Receipt },
            { href: "/profit-loss", label: "רווח והפסד", icon: TrendingUp },
            { href: "/sandbox", label: "סנדבוקס", icon: FlaskConical },
          ],
        },
      ]
    : canViewPayroll
      ? [
          ...NAV_SECTIONS,
          {
            title: "אישי",
            items: [{ href: "/payroll", label: "שכר מדריכים", icon: Banknote }],
          },
        ]
      : NAV_SECTIONS;

  // WhatsApp bot (/bot): only for users with bot access, one link right under
  // the dashboard. Its own pages are tabs at the top of the bot screens.
  const allSections: NavSection[] = botSpace
    ? [
        {
          title: null,
          items: [
            ...navSections[0].items,
            {
              href: "/bot",
              label: botSpace === "business" ? "וואטסאפ · עמותה" : "וואטסאפ · פרטי",
              icon: MessageCircle,
            },
          ],
        },
        ...navSections.slice(1),
      ]
    : navSections;

  const activeSection = allSections.find((s) => s.title && s.items.some((i) => isItemActive(i.href, pathname)))?.title ?? null;

  // Which groups are open. A group the user never touched is open only when
  // it holds the current page. Remembered per browser.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem(OPEN_KEY);
      if (saved) setOpenMap(JSON.parse(saved));
    } catch {}
  }, []);
  // Moving to a page always opens its group.
  useEffect(() => {
    if (activeSection) setOpenMap((m) => (m[activeSection] ? m : { ...m, [activeSection]: true }));
  }, [activeSection]);

  const isOpen = (title: string) => openMap[title] ?? title === activeSection;
  const toggle = (title: string) => {
    setOpenMap((m) => {
      const next = { ...m, [title]: !isOpen(title) };
      try {
        localStorage.setItem(OPEN_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 start-3 z-50 rounded-lg border border-border bg-background p-2 shadow-sm md:hidden"
        aria-label="פתח תפריט"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 start-0 z-50 flex h-dvh w-64 flex-col border-e border-border bg-background transition-transform duration-200",
          // Desktop: always visible
          "max-md:translate-x-full md:translate-x-0",
          // Mobile: slide in when open (RTL: translate-x-0 to show)
          mobileOpen && "max-md:!translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Image
            src="/logo.png"
            alt="חיים בתנועה"
            width={140}
            height={48}
            className="h-auto w-auto max-h-10"
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {allSections.map((section) => {
            const open = section.title ? isOpen(section.title) : true;
            return (
              <div key={section.title ?? "root"} className="space-y-0.5">
                {section.title && (
                  <button
                    type="button"
                    onClick={() => toggle(section.title!)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-2 rounded-md border-s-4 border-primary bg-primary/15 px-3 py-1.5 text-start text-sm font-bold tracking-wide text-[#3F5C3F] hover:bg-primary/25"
                  >
                    <span className="flex-1">{section.title}</span>
                    {!open && section.title === activeSection && (
                      <span className="size-2 rounded-full bg-primary" aria-label="המסך הנוכחי בקבוצה הזו" />
                    )}
                    <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
                  </button>
                )}
                {open &&
                  section.items.map((item) => {
                    const isActive = isItemActive(item.href, pathname);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-secondary/30 text-[#1C1917] font-semibold"
                            : "rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut size={20} />
              התנתק
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
