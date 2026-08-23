"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Plus, Loader2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { DAYS_HEBREW, DAYS_SHORT, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel, regionsMatch, nameMatch } from "@/lib/utils/staffing";
import {
  addAssignmentCandidate,
  confirmAssignment,
  unconfirmAssignment,
  deleteAssignment,
  updateNeedStatus,
} from "@/lib/actions/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { NeedEditModal } from "./need-edit-modal";
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

export function MatchingTab({ availability, needs, assignments }: Props) {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string[]>([]);
  const [fieldFilter, setFieldFilter] = useState<string[]>([]);
  const [frameworkFilter, setFrameworkFilter] = useState<string[]>([]);
  const [dayFilter, setDayFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [editingNeed, setEditingNeed] = useState<StaffingNeed | null>(null);
  const [dateSortDir, setDateSortDir] = useState<"asc" | "desc" | null>(null);

  function toggleDateSort() {
    setDateSortDir((prev) => (prev === null ? "asc" : prev === "asc" ? "desc" : null));
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

  // Chronological Sun->Thu order, not alphabetical — "flexible/not set" sorts last; same-day
  // rows are then ordered by start time.
  const sorted = useMemo(() => {
    if (!dateSortDir) return filtered;
    const copy = [...filtered];
    const dayKey = (d: number | null) => (d === null ? 7 : d);
    copy.sort((a, b) => {
      const cmp =
        dayKey(a.day_of_week) - dayKey(b.day_of_week) || (a.start_time ?? "").localeCompare(b.start_time ?? "");
      return dateSortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, dateSortDir]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לקוח / אזור / חוג"
          className="w-52 rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
        <span className="text-sm text-muted-foreground">{filtered.length} שיעורים</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">לקוח</th>
              <th className="px-3 py-2.5 whitespace-nowrap">אזור</th>
              <th className="px-3 py-2.5 whitespace-nowrap">
                <button onClick={toggleDateSort} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  מועד
                  {dateSortDir === "asc" ? (
                    <ChevronUp size={13} />
                  ) : dateSortDir === "desc" ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ArrowUpDown size={12} />
                  )}
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
                <td colSpan={8} className="py-10 text-center text-muted-foreground">
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

function NeedRow({
  need,
  availability,
  assignments,
  onEdit,
}: {
  need: StaffingNeed;
  availability: StaffingAvailability[];
  assignments: StaffingAssignment[];
  onEdit: (need: StaffingNeed) => void;
}) {
  return (
    <tr>
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
                ? need.status === "partially_filled"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-green-200 bg-green-50 text-green-800"
                : "border-border bg-muted/30 text-muted-foreground"
            }`}
          >
            {a.instructor_name}
            {a.is_confirmed ? (
              <button onClick={() => handleUnconfirm(a.id)} title="בטל אישור" className="hover:text-amber-700">
                {pendingId === a.id ? <Loader2 size={11} className="animate-spin" /> : "✓"}
              </button>
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
