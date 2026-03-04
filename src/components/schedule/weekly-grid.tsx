"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { DAYS_SHORT, LESSON_STATUS, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { AlertTriangle, CheckCircle, Plus, X, Loader2, Search, ChevronDown, CheckSquare, Square, MousePointerClick } from "lucide-react";
import { createManualLesson, bulkUpdateLessons } from "@/lib/actions/schedule";

interface WeeklyLesson {
  id: string;
  recurring_item_id?: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  change_notes: string | null;
  instructor_absence_request?: boolean;
  instructor_request_handled?: boolean;
  instructor_request_type?: string | null;
  instructor_notes?: string | null;
  instructor: { id: string; full_name: string } | null;
  substitute_instructor?: { id: string; full_name: string } | null;
  location: {
    id: string;
    name: string;
    city: string;
    street?: string | null;
    age_group?: string | null;
  } | null;
}

interface WeeklyGridProps {
  weekDates: string[];
  allLessons: WeeklyLesson[];
  instructors: { id: string; full_name: string }[];
  locations: { id: string; name: string; city: string; street?: string | null }[];
  cities?: string[];
  currentFilters?: { cities?: string[]; instructors?: string[]; changesOnly?: boolean };
}

function getLessonBorderClass(lesson: WeeklyLesson, selected?: boolean) {
  if (selected) return "border-blue-400 bg-blue-50/60 ring-2 ring-blue-300";
  if (lesson.instructor_absence_request && lesson.instructor_request_handled) {
    return "border-yellow-300 bg-yellow-50/50";
  }
  if (lesson.instructor_absence_request) {
    return "border-red-300 bg-red-50/50";
  }
  if (!lesson.instructor) {
    return "border-red-200 bg-red-50/30";
  }
  return "border-border bg-background";
}

