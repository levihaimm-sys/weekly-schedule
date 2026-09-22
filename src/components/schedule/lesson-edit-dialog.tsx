"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Trash2, Copy, Search, ChevronDown, UserMinus } from "lucide-react";
import { updateLesson, updateRecurringSchedule, applyPermanentChange, deleteRecurringScheduleItem, bulkDeleteLessons, clearInstructorRequest, submitInstructorRequest, createLocation } from "@/lib/actions/schedule";
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
  instructor_request_type?: string | null;
  instructor_notes?: string | null;
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
  // Only needed for mode="recurring", to offer a city/gan-name picker for the lesson's location.
  locations?: { id: string; name: string; city: string; street?: string | null }[];
  mode: "lesson" | "recurring";
  open: boolean;
  onClose: () => void;
  // Skips the permanent/temporary chooser in favor of a single one-time-change
  // confirmation — used by screens that shouldn't be able to touch the recurring master.
  hideScopeChoice?: boolean;
  // Shows a "duplicate" button that hands the current item back to the caller (which opens an
  // add/duplicate dialog prefilled with it) instead of editing in place.
  onDuplicate?: () => void;
}

type SaveScope = null | "temporary" | "permanent";

export function LessonEditDialog({
  item,
  instructors,
  locations = [],
  mode,
  open,
  onClose,
  hideScopeChoice,
  onDuplicate,
}: LessonEditDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scopeChoice, setScopeChoice] = useState<SaveScope>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAbsenceRemoval, setShowAbsenceRemoval] = useState(false);
  const [showAbsenceReport, setShowAbsenceReport] = useState(false);
  const [absenceNote, setAbsenceNote] = useState("");
  const [absenceLoading, setAbsenceLoading] = useState(false);
  const [absenceError, setAbsenceError] = useState<string | null>(null);
  const [absenceReported, setAbsenceReported] = useState(false);

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
  const [locationName, setLocationName] = useState(item.location?.name ?? "");
  const [locationCity, setLocationCity] = useState(item.location?.city ?? "");

  const locationNameOptions = useMemo(
    () => Array.from(new Set(locations.map((l) => l.name))).sort((a, b) => a.localeCompare(b, "he")),
    [locations]
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(locations.map((l) => l.city))).sort((a, b) => a.localeCompare(b, "he")),
    [locations]
  );

  // Whether this lesson instance is linked to a recurring template, so its master fields
  // (address, coordinator, framework, etc.) can be edited directly from the lesson view too.
  const hasRecurringLink = mode === "lesson" && !!item.recurring_item_id;

  if (!open) return null;

  // Resolves the gan/location by name+city (matching an existing one, or creating a new record
  // on the fly) — shared by the recurring-mode save and the lesson-mode master-field save.
  async function resolveLocationId(): Promise<{ id?: string; error?: string }> {
    const trimmedLocationName = locationName.trim();
    const trimmedLocationCity = locationCity.trim();
    if (!trimmedLocationName || !trimmedLocationCity) {
      return { error: "יש להזין שם גן/מסגרת ועיר" };
    }
    const existingMatch = locations.find(
      (l) =>
        l.name.trim().toLowerCase() === trimmedLocationName.toLowerCase() &&
        l.city.trim().toLowerCase() === trimmedLocationCity.toLowerCase()
    );
    if (existingMatch) return { id: existingMatch.id };

    const locResult = await createLocation({ name: trimmedLocationName, city: trimmedLocationCity });
    if (locResult.error || !locResult.id) {
      return { error: locResult.error ?? "שגיאה ביצירת המיקום" };
    }
    return { id: locResult.id };
  }

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
    // Extended fields (address, coordinator, framework, etc.) are editable for any lesson-mode
    // item, not just ones linked to a recurring template — they live on the recurring_schedule
    // row when linked, or directly on the lesson row for a one-off lesson. Either way, saving
    // them is independent of whichever scope is picked below for the instructor/time fields.
    // group_name and notes only exist as columns on recurring_schedule, so they only apply when
    // there's a recurring template to write to.
    const isLessonMode = mode === "lesson";
    const groupNameChanged = hasRecurringLink && groupName.trim() !== (item.group_name ?? "").trim();
    const addressChanged = isLessonMode && address.trim() !== (item.address ?? "").trim();
    const clientNameChanged = isLessonMode && clientName.trim() !== (item.client_name ?? "").trim();
    const contactNameChanged = isLessonMode && contactName.trim() !== (item.contact_name ?? "").trim();
    const managerNameChanged = isLessonMode && managerName.trim() !== (item.manager_name ?? "").trim();
    const managerPhoneChanged = isLessonMode && managerPhone.trim() !== (item.manager_phone ?? "").trim();
    const fieldChanged = isLessonMode && field.trim() !== (item.field ?? "").trim();
    const frameworkChanged = isLessonMode && framework.trim() !== (item.framework ?? "").trim();
    const frameworkNameChanged = isLessonMode && frameworkName.trim() !== (item.framework_name ?? "").trim();
    const lessonDurationChanged =
      isLessonMode &&
      lessonDuration.trim() !== (item.lesson_duration != null ? String(item.lesson_duration) : "");
    const lessonsCountChanged =
      isLessonMode &&
      lessonsCount.trim() !== (item.lessons_count != null ? String(item.lessons_count) : "");
    const notesChanged = hasRecurringLink && notes.trim() !== (item.notes ?? "").trim();
    const locationChanged =
      isLessonMode &&
      (locationName.trim() !== (item.location?.name ?? "").trim() ||
        locationCity.trim() !== (item.location?.city ?? "").trim());
    const masterFieldsChanged =
      groupNameChanged ||
      addressChanged ||
      clientNameChanged ||
      contactNameChanged ||
      managerNameChanged ||
      managerPhoneChanged ||
      fieldChanged ||
      frameworkChanged ||
      frameworkNameChanged ||
      lessonDurationChanged ||
      lessonsCountChanged ||
      notesChanged ||
      locationChanged;
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
      if (mode === "lesson" && masterFieldsChanged) {
        let locationId: string | undefined;
        if (locationChanged) {
          const resolved = await resolveLocationId();
          if (resolved.error) {
            setError(resolved.error);
            setLoading(false);
            return;
          }
          locationId = resolved.id;
        }

        if (hasRecurringLink) {
          // Linked to a recurring template — these fields live on that row, so update it directly.
          const masterResult = await updateRecurringSchedule(item.recurring_item_id!, {
            location_id: locationId,
            group_name: groupName.trim() || null,
            address: address.trim() || null,
            client_name: clientName.trim() || null,
            contact_name: contactName.trim() || null,
            manager_name: managerName.trim() || null,
            manager_phone: managerPhone.trim() || null,
            field: field.trim() || null,
            framework: framework.trim() || null,
            framework_name: frameworkName.trim() || null,
            lesson_duration: lessonDuration.trim() ? Number(lessonDuration) : null,
            lessons_count: lessonsCount.trim() ? Number(lessonsCount) : null,
            notes: notes.trim() || null,
          });
          if (masterResult.error) {
            setError(masterResult.error);
            setLoading(false);
            return;
          }
        } else {
          // One-off lesson with no recurring template — these fields live directly on the
          // lesson row (group_name/notes don't, so they're excluded here).
          const lessonResult = await updateLesson(item.id, {
            location_id: locationId,
            address: address.trim() || null,
            client_name: clientName.trim() || null,
            contact_name: contactName.trim() || null,
            manager_name: managerName.trim() || null,
            manager_phone: managerPhone.trim() || null,
            field: field.trim() || null,
            framework: framework.trim() || null,
            framework_name: frameworkName.trim() || null,
            lesson_duration: lessonDuration.trim() ? Number(lessonDuration) : null,
            lessons_count: lessonsCount.trim() ? Number(lessonsCount) : null,
          });
          if (lessonResult.error) {
            setError(lessonResult.error);
            setLoading(false);
            return;
          }
        }
      }

      if (mode === "recurring") {
        // Resolve the gan/location by name+city (matching an existing one, or creating a new
        // record on the fly) — mirrors the same match-or-create flow used when adding a lesson.
        let locationId: string | undefined;
        const recurringLocationChanged =
          locationName.trim() !== (item.location?.name ?? "").trim() ||
          locationCity.trim() !== (item.location?.city ?? "").trim();
        if (recurringLocationChanged) {
          const resolved = await resolveLocationId();
          if (resolved.error) {
            setError(resolved.error);
            setLoading(false);
            return;
          }
          locationId = resolved.id;
        }

        // Direct master schedule update
        const result = await updateRecurringSchedule(item.id, {
          location_id: locationId,
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

  async function handleReportAbsence() {
    if (!absenceNote.trim()) {
      setAbsenceError("יש להזין הערה");
      return;
    }
    setAbsenceLoading(true);
    setAbsenceError(null);
    const result = await submitInstructorRequest(item.id, "absence", absenceNote.trim());
    setAbsenceLoading(false);
    if (result.error) {
      setAbsenceError(result.error);
      return;
    }
    setShowAbsenceReport(false);
    setAbsenceReported(true);
    router.refresh();
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

  // One-time-change confirmation (screens that hide the permanent/temporary choice)
  if (scopeChoice !== null && mode === "lesson" && hideScopeChoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold">שינוי חד פעמי בלבד</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            השינוי יחול רק על השיעור הזה. בשבוע הבא הוא יחזור ללוח הקבוע.
          </p>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleSave("temporary")}
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              אישור
            </button>
            <button
              onClick={() => setScopeChoice(null)}
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

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 space-y-4">
          {/* Framework name — editable directly in recurring mode, or in lesson mode when this
              instance is linked to a recurring template (this always updates the template, so
              it applies from here on regardless of instructor/time scope) */}
          {(mode === "recurring" || (hasRecurringLink && item.group_name !== undefined)) && (
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

          {/* Full field set — for the fixed (recurring) schedule and for any lesson instance.
              When linked to a recurring template, saving these updates that row directly;
              otherwise they update the one-off lesson row itself. */}
          {(mode === "recurring" || mode === "lesson") && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium">שם הגן / מסגרת</label>
                <input
                  type="text"
                  list="recurring-edit-location-name-options"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <datalist id="recurring-edit-location-name-options">
                  {locationNameOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">עיר</label>
                <input
                  type="text"
                  list="recurring-edit-location-city-options"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                />
                <datalist id="recurring-edit-location-city-options">
                  {cityOptions.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                <p className="mt-1 text-xs text-muted-foreground">
                  אפשר לבחור עיר מהרשימה או להקליד עיר חדשה — מיקום חדש ייווצר אוטומטית אם השילוב לא קיים.
                </p>
              </div>
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
              {/* notes only exists as a column on recurring_schedule, not on a one-off lesson */}
              {(mode === "recurring" || hasRecurringLink) && (
                <div>
                  <label className="mb-1 block text-sm font-medium">הערות</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  />
                </div>
              )}
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

          {/* Absence report — lets an admin mark a lesson as an instructor-reported absence,
              exactly like when the instructor submits it herself from her app. */}
          {mode === "lesson" && (
            <div>
              {item.instructor_absence_request || absenceReported ? (
                <div className="rounded-xl bg-warning/10 px-3 py-2">
                  <span className="text-sm font-bold text-foreground">
                    📢 {item.instructor_request_type === "absence" || absenceReported ? "חיסור צפוי" : "בקשה"} נשלחה
                  </span>
                  {item.instructor_notes && (
                    <span className="text-sm font-medium text-foreground/80"> - {item.instructor_notes}</span>
                  )}
                </div>
              ) : !showAbsenceReport ? (
                <button
                  type="button"
                  onClick={() => setShowAbsenceReport(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                >
                  <UserMinus size={15} />
                  סמן חיסור (המדריכה הודיעה)
                </button>
              ) : (
                <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-3 space-y-2">
                  <label className="block text-sm font-medium">סיבת החיסור</label>
                  <textarea
                    value={absenceNote}
                    onChange={(e) => setAbsenceNote(e.target.value)}
                    placeholder="למשל: מחלה, אירוע משפחתי..."
                    rows={2}
                    autoFocus
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  {absenceError && <p className="text-sm text-destructive">{absenceError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReportAbsence}
                      disabled={absenceLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
                    >
                      {absenceLoading && <Loader2 size={14} className="animate-spin" />}
                      שלח דיווח
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAbsenceReport(false); setAbsenceNote(""); setAbsenceError(null); }}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              )}
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

          {onDuplicate && (
            <button
              onClick={onDuplicate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Copy size={14} />
              שכפל שיעור
            </button>
          )}

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
