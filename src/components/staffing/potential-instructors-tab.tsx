"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Loader2, Check, X, Search, Trash2 } from "lucide-react";
import { addPotentialInstructor, deletePotentialInstructor, updatePotentialInstructor } from "@/lib/actions/staffing";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import { usePersistedState } from "@/hooks/use-persisted-state";
import type { StaffingPotentialInstructor } from "@/types/database";

interface Props {
  potentialInstructors: StaffingPotentialInstructor[];
}

export function PotentialInstructorsTab({ potentialInstructors }: Props) {
  const router = useRouter();
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = usePersistedState("staffing-potential-search", "");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [regionFilter, setRegionFilter] = usePersistedState<string[]>("staffing-potential-region", []);
  const [fieldFilter, setFieldFilter] = usePersistedState<string[]>("staffing-potential-field", []);

  const hasActiveFilters = search.trim() !== "" || regionFilter.length > 0 || fieldFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setRegionFilter([]);
    setFieldFilter([]);
  }

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [field, setField] = useState("");
  const [offeredAmount, setOfferedAmount] = useState("");

  const existingRegions = Array.from(new Set(potentialInstructors.map((p) => p.region).filter(Boolean))).sort(
    (a, b) => (a as string).localeCompare(b as string, "he")
  ) as string[];
  const existingFields = Array.from(new Set(potentialInstructors.map((p) => p.field).filter(Boolean))).sort(
    (a, b) => (a as string).localeCompare(b as string, "he")
  ) as string[];

  const filteredRows = useMemo(() => {
    return potentialInstructors
      .filter((p) => {
        if (regionFilter.length > 0 && !regionFilter.includes(p.region ?? "")) return false;
        if (fieldFilter.length > 0 && !fieldFilter.includes(p.field ?? "")) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !p.full_name.toLowerCase().includes(q) &&
            !(p.phone ?? "").toLowerCase().includes(q) &&
            !(p.region ?? "").toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "he"));
  }, [potentialInstructors, regionFilter, fieldFilter, search]);

  async function saveField(
    id: string,
    field: "full_name" | "phone" | "region" | "field" | "last_contact_note",
    value: string
  ) {
    const result = await updatePotentialInstructor(id, { [field]: value });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  async function saveOfferedAmount(id: string, value: string) {
    const amount = value.trim() === "" ? null : Number(value);
    const result = await updatePotentialInstructor(id, { offered_amount: amount !== null && Number.isNaN(amount) ? null : amount });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  async function handleAdd() {
    setError(null);
    if (!fullName.trim()) {
      setError("יש להזין שם");
      return;
    }
    setIsPending(true);
    const amount = offeredAmount.trim() === "" ? null : Number(offeredAmount);
    const result = await addPotentialInstructor({
      full_name: fullName,
      phone,
      region,
      field,
      offered_amount: amount !== null && Number.isNaN(amount) ? null : amount,
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setAddFormOpen(false);
    setFullName("");
    setPhone("");
    setRegion("");
    setField("");
    setOfferedAmount("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deletePotentialInstructor(id);
    setConfirmDeleteId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{potentialInstructors.length} מדריכים פוטנציאלים</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש שם / טלפון / אזור"
              className={`w-52 rounded-lg border py-2 pe-3 ps-8 text-sm transition-colors ${
                search.trim() ? "border-secondary bg-secondary/10 font-medium" : "border-border bg-background"
              }`}
            />
          </div>
          <button
            onClick={() => setAddFormOpen(!addFormOpen)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            הוסף מדריך פוטנציאלי
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          options={existingRegions.map((r) => ({ value: r, label: r }))}
          selected={regionFilter}
          onChange={setRegionFilter}
          placeholder="כל האזורים"
        />
        <MultiSelectFilter
          options={existingFields.map((f) => ({ value: f, label: f }))}
          selected={fieldFilter}
          onChange={setFieldFilter}
          placeholder="כל התחומים"
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <X size={14} />
            נקה סינון
          </button>
        )}
      </div>

      {error && !addFormOpen && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {addFormOpen && (
        <div className="rounded-xl border border-secondary/40 bg-secondary/5 p-4">
          <h3 className="mb-3 font-medium">מדריך פוטנציאלי חדש</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">שם</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">טלפון</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="050-0000000"
                  dir="ltr"
                  className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">אזור עבודה</label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  list="staffing-potential-regions"
                  placeholder="ראש העין, פתח תקווה"
                  className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-potential-regions">
                  {existingRegions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">תחום הפעלה</label>
                <input
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  list="staffing-potential-fields"
                  placeholder="ריקוד, ספורט..."
                  className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <datalist id="staffing-potential-fields">
                  {existingFields.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">סכום שהוצע (₪)</label>
                <input
                  value={offeredAmount}
                  onChange={(e) => setOfferedAmount(e.target.value)}
                  type="number"
                  min={0}
                  placeholder="150"
                  dir="ltr"
                  className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                הוסף
              </button>
              <button
                onClick={() => {
                  setAddFormOpen(false);
                  setError(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[780px] table-fixed text-sm">
          <colgroup>
            <col className="w-[110px]" />
            <col className="w-[100px]" />
            <col className="w-[130px]" />
            <col className="w-[110px]" />
            <col className="w-[90px]" />
            <col className="w-[64px]" />
            <col />
            <col className="w-7" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-2 py-2">שם</th>
              <th className="px-2 py-2">טלפון</th>
              <th className="px-2 py-2">אזור עבודה</th>
              <th className="px-2 py-2">תחום הפעלה</th>
              <th className="px-2 py-2">סכום שהוצע</th>
              <th className="px-2 py-2">עדכון</th>
              <th className="px-2 py-2">תקשורת אחרונה</th>
              <th className="px-1 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted-foreground">
                  אין עדיין מדריכים פוטנציאלים
                </td>
              </tr>
            ) : (
              filteredRows.map((p) => (
                <tr key={p.id} className="group">
                  <td className="px-1.5 py-1.5 align-top">
                    <InlineEditableCell
                      value={p.full_name}
                      onSave={(v) => saveField(p.id, "full_name", v)}
                      className="font-medium"
                      title={p.full_name}
                    />
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <InlineEditableCell
                      value={p.phone ?? ""}
                      onSave={(v) => saveField(p.id, "phone", v)}
                      placeholder="—"
                      dir="ltr"
                      className="text-muted-foreground"
                    />
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <InlineEditableCell
                      value={p.region ?? ""}
                      onSave={(v) => saveField(p.id, "region", v)}
                      placeholder="—"
                      className="text-muted-foreground"
                    />
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <InlineEditableCell
                      value={p.field ?? ""}
                      onSave={(v) => saveField(p.id, "field", v)}
                      placeholder="—"
                      className="text-muted-foreground"
                    />
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <InlineEditableAmountCell
                      value={p.offered_amount}
                      onSave={(v) => saveOfferedAmount(p.id, v)}
                      className="text-muted-foreground"
                    />
                  </td>
                  <td className="px-2 py-1.5 align-top text-[10px] whitespace-nowrap text-muted-foreground">
                    {format(new Date(p.last_contact_at ?? p.created_at), "dd/MM")}
                  </td>
                  <td className="px-1.5 py-1.5 align-top">
                    <InlineEditableCell
                      value={p.last_contact_note ?? ""}
                      onSave={(v) => saveField(p.id, "last_contact_note", v)}
                      placeholder="הערת תקשורת..."
                      className="font-bold text-foreground"
                    />
                  </td>
                  <td className="px-1 py-1.5 align-top text-center">
                    {confirmDeleteId === p.id ? (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                          title="אישור מחיקה"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                          title="ביטול"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                        title="מחק"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineEditableCell({
  value,
  onSave,
  placeholder,
  className = "",
  title,
  dir,
}: {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  title?: string;
  dir?: "ltr" | "rtl";
}) {
  const [draft, setDraft] = useState(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function commit() {
    const trimmed = draft.trim();
    if (trimmed === value.trim()) return;
    setIsPending(true);
    await onSave(trimmed);
    setIsPending(false);
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setDraft(value);
      }}
      placeholder={placeholder}
      disabled={isPending}
      title={title}
      dir={dir}
      className={`w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm transition-colors outline-none hover:border-border focus:border-primary focus:bg-background disabled:opacity-50 ${
        dir === "ltr" ? "text-right" : ""
      } ${className}`}
    />
  );
}

function InlineEditableAmountCell({
  value,
  onSave,
  className = "",
}: {
  value: number | null;
  onSave: (value: string) => Promise<void> | void;
  className?: string;
}) {
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setDraft(value === null ? "" : String(value));
  }, [value]);

  async function commit() {
    const trimmed = draft.trim();
    const original = value === null ? "" : String(value);
    if (trimmed === original) return;
    setIsPending(true);
    await onSave(trimmed);
    setIsPending(false);
  }

  return (
    <div className="flex items-center gap-1">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") setDraft(value === null ? "" : String(value));
        }}
        type="number"
        min={0}
        placeholder="—"
        dir="ltr"
        disabled={isPending}
        className={`w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-right text-sm transition-colors outline-none hover:border-border focus:border-primary focus:bg-background disabled:opacity-50 ${className}`}
      />
      {value !== null && <span className="shrink-0 text-xs text-muted-foreground">₪</span>}
    </div>
  );
}
