"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, MapPin, UserPlus, Loader2 } from "lucide-react";
import { DAYS_HEBREW, NEED_STATUS, NeedStatus } from "@/lib/utils/constants";
import { dayLabel, timePeriodLabel, personLabel, clientLabel } from "@/lib/utils/staffing";
import {
  addAssignmentCandidate,
  confirmAssignment,
  unconfirmAssignment,
  deleteAssignment,
} from "@/lib/actions/staffing";
import type { StaffingAvailability, StaffingNeed, StaffingAssignment } from "@/types/database";
import type { StaffingInstructor, StaffingCandidate, StaffingClient } from "@/types/staffing";

interface Props {
  instructors: StaffingInstructor[];
  candidates: StaffingCandidate[];
  clients: StaffingClient[];
  availability: StaffingAvailability[];
  needs: StaffingNeed[];
  assignments: StaffingAssignment[];
}

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  partially_filled: "bg-amber-50 text-amber-700 border-amber-200",
  filled: "bg-green-50 text-green-700 border-green-200",
};

function regionsMatch(a: string | null, b: string | null) {
  if (!a || !b) return true;
  return a.includes(b) || b.includes(a);
}

export function MatchingTab({ instructors, candidates, clients, availability, needs, assignments }: Props) {
  const router = useRouter();
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(needs[0]?.id ?? null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [manualPerson, setManualPerson] = useState("");
  const [dayChoice, setDayChoice] = useState<Record<string, string>>({});

  const openNeeds = needs.filter((n) => n.status !== "filled");
  const filledNeeds = needs.filter((n) => n.status === "filled");
  const sortedNeeds = [...openNeeds, ...filledNeeds];

  const selectedNeed = needs.find((n) => n.id === selectedNeedId) ?? null;

  const needAssignments = useMemo(
    () => assignments.filter((a) => a.need_id === selectedNeedId),
    [assignments, selectedNeedId]
  );

  const people = useMemo(
    () => [
      ...instructors.map((i) => ({ key: `instructor:${i.id}`, name: i.full_name })),
      ...candidates.map((c) => ({ key: `candidate:${c.id}`, name: `${c.first_name} ${c.last_name} (מועמד)` })),
    ],
    [instructors, candidates]
  );

  const compatibleSlots = useMemo(() => {
    if (!selectedNeed) return [];
    const alreadyLinked = new Set(needAssignments.map((a) => a.availability_id).filter(Boolean));
    return availability.filter((a) => {
      if (a.status !== "available") return false;
      if (alreadyLinked.has(a.id)) return false;
      if (!regionsMatch(a.region, selectedNeed.region)) return false;
      if (selectedNeed.day_of_week !== null && a.day_of_week !== null && a.day_of_week !== selectedNeed.day_of_week)
        return false;
      return true;
    });
  }, [availability, selectedNeed, needAssignments]);

  async function handleAddFromSlot(slot: StaffingAvailability) {
    if (!selectedNeed) return;
    setPendingId(slot.id);
    await addAssignmentCandidate({
      need_id: selectedNeed.id,
      instructor_id: slot.instructor_id,
      candidate_id: slot.candidate_id,
      availability_id: slot.id,
    });
    setPendingId(null);
    router.refresh();
  }

  async function handleAddManual() {
    if (!selectedNeed || !manualPerson) return;
    const [kind, id] = manualPerson.split(":");
    setPendingId("manual");
    await addAssignmentCandidate({
      need_id: selectedNeed.id,
      instructor_id: kind === "instructor" ? id : null,
      candidate_id: kind === "candidate" ? id : null,
    });
    setPendingId(null);
    setManualPerson("");
    router.refresh();
  }

  async function handleConfirm(assignment: StaffingAssignment, availabilitySlot: StaffingAvailability | null) {
    const needDay = selectedNeed?.day_of_week ?? null;
    const slotDay = availabilitySlot?.day_of_week ?? null;
    let dayToUse: number | null = needDay ?? slotDay;

    if (dayToUse === null) {
      const chosen = dayChoice[assignment.id];
      if (chosen === undefined || chosen === "") return;
      dayToUse = Number(chosen);
    }

    setPendingId(assignment.id);
    await confirmAssignment(assignment.id, dayToUse);
    setPendingId(null);
    router.refresh();
  }

  async function handleUnconfirm(id: string) {
    setPendingId(id);
    await unconfirmAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  async function handleRemove(id: string) {
    setPendingId(id);
    await deleteAssignment(id);
    setPendingId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      {/* Needs list */}
      <div className="space-y-1.5 md:max-h-[calc(100vh-260px)] md:overflow-y-auto">
        {sortedNeeds.map((n) => {
          const count = assignments.filter((a) => a.need_id === n.id && a.is_confirmed).length;
          return (
            <button
              key={n.id}
              onClick={() => setSelectedNeedId(n.id)}
              className={`w-full rounded-lg border p-3 text-start text-sm transition-colors ${
                selectedNeedId === n.id ? "border-primary bg-secondary/10" : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{clientLabel(n, clients)}</p>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[n.status as NeedStatus]}`}>
                  {count}/{n.lessons_count}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {n.region ?? "—"} · {dayLabel(n.day_of_week)} · {timePeriodLabel(n.time_period)}
                {n.field ? ` · ${n.field}` : ""}
              </p>
            </button>
          );
        })}
        {sortedNeeds.length === 0 && <p className="text-sm text-muted-foreground">אין שיעורים נדרשים עדיין</p>}
      </div>

      {/* Selected need detail */}
      <div className="space-y-4">
        {!selectedNeed ? (
          <p className="text-sm text-muted-foreground">בחר שיעור נדרש מהרשימה</p>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">{clientLabel(selectedNeed, clients)}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[selectedNeed.status as NeedStatus]}`}>
                  {NEED_STATUS[selectedNeed.status as NeedStatus]}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={13} />
                {selectedNeed.region ?? "—"}
                {selectedNeed.location_name ? ` · ${selectedNeed.location_name}` : ""}
                {" · "}
                {dayLabel(selectedNeed.day_of_week)} · {timePeriodLabel(selectedNeed.time_period)}
                {selectedNeed.start_time ? ` (${selectedNeed.start_time})` : ""}
                {selectedNeed.field ? ` · ${selectedNeed.field}` : ""}
                {` · נדרשים ${selectedNeed.lessons_count} שיעורים`}
              </p>
              {selectedNeed.notes && <p className="mt-1 text-sm text-muted-foreground">{selectedNeed.notes}</p>}
            </div>

            {/* Current candidates / confirmed */}
            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="mb-2 font-medium">מדריכים משויכים</h4>
              {needAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">עדיין לא נבחרו מועמדים לשיעור זה</p>
              ) : (
                <div className="space-y-1.5">
                  {needAssignments.map((a) => {
                    const slot = a.availability_id ? availability.find((s) => s.id === a.availability_id) ?? null : null;
                    const needsDay = a.is_confirmed
                      ? null
                      : selectedNeed.day_of_week === null && (slot?.day_of_week ?? null) === null;
                    return (
                      <div
                        key={a.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                          a.is_confirmed ? "border-green-200 bg-green-50" : "border-border bg-muted/20"
                        }`}
                      >
                        <div>
                          <span className="font-medium">
                            {personLabel(a.instructor_id, a.candidate_id, instructors, candidates)}
                          </span>
                          <span className="ms-2 text-xs text-muted-foreground">
                            {a.is_confirmed ? dayLabel(a.assigned_day_of_week) : dayLabel(slot?.day_of_week ?? null)}
                            {a.is_confirmed && " · מאושר"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!a.is_confirmed && needsDay && (
                            <select
                              value={dayChoice[a.id] ?? ""}
                              onChange={(e) => setDayChoice((prev) => ({ ...prev, [a.id]: e.target.value }))}
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                            >
                              <option value="">בחר יום...</option>
                              {DAYS_HEBREW.map((d, i) => (
                                <option key={d} value={i}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          )}
                          {a.is_confirmed ? (
                            <button
                              onClick={() => handleUnconfirm(a.id)}
                              disabled={pendingId === a.id}
                              className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                            >
                              בטל אישור
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConfirm(a, slot)}
                              disabled={pendingId === a.id || (needsDay && !dayChoice[a.id])}
                              className="flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
                            >
                              {pendingId === a.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              אשר שיבוץ
                            </button>
                          )}
                          <button
                            onClick={() => handleRemove(a.id)}
                            disabled={pendingId === a.id}
                            className="text-muted-foreground hover:text-red-600 disabled:opacity-50"
                            title="הסר"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Compatible availability slots */}
            <div className="rounded-xl border border-border bg-background p-4">
              <h4 className="mb-2 font-medium">מדריכים פנויים מתאימים</h4>
              {compatibleSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">אין משבצות זמינות תואמות כרגע</p>
              ) : (
                <div className="space-y-1.5">
                  {compatibleSlots.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                      <span>
                        {personLabel(s.instructor_id, s.candidate_id, instructors, candidates)}
                        <span className="ms-2 text-xs text-muted-foreground">
                          {s.region} · {dayLabel(s.day_of_week)} · {timePeriodLabel(s.time_period)}
                        </span>
                      </span>
                      <button
                        onClick={() => handleAddFromSlot(s)}
                        disabled={pendingId === s.id}
                        className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                      >
                        {pendingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                        הוסף כמועמד
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <select
                  value={manualPerson}
                  onChange={(e) => setManualPerson(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="">הוסף מדריך/מועמד אחר ידנית...</option>
                  {people.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddManual}
                  disabled={!manualPerson || pendingId === "manual"}
                  className="rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                >
                  הוסף
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
