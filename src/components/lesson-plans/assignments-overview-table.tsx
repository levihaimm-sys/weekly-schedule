"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { updateWeeklyAssignment, createWeeklyAssignment } from "@/lib/actions/equipment";
import type { LessonPlan } from "@/types/database";

interface Assignment {
  id: string;
  instructor_id: string;
  week_start_date: string;
  is_permanent_change: boolean;
  instructor: { id: string; full_name: string };
  lesson_plan: { id: string; name: string; category: string; pdf_path: string | null; week_number: number };
}

interface OrderedInstructor {
  id: string;
  full_name: string;
  rotation_order: number;
}

interface EditingCell {
  week: string;
  instructorId: string;
  instructorName: string;
  assignmentId: string | null;
  currentLessonPlanId: string | null;
  currentLessonPlanName: string;
}

interface AssignmentsOverviewTableProps {
  assignments: Assignment[];
  instructorCities: Record<string, string>;
  currentWeekStart: string;
  lessonPlansByCategory: Record<string, LessonPlan[]>;
  orderedInstructors: OrderedInstructor[];
}

export function AssignmentsOverviewTable({
  assignments,
  instructorCities,
  currentWeekStart,
  lessonPlansByCategory,
  orderedInstructors,
}: AssignmentsOverviewTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [selectedLessonPlanId, setSelectedLessonPlanId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Use ordered instructors from DB; fall back to extracting from assignments
  const instructors = useMemo(() => {
    if (orderedInstructors.length > 0) {
      return orderedInstructors.map((inst) => ({
        id: inst.id,
        name: inst.full_name,
        city: instructorCities[inst.id] ?? "",
      }));
    }
    // Fallback: extract from assignments
    const map = new Map<string, { id: string; name: string; city: string }>();
    for (const a of assignments) {
      if (!map.has(a.instructor_id)) {
        map.set(a.instructor_id, {
          id: a.instructor_id,
          name: a.instructor.full_name,
          city: instructorCities[a.instructor_id] ?? "",
        });
      }
    }
    return [...map.values()];
  }, [orderedInstructors, assignments, instructorCities]);

  const { weeks, assignmentMap } = useMemo(() => {
    const weekSet = new Set<string>();
    const assignmentMap: Record<string, Record<string, Assignment>> = {};

    for (const a of assignments) {
      weekSet.add(a.week_start_date);
      if (!assignmentMap[a.week_start_date]) assignmentMap[a.week_start_date] = {};
      assignmentMap[a.week_start_date][a.instructor_id] = a;
    }

    return { weeks: [...weekSet].sort(), assignmentMap };
  }, [assignments]);

  // Determine which weeks are in the past (before current week) - these are read-only
  const isPastWeek = (week: string) => week < currentWeekStart;

  function formatWeekDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function handleCellClick(week: string, inst: { id: string; name: string }) {
    if (isPastWeek(week)) return; // Don't allow editing past weeks
    const assignment = assignmentMap[week]?.[inst.id];
    setEditingCell({
      week,
      instructorId: inst.id,
      instructorName: inst.name,
      assignmentId: assignment?.id ?? null,
      currentLessonPlanId: assignment?.lesson_plan?.id ?? null,
      currentLessonPlanName: assignment?.lesson_plan?.name ?? "",
    });
    setSelectedLessonPlanId(assignment?.lesson_plan?.id ?? "");
  }

  async function handleSave(isPermanent: boolean) {
    if (!editingCell || !selectedLessonPlanId) return;
    setSaving(true);

    try {
      if (editingCell.assignmentId) {
        await updateWeeklyAssignment(editingCell.assignmentId, selectedLessonPlanId, isPermanent);
      } else {
        await createWeeklyAssignment(
          editingCell.instructorId,
          selectedLessonPlanId,
          editingCell.week,
          isPermanent
        );
      }
      setEditingCell(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Error saving assignment:", err);
    } finally {
      setSaving(false);
    }
  }

  if (instructors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        <p>אין מדריכות עם סדר רוטציה מוגדר.</p>
        <p className="text-sm mt-2">
          יש להריץ את הסקריפט <code>scripts/add-rotation-order.sql</code> ב-Supabase כדי להגדיר את סדר הרוטציה.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm" dir="rtl">
          <thead>
            {/* City header row */}
            <tr className="bg-primary text-primary-foreground">
              <th
                className="sticky right-0 z-20 border border-primary/70 bg-primary px-3 py-2 text-center font-bold"
                rowSpan={2}
              >
                תאריך
              </th>
              {instructors.map((inst) => (
                <th
                  key={inst.id}
                  className="border border-primary/70 px-1 py-1 text-center text-[10px] font-normal"
                >
                  {inst.city || "—"}
                </th>
              ))}
            </tr>
            {/* Instructor name header row */}
            <tr className="bg-primary/80 text-primary-foreground">
              {instructors.map((inst) => (
                <th
                  key={inst.id}
                  className="border border-primary/60 px-2 py-1.5 text-center text-xs font-medium whitespace-nowrap"
                >
                  {inst.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => {
              const isCurrentWeek = week === currentWeekStart;
              const past = isPastWeek(week);
              return (
                <tr
                  key={week}
                  className={
                    isCurrentWeek
                      ? "bg-yellow-50 font-semibold"
                      : past
                        ? "bg-gray-50/50"
                        : "hover:bg-muted/30"
                  }
                >
                  <td
                    className={`sticky right-0 z-10 border border-border px-3 py-2 text-center font-bold whitespace-nowrap ${
                      isCurrentWeek
                        ? "bg-yellow-100"
                        : past
                          ? "bg-gray-100"
                          : "bg-background"
                    }`}
                  >
                    {formatWeekDate(week)}
                  </td>
                  {instructors.map((inst) => {
                    const assignment = assignmentMap[week]?.[inst.id];
                    const lessonName = assignment?.lesson_plan?.name ?? "";
                    const isEditing =
                      editingCell?.week === week && editingCell?.instructorId === inst.id;
                    return (
                      <td
                        key={inst.id}
                        onClick={() => handleCellClick(week, inst)}
                        className={`border border-border px-2 py-1.5 text-center text-xs whitespace-nowrap transition-colors ${
                          past
                            ? "text-muted-foreground cursor-default"
                            : "cursor-pointer"
                        } ${
                          isEditing
                            ? "bg-primary/20 ring-2 ring-primary ring-inset"
                            : isCurrentWeek
                              ? "bg-yellow-50 hover:bg-yellow-100"
                              : past
                                ? ""
                                : "hover:bg-primary/5"
                        } ${!lessonName ? "text-muted-foreground/50" : ""}`}
                      >
                        {lessonName || "—"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingCell && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setEditingCell(null)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">עריכת הקצאה</h3>
              <button
                onClick={() => setEditingCell(null)}
                className="rounded-lg p-1 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {/* Info */}
            <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">מדריכה:</span>
                <span className="font-medium">{editingCell.instructorName}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">שבוע:</span>
                <span className="font-medium">{formatWeekDate(editingCell.week)}</span>
              </div>
              {editingCell.currentLessonPlanName && (
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">מערך נוכחי:</span>
                  <span className="font-medium">{editingCell.currentLessonPlanName}</span>
                </div>
              )}
            </div>

            {/* Lesson plan selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">בחר מערך שיעור</label>
              <select
                value={selectedLessonPlanId}
                onChange={(e) => setSelectedLessonPlanId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">-- בחר מערך --</option>
                {Object.entries(lessonPlansByCategory).map(([category, plans]) => (
                  <optgroup key={category} label={category}>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSave(false)}
                disabled={
                  !selectedLessonPlanId ||
                  selectedLessonPlanId === editingCell.currentLessonPlanId ||
                  saving
                }
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "שומר..." : "שינוי חד-פעמי (רק למדריכה זו)"}
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={
                  !selectedLessonPlanId ||
                  selectedLessonPlanId === editingCell.currentLessonPlanId ||
                  saving
                }
                className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "שומר..." : "שינוי קבוע (משפיע על כל המדריכות)"}
              </button>
              <button
                onClick={() => setEditingCell(null)}
                disabled={saving}
                className="w-full rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
