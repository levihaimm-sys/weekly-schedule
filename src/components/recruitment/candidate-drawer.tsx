"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  Loader2,
  Archive,
  ArchiveRestore,
  UserCheck,
  Upload,
  FileText,
  ExternalLink,
  Send,
  Trash2,
} from "lucide-react";
import { RECRUITMENT_STATUS, RecruitmentStatus } from "@/lib/utils/constants";
import {
  updateCandidate,
  updateCandidateStatus,
  toggleCandidateArchive,
  convertCandidateToInstructor,
  addActivity,
  uploadCandidateCV,
  deleteCandidate,
  markCandidateSeen,
} from "@/lib/actions/recruitment";
import { createClient } from "@/lib/supabase/client";

export interface CandidateFull {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  area: string | null;
  inquiry_date: string | null;
  status: string;
  is_archived: boolean;
  is_new: boolean;
  cv_url: string | null;
  converted_instructor_id: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  note: string;
  created_at: string;
}

interface Props {
  candidate: CandidateFull;
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

const STATUS_COLORS: Record<RecruitmentStatus, string> = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  called: "bg-blue-100 text-blue-700 border-blue-200",
  no_answer: "bg-orange-100 text-orange-700 border-orange-200",
  interview: "bg-green-100 text-green-700 border-green-200",
  not_suitable: "bg-red-100 text-red-700 border-red-200",
};

export function CandidateDrawer({ candidate, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Details state
  const [firstName, setFirstName] = useState(candidate.first_name);
  const [lastName, setLastName] = useState(candidate.last_name);
  const [email, setEmail] = useState(candidate.email ?? "");
  const [phone, setPhone] = useState(candidate.phone ?? "");
  const [area, setArea] = useState(candidate.area ?? "");
  const [inquiryDate, setInquiryDate] = useState(candidate.inquiry_date ?? "");
  const [status, setStatus] = useState<RecruitmentStatus>(candidate.status as RecruitmentStatus);

  // CV
  const [cvUrl, setCvUrl] = useState(candidate.cv_url);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Activities
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Activities error
  const [noteError, setNoteError] = useState<string | null>(null);

  // Convert/archive/delete
  const [converting, setConverting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  useEffect(() => {
    // Mark as seen (fire-and-forget, clears is_new flag in DB)
    if (candidate.is_new) markCandidateSeen(candidate.id);

    const supabase = createClient();
    supabase
      .from("recruitment_activities")
      .select("id, note, created_at")
      .eq("candidate_id", candidate.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Activities fetch error:", error.message);
        setActivities(data ?? []);
        setLoadingActivities(false);
      });
  }, [candidate.id]);

  async function handleSave() {
    startTransition(async () => {
      await Promise.all([
        updateCandidate(candidate.id, {
          first_name: firstName.trim() || candidate.first_name,
          last_name: lastName.trim() || candidate.last_name,
          email: email.trim() || null,
          phone: phone.trim() || null,
          area: area.trim() || null,
          inquiry_date: inquiryDate || null,
        }),
        updateCandidateStatus(candidate.id, status),
      ]);
      router.refresh();
      onClose();
    });
  }

  async function handleCVUpload(file: File) {
    setUploadingCV(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("candidateId", candidate.id);
    fd.append("file", file);
    const result = await uploadCandidateCV(fd);
    setUploadingCV(false);
    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      setCvUrl(result.url);
      router.refresh();
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    const note = newNote.trim();
    const tempId = `temp-${Date.now()}`;
    // Optimistic update — show immediately without waiting for the server
    setActivities((prev) => [
      { id: tempId, note, created_at: new Date().toISOString() },
      ...prev,
    ]);
    setNewNote("");
    setNoteError(null);
    const result = await addActivity(candidate.id, note);
    if ("error" in result && result.error) {
      // Revert on failure
      setActivities((prev) => prev.filter((a) => a.id !== tempId));
      setNewNote(note);
      setNoteError(result.error);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteCandidate(candidate.id);
    setDeleting(false);
    router.refresh();
    onClose();
  }

  async function handleArchive() {
    setArchiving(true);
    await toggleCandidateArchive(candidate.id, !candidate.is_archived);
    setArchiving(false);
    router.refresh();
    onClose();
  }

  async function handleConvert() {
    setConverting(true);
    setConvertError(null);
    const result = await convertCandidateToInstructor(candidate.id);
    setConverting(false);
    if (result.error) {
      setConvertError(result.error);
    } else {
      router.refresh();
      onClose();
    }
  }

  const initials = `${candidate.first_name[0]}${candidate.last_name[0]}`.toUpperCase();

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
            <div>
              <p className="font-semibold">{candidate.first_name} {candidate.last_name}</p>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.pending}`}
              >
                {RECRUITMENT_STATUS[status] ?? status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* --- Details section --- */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">פרטים</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">שם פרטי</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">שם משפחה</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted-foreground">אימייל</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                dir="ltr"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">טלפון</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">אזור מגורים</label>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">תאריך פניה</label>
                <input
                  value={inquiryDate}
                  onChange={(e) => setInquiryDate(e.target.value)}
                  type="date"
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">סטטוס</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RecruitmentStatus)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {(Object.keys(RECRUITMENT_STATUS) as RecruitmentStatus[]).map((s) => (
                    <option key={s} value={s}>{RECRUITMENT_STATUS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

          </section>

          {/* --- CV section --- */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">קורות חיים</h3>
            {cvUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <FileText size={16} className="shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate text-sm">קורות חיים</span>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  פתח <ExternalLink size={11} />
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">אין קורות חיים מצורפים</p>
            )}

            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCVUpload(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => cvInputRef.current?.click()}
              disabled={uploadingCV}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {uploadingCV ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {cvUrl ? "החלף קורות חיים" : "העלה קורות חיים"}
            </button>
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
          </section>

          {/* --- Activity log --- */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">יומן פעולות</h3>

            {/* New note input */}
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
                placeholder="רשום פעולה, הערה או עדכון..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60"
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                className="self-end flex items-center justify-center rounded-lg bg-primary p-2.5 text-primary-foreground disabled:opacity-40"
              >
                {addingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>

            {noteError && <p className="text-xs text-red-600">{noteError}</p>}

            {/* Activity list */}
            <div className="space-y-2">
              {loadingActivities ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={18} className="animate-spin text-muted-foreground" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3">אין פעולות רשומות עדיין</p>
              ) : (
                activities.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                    <p className="text-sm whitespace-pre-wrap">{a.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(a.created_at)}</p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              שמור שינויים
            </button>
          </section>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-4 space-y-2">
          {convertError && <p className="text-xs text-red-600 mb-2">{convertError}</p>}

          {!candidate.converted_instructor_id && !candidate.is_archived && (
            <button
              onClick={handleConvert}
              disabled={converting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {converting ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />}
              הפוך למדריך פעיל
            </button>
          )}

          {candidate.converted_instructor_id && (
            <p className="text-center text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg py-2">
              מועמד זה הומר למדריך פעיל
            </p>
          )}

          <button
            onClick={handleArchive}
            disabled={archiving}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {archiving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : candidate.is_archived ? (
              <ArchiveRestore size={15} />
            ) : (
              <Archive size={15} />
            )}
            {candidate.is_archived ? "הוצא מארכיון" : "העבר לארכיון"}
          </button>

          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                אישור מחיקה
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 size={15} />
              מחק מועמד
            </button>
          )}
        </div>
      </div>
    </>
  );
}
