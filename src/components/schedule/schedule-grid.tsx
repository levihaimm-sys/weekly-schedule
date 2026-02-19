"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";

interface ScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  group_name: string | null;
  instructor: { id: string; full_name: string } | null;
  location: {
    id: string;
    name: string;
    city: string;
    street: string | null;
    age_group: string | null;
  } | null;
}

interface ScheduleGridProps {
  schedule: ScheduleItem[];
  cities: string[];
  instructors: { id: string; full_name: string }[];
  currentFilters: { cities?: string[]; instructors?: string[]; day?: string };
}

export function ScheduleGrid({
  schedule,
  cities,
  instructors,
  currentFilters,
}: ScheduleGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  function updateFilter(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/schedule?${params.toString()}`);
  }

  // Group by day (Sun-Thu only, no Friday)
  const byDay: Record<number, ScheduleItem[]> = {};
  for (let d = 0; d < 5; d++) byDay[d] = [];
  for (const item of schedule) {
    if (byDay[item.day_of_week]) {
      byDay[item.day_of_week].push(item);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <MultiSelectFilter
          options={cities.map((city) => ({ value: city, label: city }))}
          selected={currentFilters.cities ?? []}
          onChange={(values) => updateFilter("city", values)}
          placeholder="כל הערים"
        />
        <MultiSelectFilter
          options={instructors.map((inst) => ({ value: inst.id, label: inst.full_name }))}
          selected={currentFilters.instructors ?? []}
          onChange={(values) => updateFilter("instructor", values)}
          placeholder="כל המדריכים"
        />
      </div>

      {/* Mobile: Day tabs + list */}
      <div className="md:hidden">
        <div className="flex border-b border-border">
          {[0, 1, 2, 3, 4].map((day) => {
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-3 text-center transition-colors ${
                  isSelected
                    ? "bg-secondary text-[#1C1917] font-bold"
                    : "hover:bg-muted"
                }`}
              >
                <p className="text-base font-bold">{DAYS_SHORT[day]}</p>
                <p className={`text-sm ${isSelected ? "text-[#1C1917]/70" : "text-muted-foreground"}`}>
                  {byDay[day].length}
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 p-3">
          {(() => {
            const dayItems = smartSortLessons(byDay[selectedDay]);
            if (dayItems.length === 0) {
              return (
                <div className="py-8 text-center text-muted-foreground">
                  אין שיעורים ליום זה
                </div>
              );
            }
            return dayItems.map((item, index) => {
              const prev = index > 0 ? dayItems[index - 1] : null;
              const showSeparator = prev && prev.instructor?.id !== item.instructor?.id;
              return (
                <div key={item.id}>
                  {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                  <div
                    onClick={() => setEditingItem(item)}
                    className="cursor-pointer rounded-lg border border-border bg-background p-4 transition-shadow active:shadow-md"
                  >
                    <p className="text-sm font-bold text-[#1C1917]">
                      {formatTime(item.start_time)}
                    </p>
                    <p className="mt-1 text-base font-bold text-[#1C1917]">
                      {item.instructor?.full_name ?? <span className="text-red-600">ללא מדריך</span>}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-tight">
                      {item.location?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.location?.street && `${item.location.street}, `}
                      {item.location?.city}
                    </p>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Desktop: 5-column grid (Sun-Thu) */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-3">
        {[0, 1, 2, 3, 4].map((day) => (
          <div key={day} className="space-y-2">
            <div className="rounded-lg bg-secondary py-2 text-center">
              <p className="text-sm font-bold text-[#1C1917]">{DAYS_SHORT[day]}</p>
            </div>
            <div className="space-y-2">
              {byDay[day].length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  אין שיעורים
                </div>
              ) : (
                (() => {
                  const sorted = smartSortLessons(byDay[day]);
                  return sorted.map((item, index) => {
                    const prev = index > 0 ? sorted[index - 1] : null;
                    const showSeparator = prev && prev.instructor?.id !== item.instructor?.id;
                    return (
                      <div key={item.id}>
                        {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                        <div
                          onClick={() => setEditingItem(item)}
                          className="cursor-pointer rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md hover:border-secondary/30"
                        >
                          <p className="text-sm font-bold text-[#1C1917]">
                            {formatTime(item.start_time)}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#1C1917]">
                            {item.instructor?.full_name ?? <span className="text-red-600 font-medium">ללא מדריך</span>}
                          </p>
                          <p className="mt-1 text-xs font-medium leading-tight">
                            {item.location?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.location?.street && `${item.location.street}, `}
                            {item.location?.city}
                          </p>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        סה&quot;כ {schedule.length} שיעורים קבועים
      </p>

      {/* Edit Dialog */}
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
