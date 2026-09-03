"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Trash2, Search, ChevronDown } from "lucide-react";
import { updateLesson, updateRecurringSchedule, applyPermanentChange, deleteRecurringScheduleItem, bulkDeleteLessons, clearInstructorRequest } from "@/lib/actions/schedule";
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
  location?: { id: string; name: string; city: string; street?: string | null } | null;
  lesson_date?: string;
  day_of_week?: number;
  group_name?: string | null;
  address?: string | null;
  client_name?: string | null;
  contact_name?: string | null;
  instructor_absence_request?: boolean;
  framework?: string | null;
  framework_name?: string | null;
  field?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  lesson_duration?: number | null;
  lessons_count?: number | null;
  notes?: string | null;
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
  const [showAbsenceRemoval, setShowAbsenceRemoval] = useState(false);

  const [instructorId, setInstructorId] = useState(item.instructor?.id ?? "");
  const [startTime, setStartTime] = useState(item.start_time?.slice(0, 5) ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(item.day_of_week ?? 0);
  const [lessonDate, setLessonDate] = useState(item.lesson_date ?? "");
  const [status, setStatus] = useState(item.status ?? "scheduled");
  const [changeNotes, setChangeNotes] = useState(item.change_notes ?? "");
  const [groupName, setGroupName] = useState(item.group_name ?? "");
  const [address, setAddress] = useState(item.address ?? "");
  const [clientName, setClientName] = useState(item.client_name ?? "");
  const [contactName, setContactName] = useState(item.contact_name ?? "");
  const [managerName, setManagerName] = useState(item.manager_name ?? "");
  const [managerPhone, setManagerPhone] = useState(item.manager_phone ?? "");
  const [framework, setFramework] = useState(item.framework ?? "");
  const [frameworkName, setFrameworkName] = useState(item.framework_name ?? "");
  const [field, setField] = useState(item.field ?? "");
  const [lessonDuration, setLessonDuration] = useState(
    item.lesson_duration != null ? String(item.lesson_duration) : ""
  );
  const [lessonsCount, setLessonsCount] = useState(
    item.lessons_count != null ? String(item.lessons_count) : ""
  );
  const [notes, setNotes] = useState(item.notes ?? "");

  if (!open) return null;

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      const result =
        mode === "recurring"
          ? await deleteRecurringScheduleItem(item.id)
          : await bulkDeleteLessons([item.id]);
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
    // The framework name lives on the recurring template, not the lesson instance, so renaming
    // it is always a permanent change — independent of whichever scope is picked below for the
    // instructor/time fields.
    const groupNameChanged =
      mode === "lesson" && !!item.recurring_item_id && groupName.trim() !== (item.group_name ?? "").trim();
    const otherFieldsChanged =
      instructorId !== (item.instructor?.id ?? "") ||
      startTime !== (item.start_time?.slice(0, 5) ?? "") ||
      (mode === "lesson" &&
        (lessonDate !== (item.lesson_date ?? "") ||
          status !== (item.status ?? "scheduled") ||
          changeNotes !== (item.change_notes ?? "")));

    // For lesson mode: first click shows scope dialog (only when instructor/time/status/etc.
    // actually changed), second click saves
    if (mode === "lesson" && !scope && otherFieldsChanged) {
      setScopeChoice("temporary"); // show scope chooser
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (groupNameChanged) {
        const groupNameResult = await updateRecurringSchedule(item.recurring_item_id!, {
          group_name: groupName.trim() || null,
        });
        if (groupNameResult.error) {
          setError(groupNameResult.error);
          setLoading(false);
          return;
        }
      }

      if (mode === "recurring") {
        // Direct master schedule update
        const result = await updateRecurringSchedule(item.id, {
          instructor_id: instructorId || null,
          start_time: startTime ? `${startTime}:00` : undefined,
          day_of_week: dayOfWeek !== item.day_of_week ? dayOfWeek : undefined,
          group_name: groupName.trim() || null,
          address: address.trim() || null,
          client_name: clientName.trim() || null,
          contact_name: contactName.trim() || null,
          manager_name: managerName.trim() || null,
          manager_phone: managerPhone.trim() || null,
          framework: framework.trim() || null,
          framework_name: frameworkName.trim() || null,
          field: field.trim() || null,
          lesson_duration: lessonDuration.trim() ? Number(lessonDuration) : null,
          lessons_count: lessonsCount.trim() ? Number(lessonsCount) : null,
          notes: notes.trim() || null,
        });
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      } else if (scope === "permanent") {
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
      } else if (scope === "temporary" || otherFieldsChanged) {
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
      if (item.instructor_absence_request) {
        setShowAbsenceRemoval(true);
      } else {
        onClose();
      }
    } catch {
      setError("שגיאה בשמירה");
    }
    setLoading(false);
  }

  async function handleRemoveAbsence() {
    setLoading(true);
    const result = await clearInstructorRequest(item.id);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
    onClose();
  }

  // Absence removal prompt (shown after saving changes to an absence-tagged lesson)
  if (showAbsenceRemoval) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-orange-700">הסרת תגית חיסור</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            השיעור עודכן בהצלחה. האם להסיר את תגית החיסור מהשיעור?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            השיעור יסומן כשינוי במקום חיסור.
          </p>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleRemoveAbsence}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              הסר תגית חיסור
            </button>
            <button
              onClick={() => { router.refresh(); onClose(); }}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              השאר כחיסור
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
        <div className="mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-destructive">
            {mode === "recurring" ? "מחיקת שיעור קבוע" : "מחיקת שיעור"}
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "recurring"
              ? "האם אתה בטוח שברצונך למחוק את השיעור הזה מהלוח הקבוע?"
              : "האם אתה בטוח שברצונך למחוק את השיעור הזה?"}
          </p>
          {mode === "recurring" && (
            <div className="mt-2 rounded-lg bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">
                ⚠️ פעולה זו תמחק גם את כל השיעורים העתידיים שנוצרו מהשיעור הקבוע הזה!
              </p>
            </div>
          )}

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
      <div className="mx-4 w-full max-w-md rounded-xl bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {mode === "recurring" ? "עריכת שיעור קבוע" : "עריכת שיעור"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {/* Location info (read-only — the physical location record itself isn't edited here) */}
        <div className="mt-3 rounded-lg bg-muted p-3">
          <p className="font-medium">{item.location?.name}</p>
          <p className="text-sm text-muted-foreground">
            {(item.address || item.location?.street) && `${item.address || item.location?.street}, `}
            {item.location?.city}
          </p>
          {mode === "lesson" && (
            <>
              {item.client_name && <p className="mt-1 text-sm text-muted-foreground">לקוח: {item.client_name}</p>}
              {item.contact_name && <p className="text-sm text-muted-foreground">איש קשר: {item.contact_name}</p>}
              {item.manager_name && (
                <p className="text-sm text-muted-foreground">
                  גננת/רכזת: {item.manager_name}
                  {item.manager_phone ? ` · ${item.manager_phone}` : ""}
                </p>
              )}
              {item.field && <p className="text-sm text-muted-foreground">תחום: {item.field}</p>}
              {item.framework && <p className="text-sm text-muted-foreground">מסגרת: {item.framework}</p>}
              {(item.lesson_duration || item.lessons_count) && (
                <p className="text-sm text-muted-foreground">
                  {item.lesson_duration ? `${item.lesson_duration} דק'` : ""}
                  {item.lesson_duration && item.lessons_count ? " · " : ""}
                  {item.lessons_count ? `${item.lessons_count} שיעורים` : ""}
                </p>
              )}
              {item.notes && <p className="text-sm text-muted-foreground">הערות: {item.notes}</p>}
            </>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 space-y-4">
          {/* Framework/group name — editable directly in recurring mode, or in lesson mode when
              this instance is linked to a recurring template (renaming always updates the
              template, so it applies from here on regardless of instructor/time scope) */}
          {(mode === "recurring" || (mode === "lesson" && item.recurring_item_id && item.group_name !== undefined)) && (
            <div>
              <label className="mb-1 block text-sm font-medium">שם המסגרת</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="שם המסגרת / חוג"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>
          )}

          {/* Full field set — only for the fixed (recurring) schedule, where these live on the
              recurring_schedule row itself rather than a per-instance lesson */}
          {mode === "recurring" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">כתובת</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">לקוח</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">איש קשר</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">גננת/רכזת</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">טלפון גננת/רכזת</label>
                <input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-right"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">תחום</label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">מסגרת</label>
                <input
                  type="text"
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">שם מסגרת</label>
                <input
                  type="text"
                  value={frameworkName}
                  onChange={(e) => setFrameworkName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">משך שיעור (דק&apos;)</label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">מס&apos; שיעורים</label>
                  <input
                    type="number"
                    value={lessonsCount}
                    onChange={(e) => setLessonsCount(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">הערות</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
              </div>
            </>
          )}

          {/* Instructor */}
          <InstructorSearchSelect
            instructors={instructors}
            value={instructorId}
            onChange={setInstructorId}
          />

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

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {mode === "recurring" ? "מחק שיעור קבוע" : "מחק שיעור"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InstructorSearchSelect({
  instructors,
  value,
  onChange,
}: {
  instructors: { id: string; full_name: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return instructors;
    const term = search.trim().toLowerCase();
    return instructors.filter((i) => i.full_name.toLowerCase().includes(term));
  }, [instructors, search]);

  const selectedLabel = value
    ? instructors.find((i) => i.id === value)?.full_name ?? ""
    : "ללא מדריך";

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">מדריך</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        >
          <span className={value ? "" : "text-muted-foreground"}>{selectedLabel}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש מדריך..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {/* No instructor option */}
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === "" ? "bg-muted font-medium" : ""}`}
              >
                ללא מדריך
              </button>
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                  לא נמצאו מדריכים
                </div>
              ) : (
                filtered.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => { onChange(inst.id); setOpen(false); setSearch(""); }}
                    className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === inst.id ? "bg-muted font-medium" : ""}`}
                  >
                    {inst.full_name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
