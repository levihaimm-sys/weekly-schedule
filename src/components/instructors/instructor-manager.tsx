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
  Loader2,
  Filter,
  MapPin,
  Search,
  LogIn,
} from "lucide-react";
import { INSTRUCTOR_STATUS, InstructorStatusType } from "@/lib/utils/constants";

interface Instructor {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: InstructorStatusType;
  address: string | null;
  work_cities: string | null;
  rotation_order: number | null;
}

interface InstructorManagerProps {
  instructors: Instructor[];
  lastLoginMap: Record<string, string | null>;
}

function formatLastLogin(dateStr: string | null | undefined): string {
  if (!dateStr) return "לא התחבר";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "אתמול";
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

export function InstructorManager({
  instructors,
  lastLoginMap,
}: InstructorManagerProps) {
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<InstructorStatusType>>(
    new Set(["active", "substitute"])
  );
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editWorkCities, setEditWorkCities] = useState("");
  const [editRotationOrder, setEditRotationOrder] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter by selected statuses and search query
  const filtered = instructors.filter((i) => {
    const matchesStatus = selectedStatuses.has(i.status ?? "active");
    const matchesSearch = !searchQuery || i.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Count by status (treat null/missing status as "active")
  const activeCount = instructors.filter((i) => (i.status ?? "active") === "active").length;
  const substituteCount = instructors.filter((i) => i.status === "substitute").length;
  const inactiveCount = instructors.filter((i) => i.status === "inactive").length;

  function toggleStatus(status: InstructorStatusType) {
    const newSet = new Set(selectedStatuses);
    if (newSet.has(status)) {
      newSet.delete(status);
    } else {
      newSet.add(status);
    }
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
    });
  }

  async function handleSaveEdit(id: string) {
    startTransition(async () => {
      const rotationOrderValue = editRotationOrder.trim()
        ? parseInt(editRotationOrder.trim(), 10)
        : null;
      await updateInstructor(id, {
        full_name: editName.trim() || undefined,
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
        work_cities: editWorkCities.trim() || null,
        rotation_order: isNaN(rotationOrderValue as number) ? null : rotationOrderValue,
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
    setEditWorkCities(instructor.work_cities ?? "");
    setEditRotationOrder(instructor.rotation_order?.toString() ?? "");
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

      {/* Search and filter */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם..."
            className="w-44 rounded-lg border border-border bg-background py-1.5 pr-8 pl-3 text-sm placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="mx-1 h-6 w-px bg-border" />
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
          className="rounded-xl border border-secondary/40 bg-secondary/5 p-4"
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
            <input
              name="work_cities"
              type="text"
              placeholder="ערים לעבודה (טקסט חופשי)"
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
                className={`p-4 transition-colors ${
                  instructor.status === "inactive" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
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
                      <input
                        type="text"
                        value={editWorkCities}
                        onChange={(e) => setEditWorkCities(e.target.value)}
                        placeholder="ערים לעבודה (טקסט חופשי)"
                        className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground whitespace-nowrap">סדר בטבלת הקצאות:</label>
                        <input
                          type="number"
                          min={1}
                          value={editRotationOrder}
                          onChange={(e) => setEditRotationOrder(e.target.value)}
                          placeholder="—"
                          className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm"
                        />
                        <span className="text-xs text-muted-foreground">(ריק = לא מופיע בטבלה)</span>
                      </div>
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
                        {instructor.work_cities && (
                          <span className="flex items-center gap-1 text-xs text-orange-700">
                            <MapPin size={12} />
                            {instructor.work_cities}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 text-xs ${
                          lastLoginMap[instructor.id] ? "text-muted-foreground" : "text-red-500"
                        }`}>
                          <LogIn size={12} />
                          {formatLastLogin(lastLoginMap[instructor.id])}
                        </span>
                        {instructor.rotation_order != null ? (
                          <span className="text-xs text-blue-600">טבלת הקצאות: #{instructor.rotation_order}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">לא בטבלת הקצאות</span>
                        )}
                        {!instructor.phone && !instructor.address && !instructor.work_cities && !lastLoginMap[instructor.id] && (
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
