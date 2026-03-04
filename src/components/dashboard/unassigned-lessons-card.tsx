"use client";

import { useState } from "react";
import { AlertTriangle, UserX } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { format } from "date-fns";
import { LessonEditDialog } from "@/components/schedule/lesson-edit-dialog";

interface UnassignedLesson {
  id: string;
  recurring_item_id: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  location: { id: string; name: string; city: string; age_group: string | null } | null;
}

interface AbsenceRequest {
  id: string;
  recurring_item_id: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor_notes: string | null;
  instructor_request_type: string | null;
  instructor_request_handled: boolean;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string } | null;
}

export function UrgentAlertsCard({
  lessons,
  absenceRequests,
  instructors,
}: {
  lessons: UnassignedLesson[];
  absenceRequests: AbsenceRequest[];
  instructors: { id: string; full_name: string }[];
}) {
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  const totalCount = lessons.length + absenceRequests.length;
  if (totalCount === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-red-200 bg-background">
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50/50 p-4 rounded-t-xl">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="text-lg font-semibold">
            התראות דחופות ({totalCount})
          </h3>
        </div>

        <div className="divide-y divide-border">
          {/* Unassigned lessons */}
          {lessons.map((lesson) => {
            const date = new Date(lesson.lesson_date);
            const dayIndex = date.getDay();

            return (
              <div
                key={lesson.id}
                onClick={() => setEditingLesson({ ...lesson, instructor: null, _type: "unassigned" })}
                className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-red-50/30 border-s-4 border-s-red-400"
              >
                <div className="min-w-[56px] text-center">
                  <p className="text-base font-bold text-[#1C1917]">{formatTime(lesson.start_time)}</p>
                  <p className="text-xs text-muted-foreground">
                    {DAYS_SHORT[dayIndex]} {format(date, "dd/MM")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917]">{lesson.location?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {lesson.location?.city}
                    {lesson.location?.age_group && ` · ${lesson.location.age_group}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-semibold text-red-700">
                  <UserX size={14} className="inline ml-1" />
                  שבץ
                </span>
              </div>
            );
          })}

          {/* Absence requests */}
          {absenceRequests.map((req) => {
            const date = new Date(req.lesson_date);
            const dayIndex = date.getDay();
            const reqType = req.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES | null;

            return (
              <div
                key={req.id}
                onClick={() => setEditingLesson({ ...req, _type: "absence" })}
                className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-orange-50/30 border-s-4 border-s-orange-400"
              >
                <div className="min-w-[56px] text-center">
                  <p className="text-base font-bold text-[#1C1917]">{formatTime(req.start_time)}</p>
                  <p className="text-xs text-muted-foreground">
                    {DAYS_SHORT[dayIndex]} {format(date, "dd/MM")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917]">
                    {req.instructor?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {req.location?.name} · {req.location?.city}
                  </p>
                  {req.instructor_notes && (
                    <p className="mt-1 text-xs text-orange-700 bg-orange-50 rounded px-2 py-1">
                      {req.instructor_notes}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded-lg bg-orange-100 px-3 py-1.5 text-sm font-semibold text-orange-700">
                  {reqType ? INSTRUCTOR_REQUEST_TYPES[reqType] : "בקשה"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {editingLesson && (
        <LessonEditDialog
          item={{
            id: editingLesson.id,
            recurring_item_id: editingLesson.recurring_item_id,
            start_time: editingLesson.start_time,
            status: editingLesson.status,
            instructor: editingLesson.instructor ?? null,
            location: editingLesson.location ? {
              id: editingLesson.location.id,
              name: editingLesson.location.name,
              city: editingLesson.location.city,
            } : null,
            lesson_date: editingLesson.lesson_date,
          }}
          instructors={instructors}
          mode="lesson"
          open={!!editingLesson}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </>
  );
}

// Keep backward-compatible export name
export const UnassignedLessonsCard = UrgentAlertsCard;
