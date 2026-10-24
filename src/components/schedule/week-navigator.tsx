"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { getEffectiveWeekStart } from "@/lib/utils/date";

interface WeekNavigatorProps {
  weekStartStr: string;
  weekEndStr: string;
  basePath: string;
  // When set, the navigator remembers the last week viewed under this localStorage key and
  // jumps back to it on a fresh visit that didn't ask for a specific week (e.g. arriving via
  // the sidebar) — instead of always defaulting to the current week. Screens that share a key
  // (tiles + table) stay on the same week as you switch between them. Omit to keep the
  // navigator's old stateless behavior (used by the instructor and equipment screens).
  persistKey?: string;
  // Whether the URL that produced weekStartStr explicitly requested a week (vs. defaulting to
  // today because none was given) — only the latter triggers the restore-from-storage jump.
  hasExplicitWeek?: boolean;
}

export function WeekNavigator({
  weekStartStr,
  weekEndStr,
  basePath,
  persistKey,
  hasExplicitWeek,
}: WeekNavigatorProps) {
  const router = useRouter();
  const restoredRef = useRef(false);

  // Restore the last-viewed week once per mount, only when the page landed on the default
  // (no explicit ?week=) — so it doesn't fight an actual link/back-button navigation.
  useEffect(() => {
    if (!persistKey || hasExplicitWeek || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const saved = localStorage.getItem(persistKey);
      // A remembered week that's already over is stale — stay on the effective current week
      if (saved && saved !== weekStartStr && saved >= weekStartStr) {
        router.replace(`${basePath}?week=${saved}`);
      }
    } catch {
      // ignore — falls back to the current week
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep storage in sync with whatever week is actually showing, however it got there
  // (prev/next, "today", or the restore above).
  useEffect(() => {
    if (!persistKey) return;
    try {
      localStorage.setItem(persistKey, weekStartStr);
    } catch {
      // ignore — e.g. private browsing with storage disabled
    }
  }, [persistKey, weekStartStr]);

  function navigate(direction: "prev" | "next") {
    const current = new Date(weekStartStr);
    const target =
      direction === "prev" ? subDays(current, 7) : addDays(current, 7);
    const targetStr = format(target, "yyyy-MM-dd");
    router.push(`${basePath}?week=${targetStr}`);
  }

  function goToday() {
    router.push(basePath);
  }

  // Format for display: dd/MM-dd/MM
  const start = new Date(weekStartStr);
  const end = new Date(weekEndStr);
  const startDisplay = format(start, "d/M");
  const endDisplay = format(end, "d/M");

  // Check if this is the current week — the effective one, which moves to next week once
  // Thursday's work day is over
  const currentWeekStart = getEffectiveWeekStart();
  const isCurrentWeek =
    format(currentWeekStart, "yyyy-MM-dd") === weekStartStr;

  // Calculate relative week label (timezone-safe: compare formatted date strings)
  const currentWeekStartStr = format(currentWeekStart, "yyyy-MM-dd");
  const diffMs = new Date(weekStartStr).getTime() - new Date(currentWeekStartStr).getTime();
  const weekDiff = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  function getRelativeWeekLabel(diff: number): string {
    if (diff === 0) return "השבוע";
    if (diff === 1) return "שבוע הבא";
    if (diff === 2) return "עוד שבועיים";
    if (diff > 2) return `עוד ${diff} שבועות`;
    if (diff === -1) return "שבוע קודם";
    if (diff === -2) return "לפני שבועיים";
    return `לפני ${Math.abs(diff)} שבועות`;
  }
  const relativeLabel = getRelativeWeekLabel(weekDiff);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate("prev")}
        aria-label="השבוע הקודם"
        className="flex shrink-0 items-center justify-center rounded-lg border-2 border-border bg-background p-2.5 transition-colors hover:border-secondary hover:bg-muted"
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex min-w-[130px] flex-col items-center rounded-lg bg-secondary/10 px-3 py-1.5">
        <span className="text-lg font-bold text-[#1C1917] md:text-xl">
          {startDisplay} - {endDisplay}
        </span>
        <span className={`text-sm font-semibold ${isCurrentWeek ? "text-secondary" : "text-muted-foreground"}`}>
          {relativeLabel}
        </span>
      </div>

      <button
        onClick={() => navigate("next")}
        aria-label="השבוע הבא"
        className="flex shrink-0 items-center justify-center rounded-lg border-2 border-border bg-background p-2.5 transition-colors hover:border-secondary hover:bg-muted"
      >
        <ChevronLeft size={20} />
      </button>

      {!isCurrentWeek && (
        <button
          onClick={goToday}
          className="shrink-0 rounded-lg bg-secondary px-3 py-2.5 text-sm font-bold text-[#1C1917] transition-colors hover:bg-secondary/80"
        >
          היום
        </button>
      )}
    </div>
  );
}
