"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { createManualLesson } from "@/lib/actions/schedule";
import { InstructorSearchSelect, LocationSearchSelect } from "./weekly-grid";

// Snapshot of an existing lesson's fields, used to prefill this dialog when duplicating
// a lesson instead of adding a brand-new one.
export interface WeeklyLessonSeed {
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string; street?: string | null } | null;
  address?: string | null;
  client_name?: string | null;
  contact_name?: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
}

export function AddLessonDialog({
  date,
  instructors,
  locations,
  seed,
  onClose,
}: {
  date: string;
  instructors: { id: string; full_name: string }[];
  locations: { id: string; name: string; city: string; street?: string | null }[];
  seed?: WeeklyLessonSeed | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [instructorId, setInstructorId] = useState(seed?.instructor?.id ?? "");
  const [locationId, setLocationId] = useState(seed?.location?.id ?? "");
  const [lessonDate, setLessonDate] = useState(seed?.lesson_date ?? date);
  const [startTime, setStartTime] = useState(seed?.start_time?.slice(0, 5) ?? "09:00");
  const [status, setStatus] = useState(seed?.status ?? "scheduled");
  const [changeNotes, setChangeNotes] = useState("");
  const [address, setAddress] = useState(seed?.address ?? "");
  const [clientName, setClientName] = useState(seed?.client_name ?? "");
  const [contactName, setContactName] = useState(seed?.contact_name ?? "");

  async function handleSubmit() {
    if (!locationId) {
      setError("יש לבחור גן / מיקום");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await createManualLesson({
        instructor_id: instructorId || null,
        location_id: locationId,
        lesson_date: lessonDate,
        start_time: startTime,
        status,
        change_notes: changeNotes || undefined,
        address: address || undefined,
        client_name: clientName || undefined,
        contact_name: contactName || undefined,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("שגיאה ביצירת השיעור");
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{seed ? "שכפול שיעור" : "הוספת שיעור"}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 space-y-4">
          {/* Instructor */}
          <InstructorSearchSelect
            instructors={instructors}
            value={instructorId}
            onChange={setInstructorId}
          />

          {/* Location */}
          <LocationSearchSelect
            locations={locations}
            value={locationId}
            onChange={setLocationId}
          />

          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">תאריך פעילות</label>
            <input
              type="date"
              value={lessonDate}
              onChange={(e) => setLessonDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-sm font-medium">שעת התחלה</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-sm font-medium">כתובת</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="כתובת (אופציונלי)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Client */}
          <div>
            <label className="mb-1 block text-sm font-medium">לקוח</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="שם לקוח (אופציונלי)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="mb-1 block text-sm font-medium">איש קשר</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="איש קשר (אופציונלי)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium">סטטוס</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="scheduled">מתוכנן</option>
              <option value="completed">הושלם</option>
              <option value="cancelled">בוטל</option>
              <option value="substitute">מחליף</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium">הערות</label>
            <input
              type="text"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="הערה לשיעור (אופציונלי)..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {seed ? "צור שיעור משוכפל" : "הוסף שיעור"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
