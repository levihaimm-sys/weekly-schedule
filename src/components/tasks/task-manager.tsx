"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "@/lib/actions/tasks";
import {
  Plus,
  Check,
  Loader2,
  Trash2,
  ClipboardList,
  X,
  ChevronLeft,
  ChevronDown,
  CornerDownLeft,
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

// Soft pastel palette
const URGENCY_CONFIG = {
  urgent: { label: "דחוף", pill: "bg-rose-100 text-rose-800" },
  normal: { label: "רגיל", pill: "bg-violet-100 text-violet-800" },
  low: { label: "נמוך", pill: "bg-slate-100 text-slate-600" },
} as const;

const URGENCY_ORDER: Record<string, number> = { urgent: 0, normal: 1, low: 2 };

type TextField = "description" | "status_note" | "next_action";

const TEXT_PLACEHOLDER: Record<TextField, string> = {
  description: "מה המשימה?",
  status_note: "מה בוצע ומה המצב עכשיו?",
  next_action: "מה הצעד הבא?",
};

const TH = "border-b border-e border-stone-200 bg-stone-50 px-3 py-2.5 text-right text-sm font-semibold text-stone-600 last:border-e-0";
const TD = "border-b border-e border-stone-200 align-top last:border-e-0";

// Profile photos by name (files in public/avatars)
const AVATARS: Record<string, string> = {
  "חיים": "/avatars/haim.webp",
  "שירן": "/avatars/shiran.webp",
};

function Avatar({ name }: { name: string }) {
  const src = Object.entries(AVATARS).find(([key]) => name.includes(key))?.[1];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white" />
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
      {name.trim().charAt(0)}
    </span>
  );
}

