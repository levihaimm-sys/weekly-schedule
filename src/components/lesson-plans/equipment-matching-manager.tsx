"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Package } from "lucide-react";
import { updateLessonPlanEquipmentInstructorQuantity } from "@/lib/actions/equipment";

interface EquipmentRow {
  id: string;
  equipment_id: string;
  equipment_name: string;
  quantity: number;
  instructor_quantity: number | null;
}

interface PlanWithEquipment {
  id: string;
  name: string;
  week_number: number;
  equipment: EquipmentRow[];
}

interface Props {
  plansByCategory: Record<string, PlanWithEquipment[]>;
}

export function EquipmentMatchingManager({ plansByCategory }: Props) {
  const categories = Object.keys(plansByCategory);

  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <div key={category}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
          <div className="space-y-4">
            {plansByCategory[category].map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanWithEquipment }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
      </div>

      {plan.equipment.length === 0 ? (
        <p className="px-4 py-4 text-sm text-gray-500">אין ציוד רשום למערך זה</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-right text-xs font-medium text-gray-500">
              <th className="px-4 py-2">ציוד</th>
              <th className="px-4 py-2 w-28">נדרש במערך</th>
              <th className="px-4 py-2 w-40">מוצג למדריך</th>
            </tr>
          </thead>
          <tbody>
            {plan.equipment.map((item) => (
              <EquipmentRowEditor key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EquipmentRowEditor({ item }: { item: EquipmentRow }) {
  const router = useRouter();
  const [value, setValue] = useState(
    item.instructor_quantity != null ? String(item.instructor_quantity) : ""
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const isOverridden = item.instructor_quantity != null && item.instructor_quantity !== item.quantity;

  function save() {
    const trimmed = value.trim();
    const parsed = trimmed === "" ? null : Number(trimmed);

    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      setValue(item.instructor_quantity != null ? String(item.instructor_quantity) : "");
      return;
    }

    if (parsed === item.instructor_quantity) return;

    startTransition(async () => {
      const result = await updateLessonPlanEquipmentInstructorQuantity(item.id, parsed);
      if (result.success) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="px-4 py-2 text-gray-800 flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        {item.equipment_name}
      </td>
      <td className="px-4 py-2 text-gray-500">{item.quantity}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value}
            placeholder={String(item.quantity)}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            disabled={isPending}
            className={`w-20 px-2 py-1 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 ${
              isOverridden ? "border-orange-300 bg-orange-50" : "border-gray-300"
            }`}
          />
          {saved && <Check className="w-4 h-4 text-green-600" />}
          {!saved && isOverridden && (
            <span className="text-xs text-orange-600">שונה מ-{item.quantity}</span>
          )}
        </div>
      </td>
    </tr>
  );
}
