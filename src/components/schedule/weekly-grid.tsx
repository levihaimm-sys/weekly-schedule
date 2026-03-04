"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { DAYS_SHORT, LESSON_STATUS, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { AlertTriangle, CheckCircle, Plus, X, Loader2, Search, ChevronDown } from "lucide-react";
import { createManualLesson } from "@/lib/actions/schedule";

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
  lessonsByDay: Record<string, WeeklyLesson[]>;
  instructors: { id: string; full_name: string }[];
  locations: { id: string; name: string; city: string; street?: string | null }[];
  cities?: string[];
  currentFilters?: { cities?: string[]; instructors?: string[]; changesOnly?: boolean };
}

function getLessonBorderClass(lesson: WeeklyLesson) {
  if (lesson.instructor_absence_request && lesson.instructor_request_handled) {
    return "border-yellow-300 bg-yellow-50/50"; // handled
  }
  if (lesson.instructor_absence_request) {
    return "border-red-300 bg-red-50/50"; // pending
  }
  if (!lesson.instructor) {
    return "border-red-200 bg-red-50/30"; // no instructor
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

export function WeeklyGrid({ weekDates, lessonsByDay, instructors, locations, cities, currentFilters }: WeeklyGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingLesson, setEditingLesson] = useState<WeeklyLesson | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);

  function updateFilter(key: string, values: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/schedule/weekly?${params.toString()}`);
  }

  function toggleChanges() {
    const params = new URLSearchParams(searchParams.toString());
    if (currentFilters?.changesOnly) {
      params.delete("changes");
    } else {
      params.set("changes", "1");
    }
    router.push(`/schedule/weekly?${params.toString()}`);
  }

  return (
    <>
      {/* Filters */}
      {cities && cities.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
            return (
              <>
                {dayLessons.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    אין שיעורים ליום זה
                  </div>
                ) : (
                  dayLessons.map((lesson, index) => {
                    const prevLesson = index > 0 ? dayLessons[index - 1] : null;
                    const showSeparator = prevLesson && prevLesson.instructor?.id !== lesson.instructor?.id;
                    return (
                      <div key={lesson.id}>
                        {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                        <MobileLessonCard
                          lesson={lesson}
                          onEdit={() => setEditingLesson(lesson)}
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
                <button
                  onClick={() => setAddingToDate(dateStr)}
                  title="הוסף שיעור"
                  className="absolute top-1 left-1 rounded p-0.5 text-[#1C1917]/50 hover:bg-black/10 hover:text-[#1C1917] transition-colors"
                >
                  <Plus size={15} />
                </button>
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
                    return (
                      <div key={lesson.id}>
                        {showSeparator && <div className="border-t-[3px] border-green-500 mb-2" />}
                        <div
                          onClick={() => setEditingLesson(lesson)}
                          className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md hover:border-secondary/30 ${getLessonBorderClass(lesson)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#1C1917]">
                              {formatTime(lesson.start_time)}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                lesson.status === "completed"
                                  ? "bg-green-50 text-green-700"
                                  : lesson.status === "cancelled"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
                            </span>
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

function MobileLessonCard({
  lesson,
  onEdit,
}: {
  lesson: WeeklyLesson;
  onEdit: () => void;
}) {
  return (
    <div
      onClick={onEdit}
      className={`cursor-pointer rounded-lg border p-4 transition-shadow active:shadow-md ${getLessonBorderClass(lesson)}`}
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
        <span
          className={`self-start rounded-full px-2 py-0.5 text-[10px] font-medium ${
            lesson.status === "completed"
              ? "bg-green-50 text-green-700"
              : lesson.status === "cancelled"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
        </span>
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
