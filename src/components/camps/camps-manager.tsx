"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, Trash2, ChevronDown, Pencil, Clock, Users } from "lucide-react";
import { addCampRequest, assignGroupInstructor, deleteCampRequest } from "@/lib/actions/camps";
import { CampRequestModal } from "./camp-request-modal";
import type { CampRequestWithGroups, Instructor } from "@/types/database";

interface Props {
  requests: CampRequestWithGroups[];
  instructors: Instructor[];
}

function formatDate(dateStr: string) {
  // dateStr is "YYYY-MM-DD" — format as DD.MM.YYYY without going through a Date object
  // (which would shift by timezone).
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

export function CampsManager({ requests, instructors }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<CampRequestWithGroups | null>(null);

  const [clientName, setClientName] = useState("");
  const [area, setArea] = useState("");
  const [campDate, setCampDate] = useState("");
  const [numGroups, setNumGroups] = useState("1");
  const [startTimeNote, setStartTimeNote] = useState("");
  const [notes, setNotes] = useState("");

  const activeInstructors = instructors.filter((i) => i.is_active);
  const instructorById = new Map(instructors.map((i) => [i.id, i]));

  async function handleAdd() {
    setError(null);
    setIsPending(true);
    const result = await addCampRequest({
      client_name: clientName,
      area,
      camp_date: campDate,
      num_groups: Number(numGroups) || 1,
      start_time_note: startTimeNote,
      notes,
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAddFormOpen(false);
    setClientName("");
    setArea("");
    setCampDate("");
    setNumGroups("1");
    setStartTimeNote("");
    setNotes("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteCampRequest(id);
    router.refresh();
  }

  async function handleAssign(groupId: string, instructorId: string) {
    await assignGroupInstructor(groupId, instructorId || null);
    router.refresh();
  }

  const sorted = [...requests].sort((a, b) => a.camp_date.localeCompare(b.camp_date));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {requests.length} בקשות קייטנה · לקליטת בקשות משיבוץ ושיוך מדריכים בלבד — השיעורים
          המלאים (כתובות, שעות) יוזנו בהמשך ללוח הקבוע
        </p>
        <button
          onClick={() => setAddFormOpen(!addFormOpen)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          הוסף בקשת קייטנה
        </button>
      </div>

      {addFormOpen && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
          <h3 className="mb-3 font-medium">בקשת קייטנה חדשה</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">לקוח (לא חובה)</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="מתנ״ס דרום ת״א"
                  className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">אזור / מיקום</label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="צפון תל אביב"
                  className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">תאריך</label>
                <input
                  type="date"
                  value={campDate}
                  onChange={(e) => setCampDate(e.target.value)}
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">כמות קבוצות</label>
                <input
                  type="number"
                  min={1}
                  value={numGroups}
                  onChange={(e) => setNumGroups(e.target.value)}
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שעת התחלה (טקסט חופשי)</label>
                <input
                  value={startTimeNote}
                  onChange={(e) => setStartTimeNote(e.target.value)}
                  placeholder="החל מ-9 בבוקר"
                  className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">הערות</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות חופשיות"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                הוסף
              </button>
              <button
                onClick={() => {
                  setAddFormOpen(false);
                  setError(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((r) => {
          const assignedCount = r.groups.filter((g) => g.instructor_id).length;
          const isExpanded = expandedId === r.id;
          const badgeColor =
            assignedCount === 0
              ? "bg-gray-50 text-gray-600 border-gray-200"
              : assignedCount === r.num_groups
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200";

          return (
            <div key={r.id} className="rounded-xl border border-border bg-background">
              <div
                onClick={() => setExpandedId(isExpanded ? null : r.id)}
                className="flex cursor-pointer items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{r.area}</p>
                    <span dir="ltr" className="text-sm text-muted-foreground">
                      {formatDate(r.camp_date)}
                    </span>
                    <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                      <Users size={12} />
                      {assignedCount}/{r.num_groups} שובצו
                    </span>
                  </div>
                  <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    {r.client_name && <span>{r.client_name}</span>}
                    {r.client_name && r.start_time_note && <span>·</span>}
                    {r.start_time_note && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {r.start_time_note}
                      </span>
                    )}
                  </p>
                  {r.notes && <p className="mt-0.5 text-xs text-muted-foreground">{r.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingRequest(r);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="ערוך פרטים"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(r.id);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600"
                    title="מחק"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-1.5 border-t border-border p-3">
                  {r.groups
                    .slice()
                    .sort((a, b) => a.group_number - b.group_number)
                    .map((g) => (
                      <div key={g.id} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-sm text-muted-foreground">קבוצה {g.group_number}</span>
                        <select
                          value={g.instructor_id ?? ""}
                          onChange={(e) => handleAssign(g.id, e.target.value)}
                          className={`w-56 rounded-lg border px-3 py-1.5 text-sm ${
                            g.instructor_id ? "border-border bg-background" : "border-dashed border-border bg-muted/30"
                          }`}
                        >
                          <option value="">— לא שובץ מדריך —</option>
                          {activeInstructors.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.full_name}
                            </option>
                          ))}
                          {g.instructor_id && !activeInstructors.some((i) => i.id === g.instructor_id) && (
                            <option value={g.instructor_id}>{instructorById.get(g.instructor_id)?.full_name ?? "?"}</option>
                          )}
                        </select>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-sm text-muted-foreground">אין בקשות קייטנה עדיין</p>}
      </div>

      {editingRequest && <CampRequestModal request={editingRequest} onClose={() => setEditingRequest(null)} />}
    </div>
  );
}
