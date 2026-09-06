"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, X, MousePointerClick, CheckSquare, Square, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DAYS_HEBREW } from "@/lib/utils/constants";
import { dayLabel } from "@/lib/utils/staffing";
import { formatTime, getDayIndex } from "@/lib/utils/date";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { bulkUpdateLessons, bulkDeleteLessons, bulkApplyPermanentChange } from "@/lib/actions/schedule";

interface WeeklyLessonRow {
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
  location: { id: string; name: string; city: string; street?: string | null; age_group?: string | null } | null;
  group_name?: string | null;
  address?: string | null;
  client_name?: string | null;
  contact_name?: string | null;
  manager_name?: string | null;
  framework?: string | null;
  framework_name?: string | null;
  field?: string | null;
  lesson_duration?: number | null;
  lessons_count?: number | null;
  notes?: string | null;
}

interface Props {
  lessons: WeeklyLessonRow[];
  instructors: { id: string; full_name: string }[];
}

const sortHe = (a: string, b: string) => a.localeCompare(b, "he");

function frameworkLabel(r: WeeklyLessonRow): string {
  return r.framework_name || r.group_name || "—";
}

function dateOf(r: WeeklyLessonRow): Date {
  return new Date(r.lesson_date + "T00:00:00");
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

function sortValue(r: WeeklyLessonRow, key: SortKey): string | number {
  switch (key) {
    case "day":
      return r.lesson_date;
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

const NO_INSTRUCTOR = "__no_instructor__";

type BulkAction = "instructor" | "time" | "status" | "date" | "notes" | "delete" | null;

export function WeeklyScheduleTable({ lessons, instructors }: Props) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<WeeklyLessonRow | null>(null);

  const [dayFilter, setDayFilter] = usePersistedState<string[]>("weekly-table-day", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("weekly-table-framework", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("weekly-table-client", []);
  const [cityFilter, setCityFilter] = usePersistedState<string[]>("weekly-table-city", []);
  const [instructorFilter, setInstructorFilter] = usePersistedState<string[]>("weekly-table-instructor", []);

  const [sortKey, setSortKey] = usePersistedState<SortKey>("weekly-table-sort-key", "day");
  const [sortDir, setSortDir] = usePersistedState<SortDir>("weekly-table-sort-dir", "asc");

  // Multi-select state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkInstructorId, setBulkInstructorId] = useState("");
  const [bulkStatus, setBulkStatus] = useState("cancelled");
  const [bulkTime, setBulkTime] = useState("");
  const [bulkNotes, setBulkNotes] = useState("");
  const [bulkDate, setBulkDate] = useState("");

  function toggleSelectMode() {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set());
    setBulkAction(null);
  }

  function toggleRow(id: string) {
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
    Array.from(new Set(lessons.map((r) => frameworkLabel(r)).filter((f) => f !== "—"))) as string[]
  ).sort(sortHe);
  const existingClients = (
    Array.from(new Set(lessons.map((r) => r.client_name).filter(Boolean))) as string[]
  ).sort(sortHe);
  const existingCities = (
    Array.from(new Set(lessons.map((r) => r.location?.city).filter(Boolean))) as string[]
  ).sort(sortHe);
  // Full instructor roster — not just those with a lesson this week. A persisted filter
  // selection (localStorage) survives navigating to a week where that instructor has no
  // lessons; scoping this list to the current week broke the chip's label lookup and showed
  // the raw instructor id instead of their name (with a confusing empty result underneath).
  const instructorFilterOptions = useMemo(() => {
    return instructors.slice().sort((a, b) => sortHe(a.full_name, b.full_name));
  }, [instructors]);

  const filtered = useMemo(() => {
    const result = lessons.filter((r) => {
      if (dayFilter.length > 0 && !dayFilter.includes(String(getDayIndex(dateOf(r))))) return false;
      if (frameworkFilter.length > 0 && !frameworkFilter.includes(frameworkLabel(r))) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(r.client_name ?? "")) return false;
      if (cityFilter.length > 0 && !cityFilter.includes(r.location?.city ?? "")) return false;
      if (instructorFilter.length > 0) {
        const wantsNoInstructor = instructorFilter.includes(NO_INSTRUCTOR);
        const ids = instructorFilter.filter((v) => v !== NO_INSTRUCTOR);
        const matches = (wantsNoInstructor && !r.instructor) || (r.instructor && ids.includes(r.instructor.id));
        if (!matches) return false;
      }
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
  }, [lessons, dayFilter, frameworkFilter, clientFilter, cityFilter, instructorFilter, sortKey, sortDir]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((r) => next.delete(r.id));
      } else {
        filtered.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  async function executeBulkAction(scope: "temporary" | "permanent" = "temporary") {
    if (selectedIds.size === 0 || !bulkAction) return;
    setBulkLoading(true);
    const ids = Array.from(selectedIds);

    if (bulkAction === "delete") {
      const result = await bulkDeleteLessons(ids);
      setBulkLoading(false);
      if (!result.error) {
        clearSelection();
        setSelectMode(false);
        router.refresh();
      }
      return;
    }

    let updates: Parameters<typeof bulkUpdateLessons>[1] = {};
    if (bulkAction === "instructor") {
      updates = { instructor_id: bulkInstructorId || null };
    } else if (bulkAction === "time") {
      if (!bulkTime) { setBulkLoading(false); return; }
      updates = { start_time: `${bulkTime}:00` };
    } else if (bulkAction === "status") {
      updates = { status: bulkStatus };
    } else if (bulkAction === "notes") {
      updates = { change_notes: bulkNotes };
    } else if (bulkAction === "date") {
      if (!bulkDate) { setBulkLoading(false); return; }
      updates = { lesson_date: bulkDate };
    }

    if (scope === "permanent" && (bulkAction === "instructor" || bulkAction === "time")) {
      const selectedLessons = lessons.filter((r) => selectedIds.has(r.id));
      const recurringIds = Array.from(
        new Set(selectedLessons.filter((l) => l.recurring_item_id).map((l) => l.recurring_item_id as string))
      );
      const manualIds = selectedLessons.filter((l) => !l.recurring_item_id).map((l) => l.id);

      if (recurringIds.length > 0) {
        const result = await bulkApplyPermanentChange(recurringIds, updates);
        if (result.error) { setBulkLoading(false); return; }
      }
      if (manualIds.length > 0) {
        await bulkUpdateLessons(manualIds, updates);
      }
      setBulkLoading(false);
      clearSelection();
      setSelectMode(false);
      router.refresh();
      return;
    }

    const result = await bulkUpdateLessons(ids, updates);
    setBulkLoading(false);
    if (!result.error) {
      clearSelection();
      setSelectMode(false);
      router.refresh();
    }
  }

  const totalCols = SORT_COLUMNS.length + 1 + (selectMode ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          options={DAYS_HEBREW.slice(0, 6).map((d, i) => ({ value: String(i), label: d }))}
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
          options={[
            { value: NO_INSTRUCTOR, label: "ללא מדריך" },
            ...instructorFilterOptions.map((i) => ({ value: i.id, label: i.full_name })),
          ]}
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
        <span className="text-sm text-muted-foreground">{filtered.length} שורות</span>
      </div>

      {selectMode && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} שורות נבחרו</span>
          <div className="flex flex-wrap gap-2 mr-auto">
            {selectedIds.size > 0 && (
              <>
                {(["instructor", "time", "status", "date", "notes"] as const).map((action) => (
                  <button
                    key={action}
                    onClick={() => setBulkAction(action)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      bulkAction === action
                        ? "border-blue-400 bg-blue-100 text-blue-700"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {{ instructor: "שנה מדריך", time: "שנה שעה", status: "שנה סטטוס", date: "שנה תאריך", notes: "הערות" }[action]}
                  </button>
                ))}
                <button
                  onClick={() => setBulkAction("delete")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    bulkAction === "delete"
                      ? "border-red-400 bg-red-100 text-red-700"
                      : "border-red-200 bg-background text-red-600 hover:bg-red-50"
                  }`}
                >
                  מחק שיעורים
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
            <div className="flex w-full flex-wrap items-center gap-2 mt-2">
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
              <BulkScopeButtons loading={bulkLoading} onApply={executeBulkAction} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}

          {bulkAction === "time" && (
            <div className="flex w-full flex-wrap items-center gap-2 mt-2">
              <input
                type="time"
                value={bulkTime}
                onChange={(e) => setBulkTime(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <BulkScopeButtons loading={bulkLoading} onApply={executeBulkAction} disabled={!bulkTime} />
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
              <BulkApplyButton loading={bulkLoading} onClick={() => executeBulkAction("temporary")} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}

          {bulkAction === "date" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <input
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <BulkApplyButton loading={bulkLoading} onClick={() => executeBulkAction("temporary")} disabled={!bulkDate} />
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
              <BulkApplyButton loading={bulkLoading} onClick={() => executeBulkAction("temporary")} />
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}

          {bulkAction === "delete" && (
            <div className="flex w-full items-center gap-2 mt-2">
              <span className="flex-1 text-sm text-red-700">
                האם למחוק {selectedIds.size} שיעורים? פעולה זו בלתי הפיכה.
              </span>
              <button
                onClick={() => executeBulkAction("temporary")}
                disabled={bulkLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "מחק"}
              </button>
              <BulkCancelButton onClick={() => setBulkAction(null)} />
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[940px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              {selectMode && (
                <th className="w-8 px-3 py-2.5">
                  <button onClick={toggleSelectAll} title={allFilteredSelected ? "בטל בחירת הכל" : "בחר הכל"}>
                    {allFilteredSelected ? (
                      <CheckSquare size={15} className="text-blue-600" />
                    ) : (
                      <Square size={15} className="text-muted-foreground" />
                    )}
                  </button>
                </th>
              )}
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
              {/* תאריך sits right after יום; it always tracks the same chronological order, so it
                  shares the "day" sort control instead of getting a second, redundant one. */}
              <th className="px-3 py-2.5 whitespace-nowrap">תאריך</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={totalCols} className="py-10 text-center text-muted-foreground">
                  אין שיעורים תואמים לסינון
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <tr key={r.id} className={isSelected ? "bg-blue-50/60" : undefined}>
                    {selectMode && (
                      <td className="px-3 py-2.5 align-top">
                        <button onClick={() => toggleRow(r.id)}>
                          {isSelected ? (
                            <CheckSquare size={15} className="text-blue-600" />
                          ) : (
                            <Square size={15} className="text-muted-foreground" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {dayLabel(getDayIndex(dateOf(r)))}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      <span dir="ltr" className="block text-right">
                        {formatTime(r.start_time)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
                      <button
                        onClick={() => (selectMode ? toggleRow(r.id) : setEditingItem(r))}
                        className="hover:underline"
                        title="ערוך שיעור"
                      >
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
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {format(dateOf(r), "dd/MM")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <LessonEditDialog
          item={editingItem}
          instructors={instructors}
          mode="lesson"
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
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

function BulkScopeButtons({
  loading,
  onApply,
  disabled,
}: {
  loading: boolean;
  onApply: (scope: "temporary" | "permanent") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => onApply("temporary")}
        disabled={loading || disabled}
        title="ישונה רק לשיעורים הקיימים, בשבוע הבא יחזור ללוח הקבוע"
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading && <Loader2 size={13} className="animate-spin" />}
        החל (חד פעמי)
      </button>
      <button
        onClick={() => onApply("permanent")}
        disabled={loading || disabled}
        title="ישנה גם את הלוח הקבוע ואת כל השיעורים העתידיים"
        className="flex items-center gap-1.5 rounded-lg border-2 border-secondary bg-secondary/5 px-3 py-2 text-sm font-medium hover:bg-secondary/10 disabled:opacity-50"
      >
        {loading && <Loader2 size={13} className="animate-spin" />}
        החל (קבוע)
      </button>
    </div>
  );
}

function BulkCancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted shrink-0">
      <X size={14} />
    </button>
  );
}
