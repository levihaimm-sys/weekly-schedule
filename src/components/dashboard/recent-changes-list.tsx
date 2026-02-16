"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT, LESSON_STATUS, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { format } from "date-fns";
import { LessonEditDialog } from "@/components/schedule/lesson-edit-dialog";

interface ChangeLesson {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  change_notes: string | null;
  instructor_absence_request?: boolean;
  instructor_request_handled?: boolean;
  instructor_request_type?: string | null;
  instructor_notes?: string | null;
  recurring_item_id?: string | null;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string } | null;
}

function isPending(lesson: ChangeLesson) {
  return lesson.instructor_absence_request && !lesson.instructor_request_handled;
}

export function RecentChangesList({
  changes,
  instructors,
}: {
  changes: ChangeLesson[];
  instructors: { id: string; full_name: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ChangeLesson | null>(null);

  // Split: pending (red) first, then handled (yellow)
  const pending = changes.filter(isPending);
  const handled = changes.filter((c) => !isPending(c));
  const sorted = [...pending, ...handled];
  const displayChanges = expanded ? sorted : sorted.slice(0, 8);

  if (changes.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-border bg-background">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 p-4 rounded-t-xl">
          <AlertTriangle size={18} className="text-primary" />
          <h3 className="text-lg font-semibold">
            שינויים ({changes.length})
          </h3>
          {pending.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {pending.length} לטיפול
            </span>
          )}
        </div>

        <div className="divide-y divide-border">
          {displayChanges.map((lesson) => {
            const date = new Date(lesson.lesson_date);
            const dayIndex = date.getDay();
            const isHandled = lesson.instructor_absence_request && lesson.instructor_request_handled;
            const isPend = isPending(lesson);
            const reqType = lesson.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES | null;

            return (
              <div
                key={lesson.id}
                onClick={() => setEditingLesson(lesson)}
                className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/30 ${
                  isPend
                    ? "border-s-4 border-s-red-400 bg-red-50/30"
                    : isHandled
                      ? "border-s-4 border-s-yellow-400 bg-yellow-50/30"
                      : ""
                }`}
              >
                <div className="min-w-[50px] text-center">
                  <p className="text-sm font-bold">{formatTime(lesson.start_time)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {DAYS_SHORT[dayIndex]} {format(date, "dd/MM")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{lesson.location?.name}</p>
                    {lesson.instructor_absence_request && reqType && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          isHandled
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {INSTRUCTOR_REQUEST_TYPES[reqType]}
                        {isHandled ? " - טופל" : ""}
                      </span>
                    )}
                    {lesson.status !== "scheduled" && (
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
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lesson.instructor?.full_name} &middot; {lesson.location?.city}
                  </p>
                  {lesson.instructor_notes && (
                    <p className={`mt-0.5 text-xs ${isPend ? "text-red-600" : "text-yellow-600"}`}>
                      &quot;{lesson.instructor_notes}&quot;
                    </p>
                  )}
                  {lesson.change_notes && (
                    <p className="mt-0.5 text-xs text-orange-600">{lesson.change_notes}</p>
                  )}
                </div>
                {isPend && (
                  <span className="shrink-0 rounded-lg bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                    טפל
                  </span>
                )}
                {isHandled && (
                  <span className="shrink-0 flex items-center gap-1 text-xs text-yellow-600">
                    <CheckCircle size={12} />
                    טופל
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {sorted.length > 8 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1 border-t border-border py-3 text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
          >
            {expanded ? (
              <>
                הצג פחות
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                הצג הכל ({sorted.length})
                <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
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
