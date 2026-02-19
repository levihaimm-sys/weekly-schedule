"use client";

import { useState } from "react";
import { UserX } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT } from "@/lib/utils/constants";
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

export function UnassignedLessonsCard({
  lessons,
  instructors,
}: {
  lessons: UnassignedLesson[];
  instructors: { id: string; full_name: string }[];
}) {
  const [editingLesson, setEditingLesson] = useState<UnassignedLesson | null>(null);

  if (lessons.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-red-200 bg-background">
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50/50 p-4 rounded-t-xl">
          <UserX size={18} className="text-red-500" />
          <h3 className="text-lg font-semibold">
            שיעורים ללא מדריך ({lessons.length})
          </h3>
        </div>

        <div className="divide-y divide-border">
          {lessons.map((lesson) => {
            const date = new Date(lesson.lesson_date);
            const dayIndex = date.getDay();

            return (
              <div
                key={lesson.id}
                onClick={() => setEditingLesson(lesson)}
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
                  שבץ
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
            instructor: null,
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
