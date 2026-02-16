"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addInstructor,
  updateInstructorStatus,
  updateInstructor,
} from "@/lib/actions/instructors";
import {
  Users,
  Plus,
  Phone,
  Pencil,
  Check,
  X,
  Loader2,
  Filter,
} from "lucide-react";
import { INSTRUCTOR_STATUS, InstructorStatusType } from "@/lib/utils/constants";

interface Instructor {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: InstructorStatusType;
  address: string | null;
}

export function InstructorManager({
  instructors,
}: {
  instructors: Instructor[];
}) {
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<InstructorStatusType>>(
    new Set(["active", "substitute"])
  );
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter by selected statuses
  const filtered = instructors.filter((i) => selectedStatuses.has(i.status));

  // Count by status
  const activeCount = instructors.filter((i) => i.status === "active").length;
  const substituteCount = instructors.filter((i) => i.status === "substitute").length;
  const inactiveCount = instructors.filter((i) => i.status === "inactive").length;

  function toggleStatus(status: InstructorStatusType) {
    const newSet = new Set(selectedStatuses);
    if (newSet.has(status)) {
      newSet.delete(status);
    } else {
      newSet.add(status);
    }
    // Ensure at least one status is selected
    if (newSet.size > 0) {
      setSelectedStatuses(newSet);
    }
  }

  async function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addInstructor(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setAddFormOpen(false);
        router.refresh();
      }
    });
  }

  async function handleChangeStatus(id: string, newStatus: InstructorStatusType) {
    startTransition(async () => {
      const result = await updateInstructorStatus(id, newStatus);
      if (result.error) {
        console.error("Error updating status:", result.error);
      }
      // Let revalidatePath handle the refresh instead of router.refresh()
    });
  }

  async function handleSaveEdit(id: string) {
    startTransition(async () => {
      await updateInstructor(id, {
        full_name: editName.trim() || undefined,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      });
      setEditingId(null);
      router.refresh();
    });
  }

  function startEdit(instructor: Instructor) {
    setEditingId(instructor.id);
    setEditName(instructor.full_name);
    setEditPhone(instructor.phone ?? "");
    setEditAddress(instructor.address ?? "");
  }

  const statusColors = {
    active: "bg-green-50 text-green-700 border-green-200",
    substitute: "bg-blue-50 text-blue-700 border-blue-200",
    inactive: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {activeCount} פעילים | {substituteCount} משלימים | {inactiveCount} לא פעילים
          </p>
        </div>
        <button
          onClick={() => setAddFormOpen(!addFormOpen)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          הוסף מדריך
        </button>
      </div>

      {/* Multi-select filter */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Filter size={14} />
          <span>הצג:</span>
        </div>
        {(Object.entries(INSTRUCTOR_STATUS) as [InstructorStatusType, string][]).map(([key, label]) => (
          <label
            key={key}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-all ${
              selectedStatuses.has(key)
                ? statusColors[key] + " font-medium"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedStatuses.has(key)}
              onChange={() => toggleStatus(key)}
              className="h-4 w-4 rounded border-gray-300"
            />
            {label}
          </label>
        ))}
      </div>

      {/* Add form */}
      {addFormOpen && (
        <form
          action={handleAdd}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4"
        >
          <h3 className="mb-3 font-medium">מדריך חדש</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <input
                name="full_name"
                type="text"
                required
                placeholder="שם מלא"
                className="flex-1 min-w-[150px] rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                name="phone"
                type="tel"
                dir="ltr"
                placeholder="טלפון"
                className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <input
              name="address"
              type="text"
              placeholder="כתובת מגורים"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                הוסף
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddFormOpen(false);
                  setError(null);
                }}
                className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </form>
      )}

      {/* Instructors list */}
      <div className="divide-y divide-border rounded-xl border border-border bg-background">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            אין מדריכים להצגה
          </div>
        ) : (
          filtered.map((instructor) => {
            const isEditing = editingId === instructor.id;

            return (
              <div
                key={instructor.id}
                className={`flex items-center gap-3 p-4 transition-colors ${
                  instructor.status === "inactive" ? "opacity-50" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    instructor.status === "active"
                      ? "bg-green-100 text-green-700"
                      : instructor.status === "substitute"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Users size={18} />
                </div>

                {/* Content */}
                {isEditing ? (
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="min-w-[120px] flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                        autoFocus
                        placeholder="שם מלא"
                      />
                      <input
                        type="tel"
                        dir="ltr"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="טלפון"
                        className="w-32 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="כתובת מגורים"
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(instructor.id)}
                        disabled={isPending}
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Check size={14} className="inline" /> שמור
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{instructor.full_name}</p>
                    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                      {instructor.phone && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Phone size={12} />
                          {instructor.phone}
                        </span>
                      )}
                      {instructor.address && (
                        <span className="text-xs">
                          {instructor.address}
                        </span>
                      )}
                      {!instructor.phone && !instructor.address && (
                        <span className="text-xs text-muted-foreground/60">
                          ללא פרטים נוספים
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(instructor)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="ערוך"
                    >
                      <Pencil size={14} />
                    </button>
                    <select
                      value={instructor.status}
                      onChange={(e) =>
                        handleChangeStatus(
                          instructor.id,
                          e.target.value as InstructorStatusType
                        )
                      }
                      disabled={isPending}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        statusColors[instructor.status]
                      }`}
                    >
                      {(Object.entries(INSTRUCTOR_STATUS) as [InstructorStatusType, string][]).map(
                        ([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
