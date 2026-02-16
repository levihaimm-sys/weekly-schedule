"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";

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
  currentFilters: { city?: string; instructor?: string; day?: string };
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

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
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
        <select
          value={currentFilters.city ?? ""}
          onChange={(e) => updateFilter("city", e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm sm:flex-none sm:min-w-[160px]"
        >
          <option value="">כל הערים</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.instructor ?? ""}
          onChange={(e) => updateFilter("instructor", e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm sm:flex-none sm:min-w-[160px]"
        >
          <option value="">כל המדריכים</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.full_name}
            </option>
          ))}
        </select>
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
                className={`flex-1 py-2.5 text-center transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold"
                    : "hover:bg-muted"
                }`}
              >
                <p className="text-sm font-bold">{DAYS_SHORT[day]}</p>
                <p className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
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
            return dayItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setEditingItem(item)}
                className="cursor-pointer rounded-lg border border-border bg-background p-4 transition-shadow active:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="min-w-[50px] text-center">
                      <p className="text-lg font-bold text-primary">
                        {formatTime(item.start_time)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{item.location?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.location?.city}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm text-muted-foreground">
                      {item.instructor?.full_name}
                    </p>
                    {item.location?.age_group && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        גיל {item.location.age_group}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Desktop: 5-column grid (Sun-Thu) */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-3">
        {[0, 1, 2, 3, 4].map((day) => (
          <div key={day} className="space-y-2">
            <div className="rounded-lg bg-primary/10 py-2 text-center text-sm font-bold text-primary">
              {DAYS_SHORT[day]}
            </div>
            <div className="space-y-2">
              {byDay[day].length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  אין שיעורים
                </div>
              ) : (
                smartSortLessons(byDay[day]).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setEditingItem(item)}
                    className="cursor-pointer rounded-lg border border-border bg-background p-3 transition-shadow hover:shadow-md hover:border-primary/30"
                  >
                    <p className="text-xs font-bold text-primary">
                      {formatTime(item.start_time)}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-tight">
                      {item.location?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.location?.city}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.instructor?.full_name}
                      </span>
                      {item.location?.age_group && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          גיל {item.location.age_group}
                        </span>
                      )}
                    </div>
                    {item.group_name && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.group_name}
                      </p>
                    )}
                  </div>
                ))
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
