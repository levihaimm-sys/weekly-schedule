"use client";

import { useState, useTransition } from "react";
import { Package, Check, AlertCircle, ChevronDown } from "lucide-react";
import { distributeEquipmentToInstructor } from "@/lib/actions/equipment";

interface Instructor {
  id: string;
  full_name: string;
  route: string | null;
  assignment: {
    id: string;
    lesson_plan_id: string;
    equipment_distributed: boolean;
    equipment_distributed_at: string | null;
    lesson_plan: {
      id: string;
      name: string;
      category: string;
    };
  } | null;
}

interface LessonPlan {
  id: string;
  name: string;
  category: string;
  week_number: number;
}

interface Props {
  instructors: Instructor[];
  allLessonPlans: LessonPlan[];
  weekStartDate: string;
}

export function EquipmentDistributionManager({
  instructors,
  allLessonPlans,
  weekStartDate,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [expandedInstructor, setExpandedInstructor] = useState<string | null>(
    null
  );
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<
    Record<string, string>
  >({});
  const [equipmentData, setEquipmentData] = useState<
    Record<string, Array<{ equipment_id: string; equipment_name: string; quantity: number }>>
  >({});

  // Group instructors by route
  const groupedInstructors = instructors.reduce(
    (acc, instructor) => {
      const route = instructor.route || "ללא מסלול";
      if (!acc[route]) acc[route] = [];
      acc[route].push(instructor);
      return acc;
    },
    {} as Record<string, Instructor[]>
  );

  const routes = Object.keys(groupedInstructors).sort();

  const handleLessonPlanChange = async (
    instructorId: string,
    lessonPlanId: string
  ) => {
    setSelectedLessonPlan((prev) => ({ ...prev, [instructorId]: lessonPlanId }));

    // Fetch equipment for this lesson plan
    const response = await fetch(
      `/api/lesson-plans/${lessonPlanId}/equipment`
    );
    if (response.ok) {
      const data = await response.json();
      setEquipmentData((prev) => ({ ...prev, [instructorId]: data.equipment }));
    }
  };

  const handleDistribute = (instructorId: string, assignmentId: string) => {
    const lessonPlanId =
      selectedLessonPlan[instructorId] ||
      instructors.find((i) => i.id === instructorId)?.assignment?.lesson_plan_id;

    if (!lessonPlanId) {
      alert("אנא בחר מערך");
      return;
    }

    startTransition(async () => {
      const result = await distributeEquipmentToInstructor(
        assignmentId,
        lessonPlanId
      );

      if (!result.success) {
        alert("שגיאה בחלוקת ציוד: " + result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {routes.map((route) => (
        <div key={route} className="rounded-xl border bg-card p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="text-primary" size={20} />
            מסלול: {route}
          </h2>

          <div className="space-y-3">
            {groupedInstructors[route].map((instructor) => {
              const assignment = instructor.assignment;
              const isDistributed = assignment?.equipment_distributed || false;
              const isExpanded = expandedInstructor === instructor.id;
              const currentLessonPlanId =
                selectedLessonPlan[instructor.id] || assignment?.lesson_plan_id;
              const equipment = equipmentData[instructor.id] || [];

              return (
                <div
                  key={instructor.id}
                  className={`rounded-lg border p-4 ${
                    isDistributed
                      ? "border-green-300 bg-green-50/50"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{instructor.full_name}</h3>
                        {isDistributed && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <Check size={14} />
                            חולק
                          </span>
                        )}
                      </div>

                      {assignment ? (
                        <div className="mt-2 space-y-2">
                          {/* Lesson Plan Selector */}
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              מערך:
                            </label>
                            <select
                              value={currentLessonPlanId || ""}
                              onChange={(e) =>
                                handleLessonPlanChange(
                                  instructor.id,
                                  e.target.value
                                )
                              }
                              disabled={isPending || isDistributed}
                              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                            >
                              <option value="">בחר מערך</option>
                              {allLessonPlans.map((plan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.name} ({plan.category})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Equipment List Toggle */}
                          {equipment.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedInstructor(
                                  isExpanded ? null : instructor.id
                                )
                              }
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                              {isExpanded ? "הסתר" : "הצג"} רשימת ציוד (
                              {equipment.length} פריטים)
                            </button>
                          )}

                          {/* Equipment List */}
                          {isExpanded && equipment.length > 0 && (
                            <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-3">
                              {equipment.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span>{item.equipment_name}</span>
                                  <span className="font-medium">
                                    {item.quantity} יחידות
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          אין שיבוץ לשבוע זה
                        </p>
                      )}
                    </div>

                    {/* Distribute Button */}
                    {assignment && !isDistributed && (
                      <button
                        onClick={() =>
                          handleDistribute(instructor.id, assignment.id)
                        }
                        disabled={isPending || !currentLessonPlanId}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isPending ? "מחלק..." : "אשר חלוקה"}
                      </button>
                    )}

                    {isDistributed && assignment?.equipment_distributed_at && (
                      <div className="text-xs text-muted-foreground">
                        חולק ב-
                        {new Date(
                          assignment.equipment_distributed_at
                        ).toLocaleDateString("he-IL")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {instructors.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <AlertCircle className="mx-auto mb-2 text-muted-foreground" size={32} />
          <p className="text-muted-foreground">אין מדריכים במערכת</p>
        </div>
      )}
    </div>
  );
}
