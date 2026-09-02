"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { DAYS_HEBREW } from "@/lib/utils/constants";
import { dayLabel } from "@/lib/utils/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { RecurringScheduleWithDetails } from "@/types/database";

interface Props {
  schedule: RecurringScheduleWithDetails[];
}

const sortHe = (a: string, b: string) => a.localeCompare(b, "he");

export function WeeklyScheduleTable({ schedule }: Props) {
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
    Array.from(new Set(schedule.map((r) => r.framework).filter(Boolean))) as string[]
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
      if (frameworkFilter.length > 0 && !frameworkFilter.includes(r.framework ?? "")) return false;
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

      <div className="overflow-auto rounded-lg border border-border max-h-[calc(100vh-260px)]">
        <table className="w-full border-collapse text-sm" dir="rtl">
          <thead className="sticky top-0 z-10 bg-secondary text-[#1C1917]">
            <tr>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">יום</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">שעה</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">לקוח</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">עיר</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">כתובת / גן</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">מסגרת</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">קבוצה</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">מדריך</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">תחום</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">גננת/רכזת</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">איש קשר</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">משך / כמות</th>
              <th className="border border-secondary/70 px-3 py-2 text-right font-bold whitespace-nowrap">הערות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="border border-border px-3 py-2 whitespace-nowrap">{dayLabel(r.day_of_week)}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap" dir="ltr">
                  {r.start_time}
                </td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.client_name ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.location?.city ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">
                  {r.location?.name ?? r.address ?? "—"}
                </td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">
                  {r.framework ?? "—"}
                  {r.framework_name ? ` - ${r.framework_name}` : ""}
                </td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.group_name ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.instructor?.full_name ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.field ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.manager_name ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">{r.contact_name ?? "—"}</td>
                <td className="border border-border px-3 py-2 whitespace-nowrap">
                  {r.lesson_duration ? `${r.lesson_duration} דק'` : "—"}
                  {r.lessons_count ? ` · ${r.lessons_count} שיעורים` : ""}
                </td>
                <td className="border border-border px-3 py-2">{r.notes ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="border border-border px-3 py-6 text-center text-muted-foreground">
                  אין גנים תואמים לסינון
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
