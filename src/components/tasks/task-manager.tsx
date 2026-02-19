"use client";

import { useState, useTransition } from "react";
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

export function TaskManager({ tasks, admins }: TaskManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingDescId, setEditingDescId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Filter tasks
  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && t.assigned_to !== assigneeFilter) return false;
    return true;
  });

  // Sort: urgency order (urgent > normal > low), then by date
  const urgencyOrder: Record<string, number> = { urgent: 0, normal: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    const ua = urgencyOrder[a.urgency] ?? 1;
    const ub = urgencyOrder[b.urgency] ?? 1;
    if (ua !== ub) return ua - ub;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const counts = {
    all: tasks.length,
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
    formData.set(field, value);

    startTransition(async () => {
      const result = await updateTask(taskId, formData);
      if (result.error) console.error("Error:", result.error);
      router.refresh();
    });
  }

  async function handleDescriptionSave(taskId: string) {
    if (!editDescription.trim()) return;
    await handleFieldUpdate(taskId, "description", editDescription);
    setEditingDescId(null);
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
      </div>

      {/* Add form */}
      {addFormOpen && (
        <form
          action={handleAdd}
          className="rounded-xl border border-secondary/40 bg-secondary/5 p-4"
        >
          <h3 className="mb-3 font-medium">משימה חדשה</h3>
          <div className="space-y-3">
            <textarea
              name="description"
              required
              placeholder="תיאור המשימה..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
            />
            <div className="flex flex-wrap gap-3">
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
      <div className="divide-y divide-border rounded-xl border border-border bg-background">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <ClipboardList size={32} strokeWidth={1.5} />
            <p>אין משימות להצגה</p>
          </div>
        ) : (
          sorted.map((task) => {
            const urgency = URGENCY_CONFIG[task.urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.normal;
            const status = STATUS_CONFIG[task.status];
            const StatusIcon = status.icon;
            const isExpanded = expandedId === task.id;
            const isEditingDesc = editingDescId === task.id;

            return (
              <div
                key={task.id}
                className={`transition-colors ${
                  task.status === "completed" ? "opacity-60" : ""
                }`}
              >
                {/* Main row */}
                <div className="flex items-start gap-3 p-4">
                  {/* Status icon button */}
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
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${status.color} hover:opacity-80 disabled:opacity-50`}
                    title={`סטטוס: ${status.label} (לחץ לשנות)`}
                  >
                    <StatusIcon size={16} />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditingDesc ? (
                      <div className="flex gap-2">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={2}
                          className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm resize-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleDescriptionSave(task.id);
                            }
                            if (e.key === "Escape") setEditingDescId(null);
                          }}
                        />
                        <button
                          onClick={() => handleDescriptionSave(task.id)}
                          disabled={isPending}
                          className="rounded-lg bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        </button>
                      </div>
                    ) : (
                      <p
                        className={`text-base cursor-pointer hover:text-orange-600 ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                        onClick={() => {
                          setEditingDescId(task.id);
                          setEditDescription(task.description);
                        }}
                        title="לחץ לעריכת תיאור"
                      >
                        {task.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-medium ${urgency.color}`}
                      >
                        {urgency.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {task.assignee?.display_name}
                      </span>
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          עד {formatDate(task.due_date)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground/60">
                        נוצר {formatDate(task.created_at)}
                        {task.creator?.display_name &&
                          ` ע״י ${task.creator.display_name}`}
                      </span>
                    </div>
                  </div>

                  {/* Expand/collapse + delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : task.id)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={isExpanded ? "סגור" : "עריכה מהירה"}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="מחק"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Inline quick-edit panel */}
                {isExpanded && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border/50 bg-muted/20 px-4 py-3">
                    {/* Urgency */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">דחיפות:</span>
                      <div className="flex rounded-lg border border-border">
                        {Object.entries(URGENCY_CONFIG).map(([key, { label, color }]) => (
                          <button
                            key={key}
                            onClick={() => handleFieldUpdate(task.id, "urgency", key)}
                            disabled={isPending}
                            className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-r-lg last:rounded-l-lg disabled:opacity-50 ${
                              task.urgency === key
                                ? color
                                : "hover:bg-muted"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">סטטוס:</span>
                      <div className="flex rounded-lg border border-border">
                        {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                          <button
                            key={key}
                            onClick={() => handleFieldUpdate(task.id, "status", key)}
                            disabled={isPending}
                            className={`px-2.5 py-1 text-xs font-medium transition-colors first:rounded-r-lg last:rounded-l-lg disabled:opacity-50 ${
                              task.status === key
                                ? color
                                : "hover:bg-muted"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Assignee */}
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

                    {/* Due date */}
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
          })
        )}
      </div>
    </div>
  );
}
