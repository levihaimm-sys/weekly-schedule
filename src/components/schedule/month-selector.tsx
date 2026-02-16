"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

interface MonthSelectorProps {
  currentMonthStr: string;
  prevMonthStr: string;
  selectedMonth: string;
  monthLabel: string;
}

export function MonthSelector({
  currentMonthStr,
  prevMonthStr,
  selectedMonth,
  monthLabel,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar size={18} className="text-primary" />
      <div className="flex gap-1 rounded-lg border border-border p-1">
        <Link
          href={`/confirm-lessons?month=${prevMonthStr}`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedMonth === prevMonthStr
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          חודש קודם
        </Link>
        <Link
          href={`/confirm-lessons?month=${currentMonthStr}`}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            selectedMonth === currentMonthStr || !selectedMonth
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          חודש נוכחי
        </Link>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {monthLabel}
      </span>
    </div>
  );
}
