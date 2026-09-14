"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { X, Loader2, Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createRecurringScheduleItem, createLocation } from "@/lib/actions/schedule";
import { DAYS_HEBREW } from "@/lib/utils/constants";

export interface RecurringLessonSeed {
  day_of_week: number;
  start_time: string;
  group_name?: string | null;
  address?: string | null;
  client_name?: string | null;
  contact_name?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  framework?: string | null;
  framework_name?: string | null;
  field?: string | null;
  lesson_duration?: number | null;
  lessons_count?: number | null;
  notes?: string | null;
  instructor?: { id: string; full_name: string } | null;
  location?: { id: string; name: string; city: string } | null;
}

interface AddRecurringLessonDialogProps {
  open: boolean;
  onClose: () => void;
  instructors: { id: string; full_name: string }[];
  locations: { id: string; name: string; city: string; street?: string | null }[];
  // When present, the form is prefilled from an existing lesson (the "duplicate" flow).
  seed?: RecurringLessonSeed | null;
  defaultDayOfWeek?: number;
}

export function AddRecurringLessonDialog({
  open,
  onClose,
  instructors,
  locations,
  seed,
  defaultDayOfWeek,
}: AddRecurringLessonDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [instructorId, setInstructorId] = useState(seed?.instructor?.id ?? "");
  const [locationName, setLocationName] = useState(seed?.location?.name ?? "");
  const [locationCity, setLocationCity] = useState(seed?.location?.city ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(seed?.day_of_week ?? defaultDayOfWeek ?? 0);
  const [startTime, setStartTime] = useState(seed?.start_time?.slice(0, 5) ?? "09:00");
  const [groupName, setGroupName] = useState(seed?.group_name ?? "");
  const [address, setAddress] = useState(seed?.address ?? "");
  const [clientName, setClientName] = useState(seed?.client_name ?? "");
  const [contactName, setContactName] = useState(seed?.contact_name ?? "");
  const [managerName, setManagerName] = useState(seed?.manager_name ?? "");
  const [managerPhone, setManagerPhone] = useState(seed?.manager_phone ?? "");
  const [framework, setFramework] = useState(seed?.framework ?? "");
  const [frameworkName, setFrameworkName] = useState(seed?.framework_name ?? "");
  const [field, setField] = useState(seed?.field ?? "");
  const [lessonDuration, setLessonDuration] = useState(
    seed?.lesson_duration != null ? String(seed.lesson_duration) : ""
  );
  const [lessonsCount, setLessonsCount] = useState(
    seed?.lessons_count != null ? String(seed.lessons_count) : ""
  );
  const [notes, setNotes] = useState(seed?.notes ?? "");

  const locationNameOptions = useMemo(
    () => Array.from(new Set(locations.map((l) => l.name))).sort((a, b) => a.localeCompare(b, "he")),
    [locations]
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(locations.map((l) => l.city))).sort((a, b) => a.localeCompare(b, "he")),
    [locations]
  );

  // Reset the form whenever a new seed / open state comes in, so reopening for a different
  // lesson (or a fresh manual add) doesn't carry over the previous form's values.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setInstructorId(seed?.instructor?.id ?? "");
    setLocationName(seed?.location?.name ?? "");
    setLocationCity(seed?.location?.city ?? "");
    setDayOfWeek(seed?.day_of_week ?? defaultDayOfWeek ?? 0);
    setStartTime(seed?.start_time?.slice(0, 5) ?? "09:00");
    setGroupName(seed?.group_name ?? "");
    setAddress(seed?.address ?? "");
    setClientName(seed?.client_name ?? "");
    setContactName(seed?.contact_name ?? "");
    setManagerName(seed?.manager_name ?? "");
    setManagerPhone(seed?.manager_phone ?? "");
    setFramework(seed?.framework ?? "");
    setFrameworkName(seed?.framework_name ?? "");
    setField(seed?.field ?? "");
    setLessonDuration(seed?.lesson_duration != null ? String(seed.lesson_duration) : "");
    setLessonsCount(seed?.lessons_count != null ? String(seed.lessons_count) : "");
    setNotes(seed?.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, seed]);

  if (!open) return null;

  async function handleSubmit() {
    const trimmedName = locationName.trim();
    const trimmedCity = locationCity.trim();
    if (!trimmedName || !trimmedCity) {
      setError("יש להזין שם גן/מסגרת ועיר");
      return;
    }
    if (!startTime) {
      setError("יש להזין שעה");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Match an existing location by name+city so we don't create duplicates for a garden
      // that's already in the system — but never block on it: a genuinely new name/city just
      // creates a new location record on the fly, since new institutions come in constantly.
      const existingMatch = locations.find(
        (l) =>
          l.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
          l.city.trim().toLowerCase() === trimmedCity.toLowerCase()
      );
      let locationId = existingMatch?.id;
      if (!locationId) {
        const locResult = await createLocation({ name: trimmedName, city: trimmedCity });
        if (locResult.error || !locResult.id) {
          setError(locResult.error ?? "שגיאה ביצירת המיקום");
          setLoading(false);
          return;
        }
        locationId = locResult.id;
      }

      const result = await createRecurringScheduleItem({
        instructor_id: instructorId || null,
        location_id: locationId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        group_name: groupName.trim() || null,
        client_name: clientName.trim() || null,
        address: address.trim() || null,
        manager_name: managerName.trim() || null,
        manager_phone: managerPhone.trim() || null,
        contact_name: contactName.trim() || null,
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
      router.refresh();
      onClose();
    } catch {
      setError("שגיאה ביצירת השיעור הקבוע");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{seed ? "שכפול שיעור קבוע" : "הוספת שיעור קבוע"}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {seed && (
          <p className="mt-2 text-sm text-muted-foreground">
            בחר/י מה לשנות בעותק החדש (יום, שעה, מדריך/ה, כתובת וכו&apos;) ואשר/י.
          </p>
        )}

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              שם הגן / מסגרת <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              list="recurring-location-name-options"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="שם הגן, בית הספר או המסגרת — גם אם חדש"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
            <datalist id="recurring-location-name-options">
              {locationNameOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="mt-1 text-xs text-muted-foreground">
              אפשר לבחור מהרשימה או פשוט להקליד שם חדש — מסגרת חדשה תיווצר אוטומטית.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              עיר <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              list="recurring-location-city-options"
              value={locationCity}
              onChange={(e) => setLocationCity(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
            <datalist id="recurring-location-city-options">
              {cityOptions.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

          <InstructorSearchSelect instructors={instructors} value={instructorId} onChange={setInstructorId} />

          <div>
            <label className="mb-1 block text-sm font-medium">יום</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              {DAYS_HEBREW.slice(0, 5).map((day, i) => (
                <option key={i} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">שעה</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            />
          </div>

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
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {seed ? "צור שיעור משוכפל" : "הוסף שיעור קבוע"}
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

  const selectedLabel = value ? instructors.find((i) => i.id === value)?.full_name ?? "" : "ללא מדריך";

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
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === "" ? "bg-muted font-medium" : ""}`}
              >
                ללא מדריך
              </button>
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">לא נמצאו מדריכים</div>
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

