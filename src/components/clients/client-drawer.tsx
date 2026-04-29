"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  Mail,
  User,
  ExternalLink,
  Check,
  Loader2,
  Trash2,
  FileText,
} from "lucide-react";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import type { ClientRecord } from "@/types/database";

interface Props {
  client: ClientRecord;
  onClose: () => void;
}

export function ClientDrawer({ client, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [name, setName] = useState(client.name);
  const [primaryName, setPrimaryName] = useState(client.primary_contact_name ?? "");
  const [primaryPhone, setPrimaryPhone] = useState(client.primary_contact_phone ?? "");
  const [primaryEmail, setPrimaryEmail] = useState(client.primary_contact_email ?? "");
  const [secondaryName, setSecondaryName] = useState(client.secondary_contact_name ?? "");
  const [secondaryPhone, setSecondaryPhone] = useState(client.secondary_contact_phone ?? "");
  const [secondaryEmail, setSecondaryEmail] = useState(client.secondary_contact_email ?? "");
  const [reportLink, setReportLink] = useState(client.monthly_report_link ?? "");

  function handleSave() {
    startTransition(async () => {
      await updateClient(client.id, {
        name: name.trim() || client.name,
        primary_contact_name: primaryName.trim() || null,
        primary_contact_phone: primaryPhone.trim() || null,
        primary_contact_email: primaryEmail.trim() || null,
        secondary_contact_name: secondaryName.trim() || null,
        secondary_contact_phone: secondaryPhone.trim() || null,
        secondary_contact_email: secondaryEmail.trim() || null,
        monthly_report_link: reportLink.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {client.name.charAt(0)}
            </div>
            <p className="font-semibold">{client.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Client name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">שם הלקוח</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* Primary contact */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">איש קשר ראשי</p>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">שם</label>
              <div className="flex items-center gap-2">
                <User size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  placeholder="שם איש קשר"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">טלפון</label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  placeholder="050-0000000"
                  dir="ltr"
                  type="tel"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">אימייל</label>
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  placeholder="email@example.com"
                  dir="ltr"
                  type="email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Secondary contact */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">איש קשר משני</p>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">שם</label>
              <div className="flex items-center gap-2">
                <User size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                  placeholder="שם איש קשר"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">טלפון</label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="050-0000000"
                  dir="ltr"
                  type="tel"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">אימייל</label>
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-muted-foreground" />
                <input
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  placeholder="email@example.com"
                  dir="ltr"
                  type="email"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Monthly report link */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">קישור דוחות חודשיים</label>
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
                <a
                  href={reportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <>
                <Check size={14} /> נשמר
              </>
            ) : (
              "שמור שינויים"
            )}
          </button>

          {/* Delete */}
          <div className="border-t border-border pt-4">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
                מחק לקוח
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600">בטוח? פעולה זו אינה ניתנת לביטול.</p>
                {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                    כן, מחק
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
