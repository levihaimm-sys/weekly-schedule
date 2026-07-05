"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Check, Loader2, Archive, User, ChevronUp, ChevronDown, ChevronsUpDown, Copy, CheckCheck, X } from "lucide-react";
import { RECRUITMENT_STATUS, RecruitmentStatus } from "@/lib/utils/constants";
import { addCandidate } from "@/lib/actions/recruitment";
import { CandidateDrawer, CandidateFull } from "./candidate-drawer";

type SortField = "date" | "status" | "name";

const STATUS_ORDER: Record<RecruitmentStatus, number> = {
  pending: 0,
  called: 1,
  no_answer: 2,
  interview: 3,
  not_suitable: 4,
};

const STATUS_COLORS: Record<RecruitmentStatus | "all", string> = {
  all: "border-border bg-background hover:bg-muted",
  pending: "bg-gray-50 text-gray-700 border-gray-200",
  called: "bg-blue-50 text-blue-700 border-blue-200",
  no_answer: "bg-orange-50 text-orange-700 border-orange-200",
  interview: "bg-green-50 text-green-700 border-green-200",
  not_suitable: "bg-red-50 text-red-700 border-red-200",
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
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCandidateId, setOpenCandidateId] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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
      if (selectedAreas.length > 0 && !selectedAreas.includes(c.area ?? "")) return false;
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

  function handleOpenCandidate(id: string) {
    setOpenCandidateId(id);
    setSeenIds((prev) => new Set([...prev, id]));
  }

  const activeCandidates = candidates.filter((c) => !c.is_archived);
  const archivedCandidates = candidates.filter((c) => c.is_archived);
  const newCount = activeCandidates.filter((c) => c.is_new && !seenIds.has(c.id)).length;

  const statusCounts = (Object.keys(RECRUITMENT_STATUS) as RecruitmentStatus[]).reduce(
    (acc, s) => ({ ...acc, [s]: activeCandidates.filter((c) => c.status === s).length }),
    {} as Record<RecruitmentStatus, number>
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

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {activeCandidates.length} מועמדים פעילים | {archivedCandidates.length} בארכיון
            </p>
            {newCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-bold text-white">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                {newCount} חדשים
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowArchived(!showArchived); setStatusFilter("all"); setSelectedAreas([]); }}
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
                  <input
                    name="first_name"
                    type="text"
                    required
                    placeholder="ישראל"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">שם משפחה</label>
                  <input
                    name="last_name"
                    type="text"
                    required
                    placeholder="ישראלי"
                    className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">טלפון</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="050-0000000"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">אזור מגורים</label>
                  <input
                    name="area"
                    type="text"
                    placeholder="תל אביב"
                    className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">אימייל</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">תאריך פניה</label>
                  <input
                    name="inquiry_date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  הוסף
                </button>
                <button
                  type="button"
                  onClick={() => { setAddFormOpen(false); setError(null); }}
                  className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
                >
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
            {areas.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">אזור:</span>
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
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">{filtered.length} מועמדים בחיתוך הנוכחי</span>
              <button
                onClick={() => setShowExport(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Copy size={12} />
                ייצוא מספרים ({filtered.filter((c) => c.phone).length})
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
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
                <th className="px-3 py-2.5 w-full">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    {showArchived ? "אין מועמדים בארכיון" : "אין מועמדים להצגה"}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isNew = c.is_new && !seenIds.has(c.id);
                  return (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenCandidate(c.id)}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${isNew ? "bg-blue-50/60" : ""}`}
                  >
                    <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isNew && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            חדש
                          </span>
                        )}
                        {c.converted_instructor_id && (
                          <span title="הומר למדריך" className="text-green-600">
                            <User size={13} />
                          </span>
                        )}
                        {c.first_name} {c.last_name}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {c.area ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {formatDate(c.inquiry_date)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status as RecruitmentStatus] ?? STATUS_COLORS.pending}`}
                      >
                        {RECRUITMENT_STATUS[c.status as RecruitmentStatus] ?? c.status}
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
                  );
                })
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
            const text = filtered
              .filter((c) => c.phone)
              .map((c) => `${c.first_name} ${c.last_name}: ${c.phone}`)
              .join("\n");
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
        />
      )}
    </>
  );
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
  const text = withPhone.map((c) => `${c.first_name} ${c.last_name}: ${c.phone}`).join("\n");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">ייצוא מספרי טלפון</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X size={16} />
          </button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          {withPhone.length} מועמדים עם מספר טלפון (מתוך {candidates.length} בחיתוך)
        </p>
        <textarea
          readOnly
          value={text}
          dir="rtl"
          rows={Math.min(withPhone.length + 1, 14)}
          className="mb-3 w-full rounded-lg border border-border bg-muted/30 p-3 text-sm font-mono leading-relaxed resize-none focus:outline-none"
        />
        <button
          onClick={onCopy}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            copied
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
          {copied ? "הועתק!" : "העתק הכל"}
        </button>
      </div>
    </div>
  );
}
