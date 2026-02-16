"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { format } from "date-fns";
import { LessonEditDialog } from "@/components/schedule/lesson-edit-dialog";

interface RequestLesson {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor_notes?: string | null;
  instructor_request_type?: string | null;
  instructor_request_handled?: boolean;
  recurring_item_id?: string | null;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string } | null;
}

interface InstructorRequestsListProps {
  requests: RequestLesson[];
  instructors: { id: string; full_name: string }[];
}

export function InstructorRequestsList({
  requests,
  instructors,
}: InstructorRequestsListProps) {
  const [editingLesson, setEditingLesson] = useState<RequestLesson | null>(
    null
  );

  return (
    <>
      <div className="rounded-xl border border-red-200 bg-background">
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 p-4 rounded-t-xl">
          <AlertTriangle size={18} className="text-red-600" />
          <h3 className="text-lg font-semibold text-red-700">
            בקשות מדריכים לטיפול ({requests.length})
          </h3>
        </div>
        <div className="divide-y divide-border">
          {requests.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              אין בקשות ממתינות
            </div>
          )}
          {requests.map((lesson) => (
            <RequestRow
              key={lesson.id}
              lesson={lesson}
              onEdit={() => setEditingLesson(lesson)}
            />
          ))}
        </div>
      </div>

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

function RequestRow({
  lesson,
  onEdit,
}: {
  lesson: RequestLesson;
  onEdit: () => void;
}) {
  const date = new Date(lesson.lesson_date);
  const dayIndex = date.getDay();
  const reqType = lesson.instructor_request_type as
    | keyof typeof INSTRUCTOR_REQUEST_TYPES
    | null;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-sm font-bold">{formatTime(lesson.start_time)}</p>
          <p className="text-[10px] text-muted-foreground">
            {DAYS_SHORT[dayIndex]} {format(date, "dd/MM")}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {lesson.instructor?.full_name}
            </p>
            {reqType && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  reqType === "absence"
                    ? "bg-red-100 text-red-700"
                    : reqType === "lateness"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {INSTRUCTOR_REQUEST_TYPES[reqType]}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {lesson.location?.name}
          </p>
          {lesson.instructor_notes && (
            <p className="text-xs text-red-600">
              &quot;{lesson.instructor_notes}&quot;
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onEdit}
        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
      >
        טפל
      </button>
    </div>
  );
}
