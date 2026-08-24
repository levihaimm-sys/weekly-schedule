"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { DAYS_HEBREW, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { StaffingNeed } from "@/types/database";

const NOT_SPECIFIED = "לא צוין";

const STATUS_TEXT_COLORS: Record<NeedStatus, string> = {
  open: "text-blue-700",
  partially_filled: "text-amber-700",
  filled: "text-green-700",
};

export function SummaryTab({ needs }: { needs: StaffingNeed[] }) {
  const [regionFilter, setRegionFilter] = usePersistedState<string[]>("staffing-summary-region", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("staffing-summary-client", []);
  const [fieldFilter, setFieldFilter] = usePersistedState<string[]>("staffing-summary-field", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("staffing-summary-framework", []);
  const [dayFilter, setDayFilter] = usePersistedState<string[]>("staffing-summary-day", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("staffing-summary-status", []);

  const hasActiveFilters =
    regionFilter.length > 0 ||
    clientFilter.length > 0 ||
    fieldFilter.length > 0 ||
    frameworkFilter.length > 0 ||
    dayFilter.length > 0 ||
    statusFilter.length > 0;

  function clearFilters() {
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
  const frameworkOptions = (Array.from(new Set(needs.map((n) => n.framework).filter(Boolean))) as string[]).sort(
    sortHe
  );

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
      return true;
    });
  }, [needs, regionFilter, clientFilter, fieldFilter, frameworkFilter, statusFilter, dayFilter]);

  // Region -> field -> {open, partially_filled, filled} (each counted as lessons_count, not row count).
  const rows = useMemo(() => {
    const byRegion = new Map<string, Map<string, Record<NeedStatus, number>>>();

    for (const n of filtered) {
      const region = n.region?.trim() || NOT_SPECIFIED;
      const field = n.field?.trim() || NOT_SPECIFIED;
      const status = n.status as NeedStatus;

      if (!byRegion.has(region)) byRegion.set(region, new Map());
      const byField = byRegion.get(region)!;
      if (!byField.has(field)) byField.set(field, { open: 0, partially_filled: 0, filled: 0 });
      byField.get(field)![status] += n.lessons_count;
    }

    const sortRegion = (a: string, b: string) => {
      if (a === NOT_SPECIFIED) return 1;
      if (b === NOT_SPECIFIED) return -1;
      return a.localeCompare(b, "he");
    };
    const sortField = sortRegion;

    return Array.from(byRegion.entries())
      .sort(([a], [b]) => sortRegion(a, b))
      .map(([region, byField]) => ({
        region,
        fields: Array.from(byField.entries())
          .sort(([a], [b]) => sortField(a, b))
          .map(([field, counts]) => ({ field, counts })),
      }));
  }, [filtered]);

  const grandTotal = filtered.reduce((sum, n) => sum + n.lessons_count, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <span className="text-sm text-muted-foreground">{grandTotal} שיעורים</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">ישוב</th>
              <th className="px-3 py-2.5 whitespace-nowrap">תחום</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap">{NEED_STATUS.open}</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap">{NEED_STATUS.partially_filled}</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap">{NEED_STATUS.filled}</th>
              <th className="px-3 py-2.5 text-center whitespace-nowrap font-bold">סה&quot;כ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-muted-foreground">
                  אין שיעורים תואמים
                </td>
              </tr>
            ) : (
              rows.map(({ region, fields }) =>
                fields.map(({ field, counts }, i) => {
                  const rowTotal = counts.open + counts.partially_filled + counts.filled;
                  return (
                    <tr key={`${region}||${field}`}>
                      {i === 0 && (
                        <td
                          rowSpan={fields.length}
                          className="border-e border-border px-3 py-2.5 align-top font-medium whitespace-nowrap"
                        >
                          {region}
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{field}</td>
                      <td className={`px-3 py-2.5 text-center ${STATUS_TEXT_COLORS.open}`}>
                        {counts.open > 0 ? counts.open : "—"}
                      </td>
                      <td className={`px-3 py-2.5 text-center ${STATUS_TEXT_COLORS.partially_filled}`}>
                        {counts.partially_filled > 0 ? counts.partially_filled : "—"}
                      </td>
                      <td className={`px-3 py-2.5 text-center ${STATUS_TEXT_COLORS.filled}`}>
                        {counts.filled > 0 ? counts.filled : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold">{rowTotal}</td>
                    </tr>
                  );
                })
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
