"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

const MONTHS_HEBREW = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface MonthNavigatorProps {
  year: number;
  month: number;
}

export function MonthNavigator({ year, month }: MonthNavigatorProps) {
  const router = useRouter();

  function navigate(direction: "prev" | "next") {
    let m = month + (direction === "prev" ? -1 : 1);
    let y = year;
    if (m < 1) { m = 12; y--; }
    else if (m > 12) { m = 1; y++; }
    router.push(`/my-schedule/monthly?year=${y}&month=${m}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("prev")}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <ChevronRight size={16} />
          <span className="text-xs">הקודם</span>
        </button>

        <span className="min-w-[130px] text-center text-base font-semibold">
          {MONTHS_HEBREW[month - 1]} {year}
        </span>

        <button
          onClick={() => navigate("next")}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <span className="text-xs">הבא</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      <button
        onClick={() => router.push("/my-schedule")}
        className="flex items-center gap-1.5 self-start rounded-lg bg-muted px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted-foreground/20"
      >
        <ArrowRight size={14} />
        חזרה לתצוגה שבועית
      </button>
    </div>
  );
}
