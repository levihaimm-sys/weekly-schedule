"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import type { WeeklyLessonAssignmentWithDetails } from "@/types/database";

interface WeeklyAssignmentsGridProps {
  assignments: WeeklyLessonAssignmentWithDetails[];
  weekStartDate: string;
}

export function WeeklyAssignmentsGrid({
  assignments,
  weekStartDate: initialWeekStartDate,
}: WeeklyAssignmentsGridProps) {
  const [weekStartDate, setWeekStartDate] = useState(initialWeekStartDate);

  // Parse date
  const currentWeek = new Date(weekStartDate);
  const weekEnd = new Date(currentWeek);
  weekEnd.setDate(currentWeek.getDate() + 6);

  // Navigation handlers
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    const newDate = prevWeek.toISOString().split("T")[0];
    window.location.href = `/lesson-plans/assignments?week=${newDate}`;
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    const newDate = nextWeek.toISOString().split("T")[0];
    window.location.href = `/lesson-plans/assignments?week=${newDate}`;
  };

  const goToToday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    const newDate = sunday.toISOString().split("T")[0];
    window.location.href = `/lesson-plans/assignments?week=${newDate}`;
  };

  return (
    <div>
      {/* Week Navigator */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="שבוע קודם"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="text-lg font-semibold">
            {currentWeek.toLocaleDateString("he-IL", {
              day: "numeric",
              month: "long",
            })}{" "}
            -{" "}
            {weekEnd.toLocaleDateString("he-IL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1 mx-auto"
          >
            <Calendar className="w-4 h-4" />
            חזור לשבוע הנוכחי
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="שבוע הבא"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-lg text-yellow-800">
            אין הקצאות עבור שבוע זה
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            ניתן ליצור הקצאות חדשות בלחיצה על "הוסף הקצאה"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {assignment.instructor.full_name}
                    </h3>
                    {assignment.is_permanent_change && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        שינוי קבוע
                      </span>
                    )}
                  </div>
                  {/* TODO: Add edit functionality */}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-sm text-gray-500 mb-1">מערך שיעור</div>
                  <div className="font-medium text-gray-900">
                    {assignment.lesson_plan.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {assignment.lesson_plan.category}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  שבוע #{assignment.lesson_plan.week_number}
                </div>
              </div>

              {/* Card Footer - Equipment Status */}
              {assignment.equipment_confirmations &&
                assignment.equipment_confirmations.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">אישורי ציוד</span>
                      <span className="font-medium">
                        {
                          assignment.equipment_confirmations.filter(
                            (c: any) => c.is_confirmed
                          ).length
                        }
                        /{assignment.equipment_confirmations.length}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
