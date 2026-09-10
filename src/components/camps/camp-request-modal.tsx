"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2, Trash2 } from "lucide-react";
import { updateCampRequest, deleteCampRequest } from "@/lib/actions/camps";
import type { CampRequestWithGroups } from "@/types/database";

export function CampRequestModal({ request, onClose }: { request: CampRequestWithGroups; onClose: () => void }) {
  const router = useRouter();
  const [clientName, setClientName] = useState(request.client_name ?? "");
  const [area, setArea] = useState(request.area);
  const [campDate, setCampDate] = useState(request.camp_date);
  const [numGroups, setNumGroups] = useState(String(request.num_groups));
  const [startTimeNote, setStartTimeNote] = useState(request.start_time_note ?? "");
  const [notes, setNotes] = useState(request.notes ?? "");

  const [isPending, setIsPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reducingGroups = Number(numGroups) < request.num_groups;
  const removedAssignedCount = reducingGroups
    ? request.groups.filter((g) => g.group_number > Number(numGroups) && g.candidates.length > 0).length
    : 0;

  async function handleSave() {
    setError(null);
    setIsPending(true);
    try {
      const result = await updateCampRequest(request.id, {
        client_name: clientName,
        area,
        camp_date: campDate,
        num_groups: Number(numGroups) || 1,
        start_time_note: startTimeNote,
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
      await deleteCampRequest(request.id);
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
        className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">עריכת בקשת קייטנה</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="לקוח (לא חובה)">
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="אזור / מיקום">
            <input value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
          </Field>
          <Field label="תאריך">
            <input type="date" value={campDate} onChange={(e) => setCampDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="כמות קבוצות">
            <input
              type="number"
              min={1}
              value={numGroups}
              onChange={(e) => setNumGroups(e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="שעת התחלה (טקסט חופשי)">
              <input value={startTimeNote} onChange={(e) => setStartTimeNote(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="הערות">
              <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        {removedAssignedCount > 0 && (
          <p className="mt-2 text-sm text-amber-700">
            שים לב: הקטנת כמות הקבוצות תמחק {removedAssignedCount} קבוצות עם מועמדים/ות משובצים/ות
          </p>
        )}
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
              מחק בקשה
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