function RequestBadge({ lesson }: { lesson: WeeklyLesson }) {
  if (!lesson.instructor_absence_request) return null;
  const reqType = lesson.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES | null;
  const handled = lesson.instructor_request_handled;

  return (
    <div className={`mt-1 flex items-center gap-1 text-[10px] ${handled ? "text-yellow-600" : "text-red-600"}`}>
      {handled ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
      {reqType ? INSTRUCTOR_REQUEST_TYPES[reqType] : "בקשה"}
      {handled && " - טופל"}
    </div>
  );
}

export function WeeklyGrid({ weekDates, allLessons, instructors, locations, cities, currentFilters }: WeeklyGridProps) {
  const router = useRouter();
  const [editingLesson, setEditingLesson] = useState<WeeklyLesson | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  const [localCities, setLocalCities] = useState<string[]>(currentFilters?.cities ?? []);
  const [localInstructors, setLocalInstructors] = useState<string[]>(currentFilters?.instructors ?? []);
  const [localChangesOnly, setLocalChangesOnly] = useState(currentFilters?.changesOnly ?? false);

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"instructor" | "location" | "status" | "time" | "notes" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkInstructorId, setBulkInstructorId] = useState("");
  const [bulkLocationId, setBulkLocationId] = useState("");
  const [bulkStatus, setBulkStatus] = useState("cancelled");
  const [bulkTime, setBulkTime] = useState("");
  const [bulkNotes, setBulkNotes] = useState("");

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
    setBulkAction(null);
  }

  function toggleLesson(id: string) {
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

  function toggleDay(dateStr: string) {
    const dayIds = (lessonsByDay[dateStr] ?? []).map((l) => l.id);
    const allSelected = dayIds.length > 0 && dayIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        dayIds.forEach((id) => next.delete(id));
      } else {
        dayIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  async function executeBulkAction() {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const ids = Array.from(selectedIds);

    let updates: Parameters<typeof bulkUpdateLessons>[1] = {};
    if (bulkAction === "instructor") {
      updates = { instructor_id: bulkInstructorId || null };
    } else if (bulkAction === "location") {
      if (!bulkLocationId) { setBulkLoading(false); return; }
      updates = { location_id: bulkLocationId };
    } else if (bulkAction === "status") {
      updates = { status: bulkStatus };
    } else if (bulkAction === "time") {
      if (!bulkTime) { setBulkLoading(false); return; }
      updates = { start_time: `${bulkTime}:00` };
    } else if (bulkAction === "notes") {
      updates = { change_notes: bulkNotes };
    }

    const result = await bulkUpdateLessons(ids, updates);
    setBulkLoading(false);
    if (!result.error) {
      clearSelection();
      setSelectMode(false);
      router.refresh();
    }
  }

  const lessonsByDay = useMemo(() => {
    let filtered = allLessons;
    if (localCities.length > 0) {
      filtered = filtered.filter((l) => localCities.includes(l.location?.city ?? ""));
    }
    if (localInstructors.length > 0) {
      filtered = filtered.filter((l) => localInstructors.includes(l.instructor?.id ?? ""));
    }
    if (localChangesOnly) {
      filtered = filtered.filter(
        (l) => l.change_notes || l.instructor_absence_request || l.status !== "scheduled"
      );
    }
    const byDay: Record<string, WeeklyLesson[]> = {};
    for (const dateStr of weekDates) byDay[dateStr] = [];
    for (const lesson of filtered) {
      if (byDay[lesson.lesson_date]) byDay[lesson.lesson_date].push(lesson);
    }
    return byDay;
  }, [allLessons, weekDates, localCities, localInstructors, localChangesOnly]);

  return (
    <>
      {/* Filters */}
      {cities && cities.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <MultiSelectFilter
            options={cities.map((city) => ({ value: city, label: city }))}
            selected={localCities}
            onChange={setLocalCities}
            placeholder="כל הערים"
          />
          <MultiSelectFilter
            options={instructors.map((inst) => ({ value: inst.id, label: inst.full_name }))}
            selected={localInstructors}
            onChange={setLocalInstructors}
            placeholder="כל המדריכים"
          />
          <button
            type="button"
            onClick={() => setLocalChangesOnly((prev) => !prev)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              localChangesOnly
                ? "border-orange-300 bg-orange-50 text-orange-700"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            שינויים
          </button>
          {/* Multi-select toggle */}
          <button
            type="button"
            onClick={toggleSelectMode}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              selectMode
                ? "border-blue-400 bg-blue-50 text-blue-700"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <MousePointerClick size={14} />
            בחירה מרובה
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {selectMode && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} שיעורים נבחרו
          </span>
          <div className="flex flex-wrap gap-2 mr-auto">
            {selectedIds.size > 0 && (
              <>
                {(["instructor", "location", "status", "time", "notes"] as const).map((action) => (
                  <button
                    key={action}
                    onClick={() => setBulkAction(action)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      bulkAction === action
                        ? "border-blue-400 bg-blue-100 text-blue-700"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {{ instructor: "שנה מדריך", location: "שנה מיקום", status: "שנה סטטוס", time: "שנה שעה", notes: "הערות" }[action]}
                  </button>
                ))}
                <button
                  onClick={clearSelection}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  נקה בחירה
                </button>
              </>
            )}
          </div>

          {/* Bulk action controls */}
          {bulkAction === "instructor" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <div className="flex-1">
                <InstructorSearchSelect instructors={instructors} value={bulkInstructorId} onChange={setBulkInstructorId} />
              </div>
              <BulkApplyButton loading={bulkLoading} onClick={executeBulkAction} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}

          {bulkAction === "location" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <div className="flex-1">
                <LocationSearchSelect locations={locations} value={bulkLocationId} onChange={setBulkLocationId} />
              </div>
              <BulkApplyButton loading={bulkLoading} onClick={executeBulkAction} disabled={!bulkLocationId} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}

          {bulkAction === "status" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="scheduled">מתוכנן</option>
                <option value="completed">הושלם</option>
                <option value="cancelled">בוטל</option>
                <option value="substitute">מחליף</option>
              </select>
              <BulkApplyButton loading={bulkLoading} onClick={executeBulkAction} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
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
              <BulkApplyButton loading={bulkLoading} onClick={executeBulkAction} disabled={!bulkTime} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}

          {bulkAction === "notes" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <input
                type="text"
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                placeholder="הערה לשיעורים..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <BulkApplyButton loading={bulkLoading} onClick={executeBulkAction} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}
        </div>
      )}

      {/* Mobile: Day tabs + single day list */}
      <div className="md:hidden">
        <div className="flex border-b border-border">
          {weekDates.map((dateStr, dayIndex) => {
            const date = new Date(dateStr + "T00:00:00");
            const dayLessons = lessonsByDay[dateStr] ?? [];
            const isSelected = dayIndex === selectedDay;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dayIndex)}
                className={`flex-1 py-3 text-center transition-colors relative ${
                  isSelected
                    ? "bg-secondary text-[#1C1917] font-bold"
                    : "hover:bg-muted"
                }`}
              >
                <p className="text-base font-bold">{DAYS_SHORT[dayIndex]}</p>
                <p className={`text-sm font-medium ${isSelected ? "text-[#1C1917]" : "text-[#1C1917]/80"}`}>
                  {format(date, "dd/MM")}
                </p>
                <p className={`text-sm ${isSelected ? "text-[#1C1917]/70" : "text-muted-foreground"}`}>
                  {dayLessons.length}
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 p-3">
          {(() => {
            const dateStr = weekDates[selectedDay];
            const dayLessons = smartSortLessons(lessonsByDay[dateStr] ?? []);
            const allDaySelected = dayLessons.length > 0 && dayLessons.every((l) => selectedIds.has(l.id));
            return (
              <>
                {selectMode && dayLessons.length > 0 && (
                  <button
                    onClick={() => toggleDay(dateStr)}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      allDaySelected
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {allDaySelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    {allDaySelected ? "בטל בחירת יום" : "בחר את כל היום"}
                  </button>
                )}
                {dayLessons.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    אין שיעורים ליום זה
                  </div>
                ) : (
                  dayLessons.map((lesson, index) => {
                    const prevLesson = index > 0 ? dayLessons[index - 1] : null;
                    const showSeparator = prevLesson && prevLesson.instructor?.id !== lesson.instructor?.id;
                    const isSelected = selectedIds.has(lesson.id);
                    return (
                      <div key={lesson.id}>
                        {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                        <MobileLessonCard
                          lesson={lesson}
                          onEdit={() => {
                            if (selectMode) toggleLesson(lesson.id);
                            else setEditingLesson(lesson);
                          }}
                          selectMode={selectMode}
                          selected={isSelected}
                        />
                      </div>
                    );
                  })
                )}
                <button
                  onClick={() => setAddingToDate(dateStr)}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                >
                  <Plus size={16} />
                  הוסף שיעור
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {/* Desktop: 5-column grid (Sun-Thu) */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-3">
        {weekDates.map((dateStr, dayIndex) => {
          const dayLessons = smartSortLessons(lessonsByDay[dateStr] ?? []);
          const date = new Date(dateStr + "T00:00:00");
          return (
            <div key={dateStr} className="space-y-2">
              <div className="rounded-lg bg-secondary py-2 text-center relative">
                <p className="text-sm font-bold text-[#1C1917]">
                  {DAYS_SHORT[dayIndex]}
                </p>
                <p className="text-sm font-medium text-[#1C1917]">
                  {format(date, "dd/MM")}
                </p>
                {!selectMode && (
                  <button
                    onClick={() => setAddingToDate(dateStr)}
                    title="הוסף שיעור"
                    className="absolute top-1 left-1 rounded p-0.5 text-[#1C1917]/50 hover:bg-black/10 hover:text-[#1C1917] transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                )}
                {selectMode && (lessonsByDay[dateStr] ?? []).length > 0 && (() => {
                  const dayIds = (lessonsByDay[dateStr] ?? []).map((l) => l.id);
                  const allSelected = dayIds.every((id) => selectedIds.has(id));
                  return (
                    <button
                      onClick={() => toggleDay(dateStr)}
                      title={allSelected ? "בטל בחירת יום" : "בחר יום"}
                      className="absolute top-1 left-1 rounded p-0.5 text-blue-600 hover:bg-black/10 transition-colors"
                    >
                      {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                  );
                })()}
              </div>
              <div className="space-y-2">
                {dayLessons.length === 0 ? (
                  <div
                    onClick={() => setAddingToDate(dateStr)}
                    className="cursor-pointer rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                  >
                    אין שיעורים
                  </div>
                ) : (
                  dayLessons.map((lesson, index) => {
                    const prevLesson = index > 0 ? dayLessons[index - 1] : null;
                    const showSeparator = prevLesson && prevLesson.instructor?.id !== lesson.instructor?.id;
                    const isSelected = selectedIds.has(lesson.id);
                    return (
                      <div key={lesson.id}>
                        {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                        <div
                          onClick={() => {
                            if (selectMode) toggleLesson(lesson.id);
                            else setEditingLesson(lesson);
                          }}
                          className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md hover:border-secondary/30 ${getLessonBorderClass(lesson, isSelected)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#1C1917]">
                              {formatTime(lesson.start_time)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                                  lesson.status === "completed"
                                    ? "bg-green-50 text-green-700"
                                    : lesson.status === "cancelled"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
                              </span>
                              {selectMode && (
                                isSelected
                                  ? <CheckSquare size={14} className="text-blue-600 shrink-0" />
                                  : <Square size={14} className="text-muted-foreground shrink-0" />
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-sm font-bold text-[#1C1917]">
                            {lesson.instructor?.full_name ?? (
                              <span className="text-red-600 font-medium">ללא מדריך</span>
                            )}
                          </p>
                          <p className="mt-1 text-sm leading-tight">
                            {lesson.location?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lesson.location?.street && `${lesson.location.street}, `}
                            {lesson.location?.city}
                          </p>
                          <RequestBadge lesson={lesson} />
                          {lesson.change_notes && (
                            <p className="mt-1 text-xs text-orange-600">
                              {lesson.change_notes}
                            </p>
                          )}
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

      {/* Edit Dialog */}
      {editingLesson && (
        <LessonEditDialog
          item={editingLesson}
          instructors={instructors}
          mode="lesson"
          open={!!editingLesson}
          onClose={() => setEditingLesson(null)}
        />
      )}

      {/* Add Lesson Dialog */}
      {addingToDate && (
        <AddLessonDialog
          date={addingToDate}
          instructors={instructors}
          locations={locations}
          onClose={() => setAddingToDate(null)}
        />
      )}
    </>
  );
}

function BulkApplyButton({ loading, onClick, disabled }: { loading: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shrink-0"
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      החל
    </button>
  );
}

function BulkCancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
      <X size={14} />
    </button>
  );
}

function MobileLessonCard({
  lesson,
  onEdit,
  selectMode,
  selected,
}: {
  lesson: WeeklyLesson;
  onEdit: () => void;
  selectMode?: boolean;
  selected?: boolean;
}) {
  return (
    <div
      onClick={onEdit}
      className={`cursor-pointer rounded-lg border p-4 transition-shadow active:shadow-md ${getLessonBorderClass(lesson, selected)}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#1C1917]">
            {formatTime(lesson.start_time)}
          </p>
          <p className="mt-1 text-base font-bold text-[#1C1917]">
            {lesson.instructor?.full_name ?? (
              <span className="font-medium text-red-600">ללא מדריך</span>
            )}
          </p>
          <p className="mt-1 text-base leading-tight">
            {lesson.location?.name ?? "—"}
          </p>
          <p className="text-base text-muted-foreground">
            {lesson.location?.city}
            {lesson.location?.street && `, ${lesson.location.street}`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              lesson.status === "completed"
                ? "bg-green-50 text-green-700"
                : lesson.status === "cancelled"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
          </span>
          {selectMode && (
            selected
              ? <CheckSquare size={18} className="text-blue-600 shrink-0" />
              : <Square size={18} className="text-muted-foreground shrink-0" />
          )}
        </div>
      </div>
      <RequestBadge lesson={lesson} />
      {lesson.change_notes && (
        <p className="mt-1 text-xs text-orange-600">{lesson.change_notes}</p>
      )}
    </div>
  );
}

// ─── Add Lesson Dialog ────────────────────────────────────────────────────────

function AddLessonDialog({
  date,
  instructors,
  locations,
  onClose,
}: {
  date: string;
  instructors: { id: string; full_name: string }[];
  locations: { id: string; name: string; city: string; street?: string | null }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [instructorId, setInstructorId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [lessonDate, setLessonDate] = useState(date);
  const [startTime, setStartTime] = useState("09:00");
  const [status, setStatus] = useState("scheduled");
  const [changeNotes, setChangeNotes] = useState("");

  async function handleSubmit() {
    if (!locationId) {
      setError("יש לבחור גן / מיקום");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await createManualLesson({
        instructor_id: instructorId || null,
        location_id: locationId,
        lesson_date: lessonDate,
        start_time: startTime,
        status,
        change_notes: changeNotes || undefined,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("שגיאה ביצירת השיעור");
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">הוספת שיעור</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 space-y-4">
          {/* Instructor */}
          <InstructorSearchSelect
            instructors={instructors}
            value={instructorId}
            onChange={setInstructorId}
          />

          {/* Location */}
          <LocationSearchSelect
            locations={locations}
            value={locationId}
            onChange={setLocationId}
          />

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">תאריך פעילות</label>
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-sm font-medium">שעת התחלה</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium">סטטוס</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="scheduled">מתוכנן</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
              <option value="substitute">מחליף</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium">הערות</label>
            <input
              type="text"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="הערה לשיעור (אופציונלי)..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            הוסף שיעור
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared search-select components ─────────────────────────────────────────

function InstructorSearchSelect({
  instructors,
  value,
  onChange,
}: {
  instructors: { id: string; full_name: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return instructors;
    const term = search.trim().toLowerCase();
    return instructors.filter((i) => i.full_name.toLowerCase().includes(term));
  }, [instructors, search]);

  const selectedLabel = value
    ? instructors.find((i) => i.id === value)?.full_name ?? ""
    : "ללא מדריך";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">מדריך</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        >
          <span className={value ? "" : "text-muted-foreground"}>{selectedLabel}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש מדריך..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === "" ? "bg-muted font-medium" : ""}`}
              >
                ללא מדריך
              </button>
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">לא נמצאו מדריכים</div>
              ) : (
                filtered.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => { onChange(inst.id); setOpen(false); setSearch(""); }}
                    className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === inst.id ? "bg-muted font-medium" : ""}`}
                  >
                    {inst.full_name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LocationSearchSelect({
  locations,
  value,
  onChange,
}: {
  locations: { id: string; name: string; city: string; street?: string | null }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return locations;
    const term = search.trim().toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.city.toLowerCase().includes(term) ||
        (l.street ?? "").toLowerCase().includes(term)
    );
  }, [locations, search]);

  const selected = locations.find((l) => l.id === value);
  const selectedLabel = selected
    ? `${selected.name} — ${selected.city}`
    : "בחר גן / מיקום";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        גן / מיקום <span className="text-destructive">*</span>
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        >
          <span className={value ? "" : "text-muted-foreground"}>{selectedLabel}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש לפי שם גן, עיר..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">לא נמצאו מיקומים</div>
              ) : (
                filtered.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => { onChange(loc.id); setOpen(false); setSearch(""); }}
                    className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === loc.id ? "bg-muted font-medium" : ""}`}
                  >
                    <span className="font-medium">{loc.name}</span>
                    <span className="text-muted-foreground"> — {loc.city}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
