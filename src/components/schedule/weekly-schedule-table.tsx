"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { DAYS_HEBREW } from "@/lib/utils/constants";
import { dayLabel } from "@/lib/utils/staffing";
import { formatTime } from "@/lib/utils/date";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { RecurringScheduleWithDetails } from "@/types/database";

interface Props {
  schedule: RecurringScheduleWithDetails[];
  instructors: { id: string; full_name: string }[];
}

const sortHe = (a: string, b: string) => a.localeCompare(b, "he");

function frameworkLabel(r: RecurringScheduleWithDetails): string {
  return r.framework_name || r.group_name || "—";
}

export function WeeklyScheduleTable({ schedule, instructors }: Props) {
  const [editingItem, setEditingItem] = useState<RecurringScheduleWithDetails | null>(null);

  const [dayFilter, setDayFilter] = usePersistedState<string[]>("weekly-table-day", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("weekly-table-framework", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("weekly-table-client", []);
  const [cityFilter, setCityFilter] = usePersistedState<string[]>("weekly-table-city", []);
  const [instructorFilter, setInstructorFilter] = usePersistedState<string[]>("weekly-table-instructor", []);

  const hasActiveFilters =
    dayFilter.length > 0 ||
    frameworkFilter.length > 0 ||
    clientFilter.length > 0 ||
    cityFilter.length > 0 ||
    instructorFilter.length > 0;

  function clearFilters() {
    setDayFilter([]);
    setFrameworkFilter([]);
    setClientFilter([]);
    setCityFilter([]);
    setInstructorFilter([]);
  }

  const existingFrameworks = (
    Array.from(new Set(schedule.map((r) => frameworkLabel(r)).filter((f) => f !== "—"))) as string[]
  ).sort(sortHe);
  const existingClients = (
    Array.from(new Set(schedule.map((r) => r.client_name).filter(Boolean))) as string[]
  ).sort(sortHe);
  const existingCities = (
    Array.from(new Set(schedule.map((r) => r.location?.city).filter(Boolean))) as string[]
  ).sort(sortHe);
  const existingInstructors = (
    Array.from(new Set(schedule.map((r) => r.instructor?.full_name).filter(Boolean))) as string[]
  ).sort(sortHe);

  const filtered = useMemo(() => {
    return schedule.filter((r) => {
      if (dayFilter.length > 0 && !dayFilter.includes(String(r.day_of_week))) return false;
      if (frameworkFilter.length > 0 && !frameworkFilter.includes(frameworkLabel(r))) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(r.client_name ?? "")) return false;
      if (cityFilter.length > 0 && !cityFilter.includes(r.location?.city ?? "")) return false;
      if (instructorFilter.length > 0 && !instructorFilter.includes(r.instructor?.full_name ?? "")) return false;
      return true;
    });
  }, [schedule, dayFilter, frameworkFilter, clientFilter, cityFilter, instructorFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{filtered.length} גנים</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          options={DAYS_HEBREW.map((d, i) => ({ value: String(i), label: d }))}
          selected={dayFilter}
          onChange={setDayFilter}
          placeholder="כל הימים"
        />
        <MultiSelectFilter
          options={existingFrameworks.map((f) => ({ value: f, label: f }))}
          selected={frameworkFilter}
          onChange={setFrameworkFilter}
          placeholder="כל המסגרות"
        />
        <MultiSelectFilter
          options={existingClients.map((c) => ({ value: c, label: c }))}
          selected={clientFilter}
          onChange={setClientFilter}
          placeholder="כל הלקוחות"
        />
        <MultiSelectFilter
          options={existingCities.map((c) => ({ value: c, label: c }))}
          selected={cityFilter}
          onChange={setCityFilter}
          placeholder="כל הערים"
        />
        <MultiSelectFilter
          options={existingInstructors.map((i) => ({ value: i, label: i }))}
          selected={instructorFilter}
          onChange={setInstructorFilter}
          placeholder="כל המדריכים"
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <X size={14} />
            נקה סינון
          </button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div
            key={r.id}
            onClick={() => setEditingItem(r)}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="font-medium">{frameworkLabel(r)}</p>
              <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                {dayLabel(r.day_of_week)} · {formatTime(r.start_time)}
                {r.address ? ` · ${r.address}` : ""}
                {r.location?.city ? ` · ${r.location.city}` : ""}
                {" · "}
                {r.instructor?.full_name ?? "ללא מדריך"}
                {r.field ? ` · ${r.field}` : ""}
              </p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">אין גנים תואמים לסינון</p>}
      </div>

      {editingItem && (
        <LessonEditDialog
          item={editingItem}
          instructors={instructors}
          mode="recurring"
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
