"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X, Phone, Mail, User, ExternalLink, Check, Loader2, Trash2, FileText,
  Building2, StickyNote, History, Send, Archive, ArchiveRestore, ChevronDown, Link2, Copy, type LucideIcon,
} from "lucide-react";
import { CLIENT_STATUS, ClientStatus, CLIENT_PRIORITY, ClientPriority } from "@/lib/utils/constants";
import {
  updateClient, deleteClient, addClientActivity, toggleClientArchive, linkRecurringScheduleByName,
} from "@/lib/actions/clients";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { ClientRecord } from "@/types/database";

interface Activity {
  id: string;
  note: string;
  created_at: string;
}

interface Props {
  client: ClientRecord;
  onClose: () => void;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${h}:${m}`;
}

const STATUS_COLORS: Record<ClientStatus, string> = {
  existing_client: "bg-green-100 text-green-700 border-green-200",
  potential_client: "bg-blue-100 text-blue-700 border-blue-200",
  not_relevant: "bg-red-100 text-red-700 border-red-200",
};

function SectionHeader({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 border-b-2 border-primary/30 pb-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Icon size={14} />
      </div>
      <h3 className="text-base font-extrabold tracking-tight text-foreground">{children}</h3>
    </div>
  );
}

export function ClientDrawer({ client, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [showContactSection, setShowContactSection] = useState(
    !!(client.secondary_contact_name || client.secondary_contact_phone || client.secondary_contact_email || client.monthly_report_link)
  );

  // Core fields — every column from the supplier research sheet
  const [name, setName] = useState(client.name);
  const [legalName, setLegalName] = useState(client.legal_name ?? "");
  const [orgType, setOrgType] = useState(client.org_type ?? "");
  const [category, setCategory] = useState(client.category ?? "");
  const [region, setRegion] = useState(client.region ?? "");
  const [contactName, setContactName] = useState(client.primary_contact_name ?? "");
  const [phone, setPhone] = useState(client.primary_contact_phone ?? "");
  const [email, setEmail] = useState(client.primary_contact_email ?? "");
  const [website, setWebsite] = useState(client.website ?? "");
  const [status, setStatus] = useState<ClientStatus>((client.status as ClientStatus) ?? "potential_client");
  const [priority, setPriority] = useState<ClientPriority | "">((client.priority as ClientPriority) ?? "");
  const [lastContactDate, setLastContactDate] = useState(client.last_contact_date ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");

  // Secondary / report-contact fields (less common, collapsed by default)
  const [secondaryName, setSecondaryName] = useState(client.secondary_contact_name ?? "");
  const [secondaryPhone, setSecondaryPhone] = useState(client.secondary_contact_phone ?? "");
  const [secondaryEmail, setSecondaryEmail] = useState(client.secondary_contact_email ?? "");
  const [reportLink, setReportLink] = useState(client.monthly_report_link ?? "");

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  // Client portal link
  const [portalUrl, setPortalUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [linkByName, setLinkByName] = useState(client.name);
  const [linkPending, setLinkPending] = useState(false);
  const [linkResult, setLinkResult] = useState<string | null>(null);

  useEffect(() => {
    setPortalUrl(`${window.location.origin}/client-portal/${client.portal_token}`);
  }, [client.portal_token]);

  function handleCopyPortalLink() {
    navigator.clipboard.writeText(portalUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function handleLinkByName() {
    setLinkPending(true);
    setLinkResult(null);
    const result = await linkRecurringScheduleByName(client.id, linkByName);
    setLinkPending(false);
    setLinkResult(
      "error" in result && result.error
        ? result.error
        : `קושרו ${(result as { linked: number }).linked} שיבוצים`
    );
  }

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase
      .from("client_activities")
      .select("id, note, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Activities fetch error:", error.message);
        setActivities(data ?? []);
        setLoadingActivities(false);
      });
  }, [client.id]);

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      const ops: Promise<{ error?: string } | unknown>[] = [
        updateClient(client.id, {
          name: name.trim() || client.name,
          legal_name: legalName.trim() || null,
          org_type: orgType.trim() || null,
          category: category.trim() || null,
          region: region.trim() || null,
          primary_contact_phone: phone.trim() || null,
          primary_contact_email: email.trim() || null,
          website: website.trim() || null,
          status,
          priority: priority || null,
          last_contact_date: lastContactDate || null,
          notes: notes.trim() || null,
          primary_contact_name: contactName.trim() || null,
          secondary_contact_name: secondaryName.trim() || null,
          secondary_contact_phone: secondaryPhone.trim() || null,
          secondary_contact_email: secondaryEmail.trim() || null,
          monthly_report_link: reportLink.trim() || null,
        }),
      ];
      if (newNote.trim()) {
        const note = newNote.trim();
        setActivities((prev) => [{ id: `temp-${Date.now()}`, note, created_at: new Date().toISOString() }, ...prev]);
        setNewNote("");
        ops.push(addClientActivity(client.id, note));
      }
      const results = await Promise.all(ops);
      const failed = results.find(
        (r): r is { error: string } => !!r && typeof r === "object" && "error" in r && !!(r as { error?: string }).error
      );
      if (failed) {
        setSaveError(failed.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
      router.refresh();
    });
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    const note = newNote.trim();
    const tempId = `temp-${Date.now()}`;
    setActivities((prev) => [{ id: tempId, note, created_at: new Date().toISOString() }, ...prev]);
    setNewNote("");
    setNoteError(null);
    const result = await addClientActivity(client.id, note);
    if ("error" in result && result.error) {
      setActivities((prev) => prev.filter((a) => a.id !== tempId));
      setNewNote(note);
      setNoteError(result.error);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteClient(client.id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        onClose();
        router.refresh();
      }
    });
  }

  async function handleArchive() {
    setArchiving(true);
    await toggleClientArchive(client.id, !client.is_archived);
    setArchiving(false);
    router.refresh();
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {client.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{client.name}</p>
              <span className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.potential_client}`}>
                {CLIENT_STATUS[status] ?? status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* --- Details section (all fields from the research sheet) --- */}
          <section className="space-y-3 rounded-xl border-2 border-border bg-muted/10 p-4 shadow-sm">
            <SectionHeader icon={Building2}>פרטים</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">שם (ספק)</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">שם משפטי/מקורי</label>
                <input value={legalName} onChange={(e) => setLegalName(e.target.value)}
                  placeholder="שם מלא כפי שמופיע ברשמים"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">סוג גוף</label>
                <input value={orgType} onChange={(e) => setOrgType(e.target.value)}
                  placeholder="חברה פרטית / עמותה..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">קטגוריה</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)}
                  placeholder="מפעיל צהרונים..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">רשויות/פעילות</label>
                <input value={region} onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">שם איש קשר</label>
              <div className="flex items-center gap-2">
                <User size={14} className="shrink-0 text-muted-foreground" />
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="שם איש קשר"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">טלפון איש קשר</label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-muted-foreground" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="050-0000000" dir="ltr" type="tel"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">אימייל</label>
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-muted-foreground" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" dir="ltr" type="email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">אתר</label>
              <div className="flex items-center gap-2">
                <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
                <input value={website} onChange={(e) => setWebsite(e.target.value)} dir="ltr" placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                {website.trim() && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">סטטוס</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {(Object.keys(CLIENT_STATUS) as ClientStatus[]).map((s) => (
                    <option key={s} value={s}>{CLIENT_STATUS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">עדיפות</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as ClientPriority)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">—</option>
                  {(Object.keys(CLIENT_PRIORITY) as ClientPriority[]).map((p) => (
                    <option key={p} value={p}>{CLIENT_PRIORITY[p]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">תאריך פניה אחרון</label>
              <input value={lastContactDate} onChange={(e) => setLastContactDate(e.target.value)} type="date" dir="ltr"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-muted-foreground/70">מתעדכן ידנית בלבד — לא משתנה אוטומטית כשמוסיפים הערה ביומן</p>
            </div>
          </section>

          {/* Client portal link */}
          <section className="space-y-3 rounded-xl border-2 border-border bg-muted/10 p-4 shadow-sm">
            <SectionHeader icon={Link2}>קישור ללקוח (ללא התחברות)</SectionHeader>
            <p className="text-xs text-muted-foreground">
              קישור קבוע שהלקוח יכול לפתוח כדי לראות את השיעורים העתידיים שלו, כולל סטטוס בזמן אמת.
            </p>
            <div className="flex items-center gap-2">
              <input
                value={portalUrl}
                readOnly
                dir="ltr"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
              />
              <button
                onClick={handleCopyPortalLink}
                disabled={!portalUrl}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                {linkCopied ? "הועתק" : "העתק"}
              </button>
            </div>

            <div className="border-t border-border/60 pt-3">
              <label className="mb-1 block text-xs text-muted-foreground">
                קישור שיבוצים קיימים לפי שם לקוח (אם השיעורים לא מופיעים בקישור)
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={linkByName}
                  onChange={(e) => setLinkByName(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={handleLinkByName}
                  disabled={linkPending || !linkByName.trim()}
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-50"
                >
                  {linkPending ? <Loader2 size={14} className="animate-spin" /> : "קשר"}
                </button>
              </div>
              {linkResult && <p className="mt-1.5 text-xs text-muted-foreground">{linkResult}</p>}
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-2 rounded-xl border-2 border-border bg-muted/10 p-4 shadow-sm">
            <SectionHeader icon={StickyNote}>מידע רלוונטי</SectionHeader>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="היקף פעילות, רקע, פרטים רלוונטיים נוספים..."
              rows={5}
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/60"
            />
          </section>

          {/* --- Activity log --- */}
          <section className="space-y-3 rounded-xl border-2 border-border bg-muted/10 p-4 shadow-sm">
            <SectionHeader icon={History}>יומן תקשורת</SectionHeader>

            <div className="flex gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="רשום שיחה, פגישה או עדכון..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="self-end flex items-center justify-center rounded-lg bg-primary p-2.5 text-primary-foreground disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>

            {noteError && <p className="text-xs text-red-600">{noteError}</p>}

            <div className="space-y-2">
              {loadingActivities ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">אין עדכוני תקשורת רשומים עדיין</p>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                    <p className="text-sm whitespace-pre-wrap">{a.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(a.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* --- Contact person / monthly report (secondary, collapsed) --- */}
          <section className="rounded-xl border-2 border-border bg-muted/10 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowContactSection((v) => !v)}
              className="flex w-full items-center justify-between gap-2.5 p-4"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <User size={14} />
                </div>
                <h3 className="text-base font-extrabold tracking-tight text-foreground">איש קשר משני ודוחות חודשיים</h3>
              </div>
              <ChevronDown size={16} className={`text-muted-foreground transition-transform ${showContactSection ? "rotate-180" : ""}`} />
            </button>

            {showContactSection && (
              <div className="space-y-3 p-4 pt-0">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">שם</label>
                  <input value={secondaryName} onChange={(e) => setSecondaryName(e.target.value)} placeholder="שם איש קשר"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">טלפון</label>
                  <input value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} placeholder="050-0000000" dir="ltr" type="tel"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">אימייל</label>
                  <input value={secondaryEmail} onChange={(e) => setSecondaryEmail(e.target.value)} placeholder="email@example.com" dir="ltr" type="email"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </div>

                <div className="border-t border-border/60 pt-3">
                  <label className="mb-1 block text-xs text-muted-foreground">קישור דוחות חודשיים</label>
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="shrink-0 text-muted-foreground" />
                    <input
                      value={reportLink}
                      onChange={(e) => setReportLink(e.target.value)}
                      placeholder="https://..."
                      dir="ltr"
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    {reportLink.trim() && (
                      <a href={reportLink} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Save */}
          <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-border bg-background/95 px-5 py-3 backdrop-blur-sm">
            {saveError && <p className="mb-2 text-xs text-red-600">שגיאה בשמירה: {saveError}</p>}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> נשמר</> : "שמור שינויים"}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-4 space-y-2">
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {archiving ? <Loader2 size={15} className="animate-spin" /> : client.is_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
            {client.is_archived ? "הוצא מארכיון" : "העבר לארכיון"}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={15} />
              מחק
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-600 text-center">בטוח? פעולה זו אינה ניתנת לביטול.</p>
              {deleteError && <p className="text-xs text-red-500 text-center">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                  כן, מחק
                </button>
                <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted">
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
