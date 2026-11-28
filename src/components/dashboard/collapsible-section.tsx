"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TONES = {
  red: { border: "border-red-200", header: "bg-red-50/60", icon: "bg-red-100 text-red-600", badge: "bg-red-100 text-red-700" },
  orange: { border: "border-orange-200", header: "bg-orange-50/60", icon: "bg-orange-100 text-orange-600", badge: "bg-orange-100 text-orange-700" },
  blue: { border: "border-blue-200", header: "bg-blue-50/60", icon: "bg-blue-100 text-blue-600", badge: "bg-blue-100 text-blue-700" },
  stone: { border: "border-border", header: "bg-stone-50", icon: "bg-stone-200 text-stone-700", badge: "bg-stone-200 text-stone-700" },
} as const;

/** Dashboard card with a clickable header that collapses/expands its body. Open state is remembered per browser. */
export function CollapsibleSection({
  id,
  title,
  subtitle,
  icon,
  count,
  tone = "stone",
  actions,
  defaultOpen = true,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  count?: number;
  tone?: keyof typeof TONES;
  actions?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const storageKey = `dashboard-section:${id}`;
  const [open, setOpen] = useState(defaultOpen);
  const t = TONES[tone];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) setOpen(saved === "1");
    } catch {}
  }, [storageKey]);

  function toggle() {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {}
  }

  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-background shadow-sm", t.border)}>
      <div className={cn("flex flex-wrap items-center gap-3 px-4 py-3", t.header, open && cn("border-b", t.border))}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-right"
        >
          {icon && <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", t.icon)}>{icon}</span>}
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#1C1917]">{title}</span>
              {count !== undefined && (
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", t.badge)}>{count}</span>
              )}
            </span>
            {subtitle && <span className="block text-xs text-muted-foreground">{subtitle}</span>}
          </span>
          <ChevronDown
            size={20}
            className={cn("ms-auto shrink-0 text-muted-foreground transition-transform", !open && "rotate-90")}
          />
        </button>
        {actions && open && <div className="shrink-0">{actions}</div>}
      </div>
      {open && <div>{children}</div>}
    </section>
  );
}
