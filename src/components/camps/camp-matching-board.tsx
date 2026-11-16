"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { Check, RotateCcw, X, Loader2, ChevronDown } from "lucide-react";
import {
  addRequestCandidate,
  confirmRequestCandidate,
  unconfirmRequestCandidate,
  removeRequestCandidate,
} from "@/lib/actions/camps";
import type { CampRequestWithCandidates, CampStaffingAvailability, Instructor } from "@/types/database";

interface Props {
  requests: CampRequestWithCandidates[];
  instructors: Pick<Instructor, "id" | "full_name" | "is_active">[];
  availability: CampStaffingAvailability[];
  isArchived: boolean;
}

type CellState = "ok" | "mid" | "bad";

const CELL_CLASS: Record<CellState, string> = {
  ok: "border-green-200 bg-green-50 text-green-800",
  mid: "border-amber-200 bg-amber-50 text-amber-800",
  bad: "border-red-200 bg-red-50 text-red-800",
};

interface Option {
  instructorId: string;
  name: string;
  areas: string[];
  busyAt: string[]; // other clients already holding this instructor that day
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

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

/** "באר יעקב/ראשון לציון" / "ראשון לציון, באר יעקב" → separate areas */
function splitAreas(area: string | null): string[] {
  if (!area) return [];
  return area
    .split(/[\/,]/)
    .map(norm)
    .filter(Boolean);
}

/** "צפון תל אביב" matches an instructor area "תל אביב" and vice versa */
function areaMatches(requestArea: string, instructorArea: string) {
  const a = norm(requestArea);
  const b = norm(instructorArea);
  return a === b || a.includes(b) || b.includes(a);
}

function rowKeyOf(r: CampRequestWithCandidates) {
  return `${norm(r.area)}||${norm(r.client_name ?? "")}`;
}

export function CampMatchingBoard({ requests, instructors, availability, isArchived }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const instructorById = useMemo(() => new Map(instructors.map((i) => [i.id, i])), [instructors]);
  const instructorIdByName = useMemo(
    () => new Map(instructors.map((i) => [norm(i.full_name), i.id])),
    [instructors]
  );

  const dates = useMemo(() => Array.from(new Set(requests.map((r) => r.camp_date))).sort(), [requests]);

  const rows = useMemo(() => {
    const map = new Map<string, Row>();
    for (const r of requests) {
      const key = rowKeyOf(r);
      if (!map.has(key)) map.set(key, { key, area: norm(r.area), client: norm(r.client_name ?? "") });
    }
    return Array.from(map.values()).sort(
      (a, b) => a.area.localeCompare(b.area, "he") || a.client.localeCompare(b.client, "he")
    );
  }, [requests]);

  // date -> instructorId -> client names already holding them
  const busyByDate = useMemo(() => {
    const map = new Map<string, Map<string, string[]>>();
    for (const r of requests) {
      const m = map.get(r.camp_date) ?? new Map<string, string[]>();
      for (const c of r.candidates) {
        const list = m.get(c.instructor_id) ?? [];
        list.push(firstWord(r.client_name ?? r.area));
        m.set(c.instructor_id, list);
      }
      map.set(r.camp_date, m);
    }
    return map;
  }, [requests]);

  // date -> available instructors (with their separate areas)
  const availableByDate = useMemo(() => {
    const result = new Map<string, Map<string, { name: string; areas: Set<string> }>>();
    for (const date of dates) {
      const m = new Map<string, { name: string; areas: Set<string> }>();
      for (const a of availability) {
        if (a.camp_date !== null && a.camp_date !== date) continue;
        const id = instructorIdByName.get(norm(a.instructor_name));
        if (!id) continue;
        const entry = m.get(id) ?? { name: norm(a.instructor_name), areas: new Set<string>() };
        splitAreas(a.area).forEach((x) => entry.areas.add(x));
        m.set(id, entry);
      }
      result.set(date, m);
    }
    return result;
  }, [dates, availability, instructorIdByName]);

  function optionsFor(req: CampRequestWithCandidates) {
    const taken = new Set(req.candidates.map((c) => c.instructor_id));
    const busy = busyByDate.get(req.camp_date) ?? new Map<string, string[]>();
    const same: Option[] = [];
    const other: Option[] = [];
    for (const [id, { name, areas }] of availableByDate.get(req.camp_date) ?? []) {
      if (taken.has(id)) continue;
      const opt: Option = { instructorId: id, name, areas: Array.from(areas), busyAt: busy.get(id) ?? [] };
      if (opt.areas.some((x) => areaMatches(req.area, x))) same.push(opt);
      else other.push(opt);
    }
    const sort = (a: Option, b: Option) =>
      a.busyAt.length - b.busyAt.length || a.name.localeCompare(b.name, "he");
    return { same: same.sort(sort), other: other.sort(sort) };
  }

  const totals = useMemo(() => {
    const groups = requests.reduce((s, r) => s + r.num_groups, 0);
    const confirmed = requests.reduce((s, r) => s + r.candidates.filter((c) => c.is_confirmed).length, 0);
    return { groups, confirmed };
  }, [requests]);

  async function act(key: string, fn: () => Promise<{ error?: string }>) {
    setPending(key);
    setError(null);
    const res = await fn();
    if (res?.error) setError(res.error);
    setPending(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {totals.confirmed}/{totals.groups} שיעורים מאוישים
        </span>
        <Legend cls={CELL_CLASS.ok} label="מאויש" />
        <Legend cls={CELL_CLASS.mid} label="יש מספיק מדריכים לבחירה" />
        <Legend cls={CELL_CLASS.bad} label="חסרים מדריכים" />
        <span>לחיצה על שם משבצת · ✓ מאשר</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          אין עדיין בקשות קייטנה
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
                    <th key={d} className="min-w-[160px] text-center text-xs font-medium text-muted-foreground">
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
                    {row.client && <span className="text-muted-foreground"> ({firstWord(row.client)})</span>}
                  </td>
                  {dates.map((date) => {
                    const cellReqs = requests
                      .filter((r) => rowKeyOf(r) === row.key && r.camp_date === date)
                      .sort((a, b) => (a.start_time_note ?? "").localeCompare(b.start_time_note ?? ""));
                    return (
                      <td key={date} className="p-0 align-top">
                        <div className="space-y-1.5">
                          {cellReqs.map((req) => (
                            <RequestTile
                              key={req.id}
                              req={req}
                              options={optionsFor(req)}
                              instructorById={instructorById}
                              isArchived={isArchived}
                              pending={pending}
                              onAdd={(id) => act(`add-${req.id}-${id}`, () => addRequestCandidate(req.id, id))}
                              onConfirm={(cid) => act(cid, () => confirmRequestCandidate(cid))}
                              onUnconfirm={(cid) => act(cid, () => unconfirmRequestCandidate(cid))}
                              onRemove={(cid) => act(cid, () => removeRequestCandidate(cid))}
                            />
                          ))}
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
    </div>
  );
}

function RequestTile({
  req,
  options,
  instructorById,
  isArchived,
  pending,
  onAdd,
  onConfirm,
  onUnconfirm,
  onRemove,
}: {
  req: CampRequestWithCandidates;
  options: { same: Option[]; other: Option[] };
  instructorById: Map<string, Pick<Instructor, "id" | "full_name" | "is_active">>;
  isArchived: boolean;
  pending: string | null;
  onAdd: (instructorId: string) => void;
  onConfirm: (candidateId: string) => void;
  onUnconfirm: (candidateId: string) => void;
  onRemove: (candidateId: string) => void;
}) {
  const [showOther, setShowOther] = useState(false);
  const confirmed = req.candidates.filter((c) => c.is_confirmed).length;
  const needMore = req.candidates.length < req.num_groups;
  const state: CellState =
    confirmed >= req.num_groups
      ? "ok"
      : req.candidates.length + options.same.length >= req.num_groups
        ? "mid"
        : "bad";

  return (
    <div className={`rounded-lg border p-2 text-center ${CELL_CLASS[state]}`}>
      <div className="text-sm font-semibold">
        {req.num_groups} {req.num_groups === 1 ? "שיעור" : "שיעורים"}
        {req.start_time_note && <span className="font-normal"> · {req.start_time_note}</span>}
      </div>
      {req.activity_type && (
        <div className="mx-auto mt-0.5 w-fit rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground">
          {req.activity_type}
        </div>
      )}
      <div className="mt-0.5 text-[11px] opacity-80">
        אושרו {confirmed}/{req.num_groups}
      </div>

      {req.candidates.length > 0 && (
        <div className="mt-1 flex flex-wrap justify-center gap-1">
          {req.candidates.map((c) => {
            const name = instructorById.get(c.instructor_id)?.full_name ?? "—";
            return (
              <span
                key={c.id}
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] ${
                  c.is_confirmed ? "bg-green-600 text-white" : "bg-foreground/75 text-background"
                }`}
              >
                {name}
                {pending === c.id ? (
                  <Loader2 size={9} className="animate-spin" />
                ) : (
                  !isArchived && (
                    <>
                      {c.is_confirmed ? (
                        <button onClick={() => onUnconfirm(c.id)} title="בטל אישור" className="opacity-70 hover:opacity-100">
                          <RotateCcw size={9} />
                        </button>
                      ) : (
                        <button onClick={() => onConfirm(c.id)} title="אשר" className="opacity-80 hover:opacity-100">
                          <Check size={10} />
                        </button>
                      )}
                      <button onClick={() => onRemove(c.id)} title="הסר" className="opacity-70 hover:opacity-100">
                        <X size={9} />
                      </button>
                    </>
                  )
                )}
              </span>
            );
          })}
        </div>
      )}

      {needMore && (
        <>
          <OptionChips
            list={options.same}
            reqId={req.id}
            disabled={isArchived}
            pending={pending}
            onPick={onAdd}
            emptyText="אין זמינים באזור"
          />
          {options.other.length > 0 && (
            <div className="mt-1.5 border-t border-current/20 pt-1">
              <button
                onClick={() => setShowOther((v) => !v)}
                className="mx-auto flex items-center gap-0.5 text-[10px] opacity-70 hover:opacity-100"
              >
                אפשרויות נוספות ({options.other.length})
                <ChevronDown size={11} className={`transition-transform ${showOther ? "rotate-180" : ""}`} />
              </button>
              {showOther && (
                <OptionChips
                  list={options.other}
                  reqId={req.id}
                  showArea
                  muted
                  disabled={isArchived}
                  pending={pending}
                  onPick={onAdd}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OptionChips({
  list,
  reqId,
  disabled,
  pending,
  onPick,
  showArea,
  muted,
  emptyText,
}: {
  list: Option[];
  reqId: string;
  disabled: boolean;
  pending: string | null;
  onPick: (instructorId: string) => void;
  showArea?: boolean;
  muted?: boolean;
  emptyText?: string;
}) {
  if (list.length === 0) {
    return emptyText ? <div className="mt-1 text-[11px] opacity-80">{emptyText}</div> : null;
  }
  return (
    <div className="mt-1 flex flex-wrap justify-center gap-1">
      {list.map((o) => {
        const busy = o.busyAt.length > 0;
        const title = [
          o.name,
          showArea ? `(${o.areas.join(" / ")})` : "",
          busy ? `– כבר משובץ/ת היום ב: ${o.busyAt.join(", ")}` : "– לחצו לשיבוץ",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={o.instructorId}
            disabled={disabled}
            onClick={() => onPick(o.instructorId)}
            title={title}
            className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none ${
              muted ? "border-current/30 bg-background/40" : "border-current/40 bg-background/80"
            } ${busy ? "border-dashed opacity-60" : ""}`}
          >
            {pending === `add-${reqId}-${o.instructorId}` && <Loader2 size={10} className="animate-spin" />}
            {o.name}
            {showArea && <span className="opacity-60">· {o.areas.join(" / ")}</span>}
            {busy && <span className="opacity-70">({o.busyAt.join(", ")})</span>}
          </button>
        );
      })}
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return <span className={`rounded border px-2 py-0.5 ${cls}`}>{label}</span>;
}
