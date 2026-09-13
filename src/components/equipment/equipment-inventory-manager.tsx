"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Plus, Trash2 } from "lucide-react";
import {
  createEquipment,
  deleteEquipment,
  updateEquipmentName,
  updateEquipmentTotalStock,
} from "@/lib/actions/equipment";

interface Holder {
  instructor_name: string;
  lesson_plan_name: string;
  quantity: number;
}

interface InventoryRow {
  equipment_id: string;
  equipment_name: string;
  total_stock: number | null;
  with_instructors: number;
  holders: Holder[];
}

type SortKey = "name" | "total_stock" | "with_instructors" | "available";

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "name", label: "ציוד", className: "text-right" },
  { key: "total_stock", label: "מלאי כולל", className: "w-32 text-right" },
  { key: "with_instructors", label: "אצל מדריכות כרגע", className: "w-56 text-right" },
  { key: "available", label: "יתרה כרגע", className: "w-28 text-right" },
];

export function EquipmentInventoryManager({ rows }: { rows: InventoryRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortedRows = useMemo(() => {
    const withAvailable = rows.map((r) => ({
      ...r,
      available: r.total_stock == null ? null : r.total_stock - r.with_instructors,
    }));

    const getValue = (r: (typeof withAvailable)[number]): string | number => {
      switch (sortKey) {
        case "name":
          return r.equipment_name;
        case "total_stock":
          return r.total_stock ?? Infinity;
        case "with_instructors":
          return r.with_instructors;
        case "available":
          return r.available ?? Infinity;
      }
    };

    return [...withAvailable].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      const cmp =
        typeof av === "string" || typeof bv === "string"
          ? String(av).localeCompare(String(bv), "he")
          : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  return (
    <div className="space-y-3">
      <AddEquipmentForm />
      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            {COLUMNS.map((col) => (
              <th key={col.key} className={`p-3 font-medium ${col.className}`}>
                <button
                  onClick={() => toggleSort(col.key)}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  {col.label}
                  {sortKey === col.key ? (
                    sortDir === "asc" ? (
                      <ArrowUp size={13} />
                    ) : (
                      <ArrowDown size={13} />
                    )
                  ) : (
                    <ArrowUpDown size={13} className="opacity-40" />
                  )}
                </button>
              </th>
            ))}
            <th className="p-3 w-10" />
          </tr>
        </thead>
          <tbody className="divide-y">
            {sortedRows.map((row) => (
              <InventoryRowItem key={row.equipment_id} row={row} available={row.available} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddEquipmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [stockValue, setStockValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const stockTrimmed = stockValue.trim();
    const parsed = stockTrimmed === "" ? null : Number(stockTrimmed);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) return;

    startTransition(async () => {
      const result = await createEquipment(trimmed, parsed);
      if (result.success) {
        setName("");
        setStockValue("");
        router.refresh();
      } else {
        alert("שגיאה בהוספת ציוד: " + result.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-3"
    >
      <div className="flex-1 min-w-[12rem]">
        <label className="text-xs text-muted-foreground">שם ציוד חדש</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: חישוקים גדולים"
          disabled={isPending}
          className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
        />
      </div>
      <div className="w-28">
        <label className="text-xs text-muted-foreground">מלאי כולל</label>
        <input
          type="number"
          min={0}
          value={stockValue}
          onChange={(e) => setStockValue(e.target.value)}
          placeholder="המון"
          disabled={isPending}
          className="mt-1 w-full px-2 py-1.5 text-sm border rounded-md border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !name.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        <Plus size={16} />
        הוסף ציוד
      </button>
    </form>
  );
}

function InventoryRowItem({
  row,
  available,
}: {
  row: InventoryRow;
  available: number | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(row.equipment_name);
  const [stockValue, setStockValue] = useState(
    row.total_stock != null ? String(row.total_stock) : ""
  );
  const [isPending, startTransition] = useTransition();
  const [savedField, setSavedField] = useState<"name" | "stock" | null>(null);

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === row.equipment_name) {
      setName(row.equipment_name);
      return;
    }

    startTransition(async () => {
      const result = await updateEquipmentName(row.equipment_id, trimmed);
      if (result.success) {
        setSavedField("name");
        router.refresh();
        setTimeout(() => setSavedField(null), 1500);
      } else {
        alert("שגיאה בשינוי שם: " + result.error);
        setName(row.equipment_name);
      }
    });
  }

  function saveStock() {
    const trimmed = stockValue.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      setStockValue(row.total_stock != null ? String(row.total_stock) : "");
      return;
    }

    if (parsed === row.total_stock) return;

    startTransition(async () => {
      const result = await updateEquipmentTotalStock(row.equipment_id, parsed);
      if (result.success) {
        setSavedField("stock");
        router.refresh();
        setTimeout(() => setSavedField(null), 1500);
      }
    });
  }

  function handleDelete() {
    const confirmed = confirm(
      `למחוק את "${row.equipment_name}" לצמיתות?\nהפעולה תמחק אותו גם מכל מערכי השיעור ואישורי הקבלה שמשתמשים בו.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteEquipment(row.equipment_id);
      if (result.success) {
        router.refresh();
      } else {
        alert("שגיאה במחיקה: " + result.error);
      }
    });
  }

  const isShort = available != null && available < 0;
  const isFullyOut = available === 0 && row.with_instructors > 0;

  return (
    <tr className="text-sm hover:bg-muted/50">
      <td className="p-3 align-top">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            disabled={isPending}
            className="w-full min-w-[10rem] px-2 py-1 text-sm border rounded-md border-transparent bg-transparent hover:border-border focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {savedField === "name" && <Check className="w-4 h-4 text-green-600 shrink-0" />}
        </div>
      </td>
      <td className="p-3 align-top">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={stockValue}
            placeholder="המון"
            onChange={(e) => setStockValue(e.target.value)}
            onBlur={saveStock}
            disabled={isPending}
            className="w-20 px-2 py-1 text-sm border rounded-md border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
          />
          {savedField === "stock" && <Check className="w-4 h-4 text-green-600 shrink-0" />}
        </div>
      </td>
      <td className="p-3 align-top">
        <div className="font-medium">{row.with_instructors > 0 ? row.with_instructors : "-"}</div>
        {row.holders.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {row.holders.map((h, idx) => (
              <div key={idx} className="text-xs text-muted-foreground">
                {h.instructor_name} &ndash; {h.lesson_plan_name} ({h.quantity} יח&apos;)
              </div>
            ))}
          </div>
        )}
      </td>
      <td
        className={`p-3 align-top font-medium ${
          available == null
            ? "text-muted-foreground"
            : isShort
              ? "text-red-600"
              : isFullyOut
                ? "text-orange-600"
                : ""
        }`}
      >
        {available == null ? "המון" : available}
      </td>
      <td className="p-3 align-top">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-muted-foreground hover:text-red-600 disabled:opacity-50"
          aria-label="מחק ציוד"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
