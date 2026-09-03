"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";
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

type SortKey = "day" | "time" | "framework" | "address" | "city" | "instructor" | "field";
type SortDir = "asc" | "desc";

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "day", label: "יום" },
  { key: "time", label: "שעה" },
  { key: "framework", label: "מסגרת" },
  { key: "address", label: "כתובת" },
  { key: "city", label: "עיר" },
  { key: "instructor", label: "מדריך" },
  { key: "field", label: "תחום" },
];

function sortValue(r: RecurringScheduleWithDetails, key: SortKey): string | number {
  switch (key) {
    case "day":
      return r.day_of_week;
    case "time":
      return r.start_time;
    case "framework":
      return frameworkLabel(r);
    case "address":
      return r.address ?? "";
    case "city":
      return r.location?.city ?? "";
    case "instructor":
      return r.instructor?.full_name ?? "";
    case "field":
      return r.field ?? "";
  }
}

export function WeeklyScheduleTable({ schedule, instructors }: Props) {
  const [editingItem, setEditingItem] = useState<RecurringScheduleWithDetails | null>(null);

  const [dayFilter, setDayFilter] = usePersistedState<string[]>("weekly-table-day", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("weekly-table-framework", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("weekly-table-client", []);
  const [cityFilter, setCityFilter] = usePersistedState<string[]>("weekly-table-city", []);
  const [instructorFilter, setInstructorFilter] = usePersistedState<string[]>("weekly-table-instructor", []);

  const [sortKey, setSortKey] = usePersistedState<SortKey>("weekly-table-sort-key", "day");
  const [sortDir, setSortDir] = usePersistedState<SortDir>("weekly-table-sort-dir", "asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

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
    const result = schedule.filter((r) => {
      if (dayFilter.length > 0 && !dayFilter.includes(String(r.day_of_week))) return false;
      if (frameworkFilter.length > 0 && !frameworkFilter.includes(frameworkLabel(r))) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(r.client_name ?? "")) return false;
      if (cityFilter.length > 0 && !cityFilter.includes(r.location?.city ?? "")) return false;
      if (instructorFilter.length > 0 && !instructorFilter.includes(r.instructor?.full_name ?? "")) return false;
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    result.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return sortHe(String(va), String(vb)) * dir;
    });

    return result;
  }, [schedule, dayFilter, frameworkFilter, clientFilter, cityFilter, instructorFilter, sortKey, sortDir]);

  return (
    <div className="space-y-4">
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
        <span className="text-sm text-muted-foreground">{filtered.length} שורות</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              {SORT_COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  אין גנים תואמים לסינון
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {dayLabel(r.day_of_week)}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    <span dir="ltr" className="block text-right">
                      {formatTime(r.start_time)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
                    <button onClick={() => setEditingItem(r)} className="hover:underline" title="ערוך גן">
                      {frameworkLabel(r)}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {r.address ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {r.location?.city ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {r.instructor?.full_name ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {r.field ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
