"use client";

import { useState, useMemo } from "react";
import { DAYS_SHORT, LESSON_STATUS, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "@/components/schedule/lesson-edit-dialog";
import { AlertTriangle, CheckCircle, Filter } from "lucide-react";

interface DayLesson {
  id: string;
  recurring_item_id?: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  change_notes: string | null;
  instructor_absence_request?: boolean;
  instructor_request_handled?: boolean;
  instructor_request_type?: string | null;
  instructor_notes?: string | null;
  instructor: { id: string; full_name: string } | null;
  location: {
    id: string;
    name: string;
    city: string;
    street?: string | null;
    age_group?: string | null;
  } | null;
  signature?: { signer_name: string; signer_role: string } | null;
}

interface DayLessonsViewerProps {
  weekDates: { date: string; dayName: string; displayDate: string }[];
  lessonsByDate: Record<string, DayLesson[]>;
  instructors: { id: string; full_name: string }[];
  initialDate: string;
}

export function DayLessonsViewer({
  weekDates,
  lessonsByDate,
  instructors,
  initialDate,
}: DayLessonsViewerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [editingLesson, setEditingLesson] = useState<DayLesson | null>(null);
  const [filterCity, setFilterCity] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");

  // Derive unique cities and instructor names for the selected day
  const dayLessonsRaw = lessonsByDate[selectedDate] ?? [];
  const cities = useMemo(() => {
    const set = new Set<string>();
    dayLessonsRaw.forEach((l) => l.location?.city && set.add(l.location.city));
    return [...set].sort();
  }, [dayLessonsRaw]);

  const dayInstructors = useMemo(() => {
    const map = new Map<string, string>();
    dayLessonsRaw.forEach((l) => {
      if (l.instructor) map.set(l.instructor.id, l.instructor.full_name);
    });
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dayLessonsRaw]);

  // Apply filters
  const filtered = dayLessonsRaw.filter((l) => {
    if (filterCity && l.location?.city !== filterCity) return false;
    if (filterInstructor && l.instructor?.id !== filterInstructor) return false;
    return true;
  });
  const lessons = smartSortLessons(filtered);

  return (
    <div className="rounded-xl border border-border bg-background">
      {/* Day tabs */}
      <div className="flex border-b border-border">
        {weekDates.map(({ date, dayName, displayDate }) => {
          const isSelected = date === selectedDate;
          const dayLessons = lessonsByDate[date] ?? [];
          const hasPending = dayLessons.some(
            (l) => (l.instructor_absence_request && !l.instructor_request_handled) || !l.instructor
          );
          const hasHandled = dayLessons.some(
            (l) => l.instructor_absence_request && l.instructor_request_handled
          );

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-1 py-3 text-center transition-colors relative ${
                isSelected
                  ? "bg-primary text-primary-foreground font-bold"
                  : "hover:bg-muted"
              }`}
            >
              <p className="text-sm font-bold">{dayName}</p>
              <p className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {displayDate}
              </p>
              <p className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {dayLessons.length} שיעורים
              </p>
              {/* Status dots in top-start corner */}
              <div className="absolute top-1 start-1 flex gap-0.5">
                {hasPending && (
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
                {hasHandled && (
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <Filter size={14} className="text-muted-foreground" />
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="">כל הישובים</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterInstructor}
          onChange={(e) => setFilterInstructor(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="">כל המדריכים</option>
          {dayInstructors.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        {(filterCity || filterInstructor) && (
          <button
            onClick={() => { setFilterCity(""); setFilterInstructor(""); }}
            className="rounded-lg px-2 py-1 text-xs text-primary hover:bg-muted"
          >
            נקה סינון
          </button>
        )}
      </div>

      {/* Lessons list */}
      <div className="p-4">
        {lessons.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            אין שיעורים ליום זה
          </div>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const isPendingRequest = lesson.instructor_absence_request && !lesson.instructor_request_handled;
              const isHandledRequest = lesson.instructor_absence_request && lesson.instructor_request_handled;
              const isConfirmed = !!lesson.signature;
              const reqType = lesson.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES | null;
              const prevLesson = index > 0 ? lessons[index - 1] : null;
              const isNewInstructor =
                prevLesson &&
                (lesson.instructor?.id ?? "__none__") !== (prevLesson.instructor?.id ?? "__none__");

              return (
                <div key={lesson.id}>
                {isNewInstructor && (
                  <div className="border-t border-border my-3" />
                )}
                <div
                  onClick={() => setEditingLesson(lesson)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-md ${
                    isPendingRequest
                      ? "border-red-300 bg-red-50/50"
                      : isHandledRequest
                        ? "border-yellow-300 bg-yellow-50/50"
                        : !lesson.instructor
                          ? "border-red-200 bg-red-50/30"
                          : isConfirmed
                            ? "border-green-300 bg-green-50/30"
                            : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="min-w-[50px] text-center">
                      <p className="text-lg font-bold text-primary">
                        {formatTime(lesson.start_time)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{lesson.location?.name ?? "—"}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.location?.city}
                        {lesson.location?.street ? `, ${lesson.location.street}` : ""}
                      </p>
                      {lesson.location?.age_group && (
                        <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-xs">
                          גיל {lesson.location.age_group}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <p className="text-sm">
                          {lesson.instructor?.full_name ?? (
                            <span className="font-medium text-red-600">ללא מדריך</span>
                          )}
                        </p>
                        {lesson.signature && (
                          <span title={
                            lesson.signature.signer_role === "teacher"
                              ? `אושר ע"י גננת (${lesson.signature.signer_name})`
                              : 'אושר ע"י המדריכה'
                          }>
                            <CheckCircle size={14} className="text-green-600" />
                          </span>
                        )}
                      </div>
                      {isPendingRequest && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <AlertTriangle size={10} />
                          {reqType ? INSTRUCTOR_REQUEST_TYPES[reqType] : "בקשה"}
                        </div>
                      )}
                      {isHandledRequest && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                          <CheckCircle size={10} />
                          {reqType ? INSTRUCTOR_REQUEST_TYPES[reqType] : "בקשה"} - טופל
                        </div>
                      )}
                      {lesson.change_notes && (
                        <p className="text-xs text-orange-600">{lesson.change_notes}</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isConfirmed
                          ? "bg-green-100 text-green-700"
                          : lesson.status === "completed"
                            ? "bg-green-50 text-green-700"
                            : lesson.status === "cancelled"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {isConfirmed
                        ? "שיעור מאושר"
                        : (LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ??
                          lesson.status)}
                    </span>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-3 text-sm text-muted-foreground">
          {lessons.length === dayLessonsRaw.length
            ? `${lessons.length} שיעורים`
            : `${lessons.length} מתוך ${dayLessonsRaw.length} שיעורים`}
          {" | "}לחץ על שיעור לעריכה
        </p>
      </div>

      {/* Edit Dialog */}
      {editingLesson && (
        <LessonEditDialog
          item={editingLesson}
          instructors={instructors}
          mode="lesson"
          open={!!editingLesson}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}
