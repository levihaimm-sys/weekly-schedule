"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { DAYS_SHORT, LESSON_STATUS, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { formatTime, smartSortLessons } from "@/lib/utils/date";
import { LessonEditDialog } from "./lesson-edit-dialog";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface WeeklyLesson {
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
  substitute_instructor?: { id: string; full_name: string } | null;
  location: {
    id: string;
    name: string;
    city: string;
    street?: string | null;
    age_group?: string | null;
  } | null;
}

interface WeeklyGridProps {
  weekDates: string[];
  lessonsByDay: Record<string, WeeklyLesson[]>;
  instructors: { id: string; full_name: string }[];
  cities?: string[];
  currentFilters?: { city?: string; instructor?: string };
}

function getLessonBorderClass(lesson: WeeklyLesson) {
  if (lesson.instructor_absence_request && lesson.instructor_request_handled) {
    return "border-yellow-300 bg-yellow-50/50"; // handled
  }
  if (lesson.instructor_absence_request) {
    return "border-red-300 bg-red-50/50"; // pending
  }
  if (!lesson.instructor) {
    return "border-red-200 bg-red-50/30"; // no instructor
  }
  return "border-border bg-background";
}

function RequestBadge({ lesson }: { lesson: WeeklyLesson }) {
  if (!lesson.instructor_absence_request) return null;
  const reqType = lesson.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES | null;
  const handled = lesson.instructor_request_handled;

  return (
    <div className={`mt-1 flex items-center gap-1 text-[10px] ${handled ? "text-yellow-600" : "text-red-600"}`}>
      {handled ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
      {reqType ? INSTRUCTOR_REQUEST_TYPES[reqType] : "בקשה"}
      {handled && " - טופל"}
    </div>
  );
}

export function WeeklyGrid({ weekDates, lessonsByDay, instructors, cities, currentFilters }: WeeklyGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingLesson, setEditingLesson] = useState<WeeklyLesson | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/schedule/weekly?${params.toString()}`);
  }

  return (
    <>
      {/* Filters */}
      {cities && cities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select
            value={currentFilters?.city ?? ""}
            onChange={(e) => updateFilter("city", e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm sm:flex-none sm:min-w-[160px]"
          >
            <option value="">כל הערים</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={currentFilters?.instructor ?? ""}
            onChange={(e) => updateFilter("instructor", e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm sm:flex-none sm:min-w-[160px]"
          >
            <option value="">כל המדריכים</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mobile: Day tabs + single day list */}
      <div className="md:hidden">
        <div className="flex border-b border-border">
          {weekDates.map((dateStr, dayIndex) => {
            const date = new Date(dateStr + "T00:00:00");
            const dayLessons = lessonsByDay[dateStr] ?? [];
            const isSelected = dayIndex === selectedDay;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(dayIndex)}
                className={`flex-1 py-2.5 text-center transition-colors relative ${
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold"
                    : "hover:bg-muted"
                }`}
              >
                <p className="text-sm font-bold">{DAYS_SHORT[dayIndex]}</p>
                <p className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {format(date, "dd/MM")}
                </p>
                <p className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {dayLessons.length}
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-2 p-3">
          {(() => {
            const dateStr = weekDates[selectedDay];
            const dayLessons = smartSortLessons(lessonsByDay[dateStr] ?? []);
            if (dayLessons.length === 0) {
              return (
                <div className="py-8 text-center text-muted-foreground">
                  אין שיעורים ליום זה
                </div>
              );
            }
            return dayLessons.map((lesson) => (
              <MobileLessonCard
                key={lesson.id}
                lesson={lesson}
                onEdit={() => setEditingLesson(lesson)}
              />
            ));
          })()}
        </div>
      </div>

      {/* Desktop: 5-column grid (Sun-Thu) */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-3">
        {weekDates.map((dateStr, dayIndex) => {
          const dayLessons = smartSortLessons(lessonsByDay[dateStr] ?? []);
          const date = new Date(dateStr + "T00:00:00");
          return (
            <div key={dateStr} className="space-y-2">
              <div className="rounded-lg bg-primary/10 py-2 text-center">
                <p className="text-sm font-bold text-primary">
                  {DAYS_SHORT[dayIndex]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(date, "dd/MM")}
                </p>
              </div>
              <div className="space-y-2">
                {dayLessons.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    אין שיעורים
                  </div>
                ) : (
                  dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setEditingLesson(lesson)}
                      className={`cursor-pointer rounded-lg border p-3 transition-shadow hover:shadow-md hover:border-primary/30 ${getLessonBorderClass(lesson)}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          {formatTime(lesson.start_time)}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            lesson.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : lesson.status === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium leading-tight">
                        {lesson.location?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.location?.city}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lesson.instructor?.full_name ?? (
                          <span className="text-red-600 font-medium">ללא מדריך</span>
                        )}
                      </p>
                      <RequestBadge lesson={lesson} />
                      {lesson.change_notes && (
                        <p className="mt-1 text-xs text-orange-600">
                          {lesson.change_notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
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
    </>
  );
}

function MobileLessonCard({
  lesson,
  onEdit,
}: {
  lesson: WeeklyLesson;
  onEdit: () => void;
}) {
  return (
    <div
      onClick={onEdit}
      className={`cursor-pointer rounded-lg border p-4 transition-shadow active:shadow-md ${getLessonBorderClass(lesson)}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="min-w-[50px] text-center">
            <p className="text-lg font-bold text-primary">
              {formatTime(lesson.start_time)}
            </p>
          </div>
          <div>
            <p className="font-medium">{lesson.location?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground">
              {lesson.location?.city}
            </p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-sm">
            {lesson.instructor?.full_name ?? (
              <span className="font-medium text-red-600">ללא מדריך</span>
            )}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              lesson.status === "completed"
                ? "bg-green-50 text-green-700"
                : lesson.status === "cancelled"
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {LESSON_STATUS[lesson.status as keyof typeof LESSON_STATUS] ?? lesson.status}
          </span>
        </div>
      </div>
      <RequestBadge lesson={lesson} />
      {lesson.change_notes && (
        <p className="mt-1 text-xs text-orange-600">{lesson.change_notes}</p>
      )}
    </div>
  );
}
