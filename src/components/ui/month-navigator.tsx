"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function parseMonth(str: string): [number, number] {
  const [y, m] = str.split("-").map(Number);
  return [y, m - 1];
}

function shiftMonth(str: string, delta: number): string {
  const [y, m] = parseMonth(str);
  const d = new Date(y, m + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthName(str: string): string {
  return MONTHS_HEBREW[parseMonth(str)[1]];
}

interface MonthNavigatorProps {
  basePath: string;
  selectedMonthStr: string;
  currentMonthStr: string;
}

export function MonthNavigator({
  basePath,
  selectedMonthStr,
  currentMonthStr,
}: MonthNavigatorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Show the target month right away, before the server finishes rendering it
  const [shownMonth, setShownMonth] = useState(selectedMonthStr);

  useEffect(() => {
    setShownMonth(selectedMonthStr);
  }, [selectedMonthStr]);

  const go = (month: string) => {
    if (month === shownMonth) return;
    setShownMonth(month);
    startTransition(() => {
      router.push(`${basePath}?month=${month}`, { scroll: false });
    });
  };

  const prev = shiftMonth(shownMonth, -1);
  const next = shiftMonth(shownMonth, 1);
  const [year] = parseMonth(shownMonth);
  const isCurrent = shownMonth === currentMonthStr;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => go(prev)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-[#1C1917] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 active:scale-[0.98]"
        aria-label={`חודש קודם: ${monthName(prev)}`}
      >
        <ChevronRight size={20} className="text-orange-500" />
        <span>{monthName(prev)}</span>
      </button>

      <div
        className={cn(
          "flex min-w-[10rem] flex-col items-center justify-center rounded-lg border-2 px-4 py-1.5 transition-colors",
          isCurrent ? "border-orange-400 bg-orange-50" : "border-border bg-white"
        )}
      >
        <div className="flex items-center gap-2 text-lg font-bold text-[#1C1917]">
          {isPending && (
            <Loader2 size={16} className="animate-spin text-orange-500" />
          )}
          <span>
            {monthName(shownMonth)} {year}
          </span>
        </div>
        {isCurrent ? (
          <span className="text-xs font-medium text-orange-600">החודש הנוכחי</span>
        ) : (
          <button
            type="button"
            onClick={() => go(currentMonthStr)}
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-orange-600 hover:underline"
          >
            חזרה לחודש הנוכחי
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => go(next)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-[#1C1917] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 active:scale-[0.98]"
        aria-label={`חודש הבא: ${monthName(next)}`}
      >
        <span>{monthName(next)}</span>
        <ChevronLeft size={20} className="text-orange-500" />
      </button>
    </div>
  );
}
