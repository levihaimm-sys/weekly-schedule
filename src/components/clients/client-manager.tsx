"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Check, Phone, Mail, ExternalLink, Search } from "lucide-react";
import { addClient } from "@/lib/actions/clients";
import { ClientDrawer } from "./client-drawer";
import type { ClientRecord } from "@/types/database";

interface Props {
  clients: ClientRecord[];
}

export function ClientManager({ clients }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = clients.filter(
    (c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openClient = openClientId
    ? clients.find((c) => c.id === openClientId) ?? null
    : null;

  async function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addClient(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setAddFormOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{clients.length} לקוחות</p>
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            הוסף לקוח
          </button>
        </div>

        {/* Add form */}
        {addFormOpen && (
          <form
            action={handleAdd}
            className="rounded-xl border border-secondary/40 bg-secondary/5 p-4"
          >
            <h3 className="mb-3 font-medium">לקוח חדש</h3>
            <div className="flex flex-wrap items-center gap-3">
              <input
                name="name"
                type="text"
                required
                placeholder="שם הלקוח"
                className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
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
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </form>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <Search size={14} className="shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">שם לקוח</th>
                <th className="px-4 py-3">איש קשר ראשי</th>
                <th className="px-4 py-3">טלפון ראשי</th>
                <th className="px-4 py-3">אימייל ראשי</th>
                <th className="px-4 py-3">איש קשר משני</th>
                <th className="px-4 py-3 text-center">דוח חודשי</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    אין לקוחות להצגה
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => setOpenClientId(client.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium">{client.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.primary_contact_name ?? <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" dir="ltr">
                      {client.primary_contact_phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="shrink-0" />
                          {client.primary_contact_phone}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.primary_contact_email ? (
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="shrink-0" />
                          {client.primary_contact_email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {client.secondary_contact_name ?? <span className="text-muted-foreground/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {client.monthly_report_link ? (
                        <a
                          href={client.monthly_report_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <ExternalLink size={11} />
                          פתח
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openClient && (
        <ClientDrawer
          client={openClient}
          onClose={() => setOpenClientId(null)}
        />
      )}
    </>
  );
}
