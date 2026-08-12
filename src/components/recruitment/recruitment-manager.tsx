"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Filter, Check, Loader2, Archive, ArchiveRestore,
  User, ChevronUp, ChevronDown, ChevronsUpDown, Copy, CheckCheck,
  X, Download, Trash2, Calendar, MapPin,
} from "lucide-react";
import {
  RECRUITMENT_STATUS,
  RecruitmentStatus,
  RECRUITMENT_SERIOUSNESS,
  RecruitmentSeriousness,
} from "@/lib/utils/constants";
import { addCandidate, bulkDeleteCandidates, bulkArchiveCandidates } from "@/lib/actions/recruitment";
import { CandidateDrawer, CandidateFull } from "./candidate-drawer";

type SortField = "date" | "status" | "name";

const STATUS_ORDER: Record<RecruitmentStatus, number> = {
  pending: 0, called: 1, no_answer: 2, interview: 3, not_suitable: 4,
};

const STATUS_COLORS: Record<RecruitmentStatus | "all", string> = {
  all: "border-border bg-background hover:bg-muted",
  pending: "bg-gray-50 text-gray-700 border-gray-200",
  called: "bg-blue-50 text-blue-700 border-blue-200",
  no_answer: "bg-orange-50 text-orange-700 border-orange-200",
  interview: "bg-green-50 text-green-700 border-green-200",
  not_suitable: "bg-red-50 text-red-700 border-red-200",
};

const SERIOUSNESS_COLORS: Record<RecruitmentSeriousness | "all", string> = {
  all: "border-border bg-background hover:bg-muted",
  inactive: "bg-gray-50 text-gray-700 border-gray-200",
  initial_screening: "bg-blue-50 text-blue-700 border-blue-200",
  question_mark: "bg-amber-50 text-amber-700 border-amber-200",
  hot_active: "bg-rose-50 text-rose-700 border-rose-200",
};

