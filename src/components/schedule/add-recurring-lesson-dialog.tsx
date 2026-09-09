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
  const [locationId, setLocationId] = useState(seed?.location?.id ?? "");
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

  // Reset the form whenever a new seed / open state comes in, so reopening for a different
  // lesson (or a fresh manual add) doesn't carry over the previous form's values.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setInstructorId(seed?.instructor?.id ?? "");
    setLocationId(seed?.location?.id ?? "");
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
    if (!locationId) {
      setError("יש לבחור גן / מיקום");
      return;
    }
    if (!startTime) {
      setError("יש להזין שעה");
      return;
    }
    setLoading(true);
    setError(null);
    try {
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
          <LocationSearchSelect locations={locations} value={locationId} onChange={setLocationId} />

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

function LocationSearchSelect({
  locations,
  value,
  onChange,
}: {
  locations: { id: string; name: string; city: string; street?: string | null }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
        setCreating(false);
        setCreateError(null);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return locations;
    const term = search.trim().toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.city.toLowerCase().includes(term) ||
        (l.street ?? "").toLowerCase().includes(term)
    );
  }, [locations, search]);

  const selected = locations.find((l) => l.id === value);
  const selectedLabel = selected ? `${selected.name} — ${selected.city}` : "בחר גן / מיקום";

  async function handleCreate() {
    if (!search.trim() || !newCity.trim()) return;
    setCreateLoading(true);
    setCreateError(null);
    const result = await createLocation({ name: search.trim(), city: newCity.trim() });
    setCreateLoading(false);
    if (result.error) {
      setCreateError(result.error);
      return;
    }
    onChange(result.id!);
    setOpen(false);
    setSearch("");
    setCreating(false);
    setNewCity("");
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        גן / מיקום <span className="text-destructive">*</span>
      </label>
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
                onChange={(e) => { setSearch(e.target.value); setCreating(false); setCreateError(null); }}
                placeholder="חיפוש לפי שם גן, עיר..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => { onChange(loc.id); setOpen(false); setSearch(""); }}
                  className={`w-full px-3 py-2 text-sm text-right hover:bg-muted ${value === loc.id ? "bg-muted font-medium" : ""}`}
                >
                  <span className="font-medium">{loc.name}</span>
                  <span className="text-muted-foreground"> — {loc.city}</span>
                </button>
              ))}
              {search.trim() && !creating && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="w-full px-3 py-2 text-sm text-right text-primary hover:bg-muted border-t border-border"
                >
                  + הוסף גן חדש &quot;{search.trim()}&quot;
                </button>
              )}
              {filtered.length === 0 && !search.trim() && (
                <div className="px-3 py-3 text-sm text-muted-foreground text-center">לא נמצאו מיקומים</div>
              )}
            </div>
            {creating && search.trim() && (
              <div className="border-t border-border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">גן חדש: {search.trim()}</p>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="עיר..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  autoFocus
                />
                {createError && <p className="text-xs text-destructive">{createError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={createLoading || !newCity.trim()}
                    className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {createLoading ? "..." : "הוסף"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreating(false); setCreateError(null); }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
