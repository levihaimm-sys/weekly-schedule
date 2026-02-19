"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "דשבורד", icon: ClipboardList },
  { href: "/schedule/weekly", label: "לוח שבועי", icon: CalendarClock },
  { href: "/schedule", label: "לוח קבוע", icon: CalendarDays },
  { href: "/instructors", label: "מדריכים", icon: Users },
  { href: "/lesson-plans", label: "ציוד", icon: Package },
  { href: "/lesson-plans/manage", label: "ניהול מערכי שיעור", icon: BookOpen },
  { href: "/reports", label: "דוחות", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/schedule"
                ? pathname === "/schedule"
                : item.href === "/lesson-plans"
                  ? pathname === "/lesson-plans" ||
                    pathname === "/lesson-plans/assignments" ||
                    pathname === "/lesson-plans/confirmations-review" ||
                    pathname === "/lesson-plans/equipment-report" ||
                    pathname === "/equipment-distribution"
                  : item.href === "/lesson-plans/manage"
                    ? pathname.startsWith("/lesson-plans/manage")
                    : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-[#1C1917] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
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
