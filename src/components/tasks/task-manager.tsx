"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "@/lib/actions/tasks";
import {
  Plus,
  Check,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  ClipboardList,
  X,
  Star,
  Target,
  Activity,
  ArrowLeftCircle,
} from "lucide-react";
import type { TaskWithProfiles } from "@/types/database";

interface AdminProfile {
  id: string;
  display_name: string;
}

interface TaskManagerProps {
  tasks: TaskWithProfiles[];
  admins: AdminProfile[];
}

const URGENCY_CONFIG = {
  urgent: { label: "דחוף", color: "bg-red-50 text-red-700 border-red-200" },
  normal: { label: "רגיל", color: "bg-blue-50 text-blue-700 border-blue-200" },
  low: { label: "נמוך", color: "bg-gray-50 text-gray-600 border-gray-200" },
} as const;

const STATUS_CONFIG = {
  pending: { label: "ממתין", icon: Clock, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  in_progress: { label: "בטיפול", icon: AlertTriangle, color: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { label: "הושלם", icon: CheckCircle2, color: "bg-green-50 text-green-700 border-green-200" },
} as const;

const STATUS_TABS = [
  { key: "all", label: "הכל" },
  { key: "pending", label: "ממתין" },
  { key: "in_progress", label: "בטיפול" },
  { key: "completed", label: "הושלם" },
] as const;

type EditableField = "description" | "status_note" | "next_action";

const FIELD_CONFIG: Record<
  EditableField,
  {
    label: string;
    icon: typeof Target;
    box: string;
    title: string;
    text: string;
    placeholder: string;
    head: string;
    cell: string;
  }
> = {
  description: {
    label: "משימה",
    icon: Target,
    box: "border-stone-200 bg-stone-50",
    title: "text-stone-700",
    text: "text-lg font-bold leading-snug text-[#1C1917]",
    placeholder: "מה המשימה שיש לבצע?",
    head: "bg-stone-800 text-white",
    cell: "bg-white",
  },
  status_note: {
    label: "סטטוס",
    icon: Activity,
    box: "border-sky-200 bg-sky-50",
    title: "text-sky-800",
    text: "text-base leading-relaxed text-sky-950",
    placeholder: "מה בוצע עד עכשיו ומה המצב כרגע?",
    head: "bg-sky-700 text-white",
    cell: "bg-sky-50",
  },
  next_action: {
    label: "פעולה לביצוע",
    icon: ArrowLeftCircle,
    box: "border-orange-300 bg-orange-50",
    title: "text-orange-800",
    text: "text-base font-bold leading-relaxed text-orange-950",
    placeholder: "מה הצעד הבא שצריך לעשות?",
    head: "bg-orange-600 text-white",
    cell: "bg-orange-50",
  },
};

const FIELDS: EditableField[] = ["description", "status_note", "next_action"];

// Desktop table columns: controls | task | status | next action
const GRID_COLS = "md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.2fr)]";

export function TaskManager({ tasks, admins }: TaskManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; field: EditableField } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Filter tasks — "all" tab hides completed; only "completed" tab shows them
  const filtered = tasks.filter((t) => {
    if (statusFilter === "all" && t.status === "completed") return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && t.assigned_to !== assigneeFilter) return false;
    return true;
  });

  // Sort: completed last, priority first, then urgency, then newest
  const urgencyOrder: Record<string, number> = { urgent: 0, normal: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
    const ua = urgencyOrder[a.urgency] ?? 1;
    const ub = urgencyOrder[b.urgency] ?? 1;
    if (ua !== ub) return ua - ub;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const priorityTasks = sorted.filter((t) => t.is_priority && t.status !== "completed");
  const otherTasks = sorted.filter((t) => !(t.is_priority && t.status !== "completed"));

  const hasActiveFilters = statusFilter !== "all" || assigneeFilter !== "all";

  function clearFilters() {
    setStatusFilter("all");
    setAssigneeFilter("all");
  }

  const counts = {
    all: tasks.filter((t) => t.status !== "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  async function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setAddFormOpen(false);
        router.refresh();
      }
    });
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, newStatus);
      if (result.error) console.error("Error:", result.error);
      router.refresh();
    });
  }

  async function handleFieldUpdate(taskId: string, field: string, value: string) {
    const formData = new FormData();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    formData.set("description", task.description);
    formData.set("urgency", task.urgency);
    formData.set("assigned_to", task.assigned_to);
    formData.set("due_date", task.due_date ?? "");
    formData.set("status", task.status);
    formData.set("status_note", task.status_note ?? "");
    formData.set("next_action", task.next_action ?? "");
    formData.set("is_priority", task.is_priority ? "true" : "false");
    formData.set(field, value);

    startTransition(async () => {
      const result = await updateTask(taskId, formData);
      if (result.error) console.error("Error:", result.error);
      router.refresh();
    });
  }

  function startEdit(task: TaskWithProfiles, field: EditableField) {
    setEditing({ id: task.id, field });
    setEditValue((task[field] as string | null) ?? "");
  }

  async function saveEdit() {
    if (!editing) return;
    if (editing.field === "description" && !editValue.trim()) return;
    await handleFieldUpdate(editing.id, editing.field, editValue.trim());
    setEditing(null);
  }

  async function handleDelete(taskId: string) {
    if (!confirm("למחוק את המשימה?")) return;
    startTransition(async () => {
      const result = await deleteTask(taskId);
      if (result.error) console.error("Error:", result.error);
      router.refresh();
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    });
  }

  function renderField(task: TaskWithProfiles, field: EditableField, extra?: ReactNode) {
    const cfg = FIELD_CONFIG[field];
    const Icon = cfg.icon;
    const value = (task[field] as string | null) ?? "";
    const isEditing = editing?.id === task.id && editing.field === field;
    const isCompleted = task.status === "completed";

    return (
      <div className={`flex min-w-0 flex-col border-t border-stone-200 p-4 md:border-t-0 md:border-r-2 ${cfg.cell}`}>
        {/* Column label: shown on mobile only (desktop has the table header) */}
        <div className={`mb-2 flex items-center gap-1.5 text-sm font-extrabold md:hidden ${cfg.title}`}>
          <Icon size={16} strokeWidth={2.5} />
          {cfg.label}
        </div>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={field === "description" ? 3 : 5}
              className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm leading-relaxed resize-y"
              autoFocus
              placeholder={cfg.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") setEditing(null);
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                disabled={isPending}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                שמור
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => startEdit(task, field)}
            title="לחץ לעריכה"
            className={`flex-1 cursor-pointer whitespace-pre-wrap break-words rounded-md leading-relaxed transition-colors hover:bg-white/70 ${
              value ? cfg.text : "text-sm italic text-muted-foreground/60"
            } ${isCompleted && field === "description" ? "line-through text-muted-foreground" : ""}`}
          >
            {value || "לחץ להוספה"}
          </div>
        )}
        {extra}
      </div>
    );
  }

  function renderTask(task: TaskWithProfiles, index: number) {
    const urgency = URGENCY_CONFIG[task.urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.normal;
    const status = STATUS_CONFIG[task.status];
    const StatusIcon = status.icon;
    const isExpanded = expandedId === task.id;
    const isHighlighted = task.is_priority && task.status !== "completed";

    const meta = (
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-stone-200 pt-2">
        <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${urgency.color}`}>
          {urgency.label}
        </span>
        {task.assignee?.display_name && (
          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">
            {task.assignee.display_name}
          </span>
        )}
        {task.due_date && (
          <span className="text-xs font-medium text-red-700">עד {formatDate(task.due_date)}</span>
        )}
        <span className="text-[11px] text-muted-foreground/70">
          נוצר {formatDate(task.created_at)}
          {task.creator?.display_name && ` ע״י ${task.creator.display_name}`}
        </span>
      </div>
    );

    return (
      <div
        key={task.id}
        className={`border-b-4 border-stone-300 last:border-b-0 ${
          isHighlighted ? "border-s-8 border-s-amber-400" : "border-s-8 border-s-transparent"
        } ${task.status === "completed" ? "opacity-60" : ""}`}
      >
        <div className={`grid grid-cols-1 ${GRID_COLS}`}>
          {/* Controls column */}
          <div
            className={`flex items-center gap-1.5 p-3 md:flex-col md:items-center md:justify-start ${
              isHighlighted ? "bg-amber-50" : "bg-stone-50"
            }`}
          >
            <span className="text-lg font-extrabold text-stone-500">{index + 1}</span>
            <button
              onClick={() => handleFieldUpdate(task.id, "is_priority", task.is_priority ? "false" : "true")}
              disabled={isPending}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors disabled:opacity-50 ${
                task.is_priority
                  ? "border-amber-400 bg-amber-400 text-white hover:bg-amber-500"
                  : "border-stone-300 bg-white text-stone-400 hover:border-amber-400 hover:text-amber-500"
              }`}
              title={task.is_priority ? "הסר עדיפות" : "סמן בעדיפות"}
            >
              <Star size={18} fill={task.is_priority ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => {
                const nextStatus =
                  task.status === "pending"
                    ? "in_progress"
                    : task.status === "in_progress"
                      ? "completed"
                      : "pending";
                handleStatusChange(task.id, nextStatus);
              }}
              disabled={isPending}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors hover:opacity-80 disabled:opacity-50 ${status.color}`}
              title={`מצב: ${status.label} (לחץ לשנות)`}
            >
              <StatusIcon size={18} />
            </button>
            <div className="ms-auto flex items-center gap-0.5 md:ms-0 md:mt-auto md:flex-col">
              <button
                onClick={() => setExpandedId(isExpanded ? null : task.id)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={isExpanded ? "סגור" : "עריכה מהירה"}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                disabled={isPending}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="מחק"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {renderField(task, "description", meta)}
          {renderField(task, "status_note")}
          {renderField(task, "next_action")}
        </div>

        {/* Inline quick-edit panel */}
        {isExpanded && (
          <div className="flex flex-wrap items-center gap-3 border-t border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">דחיפות:</span>
              <div className="flex rounded-lg border border-border">
                {Object.entries(URGENCY_CONFIG).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => handleFieldUpdate(task.id, "urgency", key)}
                    disabled={isPending}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-r-lg last:rounded-l-lg disabled:opacity-50 ${
                      task.urgency === key ? color : "hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">מצב:</span>
              <div className="flex rounded-lg border border-border">
                {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => handleFieldUpdate(task.id, "status", key)}
                    disabled={isPending}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-r-lg last:rounded-l-lg disabled:opacity-50 ${
                      task.status === key ? color : "hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">אחראי:</span>
              <select
                value={task.assigned_to}
                onChange={(e) => handleFieldUpdate(task.id, "assigned_to", e.target.value)}
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs disabled:opacity-50"
              >
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">תאריך יעד:</span>
              <input
                type="date"
                value={task.due_date ?? ""}
                onChange={(e) => handleFieldUpdate(task.id, "due_date", e.target.value)}
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs disabled:opacity-50"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {counts.pending} ממתינות | {counts.in_progress} בטיפול | {counts.completed} הושלמו
          </p>
        </div>
        <button
          onClick={() => {
            setAddFormOpen(!addFormOpen);
            setError(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          משימה חדשה
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border bg-muted/30">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } ${tab.key === "all" ? "rounded-r-lg" : ""} ${
                tab.key === "completed" ? "rounded-l-lg" : ""
              }`}
            >
              {tab.label}
              <span className="mr-1.5 text-xs text-muted-foreground">
                ({counts[tab.key]})
              </span>
            </button>
          ))}
        </div>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">כל האחראים</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.display_name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <X size={14} />
            נקה סינון
          </button>
        )}
      </div>

      {/* Add form */}
      {addFormOpen && (
        <form
          action={handleAdd}
          className="rounded-xl border border-secondary/40 bg-secondary/5 p-4"
        >
          <h3 className="mb-3 font-medium">משימה חדשה</h3>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              {(["description", "status_note", "next_action"] as EditableField[]).map((field) => {
                const cfg = FIELD_CONFIG[field];
                const Icon = cfg.icon;
                return (
                  <label key={field} className={`flex flex-col rounded-xl border-2 p-3 ${cfg.box}`}>
                    <span className={`mb-1.5 flex items-center gap-1.5 text-xs font-extrabold ${cfg.title}`}>
                      <Icon size={15} strokeWidth={2.5} />
                      {cfg.label}
                      {field === "description" && " *"}
                    </span>
                    <textarea
                      name={field}
                      required={field === "description"}
                      placeholder={cfg.placeholder}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-sm resize-y"
                    />
                  </label>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                name="urgency"
                defaultValue="normal"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {Object.entries(URGENCY_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                name="assigned_to"
                required
                defaultValue=""
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  לטיפול...
                </option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.display_name}
                  </option>
                ))}
              </select>
              <input
                name="due_date"
                type="date"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                <input type="checkbox" name="is_priority" className="accent-amber-500" />
                <Star size={14} />
                בעדיפות
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                הוסף
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddFormOpen(false);
                  setError(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>
      )}

      {/* Tasks list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background py-12 text-muted-foreground">
          <ClipboardList size={32} strokeWidth={1.5} />
          <p>אין משימות להצגה</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border-2 border-stone-300 bg-background shadow-sm">
          {/* Table header (desktop) */}
          <div className={`hidden md:grid ${GRID_COLS}`}>
            <div className="bg-stone-800" />
            {FIELDS.map((field) => {
              const cfg = FIELD_CONFIG[field];
              const Icon = cfg.icon;
              return (
                <div
                  key={field}
                  className={`flex items-center gap-2 border-r-2 border-white/30 px-4 py-3 text-base font-extrabold ${cfg.head}`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  {cfg.label}
                </div>
              );
            })}
          </div>

          {priorityTasks.length > 0 && (
            <>
              <div className="flex items-center gap-2 border-b-2 border-amber-300 bg-amber-100 px-4 py-2 text-base font-extrabold text-amber-800">
                <Star size={18} fill="currentColor" />
                בעדיפות ({priorityTasks.length})
              </div>
              {priorityTasks.map((t, i) => renderTask(t, i))}
            </>
          )}
          {otherTasks.length > 0 && (
            <>
              {priorityTasks.length > 0 && (
                <div className="border-y-2 border-stone-300 bg-stone-100 px-4 py-2 text-base font-bold text-stone-600">
                  שאר המשימות ({otherTasks.length})
                </div>
              )}
              {otherTasks.map((t, i) => renderTask(t, priorityTasks.length + i))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
