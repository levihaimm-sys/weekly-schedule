"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";

interface OverviewLesson {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor_absence_request?: boolean;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string } | null;
}

interface WeeklyOverviewGridProps {
  weekDates: string[];
  lessonsByDay: Record<string, OverviewLesson[]>;
  instructors: { id: string; full_name: string }[];
  cities?: string[];
  currentFilters?: { cities?: string[]; instructors?: string[]; changesOnly?: boolean };
  isFixedView?: boolean;
}

export function WeeklyOverviewGrid({
  weekDates,
  lessonsByDay,
  instructors,
  cities,
  currentFilters,
  isFixedView,
}: WeeklyOverviewGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/schedule/weekly-overview?${params.toString()}`);
  }

  function toggleChanges() {
    const params = new URLSearchParams(searchParams.toString());
    if (currentFilters?.changesOnly) {
      params.delete("changes");
    } else {
      params.set("changes", "1");
    }
    router.push(`/schedule/weekly-overview?${params.toString()}`);
  }

  function toggleView() {
    const params = new URLSearchParams(searchParams.toString());
    if (isFixedView) {
      params.delete("view");
    } else {
      params.set("view", "fixed");
      params.delete("changes");
    }
    router.push(`/schedule/weekly-overview?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {cities && cities.length > 0 && (
          <>
            <MultiSelectFilter
              options={cities.map((city) => ({ value: city, label: city }))}
              selected={currentFilters?.cities ?? []}
              onChange={(values) => updateFilter("city", values)}
              placeholder="כל הערים"
            />
            <MultiSelectFilter
              options={instructors.map((inst) => ({ value: inst.id, label: inst.full_name }))}
              selected={currentFilters?.instructors ?? []}
              onChange={(values) => updateFilter("instructor", values)}
              placeholder="כל המדריכים"
            />
            {!isFixedView && (
              <button
                type="button"
                onClick={toggleChanges}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  currentFilters?.changesOnly
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                שינויים
              </button>
            )}
          </>
        )}
        {/* Fixed / Live view toggle */}
        <button
          type="button"
          onClick={toggleView}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            isFixedView
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          {isFixedView ? "לוז שבועי" : "לוז קבוע"}
        </button>
      </div>

      {/* Compact 5-column grid - always visible, even on mobile */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {weekDates.map((dateStr, dayIndex) => {
          const dayLessons = smartSortLessons(lessonsByDay[dateStr] ?? []);
          const date = new Date(dateStr + "T00:00:00");
          return (
            <div key={dateStr} className="min-w-0">
              {/* Day header */}
              <div className="sticky top-14 md:top-16 z-10 rounded-t-lg bg-secondary py-1.5 text-center shadow-sm">
                <p className="text-xs font-bold text-[#1C1917] sm:text-sm">
                  {DAYS_SHORT[dayIndex]}
                </p>
                <p className="text-[10px] font-medium text-[#1C1917]/70 sm:text-xs">
                  {format(date, "dd/MM")}
                </p>
              </div>

              {/* Lessons */}
              <div className="space-y-0.5 pt-1">
                {dayLessons.length === 0 ? (
                  <div className="py-2 text-center text-[10px] text-muted-foreground">
                    —
                  </div>
                ) : (
                  dayLessons.map((lesson, index) => {
                    const prevLesson = index > 0 ? dayLessons[index - 1] : null;
                    const showSeparator = prevLesson && prevLesson.instructor?.id !== lesson.instructor?.id;
                    return (
                    <div key={lesson.id}>
                      {showSeparator && <div className="border-t-[3px] border-green-500 mb-0.5" />}
                    <div
                      className={`rounded px-1 py-1 text-[10px] leading-tight sm:px-1.5 sm:text-xs ${
                        lesson.status === "cancelled"
                          ? "bg-red-50 text-red-400 line-through"
                          : !lesson.instructor
                            ? "bg-red-50 border border-red-200"
                            : lesson.instructor_absence_request
                              ? "bg-yellow-50 border border-yellow-200"
                              : "bg-muted/50"
                      }`}
                    >
                      <span className="font-bold">{formatTime(lesson.start_time)}</span>
                      <p className="truncate font-medium">
                        {lesson.instructor?.full_name ?? (
                          <span className="text-red-600">ללא</span>
                        )}
                      </p>
                      <p className="truncate text-muted-foreground">
                        {lesson.location?.name}
                      </p>
                    </div>
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
