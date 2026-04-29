"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { formatTime } from "@/lib/utils/date";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  PenTool,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { AdminConfirmButton } from "./admin-confirm-button";

interface LessonData {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor_id: string;
  instructor_name: string;
  location_name: string;
  location_city: string;
  client_name: string;
}

interface SigData {
  signer_name: string;
  signer_role: string;
}

interface Props {
  lessons: LessonData[];
  sigMap: Record<string, SigData>;
  instructors: { id: string; name: string }[];
  clients: string[];
}

type StatusFilter = "all" | "confirmed" | "pending" | "cancelled";

function getStatusInfo(lesson: LessonData, sig: SigData | undefined) {
  if (lesson.status === "cancelled") {
    return {
      label: "בוטל",
      icon: XCircle,
      className: "bg-red-100 text-red-700",
    };
  }
  if (!sig) {
    return {
      label: "לא אושר",
      icon: HelpCircle,
      className: "bg-orange-100 text-orange-700",
    };
  }
  if (sig.signer_role === "teacher") {
    return {
      label: "אושר ע״י גננת",
      icon: PenTool,
      className: "bg-green-100 text-green-700",
    };
  }
  if (sig.signer_role === "admin") {
    return {
      label: "אושר ע״י מנהל",
      icon: ShieldCheck,
      className: "bg-purple-100 text-purple-700",
    };
  }
  return {
    label: "אושר ע״י מדריכה",
    icon: UserCheck,
    className: "bg-blue-100 text-blue-700",
  };
}

export function ConfirmationsView({
  lessons,
  sigMap,
  instructors,
  clients,
}: Props) {
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const now = new Date();

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (instructorFilter !== "all" && l.instructor_id !== instructorFilter)
        return false;
      if (clientFilter !== "all" && l.client_name !== clientFilter)
        return false;
      if (statusFilter === "confirmed" && !sigMap[l.id]) return false;
      if (statusFilter === "pending" && (sigMap[l.id] || l.status === "cancelled"))
        return false;
      if (statusFilter === "cancelled" && l.status !== "cancelled") return false;
      return true;
    });
  }, [lessons, sigMap, instructorFilter, clientFilter, statusFilter]);

  const totalCount = filtered.length;
  const confirmedCount = filtered.filter((l) => sigMap[l.id]).length;
  const cancelledCount = filtered.filter((l) => l.status === "cancelled").length;
  const pendingCount = totalCount - confirmedCount - cancelledCount;

  const byInstructor = useMemo(() => {
    const map = new Map<string, { name: string; lessons: LessonData[] }>();
    for (const lesson of filtered) {
      if (!map.has(lesson.instructor_id)) {
        map.set(lesson.instructor_id, {
          name: lesson.instructor_name,
          lessons: [],
        });
      }
      map.get(lesson.instructor_id)!.lessons.push(lesson);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [filtered]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <select
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm font-medium"
          >
            <option value="all">כל המדריכים</option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>

        <div className="relative">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm font-medium"
          >
            <option value="all">כל הלקוחות</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm font-medium"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="confirmed">אושרו</option>
            <option value="pending">ממתינים</option>
            <option value="cancelled">בוטלו</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'סה"כ שיעורים', value: totalCount, color: "text-foreground" },
          { label: "אושרו", value: confirmedCount, color: "text-green-600" },
          { label: "ממתינים", value: pendingCount, color: "text-orange-600" },
          { label: "בוטלו", value: cancelledCount, color: "text-red-500" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-background p-4 text-center"
          >
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Per instructor */}
      <div className="space-y-4">
        {byInstructor.length === 0 && (
          <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
            אין שיעורים להצגה
          </div>
        )}
        {byInstructor.map(({ name, lessons: iLessons }) => {
          const active = iLessons.filter((l) => l.status !== "cancelled");
          const confirmed = active.filter((l) => sigMap[l.id]).length;
          const allDone = confirmed === active.length && active.length > 0;

          return (
            <div
              key={name}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <div
                className={`flex items-center justify-between px-4 py-3 ${
                  allDone ? "bg-green-50" : "bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  {allDone ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-orange-500" />
                  )}
                  <span className="font-semibold">{name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {confirmed}/{active.length} אושרו
                </span>
              </div>

              <div className="divide-y divide-border">
                {iLessons.map((lesson) => {
                  const sig = sigMap[lesson.id];
                  const isConfirmed = !!sig;
                  const isCancelled = lesson.status === "cancelled";
                  const lessonTime = new Date(
                    `${lesson.lesson_date}T${lesson.start_time}`
                  );
                  const isPast = lessonTime < now;
                  const status = getStatusInfo(lesson, sig);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        isCancelled ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="w-12 shrink-0 text-muted-foreground">
                          {format(new Date(lesson.lesson_date), "dd/MM")}
                        </span>
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="w-12 shrink-0">
                          {formatTime(lesson.start_time)}
                        </span>
                        <span className="font-medium">
                          {lesson.location_name}
                        </span>
                        <span className="text-muted-foreground">
                          {lesson.location_city}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                        {!isConfirmed && !isCancelled && isPast && (
                          <AdminConfirmButton
                            lessonId={lesson.id}
                            instructorName={name}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
