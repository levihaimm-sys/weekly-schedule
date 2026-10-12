"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ScheduleGrid } from "./schedule-grid";
import { SandboxHandlers, SandboxItem } from "./sandbox";

const STORAGE_KEY = "sandbox-schedule-board";

// Sunday (Israel time) of the current week — the sandbox copy is tied to this, so it
// automatically resets to the real fixed schedule at the start of every week.
function currentWeekKey(): string {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

function save(items: SandboxItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ week: currentWeekKey(), items }));
  } catch {
    // Storage unavailable — the sandbox still works for this visit, it just won't persist.
  }
}

interface SandboxBoardProps {
  schedule: SandboxItem[];
  cities: string[];
  instructors: { id: string; full_name: string }[];
  locations: { id: string; name: string; city: string; street: string | null }[];
}

export function SandboxBoard({ schedule, cities, instructors, locations }: SandboxBoardProps) {
  const [items, setItems] = useState<SandboxItem[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : null;
      if (stored?.week === currentWeekKey() && Array.isArray(stored.items)) {
        setItems(stored.items);
        return;
      }
    } catch {
      // Corrupt/unavailable storage — fall through to a fresh copy.
    }
    setItems(schedule);
    save(schedule);
  }, [schedule]);

  function apply(next: (prev: SandboxItem[]) => SandboxItem[]) {
    setItems((prev) => {
      const updated = next(prev ?? []);
      save(updated);
      return updated;
    });
  }

  const handlers: SandboxHandlers = useMemo(
    () => ({
      update: (ids, patch) => apply((prev) => prev.map((it) => (ids.includes(it.id) ? { ...it, ...patch } : it))),
      remove: (ids) => apply((prev) => prev.filter((it) => !ids.includes(it.id))),
      add: (item) => apply((prev) => [...prev, { ...item, id: `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]),
    }),
    []
  );

  function resetNow() {
    if (!confirm("לאפס את הסנדבוקס ללוח הקבוע הנוכחי? כל השינויים שעשית כאן יימחקו.")) return;
    setItems(schedule);
    save(schedule);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetNow}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <RotateCcw size={14} />
          אפס ללוח הקבוע
        </button>
      </div>

      {items === null ? (
        <div className="py-12 text-center text-muted-foreground">טוען…</div>
      ) : (
        <ScheduleGrid
          schedule={items}
          cities={cities}
          instructors={instructors}
          locations={locations}
          currentFilters={{}}
          sandbox={handlers}
        />
      )}
    </div>
  );
}
