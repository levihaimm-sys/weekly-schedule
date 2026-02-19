"use client";

import { useState } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { updateLesson, updateRecurringSchedule, applyPermanentChange, deleteRecurringScheduleItem } from "@/lib/actions/schedule";
import { useRouter } from "next/navigation";
import { DAYS_HEBREW } from "@/lib/utils/constants";

interface LessonData {
  id: string;
  recurring_item_id?: string | null;
  start_time: string;
  status?: string;
  change_notes?: string | null;
  instructor?: { id: string; full_name: string } | null;
  substitute_instructor?: { id: string; full_name: string } | null;
  location?: { id: string; name: string; city: string } | null;
  lesson_date?: string;
  day_of_week?: number;
  group_name?: string | null;
}

interface LessonEditDialogProps {
  item: LessonData;
  instructors: { id: string; full_name: string }[];
  mode: "lesson" | "recurring";
  open: boolean;
  onClose: () => void;
}

type SaveScope = null | "temporary" | "permanent";

export function LessonEditDialog({
  item,
  instructors,
  mode,
  open,
  onClose,
}: LessonEditDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scopeChoice, setScopeChoice] = useState<SaveScope>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [instructorId, setInstructorId] = useState(item.instructor?.id ?? "");
  const [startTime, setStartTime] = useState(item.start_time?.slice(0, 5) ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(item.day_of_week ?? 0);
  const [lessonDate, setLessonDate] = useState(item.lesson_date ?? "");
  const [status, setStatus] = useState(item.status ?? "scheduled");
  const [changeNotes, setChangeNotes] = useState(item.change_notes ?? "");

  if (!open) return null;

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteRecurringScheduleItem(item.id);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("שגיאה במחיקת השיעור");
    }
    setLoading(false);
  }

  async function handleSave(scope?: "temporary" | "permanent") {
    // For lesson mode: first click shows scope dialog, second click saves
    if (mode === "lesson" && !scope) {
      setScopeChoice("temporary"); // show scope chooser
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "recurring" || scope === "permanent") {
        if (mode === "recurring") {
          // Direct master schedule update
          const result = await updateRecurringSchedule(item.id, {
            instructor_id: instructorId || null,
            start_time: startTime ? `${startTime}:00` : undefined,
            day_of_week: dayOfWeek !== item.day_of_week ? dayOfWeek : undefined,
          });
          if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
        } else {
          // Permanent change from weekly view: update recurring + all future lessons
          const result = await applyPermanentChange(
            item.recurring_item_id!,
            item.id,
            {
              instructor_id: instructorId || null,
              start_time: startTime ? `${startTime}:00` : undefined,
            }
          );
          if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
          }
        }
      } else {
        // Temporary change: update only this lesson instance
        const result = await updateLesson(item.id, {
          instructor_id: instructorId || null,
          start_time: startTime ? `${startTime}:00` : undefined,
          lesson_date: lessonDate || undefined,
          status,
          change_notes: changeNotes || undefined,
        });
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }

      router.refresh();
      onClose();
    } catch {
      setError("שגיאה בשמירה");
    }
    setLoading(false);
  }

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
        <div className="mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-destructive">מחיקת שיעור קבוע</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            האם אתה בטוח שברצונך למחוק את השיעור הזה מהלוח הקבוע?
          </p>
          <div className="mt-2 rounded-lg bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">
              ⚠️ פעולה זו תמחק גם את כל השיעורים העתידיים שנוצרו מהשיעור הקבוע הזה!
            </p>
          </div>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <Trash2 size={14} />
              מחק לצמיתות
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scope chooser dialog (permanent vs temporary)
  if (scopeChoice !== null && mode === "lesson") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold">סוג השינוי</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            האם לעדכן רק את השיעור הזה או לשנות את הלוח הקבוע?
          </p>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 space-y-3">
            <button
              onClick={() => handleSave("temporary")}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <div className="font-bold">שינוי זמני</div>
              <div className="text-xs text-muted-foreground">
                רק לשבוע הזה. בשבוע הבא יחזור ללוח הקבוע
              </div>
            </button>

            <button
              onClick={() => handleSave("permanent")}
              disabled={loading || !item.recurring_item_id}
              className="w-full rounded-lg border-2 border-secondary bg-secondary/5 px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/10 disabled:opacity-50"
            >
              <div className="font-bold text-[#1C1917]">שינוי קבוע</div>
              <div className="text-xs text-muted-foreground">
                ישנה את הלוח הקבוע ואת כל השיעורים העתידיים
              </div>
            </button>
          </div>

          <button
            onClick={() => setScopeChoice(null)}
            className="mt-3 w-full rounded-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            חזור
          </button>

          {loading && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              שומר...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {mode === "recurring" ? "עריכת שיעור קבוע" : "עריכת שיעור"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {/* Location info (read-only) */}
        <div className="mt-3 rounded-lg bg-muted p-3">
          <p className="font-medium">{item.location?.name}</p>
          <p className="text-sm text-muted-foreground">{item.location?.city}</p>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 space-y-4">
          {/* Instructor */}
          <div>
            <label className="mb-1 block text-sm font-medium">מדריך</label>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="">ללא מדריך</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label className="mb-1 block text-sm font-medium">שעה</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          {/* Day of week (only for recurring mode) */}
          {mode === "recurring" && (
            <div>
              <label className="mb-1 block text-sm font-medium">יום</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              >
                {DAYS_HEBREW.slice(0, 6).map((day, i) => (
                  <option key={i} value={i}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date (only for lesson mode) */}
          {mode === "lesson" && (
            <div>
              <label className="mb-1 block text-sm font-medium">תאריך</label>
              <input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
          )}

          {/* Status (only for lesson mode) */}
          {mode === "lesson" && (
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
          )}

          {/* Notes (only for lesson mode) */}
          {mode === "lesson" && (
            <div>
              <label className="mb-1 block text-sm font-medium">הערות</label>
              <input
                type="text"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="הערה לשינוי..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => handleSave()}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {mode === "recurring" ? "שמור שינוי קבוע" : "שמור"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              ביטול
            </button>
          </div>

          {/* Delete button - only for recurring schedule */}
          {mode === "recurring" && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 size={14} />
              מחק שיעור קבוע
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
