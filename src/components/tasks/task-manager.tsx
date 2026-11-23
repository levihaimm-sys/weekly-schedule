"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/actions/tasks";
import { Plus, Check, Loader2, Trash2, ClipboardList, X } from "lucide-react";
import type { TaskWithProfiles } from "@/types/database";

interface AdminProfile {
  id: string;
  display_name: string;
}

interface TaskManagerProps {
  tasks: TaskWithProfiles[];
  admins: AdminProfile[];
}

// Soft pastel palettes
const STATUS_CONFIG = {
  pending: { label: "ממתין", pill: "bg-amber-100 text-amber-800" },
  in_progress: { label: "בטיפול", pill: "bg-sky-100 text-sky-800" },
  completed: { label: "הושלם", pill: "bg-emerald-100 text-emerald-800" },
} as const;

const URGENCY_CONFIG = {
  urgent: { label: "דחוף", pill: "bg-rose-100 text-rose-800" },
  normal: { label: "רגיל", pill: "bg-violet-100 text-violet-800" },
  low: { label: "נמוך", pill: "bg-slate-100 text-slate-600" },
} as const;

const STATUS_TABS = [
  { key: "all", label: "פתוחות" },
  { key: "pending", label: "ממתין" },
  { key: "in_progress", label: "בטיפול" },
  { key: "completed", label: "הושלם" },
] as const;

type TextField = "description" | "status_note" | "next_action";

const TEXT_PLACEHOLDER: Record<TextField, string> = {
  description: "מה המשימה?",
  status_note: "מה בוצע ומה המצב עכשיו?",
  next_action: "מה הצעד הבא?",
};

const TH = "border-b border-e border-stone-200 bg-stone-50 px-3 py-2.5 text-right text-sm font-semibold text-stone-600 last:border-e-0";
const TD = "border-b border-e border-stone-200 align-top last:border-e-0";

export function TaskManager({ tasks, admins }: TaskManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; field: TextField } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // "all" tab hides completed; only "completed" tab shows them
  const filtered = tasks.filter((t) => {
    if (statusFilter === "all" && t.status === "completed") return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && t.assigned_to !== assigneeFilter) return false;
    return true;
  });

  const urgencyOrder: Record<string, number> = { urgent: 0, normal: 1, low: 2 };
  const sorted = [...filtered].sort((a, b) => {
    const ua = urgencyOrder[a.urgency] ?? 1;
    const ub = urgencyOrder[b.urgency] ?? 1;
    if (ua !== ub) return ua - ub;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const groups = [
    {
      key: "priority",
      title: "בעדיפות",
      accent: "border-amber-300",
      titleColor: "text-amber-600",
      rows: sorted.filter((t) => t.is_priority),
    },
    {
      key: "rest",
      title: "שאר המשימות",
      accent: "border-sky-300",
      titleColor: "text-sky-600",
      rows: sorted.filter((t) => !t.is_priority),
    },
  ].filter((g) => g.rows.length > 0);

  const hasActiveFilters = statusFilter !== "all" || assigneeFilter !== "all";

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
      if (result.error) console.error("Error:", result.error);
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

  function handleDelete(taskId: string) {
    if (!confirm("למחוק את המשימה?")) return;
    startTransition(async () => {
      const result = await deleteTask(taskId);
      if (result.error) console.error("Error:", result.error);
      router.refresh();
    });
  }

  function renderTextCell(task: TaskWithProfiles, field: TextField, extraClass = "") {
    const value = (task[field] as string | null) ?? "";
    const isEditing = editing?.id === task.id && editing.field === field;

    return (
      <td className={TD}>
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
            className={`min-h-[44px] cursor-text whitespace-pre-wrap break-words px-3 py-2.5 text-sm leading-relaxed hover:bg-stone-50 ${
              value ? `text-stone-800 ${extraClass}` : "text-stone-300"
            }`}
          >
            {value || TEXT_PLACEHOLDER[field]}
          </div>
        )}
      </td>
    );
  }

  function renderPillSelect(
    value: string,
    options: Record<string, { label: string; pill: string }>,
    onChange: (v: string) => void
  ) {
    const current = options[value] ?? Object.values(options)[0];
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending}
        className={`w-full min-w-[90px] cursor-pointer appearance-none rounded-md px-2 py-1.5 text-center text-sm font-medium outline-none disabled:opacity-60 ${current.pill}`}
      >
        {Object.entries(options).map(([key, { label }]) => (
          <option key={key} value={key} className="bg-white text-stone-800">
            {label}
          </option>
        ))}
      </select>
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
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-sky-100 text-sky-800"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.label}
              <span className="mr-1 text-xs opacity-70">({counts[tab.key]})</span>
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

        {hasActiveFilters && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setAssigneeFilter("all");
            }}
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
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-amber-700">
              <input type="checkbox" name="is_priority" className="accent-amber-500" />
              בעדיפות
            </label>
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

      {/* Table groups */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white py-12 text-stone-400">
          <ClipboardList size={32} strokeWidth={1.5} />
          <p>אין משימות להצגה</p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="space-y-2">
            <h4 className={`text-base font-bold ${group.titleColor}`}>
              {group.title} <span className="text-sm font-normal text-stone-400">({group.rows.length})</span>
            </h4>
            <div className={`overflow-x-auto rounded-lg border border-stone-200 border-s-4 ${group.accent} bg-white`}>
              <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                  <tr>
                    <th className={`${TH} w-[24%]`}>משימה</th>
                    <th className={`${TH} w-[28%]`}>סטטוס</th>
                    <th className={`${TH} w-[24%]`}>פעולה לביצוע</th>
                    <th className={`${TH} w-[120px] text-center`}>מצב</th>
                    <th className={`${TH} w-[110px] text-center`}>דחיפות</th>
                    <th className={`${TH} w-[130px] text-center`}>אחראי</th>
                    <th className={`${TH} w-10`} />
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((task) => (
                    <tr key={task.id} className={task.status === "completed" ? "opacity-60" : ""}>
                      {renderTextCell(task, "description", `font-semibold ${task.status === "completed" ? "line-through" : ""}`)}
                      {renderTextCell(task, "status_note")}
                      {renderTextCell(task, "next_action")}
                      <td className={`${TD} p-1.5`}>
                        {renderPillSelect(task.status, STATUS_CONFIG, (v) => handleFieldUpdate(task.id, "status", v))}
                      </td>
                      <td className={`${TD} p-1.5`}>
                        {renderPillSelect(task.urgency, URGENCY_CONFIG, (v) => handleFieldUpdate(task.id, "urgency", v))}
                      </td>
                      <td className={`${TD} p-1.5`}>
                        <select
                          value={task.assigned_to}
                          onChange={(e) => handleFieldUpdate(task.id, "assigned_to", e.target.value)}
                          disabled={isPending}
                          className="w-full cursor-pointer appearance-none rounded-md bg-stone-100 px-2 py-1.5 text-center text-sm font-medium text-stone-700 outline-none hover:bg-stone-200 disabled:opacity-60"
                        >
                          {admins.map((admin) => (
                            <option key={admin.id} value={admin.id}>{admin.display_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={`${TD} text-center`}>
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={isPending}
                          className="mt-2.5 text-stone-300 transition-colors hover:text-rose-500 disabled:opacity-50"
                          title="מחק"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
