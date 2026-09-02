"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { DAYS_HEBREW, LESSON_STATUS } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/date";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";

interface PortalLesson {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  framework: string | null;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string; street: string | null } | null;
}

interface Props {
  lessons: PortalLesson[];
  token: string;
}

const sortHe = (a: string, b: string) => a.localeCompare(b, "he");

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
  scheduled: "bg-blue-50 text-blue-700",
};

export function PortalScheduleTable({ lessons, token }: Props) {
  const [dayFilter, setDayFilter] = usePersistedState<string[]>(`portal-${token}-day`, []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>(`portal-${token}-framework`, []);
  const [cityFilter, setCityFilter] = usePersistedState<string[]>(`portal-${token}-city`, []);
  const [instructorFilter, setInstructorFilter] = usePersistedState<string[]>(`portal-${token}-instructor`, []);
  const [timeFilter, setTimeFilter] = usePersistedState<string[]>(`portal-${token}-time`, []);

  const hasActiveFilters =
    dayFilter.length > 0 ||
    frameworkFilter.length > 0 ||
    cityFilter.length > 0 ||
    instructorFilter.length > 0 ||
    timeFilter.length > 0;

  function clearFilters() {
    setDayFilter([]);
    setFrameworkFilter([]);
    setCityFilter([]);
    setInstructorFilter([]);
    setTimeFilter([]);
  }

  const withDay = useMemo(
    () => lessons.map((l) => ({ ...l, dayOfWeek: new Date(l.lesson_date).getDay() })),
    [lessons]
  );

  const existingFrameworks = (
    Array.from(new Set(withDay.map((l) => l.framework).filter(Boolean))) as string[]
  ).sort(sortHe);
  const existingCities = (
    Array.from(new Set(withDay.map((l) => l.location?.city).filter(Boolean))) as string[]
  ).sort(sortHe);
  const existingInstructors = (
    Array.from(new Set(withDay.map((l) => l.instructor?.full_name).filter(Boolean))) as string[]
  ).sort(sortHe);
  const existingTimes = (
    Array.from(new Set(withDay.map((l) => formatTime(l.start_time)))) as string[]
  ).sort();

  const filtered = useMemo(() => {
    return withDay.filter((l) => {
      if (dayFilter.length > 0 && !dayFilter.includes(String(l.dayOfWeek))) return false;
      if (frameworkFilter.length > 0 && !frameworkFilter.includes(l.framework ?? "")) return false;
      if (cityFilter.length > 0 && !cityFilter.includes(l.location?.city ?? "")) return false;
      if (instructorFilter.length > 0 && !instructorFilter.includes(l.instructor?.full_name ?? "")) return false;
      if (timeFilter.length > 0 && !timeFilter.includes(formatTime(l.start_time))) return false;
      return true;
    });
  }, [withDay, dayFilter, frameworkFilter, cityFilter, instructorFilter, timeFilter]);

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
        <MultiSelectFilter
          options={existingTimes.map((t) => ({ value: t, label: t }))}
          selected={timeFilter}
          onChange={setTimeFilter}
          placeholder="כל השעות"
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
        <span className="text-sm text-muted-foreground">{filtered.length} שיעורים</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">יום</th>
              <th className="px-3 py-2.5 whitespace-nowrap">תאריך</th>
              <th className="px-3 py-2.5 whitespace-nowrap">שעה</th>
              <th className="px-3 py-2.5 whitespace-nowrap">מסגרת</th>
              <th className="px-3 py-2.5 whitespace-nowrap">עיר</th>
              <th className="px-3 py-2.5 whitespace-nowrap">מדריך</th>
              <th className="px-3 py-2.5 whitespace-nowrap">סטטוס</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  אין שיעורים תואמים לסינון
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {DAYS_HEBREW[l.dayOfWeek]}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap" dir="ltr">
                    {l.lesson_date.split("-").reverse().join("/")}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap" dir="ltr">
                    {formatTime(l.start_time)}
                  </td>
                  <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
                    {l.framework ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {l.location?.city ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                    {l.instructor?.full_name ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 align-top whitespace-nowrap">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        STATUS_STYLES[l.status] ?? STATUS_STYLES.scheduled
                      }`}
                    >
                      {LESSON_STATUS[l.status as keyof typeof LESSON_STATUS] ?? l.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
