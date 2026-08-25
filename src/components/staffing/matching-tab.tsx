"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  RotateCcw,
  X,
  Plus,
  Loader2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import { DAYS_HEBREW, DAYS_SHORT, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel, regionsMatch, nameMatch } from "@/lib/utils/staffing";
import {
  addAssignmentCandidate,
  confirmAssignment,
  unconfirmAssignment,
  deleteAssignment,
  updateNeedStatus,
  deleteNeed,
  convertAssignmentsToSchedule,
} from "@/lib/actions/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { NeedEditModal } from "./need-edit-modal";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { StaffingAvailability, StaffingNeed, StaffingAssignment } from "@/types/database";

interface Props {
  availability: StaffingAvailability[];
  needs: StaffingNeed[];
  assignments: StaffingAssignment[];
}

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  partially_filled: "bg-amber-50 text-amber-700 border-amber-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

// Shared by the per-row add box and the bulk-assign bar: the first available slot for this
// person that fits the need's region/day (excluding slots already linked to this need).
function findCompatibleSlot(
  availability: StaffingAvailability[],
  need: StaffingNeed,
  excludeIds: Set<string>,
  name: string
): StaffingAvailability | null {
  return (
    availability.find(
      (a) =>
        !excludeIds.has(a.id) &&
        nameMatch(a.instructor_name, name) &&
        regionsMatch(a.region, need.region) &&
        (need.day_of_week === null || a.day_of_week === null || a.day_of_week === need.day_of_week)
    ) ?? null
  );
}

