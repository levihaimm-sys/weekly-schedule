"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, eachDayOfInterval } from "date-fns";
import { he } from "date-fns/locale";
import { Check, CheckCircle2, RotateCcw, X, Loader2, User, GripVertical } from "lucide-react";
import {
  addCampAssignment,
  confirmCampAssignment,
  unconfirmCampAssignment,
  deleteCampAssignment,
} from "@/lib/actions/camp-staffing";
import type {
  CampStaffingNeed,
  CampStaffingAvailability,
  CampStaffingAssignment,
  CampSession,
} from "@/types/database";

interface Props {
  session: CampSession;
  needs: CampStaffingNeed[];
  availability: CampStaffingAvailability[];
  assignments: CampStaffingAssignment[];
  isArchived: boolean;
}

const NO_AREA = "ללא אזור";

type CellState = "empty" | "ok" | "mid" | "bad";

const CELL_CLASS: Record<CellState, string> = {
  empty: "border-border bg-background text-muted-foreground",
  ok: "border-green-200 bg-green-50 text-green-800",
  mid: "border-amber-200 bg-amber-50 text-amber-800",
  bad: "border-red-200 bg-red-50 text-red-800",
};

interface FreeInstructor {
  name: string;
  area: string;
  slotId: string;
}

function formatDay(dateStr: string) {
  const d = parseISO(dateStr);
  return { day: format(d, "EEEE", { locale: he }), date: format(d, "d/M") };
}

