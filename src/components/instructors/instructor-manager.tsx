"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addInstructor,
  syncInstructorAuthUsers,
  updateInstructorNote,
  updateInstructorEquipment,
} from "@/lib/actions/instructors";
import {
  Plus,
  Loader2,
  Filter,
  Search,
  RefreshCw,
  Check,
  FileText,
  ScrollText,
  MessageCircle,
  Smartphone,
  Link,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { INSTRUCTOR_STATUS, CLASSIFICATIONS, InstructorStatusType } from "@/lib/utils/constants";
import { InstructorDrawer, InstructorFull } from "./instructor-drawer";

interface InstructorManagerProps {
  instructors: InstructorFull[];
  lastLoginMap: Record<string, string | null>;
  scheduleClientsMap: Record<string, string[]>;
}

type SortKey =
  | "full_name"
  | "phone"
  | "address"
  | "status"
  | "note"
  | "classifications"
  | "equipment"
  | "clients"
  | "onboarding"
  | "last_login";

function getOnboardingCount(instructor: InstructorFull, hasAppAccess: boolean): number {
  return [
    !!instructor.id_photo_url,
    !!instructor.contract_url,
    !!instructor.monthly_report_link,
    !!instructor.whatsapp_added,
    hasAppAccess,
  ].filter(Boolean).length;
}

function formatLastLogin(dateStr: string | null | undefined): string {
  if (!dateStr) return "לא התחבר";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "אתמול";
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

function OnboardingDots({
  instructor,
  hasAppAccess,
}: {
  instructor: InstructorFull;
  hasAppAccess: boolean;
}) {
  const items = [
    { title: "תעודת זהות", done: !!instructor.id_photo_url, icon: <FileText size={11} /> },
    { title: "חוזה", done: !!instructor.contract_url, icon: <ScrollText size={11} /> },
    { title: "דוח חודשי", done: !!instructor.monthly_report_link, icon: <Link size={11} /> },
    { title: "וואצאפ", done: !!instructor.whatsapp_added, icon: <MessageCircle size={11} /> },
    { title: "גישה לאפליקציה", done: hasAppAccess, icon: <Smartphone size={11} /> },
  ];
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="flex items-center gap-1.5">
      {items.map((item) => (
        <span
          key={item.title}
          title={item.title}
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
            item.done
              ? "bg-green-100 text-green-600"
              : "bg-orange-50 text-orange-400"
          }`}
        >
          {item.done ? <Check size={10} /> : item.icon}
        </span>
      ))}
      <span className={`text-xs font-medium ${doneCount === 5 ? "text-green-600" : "text-orange-600"}`}>
        {doneCount}/5
      </span>
    </div>
  );
}

const statusColors: Record<InstructorStatusType, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  substitute: "bg-blue-50 text-blue-700 border-blue-200",
  inactive: "bg-gray-50 text-gray-700 border-gray-200",
};

function SortableTh({
  label,
  sortKey,
  currentKey,
  dir,
  onSort,
  className,
  align,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  dir: 1 | -1;
  onSort: (key: SortKey) => void;
  className?: string;
  align?: "end";
}) {
  const active = sortKey === currentKey;
  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 hover:text-foreground ${align === "end" ? "w-full justify-end" : ""}`}
      >
        {label}
        {active ? (
          dir === 1 ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : (
          <ChevronsUpDown size={12} className="opacity-30" />
        )}
      </button>
    </th>
  );
}

export function InstructorManager({ instructors, lastLoginMap, scheduleClientsMap }: InstructorManagerProps) {
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<InstructorStatusType>>(
    new Set(["active", "substitute"])
  );
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [openInstructorId, setOpenInstructorId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("full_name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  function getSortValue(instructor: InstructorFull, key: SortKey): string | number {
    switch (key) {
      case "full_name":
        return instructor.full_name;
      case "phone":
        return instructor.phone ?? "";
      case "address":
        return instructor.address ?? "";
      case "status":
        return INSTRUCTOR_STATUS[instructor.status];
      case "note":
        return instructor.note ?? "";
      case "classifications":
        return (instructor.classifications ?? []).map((c) => CLASSIFICATIONS[c]).join(", ");
      case "equipment":
        return instructor.has_equipment ? 1 : 0;
      case "clients":
        return (scheduleClientsMap[instructor.id] ?? []).join(", ");
      case "onboarding":
        return getOnboardingCount(instructor, instructor.id in lastLoginMap);
      case "last_login": {
        const lastLogin = lastLoginMap[instructor.id];
        return lastLogin ? new Date(lastLogin).getTime() : 0;
      }
    }
  }

  const filtered = instructors.filter((i) => {
    const matchesStatus = selectedStatuses.has(i.status ?? "active");
    const matchesSearch =
      !searchQuery || i.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * sortDir;
    return String(va).localeCompare(String(vb), "he") * sortDir;
  });

  async function handleNoteBlur(instructorId: string, value: string) {
    const trimmed = value.trim();
    const instructor = instructors.find((i) => i.id === instructorId);
    if ((instructor?.note ?? "") === trimmed) return;
    await updateInstructorNote(instructorId, trimmed || null);
    router.refresh();
  }

  async function handleEquipmentToggle(instructorId: string, current: boolean) {
    await updateInstructorEquipment(instructorId, !current);
    router.refresh();
  }

  const activeCount = instructors.filter((i) => (i.status ?? "active") === "active").length;
  const substituteCount = instructors.filter((i) => i.status === "substitute").length;
  const inactiveCount = instructors.filter((i) => i.status === "inactive").length;

  function toggleStatus(status: InstructorStatusType) {
    const newSet = new Set(selectedStatuses);
    if (newSet.has(status)) newSet.delete(status);
    else newSet.add(status);
    if (newSet.size > 0) setSelectedStatuses(newSet);
  }

  const defaultStatuses: InstructorStatusType[] = ["active", "substitute"];
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatuses.size !== defaultStatuses.length ||
    defaultStatuses.some((s) => !selectedStatuses.has(s));

  function clearFilters() {
    setSearchQuery("");
    setSelectedStatuses(new Set(defaultStatuses));
  }

  async function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addInstructor(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setAddFormOpen(false);
        router.refresh();
      }
    });
  }

  const unsyncedIds = instructors
    .filter((i) => i.phone && !(i.id in lastLoginMap))
    .map((i) => i.id);

  async function handleSync() {
    setIsSyncing(true);
    setSyncMessage(null);
    const result = await syncInstructorAuthUsers(unsyncedIds);
    setIsSyncing(false);
    if (result.errors.length > 0) {
      setSyncMessage(`סונכרנו ${result.synced} מדריכים. שגיאות: ${result.errors.join(", ")}`);
    } else {
      setSyncMessage(`סונכרנו ${result.synced} מדריכים בהצלחה`);
    }
    router.refresh();
  }

  const openInstructor = openInstructorId
    ? instructors.find((i) => i.id === openInstructorId) ?? null
    : null;

  return (
    <>
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activeCount} פעילים | {substituteCount} משלימים | {inactiveCount} לא פעילים
          </p>
          <div className="flex items-center gap-2">
            {unsyncedIds.length > 0 && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                title={`${unsyncedIds.length} מדריכים ללא גישה למערכת`}
                className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
              >
                {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                סנכרן גישה ({unsyncedIds.length})
              </button>
            )}
            <button
              onClick={() => setAddFormOpen(!addFormOpen)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus size={16} />
              הוסף מדריך
            </button>
          </div>
        </div>

        {syncMessage && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {syncMessage}
          </p>
        )}

        {/* Search and filter */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם..."
              className="w-44 rounded-lg border border-border bg-background py-1.5 pr-8 pl-3 text-sm placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="mx-1 h-6 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Filter size={14} />
            <span>הצג:</span>
          </div>
          {(Object.entries(INSTRUCTOR_STATUS) as [InstructorStatusType, string][]).map(([key, label]) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                selectedStatuses.has(key)
                  ? statusColors[key] + " font-medium"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedStatuses.has(key)}
                onChange={() => toggleStatus(key)}
                className="h-4 w-4 rounded border-gray-300"
              />
              {label}
            </label>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
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
            <h3 className="mb-3 font-medium">מדריך חדש</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="שם מלא"
                  className="flex-1 min-w-[150px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  name="phone"
                  type="tel"
                  dir="ltr"
                  placeholder="טלפון"
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <input
                name="address"
                type="text"
                placeholder="כתובת מגורים"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                name="work_cities"
                type="text"
                placeholder="ערים לעבודה"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
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

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                <SortableTh label="שם" sortKey="full_name" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="w-px whitespace-nowrap px-4 py-3" />
                <SortableTh label="טלפון" sortKey="phone" currentKey={sortKey} dir={sortDir} onSort={toggleSort} align="end" className="w-px whitespace-nowrap px-4 py-3" />
                <SortableTh label="כתובת" sortKey="address" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="סטטוס" sortKey="status" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="הערה / זמינות" sortKey="note" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="סיווג" sortKey="classifications" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="ציוד" sortKey="equipment" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="לקוחות" sortKey="clients" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="קליטה" sortKey="onboarding" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
                <SortableTh label="התחברות" sortKey="last_login" currentKey={sortKey} dir={sortDir} onSort={toggleSort} className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-muted-foreground">
                    אין מדריכים להצגה
                  </td>
                </tr>
              ) : (
                sorted.map((instructor) => {
                  const hasAppAccess = instructor.id in lastLoginMap;
                  const lastLogin = lastLoginMap[instructor.id] ?? null;

                  return (
                    <tr
                      key={instructor.id}
                      onClick={() => setOpenInstructorId(instructor.id)}
                      className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                        instructor.status === "inactive" ? "opacity-50" : ""
                      }`}
                    >
                      {/* Name */}
                      <td className="w-px whitespace-nowrap px-4 py-3 font-medium">{instructor.full_name}</td>

                      {/* Phone */}
                      <td className="w-px whitespace-nowrap px-4 py-3 text-right text-muted-foreground" dir="ltr">
                        {instructor.phone ?? "—"}
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {instructor.address ?? <span className="text-xs text-muted-foreground/50">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[instructor.status]
                          }`}
                        >
                          {INSTRUCTOR_STATUS[instructor.status]}
                        </span>
                      </td>

                      {/* Note / availability (inline editable) */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          key={instructor.note ?? ""}
                          defaultValue={instructor.note ?? ""}
                          onBlur={(e) => handleNoteBlur(instructor.id, e.target.value)}
                          placeholder="הערה / זמינות..."
                          className="w-full min-w-[140px] rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-border focus:border-border focus:bg-background focus:outline-none"
                        />
                      </td>

                      {/* Classifications */}
                      <td className="px-4 py-3">
                        {instructor.classifications && instructor.classifications.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {instructor.classifications.map((c) => (
                              <span
                                key={c}
                                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {CLASSIFICATIONS[c]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Equipment */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleEquipmentToggle(instructor.id, !!instructor.has_equipment)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                            instructor.has_equipment
                              ? "border-green-300 bg-green-100 text-green-700 hover:bg-green-200"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {instructor.has_equipment ? <Check size={12} /> : null}
                          {instructor.has_equipment ? "עם ציוד" : "בלי ציוד"}
                        </button>
                      </td>

                      {/* Clients (derived from the fixed schedule) */}
                      <td className="px-4 py-3">
                        {(scheduleClientsMap[instructor.id]?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {scheduleClientsMap[instructor.id].map((c) => (
                              <span
                                key={c}
                                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Onboarding */}
                      <td className="px-4 py-3">
                        <OnboardingDots instructor={instructor} hasAppAccess={hasAppAccess} />
                      </td>

                      {/* Last login */}
                      <td
                        className={`px-4 py-3 text-xs ${
                          lastLogin ? "text-muted-foreground" : "text-red-500"
                        }`}
                      >
                        {formatLastLogin(lastLogin)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {openInstructor && (
        <InstructorDrawer
          instructor={openInstructor}
          lastLogin={lastLoginMap[openInstructor.id] ?? null}
          hasAppAccess={openInstructor.id in lastLoginMap}
          scheduleClients={scheduleClientsMap[openInstructor.id] ?? []}
          onClose={() => setOpenInstructorId(null)}
        />
      )}
    </>
  );
}
