"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, eachDayOfInterval, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { Plus, Loader2, Check, X, Search, Trash2 } from "lucide-react";
import {
  addCampAvailability,
  deleteCampAvailability,
  updateCampAvailabilityRowInfo,
} from "@/lib/actions/camp-staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { CampStaffingAvailability, CampStaffingAssignment, CampSession } from "@/types/database";

interface Props {
  session: CampSession;
  availability: CampStaffingAvailability[];
  assignments: CampStaffingAssignment[];
  isArchived: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  available: "פנוי",
  assigned: "משובץ",
};

export function CampAvailabilityTab({ session, availability, assignments, isArchived }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = usePersistedState("camp-availability-search", "");
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  const [areaFilter, setAreaFilter] = usePersistedState<string[]>("camp-availability-area", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("camp-availability-status", []);

  const hasActiveFilters = search.trim() !== "" || areaFilter.length > 0 || statusFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setAreaFilter([]);
    setStatusFilter([]);
  }

  const [instructorName, setInstructorName] = useState("");
  const [area, setArea] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const campDates = useMemo(() => {
    if (!session.start_date || !session.end_date) return [];
    return eachDayOfInterval({
      start: parseISO(session.start_date),
      end: parseISO(session.end_date),
    }).map((d) => format(d, "yyyy-MM-dd"));
  }, [session.start_date, session.end_date]);

  const existingAreas = Array.from(new Set(availability.map((a) => a.area))).sort((a, b) =>
    a.localeCompare(b, "he")
  );
  const existingNames = Array.from(new Set(availability.map((a) => a.instructor_name))).sort((a, b) =>
    a.localeCompare(b, "he")
  );

  const filteredSlots = useMemo(() => {
    return availability.filter((a) => {
      if (areaFilter.length > 0 && !areaFilter.includes(a.area)) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(a.status)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!a.instructor_name.toLowerCase().includes(q) && !a.area.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [availability, areaFilter, statusFilter, search]);

  const filteredRows = useMemo(() => {
    const map = new Map<string, { name: string; area: string; slots: CampStaffingAvailability[] }>();
    for (const a of filteredSlots) {
      const key = `${a.instructor_name}||${a.area}`;
      const existing = map.get(key);
      if (existing) existing.slots.push(a);
      else map.set(key, { name: a.instructor_name, area: a.area, slots: [a] });
    }
    return Array.from(map.values()).sort(
      (a, b) => a.name.localeCompare(b.name, "he") || a.area.localeCompare(b.area, "he")
    );
  }, [filteredSlots]);

  function toggleDate(date: string) {
    setSelectedDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  }

  async function handleAdd() {
    setError(null);
    if (!instructorName.trim()) { setError("יש להזין שם מדריך"); return; }
    if (!area.trim()) { setError("יש להזין אזור"); return; }
    if (selectedDates.length === 0) { setError("יש לבחור לפחות תאריך אחד"); return; }
    setIsPending(true);
    const result = await addCampAvailability({
      camp_session_id: session.id,
      instructor_name: instructorName,
      area,
      dates: selectedDates,
      notes,
    });
    setIsPending(false);
    if (result.error) { setError(result.error); return; }
    setAddFormOpen(false);
    setInstructorName("");
    setArea("");
    setSelectedDates([]);
    setNotes("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteCampAvailability(id);
    router.refresh();
  }

  async function handleDeleteRow(slots: CampStaffingAvailability[]) {
    for (const s of slots) {
      await deleteCampAvailability(s.id);
    }
    setConfirmDeleteKey(null);
    router.refresh();
  }

  async function handleQuickAdd(row: { name: string; area: string }, date: string) {
    const result = await addCampAvailability({
      camp_session_id: session.id,
      instructor_name: row.name,
      area: row.area,
      dates: [date],
    });
    if (result.error) { setError(result.error); return; }
    setError(null);
    router.refresh();
  }

  async function saveRowField(
    slotIds: string[],
    field: "instructor_name" | "area" | "notes",
    value: string
  ) {
    const result = await updateCampAvailabilityRowInfo({ slotIds, [field]: value });
    if (result.error) { setError(result.error); return; }
    setError(null);
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
          {!isArchived && (
            <button
              onClick={() => setAddFormOpen(!addFormOpen)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} />
              הוסף זמינות
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          options={existingAreas.map((r) => ({ value: r, label: r }))}
          selected={areaFilter}
          onChange={setAreaFilter}
          placeholder="כל האזורים"
        />
        <MultiSelectFilter
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
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
                  list="camp-instructor-names"
                  placeholder="אודי"
                  className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="camp-instructor-names">
                  {existingNames.map((n) => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">אזור עבודה</label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  list="camp-areas"
                  placeholder="ראש העין, פתח תקווה"
                  className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="camp-areas">
                  {existingAreas.map((r) => <option key={r} value={r} />)}
                </datalist>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">תאריכים (ניתן לבחור כמה יחד)</label>
              <div className="flex flex-wrap gap-1.5">
                {campDates.map((date) => {
                  const d = parseISO(date);
                  const dayName = format(d, "EEEE", { locale: he });
                  const dayNum = format(d, "d/M");
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => toggleDate(date)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        selectedDates.includes(date)
                          ? "border-primary bg-secondary/20 font-medium text-[#1C1917]"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {dayName} {dayNum}
                    </button>
                  );
                })}
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
                onClick={() => { setAddFormOpen(false); setError(null); }}
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
        <table className="w-full min-w-[700px] table-fixed text-sm">
          <colgroup>
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[180px]" />
            {campDates.map((d) => <col key={d} className="w-12" />)}
            <col className="w-7" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-2 py-2">מדריך/ה</th>
              <th className="px-2 py-2">אזור</th>
              <th className="px-2 py-2">סטטוס</th>
              {campDates.map((date) => {
                const d = parseISO(date);
                return (
                  <th key={date} className="px-1 py-2 text-center whitespace-nowrap">
                    <div className="text-[10px] leading-tight">
                      {format(d, "EEE", { locale: he })}
                    </div>
                    <div className="text-[10px] leading-tight">
                      {format(d, "d/M")}
                    </div>
                  </th>
                );
              })}
              <th className="px-1 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={3 + campDates.length + 1} className="py-10 text-center text-muted-foreground">
                  אין עדיין זמינות רשומה
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => {
                const key = `${r.name}||${r.area}`;
                const slotIds = r.slots.map((s) => s.id);
                return (
                  <tr key={key} className="group">
                    <td className="px-1.5 py-1.5 align-top">
                      <InlineEditableCell
                        value={r.name}
                        onSave={(v) => saveRowField(slotIds, "instructor_name", v)}
                        className="font-medium"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 align-top">
                      <InlineEditableCell
                        value={r.area}
                        onSave={(v) => saveRowField(slotIds, "area", v)}
                        className="text-muted-foreground"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <InlineEditableCell
                        value={r.slots[0]?.notes ?? ""}
                        onSave={(v) => saveRowField(slotIds, "notes", v)}
                        placeholder="הערת סטטוס..."
                        className="font-bold text-foreground"
                      />
                    </td>
                    {campDates.map((date) => {
                      const daySlots = r.slots.filter((s) => s.camp_date === date);
                      return (
                        <td key={date} className="p-1 align-top">
                          <DayCell
                            slots={daySlots}
                            onDelete={handleDelete}
                            onQuickAdd={() => handleQuickAdd(r, date)}
                            isArchived={isArchived}
                          />
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 align-top text-center">
                      {!isArchived && (
                        confirmDeleteKey === key ? (
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
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEditableCell({
  value,
  onSave,
  placeholder,
  className = "",
}: {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

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
      className={`w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm transition-colors outline-none hover:border-border focus:border-primary focus:bg-background disabled:opacity-50 ${className}`}
    />
  );
}

function DayCell({
  slots,
  onDelete,
  onQuickAdd,
  isArchived,
}: {
  slots: CampStaffingAvailability[];
  onDelete: (id: string) => void;
  onQuickAdd: () => void;
  isArchived: boolean;
}) {
  return (
    <div className="flex min-h-[32px] flex-wrap items-center justify-center gap-1">
      {slots.length === 0 ? (
        !isArchived && (
          <button
            onClick={onQuickAdd}
            title="הוסף זמינות"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground opacity-40 transition-opacity hover:border-primary hover:text-primary hover:opacity-100"
          >
            <Plus size={13} />
          </button>
        )
      ) : (
        slots.map((s) => (
          <span key={s.id} className="group/mark relative inline-flex">
            <span
              title={s.notes || undefined}
              className={`flex h-6 w-6 items-center justify-center rounded-md text-white transition-colors ${
                s.status === "assigned" ? "bg-purple-500" : "bg-green-400"
              }`}
            >
              <Check size={14} strokeWidth={3} />
            </span>
            {!isArchived && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                title="מחק"
                className="absolute -top-1.5 -left-1.5 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white group-hover/mark:flex"
              >
                <X size={9} />
              </button>
            )}
          </span>
        ))
      )}
    </div>
  );
}
