"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2, Trash2 } from "lucide-react";
import { DAYS_HEBREW, TIME_PERIODS, TimePeriod } from "@/lib/utils/constants";
import { updateNeed, deleteNeed } from "@/lib/actions/staffing";
import type { StaffingNeed } from "@/types/database";

export function NeedEditModal({ need, onClose }: { need: StaffingNeed; onClose: () => void }) {
  const router = useRouter();
  const [clientName, setClientName] = useState(need.client_name);
  const [region, setRegion] = useState(need.region ?? "");
  const [locationName, setLocationName] = useState(need.location_name ?? "");
  const [address, setAddress] = useState(need.address ?? "");
  const [managerName, setManagerName] = useState(need.manager_name ?? "");
  const [contactName, setContactName] = useState(need.contact_name ?? "");
  const [framework, setFramework] = useState(need.framework ?? "");
  const [frameworkName, setFrameworkName] = useState(need.framework_name ?? "");
  const [field, setField] = useState(need.field ?? "");
  const [dayValue, setDayValue] = useState(need.day_of_week === null ? "" : String(need.day_of_week));
  const [timePeriod, setTimePeriod] = useState<TimePeriod | "">((need.time_period as TimePeriod) ?? "");
  const [startTime, setStartTime] = useState(need.start_time ?? "");
  const [startDate, setStartDate] = useState(need.start_date ?? "");
  const [lessonDuration, setLessonDuration] = useState(String(need.lesson_duration ?? 40));
  const [lessonsCount, setLessonsCount] = useState(String(need.lessons_count));
  const [notes, setNotes] = useState(need.notes ?? "");

  const [isPending, setIsPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    setIsPending(true);
    try {
      const result = await updateNeed(need.id, {
        client_name: clientName,
        region,
        location_name: locationName,
        address,
        manager_name: managerName,
        contact_name: contactName,
        framework,
        framework_name: frameworkName,
        field,
        day_of_week: dayValue === "" ? null : Number(dayValue),
        time_period: timePeriod || null,
        start_time: startTime,
        start_date: startDate,
        lesson_duration: Number(lessonDuration) || 40,
        lessons_count: Number(lessonsCount) || 1,
        notes,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשמירה");
    } finally {
      setIsPending(false);
    }
  }

  async function handleDelete() {
    setIsPending(true);
    try {
      await deleteNeed(need.id);
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה במחיקה");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">עריכת שיעור נדרש</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="שם לקוח">
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="אזור">
            <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
          </Field>
          <Field label="שם גן/מתחם">
            <input value={locationName} onChange={(e) => setLocationName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="כתובת">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </Field>
          <Field label="גננת/רכזת">
            <input value={managerName} onChange={(e) => setManagerName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="איש קשר">
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="מסגרת">
            <input value={framework} onChange={(e) => setFramework(e.target.value)} className={inputClass} />
          </Field>
          <Field label="שם המסגרת">
            <input value={frameworkName} onChange={(e) => setFrameworkName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="חוג / תחום">
            <input value={field} onChange={(e) => setField(e.target.value)} className={inputClass} />
          </Field>
          <Field label="כמות שיעורים">
            <input
              type="number"
              min={1}
              value={lessonsCount}
              onChange={(e) => setLessonsCount(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="יום">
            <select value={dayValue} onChange={(e) => setDayValue(e.target.value)} className={inputClass}>
              <option value="">טרם נקבע</option>
              {DAYS_HEBREW.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="חלק יום">
            <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as TimePeriod)} className={inputClass}>
              <option value="">—</option>
              {(Object.keys(TIME_PERIODS) as TimePeriod[]).map((p) => (
                <option key={p} value={p}>
                  {TIME_PERIODS[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="שעת התחלה">
            <input value={startTime} onChange={(e) => setStartTime(e.target.value)} dir="ltr" className={inputClass} />
          </Field>
          <Field label="תאריך התחלה">
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="משך שיעור (דק')">
            <input
              type="number"
              min={1}
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="הערות">
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </Field>
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
              מחק שיעור
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