function byUrgency(a: TaskWithProfiles, b: TaskWithProfiles) {
  const ua = URGENCY_ORDER[a.urgency] ?? 1;
  const ub = URGENCY_ORDER[b.urgency] ?? 1;
  if (ua !== ub) return ua - ub;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export function TaskManager({ tasks, admins }: TaskManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; field: TextField } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [subText, setSubText] = useState("");

  // Split into top-level tasks and subtasks
  const subtasksByParent = new Map<string, TaskWithProfiles[]>();
  for (const t of tasks) {
    if (!t.parent_id) continue;
    const list = subtasksByParent.get(t.parent_id) ?? [];
    list.push(t);
    subtasksByParent.set(t.parent_id, list);
  }
  const topLevel = tasks.filter((t) => !t.parent_id);

  const rows = topLevel
    .filter((t) => (showCompleted ? t.status === "completed" : t.status !== "completed"))
    .filter((t) => assigneeFilter === "all" || t.assigned_to === assigneeFilter)
    .sort(byUrgency);

  const openCount = topLevel.filter((t) => t.status !== "completed").length;
  const doneCount = topLevel.filter((t) => t.status === "completed").length;

  function getSubtasks(taskId: string) {
    return [...(subtasksByParent.get(taskId) ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  function toggleExpanded(taskId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  function handleAdd(formData: FormData) {
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

  function handleAddSubtask(parent: TaskWithProfiles) {
    const text = subText.trim();
    if (!text) return;
    const formData = new FormData();
    formData.set("description", text);
    formData.set("urgency", parent.urgency);
    formData.set("assigned_to", parent.assigned_to);
    formData.set("parent_id", parent.id);
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setSubText("");
        setExpanded((prev) => new Set(prev).add(parent.id));
        router.refresh();
      }
    });
  }

  function handleToggleDone(task: TaskWithProfiles) {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    startTransition(async () => {
      const result = await updateTaskStatus(task.id, newStatus);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function handleFieldUpdate(taskId: string, field: string, value: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const formData = new FormData();
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
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function startEdit(task: TaskWithProfiles, field: TextField) {
    setEditing({ id: task.id, field });
    setEditValue((task[field] as string | null) ?? "");
  }

  function saveEdit() {
    if (!editing) return;
    const task = tasks.find((t) => t.id === editing.id);
    const value = editValue.trim();
    const current = ((task?.[editing.field] as string | null) ?? "").trim();
    if (task && value !== current && !(editing.field === "description" && !value)) {
      handleFieldUpdate(editing.id, editing.field, value);
    }
    setEditing(null);
  }

  function handleDelete(task: TaskWithProfiles) {
    const subCount = subtasksByParent.get(task.id)?.length ?? 0;
    const msg = subCount > 0 ? `למחוק את המשימה ואת ${subCount} תתי המשימות שלה?` : "למחוק את המשימה?";
    if (!confirm(msg)) return;
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.error) alert(result.error);
      router.refresh();
    });
  }

  function renderTextCell(task: TaskWithProfiles, field: TextField, extraClass = "", leading?: ReactNode) {
    const value = (task[field] as string | null) ?? "";
    const isEditing = editing?.id === task.id && editing.field === field;

    return (
      <td className={TD}>
        <div className="flex items-start">
          {leading}
          {isEditing ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") setEditing(null);
              }}
              rows={3}
              autoFocus
              placeholder={TEXT_PLACEHOLDER[field]}
              className="block w-full resize-y border-0 bg-sky-50/60 px-3 py-2.5 text-sm leading-relaxed outline-none ring-2 ring-inset ring-sky-300"
            />
          ) : (
            <div
              onClick={() => startEdit(task, field)}
              title="לחץ לעריכה"
              className={`min-h-[44px] flex-1 cursor-text whitespace-pre-wrap break-words px-3 py-2.5 text-sm leading-relaxed hover:bg-stone-50 ${
                value ? `text-stone-800 ${extraClass}` : "text-stone-300"
              }`}
            >
              {value || TEXT_PLACEHOLDER[field]}
            </div>
          )}
        </div>
      </td>
    );
  }

  function renderRow(task: TaskWithProfiles, isSub: boolean) {
    const subtasks = isSub ? [] : getSubtasks(task.id);
    const openSubs = subtasks.filter((s) => s.status !== "completed").length;
    const isDone = task.status === "completed";
    const isBlocked = !isDone && openSubs > 0;
    const isOpen = expanded.has(task.id);
    const urgency = URGENCY_CONFIG[task.urgency as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.normal;

    const leading = isSub ? (
      <span className="mt-2.5 ps-3 text-stone-300">
        <CornerDownLeft size={14} />
      </span>
    ) : (
      <button
        onClick={() => toggleExpanded(task.id)}
        className="mt-2 flex shrink-0 items-center gap-0.5 rounded-md ps-2 pe-1 py-0.5 text-xs text-stone-400 hover:bg-stone-100 hover:text-stone-700"
        title={isOpen ? "הסתר תתי משימות" : "הצג תתי משימות"}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
        {subtasks.length > 0 && (
          <span className={openSubs === 0 ? "text-emerald-600" : ""}>
            {subtasks.length - openSubs}/{subtasks.length}
          </span>
        )}
      </button>
    );

    return (
      <tr key={task.id} className={`${isSub ? "bg-stone-50/60" : ""} ${isDone ? "opacity-60" : ""}`}>
        {/* Done checkbox */}
        <td className={`${TD} text-center`}>
          <button
            onClick={() => handleToggleDone(task)}
            disabled={isPending || isBlocked}
            title={
              isBlocked
                ? `יש להשלים קודם ${openSubs} תתי משימות`
                : isDone
                  ? "סמן כפתוחה"
                  : "סמן כהושלמה"
            }
            className={`mt-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed ${
              isDone
                ? "border-emerald-400 bg-emerald-400 text-white"
                : isBlocked
                  ? "border-stone-200 bg-stone-100 text-transparent"
                  : "border-stone-300 bg-white text-transparent hover:border-emerald-400 hover:text-emerald-400"
            }`}
          >
            <Check size={14} strokeWidth={3} />
          </button>
        </td>
        {renderTextCell(
          task,
          "description",
          `${isSub ? "" : "font-semibold"} ${isDone ? "line-through" : ""}`,
          leading
        )}
        {renderTextCell(task, "status_note")}
        {renderTextCell(task, "next_action")}
        <td className={`${TD} p-1.5`}>
          <select
            value={task.urgency}
            onChange={(e) => handleFieldUpdate(task.id, "urgency", e.target.value)}
            disabled={isPending}
            className={`w-full min-w-[80px] cursor-pointer appearance-none rounded-md px-2 py-1.5 text-center text-sm font-medium outline-none disabled:opacity-60 ${urgency.pill}`}
          >
            {Object.entries(URGENCY_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key} className="bg-white text-stone-800">
                {label}
              </option>
            ))}
          </select>
        </td>
        <td className={`${TD} p-1.5`}>
          {/* Avatar + name shown; a transparent select on top handles the change */}
          <div className="relative flex items-center justify-center gap-2 rounded-md px-2 py-1 hover:bg-stone-100">
            <Avatar name={task.assignee?.display_name ?? ""} />
            <span className="truncate text-sm font-medium text-stone-700">
              {task.assignee?.display_name}
            </span>
            <select
              value={task.assigned_to}
              onChange={(e) => handleFieldUpdate(task.id, "assigned_to", e.target.value)}
              disabled={isPending}
              title="שנה אחראי"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            >
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>{admin.display_name}</option>
              ))}
            </select>
          </div>
        </td>
        <td className={`${TD} text-center`}>
          <button
            onClick={() => handleDelete(task)}
            disabled={isPending}
            className="mt-2.5 text-stone-300 transition-colors hover:text-rose-500 disabled:opacity-50"
            title="מחק"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    );
  }

  function renderAddSubtaskRow(parent: TaskWithProfiles) {
    const isAdding = addingSubFor === parent.id;
    return (
      <tr key={`${parent.id}-add`} className="bg-stone-50/60">
        <td className={TD} />
        <td className={TD} colSpan={6}>
          {isAdding ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <input
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask(parent);
                  }
                  if (e.key === "Escape") {
                    setAddingSubFor(null);
                    setSubText("");
                  }
                }}
                autoFocus
                placeholder="תת משימה חדשה..."
                className="w-full max-w-md rounded-md border border-sky-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              />
              <button
                onClick={() => handleAddSubtask(parent)}
                disabled={isPending || !subText.trim()}
                className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                הוסף
              </button>
              <button
                onClick={() => {
                  setAddingSubFor(null);
                  setSubText("");
                }}
                className="rounded-md px-2 py-1.5 text-sm text-stone-500 hover:text-stone-800"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAddingSubFor(parent.id);
                setSubText("");
              }}
              className="flex items-center gap-1 px-6 py-2 text-sm text-sky-600 hover:text-sky-800"
            >
              <Plus size={14} />
              הוסף תת משימה
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setAddFormOpen(!addFormOpen);
            setError(null);
          }}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
        >
          <Plus size={16} />
          משימה חדשה
        </button>

        <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
          {[
            { done: false, label: "פתוחות", count: openCount },
            { done: true, label: "הושלמו", count: doneCount },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setShowCompleted(tab.done)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                showCompleted === tab.done ? "bg-sky-100 text-sky-800" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.label}
              <span className="mr-1 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">כל האחראים</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.display_name}
            </option>
          ))}
        </select>

        {assigneeFilter !== "all" && (
          <button
            onClick={() => setAssigneeFilter("all")}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-stone-500 hover:text-rose-600"
          >
            <X size={14} />
            נקה סינון
          </button>
        )}
      </div>

      {/* Add form */}
      {addFormOpen && (
        <form action={handleAdd} className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm font-semibold text-stone-600">
              משימה *
              <textarea name="description" required rows={3} placeholder={TEXT_PLACEHOLDER.description}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-normal resize-y" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-stone-600">
              סטטוס
              <textarea name="status_note" rows={3} placeholder={TEXT_PLACEHOLDER.status_note}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-normal resize-y" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-stone-600">
              פעולה לביצוע
              <textarea name="next_action" rows={3} placeholder={TEXT_PLACEHOLDER.next_action}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-normal resize-y" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select name="urgency" defaultValue="normal" className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
              {Object.entries(URGENCY_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select name="assigned_to" required defaultValue="" className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
              <option value="" disabled>אחראי...</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>{admin.display_name}</option>
              ))}
            </select>
            <div className="mr-auto flex gap-2">
              <button type="submit" disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                הוסף
              </button>
              <button type="button" onClick={() => { setAddFormOpen(false); setError(null); }}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm hover:bg-stone-50">
                ביטול
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </form>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white py-12 text-stone-400">
          <ClipboardList size={32} strokeWidth={1.5} />
          <p>אין משימות להצגה</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 border-s-4 border-s-sky-300 bg-white">
          <table className="w-full min-w-[950px] border-collapse">
            <thead>
              <tr>
                <th className={`${TH} w-12`} />
                <th className={`${TH} w-[26%]`}>משימה</th>
                <th className={`${TH} w-[30%]`}>סטטוס</th>
                <th className={`${TH} w-[26%]`}>פעולה לביצוע</th>
                <th className={`${TH} w-[100px] text-center`}>דחיפות</th>
                <th className={`${TH} w-[130px] text-center`}>אחראי</th>
                <th className={`${TH} w-10`} />
              </tr>
            </thead>
            <tbody>
              {rows.flatMap((task) => {
                const out = [renderRow(task, false)];
                if (expanded.has(task.id)) {
                  for (const sub of getSubtasks(task.id)) out.push(renderRow(sub, true));
                  out.push(renderAddSubtaskRow(task));
                }
                return out;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
