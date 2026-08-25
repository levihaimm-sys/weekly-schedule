"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ArrowUpDown, X } from "lucide-react";
import { DAYS_HEBREW, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel } from "@/lib/utils/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { NeedEditModal } from "./need-edit-modal";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { StaffingNeed, StaffingAssignment } from "@/types/database";

interface Props {
  needs: StaffingNeed[];
  assignments: StaffingAssignment[];
}

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  partially_filled: "bg-amber-50 text-amber-700 border-amber-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

// Read-only view built for exporting/sending a schedule to instructors: same filter set as the
// matching table plus an instructor filter (the whole point — narrow to one instructor before
// sending), but the columns shown are what an instructor actually needs (address, duration,
// start date...) instead of the assignment-editing UI.
export function InstructorScheduleTab({ needs, assignments }: Props) {
  const [search, setSearch] = usePersistedState("staffing-instr-search", "");
  const [instructorFilter, setInstructorFilter] = usePersistedState<string[]>("staffing-instr-instructor", []);
  const [regionFilter, setRegionFilter] = usePersistedState<string[]>("staffing-instr-region", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("staffing-instr-client", []);
  const [fieldFilter, setFieldFilter] = usePersistedState<string[]>("staffing-instr-field", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("staffing-instr-framework", []);
  const [dayFilter, setDayFilter] = usePersistedState<string[]>("staffing-instr-day", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("staffing-instr-status", []);
  type SortColumn = "day" | "region";
  const [sortKeys, setSortKeys] = usePersistedState<{ key: SortColumn; dir: "asc" | "desc" }[]>(
    "staffing-instr-sortkeys",
    []
  );
  const [editingNeed, setEditingNeed] = useState<StaffingNeed | null>(null);

  function handleSortClick(column: SortColumn) {
    setSortKeys((prev) => {
      const isPrimary = prev[0]?.key === column;
      if (isPrimary) {
        if (prev[0].dir === "asc") {
          return [{ key: column, dir: "desc" }, ...prev.slice(1)];
        }
        return prev.slice(1);
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
    instructorFilter.length > 0 ||
    regionFilter.length > 0 ||
    clientFilter.length > 0 ||
    fieldFilter.length > 0 ||
    frameworkFilter.length > 0 ||
    dayFilter.length > 0 ||
    statusFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setInstructorFilter([]);
    setRegionFilter([]);
    setClientFilter([]);
    setFieldFilter([]);
    setFrameworkFilter([]);
    setDayFilter([]);
    setStatusFilter([]);
  }

  const assignedByNeed = useMemo(() => {
    const map = new Map<string, { name: string; confirmed: boolean }[]>();
    for (const a of assignments) {
      const list = map.get(a.need_id) ?? [];
      list.push({ name: a.instructor_name, confirmed: a.is_confirmed });
      map.set(a.need_id, list);
    }
    return map;
  }, [assignments]);

  const sortHe = (a: string, b: string) => a.localeCompare(b, "he");
  const instructorOptions = Array.from(new Set(assignments.map((a) => a.instructor_name))).sort(sortHe);
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
      if (instructorFilter.length > 0) {
        const names = assignedByNeed.get(n.id) ?? [];
        if (!names.some((a) => instructorFilter.includes(a.name))) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          n.client_name.toLowerCase().includes(q) ||
          (n.region ?? "").toLowerCase().includes(q) ||
          (n.location_name ?? "").toLowerCase().includes(q) ||
          (n.field ?? "").toLowerCase().includes(q) ||
          (assignedByNeed.get(n.id) ?? []).some((a) => a.name.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    needs,
    regionFilter,
    clientFilter,
    fieldFilter,
    frameworkFilter,
    statusFilter,
    dayFilter,
    instructorFilter,
    search,
    assignedByNeed,
  ]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לקוח / אזור / חוג / מדריך"
          className={`w-52 rounded-lg border px-3 py-2 text-sm transition-colors ${
            search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
          }`}
        />
        <MultiSelectFilter
          options={instructorOptions.map((i) => ({ value: i, label: i }))}
          selected={instructorFilter}
          onChange={setInstructorFilter}
          placeholder="כל המדריכים"
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
        <span className="text-sm text-muted-foreground">{sorted.length} שורות</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">מדריך/ה משובץ/ת</th>
              <th className="px-3 py-2.5 whitespace-nowrap">מסגרת</th>
              <th className="px-2 py-2.5 text-center whitespace-nowrap">כמות שיעורים</th>
              <th className="px-3 py-2.5 whitespace-nowrap">כתובת</th>
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
              <th className="px-3 py-2.5 whitespace-nowrap">משך שיעור</th>
              <th className="px-3 py-2.5 whitespace-nowrap">תאריך התחלה</th>
              <th className="px-3 py-2.5 whitespace-nowrap">חוג</th>
              <th className="px-3 py-2.5 whitespace-nowrap">סטטוס</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-muted-foreground">
                  אין שיעורים תואמים
                </td>
              </tr>
            ) : (
              sorted.map((n) => {
                const allEntries = assignedByNeed.get(n.id) ?? [];
                const instructorEntries =
                  instructorFilter.length > 0
                    ? allEntries.filter((e) => instructorFilter.includes(e.name))
                    : allEntries;
                return (
                  <tr
                    key={n.id}
                    onClick={() => setEditingNeed(n)}
                    className="cursor-pointer hover:bg-muted/40"
                  >
                    <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
                      {instructorEntries.length > 0
                        ? instructorEntries.map((e) => e.name + (e.confirmed ? "" : " (טרם אושר)")).join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {n.framework ?? "—"}
                      {n.framework_name ? ` · ${n.framework_name}` : ""}
                    </td>
                    <td className="px-2 py-2.5 align-top text-center text-muted-foreground">{n.lessons_count}</td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{n.address ?? "—"}</td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{n.region ?? "—"}</td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {dayLabel(n.day_of_week)} · {timePeriodLabel(n.time_period)}
                      {n.start_time ? ` (${n.start_time})` : ""}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {n.lesson_duration ? `${n.lesson_duration} דק'` : "—"}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {n.start_date ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{n.field ?? "—"}</td>
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[n.status as NeedStatus]}`}
                      >
                        {NEED_STATUS[n.status as NeedStatus]}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingNeed && <NeedEditModal need={editingNeed} onClose={() => setEditingNeed(null)} />}
    </div>
  );
}
