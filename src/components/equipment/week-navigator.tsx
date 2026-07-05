"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentWeek: string; // YYYY-MM-DD (always Sunday)
}

export function WeekNavigator({ currentWeek }: Props) {
  const router = useRouter();

  const [y, mo, d] = currentWeek.split("-").map(Number);

  const toISO = (dt: Date) => {
    const yr = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const da = String(dt.getDate()).padStart(2, "0");
    return `${yr}-${m}-${da}`;
  };

  const fmt = (dt: Date) =>
    dt.toLocaleDateString("he-IL", { day: "numeric", month: "long" });

  const current = new Date(y, mo - 1, d);
  const prev = new Date(y, mo - 1, d - 7);
  const next = new Date(y, mo - 1, d + 7);
  const weekEnd = new Date(y, mo - 1, d + 6);

  return (
    <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
      {/* RTL: first child is on the right visually = previous week (backward) */}
      <button
        onClick={() => router.push(`?week=${toISO(prev)}`)}
        className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
      >
        שבוע קודם
        <ChevronRight size={16} />
      </button>

      <div className="text-center">
        <div className="font-semibold">
          {fmt(current)} – {fmt(weekEnd)}
        </div>
        <div className="text-xs text-muted-foreground">{y}</div>
      </div>

      {/* RTL: last child is on the left visually = next week (forward) */}
      <button
        onClick={() => router.push(`?week=${toISO(next)}`)}
        className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
      >
        <ChevronLeft size={16} />
        שבוע הבא
      </button>
    </div>
  );
}
