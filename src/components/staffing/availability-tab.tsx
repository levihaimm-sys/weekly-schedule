"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, X, Search } from "lucide-react";
import { DAYS_HEBREW, DAYS_SHORT, TIME_PERIODS, TimePeriod } from "@/lib/utils/constants";
import { timePeriodLabel } from "@/lib/utils/staffing";
import { addAvailability, deleteAvailability } from "@/lib/actions/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { AvailabilityEditModal } from "./availability-edit-modal";
import type { StaffingAvailability, StaffingAssignment, StaffingNeed } from "@/types/database";

interface Props {
  availability: StaffingAvailability[];
  assignments: StaffingAssignment[];
  needs: StaffingNeed[];
}

const FLEXIBLE = "flex";

const AVAILABILITY_STATUS_LABEL: Record<string, string> = {
  available: "פנוי",
  assigned: "משובץ",
};

export function AvailabilityTab({ availability, assignments, needs }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingSlot, setEditingSlot] = useState<StaffingAvailability | null>(null);

  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [dayFilter, setDayFilter] = useState<string[]>([]);
  const [timePeriodFilter, setTimePeriodFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

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
              className="w-48 rounded-lg border border-border bg-background py-2 pe-3 ps-8 text-sm"
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
          options={[...DAYS_HEBREW.map((d, i) => ({ value: String(i), label: d })), { value: FLEXIBLE, label: "גמיש" }]}
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
      </div>

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
                {DAYS_HEBREW.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(String(i))}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      selectedDays.includes(String(i))
                        ? "border-primary bg-secondary/20 font-medium text-[#1C1917]"
                        : "border-border bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d}
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
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">מדריך/ה</th>
              <th className="px-3 py-2.5 whitespace-nowrap">עיר / אזור</th>
              {DAYS_SHORT.map((d) => (
                <th key={d} className="px-1.5 py-2.5 text-center whitespace-nowrap">
                  {d}
                </th>
              ))}
              <th className="px-1.5 py-2.5 text-center whitespace-nowrap">גמיש</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-muted-foreground">
                  אין עדיין זמינות רשומה
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={`${r.name}||${r.region}`}>
                  <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">{r.name}</td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{r.region}</td>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <td key={day} className="px-1 py-2 text-center align-top">
                      <div className="flex flex-col items-center gap-1">
                        {r.slots
                          .filter((s) => s.day_of_week === day)
                          .map((s) => (
                            <SlotBadge
                              key={s.id}
                              slot={s}
                              onDelete={handleDelete}
                              onEdit={setEditingSlot}
                              needStatus={needStatusByAvailabilityId.get(s.id)}
                            />
                          ))}
                      </div>
                    </td>
                  ))}
                  <td className="px-1 py-2 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      {r.slots
                        .filter((s) => s.day_of_week === null)
                        .map((s) => (
                          <SlotBadge
                            key={s.id}
                            slot={s}
                            onDelete={handleDelete}
                            onEdit={setEditingSlot}
                            needStatus={needStatusByAvailabilityId.get(s.id)}
                          />
                        ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingSlot && <AvailabilityEditModal slot={editingSlot} onClose={() => setEditingSlot(null)} />}
    </div>
  );
}

function SlotBadge({
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
  const colorClass =
    slot.status !== "assigned"
      ? "border-green-200 bg-green-50 text-green-800"
      : needStatus === "filled"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-border bg-muted/40 text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] whitespace-nowrap ${colorClass}`}
      title={slot.notes ?? undefined}
    >
      <button onClick={() => onEdit(slot)} className="hover:underline" title="ערוך">
        {timePeriodLabel(slot.time_period)}
        {slot.start_time ? ` ${slot.start_time}` : ""}
      </button>
      <button onClick={() => onDelete(slot.id)} className="hover:text-red-600" title="מחק">
        <X size={10} />
      </button>
    </span>
  );
}
