"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { format, addDays, subDays, startOfWeek, differenceInWeeks } from "date-fns";

interface WeekNavigatorProps {
  weekStartStr: string;
  weekEndStr: string;
  basePath: string;
}

export function WeekNavigator({
  weekStartStr,
  weekEndStr,
  basePath,
}: WeekNavigatorProps) {
  const router = useRouter();

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

  // Check if this is the current week
  const today = new Date();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 0 });
  const isCurrentWeek =
    format(currentWeekStart, "yyyy-MM-dd") === weekStartStr;

  // Calculate relative week label
  const weekDiff = differenceInWeeks(start, currentWeekStart);
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("prev")}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <ChevronRight size={16} />
          <span className="text-xs">הקודם</span>
        </button>

        <span className="min-w-[100px] text-center text-sm font-medium">
          {startDisplay}-{endDisplay}
        </span>

        <button
          onClick={() => navigate("next")}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <span className="text-xs">הבא</span>
          <ChevronLeft size={16} />
        </button>

        {!isCurrentWeek && (
          <button
            onClick={goToday}
            className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted-foreground/20"
          >
            היום
          </button>
        )}
      </div>

      <span className="text-center text-xs font-semibold text-foreground/70">
        {relativeLabel}
      </span>
    </div>
  );
}
