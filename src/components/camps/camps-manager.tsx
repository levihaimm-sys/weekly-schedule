"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Check,
  Trash2,
  Pencil,
  Copy,
  X,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { addCampRequest, deleteCampRequest, duplicateCampRequest } from "@/lib/actions/camps";
import { CampRequestModal } from "./camp-request-modal";
import { RequestCandidates } from "./camp-request-candidates";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { CampRequestWithCandidates, Instructor } from "@/types/database";

type CampStatus = "open" | "filled";

const CAMP_STATUS_LABEL: Record<CampStatus, string> = {
  open: "לא שובץ",
  filled: "שובץ במלואו",
};

const STATUS_COLORS: Record<CampStatus, string> = {
  open: "bg-gray-50 text-gray-600 border-gray-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

function campStatus(r: CampRequestWithCandidates): CampStatus {
  const confirmedCount = r.candidates.filter((c) => c.is_confirmed).length;
  return confirmedCount === 0 ? "open" : "filled";
}

function formatDate(dateStr: string) {
  // dateStr is "YYYY-MM-DD" — format as DD.MM.YYYY without going through a Date object
  // (which would shift by timezone).
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

interface Props {
  requests: CampRequestWithCandidates[];
  instructors: Instructor[];
}

type SortColumn = "date" | "area";

export function CampsManager({ requests, instructors }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<CampRequestWithCandidates | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [area, setArea] = useState("");
  const [campDate, setCampDate] = useState("");
  const [numGroups, setNumGroups] = useState("1");
  const [startTimeNote, setStartTimeNote] = useState("");
  const [notes, setNotes] = useState("");

  const [search, setSearch] = usePersistedState("camps-search", "");
  const [areaFilter, setAreaFilter] = usePersistedState<string[]>("camps-area-filter", []);
  const [clientFilter, setClientFilter] = usePersistedState<string[]>("camps-client-filter", []);
  const [statusFilter, setStatusFilter] = usePersistedState<string[]>("camps-status-filter", []);
  // Composite sort: the array's order IS the priority (first = primary), same convention as
  // the staffing matching table — clicking a column makes it primary while keeping any other
  // active column as a secondary tiebreaker.
  const [sortKeys, setSortKeys] = usePersistedState<{ key: SortColumn; dir: "asc" | "desc" }[]>("camps-sortkeys", [
    { key: "date", dir: "asc" },
  ]);

  function handleSortClick(column: SortColumn) {
    setSortKeys((prev) => {
      const isPrimary = prev[0]?.key === column;
      if (isPrimary) {
        if (prev[0].dir === "asc") return [{ key: column, dir: "desc" }, ...prev.slice(1)];
        return prev.slice(1);
      }
      const rest = prev.filter((k) => k.key !== column);
      return [{ key: column, dir: "asc" }, ...rest];
    });
  }

  function sortIndicator(column: SortColumn) {
    const idx = sortKeys.findIndex((k) => k.key === column);
    if (idx === -1) return <ArrowUpDown size={12} />;
    const dir = sortKeys[idx].dir;
    const icon = dir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
    if (sortKeys.length < 2) return icon;
    return (
      <span className="flex items-center">
        {icon}
        <sup className="text-[9px]">{idx + 1}</sup>
      </span>
    );
  }

  const sortHe = (a: string, b: string) => a.localeCompare(b, "he");
  const areaOptions = Array.from(new Set(requests.map((r) => r.area))).sort(sortHe);
  const clientOptions = (Array.from(new Set(requests.map((r) => r.client_name).filter(Boolean))) as string[]).sort(
    sortHe
  );

  const hasActiveFilters =
    search.trim() !== "" || areaFilter.length > 0 || clientFilter.length > 0 || statusFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setAreaFilter([]);
    setClientFilter([]);
    setStatusFilter([]);
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (areaFilter.length > 0 && !areaFilter.includes(r.area)) return false;
      if (clientFilter.length > 0 && !clientFilter.includes(r.client_name ?? "")) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(campStatus(r))) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          r.area.toLowerCase().includes(q) ||
          (r.client_name ?? "").toLowerCase().includes(q) ||
          (r.coordinator_name ?? "").toLowerCase().includes(q) ||
          (r.notes ?? "").toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [requests, areaFilter, clientFilter, statusFilter, search]);

  const sorted = useMemo(() => {
    if (sortKeys.length === 0) return filtered;
    const copy = [...filtered];
    const compare = (a: CampRequestWithCandidates, b: CampRequestWithCandidates, column: SortColumn) =>
      column === "area" ? a.area.localeCompare(b.area, "he") : a.camp_date.localeCompare(b.camp_date);
    copy.sort((a, b) => {
      for (const { key, dir } of sortKeys) {
        const cmp = compare(a, b, key);
        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
      }
      return 0;
    });
    return copy;
  }, [filtered, sortKeys]);

  async function handleAdd() {
    setError(null);
    setIsPending(true);
    const result = await addCampRequest({
      client_name: clientName,
      coordinator_name: coordinatorName,
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
    setCoordinatorName("");
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

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    await duplicateCampRequest(id);
    setDuplicatingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          לקליטת בקשות משיבוץ ושיוך מדריכים בלבד — השיעורים המלאים (כתובות, שעות) יוזנו בהמשך ללוח
          הקבוע
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
                <label className="text-xs text-muted-foreground">רכזת (לא חובה)</label>
                <input
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  placeholder="שם הרכזת"
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
                <label className="text-xs text-muted-foreground">כמות קבוצות (= מדריכים נדרשים)</label>
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

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש אזור / לקוח / הערות"
          className={`w-52 rounded-lg border px-3 py-2 text-sm transition-colors ${
            search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
          }`}
        />
        <MultiSelectFilter
          options={areaOptions.map((a) => ({ value: a, label: a }))}
          selected={areaFilter}
          onChange={setAreaFilter}
          placeholder="כל האזורים"
        />
        <MultiSelectFilter
          options={clientOptions.map((c) => ({ value: c, label: c }))}
          selected={clientFilter}
          onChange={setClientFilter}
          placeholder="כל הלקוחות"
        />
        <MultiSelectFilter
          options={(Object.keys(CAMP_STATUS_LABEL) as CampStatus[]).map((s) => ({ value: s, label: CAMP_STATUS_LABEL[s] }))}
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
          {sorted.length} בקשות ({sorted.reduce((sum, r) => sum + r.num_groups, 0)} קבוצות)
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">לקוח</th>
              <th className="px-3 py-2.5 whitespace-nowrap">רכזת</th>
              <th className="px-3 py-2.5 whitespace-nowrap">
                <button
                  onClick={() => handleSortClick("area")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  אזור
                  {sortIndicator("area")}
                </button>
              </th>
              <th className="px-3 py-2.5 whitespace-nowrap">
                <button
                  onClick={() => handleSortClick("date")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  תאריך
                  {sortIndicator("date")}
                </button>
              </th>
              <th className="px-3 py-2.5 whitespace-nowrap">שעת התחלה</th>
              <th className="px-2 py-2.5 text-center whitespace-nowrap">קב&apos;</th>
              <th className="px-3 py-2.5 whitespace-nowrap">סטטוס</th>
              <th className="px-3 py-2.5 min-w-[280px]">מדריכים/ות</th>
              <th className="px-3 py-2.5 whitespace-nowrap">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-muted-foreground">
                  אין בקשות קייטנה תואמות
                </td>
              </tr>
            ) : (
              sorted.map((r) => {
                const status = campStatus(r);
                return (
                  <tr key={r.id}>
                    <td className="px-3 py-2.5 align-top font-medium whitespace-nowrap">
                      <button
                        onClick={() => setEditingRequest(r)}
                        className="hover:underline"
                        title={r.notes ? `ערוך בקשה · ${r.notes}` : "ערוך בקשה"}
                      >
                        {r.client_name ?? "—"}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {r.coordinator_name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">{r.area}</td>
                    <td dir="ltr" className="px-3 py-2.5 align-top whitespace-nowrap">
                      {formatDate(r.camp_date)}
                    </td>
                    <td className="px-3 py-2.5 align-top text-muted-foreground whitespace-nowrap">
                      {r.start_time_note ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 align-top text-center text-muted-foreground">{r.num_groups}</td>
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
                        {CAMP_STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <RequestCandidates request={r} instructors={instructors} />
                    </td>
                    <td className="px-3 py-2.5 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicate(r.id)}
                          disabled={duplicatingId === r.id}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          title="שכפל בקשה"
                        >
                          {duplicatingId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingRequest(r)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="ערוך פרטים"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600"
                          title="מחק"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingRequest && <CampRequestModal request={editingRequest} onClose={() => setEditingRequest(null)} />}
    </div>
  );
}
