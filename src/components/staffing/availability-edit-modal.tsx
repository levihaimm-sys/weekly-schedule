"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2, Trash2 } from "lucide-react";
import { DAYS_HEBREW, TIME_PERIODS, TimePeriod } from "@/lib/utils/constants";
import { updateAvailability, deleteAvailability } from "@/lib/actions/staffing";
import type { StaffingAvailability } from "@/types/database";

export function AvailabilityEditModal({ slot, onClose }: { slot: StaffingAvailability; onClose: () => void }) {
  const router = useRouter();
  const [instructorName, setInstructorName] = useState(slot.instructor_name);
  const [region, setRegion] = useState(slot.region);
  const [dayValue, setDayValue] = useState(slot.day_of_week === null ? "" : String(slot.day_of_week));
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(slot.time_period);
  const [startTime, setStartTime] = useState(slot.start_time ?? "");
  const [notes, setNotes] = useState(slot.notes ?? "");

  const [isPending, setIsPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsPending(true);
    const result = await updateAvailability(slot.id, {
      instructor_name: instructorName,
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
    router.refresh();
    onClose();
  }

  async function handleDelete() {
    setIsPending(true);
    await deleteAvailability(slot.id);
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
          <h2 className="font-semibold">עריכת זמינות</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">שם מדריך</label>
            <input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">אזור עבודה</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">יום</label>
              <select value={dayValue} onChange={(e) => setDayValue(e.target.value)} className={inputClass}>
                <option value="">גמיש (לא נקבע)</option>
                {DAYS_HEBREW.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">חלק יום</label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className={inputClass}
              >
                {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((p) => (
                  <option key={p} value={p}>
                    {TIME_PERIODS[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">שעה מדויקת (לא חובה)</label>
            <input value={startTime} onChange={(e) => setStartTime(e.target.value)} dir="ltr" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">הערות</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                אישור מחיקה
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
              מחק
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

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
