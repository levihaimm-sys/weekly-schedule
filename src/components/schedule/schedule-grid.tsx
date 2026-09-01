"use client";

import { useState, useMemo } from "react";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";

interface ScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  group_name: string | null;
  address: string | null;
  client_name: string | null;
  contact_name: string | null;
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
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [localCities, setLocalCities] = useState<string[]>(currentFilters.cities ?? []);
  const [localInstructors, setLocalInstructors] = useState<string[]>(currentFilters.instructors ?? []);
  const [localClients, setLocalClients] = useState<string[]>([]);

  const clientOptions = useMemo(
    () => Array.from(new Set(schedule.map((item) => item.client_name).filter((c): c is string => !!c))).sort(),
    [schedule]
  );

  // Only offer instructors who actually have a lesson on this board — not the full instructor
  // roster (which includes people with nothing scheduled, e.g. this year).
  const instructorFilterOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const item of schedule) {
      if (item.instructor) byId.set(item.instructor.id, item.instructor.full_name);
    }
    return instructors.filter((inst) => byId.has(inst.id));
  }, [schedule, instructors]);

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      if (localCities.length > 0 && !localCities.includes(item.location?.city ?? "")) return false;
      if (localInstructors.length > 0 && !localInstructors.includes(item.instructor?.id ?? "")) return false;
      if (localClients.length > 0 && !localClients.includes(item.client_name ?? "")) return false;
      return true;
    });
  }, [schedule, localCities, localInstructors, localClients]);

  // Group by day (Sun-Thu only, no Friday)
  const byDay: Record<number, ScheduleItem[]> = {};
  for (let d = 0; d < 5; d++) byDay[d] = [];
  for (const item of filteredSchedule) {
    if (byDay[item.day_of_week]) {
      byDay[item.day_of_week].push(item);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters — kept to one horizontally-scrolling row instead of wrapping */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1">
        <MultiSelectFilter
          wrapperClassName="relative w-36 shrink-0 sm:w-40"
          options={cities.map((city) => ({ value: city, label: city }))}
          selected={localCities}
          onChange={setLocalCities}
          placeholder="כל הערים"
        />
        <MultiSelectFilter
          wrapperClassName="relative w-36 shrink-0 sm:w-40"
          options={instructorFilterOptions.map((inst) => ({ value: inst.id, label: inst.full_name }))}
          selected={localInstructors}
          onChange={setLocalInstructors}
          placeholder="כל המדריכים"
        />
        <MultiSelectFilter
          wrapperClassName="relative w-36 shrink-0 sm:w-40"
          options={clientOptions.map((client) => ({ value: client, label: client }))}
          selected={localClients}
          onChange={setLocalClients}
          placeholder="כל הלקוחות"
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
                    <p className="mt-1 text-base leading-tight">
                      {item.group_name ?? item.location?.name}
                    </p>
                    <p className="text-base text-muted-foreground">
                      {(item.address || item.location?.street) && `${item.address || item.location?.street}, `}
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
                          <p className="mt-1 text-sm leading-tight">
                            {item.group_name ?? item.location?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(item.address || item.location?.street) && `${item.address || item.location?.street}, `}
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
        סה&quot;כ {filteredSchedule.length} שיעורים קבועים
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
