"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Check, Loader2, Archive, User } from "lucide-react";
import { RECRUITMENT_STATUS, RecruitmentStatus } from "@/lib/utils/constants";
import { addCandidate } from "@/lib/actions/recruitment";
import { CandidateDrawer, CandidateFull } from "./candidate-drawer";

const STATUS_COLORS: Record<RecruitmentStatus | "all", string> = {
  all: "border-border bg-background hover:bg-muted",
  pending: "bg-gray-50 text-gray-700 border-gray-200",
  called: "bg-blue-50 text-blue-700 border-blue-200",
  no_answer: "bg-orange-50 text-orange-700 border-orange-200",
  interview: "bg-green-50 text-green-700 border-green-200",
  not_suitable: "bg-red-50 text-red-700 border-red-200",
};

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
  const [showArchived, setShowArchived] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCandidateId, setOpenCandidateId] = useState<string | null>(null);

  const filtered = candidates.filter((c) => {
    if (!showArchived && c.is_archived) return false;
    if (showArchived && !c.is_archived) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      return fullName.includes(q) || (c.email ?? "").toLowerCase().includes(q) || (c.phone ?? "").includes(q);
    }
    return true;
  });

  const activeCandidates = candidates.filter((c) => !c.is_archived);
  const archivedCandidates = candidates.filter((c) => c.is_archived);

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
          <p className="text-sm text-muted-foreground">
            {activeCandidates.length} מועמדים פעילים | {archivedCandidates.length} בארכיון
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowArchived(!showArchived); setStatusFilter("all"); }}
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
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
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
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">שם</th>
                <th className="px-4 py-3">טלפון</th>
                <th className="px-4 py-3">אימייל</th>
                <th className="px-4 py-3">אזור</th>
                <th className="px-4 py-3">תאריך פניה</th>
                <th className="px-4 py-3">סטטוס</th>
                <th className="px-4 py-3">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground">
                    {showArchived ? "אין מועמדים בארכיון" : "אין מועמדים להצגה"}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setOpenCandidateId(c.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {c.converted_instructor_id && (
                          <span title="הומר למדריך" className="text-green-600">
                            <User size={13} />
                          </span>
                        )}
                        {c.first_name} {c.last_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.area ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(c.inquiry_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status as RecruitmentStatus] ?? STATUS_COLORS.pending}`}
                      >
                        {RECRUITMENT_STATUS[c.status as RecruitmentStatus] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
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
    </>
  );
}
