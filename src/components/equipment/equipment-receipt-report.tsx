"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface EquipmentItem {
  id: string;
  equipment_name: string;
  expected_quantity: number;
  received_quantity: number | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  is_extra: boolean;
  notes: string | null;
}

interface InstructorReport {
  instructorId: string;
  instructorName: string;
  route: string | null;
  lessonPlanName: string | null;
  items: EquipmentItem[];
  allConfirmed: boolean;
  hasShortages: boolean;
  totalExpected: number;
  totalReceived: number;
}

interface Props {
  instructors: InstructorReport[];
  weekStartDate: string;
  availableWeeks: string[];
}

export function EquipmentReceiptReport({
  instructors,
  weekStartDate,
  availableWeeks,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  const currentIndex = availableWeeks.indexOf(weekStartDate);
  const hasPrev = currentIndex < availableWeeks.length - 1;
  const hasNext = currentIndex > 0;

  const navigateWeek = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < availableWeeks.length) {
      router.push(
        `/lesson-plans/equipment-report?week=${availableWeeks[newIndex]}`
      );
    }
  };

  const formatWeekRange = (dateStr: string) => {
    const sunday = new Date(dateStr + "T00:00:00");
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return `${sunday.toLocaleDateString("he-IL", { day: "numeric", month: "short" })} - ${saturday.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const confirmedCount = instructors.filter((i) => i.allConfirmed).length;
  const shortageCount = instructors.filter((i) => i.hasShortages).length;
  const pendingCount = instructors.filter(
    (i) => !i.allConfirmed && !i.hasShortages
  ).length;

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-4">
        <button
          onClick={() => navigateWeek("next")}
          disabled={!hasNext}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight size={18} />
          שבוע הבא
        </button>
        <h3 className="text-lg font-bold">{formatWeekRange(weekStartDate)}</h3>
        <button
          onClick={() => navigateWeek("prev")}
          disabled={!hasPrev}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-30"
        >
          שבוע קודם
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {confirmedCount}
          </div>
          <div className="text-xs text-green-600">אושר הכל</div>
        </div>
        <div className="rounded-xl border bg-yellow-50 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">
            {shortageCount}
          </div>
          <div className="text-xs text-yellow-600">חוסרים</div>
        </div>
        <div className="rounded-xl border bg-gray-50 p-4 text-center">
          <div className="text-2xl font-bold text-gray-700">
            {pendingCount}
          </div>
          <div className="text-xs text-gray-600">ממתין לאישור</div>
        </div>
      </div>

      {/* Instructor List */}
      {instructors.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          אין דיווחי ציוד לשבוע זה
        </div>
      ) : (
        <div className="space-y-2">
          {instructors.map((instructor) => {
            const isExpanded = expandedId === instructor.instructorId;

            return (
              <div
                key={instructor.instructorId}
                className="rounded-xl border bg-card overflow-hidden"
              >
                {/* Instructor Row */}
                <button
                  onClick={() => toggleExpand(instructor.instructorId)}
                  className="flex w-full items-center gap-3 p-4 text-right hover:bg-muted/50 transition-colors"
                >
                  {/* Status Icon */}
                  {instructor.allConfirmed && !instructor.hasShortages ? (
                    <CheckCircle
                      size={20}
                      className="shrink-0 text-green-600"
                    />
                  ) : instructor.hasShortages ? (
                    <AlertTriangle
                      size={20}
                      className="shrink-0 text-yellow-600"
                    />
                  ) : (
                    <Clock size={20} className="shrink-0 text-gray-400" />
                  )}

                  {/* Name & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground">
                      {instructor.instructorName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {instructor.lessonPlanName || "ללא מערך"}
                      {instructor.route && ` • ${instructor.route}`}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium ${
                      instructor.allConfirmed && !instructor.hasShortages
                        ? "bg-green-100 text-green-700"
                        : instructor.hasShortages
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {instructor.allConfirmed && !instructor.hasShortages
                      ? "אושר הכל"
                      : instructor.hasShortages
                        ? "חוסרים"
                        : "ממתין"}
                  </span>

                  {/* Expand Arrow */}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Equipment Table */}
                {isExpanded && (
                  <div className="border-t px-4 pb-4">
                    <table className="w-full mt-3">
                      <thead>
                        <tr className="text-xs text-muted-foreground">
                          <th className="pb-2 text-right font-medium">ציוד</th>
                          <th className="pb-2 text-right font-medium">צפוי</th>
                          <th className="pb-2 text-right font-medium">
                            התקבל
                          </th>
                          <th className="pb-2 text-right font-medium">סטטוס</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {instructor.items.map((item) => {
                          const diff =
                            item.received_quantity !== null
                              ? item.expected_quantity - item.received_quantity
                              : null;

                          return (
                            <tr key={item.id} className="text-sm">
                              <td className="py-2.5 font-medium">
                                {item.equipment_name}
                                {item.is_extra && (
                                  <span className="mr-1.5 text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">
                                    נוסף
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 text-muted-foreground">
                                {item.expected_quantity}
                              </td>
                              <td className="py-2.5">
                                {item.received_quantity !== null
                                  ? item.received_quantity
                                  : "-"}
                              </td>
                              <td className="py-2.5">
                                {!item.is_confirmed ? (
                                  <span className="text-xs text-gray-500">
                                    ממתין
                                  </span>
                                ) : diff !== null && diff > 0 ? (
                                  <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                                    חסר {diff}
                                  </span>
                                ) : diff !== null && diff < 0 ? (
                                  <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                    עודף {Math.abs(diff)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-green-600">
                                    תקין
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Notes */}
                    {instructor.items.some((i) => i.notes) && (
                      <div className="mt-3 space-y-1">
                        {instructor.items
                          .filter((i) => i.notes)
                          .map((i) => (
                            <div
                              key={i.id}
                              className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2"
                            >
                              <strong>{i.equipment_name}:</strong> {i.notes}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