function SortIcon({ field, current, dir }: { field: SortField; current: SortField; dir: "asc" | "desc" }) {
  if (current !== field) return <ChevronsUpDown size={12} className="opacity-40" />;
  return dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

interface Props {
  candidates: CandidateFull[];
  lastActivityMap: Record<string, string>;
}

export function RecruitmentManager({ candidates, lastActivityMap }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RecruitmentStatus | "all">("all");
  const [seriousnessFilter, setSeriousnessFilter] = useState<RecruitmentSeriousness | "all">("all");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [showAreaFilter, setShowAreaFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCandidateId, setOpenCandidateId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const areas = Array.from(
    new Set(candidates.map((c) => c.area).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "he"));

  function toggleArea(area: string) {
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  }

  const filtered = candidates
    .filter((c) => {
      if (!showArchived && c.is_archived) return false;
      if (showArchived && !c.is_archived) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (seriousnessFilter !== "all" && c.seriousness_status !== seriousnessFilter) return false;
      if (selectedAreas.length > 0 && !selectedAreas.includes(c.area ?? "")) return false;
      if (dateFrom && (c.inquiry_date ?? "") < dateFrom) return false;
      if (dateTo && (c.inquiry_date ?? "") > dateTo) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        return fullName.includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") {
        cmp = (a.inquiry_date ?? "").localeCompare(b.inquiry_date ?? "");
      } else if (sortBy === "status") {
        cmp = (STATUS_ORDER[a.status as RecruitmentStatus] ?? 0) - (STATUS_ORDER[b.status as RecruitmentStatus] ?? 0);
      } else if (sortBy === "name") {
        cmp = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`, "he");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const filteredIds = filtered.map((c) => c.id);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIds));
    }
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkArchive() {
    setBulkPending(true);
    await bulkArchiveCandidates([...selectedIds], !showArchived);
    setSelectedIds(new Set());
    setBulkPending(false);
    router.refresh();
  }

  async function handleBulkDelete() {
    setBulkPending(true);
    await bulkDeleteCandidates([...selectedIds]);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    setBulkPending(false);
    router.refresh();
  }

  const activeCandidates = candidates.filter((c) => !c.is_archived);
  const archivedCandidates = candidates.filter((c) => c.is_archived);

  const statusCounts = (Object.keys(RECRUITMENT_STATUS) as RecruitmentStatus[]).reduce(
    (acc, s) => ({ ...acc, [s]: activeCandidates.filter((c) => c.status === s).length }),
    {} as Record<RecruitmentStatus, number>
  );

  const seriousnessCounts = (Object.keys(RECRUITMENT_SERIOUSNESS) as RecruitmentSeriousness[]).reduce(
    (acc, s) => ({ ...acc, [s]: activeCandidates.filter((c) => c.seriousness_status === s).length }),
    {} as Record<RecruitmentSeriousness, number>
  );

  async function handleAdd(formData: FormData) {
    setError(null);
    setIsPending(true);
    const result = await addCandidate(formData);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setAddFormOpen(false);
      router.refresh();
    }
  }

  const openCandidate = openCandidateId
    ? candidates.find((c) => c.id === openCandidateId) ?? null
    : null;

  const hasDateFilter = dateFrom || dateTo;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activeCandidates.length} מועמדים פעילים | {archivedCandidates.length} בארכיון
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowArchived(!showArchived); setStatusFilter("all"); setSeriousnessFilter("all"); setSelectedAreas([]); setSelectedIds(new Set()); }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showArchived
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <Archive size={14} />
              {showArchived ? "הצג פעילים" : "ארכיון"}
            </button>
            <button
              onClick={() => setAddFormOpen(!addFormOpen)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} />
              מועמד חדש
            </button>
          </div>
        </div>

        {/* Add form */}
        {addFormOpen && (
          <form
            action={handleAdd}
            className="rounded-xl border border-secondary/40 bg-secondary/5 p-4"
          >
            <h3 className="mb-3 font-medium">מועמד חדש</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">שם פרטי</label>
                  <input name="first_name" type="text" required placeholder="ישראל"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">שם משפחה</label>
                  <input name="last_name" type="text" required placeholder="ישראלי"
                    className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">טלפון</label>
                  <input name="phone" type="tel" placeholder="050-0000000"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">אזור מגורים</label>
                  <input name="area" type="text" placeholder="תל אביב"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">אימייל</label>
                  <input name="email" type="email" placeholder="example@gmail.com" dir="ltr"
                    className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">תאריך פניה</label>
                  <input name="inquiry_date" type="date" dir="ltr"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  הוסף
                </button>
                <button type="button" onClick={() => { setAddFormOpen(false); setError(null); }}
                  className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                  ביטול
                </button>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>
        )}

        {/* Filters */}
        {!showArchived && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            {/* Search + Status */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש..."
                  className="w-44 rounded-lg border border-border bg-background py-1.5 pr-8 pl-3 text-sm placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="mx-1 h-6 w-px bg-border" />
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Filter size={14} />
                <span>סטטוס:</span>
              </div>
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  statusFilter === "all"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                הכל ({activeCandidates.length})
              </button>
              {(Object.keys(RECRUITMENT_STATUS) as RecruitmentStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    statusFilter === s
                      ? STATUS_COLORS[s] + " font-medium"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {RECRUITMENT_STATUS[s]} ({statusCounts[s]})
                </button>
              ))}
            </div>

            {/* Seriousness filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Filter size={14} />
                <span>רצינות:</span>
              </div>
              <button
                onClick={() => setSeriousnessFilter("all")}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  seriousnessFilter === "all"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                הכל ({activeCandidates.length})
              </button>
              {(Object.keys(RECRUITMENT_SERIOUSNESS) as RecruitmentSeriousness[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeriousnessFilter(s === seriousnessFilter ? "all" : s)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    seriousnessFilter === s
                      ? SERIOUSNESS_COLORS[s] + " font-medium"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {RECRUITMENT_SERIOUSNESS[s]} ({seriousnessCounts[s]})
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar size={14} />
                <span>תאריך פניה:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">מ-</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  dir="ltr"
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">עד-</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  dir="ltr"
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                />
              </div>
              {hasDateFilter && (
                <button
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  <X size={11} /> נקה
                </button>
              )}
            </div>

            {/* Area filter (collapsed by default) */}
            {areas.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowAreaFilter((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                    selectedAreas.length > 0
                      ? "border-secondary bg-secondary/10 text-secondary-foreground font-medium"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <MapPin size={14} />
                  סינון אזור
                  {selectedAreas.length > 0 && ` (${selectedAreas.length})`}
                  {showAreaFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showAreaFilter && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedAreas([])}
                      className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                        selectedAreas.length === 0
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      הכל
                    </button>
                    {areas.map((area) => (
                      <button
                        key={area}
                        onClick={() => toggleArea(area)}
                        className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                          selectedAreas.includes(area)
                            ? "border-secondary bg-secondary/10 text-secondary-foreground font-medium"
                            : "border-border bg-background hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">{filtered.length} מועמדים בחיתוך הנוכחי</span>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Download size={12} />
                ייצוא CSV ({filtered.filter((c) => c.phone).length})
              </button>
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {someSelected && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
            <span className="text-sm font-medium">{selectedIds.size} נבחרו</span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              בטל בחירה
            </button>
            <div className="flex-1" />
            <button
              onClick={handleBulkArchive}
              disabled={bulkPending}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              {bulkPending ? <Loader2 size={13} className="animate-spin" /> : showArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
              {showArchived ? "הוצא מארכיון" : "העבר לארכיון"}
            </button>
            {confirmBulkDelete ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkPending}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {bulkPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  אישור מחיקה
                </button>
                <button
                  onClick={() => setConfirmBulkDelete(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  ביטול
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={13} />
                מחק ({selectedIds.size})
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                <th className="px-3 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="cursor-pointer accent-primary"
                  />
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    שם <SortIcon field="name" current={sortBy} dir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">טלפון</th>
                <th className="px-3 py-2.5 whitespace-nowrap">אזור</th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button onClick={() => handleSort("date")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    תאריך פניה <SortIcon field="date" current={sortBy} dir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">
                  <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    סטטוס <SortIcon field="status" current={sortBy} dir={sortDir} />
                  </button>
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">רצינות</th>
                <th className="px-3 py-2.5 w-full">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    {showArchived ? "אין מועמדים בארכיון" : "אין מועמדים להצגה"}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setOpenCandidateId(c.id)}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedIds.has(c.id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(c.id)}
                        onChange={(e) => toggleSelect(c.id, e as unknown as React.MouseEvent)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {c.converted_instructor_id && (
                          <span title="הומר למדריך" className="text-green-600">
                            <User size={13} />
                          </span>
                        )}
                        {c.first_name} {c.last_name}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{c.phone ?? "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{c.area ?? "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{formatDate(c.inquiry_date)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status as RecruitmentStatus] ?? STATUS_COLORS.pending}`}>
                        {RECRUITMENT_STATUS[c.status as RecruitmentStatus] ?? c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SERIOUSNESS_COLORS[c.seriousness_status as RecruitmentSeriousness] ?? SERIOUSNESS_COLORS.initial_screening}`}>
                        {RECRUITMENT_SERIOUSNESS[c.seriousness_status as RecruitmentSeriousness] ?? c.seriousness_status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 w-full">
                      {lastActivityMap[c.id] ? (
                        <p className="truncate text-xs text-muted-foreground">{lastActivityMap[c.id]}</p>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openCandidate && (
        <CandidateDrawer
          candidate={openCandidate}
          onClose={() => setOpenCandidateId(null)}
        />
      )}

      {showExport && (
        <ExportModal
          candidates={filtered}
          onClose={() => { setShowExport(false); setCopied(false); }}
          copied={copied}
          onCopy={async () => {
            const csv = buildCsv(filtered);
            await navigator.clipboard.writeText(csv);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
        />
      )}
    </>
  );
}

function buildCsv(candidates: CandidateFull[]) {
  const rows = candidates
    .filter((c) => c.phone)
    .map((c) => `"${c.first_name} ${c.last_name}","${c.area ?? ""}","${c.phone ?? ""}"`);
  return ["שם,עיר,טלפון", ...rows].join("\n");
}

function ExportModal({
  candidates,
  onClose,
  copied,
  onCopy,
}: {
  candidates: CandidateFull[];
  onClose: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const withPhone = candidates.filter((c) => c.phone);
  const csv = buildCsv(candidates);

  function handleDownload() {
    const bom = "﻿"; // UTF-8 BOM so Excel opens Hebrew correctly
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "מועמדים.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">ייצוא CSV</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          {withPhone.length} מועמדים עם מספר טלפון (מתוך {candidates.length} בחיתוך) · פורמט: שם, עיר, טלפון
        </p>
        <textarea
          readOnly
          value={csv}
          dir="ltr"
          rows={Math.min(withPhone.length + 2, 14)}
          className="mb-3 w-full rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono leading-relaxed resize-none focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download size={15} />
            הורד קובץ CSV
          </button>
          <button
            onClick={onCopy}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              copied ? "bg-green-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
            {copied ? "הועתק!" : "העתק"}
          </button>
        </div>
      </div>
    </div>
  );
}
