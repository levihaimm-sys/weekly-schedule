"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, X, Pencil } from "lucide-react";
import {
  confirmEquipmentReceipt,
  confirmAllEquipmentCorrect,
  updateEquipmentQuantity,
  addExtraEquipment,
} from "@/lib/actions/equipment";
import type { EquipmentConfirmation } from "@/types/database";

interface EquipmentConfirmationProps {
  confirmations: Array<
    EquipmentConfirmation & {
      equipment: { name: string };
    }
  >;
  assignmentId: string;
  canConfirm: boolean; // Only allow confirmation on Sunday-Monday
}

export function EquipmentConfirmationList({
  confirmations,
  assignmentId,
  canConfirm,
}: EquipmentConfirmationProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [extraQuantity, setExtraQuantity] = useState<string>("");
  const [extraNotes, setExtraNotes] = useState<string>("");
  const [availableEquipment, setAvailableEquipment] = useState<Array<{ id: string; name: string }>>([]);

  const allConfirmed = confirmations.every((c) => c.is_confirmed);
  const hasUnconfirmed = confirmations.some((c) => !c.is_confirmed);

  // Load available equipment for adding extra items
  useEffect(() => {
    fetch("/api/equipment")
      .then((res) => res.json())
      .then((data) => setAvailableEquipment(data.equipment || []))
      .catch((error) => console.error("Error loading equipment:", error));
  }, []);

  const handleConfirmAll = () => {
    startTransition(async () => {
      const result = await confirmAllEquipmentCorrect(assignmentId);
      if (!result.success) {
        alert("שגיאה באישור הציוד: " + result.error);
      }
    });
  };

  const handleConfirmItem = (
    confirmationId: string,
    receivedQuantity: number,
    notes?: string
  ) => {
    startTransition(async () => {
      const result = await confirmEquipmentReceipt(
        confirmationId,
        receivedQuantity,
        notes
      );
      if (!result.success) {
        alert("שגיאה באישור הציוד: " + result.error);
      }
    });
  };

  const handleEdit = (confirmation: EquipmentConfirmation) => {
    setEditingId(confirmation.id);
    setEditValue(
      String(confirmation.received_quantity ?? confirmation.expected_quantity)
    );
  };

  const handleSaveEdit = (confirmation: EquipmentConfirmation) => {
    const quantity = parseInt(editValue);
    if (isNaN(quantity) || quantity < 0) {
      alert("כמות לא תקינה");
      return;
    }

    startTransition(async () => {
      const result = await updateEquipmentQuantity(confirmation.id, quantity);
      if (result.success) {
        setEditingId(null);
      } else {
        alert("שגיאה בעדכון הכמות: " + result.error);
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleAddExtra = () => {
    const quantity = parseInt(extraQuantity);
    if (!selectedEquipmentId || isNaN(quantity) || quantity <= 0) {
      alert("אנא בחר ציוד והזן כמות תקינה");
      return;
    }

    startTransition(async () => {
      const instructorId = confirmations[0]?.instructor_id;
      if (!instructorId) {
        alert("שגיאה: לא נמצא מזהה מדריכה");
        return;
      }

      const result = await addExtraEquipment(
        assignmentId,
        instructorId,
        selectedEquipmentId,
        quantity,
        extraNotes || undefined
      );

      if (result.success) {
        setShowAddExtra(false);
        setSelectedEquipmentId("");
        setExtraQuantity("");
        setExtraNotes("");
      } else {
        alert("שגיאה בהוספת ציוד: " + result.error);
      }
    });
  };

  if (confirmations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        אין ציוד רשום למערך זה
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">רשימת ציוד</h3>
        {canConfirm && hasUnconfirmed && !allConfirmed && (
          <button
            onClick={handleConfirmAll}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            אשר הכל כנכון
          </button>
        )}
      </div>

      {/* Status Message */}
      {!canConfirm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          ⚠️ ניתן לאשר קבלת ציוד רק ביום ראשון ושני
        </div>
      )}

      {allConfirmed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          ✅ כל הציוד אושר
        </div>
      )}

      {/* Equipment List */}
      <div className="space-y-2">
        {confirmations.map((confirmation) => {
          const isEditing = editingId === confirmation.id;
          const hasDiscrepancy =
            confirmation.is_confirmed &&
            confirmation.received_quantity !== null &&
            confirmation.received_quantity !== confirmation.expected_quantity;
          const isExtra = confirmation.is_extra;

          return (
            <div
              key={confirmation.id}
              className={`border rounded-lg p-4 ${
                confirmation.is_confirmed
                  ? hasDiscrepancy
                    ? "bg-yellow-50 border-yellow-200"
                    : isExtra
                      ? "bg-purple-50 border-purple-200"
                      : "bg-green-50 border-green-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Equipment Name */}
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {confirmation.equipment.name}
                    {isExtra && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                        ציוד נוסף
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    צפוי: {confirmation.expected_quantity} יחידות
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        disabled={isPending}
                      />
                      <button
                        onClick={() => handleSaveEdit(confirmation)}
                        disabled={isPending}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="שמור"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isPending}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="ביטול"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : confirmation.is_confirmed ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          hasDiscrepancy ? "text-yellow-800" : "text-green-800"
                        }`}
                      >
                        התקבל: {confirmation.received_quantity}
                      </span>
                      {hasDiscrepancy && (
                        <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          חסר {confirmation.expected_quantity - confirmation.received_quantity!}
                        </span>
                      )}
                      {canConfirm && (
                        <button
                          onClick={() => handleEdit(confirmation)}
                          disabled={isPending}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="ערוך"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : canConfirm ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleConfirmItem(
                            confirmation.id,
                            confirmation.expected_quantity
                          )
                        }
                        disabled={isPending}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                        title="אישור - התקבל הכל"
                      >
                        <Check className="w-4 h-4" />
                        אישור
                      </button>
                      <button
                        onClick={() => handleEdit(confirmation)}
                        disabled={isPending}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
                        title="עדכן כמות"
                      >
                        עדכן
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      ממתין לאישור
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {confirmation.notes && (
                <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                  <strong>הערה:</strong> {confirmation.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Extra Equipment Section */}
      {canConfirm && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          {!showAddExtra ? (
            <button
              onClick={() => setShowAddExtra(true)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              + הוסף ציוד נוסף שקיבלתי (שלא היה ברשימה)
            </button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">הוספת ציוד נוסף</h4>
                <button
                  onClick={() => setShowAddExtra(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סוג הציוד</label>
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={isPending}
                >
                  <option value="">בחר ציוד...</option>
                  {availableEquipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">כמות שקיבלת</label>
                <input
                  type="number"
                  min="1"
                  value={extraQuantity}
                  onChange={(e) => setExtraQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="הכנס כמות..."
                  disabled={isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  הערה (אופציונלי)
                </label>
                <textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="למשל: נשאר מהמדריכה הקודמת"
                  rows={2}
                  disabled={isPending}
                />
              </div>

              <button
                onClick={handleAddExtra}
                disabled={isPending}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? "מוסיף..." : "הוסף ציוד"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
