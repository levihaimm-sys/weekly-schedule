"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MousePointerClick, CheckSquare, Square, X } from "lucide-react";
import { DAYS_SHORT, DAYS_HEBREW } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { bulkApplyPermanentChange, bulkDeleteRecurringScheduleItems } from "@/lib/actions/schedule";

interface ScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  group_name: string | null;
  address: string | null;
  client_name: string | null;
  contact_name: string | null;
  manager_name: string | null;
  framework: string | null;
  framework_name: string | null;
  field: string | null;
  lesson_duration: number | null;
  lessons_count: number | null;
  notes: string | null;
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

const NO_INSTRUCTOR = "__no_instructor__";

export function ScheduleGrid({
  schedule,
  cities,
  instructors,
  currentFilters,
}: ScheduleGridProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [localCities, setLocalCities] = useState<string[]>(currentFilters.cities ?? []);
  const [localInstructors, setLocalInstructors] = useState<string[]>(currentFilters.instructors ?? []);
  const [localClients, setLocalClients] = useState<string[]>([]);

  // Multi-select state — every write here is inherently permanent (this screen edits
  // recurring_schedule directly), so there's no temporary/permanent scope choice.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"instructor" | "time" | "manager" | "day" | "delete" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkInstructorId, setBulkInstructorId] = useState("");
  const [bulkTime, setBulkTime] = useState("");
  const [bulkManagerName, setBulkManagerName] = useState("");
  const [bulkDayOfWeek, setBulkDayOfWeek] = useState(0);

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
    setBulkAction(null);
  }

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkAction(null);
  }

  async function executeBulkAction() {
    if (selectedIds.size === 0 || !bulkAction) return;
    setBulkLoading(true);
    const ids = Array.from(selectedIds);

    if (bulkAction === "delete") {
      const result = await bulkDeleteRecurringScheduleItems(ids);
      setBulkLoading(false);
      if (!result.error) {
        clearSelection();
        setSelectMode(false);
        router.refresh();
      }
      return;
    }

    const updates =
      bulkAction === "instructor"
        ? { instructor_id: bulkInstructorId || null }
        : bulkAction === "time"
        ? { start_time: `${bulkTime}:00` }
        : bulkAction === "manager"
        ? { manager_name: bulkManagerName.trim() || null }
        : { day_of_week: bulkDayOfWeek };

    const result = await bulkApplyPermanentChange(ids, updates);
    setBulkLoading(false);
    if (!result.error) {
      clearSelection();
      setSelectMode(false);
      router.refresh();
    }
  }

  const clientOptions = useMemo(
    () => Array.from(new Set(schedule.map((item) => item.client_name).filter((c): c is string => !!c))).sort(),
    [schedule]
  );

  // Full instructor roster — not just those with a lesson on this board. Scoping this list to
  // the current board broke the filter chip's label lookup for a previously-selected instructor
  // once their lessons dropped off the (filtered) board: it fell back to showing their raw id
  // instead of their name, alongside a confusing empty result underneath.
  const instructorFilterOptions = useMemo(
    () => instructors.slice().sort((a, b) => a.full_name.localeCompare(b.full_name, "he")),
    [instructors]
  );

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      if (localCities.length > 0 && !localCities.includes(item.location?.city ?? "")) return false;
      if (localInstructors.length > 0) {
        const wantsNoInstructor = localInstructors.includes(NO_INSTRUCTOR);
        const ids = localInstructors.filter((v) => v !== NO_INSTRUCTOR);
        const matches = (wantsNoInstructor && !item.instructor) || (item.instructor && ids.includes(item.instructor.id));
        if (!matches) return false;
      }
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
          options={[
            { value: NO_INSTRUCTOR, label: "ללא מדריך" },
            ...instructorFilterOptions.map((inst) => ({ value: inst.id, label: inst.full_name })),
          ]}
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
        <button
          type="button"
          onClick={toggleSelectMode}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            selectMode
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          <MousePointerClick size={14} />
          בחירה מרובה
        </button>
      </div>

      {/* Bulk action bar */}
      {selectMode && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} שיעורים קבועים נבחרו</span>
          <div className="flex flex-wrap gap-2 mr-auto">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => setBulkAction("instructor")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkAction === "instructor"
                      ? "border-blue-400 bg-blue-100 text-blue-700"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  שנה מדריך
                </button>
                <button
                  onClick={() => setBulkAction("time")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkAction === "time"
                      ? "border-blue-400 bg-blue-100 text-blue-700"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  שנה שעה
                </button>
                <button
                  onClick={() => setBulkAction("manager")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkAction === "manager"
                      ? "border-blue-400 bg-blue-100 text-blue-700"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  שנה גננת/רכזת
                </button>
                <button
                  onClick={() => setBulkAction("day")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkAction === "day"
                      ? "border-blue-400 bg-blue-100 text-blue-700"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  שנה יום
                </button>
                <button
                  onClick={() => setBulkAction("delete")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkAction === "delete"
                      ? "border-red-400 bg-red-100 text-red-700"
                      : "border-red-200 bg-background text-red-600 hover:bg-red-50"
                  }`}
                >
                  מחק שיעורים קבועים
                </button>
                <button
                  onClick={clearSelection}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  נקה בחירה
                </button>
              </>
            )}
          </div>

          {bulkAction === "instructor" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <select
                value={bulkInstructorId}
                onChange={(e) => setBulkInstructorId(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">ללא מדריך</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.full_name}</option>
                ))}
              </select>
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                {bulkLoading && <Loader2 size={13} className="animate-spin" />}
                החל
              </button>
              <button onClick={() => setBulkAction(null)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {bulkAction === "time" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <input
                type="time"
                value={bulkTime}
                onChange={(e) => setBulkTime(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading || !bulkTime}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                {bulkLoading && <Loader2 size={13} className="animate-spin" />}
                החל
              </button>
              <button onClick={() => setBulkAction(null)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {bulkAction === "manager" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <input
                type="text"
                value={bulkManagerName}
                onChange={(e) => setBulkManagerName(e.target.value)}
                placeholder="שם גננת/רכזת"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                {bulkLoading && <Loader2 size={13} className="animate-spin" />}
                החל
              </button>
              <button onClick={() => setBulkAction(null)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {bulkAction === "day" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <select
                value={bulkDayOfWeek}
                onChange={(e) => setBulkDayOfWeek(Number(e.target.value))}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {DAYS_HEBREW.slice(0, 5).map((day, i) => (
                  <option key={i} value={i}>
                    {day}
                  </option>
                ))}
              </select>
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                {bulkLoading && <Loader2 size={13} className="animate-spin" />}
                החל
              </button>
              <button onClick={() => setBulkAction(null)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {bulkAction === "delete" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <span className="flex-1 text-sm text-red-700">
                האם למחוק {selectedIds.size} שיעורים קבועים? כל השיעורים העתידיים שנוצרו מהם יימחקו גם הם. פעולה זו בלתי הפיכה.
              </span>
              <button
                onClick={executeBulkAction}
                disabled={bulkLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "מחק"}
              </button>
              <button onClick={() => setBulkAction(null)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

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
              const isSelected = selectedIds.has(item.id);
              return (
                <div key={item.id}>
                  {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                  <div
                    onClick={() => (selectMode ? toggleItem(item.id) : setEditingItem(item))}
                    className={`cursor-pointer rounded-lg border p-4 transition-shadow active:shadow-md ${
                      isSelected ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-300" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#1C1917]">
                        {formatTime(item.start_time)}
                      </p>
                      {selectMode && (
                        isSelected
                          ? <CheckSquare size={18} className="text-blue-600 shrink-0" />
                          : <Square size={18} className="text-muted-foreground shrink-0" />
                      )}
                    </div>
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
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div key={item.id}>
                        {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                        <div
                          onClick={() => (selectMode ? toggleItem(item.id) : setEditingItem(item))}
                          className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md hover:border-secondary/30 ${
                            isSelected ? "border-blue-400 bg-blue-50/60 ring-2 ring-blue-300" : "border-border bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-[#1C1917]">
                              {formatTime(item.start_time)}
                            </p>
                            {selectMode && (
                              isSelected
                                ? <CheckSquare size={14} className="text-blue-600 shrink-0" />
                                : <Square size={14} className="text-muted-foreground shrink-0" />
                            )}
                          </div>
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
