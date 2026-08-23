"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2, Trash2 } from "lucide-react";
import { DAYS_HEBREW, TIME_PERIODS, TimePeriod } from "@/lib/utils/constants";
import { updateAvailabilityGroup, deleteAvailability } from "@/lib/actions/staffing";
import type { StaffingAvailability } from "@/types/database";

const FLEXIBLE = "flex";
const WORK_DAYS = [0, 1, 2, 3, 4];

export function AvailabilityRowEditModal({
  name,
  region,
  slots,
  onClose,
}: {
  name: string;
  region: string;
  slots: StaffingAvailability[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [instructorName, setInstructorName] = useState(name);
  const [regionValue, setRegionValue] = useState(region);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    slots.map((s) => (s.day_of_week === null ? FLEXIBLE : String(s.day_of_week)))
  );
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(slots[0]?.time_period ?? "afternoon");
  const [startTime, setStartTime] = useState(slots[0]?.start_time ?? "");
  const [notes, setNotes] = useState(slots[0]?.notes ?? "");

  const [isPending, setIsPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(value: string) {
    setSelectedDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  async function handleSave() {
    setError(null);
    if (selectedDays.length === 0) {
      setError("יש לבחור לפחות יום אחד (או גמיש)");
      return;
    }
    setIsPending(true);
    const result = await updateAvailabilityGroup({
      slotIds: slots.map((s) => s.id),
      instructor_name: instructorName,
      region: regionValue,
      days: selectedDays.map((d) => (d === FLEXIBLE ? null : Number(d))),
      time_period: timePeriod,
      start_time: startTime,
      notes,
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onClose();
  }

  async function handleDeleteAll() {
    setIsPending(true);
    for (const s of slots) {
      await deleteAvailability(s.id);
    }
    setIsPending(false);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">עריכת זמינות מדריך/ה</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">שם מדריך</label>
            <input
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">אזור עבודה</label>
            <input
              value={regionValue}
              onChange={(e) => setRegionValue(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">ימי עבודה (ניתן לבחור כמה יחד)</label>
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

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">חלק יום</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((p) => (
                  <option key={p} value={p}>
                    {TIME_PERIODS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">שעה מדויקת (לא חובה)</label>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                dir="ltr"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">הערות</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAll}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                אישור מחיקת כל השורה
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              מחק שורה
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
