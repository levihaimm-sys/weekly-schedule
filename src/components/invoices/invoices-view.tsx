"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, FileText, Send, Undo2 } from "lucide-react";
import { markInvoiceSent, unmarkInvoiceSent } from "@/lib/actions/invoices";

interface InvoiceGroup {
  id: string;
  group_label: string;
  location_names: string[];
  is_remainder: boolean;
  sort_order: number;
}

interface InvoiceRecord {
  id: string;
  group_id: string;
  amount: number;
  invoice_number: string | null;
  sent_at: string | null;
  notes: string | null;
}

interface LocationLesson {
  location_name: string;
  city: string;
  lesson_count: number;
  cancelled_count: number;
  rate_per_lesson: number;
  billing_mode: "per_lesson" | "fixed_monthly";
  fixed_monthly_amount: number;
}

interface ClientInvoiceData {
  client_name: string;
  groups: InvoiceGroup[];
  invoices: InvoiceRecord[];
  locationLessons: LocationLesson[];
}

interface Props {
  clients: ClientInvoiceData[];
  year: number;
  month: number;
}

function money(n: number) {
  return n.toLocaleString("he-IL", { maximumFractionDigits: 2 });
}

function matchesGroup(locationName: string, group: InvoiceGroup): boolean {
  if (group.is_remainder) return false;
  return group.location_names.some(
    (pattern) => locationName.includes(pattern) || pattern.includes(locationName)
  );
}

function calcGroupAmount(
  group: InvoiceGroup,
  allGroups: InvoiceGroup[],
  locationLessons: LocationLesson[]
): { locations: LocationLesson[]; total: number } {
  let matched: LocationLesson[];

  if (group.is_remainder) {
    const nonRemainderGroups = allGroups.filter((g) => !g.is_remainder);
    const claimed = new Set<string>();
    for (const loc of locationLessons) {
      for (const g of nonRemainderGroups) {
        if (matchesGroup(loc.location_name, g)) {
          claimed.add(loc.location_name);
          break;
        }
      }
    }
    matched = locationLessons.filter((l) => !claimed.has(l.location_name));
  } else {
    matched = locationLessons.filter((l) => matchesGroup(l.location_name, group));
  }

  let total = 0;
  for (const loc of matched) {
    if (loc.billing_mode === "fixed_monthly") {
      total += loc.lesson_count > 0 ? loc.fixed_monthly_amount : 0;
    } else {
      total += loc.lesson_count * loc.rate_per_lesson;
    }
  }

  return { locations: matched, total };
}

export function InvoicesView({ clients, year, month }: Props) {
  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
        אין לקוחות עם הגדרות חשבוניות. הגדר קבוצות חשבוניות בבסיס הנתונים.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clients.map((client) => (
        <ClientInvoices
          key={client.client_name}
          client={client}
          year={year}
          month={month}
        />
      ))}
    </div>
  );
}

function ClientInvoices({
  client,
  year,
  month,
}: {
  client: ClientInvoiceData;
  year: number;
  month: number;
}) {
  const sortedGroups = [...client.groups].sort((a, b) => a.sort_order - b.sort_order);
  const invoiceMap = new Map(client.invoices.map((inv) => [inv.group_id, inv]));

  const groupData = sortedGroups.map((group) => {
    const { locations, total } = calcGroupAmount(
      group,
      client.groups,
      client.locationLessons
    );
    const invoice = invoiceMap.get(group.id);
    return { group, locations, total, invoice };
  });

  const grandTotal = groupData.reduce((s, g) => s + g.total, 0);
  const allSent = groupData.every((g) => g.invoice?.sent_at);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-[#1C1917]">{client.client_name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {'סה"כ'}: <span className="font-bold text-[#1C1917]">₪{money(grandTotal)}</span>
          </span>
          {allSent && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
              <Check size={12} />
              כל החשבוניות נשלחו
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groupData.map(({ group, locations, total, invoice }) => (
          <InvoiceCard
            key={group.id}
            clientName={client.client_name}
            group={group}
            locations={locations}
            total={total}
            invoice={invoice}
            year={year}
            month={month}
          />
        ))}
      </div>
    </div>
  );
}

