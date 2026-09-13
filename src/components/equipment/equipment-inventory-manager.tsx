"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Package } from "lucide-react";
import { updateEquipmentTotalStock } from "@/lib/actions/equipment";

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

export function EquipmentInventoryManager({ rows }: { rows: InventoryRow[] }) {
  return (
    <div className="rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="p-3 text-right font-medium">ציוד</th>
            <th className="p-3 text-right font-medium w-32">מלאי כולל</th>
            <th className="p-3 text-right font-medium w-40">אצל מדריכות כרגע</th>
            <th className="p-3 text-right font-medium w-28">יתרה כרגע</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <InventoryRowItem key={row.equipment_id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InventoryRowItem({ row }: { row: InventoryRow }) {
  const router = useRouter();
  const [value, setValue] = useState(row.total_stock != null ? String(row.total_stock) : "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  function save() {
    const trimmed = value.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      setValue(row.total_stock != null ? String(row.total_stock) : "");
      return;
    }

    if (parsed === row.total_stock) return;

    startTransition(async () => {
      const result = await updateEquipmentTotalStock(row.equipment_id, parsed);
      if (result.success) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  const available = row.total_stock == null ? null : row.total_stock - row.with_instructors;
  const isShort = available != null && available < 0;
  const isFullyOut = available === 0 && row.with_instructors > 0;

  return (
    <>
      <tr className="text-sm hover:bg-muted/50">
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span>{row.equipment_name}</span>
            {row.holders.length > 0 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-0.5 text-xs text-orange-600 hover:underline shrink-0"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                />
                {row.holders.length} מדריכות
              </button>
            )}
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={value}
              placeholder="המון"
              onChange={(e) => setValue(e.target.value)}
              onBlur={save}
              disabled={isPending}
              className="w-20 px-2 py-1 text-sm border rounded-md border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
            />
            {saved && <Check className="w-4 h-4 text-green-600" />}
          </div>
        </td>
        <td className="p-3 text-muted-foreground">
          {row.with_instructors > 0 ? row.with_instructors : "-"}
        </td>
        <td
          className={`p-3 font-medium ${
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
      </tr>
      {expanded && row.holders.length > 0 && (
        <tr>
          <td colSpan={4} className="bg-muted/30 p-3">
            <div className="space-y-1">
              {row.holders.map((h, idx) => (
                <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Package size={12} />
                    {h.instructor_name} &mdash; {h.lesson_plan_name}
                  </span>
                  <span className="font-medium">{h.quantity} יח&apos;</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
