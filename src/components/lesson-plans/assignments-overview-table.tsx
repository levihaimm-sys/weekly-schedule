"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Download, Upload } from "lucide-react";
import { updateWeeklyAssignment, createWeeklyAssignment } from "@/lib/actions/equipment";
import { updateRotationOrders } from "@/lib/actions/instructors";
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
  const [importing, setImporting] = useState(false);
  const [replaceMode, setReplaceMode] = useState(true);
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    deleted: number;
    skipped: number;
    unknownInstructors: string[];
    unknownLessonPlans: string[];
    instructorsWithoutOrder: { name: string; id: string }[];
  } | null>(null);
  const [rotationDialog, setRotationDialog] = useState<{ name: string; id: string }[]>([]);
  const [rotationInputs, setRotationInputs] = useState<Record<string, string>>({});
  const [savingRotation, setSavingRotation] = useState(false);
  const [rotationError, setRotationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleExport() {
    const header = ["תאריך", ...instructors.map((i) => i.name)];
    const csvRows = [header.join(",")];

    for (const week of weeks) {
      const row = [week];
      for (const inst of instructors) {
        const name = assignmentMap[week]?.[inst.id]?.lesson_plan?.name ?? "";
        // Wrap in quotes to handle commas inside names
        row.push(`"${name.replace(/"/g, '""')}"`);
      }
      csvRows.push(row.join(","));
    }

    const csv = "\uFEFF" + csvRows.join("\n"); // BOM for Excel Hebrew support
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assignments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      // Strip BOM if present
      const content = text.startsWith("\uFEFF") ? text.slice(1) : text;
      const lines = content.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return;

      // Parse header: first column is date, rest are instructor names
      const headerCols = parseCSVLine(lines[0]);
      const instructorNames = headerCols.slice(1);

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const date = normalizeDate(cols[0]?.trim());
        if (!date) continue;

        const assignments = instructorNames.map((name, idx) => ({
          instructorName: name.trim(),
          lessonPlanName: (cols[idx + 1] ?? "").trim(),
        }));

        rows.push({ date, assignments });
      }

      const res = await fetch("/api/lesson-plans/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, replace: replaceMode }),
      });

      const result = await res.json();
      setImportResult(result);

      if (result.instructorsWithoutOrder?.length > 0) {
        setRotationDialog(result.instructorsWithoutOrder);
        setRotationInputs(
          Object.fromEntries(result.instructorsWithoutOrder.map((i: { name: string; id: string }) => [i.id, ""]))
        );
      }

      if (result.created > 0 || result.updated > 0 || result.deleted > 0) {
        // Delay refresh so the success message is visible before re-render
        setTimeout(() => {
          startTransition(() => router.refresh());
        }, 2000);
      }
    } finally {
      setImporting(false);
      // Reset file input so same file can be re-imported
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSaveRotation() {
    const updates = rotationDialog
      .map((inst) => ({
        id: inst.id,
        rotation_order: parseInt(rotationInputs[inst.id] ?? "", 10),
      }))
      .filter((u) => !isNaN(u.rotation_order));

    if (updates.length === 0) {
      setRotationError("יש להזין מיקום לפחות למדריכה אחת");
      return;
    }
    setRotationError(null);
    setSavingRotation(true);
    try {
      await updateRotationOrders(updates);
      setRotationDialog([]);
      startTransition(() => router.refresh());
    } finally {
      setSavingRotation(false);
    }
  }

  // Accepts YYYY-MM-DD, DD/MM/YYYY, or DD/MM/YY → returns YYYY-MM-DD or null
  function normalizeDate(raw: string | undefined): string | null {
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (slashMatch) {
      const [, d, m, y] = slashMatch;
      const year = y.length === 2 ? `20${y}` : y;
      return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return null;
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
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
      {/* Export / Import toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Download size={15} />
          ייצוא CSV
        </button>

        <label
          className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
            importing ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
          }`}
        >
          <Upload size={15} />
          {importing ? "מייבא..." : "ייבוא CSV"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            disabled={importing}
            onChange={handleImport}
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
          <input
            type="checkbox"
            checked={replaceMode}
            onChange={(e) => setReplaceMode(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className={replaceMode ? "font-medium text-red-600" : "text-muted-foreground"}>
            מחק והחלף (מוחק נתונים קיימים לפני ייבוא)
          </span>
        </label>

        {importResult && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              importResult.unknownInstructors.length > 0 || importResult.unknownLessonPlans.length > 0
                ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                : "border-green-300 bg-green-50 text-green-800"
            }`}
          >
            <span>
              נוצרו: {importResult.created} | עודכנו: {importResult.updated}
              {importResult.deleted > 0 && ` | נמחקו: ${importResult.deleted}`}
              {" "}| דולגו: {importResult.skipped}
            </span>
            {importResult.unknownInstructors.length > 0 && (
              <div className="mt-1 text-xs">מדריכות לא מזוהות: {importResult.unknownInstructors.join(", ")}</div>
            )}
            {importResult.unknownLessonPlans.length > 0 && (
              <div className="mt-1 text-xs">מערכי שיעור לא מזוהים: {importResult.unknownLessonPlans.join(", ")}</div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm" dir="rtl">
          <thead>
            {/* City header row */}
            <tr className="bg-secondary text-[#1C1917]">
              <th
                className="sticky right-0 z-20 border border-secondary/70 bg-secondary px-3 py-2 text-center font-bold"
                rowSpan={2}
              >
                תאריך
              </th>
              {instructors.map((inst) => (
                <th
                  key={inst.id}
                  className="border border-secondary/70 px-1 py-1 text-center text-[10px] font-normal"
                >
                  {inst.city || "—"}
                </th>
              ))}
            </tr>
            {/* Instructor name header row */}
            <tr className="bg-secondary/80 text-[#1C1917]">
              {instructors.map((inst) => (
                <th
                  key={inst.id}
                  className="border border-secondary/60 px-2 py-1.5 text-center text-xs font-medium whitespace-nowrap"
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
                      ? "bg-secondary/20 font-semibold"
                      : past
                        ? "bg-gray-50/50"
                        : "hover:bg-muted/30"
                  }
                >
                  <td
                    className={`sticky right-0 z-10 border border-border px-3 py-2 text-center font-bold whitespace-nowrap ${
                      isCurrentWeek
                        ? "bg-amber-200 text-amber-900"
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
                              ? "bg-amber-50 hover:bg-amber-100"
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

      {/* Rotation Order Dialog — shown after import when instructors have no rotation_order */}
      {rotationDialog.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl" dir="rtl">
            <h3 className="text-lg font-bold mb-2">מדריכות חדשות בטבלה</h3>
            <p className="text-sm text-muted-foreground mb-4">
              המדריכות הבאות קיימות במערכת אך לא מוגדרות בטבלת ההקצאות.
              הגדר מיקום לכל אחת כדי שתופיע בטבלה (1 = ראשונה).
            </p>
            <div className="space-y-3 mb-6">
              {rotationDialog.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between gap-3">
                  <span className="font-medium text-sm">{inst.name}</span>
                  <input
                    type="number"
                    min={1}
                    placeholder="מיקום"
                    value={rotationInputs[inst.id] ?? ""}
                    onChange={(e) =>
                      setRotationInputs((prev) => ({ ...prev, [inst.id]: e.target.value }))
                    }
                    className="w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-center"
                  />
                </div>
              ))}
            </div>
            {rotationError && (
              <p className="text-sm text-red-600 mb-3">{rotationError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSaveRotation}
                disabled={savingRotation}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {savingRotation ? "שומר..." : "שמור והוסף לטבלה"}
              </button>
              <button
                onClick={() => { setRotationDialog([]); setRotationError(null); }}
                disabled={savingRotation}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                דלג
              </button>
            </div>
          </div>
        </div>
      )}

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
