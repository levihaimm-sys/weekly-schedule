"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Loader2, Check, X, Search, Trash2, Star } from "lucide-react";
import { DAYS_HEBREW, DAYS_SHORT, TIME_PERIODS, TimePeriod } from "@/lib/utils/constants";
import { timePeriodLabel, nameMatch } from "@/lib/utils/staffing";
import { addAvailability, deleteAvailability, updateAvailabilityRowInfo } from "@/lib/actions/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { AvailabilityEditModal } from "./availability-edit-modal";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { StaffingAvailability, StaffingAssignment, StaffingNeed, Instructor } from "@/types/database";

interface Props {
  availability: StaffingAvailability[];
  assignments: StaffingAssignment[];
  needs: StaffingNeed[];
  instructors: Pick<Instructor, "id" | "full_name" | "is_active">[];
}

const FLEXIBLE = "flex";
// This business only operates Sunday-Thursday — no Friday/Saturday slots.
const WORK_DAYS = [0, 1, 2, 3, 4];

const AVAILABILITY_STATUS_LABEL: Record<string, string> = {
  available: "פנוי",
  assigned: "משובץ",
};

// Shown once per row instead of repeating the time-period label inside every day cell.
function rowTimeSummary(slots: StaffingAvailability[]): string {
  const daySlots = slots.filter((s) => s.day_of_week !== null);
  if (daySlots.length === 0) return "";
  const periods = Array.from(new Set(daySlots.map((s) => s.time_period)));
  const periodLabel = periods.map((p) => timePeriodLabel(p as TimePeriod)).join(" / ");
  const times = Array.from(new Set(daySlots.map((s) => s.start_time).filter(Boolean)));
  return times.length === 1 ? `${periodLabel} ${times[0]}` : periodLabel;
}

