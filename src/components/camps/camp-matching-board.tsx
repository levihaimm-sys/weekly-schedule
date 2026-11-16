"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { Check, CheckCircle2, RotateCcw, X, Loader2 } from "lucide-react";
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

type CellState = "ok" | "mid" | "bad";

const CELL_CLASS: Record<CellState, string> = {
  ok: "border-green-200 bg-green-50 text-green-800",
  mid: "border-amber-200 bg-amber-50 text-amber-800",
  bad: "border-red-200 bg-red-50 text-red-800",
};

interface FreeInstructor {
  name: string;
  area: string;
  slotId: string;
}

interface Row {
  key: string;
  area: string;
  client: string;
}

function formatDay(dateStr: string) {
  const d = parseISO(dateStr);
  return { day: format(d, "EEEE", { locale: he }), date: format(d, "d/M") };
}

function firstWord(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function rowKeyOf(n: CampStaffingNeed) {
  return `${n.area || NO_AREA}||${n.client_name.trim()}`;
}

export function CampMatchingBoard({ needs, availability, assignments, isArchived }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<{ rowKey: string; date: string } | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const assignmentsByNeed = useMemo(() => {
    const map = new Map<string, CampStaffingAssignment[]>();
    for (const a of assignments) {
      const list = map.get(a.need_id) ?? [];
      list.push(a);
      map.set(a.need_id, list);
    }
    return map;
  }, [assignments]);

  const dates = useMemo(() => Array.from(new Set(needs.map((n) => n.camp_date))).sort(), [needs]);

  const rows = useMemo(() => {
    const map = new Map<string, Row>();
    for (const n of needs) {
      const key = rowKeyOf(n);
      if (!map.has(key)) map.set(key, { key, area: n.area || NO_AREA, client: n.client_name.trim() });
    }
    return Array.from(map.values()).sort(
      (a, b) => a.area.localeCompare(b.area, "he") || a.client.localeCompare(b.client, "he")
    );
  }, [needs]);

  // instructor names already assigned on each date (any client)
  const busyByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of needs) {
      const set = map.get(n.camp_date) ?? new Set<string>();
      (assignmentsByNeed.get(n.id) ?? []).forEach((a) => set.add(a.instructor_name.trim()));
      map.set(n.camp_date, set);
    }
    return map;
  }, [needs, assignmentsByNeed]);

  function freeOn(date: string): FreeInstructor[] {
    const busy = busyByDate.get(date) ?? new Set<string>();
    const seen = new Set<string>();
    const result: FreeInstructor[] = [];
    for (const a of availability) {
      if (a.camp_date !== null && a.camp_date !== date) continue;
      const name = a.instructor_name.trim();
      if (busy.has(name) || seen.has(name)) continue;
      seen.add(name);
      result.push({ name, area: a.area || NO_AREA, slotId: a.id });
    }
    return result.sort((x, y) => x.name.localeCompare(y.name, "he"));
  }

  function cellInfo(row: Row, date: string) {
    const cellNeeds = needs
      .filter((n) => rowKeyOf(n) === row.key && n.camp_date === date)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (cellNeeds.length === 0) return null;
    const groups = cellNeeds.reduce((s, n) => s + n.num_groups, 0);
    const cellAssignments = cellNeeds.flatMap((n) => assignmentsByNeed.get(n.id) ?? []);
    const assigned = cellAssignments.length;
    const all = freeOn(date);
    const sameArea = all.filter((f) => f.area === row.area);
    const otherArea = all.filter((f) => f.area !== row.area);
    const openNeed = cellNeeds.find((n) => (assignmentsByNeed.get(n.id)?.length ?? 0) < n.num_groups) ?? null;
    const state: CellState = assigned >= groups ? "ok" : assigned + sameArea.length >= groups ? "mid" : "bad";
    return { cellNeeds, groups, cellAssignments, assigned, sameArea, otherArea, openNeed, state };
  }

  const totals = useMemo(() => {
    const groups = needs.reduce((s, n) => s + n.num_groups, 0);
    const assigned = needs.reduce((s, n) => s + (assignmentsByNeed.get(n.id)?.length ?? 0), 0);
    return { groups, assigned };
  }, [needs, assignmentsByNeed]);

  async function assign(needId: string, inst: FreeInstructor) {
    if (isArchived) return;
    setPending(`assign-${needId}-${inst.name}`);
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

  const selectedRow = selected ? rows.find((r) => r.key === selected.rowKey) : null;
  const selectedInfo = selected && selectedRow ? cellInfo(selectedRow, selected.date) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {totals.assigned}/{totals.groups} שיעורים שובצו
        </span>
        <Legend cls={CELL_CLASS.ok} label="מכוסה" />
        <Legend cls={CELL_CLASS.mid} label="יש זמינים באזור" />
        <Legend cls={CELL_CLASS.bad} label="חסרים מדריכים" />
        <span>לחיצה על שם מדריך באריח משבצת אותו</span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          אין עדיין בקשות לקוח
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background p-3">
          <table className="border-separate" style={{ borderSpacing: 6 }}>
            <thead>
              <tr>
                <th className="sticky right-0 z-10 bg-background" />
                {dates.map((d) => {
                  const f = formatDay(d);
                  return (
                    <th key={d} className="min-w-[150px] text-center text-xs font-medium text-muted-foreground">
                      <div>{f.day}</div>
                      <div className="text-foreground">{f.date}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td
                    className="sticky right-0 z-10 whitespace-nowrap bg-background pl-2 align-top text-sm font-medium"
                    title={`${row.area} – ${row.client}`}
                  >
                    {row.area}
                    <span className="text-muted-foreground"> ({firstWord(row.client)})</span>
                  </td>
                  {dates.map((date) => {
                    const info = cellInfo(row, date);
                    if (!info) return <td key={date} />;
                    const isSel = selected?.rowKey === row.key && selected?.date === date;
                    return (
                      <td key={date} className="h-px p-0 align-top">
                        <div
                          onClick={() => setSelected({ rowKey: row.key, date })}
                          className={`h-full cursor-pointer rounded-lg border p-2 text-center transition-all hover:brightness-95 ${
                            CELL_CLASS[info.state]
                          } ${isSel ? "ring-2 ring-primary ring-offset-1" : ""}`}
                        >
                          <div className="text-sm font-semibold">
                            {info.groups} {info.groups === 1 ? "שיעור" : "שיעורים"}
                          </div>
                          <div className="text-[11px] opacity-80">
                            שובצו {info.assigned}/{info.groups}
                          </div>

                          {info.cellAssignments.length > 0 && (
                            <div className="mt-1 flex flex-wrap justify-center gap-1">
                              {info.cellAssignments.map((a) => (
                                <span
                                  key={a.id}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                                    a.is_confirmed ? "bg-green-600 text-white" : "bg-foreground/80 text-background"
                                  }`}
                                >
                                  {a.instructor_name}
                                  {pending === a.id ? (
                                    <Loader2 size={9} className="animate-spin" />
                                  ) : (
                                    !isArchived && (
                                      <button onClick={() => run(a.id, deleteCampAssignment)} title="הסר" className="opacity-70 hover:opacity-100">
                                        <X size={9} />
                                      </button>
                                    )
                                  )}
                                </span>
                              ))}
                            </div>
                          )}

                          {info.openNeed && (
                            <>
                              <NameChips
                                list={info.sameArea}
                                disabled={isArchived}
                                pending={pending}
                                needId={info.openNeed.id}
                                onPick={(i) => info.openNeed && assign(info.openNeed.id, i)}
                                emptyText="אין פנויים באזור"
                              />
                              {info.otherArea.length > 0 && (
                                <div className="mt-1.5 border-t border-current/20 pt-1">
                                  <div className="text-[10px] opacity-70">אפשרויות נוספות</div>
                                  <NameChips
                                    list={info.otherArea}
                                    showArea
                                    muted
                                    disabled={isArchived}
                                    pending={pending}
                                    needId={info.openNeed.id}
                                    onPick={(i) => info.openNeed && assign(info.openNeed.id, i)}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && selectedRow && selectedInfo && (
        <div className="space-y-2 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {selectedRow.client} · {selectedRow.area} · {formatDay(selected.date).day} {formatDay(selected.date).date}
            </h3>
            <button onClick={() => setSelected(null)} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X size={14} />
            </button>
          </div>
          {selectedInfo.cellNeeds.map((n) => {
            const list = assignmentsByNeed.get(n.id) ?? [];
            return (
              <div key={n.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {[n.field, n.framework, n.start_time].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span>
                    {list.length}/{n.num_groups}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {list.length === 0 && <span className="text-xs text-muted-foreground">אין עדיין שיבוצים</span>}
                  {list.map((a) => (
                    <span
                      key={a.id}
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NameChips({
  list,
  disabled,
  pending,
  needId,
  onPick,
  showArea,
  muted,
  emptyText,
}: {
  list: FreeInstructor[];
  disabled: boolean;
  pending: string | null;
  needId: string;
  onPick: (i: FreeInstructor) => void;
  showArea?: boolean;
  muted?: boolean;
  emptyText?: string;
}) {
  if (list.length === 0) {
    return emptyText ? <div className="mt-1 text-[11px] opacity-80">{emptyText}</div> : null;
  }
  return (
    <div className="mt-1 flex flex-wrap justify-center gap-1">
      {list.map((i) => (
        <button
          key={i.name}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onPick(i);
          }}
          title={`${i.name}${showArea ? ` (${i.area})` : ""} – לחצו לשיבוץ`}
          className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none ${
            muted ? "border-current/30 bg-background/40" : "border-current/40 bg-background/80"
          }`}
        >
          {pending === `assign-${needId}-${i.name}` && <Loader2 size={10} className="animate-spin" />}
          {i.name}
          {showArea && <span className="opacity-60">· {i.area}</span>}
        </button>
      ))}
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return <span className={`rounded border px-2 py-0.5 ${cls}`}>{label}</span>;
}
