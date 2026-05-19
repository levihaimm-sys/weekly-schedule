"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Check,
  Loader2,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_HEBREW, INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";
import { format } from "date-fns";
import { bulkConfirmByInstructor } from "@/lib/actions/signatures";
import { LessonConfirmButtons } from "./lesson-confirm-buttons";
import { InstructorReportButton } from "./instructor-report-button";
import { RevokeApprovalButton } from "./revoke-approval-button";
import { UndoCancellationButton } from "./undo-cancellation-button";

interface LessonData {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  change_notes: string | null;
  instructor_absence_request: boolean;
  instructor_request_type: string | null;
  instructor_notes: string | null;
  location: {
    id: string;
    name: string;
    city: string;
    street: string | null;
  } | null;
}

interface BulkConfirmLessonsProps {
  lessons: LessonData[];
  sigMap: Record<
    string,
    { signer_name: string; signer_role: string; signature_url: string | null }
  >;
}

export function BulkConfirmLessons({ lessons, sigMap }: BulkConfirmLessonsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const eligibleIds = lessons
    .filter((l) => {
      if (sigMap[l.id]) return false;
      if (l.status === "cancelled") return false;
      if (l.instructor_absence_request) return false;
      const lessonDateTime = new Date(`${l.lesson_date}T${l.start_time}`);
      const tenMinAfter = new Date(lessonDateTime.getTime() + 10 * 60 * 1000);
      return new Date() >= tenMinAfter;
    })
    .map((l) => l.id);

  const selectionMode = selected.size > 0;

  function toggleLesson(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === eligibleIds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligibleIds));
    }
  }

  function handleBulkConfirm() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await bulkConfirmByInstructor(ids);
      if (!result.error) {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  if (lessons.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-muted-foreground">
          אין שיעורים בחודש זה
        </p>
      </div>
    );
  }

  return (
    <>
      {eligibleIds.length > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <CheckCheck size={16} />
            {selected.size === eligibleIds.length ? "בטל בחירה" : `בחר הכל (${eligibleIds.length})`}
          </button>
          {selectionMode && (
            <span className="text-sm font-semibold text-foreground/70">
              {selected.size} נבחרו
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {lessons.map((lesson) => {
          const isConfirmed = !!sigMap[lesson.id];
          const lessonDate = new Date(lesson.lesson_date);
          const dayName = DAYS_HEBREW[lessonDate.getDay()];
          const dateStr = format(lessonDate, "dd/MM");

          const lessonDateTime = new Date(
            `${lesson.lesson_date}T${lesson.start_time}`
          );
          const tenMinutesAfterStart = new Date(
            lessonDateTime.getTime() + 10 * 60 * 1000
          );
          const hasStartedPlus10 = new Date() >= tenMinutesAfterStart;
          const isFutureLesson =
            !hasStartedPlus10 &&
            !isConfirmed &&
            lesson.status !== "cancelled" &&
            !lesson.instructor_absence_request;

          const isEligible = eligibleIds.includes(lesson.id);
          const isSelected = selected.has(lesson.id);

          return (
            <div key={lesson.id}>
              <div
                onClick={
                  isEligible && selectionMode
                    ? () => toggleLesson(lesson.id)
                    : undefined
                }
                className={`rounded-2xl p-4 shadow-sm transition-all ${
                  isConfirmed
                    ? "bg-success/10"
                    : lesson.status === "cancelled"
                      ? "bg-destructive/10"
                      : lesson.instructor_absence_request
                        ? "bg-orange-50"
                        : "bg-card"
                } ${isEligible && selectionMode ? "cursor-pointer" : ""} ${
                  isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {isEligible && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLesson(lesson.id);
                      }}
                      className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-md border-2 transition-all ${
                        isSelected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-muted-foreground/30 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <span className="font-bold text-sm text-foreground block">
                          {dateStr}
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {dayName}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <span className="flex items-center gap-1 font-bold text-sm text-foreground">
                          <Clock size={12} />
                          {formatTime(lesson.start_time)}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-sm text-foreground mt-0.5">
                          <MapPin size={11} />
                          {lesson.location?.city}
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-foreground truncate mt-2">
                      {lesson.location?.name}
                    </p>
                  </div>

                  {!selectionMode && (
                    <div className="shrink-0">
                      {isConfirmed ? (
                        <div className="flex flex-col items-end">
                          <span className="rounded-xl bg-success/20 px-2 py-1 text-[10px] font-bold text-success">
                            ✓ מאושר
                          </span>
                          {sigMap[lesson.id]?.signer_role === "instructor" && (
                            <RevokeApprovalButton lessonId={lesson.id} />
                          )}
                        </div>
                      ) : lesson.status === "cancelled" ? (
                        <div className="flex flex-col items-end">
                          <span className="rounded-xl bg-destructive/20 px-2 py-1 text-[10px] font-bold text-destructive">
                            בוטל
                          </span>
                          {lesson.change_notes ===
                            "לא התקיים - דווח ע״י המדריכה" && (
                            <UndoCancellationButton lessonId={lesson.id} />
                          )}
                        </div>
                      ) : lesson.instructor_absence_request ? (
                        <span className="flex items-center gap-1 rounded-xl bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
                          <AlertTriangle size={12} />
                          {INSTRUCTOR_REQUEST_TYPES[
                            lesson.instructor_request_type as keyof typeof INSTRUCTOR_REQUEST_TYPES
                          ] ?? "דווח"}
                        </span>
                      ) : hasStartedPlus10 ? (
                        <LessonConfirmButtons
                          lessonId={lesson.id}
                          locationName={lesson.location?.name ?? ""}
                          startTime={lesson.start_time}
                          signature={null}
                        />
                      ) : null}
                    </div>
                  )}

                  {selectionMode && !isEligible && (
                    <div className="shrink-0">
                      {isConfirmed && (
                        <span className="rounded-xl bg-success/20 px-2 py-1 text-[10px] font-bold text-success">
                          ✓ מאושר
                        </span>
                      )}
                      {lesson.status === "cancelled" && !isConfirmed && (
                        <span className="rounded-xl bg-destructive/20 px-2 py-1 text-[10px] font-bold text-destructive">
                          בוטל
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!selectionMode && isFutureLesson && (
                  <div className="mt-3 border-t border-border/50 pt-3">
                    <InstructorReportButton lessonId={lesson.id} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center justify-center">
          <button
            onClick={handleBulkConfirm}
            disabled={isPending}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle size={20} />
            )}
            אשר {selected.size} שיעורים
          </button>
        </div>
      )}
    </>
  );
}