export function AvailabilityTab({ availability, assignments, needs, instructors }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = usePersistedState("staffing-availability-search", "");
  const [editingSlot, setEditingSlot] = useState<StaffingAvailability | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const [regionFilter, setRegionFilter] = usePersistedState<string[]>("staffing-availability-region", []);
  const [dayFilter, setDayFilter] = usePersistedState<string[]>("staffing-availability-day", []);
  const [timePeriodFilter, setTimePeriodFilter] = usePersistedState<string[]>(
    "staffing-availability-timePeriod",
    []
  );
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("staffing-availability-status", []);

  const hasActiveFilters =
    search.trim() !== "" ||
    regionFilter.length > 0 ||
    dayFilter.length > 0 ||
    timePeriodFilter.length > 0 ||
    statusFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setRegionFilter([]);
    setDayFilter([]);
    setTimePeriodFilter([]);
    setStatusFilter([]);
  }

  const [instructorName, setInstructorName] = useState("");
  const [region, setRegion] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("afternoon");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");

  const existingRegions = Array.from(new Set(availability.map((a) => a.region))).sort((a, b) =>
    a.localeCompare(b, "he")
  );
  const existingNames = Array.from(new Set(availability.map((a) => a.instructor_name))).sort((a, b) =>
    a.localeCompare(b, "he")
  );

  const filteredSlots = useMemo(() => {
    return availability.filter((a) => {
      if (regionFilter.length > 0 && !regionFilter.includes(a.region)) return false;
      if (dayFilter.length > 0) {
        const dayKey = a.day_of_week === null ? FLEXIBLE : String(a.day_of_week);
        if (!dayFilter.includes(dayKey)) return false;
      }
      if (timePeriodFilter.length > 0 && !timePeriodFilter.includes(a.time_period)) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(a.status)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!a.instructor_name.toLowerCase().includes(q) && !a.region.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [availability, regionFilter, dayFilter, timePeriodFilter, statusFilter, search]);

  // One row per (instructor, region) combo, so an instructor working several areas gets a row each.
  const filteredRows = useMemo(() => {
    const map = new Map<string, { name: string; region: string; slots: StaffingAvailability[] }>();
    for (const a of filteredSlots) {
      const key = `${a.instructor_name}||${a.region}`;
      const existing = map.get(key);
      if (existing) existing.slots.push(a);
      else map.set(key, { name: a.instructor_name, region: a.region, slots: [a] });
    }
    return Array.from(map.values()).sort(
      (a, b) => a.name.localeCompare(b.name, "he") || a.region.localeCompare(b.region, "he")
    );
  }, [filteredSlots]);

  // Only a confirmed assignment actually closes off a slot; look up the need it's tied to
  // so the slot can be shown red once that need is fully staffed (not just reserved).
  const needStatusByAvailabilityId = useMemo(() => {
    const map = new Map<string, StaffingNeed["status"]>();
    for (const a of assignments) {
      if (!a.is_confirmed || !a.availability_id) continue;
      const need = needs.find((n) => n.id === a.need_id);
      if (need) map.set(a.availability_id, need.status);
    }
    return map;
  }, [assignments, needs]);

  // Names are typed freely, so "already an instructor" is a fuzzy match against the real
  // instructors table rather than a hard link — same tolerance used elsewhere in staffing.
  const activeInstructorNames = useMemo(
    () => instructors.filter((i) => i.is_active).map((i) => i.full_name),
    [instructors]
  );

  async function saveRowField(
    slotIds: string[],
    field: "instructor_name" | "region" | "notes",
    value: string
  ) {
    const result = await updateAvailabilityRowInfo({ slotIds, [field]: value });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  async function handleQuickAdd(row: { name: string; region: string }, day: number | null) {
    const result = await addAvailability({
      instructor_name: row.name,
      region: row.region,
      days: [day],
      time_period: "afternoon",
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  async function handleDeleteRow(slots: StaffingAvailability[]) {
    for (const s of slots) {
      await deleteAvailability(s.id);
    }
    setConfirmDeleteKey(null);
    router.refresh();
  }

  function toggleDay(value: string) {
    setSelectedDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function handleAdd() {
    setError(null);
    if (!instructorName.trim()) {
      setError("יש להזין שם מדריך");
      return;
    }
    if (selectedDays.length === 0) {
      setError("יש לבחור לפחות יום אחד (או גמיש)");
      return;
    }
    const days = selectedDays.map((d) => (d === FLEXIBLE ? null : Number(d)));
    setIsPending(true);
    const result = await addAvailability({
      instructor_name: instructorName,
      region,
      days,
      time_period: timePeriod,
      start_time: startTime,
      notes,
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAddFormOpen(false);
    setInstructorName("");
    setRegion("");
    setSelectedDays([]);
    setStartTime("");
    setNotes("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteAvailability(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {existingNames.length} מדריכים | {availability.length} משבצות זמינות
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש שם / אזור"
              className={`w-48 rounded-lg border py-2 pe-3 ps-8 text-sm transition-colors ${
                search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
              }`}
            />
          </div>
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            הוסף זמינות
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          options={existingRegions.map((r) => ({ value: r, label: r }))}
          selected={regionFilter}
          onChange={setRegionFilter}
          placeholder="כל האזורים"
        />
        <MultiSelectFilter
          options={[
            ...WORK_DAYS.map((i) => ({ value: String(i), label: DAYS_HEBREW[i] })),
            { value: FLEXIBLE, label: "גמיש" },
          ]}
          selected={dayFilter}
          onChange={setDayFilter}
          placeholder="כל הימים"
        />
        <MultiSelectFilter
          options={(Object.keys(TIME_PERIODS) as TimePeriod[]).map((p) => ({ value: p, label: TIME_PERIODS[p] }))}
          selected={timePeriodFilter}
          onChange={setTimePeriodFilter}
          placeholder="כל חלקי היום"
        />
        <MultiSelectFilter
          options={Object.entries(AVAILABILITY_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
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
      </div>

      {error && !addFormOpen && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {addFormOpen && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
          <h3 className="mb-3 font-medium">זמינות חדשה</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שם מדריך</label>
                <input
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  list="staffing-instructor-names"
                  placeholder="אודי"
                  className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-instructor-names">
                  {existingNames.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">אזור עבודה</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  list="staffing-regions"
                  placeholder="ראש העין, פתח תקווה"
                  className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-regions">
                  {existingRegions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">חלק יום</label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((p) => (
                    <option key={p} value={p}>
                      {TIME_PERIODS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שעה מדויקת (לא חובה)</label>
                <input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="14:40"
                  dir="ltr"
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">ימים (ניתן לבחור כמה יחד)</label>
              <div className="flex flex-wrap gap-1.5">
                {WORK_DAYS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(String(i))}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      selectedDays.includes(String(i))
                        ? "border-primary bg-secondary/20 font-medium text-[#1C1917]"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {DAYS_HEBREW[i]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => toggleDay(FLEXIBLE)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    selectedDays.includes(FLEXIBLE)
                      ? "border-primary bg-secondary/20 font-medium text-[#1C1917]"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  גמיש (לא נקבע)
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">הערות</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות חופשיות"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                הוסף
              </button>
              <button
                onClick={() => {
                  setAddFormOpen(false);
                  setError(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[780px] table-fixed text-sm">
          <colgroup>
            <col className="w-[92px]" />
            <col className="w-[100px]" />
            <col className="w-[190px]" />
            <col className="w-[84px]" />
            {WORK_DAYS.map((i) => (
              <col key={i} className="w-11" />
            ))}
            <col className="w-7" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-2 py-2">מדריך/ה</th>
              <th className="px-2 py-2">עיר / אזור</th>
              <th className="px-2 py-2">סטטוס</th>
              <th className="px-2 py-2 whitespace-nowrap">חלק יום</th>
              {WORK_DAYS.map((i) => (
                <th key={i} className="px-1 py-2 text-center whitespace-nowrap">
                  {DAYS_SHORT[i]}
                </th>
              ))}
              <th className="px-1 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-muted-foreground">
                  אין עדיין זמינות רשומה
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => {
                const key = `${r.name}||${r.region}`;
                const slotIds = r.slots.map((s) => s.id);
                const isExisting = activeInstructorNames.some((n) => nameMatch(n, r.name));
                return (
                  <tr key={key} className="group">
                    <td className="px-1.5 py-1.5 align-top">
                      <div className="flex items-center gap-1">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${isExisting ? "bg-emerald-500" : "bg-amber-500"}`}
                          title={isExisting ? "מדריך/ה קיים/ת" : "מועמד/ת"}
                        />
                        <InlineEditableCell
                          value={r.name}
                          onSave={(v) => saveRowField(slotIds, "instructor_name", v)}
                          className="font-medium"
                          title={r.name}
                        />
                      </div>
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <InlineEditableCell
                        value={r.region}
                        onSave={(v) => saveRowField(slotIds, "region", v)}
                        className="text-muted-foreground"
                        title={r.region}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <div className="flex items-center gap-1">
                        {r.slots[0]?.status_updated_at && (
                          <span className="shrink-0 text-[10px] whitespace-nowrap text-muted-foreground">
                            {format(new Date(r.slots[0].status_updated_at), "dd/MM")}
                          </span>
                        )}
                        <InlineEditableCell
                          value={r.slots[0]?.notes ?? ""}
                          onSave={(v) => saveRowField(slotIds, "notes", v)}
                          placeholder="הערת סטטוס..."
                          className="font-bold text-foreground"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1.5 align-top text-xs whitespace-nowrap text-muted-foreground">
                      {rowTimeSummary(r.slots) || "—"}
                    </td>
                    {WORK_DAYS.map((day) => (
                      <td key={day} className="p-1 align-top">
                        <DayCell
                          slots={r.slots.filter((s) => s.day_of_week === day)}
                          onDelete={handleDelete}
                          onEdit={setEditingSlot}
                          onQuickAdd={() => handleQuickAdd(r, day)}
                          needStatusByAvailabilityId={needStatusByAvailabilityId}
                        />
                      </td>
                    ))}
                    <td className="px-1 py-1.5 align-top text-center">
                      {confirmDeleteKey === key ? (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleDeleteRow(r.slots)}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            title="אישור מחיקת כל השורה"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteKey(null)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                            title="ביטול"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteKey(key)}
                          className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                          title="מחק שורה"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingSlot && <AvailabilityEditModal slot={editingSlot} onClose={() => setEditingSlot(null)} />}
    </div>
  );
}

function InlineEditableCell({
  value,
  onSave,
  placeholder,
  className = "",
  title,
}: {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  title?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function commit() {
    const trimmed = draft.trim();
    if (trimmed === value.trim()) return;
    setIsPending(true);
    await onSave(trimmed);
    setIsPending(false);
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setDraft(value);
      }}
      placeholder={placeholder}
      disabled={isPending}
      title={title}
      className={`w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm transition-colors outline-none hover:border-border focus:border-primary focus:bg-background disabled:opacity-50 ${className}`}
    />
  );
}

function DayCell({
  slots,
  onDelete,
  onEdit,
  onQuickAdd,
  needStatusByAvailabilityId,
}: {
  slots: StaffingAvailability[];
  onDelete: (id: string) => void;
  onEdit: (slot: StaffingAvailability) => void;
  onQuickAdd: () => void;
  needStatusByAvailabilityId: Map<string, StaffingNeed["status"]>;
}) {
  return (
    <div className="flex min-h-[32px] flex-wrap items-center justify-center gap-1">
      {slots.length === 0 ? (
        <button
          onClick={onQuickAdd}
          title="הוסף זמינות"
          className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground opacity-40 transition-opacity hover:border-primary hover:text-primary hover:opacity-100"
        >
          <Plus size={13} />
        </button>
      ) : (
        slots.map((s) => (
          <SlotMark key={s.id} slot={s} onDelete={onDelete} onEdit={onEdit} needStatus={needStatusByAvailabilityId.get(s.id)} />
        ))
      )}
    </div>
  );
}

// A single clear mark (no repeated text) — the row's own "חלק יום" column already states
// the time period once, so each day cell only needs to say yes/no plus a status color.
function SlotMark({
  slot,
  onDelete,
  onEdit,
  needStatus,
}: {
  slot: StaffingAvailability;
  onDelete: (id: string) => void;
  onEdit: (slot: StaffingAvailability) => void;
  needStatus?: StaffingNeed["status"];
}) {
  const isFilled = slot.status === "assigned" && needStatus === "filled";
  const colorClass = isFilled
    ? "bg-purple-500 hover:bg-purple-600"
    : slot.status !== "assigned"
      ? "bg-green-400 hover:bg-green-500"
      : "bg-slate-400 hover:bg-slate-500";

  const title = [timePeriodLabel(slot.time_period), slot.start_time, slot.notes].filter(Boolean).join(" · ");

  return (
    <span className="group/mark relative inline-flex">
      <button
        onClick={() => onEdit(slot)}
        title={title}
        className={`flex h-6 w-6 items-center justify-center rounded-md text-white transition-colors ${colorClass}`}
      >
        {isFilled ? <Star size={13} fill="white" strokeWidth={0} /> : <Check size={14} strokeWidth={3} />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(slot.id);
        }}
        title="מחק"
        className="absolute -top-1.5 -left-1.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white group-hover/mark:flex"
      >
        <X size={9} />
      </button>
    </span>
  );
}
