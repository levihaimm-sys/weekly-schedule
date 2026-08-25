"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, Trash2, MapPin, Search, Upload, X } from "lucide-react";
import { DAYS_HEBREW, TIME_PERIODS, TimePeriod, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel } from "@/lib/utils/staffing";
import { addNeed, deleteNeed } from "@/lib/actions/staffing";
import { NeedsImportModal, SampleCsvButton } from "./needs-csv";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { NeedEditModal } from "./need-edit-modal";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { StaffingNeed } from "@/types/database";

interface Props {
  needs: StaffingNeed[];
}

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  partially_filled: "bg-amber-50 text-amber-700 border-amber-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

export function NeedsTab({ needs }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = usePersistedState("staffing-needs-search", "");
  const [editingNeed, setEditingNeed] = useState<StaffingNeed | null>(null);

  const [regionFilter, setRegionFilter] = usePersistedState<string[]>("staffing-needs-region", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("staffing-needs-client", []);
  const [fieldFilter, setFieldFilter] = usePersistedState<string[]>("staffing-needs-field", []);
  const [frameworkFilter, setFrameworkFilter] = usePersistedState<string[]>("staffing-needs-framework", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("staffing-needs-status", []);
  const [dayFilter, setDayFilter] = usePersistedState<string[]>("staffing-needs-day", []);

  const hasActiveFilters =
    search.trim() !== "" ||
    regionFilter.length > 0 ||
    clientFilter.length > 0 ||
    fieldFilter.length > 0 ||
    frameworkFilter.length > 0 ||
    statusFilter.length > 0 ||
    dayFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setRegionFilter([]);
    setClientFilter([]);
    setFieldFilter([]);
    setFrameworkFilter([]);
    setStatusFilter([]);
    setDayFilter([]);
  }

  const [clientName, setClientName] = useState("");
  const [region, setRegion] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [managerName, setManagerName] = useState("");
  const [contactName, setContactName] = useState("");
  const [framework, setFramework] = useState("");
  const [frameworkName, setFrameworkName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [lessonDuration, setLessonDuration] = useState("40");
  const [dayValue, setDayValue] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<TimePeriod | "">("");
  const [startTime, setStartTime] = useState("");
  const [field, setField] = useState("");
  const [lessonsCount, setLessonsCount] = useState("1");
  const [notes, setNotes] = useState("");

  const sortHe = (a: string, b: string) => a.localeCompare(b, "he");
  const existingRegions = (Array.from(new Set(needs.map((n) => n.region).filter(Boolean))) as string[]).sort(sortHe);
  const existingClientNames = Array.from(new Set(needs.map((n) => n.client_name))).sort(sortHe);
  const existingFields = (Array.from(new Set(needs.map((n) => n.field).filter(Boolean))) as string[]).sort(sortHe);
  const existingFrameworks = (Array.from(new Set(needs.map((n) => n.framework).filter(Boolean))) as string[]).sort(
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

  async function handleAdd() {
    setError(null);
    setIsPending(true);
    const result = await addNeed({
      client_name: clientName,
      region,
      location_name: locationName,
      address,
      manager_name: managerName,
      contact_name: contactName,
      framework,
      framework_name: frameworkName,
      start_date: startDate,
      lesson_duration: Number(lessonDuration) || 40,
      day_of_week: dayValue === "" ? null : Number(dayValue),
      time_period: timePeriod || null,
      start_time: startTime,
      field,
      lessons_count: Number(lessonsCount) || 1,
      notes,
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAddFormOpen(false);
    setClientName("");
    setRegion("");
    setLocationName("");
    setAddress("");
    setManagerName("");
    setContactName("");
    setFramework("");
    setFrameworkName("");
    setStartDate("");
    setLessonDuration("40");
    setDayValue("");
    setTimePeriod("");
    setStartTime("");
    setField("");
    setLessonsCount("1");
    setNotes("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteNeed(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{needs.length} שיעורים נדרשים</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לקוח / אזור / חוג"
              className={`w-52 rounded-lg border py-2 pe-3 ps-8 text-sm transition-colors ${
                search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
              }`}
            />
          </div>
          <SampleCsvButton />
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Upload size={14} />
            ייבוא CSV
          </button>
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            הוסף שיעור נדרש
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
          options={existingClientNames.map((c) => ({ value: c, label: c }))}
          selected={clientFilter}
          onChange={setClientFilter}
          placeholder="כל הלקוחות"
        />
        <MultiSelectFilter
          options={existingFields.map((f) => ({ value: f, label: f }))}
          selected={fieldFilter}
          onChange={setFieldFilter}
          placeholder="כל התחומים"
        />
        <MultiSelectFilter
          options={existingFrameworks.map((f) => ({ value: f, label: f }))}
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
      </div>

      {importOpen && (
        <NeedsImportModal
          onClose={() => setImportOpen(false)}
          onImported={() => router.refresh()}
        />
      )}

      {addFormOpen && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
          <h3 className="mb-3 font-medium">שיעור נדרש חדש</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שם לקוח</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  list="staffing-client-names"
                  placeholder="ראש העין צהרונים"
                  className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-client-names">
                  {existingClientNames.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">אזור</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  list="staffing-need-regions"
                  placeholder="ראש העין"
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-need-regions">
                  {existingRegions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שם גן/מתחם (לא חובה)</label>
                <input
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="פלג 304"
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">מנהל/ת</label>
                <input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="רינת 054-8646513"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">איש קשר</label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="משה כהן 050-1234567"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">מסגרת</label>
                <input
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  placeholder='בי"ס'
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שם המסגרת</label>
                <input
                  value={frameworkName}
                  onChange={(e) => setFrameworkName(e.target.value)}
                  placeholder="בית ספר עתידים"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">תאריך התחלה</label>
                <input
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="01/09/2026"
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">משך שיעור (דק&apos;)</label>
                <input
                  type="number"
                  min={1}
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">יום</label>
                <select
                  value={dayValue}
                  onChange={(e) => setDayValue(e.target.value)}
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">טרם נקבע</option>
                  {DAYS_HEBREW.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">חלק יום</label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((p) => (
                    <option key={p} value={p}>
                      {TIME_PERIODS[p]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שעה (לא חובה)</label>
                <input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="14:40"
                  dir="ltr"
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">חוג / תחום</label>
                <input
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  list="staffing-fields"
                  placeholder="תאטרון"
                  className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-fields">
                  {existingFields.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">כמות שיעורים</label>
                <input
                  type="number"
                  min={1}
                  value={lessonsCount}
                  onChange={(e) => setLessonsCount(e.target.value)}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">הערות</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות חופשיות, כתובת מדויקת וכו׳"
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

      <div className="space-y-2">
        {filtered.map((n) => (
          <div
            key={n.id}
            onClick={() => setEditingNeed(n)}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{n.client_name}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[n.status as NeedStatus]}`}>
                  {NEED_STATUS[n.status as NeedStatus]}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} />
                {n.region ?? "—"}
                {n.location_name ? ` · ${n.location_name}` : ""}
                {n.address ? ` · ${n.address}` : ""}
                {" · "}
                {dayLabel(n.day_of_week)} · {timePeriodLabel(n.time_period)}
                {n.start_time ? ` (${n.start_time})` : ""}
                {n.field ? ` · ${n.field}` : ""}
                {n.framework ? ` · ${n.framework}` : ""}
                {n.framework_name ? ` · ${n.framework_name}` : ""}
                {` · ${n.lessons_count} שיעורים`}
                {n.lesson_duration ? ` · ${n.lesson_duration} דק'` : ""}
                {n.manager_name ? ` · מנהל/ת: ${n.manager_name}` : ""}
                {n.contact_name ? ` · איש קשר: ${n.contact_name}` : ""}
                {n.start_date ? ` · תחילת פעילות: ${n.start_date}` : ""}
              </p>
              {n.notes && <p className="mt-0.5 text-xs text-muted-foreground">{n.notes}</p>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(n.id);
              }}
              className="shrink-0 text-muted-foreground hover:text-red-600"
              title="מחק"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">אין שיעורים נדרשים</p>}
      </div>

      {editingNeed && <NeedEditModal need={editingNeed} onClose={() => setEditingNeed(null)} />}
    </div>
  );
}
