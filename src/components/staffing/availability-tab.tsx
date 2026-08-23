"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, Trash2, MapPin, Search } from "lucide-react";
import { DAYS_HEBREW, TIME_PERIODS, TimePeriod } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel } from "@/lib/utils/staffing";
import { addAvailability, deleteAvailability } from "@/lib/actions/staffing";
import type { StaffingAvailability } from "@/types/database";
import type { StaffingInstructor, StaffingCandidate } from "@/types/staffing";

interface Props {
  instructors: StaffingInstructor[];
  candidates: StaffingCandidate[];
  availability: StaffingAvailability[];
}

function personKey(instructorId: string | null, candidateId: string | null) {
  return instructorId ? `instructor:${instructorId}` : `candidate:${candidateId}`;
}

export function AvailabilityTab({ instructors, candidates, availability }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [personValue, setPersonValue] = useState("");
  const [region, setRegion] = useState("");
  const [dayValue, setDayValue] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("afternoon");
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");

  const existingRegions = Array.from(new Set(availability.map((a) => a.region))).sort((a, b) =>
    a.localeCompare(b, "he")
  );

  const people = useMemo(
    () => [
      ...instructors.map((i) => ({
        key: `instructor:${i.id}`,
        name: i.full_name,
        phone: i.phone,
        hint: i.work_cities,
      })),
      ...candidates.map((c) => ({
        key: `candidate:${c.id}`,
        name: `${c.first_name} ${c.last_name} (מועמד)`,
        phone: c.phone,
        hint: c.area,
      })),
    ],
    [instructors, candidates]
  );

  const groups = useMemo(() => {
    const map = new Map<string, StaffingAvailability[]>();
    for (const a of availability) {
      const key = personKey(a.instructor_id, a.candidate_id);
      map.set(key, [...(map.get(key) ?? []), a]);
    }
    return map;
  }, [availability]);

  const filteredPeople = people.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.hint ?? "").toLowerCase().includes(q);
  });

  async function handleAdd() {
    setError(null);
    if (!personValue) {
      setError("יש לבחור מדריך או מועמד");
      return;
    }
    const [kind, id] = personValue.split(":");
    setIsPending(true);
    const result = await addAvailability({
      instructor_id: kind === "instructor" ? id : null,
      candidate_id: kind === "candidate" ? id : null,
      region,
      day_of_week: dayValue === "" ? null : Number(dayValue),
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
    setPersonValue("");
    setRegion("");
    setDayValue("");
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
          {people.length} מדריכים/מועמדים | {availability.length} משבצות זמינות
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

      {addFormOpen && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
          <h3 className="mb-3 font-medium">זמינות חדשה</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">מדריך / מועמד</label>
                <select
                  value={personValue}
                  onChange={(e) => setPersonValue(e.target.value)}
                  className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">בחר...</option>
                  {people.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">אזור עבודה</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  list="staffing-regions"
                  placeholder="ראש העין"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-regions">
                  {existingRegions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">יום</label>
                <select
                  value={dayValue}
                  onChange={(e) => setDayValue(e.target.value)}
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">גמיש (לא נקבע)</option>
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

      <div className="grid gap-3 md:grid-cols-2">
        {filteredPeople.map((p) => {
          const slots = groups.get(p.key) ?? [];
          if (slots.length === 0 && search.trim()) return null;
          return (
            <div key={p.key} className="rounded-xl border border-border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.phone ?? "—"}
                    {p.hint ? ` · ${p.hint}` : ""}
                  </p>
                </div>
              </div>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">אין משבצות זמינות</p>
              ) : (
                <div className="space-y-1.5">
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                        s.status === "assigned"
                          ? "border-border bg-muted/30 text-muted-foreground"
                          : "border-green-200 bg-green-50 text-green-800"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        {s.region} · {dayLabel(s.day_of_week)} · {timePeriodLabel(s.time_period)}
                        {s.start_time ? ` (${s.start_time})` : ""}
                        {s.status === "assigned" && <span className="font-medium"> · משובץ</span>}
                      </span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-muted-foreground hover:text-red-600"
                        title="מחק"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
