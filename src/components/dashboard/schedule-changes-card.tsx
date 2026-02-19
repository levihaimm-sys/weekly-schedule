"use client";

import { useState, useMemo, useTransition } from "react";
import { ArrowLeftRight, Eye, Check } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT } from "@/lib/utils/constants";
import { format } from "date-fns";
import { LessonEditDialog } from "@/components/schedule/lesson-edit-dialog";
import { markChangeAsSeen, unmarkChangeAsSeen } from "@/lib/actions/schedule";

interface ScheduleChangeLesson {
  id: string;
  recurring_item_id: string | null;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor: { id: string; full_name: string } | null;
  location: { id: string; name: string; city: string; age_group: string | null } | null;
  recurring_instructor: { id: string; full_name: string } | null;
  is_seen: boolean;
}

function isLessonPast(lesson: { lesson_date: string; start_time: string }): boolean {
  const now = new Date();
  const israelTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" })
  );
  const [hours, minutes] = lesson.start_time.split(":").map(Number);
  const lessonDate = new Date(lesson.lesson_date);
  lessonDate.setHours(hours, minutes, 0, 0);
  return lessonDate < israelTime;
}

export function ScheduleChangesCard({
  changes,
  instructors,
}: {
  changes: ScheduleChangeLesson[];
  instructors: { id: string; full_name: string }[];
}) {
  const [editingLesson, setEditingLesson] = useState<ScheduleChangeLesson | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "seen">("active");
  const [isPending, startTransition] = useTransition();
  const [optimisticSeen, setOptimisticSeen] = useState<Set<string>>(
    () => new Set(changes.filter((c) => c.is_seen).map((c) => c.id))
  );

  const { activeChanges, seenChanges } = useMemo(() => {
    const active: ScheduleChangeLesson[] = [];
    const seen: ScheduleChangeLesson[] = [];

    for (const change of changes) {
      const isSeen = optimisticSeen.has(change.id);
      const isPast = isLessonPast(change);

      if (isSeen || isPast) {
        seen.push(change);
      } else {
        active.push(change);
      }
    }

    return { activeChanges: active, seenChanges: seen };
  }, [changes, optimisticSeen]);

  const displayedChanges = activeTab === "active" ? activeChanges : seenChanges;

  function handleToggleSeen(e: React.MouseEvent, lessonId: string) {
    e.stopPropagation();
    const isSeen = optimisticSeen.has(lessonId);

    setOptimisticSeen((prev) => {
      const next = new Set(prev);
      if (isSeen) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });

    startTransition(async () => {
      if (isSeen) {
        await unmarkChangeAsSeen(lessonId);
      } else {
        await markChangeAsSeen(lessonId);
      }
    });
  }

  if (changes.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-orange-200 bg-background">
        <div className="flex items-center gap-2 border-b border-orange-200 bg-orange-50/50 p-4 rounded-t-xl">
          <ArrowLeftRight size={18} className="text-orange-500" />
          <h3 className="text-lg font-semibold">שינויים</h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-orange-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "border-b-2 border-orange-500 text-orange-700 bg-orange-50/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            פעילים
            {activeChanges.length > 0 && (
              <span className="mr-1 inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 text-xs font-semibold">
                {activeChanges.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("seen")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "seen"
                ? "border-b-2 border-orange-500 text-orange-700 bg-orange-50/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ראיתי
            {seenChanges.length > 0 && (
              <span className="mr-1 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 px-1.5 py-0.5 text-xs font-semibold">
                {seenChanges.length}
              </span>
            )}
          </button>
        </div>

        {displayedChanges.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {activeTab === "active" ? "אין שינויים פעילים" : "אין שינויים שסומנו"}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayedChanges.map((lesson) => {
              const date = new Date(lesson.lesson_date);
              const dayIndex = date.getDay();
              const isSeen = optimisticSeen.has(lesson.id);
              const isPast = isLessonPast(lesson);

              return (
                <div
                  key={lesson.id}
                  onClick={() => setEditingLesson(lesson)}
                  className={`flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-orange-50/30 border-s-4 ${
                    isPast
                      ? "border-s-gray-300 opacity-60"
                      : isSeen
                        ? "border-s-gray-300"
                        : "border-s-orange-400"
                  }`}
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
                      <span className="line-through text-red-400">{lesson.instructor?.full_name}</span>
                      <span>←</span>
                      <span className="font-medium text-[#1C1917]">{lesson.recurring_instructor?.full_name}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleToggleSeen(e, lesson.id)}
                    disabled={isPending}
                    className={`shrink-0 rounded-full p-1.5 transition-colors ${
                      isSeen
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    }`}
                    title={isSeen ? "סמן כלא נראה" : "סמן כראיתי"}
                  >
                    {isSeen ? <Check size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