export function MatchingTab({ availability, needs, assignments }: Props) {
  const [search, setSearch] = usePersistedState("staffing-matching-search", "");
  const [regionFilter, setRegionFilter] = usePersistedState<string[]>("staffing-matching-region", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("staffing-matching-client", []);
  const [fieldFilter, setFieldFilter] = usePersistedState<string[]>("staffing-matching-field", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("staffing-matching-framework", []);
  const [dayFilter, setDayFilter] = usePersistedState<string[]>("staffing-matching-day", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("staffing-matching-status", []);
  // Composite sort: the array's order IS the priority (first = primary). Clicking a column
  // makes it primary while keeping any other active column as a secondary tiebreaker, rather
  // than replacing it — e.g. sort by day, then click city: city becomes primary and day still
  // breaks ties within each city.
  type SortColumn = "day" | "region";
  const [sortKeys, setSortKeys] = usePersistedState<{ key: SortColumn; dir: "asc" | "desc" }[]>(
    "staffing-matching-sortkeys",
    []
  );
  const [editingNeed, setEditingNeed] = useState<StaffingNeed | null>(null);
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkName, setBulkName] = useState("");
  const [bulkPending, setBulkPending] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [convertPending, setConvertPending] = useState(false);
  const [conversionResult, setConversionResult] = useState<Awaited<ReturnType<typeof convertAssignmentsToSchedule>> | null>(
    null
  );

  function handleSortClick(column: SortColumn) {
    setSortKeys((prev) => {
      const isPrimary = prev[0]?.key === column;
      if (isPrimary) {
        if (prev[0].dir === "asc") {
          return [{ key: column, dir: "desc" }, ...prev.slice(1)];
        }
        return prev.slice(1); // was desc -> clear this column, promote the next one
      }
      const rest = prev.filter((k) => k.key !== column);
      return [{ key: column, dir: "asc" }, ...rest];
    });
  }

  function sortIndicator(column: SortColumn) {
    const idx = sortKeys.findIndex((k) => k.key === column);
    if (idx === -1) return <ArrowUpDown size={12} />;
    const dir = sortKeys[idx].dir;
    const icon = dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
    if (sortKeys.length < 2) return icon;
    return (
      <span className="flex items-center">
        {icon}
        <sup className="text-[9px]">{idx + 1}</sup>
      </span>
    );
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    regionFilter.length > 0 ||
    clientFilter.length > 0 ||
    fieldFilter.length > 0 ||
    frameworkFilter.length > 0 ||
    dayFilter.length > 0 ||
    statusFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setRegionFilter([]);
    setClientFilter([]);
    setFieldFilter([]);
    setFrameworkFilter([]);
    setDayFilter([]);
    setStatusFilter([]);
  }

  const sortHe = (a: string, b: string) => a.localeCompare(b, "he");
  const regionOptions = (Array.from(new Set(needs.map((n) => n.region).filter(Boolean))) as string[]).sort(sortHe);
  const clientOptions = Array.from(new Set(needs.map((n) => n.client_name))).sort(sortHe);
  const fieldOptions = (Array.from(new Set(needs.map((n) => n.field).filter(Boolean))) as string[]).sort(sortHe);
  const frameworkOptions = (Array.from(new Set(needs.map((n) => n.framework).filter(Boolean))) as string[]).sort(sortHe);

  const filtered = useMemo(() => {
    return needs.filter((n) => {
      if (regionFilter.length > 0 && !regionFilter.includes(n.region ?? "")) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(n.client_name)) return false;
      if (fieldFilter.length > 0 && !fieldFilter.includes(n.field ?? "")) return false;
      if (frameworkFilter.length > 0 && !frameworkFilter.includes(n.framework ?? "")) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(n.status)) return false;
      if (dayFilter.length > 0) {
        const dayKey = n.day_of_week === null ? "tbd" : String(n.day_of_week);
        if (!dayFilter.includes(dayKey)) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          n.client_name.toLowerCase().includes(q) ||
          (n.region ?? "").toLowerCase().includes(q) ||
          (n.location_name ?? "").toLowerCase().includes(q) ||
          (n.field ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [needs, regionFilter, clientFilter, fieldFilter, frameworkFilter, statusFilter, dayFilter, search]);

  // day sorts chronologically Sun->Thu (not alphabetically), "flexible/not set" last, then by
  // start time; region sorts alphabetically. sortKeys' order sets which column is primary.
  const sorted = useMemo(() => {
    if (sortKeys.length === 0) return filtered;
    const copy = [...filtered];
    const dayKey = (d: number | null) => (d === null ? 7 : d);
    const compare = (a: StaffingNeed, b: StaffingNeed, column: SortColumn) => {
      if (column === "region") return (a.region ?? "").localeCompare(b.region ?? "", "he");
      return dayKey(a.day_of_week) - dayKey(b.day_of_week) || (a.start_time ?? "").localeCompare(b.start_time ?? "");
    };
    copy.sort((a, b) => {
      for (const { key, dir } of sortKeys) {
        const cmp = compare(a, b, key);
        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return copy;
  }, [filtered, sortKeys]);

  const allSelected = sorted.length > 0 && sorted.every((n) => selectedIds.has(n.id));

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(sorted.map((n) => n.id)));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkName("");
    setConfirmBulkDelete(false);
  }

  async function handleBulkAssign() {
    const name = bulkName.trim();
    if (!name || selectedIds.size === 0) return;
    setBulkPending(true);
    for (const needId of selectedIds) {
      const need = needs.find((n) => n.id === needId);
      if (!need) continue;
      const alreadyLinked = new Set(
        assignments.filter((a) => a.need_id === needId).map((a) => a.availability_id).filter(Boolean) as string[]
      );
      const matchedSlot = findCompatibleSlot(availability, need, alreadyLinked, name);
      await addAssignmentCandidate({
        need_id: needId,
        instructor_name: name,
        availability_id: matchedSlot?.id ?? null,
      });
    }
    setBulkPending(false);
    setBulkName("");
    router.refresh();
  }

  async function handleBulkStatus(status: NeedStatus) {
    setBulkPending(true);
    for (const needId of selectedIds) {
      await updateNeedStatus(needId, status);
    }
    setBulkPending(false);
    router.refresh();
  }

  async function handleBulkDelete() {
    setBulkPending(true);
    for (const needId of selectedIds) {
      await deleteNeed(needId);
    }
    setBulkPending(false);
    clearSelection();
    router.refresh();
  }

  async function handleConvertToSchedule() {
    setConvertPending(true);
    const result = await convertAssignmentsToSchedule(Array.from(selectedIds));
    setConvertPending(false);
    setConversionResult(result);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לקוח / אזור / חוג"
          className={`w-52 rounded-lg border px-3 py-2 text-sm transition-colors ${
            search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
          }`}
        />
        <MultiSelectFilter
          options={regionOptions.map((r) => ({ value: r, label: r }))}
          selected={regionFilter}
          onChange={setRegionFilter}
          placeholder="כל האזורים"
        />
        <MultiSelectFilter
          options={clientOptions.map((c) => ({ value: c, label: c }))}
          selected={clientFilter}
          onChange={setClientFilter}
          placeholder="כל הלקוחות"
        />
        <MultiSelectFilter
          options={fieldOptions.map((f) => ({ value: f, label: f }))}
          selected={fieldFilter}
          onChange={setFieldFilter}
          placeholder="כל התחומים"
        />
        <MultiSelectFilter
          options={frameworkOptions.map((f) => ({ value: f, label: f }))}
          selected={frameworkFilter}
          onChange={setFrameworkFilter}
          placeholder="כל המסגרות"
        />
        <MultiSelectFilter
          options={[...DAYS_HEBREW.map((d, i) => ({ value: String(i), label: d })), { value: "tbd", label: "טרם נקבע" }]}
          selected={dayFilter}
          onChange={setDayFilter}
          placeholder="כל הימים"
        />
        <MultiSelectFilter
          options={(Object.keys(NEED_STATUS) as NeedStatus[]).map((s) => ({ value: s, label: NEED_STATUS[s] }))}
          selected={statusFilter}
          onChange={setStatusFilter}
          placeholder="כל הסטטוסים"
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
        <span className="text-sm text-muted-foreground">
          {filtered.reduce((sum, n) => sum + n.lessons_count, 0)} שיעורים ({filtered.length} שורות)
        </span>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} נבחרו</span>
          <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground">
            בטל בחירה
          </button>
          <div className="flex-1" />
          <input
            value={bulkName}
            onChange={(e) => setBulkName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBulkAssign()}
            placeholder="הוסף מדריך/ה לכל הנבחרים..."
            className="w-52 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleBulkAssign}
            disabled={!bulkName.trim() || bulkPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {bulkPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            הוסף לנבחרים
          </button>
          <select
            defaultValue=""
            disabled={bulkPending}
            onChange={(e) => {
              if (e.target.value) handleBulkStatus(e.target.value as NeedStatus);
              e.target.value = "";
            }}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs disabled:opacity-50"
          >
            <option value="" disabled>
              שנה סטטוס...
            </option>
            {(Object.keys(NEED_STATUS) as NeedStatus[]).map((s) => (
              <option key={s} value={s}>
                {NEED_STATUS[s]}
              </option>
            ))}
          </select>
          {confirmBulkDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={bulkPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {bulkPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                אישור מחיקה
              </button>
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={13} />
              מחק נבחרים
            </button>
          )}
          <button
            onClick={handleConvertToSchedule}
            disabled={convertPending}
            title="מעביר את המדריכים המאושרים בנבחרים ללוח הקבוע האמיתי"
            className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100 disabled:opacity-50"
          >
            {convertPending ? <Loader2 size={13} className="animate-spin" /> : <CalendarCheck size={13} />}
            העבר ללוח הקבוע
          </button>
        </div>
      )}

      {conversionResult && (
        <ConversionResultModal result={conversionResult} onClose={() => setConversionResult(null)} />
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="w-8 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="cursor-pointer accent-primary"
                />
              </th>
              <th className="px-3 py-2.5 whitespace-nowrap">לקוח</th>
              <th className="px-3 py-2.5 whitespace-nowrap">
                <button
                  onClick={() => handleSortClick("region")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  אזור
                  {sortIndicator("region")}
                </button>
              </th>
              <th className="px-3 py-2.5 whitespace-nowrap">
                <button
                  onClick={() => handleSortClick("day")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  מועד
                  {sortIndicator("day")}
                </button>
              </th>
              <th className="px-3 py-2.5 whitespace-nowrap">חוג</th>
              <th className="px-3 py-2.5 whitespace-nowrap">מסגרת</th>
              <th className="px-2 py-2.5 text-center whitespace-nowrap">קב&apos;</th>
              <th className="px-3 py-2.5 whitespace-nowrap">סטטוס</th>
              <th className="px-3 py-2.5 min-w-[220px]">מדריך/ה משובץ/ת</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-muted-foreground">
                  אין שיעורים נדרשים תואמים
                </td>
              </tr>
            ) : (
              sorted.map((n) => (
                <NeedRow
                  key={n.id}
                  need={n}
                  availability={availability}
                  assignments={assignments.filter((a) => a.need_id === n.id)}
                  onEdit={setEditingNeed}
                  selected={selectedIds.has(n.id)}
                  onToggleSelect={() => toggleSelect(n.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingNeed && <NeedEditModal need={editingNeed} onClose={() => setEditingNeed(null)} />}
    </div>
  );
}

function ConversionResultModal({
  result,
  onClose,
}: {
  result: Awaited<ReturnType<typeof convertAssignmentsToSchedule>>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">העברה ללוח הקבוע</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        {result.converted > 0 && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
            {result.converted} שיבוצים הועברו ללוח הקבוע בהצלחה.
          </div>
        )}

        {result.issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-amber-800">{result.issues.length} דורשים תיקון:</p>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {result.issues.map((issue, i) => (
                <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <p className="font-medium">
                    {issue.client_name}
                    {issue.framework_name ? ` · ${issue.framework_name}` : ""}
                    {issue.field ? ` · ${issue.field}` : ""}
                  </p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    {issue.reasons.map((r, j) => (
                      <li key={j}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.converted === 0 && result.issues.length === 0 && (
          <p className="text-sm text-muted-foreground">לא נבחרו שיבוצים מאושרים להעברה.</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          סגור
        </button>
      </div>
    </div>
  );
}

function NeedRow({
  need,
  availability,
  assignments,
  onEdit,
  selected,
  onToggleSelect,
}: {
  need: StaffingNeed;
  availability: StaffingAvailability[];
  assignments: StaffingAssignment[];
  onEdit: (need: StaffingNeed) => void;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <tr className={selected ? "bg-primary/5" : undefined}>
      <td className="px-3 py-2.5 align-top">
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="cursor-pointer accent-primary" />
      </td>
      <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
        <button onClick={() => onEdit(need)} className="hover:underline" title="ערוך שיעור">
          {need.client_name}
        </button>
      </td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{need.region ?? "—"}</td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
        {dayLabel(need.day_of_week)} · {timePeriodLabel(need.time_period)}
        {need.start_time ? ` (${need.start_time})` : ""}
      </td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{need.field ?? "—"}</td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
        {need.framework ?? "—"}
        {need.framework_name ? ` · ${need.framework_name}` : ""}
      </td>
      <td className="px-2 py-2.5 align-top text-center text-muted-foreground">{need.lessons_count}</td>
      <td className="px-3 py-2.5 align-top whitespace-nowrap">
        <StatusSelect need={need} />
      </td>
      <td className="px-3 py-2 align-top">
        <AssignmentCell need={need} availability={availability} assignments={assignments} />
      </td>
    </tr>
  );
}

function StatusSelect({ need }: { need: StaffingNeed }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(status: NeedStatus) {
    setPending(true);
    await updateNeedStatus(need.id, status);
    setPending(false);
    router.refresh();
  }

  return (
    <select
      value={need.status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as NeedStatus)}
      className={`rounded-full border px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${STATUS_COLORS[need.status as NeedStatus]}`}
    >
      {(Object.keys(NEED_STATUS) as NeedStatus[]).map((s) => (
        <option key={s} value={s}>
          {NEED_STATUS[s]}
        </option>
      ))}
    </select>
  );
}

function AssignmentCell({
  need,
  availability,
  assignments,
}: {
  need: StaffingNeed;
  availability: StaffingAvailability[];
  assignments: StaffingAssignment[];
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [dayChoice, setDayChoice] = useState<Record<string, string>>({});

  // Not filtered by slot status: an instructor can teach several lessons the same day, so
  // an already-"assigned" slot is still a valid suggestion for another lesson that day —
  // only exclude a slot already linked to one of THIS need's own assignments (no duplicate add).
  const linkedAvailabilityIds = new Set(assignments.map((a) => a.availability_id).filter(Boolean));
  const compatibleSlots = availability.filter(
    (a) =>
      !linkedAvailabilityIds.has(a.id) &&
      regionsMatch(a.region, need.region) &&
      (need.day_of_week === null || a.day_of_week === null || a.day_of_week === need.day_of_week)
  );
  const suggestedNames = Array.from(new Set(compatibleSlots.map((s) => s.instructor_name)));
  const datalistId = `staffing-suggest-${need.id}`;

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setPendingId("new");
    const matchedSlot = compatibleSlots.find((s) => nameMatch(s.instructor_name, name)) ?? null;
    await addAssignmentCandidate({
      need_id: need.id,
      instructor_name: name,
      availability_id: matchedSlot?.id ?? null,
    });
    setPendingId(null);
    setNewName("");
    router.refresh();
  }

  async function handleConfirm(assignment: StaffingAssignment, dayOverride?: number) {
    const slot = assignment.availability_id ? availability.find((s) => s.id === assignment.availability_id) ?? null : null;
    const needsDay = need.day_of_week === null && (slot?.day_of_week ?? null) === null;
    let dayToUse: number | null = need.day_of_week ?? slot?.day_of_week ?? null;

    if (needsDay) {
      const chosen = dayOverride ?? (dayChoice[assignment.id] ? Number(dayChoice[assignment.id]) : undefined);
      if (chosen === undefined) return;
      dayToUse = chosen;
    }

    setPendingId(assignment.id);
    await confirmAssignment(assignment.id, dayToUse);
    setPendingId(null);
    router.refresh();
  }

  async function handleUnconfirm(id: string) {
    setPendingId(id);
    await unconfirmAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  async function handleRemove(id: string) {
    setPendingId(id);
    await deleteAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {assignments.map((a) => {
        const slot = a.availability_id ? availability.find((s) => s.id === a.availability_id) ?? null : null;
        const needsDay = !a.is_confirmed && need.day_of_week === null && (slot?.day_of_week ?? null) === null;
        return (
          <span
            key={a.id}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${
              a.is_confirmed
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            {a.instructor_name}
            {a.converted_at && (
              <span
                title="הועבר ללוח הקבוע"
                className="rounded-full border border-emerald-300 bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-800"
              >
                בלוח הקבוע
              </span>
            )}
            {a.is_confirmed ? (
              <>
                <CheckCircle2 size={12} className="text-green-700" />
                <button
                  onClick={() => handleUnconfirm(a.id)}
                  title="בטל אישור (החזר למועמד בלבד)"
                  className="hover:text-red-600"
                >
                  {pendingId === a.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                </button>
              </>
            ) : needsDay ? (
              <select
                value={dayChoice[a.id] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setDayChoice((prev) => ({ ...prev, [a.id]: val }));
                  if (val) handleConfirm(a, Number(val));
                }}
                className="rounded border border-border bg-background text-[10px]"
              >
                <option value="">יום?</option>
                {DAYS_SHORT.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            ) : (
              <button onClick={() => handleConfirm(a)} title="אשר שיבוץ" className="hover:text-green-700">
                {pendingId === a.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              </button>
            )}
            <button onClick={() => handleRemove(a.id)} title="הסר" className="hover:text-red-600">
              <X size={11} />
            </button>
          </span>
        );
      })}

      <span className="inline-flex items-center gap-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          list={datalistId}
          placeholder="הוסף מדריך/ה..."
          className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-xs"
        />
        <datalist id={datalistId}>
          {suggestedNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || pendingId === "new"}
          className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
          title="הוסף"
        >
          {pendingId === "new" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
        </button>
      </span>
    </div>
  );
}
