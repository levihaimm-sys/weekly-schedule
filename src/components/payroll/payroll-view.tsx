"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Banknote, Car, XCircle } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT } from "@/lib/utils/constants";
import {
  updatePayRate,
  setPayException,
  deletePayException,
} from "@/lib/actions/payroll";

interface LessonData {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  instructor_id: string;
  instructor_name: string;
}

interface RateData {
  instructor_id: string;
  rate_per_lesson: number;
  travel_rate_per_day: number;
}

interface ExceptionData {
  lesson_id: string;
  instructor_id: string;
  amount: number;
  notes: string | null;
}

interface Props {
  lessons: LessonData[];
  rates: RateData[];
  exceptions: ExceptionData[];
}

function money(n: number) {
  return n.toLocaleString("he-IL", { maximumFractionDigits: 2 });
}

export function PayrollView({ lessons, rates, exceptions }: Props) {
  const rateMap = useMemo(() => {
    const m = new Map<string, RateData>();
    for (const r of rates) m.set(r.instructor_id, r);
    return m;
  }, [rates]);

  const exceptionMap = useMemo(() => {
    const m = new Map<string, ExceptionData>();
    for (const e of exceptions) m.set(e.lesson_id, e);
    return m;
  }, [exceptions]);

  const byInstructor = useMemo(() => {
    const map = new Map<string, { name: string; lessons: LessonData[] }>();
    for (const lesson of lessons) {
      if (!map.has(lesson.instructor_id)) {
        map.set(lesson.instructor_id, { name: lesson.instructor_name, lessons: [] });
      }
      map.get(lesson.instructor_id)!.lessons.push(lesson);
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [lessons]);

  const grandTotal = byInstructor.reduce((sum, i) => {
    return sum + computeTotal(i.lessons, rateMap.get(i.id), exceptionMap).total;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-4 text-center">
        <p className="text-3xl font-bold text-[#1C1917]">₪{money(grandTotal)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{'סה"כ לתשלום לחודש זה'}</p>
      </div>

      {byInstructor.length === 0 && (
        <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
          אין שיעורים להצגה בחודש זה
        </div>
      )}

      {byInstructor.map((i) => (
        <InstructorPayCard
          key={i.id}
          instructorId={i.id}
          name={i.name}
          lessons={i.lessons}
          rate={rateMap.get(i.id)}
          exceptionMap={exceptionMap}
        />
      ))}
    </div>
  );
}

function computeTotal(
  lessons: LessonData[],
  rate: RateData | undefined,
  exceptionMap: Map<string, ExceptionData>
) {
  const active = lessons.filter((l) => l.status !== "cancelled");
  const ratePerLesson = rate?.rate_per_lesson ?? 0;
  const travelPerDay = rate?.travel_rate_per_day ?? 0;

  let regularCount = 0;
  let exceptionsAmount = 0;
  for (const l of active) {
    const ex = exceptionMap.get(l.id);
    if (ex) exceptionsAmount += ex.amount;
    else regularCount++;
  }

  const workDays = new Set(active.map((l) => l.lesson_date)).size;
  const baseAmount = regularCount * ratePerLesson;
  const travelAmount = workDays * travelPerDay;
  const total = baseAmount + exceptionsAmount + travelAmount;

  return { active, regularCount, exceptionsAmount, workDays, baseAmount, travelAmount, total };
}

function InstructorPayCard({
  instructorId,
  name,
  lessons,
  rate,
  exceptionMap,
}: {
  instructorId: string;
  name: string;
  lessons: LessonData[];
  rate: RateData | undefined;
  exceptionMap: Map<string, ExceptionData>;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rateDraft, setRateDraft] = useState(String(rate?.rate_per_lesson ?? 0));
  const [travelDraft, setTravelDraft] = useState(String(rate?.travel_rate_per_day ?? 0));

  useEffect(() => {
    setRateDraft(String(rate?.rate_per_lesson ?? 0));
  }, [rate?.rate_per_lesson]);

  useEffect(() => {
    setTravelDraft(String(rate?.travel_rate_per_day ?? 0));
  }, [rate?.travel_rate_per_day]);

  const { active, regularCount, exceptionsAmount, workDays, baseAmount, travelAmount, total } =
    computeTotal(lessons, rate, exceptionMap);

  async function saveRates() {
    const ratePerLesson = Number(rateDraft) || 0;
    const travelRatePerDay = Number(travelDraft) || 0;
    if (
      ratePerLesson === (rate?.rate_per_lesson ?? 0) &&
      travelRatePerDay === (rate?.travel_rate_per_day ?? 0)
    ) {
      return;
    }
    const result = await updatePayRate(instructorId, {
      rate_per_lesson: ratePerLesson,
      travel_rate_per_day: travelRatePerDay,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 bg-muted/40 px-4 py-3 text-start"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span className="font-semibold">{name}</span>
          <span className="text-xs text-muted-foreground">
            {active.length} שיעורים · {workDays} ימי עבודה
          </span>
        </div>
        <span className="font-bold text-[#1C1917]">₪{money(total)}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border p-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          {/* Rate settings */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-border p-3">
              <Banknote size={16} className="shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground shrink-0">תשלום לשיעור:</span>
              <input
                type="number"
                min={0}
                dir="ltr"
                value={rateDraft}
                onChange={(e) => setRateDraft(e.target.value)}
                onBlur={saveRates}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-right"
              />
              <span className="text-sm text-muted-foreground">₪</span>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-border p-3">
              <Car size={16} className="shrink-0 text-muted-foreground" />
              <span className="text-sm text-muted-foreground shrink-0">תוספת נסיעות ליום:</span>
              <input
                type="number"
                min={0}
                dir="ltr"
                value={travelDraft}
                onChange={(e) => setTravelDraft(e.target.value)}
                onBlur={saveRates}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-right"
              />
              <span className="text-sm text-muted-foreground">₪</span>
            </label>
          </div>

          {/* Lessons list */}
          <div className="divide-y divide-border rounded-lg border border-border">
            {active.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                instructorId={instructorId}
                exception={exceptionMap.get(lesson.id)}
                defaultRate={rate?.rate_per_lesson ?? 0}
                onError={setError}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-3 text-center text-sm">
            <div>
              <p className="font-bold">₪{money(baseAmount)}</p>
              <p className="text-xs text-muted-foreground">{regularCount} שיעורים רגילים</p>
            </div>
            <div>
              <p className="font-bold">₪{money(exceptionsAmount)}</p>
              <p className="text-xs text-muted-foreground">חריגים</p>
            </div>
            <div>
              <p className="font-bold">₪{money(travelAmount)}</p>
              <p className="text-xs text-muted-foreground">{workDays} ימי נסיעה</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonRow({
  lesson,
  instructorId,
  exception,
  defaultRate,
  onError,
}: {
  lesson: LessonData;
  instructorId: string;
  exception: ExceptionData | undefined;
  defaultRate: number;
  onError: (msg: string | null) => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [amountDraft, setAmountDraft] = useState(String(exception?.amount ?? defaultRate));

  const lessonDate = new Date(`${lesson.lesson_date}T${lesson.start_time}`);
  const dayName = DAYS_SHORT[lessonDate.getDay()];

  async function saveException() {
    const amount = Number(amountDraft);
    if (Number.isNaN(amount)) {
      onError("סכום לא תקין");
      return;
    }
    const result = await setPayException(lesson.id, instructorId, amount, null);
    if (result.error) {
      onError(result.error);
      return;
    }
    onError(null);
    setEditing(false);
    router.refresh();
  }

  async function clearException() {
    const result = await deletePayException(lesson.id);
    if (result.error) {
      onError(result.error);
      return;
    }
    onError(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
      <span className="w-20 shrink-0 text-muted-foreground">
        {dayName} {format(lessonDate, "dd/MM")}
      </span>
      <span className="w-12 shrink-0">{formatTime(lesson.start_time)}</span>

      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              type="number"
              dir="ltr"
              autoFocus
              value={amountDraft}
              onChange={(e) => setAmountDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveException()}
              className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-right"
            />
            <button
              type="button"
              onClick={saveException}
              className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
            >
              שמור
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-muted-foreground"
            >
              ביטול
            </button>
          </>
        ) : exception ? (
          <>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
              חריג: ₪{money(exception.amount)}
            </span>
            <button
              type="button"
              onClick={() => {
                setAmountDraft(String(exception.amount));
                setEditing(true);
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              עריכה
            </button>
            <button
              type="button"
              onClick={clearException}
              className="text-muted-foreground hover:text-red-600"
              title="בטל חריג"
            >
              <XCircle size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAmountDraft(String(defaultRate));
              setEditing(true);
            }}
            className="text-xs text-muted-foreground hover:text-blue-600 hover:underline"
          >
            ₪{money(defaultRate)} · סמן כחריג
          </button>
        )}
      </div>
    </div>
  );
}