export function CampMatchingBoard({ session, needs, availability, assignments, isArchived }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<{ area: string; date: string } | null>(null);
  const [targetNeedId, setTargetNeedId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [dragOverNeed, setDragOverNeed] = useState<string | null>(null);

  const assignmentsByNeed = useMemo(() => {
    const map = new Map<string, CampStaffingAssignment[]>();
    for (const a of assignments) {
      const list = map.get(a.need_id) ?? [];
      list.push(a);
      map.set(a.need_id, list);
    }
    return map;
  }, [assignments]);

  const dates = useMemo(() => {
    const set = new Set<string>();
    needs.forEach((n) => set.add(n.camp_date));
    availability.forEach((a) => a.camp_date && set.add(a.camp_date));
    if (set.size === 0 && session.start_date && session.end_date) {
      eachDayOfInterval({ start: parseISO(session.start_date), end: parseISO(session.end_date) }).forEach((d) =>
        set.add(format(d, "yyyy-MM-dd"))
      );
    }
    return Array.from(set).sort();
  }, [needs, availability, session.start_date, session.end_date]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    needs.forEach((n) => set.add(n.area || NO_AREA));
    availability.forEach((a) => set.add(a.area || NO_AREA));
    return Array.from(set).sort((a, b) => (a === NO_AREA ? 1 : b === NO_AREA ? -1 : a.localeCompare(b, "he")));
  }, [needs, availability]);

  // instructor names already assigned on each date (any area)
  const busyByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of needs) {
      const set = map.get(n.camp_date) ?? new Set<string>();
      (assignmentsByNeed.get(n.id) ?? []).forEach((a) => set.add(a.instructor_name.trim()));
      map.set(n.camp_date, set);
    }
    return map;
  }, [needs, assignmentsByNeed]);

  function freeOn(date: string, area?: string): FreeInstructor[] {
    const busy = busyByDate.get(date) ?? new Set<string>();
    const seen = new Set<string>();
    const result: FreeInstructor[] = [];
    for (const a of availability) {
      if (a.camp_date !== null && a.camp_date !== date) continue;
      const aArea = a.area || NO_AREA;
      if (area !== undefined && aArea !== area) continue;
      const name = a.instructor_name.trim();
      if (busy.has(name) || seen.has(name)) continue;
      seen.add(name);
      result.push({ name, area: aArea, slotId: a.id });
    }
    return result.sort((x, y) => x.name.localeCompare(y.name, "he"));
  }

  function cellInfo(area: string, date: string) {
    const cellNeeds = needs.filter((n) => (n.area || NO_AREA) === area && n.camp_date === date);
    const groups = cellNeeds.reduce((s, n) => s + n.num_groups, 0);
    const assigned = cellNeeds.reduce((s, n) => s + (assignmentsByNeed.get(n.id)?.length ?? 0), 0);
    const free = freeOn(date, area).length;
    let state: CellState = "empty";
    if (groups > 0) state = assigned >= groups ? "ok" : assigned + free >= groups ? "mid" : "bad";
    return { cellNeeds, groups, assigned, free, state };
  }

  const totals = useMemo(() => {
    const groups = needs.reduce((s, n) => s + n.num_groups, 0);
    const assigned = needs.reduce((s, n) => s + (assignmentsByNeed.get(n.id)?.length ?? 0), 0);
    return { groups, assigned };
  }, [needs, assignmentsByNeed]);

  const selectedInfo = selected ? cellInfo(selected.area, selected.date) : null;
  const sortedCellNeeds = selectedInfo
    ? [...selectedInfo.cellNeeds].sort((a, b) => a.client_name.localeCompare(b.client_name, "he"))
    : [];
  const openNeeds = sortedCellNeeds.filter((n) => (assignmentsByNeed.get(n.id)?.length ?? 0) < n.num_groups);
  const effectiveTarget =
    sortedCellNeeds.find((n) => n.id === targetNeedId) ?? openNeeds[0] ?? null;

  function selectCell(area: string, date: string) {
    setSelected({ area, date });
    setTargetNeedId(null);
  }

  async function assign(needId: string, inst: FreeInstructor) {
    if (isArchived) return;
    setPending(`assign-${inst.name}`);
    await addCampAssignment({ need_id: needId, instructor_name: inst.name, availability_id: inst.slotId });
    setPending(null);
    router.refresh();
  }

  async function run(id: string, fn: (id: string) => Promise<unknown>) {
    setPending(id);
    await fn(id);
    setPending(null);
    router.refresh();
  }

  const sameAreaFree = selected ? freeOn(selected.date, selected.area) : [];
  const otherAreaFree = selected ? freeOn(selected.date).filter((f) => f.area !== selected.area) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {totals.assigned}/{totals.groups} קבוצות שובצו
        </span>
        <Legend cls={CELL_CLASS.ok} label="מכוסה" />
        <Legend cls={CELL_CLASS.mid} label="יש זמינים, לא שובץ" />
        <Legend cls={CELL_CLASS.bad} label="חסרים מדריכים" />
        <span>המספר העליון: שובצו/קבוצות · התחתון: מדריכים פנויים</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background p-3">
        <table className="w-full border-separate" style={{ borderSpacing: 6 }}>
          <thead>
            <tr>
              <th className="w-28" />
              {dates.map((d) => {
                const f = formatDay(d);
                return (
                  <th key={d} className="min-w-[88px] text-center text-xs font-medium text-muted-foreground">
                    <div>{f.day}</div>
                    <div className="text-foreground">{f.date}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area}>
                <td className="whitespace-nowrap text-sm font-medium">{area}</td>
                {dates.map((date) => {
                  const info = cellInfo(area, date);
                  const isSel = selected?.area === area && selected?.date === date;
                  return (
                    <td key={date} className="p-0">
                      <button
                        onClick={() => selectCell(area, date)}
                        className={`w-full rounded-lg border px-2 py-2 text-center transition-all hover:brightness-95 ${
                          CELL_CLASS[info.state]
                        } ${isSel ? "ring-2 ring-primary ring-offset-1" : ""}`}
                      >
                        <div className="text-sm font-semibold">
                          {info.groups > 0 ? `${info.assigned}/${info.groups}` : "—"}
                        </div>
                        <div className="text-[11px] opacity-80">{info.free} פנויים</div>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {areas.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">אין עדיין צרכים או זמינות</p>
        )}
      </div>

      {selected && selectedInfo && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                בקשות לקוח · {selected.area} · {formatDay(selected.date).day} {formatDay(selected.date).date}
              </h3>
              <button onClick={() => setSelected(null)} className="rounded p-1 text-muted-foreground hover:bg-muted">
                <X size={14} />
              </button>
            </div>
            {sortedCellNeeds.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                אין בקשות בתא הזה
              </p>
            )}
            {sortedCellNeeds.map((n) => {
              const list = assignmentsByNeed.get(n.id) ?? [];
              const full = list.length >= n.num_groups;
              const isTarget = effectiveTarget?.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => setTargetNeedId(n.id)}
                  onDragOver={(e) => {
                    if (isArchived) return;
                    e.preventDefault();
                    setDragOverNeed(n.id);
                  }}
                  onDragLeave={() => setDragOverNeed(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverNeed(null);
                    const raw = e.dataTransfer.getData("application/json");
                    if (raw) assign(n.id, JSON.parse(raw) as FreeInstructor);
                  }}
                  className={`cursor-pointer rounded-xl border bg-background p-3 transition-colors ${
                    dragOverNeed === n.id
                      ? "border-primary bg-primary/10"
                      : isTarget
                        ? "border-primary"
                        : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{n.client_name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        full ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {list.length}/{n.num_groups}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {[n.field, n.framework, n.start_time].filter(Boolean).join(" · ") || "—"}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {list.map((a) => (
                      <span
                        key={a.id}
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
                          a.is_confirmed
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-border bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {a.instructor_name}
                        {pending === a.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : a.is_confirmed ? (
                          <>
                            <CheckCircle2 size={12} className="text-green-700" />
                            {!isArchived && (
                              <button onClick={() => run(a.id, unconfirmCampAssignment)} title="בטל אישור" className="hover:text-red-600">
                                <RotateCcw size={11} />
                              </button>
                            )}
                          </>
                        ) : (
                          !isArchived && (
                            <button onClick={() => run(a.id, confirmCampAssignment)} title="אשר שיבוץ" className="hover:text-green-700">
                              <Check size={11} />
                            </button>
                          )
                        )}
                        {!isArchived && pending !== a.id && (
                          <button onClick={() => run(a.id, deleteCampAssignment)} title="הסר" className="hover:text-red-600">
                            <X size={11} />
                          </button>
                        )}
                      </span>
                    ))}
                    {!full && (
                      <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">
                        חסרים {n.num_groups - list.length}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">
              מדריכים פנויים
              {effectiveTarget && !isArchived && (
                <span className="font-normal text-muted-foreground"> · לחיצה משבצת ל{effectiveTarget.client_name}, או גררו לכרטיס</span>
              )}
            </h3>
            <InstructorGroup
              title={`באזור ${selected.area}`}
              list={sameAreaFree}
              emptyText="אין מדריכים פנויים באזור הזה"
              disabled={!effectiveTarget || isArchived}
              pending={pending}
              onPick={(i) => effectiveTarget && assign(effectiveTarget.id, i)}
            />
            {otherAreaFree.length > 0 && (
              <InstructorGroup
                title="פנויים מאזורים אחרים"
                list={otherAreaFree}
                showArea
                muted
                disabled={!effectiveTarget || isArchived}
                pending={pending}
                onPick={(i) => effectiveTarget && assign(effectiveTarget.id, i)}
              />
            )}
          </div>
        </div>
      )}

      {!selected && areas.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">לחצו על תא כדי לשבץ מדריכים</p>
      )}
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return <span className={`rounded border px-2 py-0.5 ${cls}`}>{label}</span>;
}

function InstructorGroup({
  title,
  list,
  emptyText,
  showArea,
  muted,
  disabled,
  pending,
  onPick,
}: {
  title: string;
  list: FreeInstructor[];
  emptyText?: string;
  showArea?: boolean;
  muted?: boolean;
  disabled: boolean;
  pending: string | null;
  onPick: (i: FreeInstructor) => void;
}) {
  return (
    <div className={`rounded-xl border border-border p-3 ${muted ? "bg-muted/30" : "bg-background"}`}>
      <div className="mb-2 text-xs text-muted-foreground">{title}</div>
      {list.length === 0 ? (
        <p className="text-sm text-red-600">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {list.map((i) => (
            <button
              key={i.name}
              draggable={!disabled}
              onDragStart={(e) => e.dataTransfer.setData("application/json", JSON.stringify(i))}
              onClick={() => !disabled && onPick(i)}
              className={`inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs transition-colors ${
                disabled ? "cursor-default opacity-60" : "cursor-grab hover:border-primary hover:bg-primary/5"
              }`}
            >
              {pending === `assign-${i.name}` ? (
                <Loader2 size={12} className="animate-spin" />
              ) : disabled ? (
                <User size={12} />
              ) : (
                <GripVertical size={12} className="text-muted-foreground" />
              )}
              {i.name}
              {showArea && <span className="text-muted-foreground">({i.area})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