function InvoiceCard({
  clientName,
  group,
  locations,
  total,
  invoice,
  year,
  month,
}: {
  clientName: string;
  group: InvoiceGroup;
  locations: LocationLesson[];
  total: number;
  invoice: InvoiceRecord | undefined;
  year: number;
  month: number;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [invoiceNum, setInvoiceNum] = useState(invoice?.invoice_number ?? "");
  const [error, setError] = useState<string | null>(null);

  const isSent = !!invoice?.sent_at;

  async function handleSend() {
    setSending(true);
    setError(null);
    const result = await markInvoiceSent(
      clientName,
      group.id,
      year,
      month,
      total,
      invoiceNum
    );
    setSending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleUnsend() {
    if (!invoice) return;
    setSending(true);
    setError(null);
    const result = await unmarkInvoiceSent(invoice.id);
    setSending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border-2 transition-colors ${
        isSent ? "border-green-300 bg-green-50/30" : "border-border bg-background"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          isSent ? "bg-green-100/50" : "bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-2">
          <FileText size={18} className={isSent ? "text-green-600" : "text-muted-foreground"} />
          <span className="font-semibold text-[#1C1917]">{group.group_label}</span>
        </div>
        {isSent && (
          <span className="flex items-center gap-1 rounded-full bg-green-200 px-2 py-0.5 text-xs font-bold text-green-800">
            <Check size={11} />
            נשלחה
          </span>
        )}
      </div>

      {/* Amount */}
      <div className="border-b border-border px-4 py-4 text-center">
        <p className="text-3xl font-bold text-[#1C1917]">₪{money(total)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {locations.reduce((s, l) => s + l.lesson_count, 0)} שיעורים פעילים
        </p>
      </div>

      {/* Locations breakdown */}
      <div className="border-b border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs text-muted-foreground">
              <th className="px-3 py-1.5 text-start">גן</th>
              <th className="px-3 py-1.5 text-center">שיעורים</th>
              <th className="px-3 py-1.5 text-center">תעריף</th>
              <th className="px-3 py-1.5 text-center">{'סה"כ'}</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => {
              const locTotal =
                loc.billing_mode === "fixed_monthly"
                  ? loc.lesson_count > 0
                    ? loc.fixed_monthly_amount
                    : 0
                  : loc.lesson_count * loc.rate_per_lesson;
              return (
                <tr key={loc.location_name} className="border-b border-border/30 last:border-0">
                  <td className="px-3 py-1.5 font-medium">{loc.location_name}</td>
                  <td className="px-3 py-1.5 text-center text-muted-foreground">
                    {loc.lesson_count}
                    {loc.cancelled_count > 0 && (
                      <span className="text-red-500"> ({loc.cancelled_count} בוטלו)</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-center text-muted-foreground">
                    {loc.billing_mode === "fixed_monthly"
                      ? `₪${money(loc.fixed_monthly_amount)} קבוע`
                      : `₪${money(loc.rate_per_lesson)}`}
                  </td>
                  <td className="px-3 py-1.5 text-center font-medium">₪{money(locTotal)}</td>
                </tr>
              );
            })}
            {locations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-center text-muted-foreground">
                  אין שיעורים בקבוצה זו
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="space-y-2 px-4 py-3">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-700">{error}</p>
        )}

        {!isSent ? (
          <div className="flex items-center gap-2">
            <input
              value={invoiceNum}
              onChange={(e) => setInvoiceNum(e.target.value)}
              placeholder="מספר חשבונית (אופציונלי)"
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <Send size={14} />
              סמן כנשלחה
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {invoice?.invoice_number && (
                <span className="text-muted-foreground">
                  חשבונית #{invoice.invoice_number}
                </span>
              )}
              {invoice?.sent_at && (
                <span className="text-xs text-muted-foreground ms-2">
                  · נשלחה {new Date(invoice.sent_at).toLocaleDateString("he-IL")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleUnsend}
              disabled={sending}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Undo2 size={12} />
              בטל סימון
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
