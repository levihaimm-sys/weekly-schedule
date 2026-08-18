"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Loader2, Check, Phone, Search,
  Filter, Archive, ArchiveRestore, Trash2, MapPin, ChevronUp, ChevronDown,
} from "lucide-react";
import { CLIENT_STATUS, ClientStatus, CLIENT_PRIORITY, ClientPriority } from "@/lib/utils/constants";
import { addClient, bulkArchiveClients, bulkDeleteClients } from "@/lib/actions/clients";
import { ClientDrawer } from "./client-drawer";
import type { ClientRecord } from "@/types/database";

const STATUS_COLORS: Record<ClientStatus | "all", string> = {
  all: "border-border bg-background hover:bg-muted",
  existing_client: "bg-green-50 text-green-700 border-green-200",
  potential_client: "bg-blue-50 text-blue-700 border-blue-200",
  not_relevant: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_COLORS: Record<ClientPriority, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-gray-50 text-gray-700 border-gray-200",
};

interface Props {
  clients: ClientRecord[];
  lastActivityMap: Record<string, string>;
}

export function ClientManager({ clients, lastActivityMap }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openClientId, setOpenClientId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const categories = Array.from(
    new Set(clients.map((c) => c.category).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "he"));

  const regions = Array.from(
    new Set(clients.map((c) => c.region).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "he"));

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const activeClients = clients.filter((c) => !c.is_archived);
  const archivedClients = clients.filter((c) => c.is_archived);

  const statusCounts = (Object.keys(CLIENT_STATUS) as ClientStatus[]).reduce(
    (acc, s) => ({ ...acc, [s]: activeClients.filter((c) => c.status === s).length }),
    {} as Record<ClientStatus, number>
  );

  const filtered = clients
    .filter((c) => {
      if (!showArchived && c.is_archived) return false;
      if (showArchived && !c.is_archived) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(c.category ?? "")) return false;
      if (selectedRegions.length > 0 && !selectedRegions.includes(c.region ?? "")) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.primary_contact_phone ?? "").includes(q) ||
          (c.primary_contact_email ?? "").toLowerCase().includes(q) ||
          (c.primary_contact_name ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "he"));

  const filteredIds = filtered.map((c) => c.id);
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filteredIds));
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
    await bulkArchiveClients([...selectedIds], !showArchived);
    setSelectedIds(new Set());
    setBulkPending(false);
    router.refresh();
  }

  async function handleBulkDelete() {
    setBulkPending(true);
    await bulkDeleteClients([...selectedIds]);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    setBulkPending(false);
    router.refresh();
  }

  async function handleAdd(formData: FormData) {
    setError(null);
    setIsPending(true);
    const result = await addClient(formData);
    setIsPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setAddFormOpen(false);
      router.refresh();
    }
  }

  const openClient = openClientId ? clients.find((c) => c.id === openClientId) ?? null : null;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activeClients.length} לקוחות/לידים פעילים | {archivedClients.length} בארכיון
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowArchived(!showArchived); setStatusFilter("all"); setSelectedCategories([]); setSelectedRegions([]); setSelectedIds(new Set()); }}
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
              לקוח / ליד חדש
            </button>
          </div>
        </div>

        {/* Add form */}
        {addFormOpen && (
          <form action={handleAdd} className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
            <h3 className="mb-3 font-medium">לקוח / ליד חדש</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">שם (ספק)</label>
                  <input name="name" type="text" required placeholder="שם הלקוח / הגוף"
                    className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">שם משפטי/מקורי</label>
                  <input name="legal_name" type="text" placeholder="שם מלא כפי שמופיע ברשמים"
                    className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">סוג גוף</label>
                  <input name="org_type" type="text" list="client-org-types" placeholder="חברה פרטית / עמותה..."
                    className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <datalist id="client-org-types">
                    <option value="חברה פרטית" />
                    <option value="עמותה" />
                    <option value="חל&quot;צ" />
                    <option value="עצמאית" />
                  </datalist>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">קטגוריה</label>
                  <input name="category" type="text" list="client-categories" placeholder="מפעיל צהרונים..."
                    className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <datalist id="client-categories">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">רשויות/פעילות</label>
                  <input name="region" type="text" list="client-regions" placeholder="אזור / ערים"
                    className="w-52 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <datalist id="client-regions">
                    {regions.map((r) => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">טלפון</label>
                  <input name="phone" type="tel" placeholder="050-0000000" dir="ltr"
                    className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">אימייל</label>
                  <input name="email" type="email" placeholder="example@gmail.com" dir="ltr"
                    className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">אתר</label>
                  <input name="website" type="text" placeholder="https://..." dir="ltr"
                    className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">עדיפות</label>
                  <select name="priority" defaultValue="" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="">—</option>
                    {(Object.keys(CLIENT_PRIORITY) as ClientPriority[]).map((p) => (
                      <option key={p} value={p}>{CLIENT_PRIORITY[p]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">סטטוס</label>
                  <select name="status" defaultValue="potential_client" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {(Object.keys(CLIENT_STATUS) as ClientStatus[]).map((s) => (
                      <option key={s} value={s}>{CLIENT_STATUS[s]}</option>
                    ))}
                  </select>
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
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Filter size={15} className="text-primary" />
                  <span>סטטוס</span>
                </div>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`rounded-lg border px-3.5 py-1.5 text-sm transition-all ${
                    statusFilter === "all"
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  הכל ({activeClients.length})
                </button>
                {(Object.keys(CLIENT_STATUS) as ClientStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s === statusFilter ? "all" : s)}
                    className={`rounded-lg border px-3.5 py-1.5 text-sm transition-all ${
                      statusFilter === s
                        ? STATUS_COLORS[s] + " font-semibold shadow-sm"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {CLIENT_STATUS[s]} ({statusCounts[s]})
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded-lg border border-dashed border-border bg-background/60 p-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חיפוש לפי שם, טלפון, אימייל או איש קשר..."
                    className="w-64 rounded-lg border border-border bg-background py-1.5 pr-8 pl-3 text-sm placeholder:text-muted-foreground/60"
                  />
                </div>
                {categories.length > 0 && (
                  <>
                    <div className="h-6 w-px bg-border" />
                    <button
                      onClick={() => setShowCategoryFilter((v) => !v)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedCategories.length > 0
                          ? "border-secondary bg-secondary/10 text-secondary-foreground font-medium"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      סינון קטגוריה
                      {selectedCategories.length > 0 && ` (${selectedCategories.length})`}
                      {showCategoryFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </>
                )}
                {regions.length > 0 && (
                  <>
                    <div className="h-6 w-px bg-border" />
                    <button
                      onClick={() => setShowRegionFilter((v) => !v)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                        selectedRegions.length > 0
                          ? "border-secondary bg-secondary/10 text-secondary-foreground font-medium"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <MapPin size={14} />
                      סינון אזור
                      {selectedRegions.length > 0 && ` (${selectedRegions.length})`}
                      {showRegionFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </>
                )}
              </div>
              {showCategoryFilter && categories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedCategories([])}
                    className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                      selectedCategories.length === 0
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    הכל
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggle(selectedCategories, c, setSelectedCategories)}
                      className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                        selectedCategories.includes(c)
                          ? "border-secondary bg-secondary/10 text-secondary-foreground font-medium"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {showRegionFilter && regions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedRegions([])}
                    className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                      selectedRegions.length === 0
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    הכל
                  </button>
                  {regions.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggle(selectedRegions, r, setSelectedRegions)}
                      className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                        selectedRegions.includes(r)
                          ? "border-secondary bg-secondary/10 text-secondary-foreground font-medium"
                          : "border-border bg-background hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-xs text-muted-foreground">{filtered.length} בחיתוך הנוכחי</span>
            </div>
          </div>
        )}

        {/* Bulk action bar */}
        {someSelected && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
            <span className="text-sm font-medium">{selectedIds.size} נבחרו</span>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-muted-foreground hover:text-foreground">
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
                <button onClick={() => setConfirmBulkDelete(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">
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
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                <th className="px-3 py-2.5 w-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="cursor-pointer accent-primary" />
                </th>
                <th className="px-3 py-2.5 whitespace-nowrap">שם</th>
                <th className="px-3 py-2.5 whitespace-nowrap">קטגוריה</th>
                <th className="px-3 py-2.5 whitespace-nowrap">אזור</th>
                <th className="px-3 py-2.5 whitespace-nowrap">טלפון</th>
                <th className="px-3 py-2.5 whitespace-nowrap">עדיפות</th>
                <th className="px-3 py-2.5 whitespace-nowrap">סטטוס</th>
                <th className="px-3 py-2.5 w-full">עדכון אחרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    {showArchived ? "אין לקוחות בארכיון" : "אין לקוחות להצגה"}
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setOpenClientId(client.id)}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedIds.has(client.id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(client.id)}
                        onChange={(e) => toggleSelect(client.id, e as unknown as React.MouseEvent)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="font-medium">{client.name}</p>
                      {client.legal_name && client.legal_name !== client.name && (
                        <p className="text-xs text-muted-foreground/70">{client.legal_name}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{client.category ?? "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{client.region ?? "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground" dir="ltr">
                      {client.primary_contact_phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="shrink-0" />
                          {client.primary_contact_phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {client.priority ? (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[client.priority as ClientPriority] ?? PRIORITY_COLORS.low}`}>
                          {CLIENT_PRIORITY[client.priority as ClientPriority] ?? client.priority}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[client.status as ClientStatus] ?? STATUS_COLORS.potential_client}`}>
                        {CLIENT_STATUS[client.status as ClientStatus] ?? client.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 w-full">
                      {lastActivityMap[client.id] ? (
                        <p className="truncate text-xs text-muted-foreground">{lastActivityMap[client.id]}</p>
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

      {openClient && <ClientDrawer client={openClient} onClose={() => setOpenClientId(null)} />}
    </>
  );
}
