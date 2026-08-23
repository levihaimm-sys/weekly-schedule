"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, Trash2, MapPin, Search } from "lucide-react";
import { DAYS_HEBREW, TIME_PERIODS, TimePeriod, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel, clientLabel } from "@/lib/utils/staffing";
import { addNeed, deleteNeed } from "@/lib/actions/staffing";
import type { StaffingNeed } from "@/types/database";
import type { StaffingClient } from "@/types/staffing";

interface Props {
  clients: StaffingClient[];
  needs: StaffingNeed[];
}

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  partially_filled: "bg-amber-50 text-amber-700 border-amber-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

export function NeedsTab({ clients, needs }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [clientId, setClientId] = useState("");
  const [clientOverride, setClientOverride] = useState("");
  const [region, setRegion] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [dayValue, setDayValue] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<TimePeriod | "">("");
  const [startTime, setStartTime] = useState("");
  const [field, setField] = useState("");
  const [lessonsCount, setLessonsCount] = useState("1");
  const [notes, setNotes] = useState("");

  const existingRegions = Array.from(
    new Set([...needs.map((n) => n.region).filter(Boolean), ...clients.map((c) => c.region).filter(Boolean)])
  ) as string[];

  const existingFields = Array.from(new Set(needs.map((n) => n.field).filter(Boolean))) as string[];

  const filtered = useMemo(() => {
    if (!search.trim()) return needs;
    const q = search.toLowerCase();
    return needs.filter((n) => {
      const label = clientLabel(n, clients).toLowerCase();
      return (
        label.includes(q) ||
        (n.region ?? "").toLowerCase().includes(q) ||
        (n.location_name ?? "").toLowerCase().includes(q) ||
        (n.field ?? "").toLowerCase().includes(q)
      );
    });
  }, [needs, clients, search]);

  async function handleAdd() {
    setError(null);
    setIsPending(true);
    const result = await addNeed({
      client_id: clientId || null,
      client_name_override: clientId ? null : clientOverride,
      region,
      location_name: locationName,
      address,
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
    setClientId("");
    setClientOverride("");
    setRegion("");
    setLocationName("");
    setAddress("");
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
              className="w-52 rounded-lg border border-border bg-background py-2 pe-3 ps-8 text-sm"
            />
          </div>
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            הוסף שיעור נדרש
          </button>
        </div>
      </div>

      {addFormOpen && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
          <h3 className="mb-3 font-medium">שיעור נדרש חדש</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">לקוח קיים</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">— ללא (הזן שם ידנית) —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {!clientId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">שם לקוח (חופשי)</label>
                  <input
                    value={clientOverride}
                    onChange={(e) => setClientOverride(e.target.value)}
                    placeholder="ראש העין צהרונים"
                    className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
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
          <div key={n.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{clientLabel(n, clients)}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[n.status as NeedStatus]}`}>
                  {NEED_STATUS[n.status as NeedStatus]}
                </span>
              </div>
              <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={12} />
                {n.region ?? "—"}
                {n.location_name ? ` · ${n.location_name}` : ""}
                {" · "}
                {dayLabel(n.day_of_week)} · {timePeriodLabel(n.time_period)}
                {n.start_time ? ` (${n.start_time})` : ""}
                {n.field ? ` · ${n.field}` : ""}
                {` · ${n.lessons_count} שיעורים`}
              </p>
              {n.notes && <p className="mt-0.5 text-xs text-muted-foreground">{n.notes}</p>}
            </div>
            <button onClick={() => handleDelete(n.id)} className="shrink-0 text-muted-foreground hover:text-red-600" title="מחק">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">אין שיעורים נדרשים</p>}
      </div>
    </div>
  );
}
