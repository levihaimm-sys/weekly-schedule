"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { he } from "date-fns/locale";
import {
  Check,
  CheckCircle2,
  RotateCcw,
  X,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  addCampNeed,
  updateCampNeed,
  updateCampNeedStatus,
  deleteCampNeed,
  addCampAssignment,
  confirmCampAssignment,
  unconfirmCampAssignment,
  deleteCampAssignment,
} from "@/lib/actions/camp-staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type {
  CampStaffingNeed,
  CampStaffingAvailability,
  CampStaffingAssignment,
  CampSession,
} from "@/types/database";

interface Props {
  session: CampSession;
  needs: CampStaffingNeed[];
  availability: CampStaffingAvailability[];
  assignments: CampStaffingAssignment[];
  isArchived: boolean;
}

type NeedStatus = "open" | "partially_filled" | "filled";

const NEED_STATUS_LABEL: Record<NeedStatus, string> = {
  open: "פתוח",
  partially_filled: "חלקי",
  filled: "מלא",
};

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  partially_filled: "bg-amber-50 text-amber-700 border-amber-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

function formatCampDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return `${format(d, "EEEE", { locale: he })} ${format(d, "d/M")}`;
}

export function CampMatchingTab({ session, needs, availability, assignments, isArchived }: Props) {
  const router = useRouter();
  const [search, setSearch] = usePersistedState("camp-matching-search", "");
  const [areaFilter, setAreaFilter] = usePersistedState<string[]>("camp-matching-area", []);
  const [dateFilter, setDateFilter] = usePersistedState<string[]>("camp-matching-date", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("camp-matching-status", []);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkName, setBulkName] = useState("");
  const [bulkPending, setBulkPending] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<CampStaffingNeed | null>(null);

  const hasActiveFilters = search.trim() !== "" || areaFilter.length > 0 || dateFilter.length > 0 || statusFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setAreaFilter([]);
    setDateFilter([]);
    setStatusFilter([]);
  }

  const sortHe = (a: string, b: string) => a.localeCompare(b, "he");
  const areaOptions = (Array.from(new Set(needs.map((n) => n.area).filter(Boolean))) as string[]).sort(sortHe);
  const dateOptions = Array.from(new Set(needs.map((n) => n.camp_date))).sort();

  const filtered = useMemo(() => {
    return needs.filter((n) => {
      if (areaFilter.length > 0 && !areaFilter.includes(n.area ?? "")) return false;
      if (dateFilter.length > 0 && !dateFilter.includes(n.camp_date)) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(n.status)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !n.client_name.toLowerCase().includes(q) &&
          !(n.area ?? "").toLowerCase().includes(q) &&
          !(n.field ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [needs, areaFilter, dateFilter, statusFilter, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => a.camp_date.localeCompare(b.camp_date) || a.client_name.localeCompare(b.client_name, "he"));
  }, [filtered]);

  const allSelected = sorted.length > 0 && sorted.every((n) => selectedIds.has(n.id));

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(sorted.map((n) => n.id)));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkName("");
    setConfirmBulkDelete(false);
  }

  async function handleBulkAssign() {
    const name = bulkName.trim();
    if (!name || selectedIds.size === 0) return;
    setBulkPending(true);
    for (const needId of selectedIds) {
      const need = needs.find((n) => n.id === needId);
      if (!need) continue;
      const alreadyLinked = new Set(
        assignments.filter((a) => a.need_id === needId).map((a) => a.availability_id).filter(Boolean) as string[]
      );
      const matchedSlot =
        availability.find(
          (a) =>
            !alreadyLinked.has(a.id) &&
            a.instructor_name.includes(name) &&
            (need.camp_date === a.camp_date || a.camp_date === null)
        ) ?? null;
      await addCampAssignment({
        need_id: needId,
        instructor_name: name,
        availability_id: matchedSlot?.id ?? null,
      });
    }
    setBulkPending(false);
    setBulkName("");
    router.refresh();
  }

  async function handleBulkStatus(status: NeedStatus) {
    setBulkPending(true);
    for (const needId of selectedIds) {
      await updateCampNeedStatus(needId, status);
    }
    setBulkPending(false);
    router.refresh();
  }

  async function handleBulkDelete() {
    setBulkPending(true);
    for (const needId of selectedIds) {
      await deleteCampNeed(needId);
    }
    setBulkPending(false);
    clearSelection();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לקוח / אזור / חוג"
          className={`w-52 rounded-lg border px-3 py-2 text-sm transition-colors ${
            search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
          }`}
        />
        <MultiSelectFilter
          options={areaOptions.map((r) => ({ value: r, label: r }))}
          selected={areaFilter}
          onChange={setAreaFilter}
          placeholder="כל האזורים"
        />
        <MultiSelectFilter
          options={dateOptions.map((d) => ({ value: d, label: formatCampDate(d) }))}
          selected={dateFilter}
          onChange={setDateFilter}
          placeholder="כל התאריכים"
        />
        <MultiSelectFilter
          options={(Object.keys(NEED_STATUS_LABEL) as NeedStatus[]).map((s) => ({ value: s, label: NEED_STATUS_LABEL[s] }))}
          selected={statusFilter}
          onChange={setStatusFilter}
          placeholder="כל הסטטוסים"
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <X size={14} />
            נקה סינון
          </button>
        )}
        <span className="text-sm text-muted-foreground">
          {filtered.reduce((sum, n) => sum + n.num_groups, 0)} קבוצות ({filtered.length} שורות)
        </span>
        <div className="flex-1" />
        {!isArchived && (
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            הוסף צורך
          </button>
        )}
      </div>

      {addFormOpen && !isArchived && (
        <AddNeedForm sessionId={session.id} dates={dateOptions.length > 0 ? dateOptions : []} session={session} onClose={() => setAddFormOpen(false)} />
      )}

      {editingNeed && !isArchived && (
        <EditNeedModal need={editingNeed} session={session} onClose={() => setEditingNeed(null)} />
      )}

      {selectedIds.size > 0 && !isArchived && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedIds.size} נבחרו</span>
          <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground">בטל בחירה</button>
          <div className="flex-1" />
          <input
            value={bulkName}
            onChange={(e) => setBulkName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBulkAssign()}
            placeholder="הוסף מדריך/ה לכל הנבחרים..."
            className="w-52 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleBulkAssign}
            disabled={!bulkName.trim() || bulkPending}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {bulkPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            הוסף לנבחרים
          </button>
          <select
            defaultValue=""
            disabled={bulkPending}
            onChange={(e) => { if (e.target.value) handleBulkStatus(e.target.value as NeedStatus); e.target.value = ""; }}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs disabled:opacity-50"
          >
            <option value="" disabled>שנה סטטוס...</option>
            {(Object.keys(NEED_STATUS_LABEL) as NeedStatus[]).map((s) => (
              <option key={s} value={s}>{NEED_STATUS_LABEL[s]}</option>
            ))}
          </select>
          {confirmBulkDelete ? (
            <div className="flex items-center gap-2">
              <button onClick={handleBulkDelete} disabled={bulkPending} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {bulkPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                אישור מחיקה
              </button>
              <button onClick={() => setConfirmBulkDelete(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">ביטול</button>
            </div>
          ) : (
            <button onClick={() => setConfirmBulkDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
              <Trash2 size={13} />
              מחק נבחרים
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              {!isArchived && (
                <th className="w-8 px-3 py-2.5">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="cursor-pointer accent-primary" />
                </th>
              )}
              <th className="px-3 py-2.5 whitespace-nowrap">לקוח</th>
              <th className="px-3 py-2.5 whitespace-nowrap">אזור</th>
              <th className="px-3 py-2.5 whitespace-nowrap">תאריך</th>
              <th className="px-3 py-2.5 whitespace-nowrap">חוג</th>
              <th className="px-3 py-2.5 whitespace-nowrap">מסגרת</th>
              <th className="px-2 py-2.5 text-center whitespace-nowrap">קב&apos;</th>
              <th className="px-3 py-2.5 whitespace-nowrap">סטטוס</th>
              <th className="px-3 py-2.5 min-w-[220px]">מדריך/ה משובץ/ת</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={isArchived ? 8 : 9} className="py-10 text-center text-muted-foreground">
                  אין צרכים רשומים
                </td>
              </tr>
            ) : (
              sorted.map((n) => (
                <NeedRow
                  key={n.id}
                  need={n}
                  availability={availability}
                  assignments={assignments.filter((a) => a.need_id === n.id)}
                  onEdit={setEditingNeed}
                  selected={selectedIds.has(n.id)}
                  onToggleSelect={() => toggleSelect(n.id)}
                  isArchived={isArchived}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NeedRow({
  need,
  availability,
  assignments,
  onEdit,
  selected,
  onToggleSelect,
  isArchived,
}: {
  need: CampStaffingNeed;
  availability: CampStaffingAvailability[];
  assignments: CampStaffingAssignment[];
  onEdit: (need: CampStaffingNeed) => void;
  selected: boolean;
  onToggleSelect: () => void;
  isArchived: boolean;
}) {
  return (
    <tr className={selected ? "bg-primary/5" : undefined}>
      {!isArchived && (
        <td className="px-3 py-2.5 align-top">
          <input type="checkbox" checked={selected} onChange={onToggleSelect} className="cursor-pointer accent-primary" />
        </td>
      )}
      <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
        <button onClick={() => onEdit(need)} className="hover:underline" title="ערוך">{need.client_name}</button>
      </td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{need.area ?? "—"}</td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
        {formatCampDate(need.camp_date)}
        {need.start_time ? ` (${need.start_time})` : ""}
      </td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{need.field ?? "—"}</td>
      <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">{need.framework ?? "—"}</td>
      <td className="px-2 py-2.5 align-top text-center text-muted-foreground">{need.num_groups}</td>
      <td className="px-3 py-2.5 align-top whitespace-nowrap">
        <StatusSelect need={need} isArchived={isArchived} />
      </td>
      <td className="px-3 py-2 align-top">
        <AssignmentCell need={need} availability={availability} assignments={assignments} isArchived={isArchived} />
      </td>
    </tr>
  );
}

function StatusSelect({ need, isArchived }: { need: CampStaffingNeed; isArchived: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleChange(status: NeedStatus) {
    setPending(true);
    await updateCampNeedStatus(need.id, status);
    setPending(false);
    router.refresh();
  }

  return (
    <select
      value={need.status}
      disabled={pending || isArchived}
      onChange={(e) => handleChange(e.target.value as NeedStatus)}
      className={`rounded-full border px-2 py-0.5 text-xs font-medium disabled:opacity-60 ${STATUS_COLORS[need.status as NeedStatus] ?? "border-border"}`}
    >
      {(Object.keys(NEED_STATUS_LABEL) as NeedStatus[]).map((s) => (
        <option key={s} value={s}>{NEED_STATUS_LABEL[s]}</option>
      ))}
    </select>
  );
}

function AssignmentCell({
  need,
  availability,
  assignments,
  isArchived,
}: {
  need: CampStaffingNeed;
  availability: CampStaffingAvailability[];
  assignments: CampStaffingAssignment[];
  isArchived: boolean;
}) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const linkedAvailabilityIds = new Set(assignments.map((a) => a.availability_id).filter(Boolean));
  const compatibleSlots = availability.filter(
    (a) => !linkedAvailabilityIds.has(a.id) && (need.camp_date === a.camp_date || a.camp_date === null)
  );
  const suggestedNames = Array.from(new Set(compatibleSlots.map((s) => s.instructor_name)));
  const datalistId = `camp-suggest-${need.id}`;

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setPendingId("new");
    const matchedSlot = compatibleSlots.find((s) => s.instructor_name.includes(name)) ?? null;
    await addCampAssignment({
      need_id: need.id,
      instructor_name: name,
      availability_id: matchedSlot?.id ?? null,
    });
    setPendingId(null);
    setNewName("");
    router.refresh();
  }

  async function handleConfirm(id: string) {
    setPendingId(id);
    await confirmCampAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  async function handleUnconfirm(id: string) {
    setPendingId(id);
    await unconfirmCampAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  async function handleRemove(id: string) {
    setPendingId(id);
    await deleteCampAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {assignments.map((a) => (
        <span
          key={a.id}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs whitespace-nowrap ${
            a.is_confirmed
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-border bg-muted/30 text-muted-foreground"
          }`}
        >
          {a.instructor_name}
          {a.is_confirmed ? (
            <>
              <CheckCircle2 size={12} className="text-green-700" />
              {!isArchived && (
                <button onClick={() => handleUnconfirm(a.id)} title="בטל אישור" className="hover:text-red-600">
                  {pendingId === a.id ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                </button>
              )}
            </>
          ) : (
            !isArchived && (
              <button onClick={() => handleConfirm(a.id)} title="אשר שיבוץ" className="hover:text-green-700">
                {pendingId === a.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              </button>
            )
          )}
          {!isArchived && (
            <button onClick={() => handleRemove(a.id)} title="הסר" className="hover:text-red-600">
              <X size={11} />
            </button>
          )}
        </span>
      ))}

      {!isArchived && (
        <span className="inline-flex items-center gap-1">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            list={datalistId}
            placeholder="הוסף מדריך/ה..."
            className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-xs"
          />
          <datalist id={datalistId}>
            {suggestedNames.map((n) => <option key={n} value={n} />)}
          </datalist>
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || pendingId === "new"}
            className="rounded-lg border border-border p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
            title="הוסף"
          >
            {pendingId === "new" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          </button>
        </span>
      )}
    </div>
  );
}

function AddNeedForm({ sessionId, session, onClose }: { sessionId: string; dates: string[]; session: CampSession; onClose: () => void }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [area, setArea] = useState("");
  const [campDate, setCampDate] = useState("");
  const [numGroups, setNumGroups] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [field, setField] = useState("");
  const [framework, setFramework] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [notes, setNotes] = useState("");

  const campDates = useMemo(() => {
    if (!session.start_date || !session.end_date) return [];
    return eachDayOfInterval({ start: parseISO(session.start_date), end: parseISO(session.end_date) }).map((d) => format(d, "yyyy-MM-dd"));
  }, [session.start_date, session.end_date]);

  async function handleSubmit() {
    setError(null);
    if (!clientName.trim()) { setError("יש להזין שם לקוח"); return; }
    if (!campDate) { setError("יש לבחור תאריך"); return; }
    setIsPending(true);
    const result = await addCampNeed({
      camp_session_id: sessionId,
      client_name: clientName,
      area: area || null,
      camp_date: campDate,
      num_groups: Number(numGroups) || 1,
      start_time: startTime || null,
      field: field || null,
      framework: framework || null,
      address: address || null,
      contact_name: contactName || null,
      notes: notes || null,
    });
    setIsPending(false);
    if (result.error) { setError(result.error); return; }
    onClose();
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
      <h3 className="mb-3 font-medium">צורך חדש</h3>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">שם לקוח</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="שם הלקוח" className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">אזור</label>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="עיר / אזור" className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">תאריך</label>
            <select value={campDate} onChange={(e) => setCampDate(e.target.value)} className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">בחר תאריך</option>
              {campDates.map((d: string) => <option key={d} value={d}>{formatCampDate(d)}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">קבוצות</label>
            <input type="number" min={1} value={numGroups} onChange={(e) => setNumGroups(e.target.value)} className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">שעה</label>
            <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="08:30" dir="ltr" className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">חוג / תחום</label>
            <input value={field} onChange={(e) => setField(e.target.value)} placeholder="כדורגל, תיאטרון..." className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">מסגרת</label>
            <input value={framework} onChange={(e) => setFramework(e.target.value)} placeholder={'גן, בי"ס...'} className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">כתובת</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="כתובת מלאה" className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">איש קשר</label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="שם איש קשר" className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">הערות</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="הערות חופשיות" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            הוסף
          </button>
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">ביטול</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function EditNeedModal({ need, session, onClose }: { need: CampStaffingNeed; session: CampSession; onClose: () => void }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState(need.client_name);
  const [area, setArea] = useState(need.area ?? "");
  const [campDate, setCampDate] = useState(need.camp_date);
  const [numGroups, setNumGroups] = useState(String(need.num_groups));
  const [startTime, setStartTime] = useState(need.start_time ?? "");
  const [field, setField] = useState(need.field ?? "");
  const [framework, setFramework] = useState(need.framework ?? "");
  const [address, setAddress] = useState(need.address ?? "");
  const [contactName, setContactName] = useState(need.contact_name ?? "");
  const [notes, setNotes] = useState(need.notes ?? "");

  const campDates = useMemo(() => {
    if (!session.start_date || !session.end_date) return [];
    return eachDayOfInterval({ start: parseISO(session.start_date), end: parseISO(session.end_date) }).map((d) => format(d, "yyyy-MM-dd"));
  }, [session.start_date, session.end_date]);

  async function handleSave() {
    setError(null);
    if (!clientName.trim()) { setError("יש להזין שם לקוח"); return; }
    setIsPending(true);
    const result = await updateCampNeed(need.id, {
      client_name: clientName,
      area: area || null,
      camp_date: campDate,
      num_groups: Number(numGroups) || 1,
      start_time: startTime || null,
      field: field || null,
      framework: framework || null,
      address: address || null,
      contact_name: contactName || null,
      notes: notes || null,
    });
    setIsPending(false);
    if (result.error) { setError(result.error); return; }
    router.refresh();
    onClose();
  }

  async function handleDelete() {
    setIsPending(true);
    await deleteCampNeed(need.id);
    setIsPending(false);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">עריכת צורך</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">שם לקוח</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">אזור</label>
              <input value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">תאריך</label>
              <select value={campDate} onChange={(e) => setCampDate(e.target.value)} className={inputClass}>
                {campDates.map((d: string) => <option key={d} value={d}>{formatCampDate(d)}</option>)}
              </select>
            </div>
            <div className="flex w-20 flex-col gap-1">
              <label className="text-xs text-muted-foreground">קבוצות</label>
              <input type="number" min={1} value={numGroups} onChange={(e) => setNumGroups(e.target.value)} className={inputClass} />
            </div>
            <div className="flex w-24 flex-col gap-1">
              <label className="text-xs text-muted-foreground">שעה</label>
              <input value={startTime} onChange={(e) => setStartTime(e.target.value)} dir="ltr" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">חוג</label>
              <input value={field} onChange={(e) => setField(e.target.value)} className={inputClass} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-muted-foreground">מסגרת</label>
              <input value={framework} onChange={(e) => setFramework(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">כתובת</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">איש קשר</label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">הערות</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                אישור מחיקה
              </button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">ביטול</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 size={14} />
              מחק
            </button>
          )}
          <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm";
