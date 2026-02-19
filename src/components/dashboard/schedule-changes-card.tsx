"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { format } from "date-fns";
import { LessonEditDialog } from "@/components/schedule/lesson-edit-dialog";

interface ScheduleChangeLesson {
  id: string;
  recurring_item_id: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string; age_group: string | null } | null;
  recurring_instructor: { id: string; full_name: string } | null;
}

export function ScheduleChangesCard({
  changes,
  instructors,
}: {
  changes: ScheduleChangeLesson[];
  instructors: { id: string; full_name: string }[];
}) {
  const [editingLesson, setEditingLesson] = useState<ScheduleChangeLesson | null>(null);

  if (changes.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-orange-200 bg-background">
        <div className="flex items-center gap-2 border-b border-orange-200 bg-orange-50/50 p-4 rounded-t-xl">
          <ArrowLeftRight size={18} className="text-orange-500" />
          <h3 className="text-lg font-semibold">
            שינויים מהלוז הקבוע ({changes.length})
          </h3>
        </div>

        <div className="divide-y divide-border">
          {changes.map((lesson) => {
            const date = new Date(lesson.lesson_date);
            const dayIndex = date.getDay();

            return (
              <div
                key={lesson.id}
                onClick={() => setEditingLesson(lesson)}
                className="flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-orange-50/30 border-s-4 border-s-orange-400"
              >
                <div className="min-w-[56px] text-center">
                  <p className="text-base font-bold text-[#1C1917]">{formatTime(lesson.start_time)}</p>
                  <p className="text-xs text-muted-foreground">
                    {DAYS_SHORT[dayIndex]} {format(date, "dd/MM")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1917]">{lesson.location?.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="line-through text-red-400">{lesson.recurring_instructor?.full_name}</span>
                    <span>←</span>
                    <span className="font-medium text-[#1C1917]">{lesson.instructor?.full_name}</span>
                  </div>
                </div>
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
            instructor: editingLesson.instructor,
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
