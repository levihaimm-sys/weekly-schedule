"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/today", label: "היום", icon: Home },
  { href: "/my-lesson-plan", label: "המערך השבועי", icon: BookOpen },
  { href: "/my-schedule", label: "לוז שבועי", icon: CalendarDays },
  { href: "/confirm-lessons", label: "דיווחים", icon: ClipboardCheck },
];

export function InstructorSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 start-3 z-50 rounded-lg border border-border bg-background p-2 shadow-sm"
        aria-label="פתח תפריט"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop (mobile only) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 start-0 z-50 flex h-dvh w-64 flex-col border-e border-border bg-background transition-transform duration-200",
          // Default: hidden (RTL: translate-x-full moves it to the right/off-screen)
          "translate-x-full",
          // When open: slide in (RTL: translate-x-0 to show)
          mobileOpen && "!translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <h1 className="text-lg font-bold text-[#1C1917]">חיים בתנועה</h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary/20 text-[#1C1917] font-semibold"
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
