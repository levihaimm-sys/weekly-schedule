"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Banknote, XCircle, Plus, Trash2, AlertTriangle } from "lucide-react";
import { formatTime } from "@/lib/utils/date";
import { DAYS_SHORT } from "@/lib/utils/constants";
import {
  updateClientPaymentRate,
  setClientPaymentException,
  deleteClientPaymentException,
  addClientPaymentAdjustment,
  deleteClientPaymentAdjustment,
} from "@/lib/actions/client-payments";

interface LessonData {
  id: string;
  lesson_date: string;
  start_time: string;
  status: string;
  client_name: string;
  city: string;
}

interface RateData {
  client_name: string;
  city: string;
  rate_per_lesson: number;
}

interface ExceptionData {
  lesson_id: string;
  client_name: string;
  amount: number;
  notes: string | null;
}

interface AdjustmentData {
  id: string;
  client_name: string;
  year: number;
  month: number;
  label: string;
  amount: number;
}

interface Props {
  lessons: LessonData[];
  rates: RateData[];
  exceptions: ExceptionData[];
  adjustments: AdjustmentData[];
  year: number;
  month: number;
}

function money(n: number) {
  return n.toLocaleString("he-IL", { maximumFractionDigits: 2 });
}

// Cycled per client (by sorted order) purely to make cards visually distinguishable.
const THEMES = [
  { accent: "#3b82f6", header: "bg-blue-50", avatar: "bg-blue-500", text: "text-blue-700" },
  { accent: "#a855f7", header: "bg-purple-50", avatar: "bg-purple-500", text: "text-purple-700" },
  { accent: "#10b981", header: "bg-emerald-50", avatar: "bg-emerald-500", text: "text-emerald-700" },
  { accent: "#f59e0b", header: "bg-amber-50", avatar: "bg-amber-500", text: "text-amber-700" },
  { accent: "#f43f5e", header: "bg-rose-50", avatar: "bg-rose-500", text: "text-rose-700" },
  { accent: "#06b6d4", header: "bg-cyan-50", avatar: "bg-cyan-500", text: "text-cyan-700" },
  { accent: "#6366f1", header: "bg-indigo-50", avatar: "bg-indigo-500", text: "text-indigo-700" },
  { accent: "#f97316", header: "bg-orange-50", avatar: "bg-orange-500", text: "text-orange-700" },
];

function rateKey(client: string, city: string) {
  return `${client}__${city}`;
}

function groupByCity(lessons: LessonData[]) {
  const map = new Map<string, { city: string; lessons: LessonData[] }>();
  for (const l of lessons) {
    const key = l.city;
    if (!map.has(key)) map.set(key, { city: l.city, lessons: [] });
    map.get(key)!.lessons.push(l);
  }
  return [...map.values()].sort((a, b) => a.city.localeCompare(b.city, "he"));
}

function computeGroupTotal(
  lessons: LessonData[],
  rate: RateData | undefined,
  exceptionMap: Map<string, ExceptionData>
) {
  const active = lessons.filter((l) => l.status !== "cancelled");
  const ratePerLesson = rate?.rate_per_lesson ?? 0;

  let regularCount = 0;
  let exceptionsAmount = 0;
  for (const l of active) {
    const ex = exceptionMap.get(l.id);
    if (ex) exceptionsAmount += ex.amount;
    else regularCount++;
  }

  const baseAmount = regularCount * ratePerLesson;
  const total = baseAmount + exceptionsAmount;

  return { active, regularCount, exceptionsAmount, baseAmount, total };
}

export function ClientPaymentsView({ lessons, rates, exceptions, adjustments, year, month }: Props) {
  const rateMap = useMemo(() => {
    const m = new Map<string, RateData>();
    for (const r of rates) m.set(rateKey(r.client_name, r.city), r);
    return m;
  }, [rates]);

  const exceptionMap = useMemo(() => {
    const m = new Map<string, ExceptionData>();
    for (const e of exceptions) m.set(e.lesson_id, e);
    return m;
  }, [exceptions]);

  const byClient = useMemo(() => {
    const map = new Map<string, { name: string; lessons: LessonData[] }>();
    for (const lesson of lessons) {
      if (!map.has(lesson.client_name)) {
        map.set(lesson.client_name, { name: lesson.client_name, lessons: [] });
      }
      map.get(lesson.client_name)!.lessons.push(lesson);
    }
    return [...map.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [lessons]);

  function clientSummary(clientName: string, cLessons: LessonData[]) {
    const groups = groupByCity(cLessons);
    let total = 0;
    let lessonCount = 0;
    for (const g of groups) {
      const rate = rateMap.get(rateKey(clientName, g.city));
      const gt = computeGroupTotal(g.lessons, rate, exceptionMap);
      total += gt.total;
      lessonCount += gt.active.length;
    }
    const adjustmentSum = adjustments
      .filter((a) => a.client_name === clientName)
      .reduce((s, a) => s + a.amount, 0);
    total += adjustmentSum;
    return { total, lessonCount, average: lessonCount > 0 ? total / lessonCount : 0 };
  }

  const summaries = byClient.map((c, idx) => ({
    ...c,
    ...clientSummary(c.id, c.lessons),
    theme: THEMES[idx % THEMES.length],
  }));

  const grandTotal = summaries.reduce((sum, s) => sum + s.total, 0);
  const grandLessonCount = summaries.reduce((sum, s) => sum + s.lessonCount, 0);
  const grandAverage = grandLessonCount > 0 ? grandTotal / grandLessonCount : 0;

  const avgSorted = [...summaries].sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background p-4 text-center">
        <p className="text-3xl font-bold text-[#1C1917]">₪{money(grandTotal)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{'סה"כ לקבלה מלקוחות בחודש זה'}</p>
      </div>

      {avgSorted.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <p className="border-b border-border bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
            ממוצע תשלום מלקוח לשיעור (כולל חריגים והתאמות)
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-2 text-start">לקוח</th>
                <th className="px-4 py-2 text-center">שיעורים</th>
                <th className="px-4 py-2 text-center">{'סה"כ'}</th>
                <th className="px-4 py-2 text-center">ממוצע לשיעור</th>
              </tr>
            </thead>
            <tbody>
              {avgSorted.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 font-medium">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.theme.accent }}
                      />
                      {s.name}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-muted-foreground">
                    {s.lessonCount}
                  </td>
                  <td className="px-4 py-2 text-center">₪{money(s.total)}</td>
                  <td className="px-4 py-2 text-center font-bold">₪{money(s.average)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30 font-bold">
                <td className="px-4 py-2">{'סה"כ / ממוצע כללי'}</td>
                <td className="px-4 py-2 text-center">{grandLessonCount}</td>
                <td className="px-4 py-2 text-center">₪{money(grandTotal)}</td>
                <td className="px-4 py-2 text-center">₪{money(grandAverage)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {byClient.length === 0 && (
        <div className="rounded-xl border border-border bg-background py-12 text-center text-muted-foreground">
          אין שיעורים להצגה בחודש זה
        </div>
      )}

      {byClient.map((c, idx) => (
        <ClientPayCard
          key={c.id}
          clientName={c.id}
          name={c.name}
          lessons={c.lessons}
          rates={rates.filter((r) => r.client_name === c.id)}
          exceptionMap={exceptionMap}
          adjustments={adjustments.filter((a) => a.client_name === c.id)}
          year={year}
          month={month}
          theme={THEMES[idx % THEMES.length]}
        />
      ))}
    </div>
  );
}

function ClientPayCard({
  clientName,
  name,
  lessons,
  rates,
  exceptionMap,
  adjustments,
  year,
  month,
  theme,
}: {
  clientName: string;
  name: string;
  lessons: LessonData[];
  rates: RateData[];
  exceptionMap: Map<string, ExceptionData>;
  adjustments: AdjustmentData[];
  year: number;
  month: number;
  theme: (typeof THEMES)[number];
}) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rateByKey = useMemo(() => {
    const m = new Map<string, RateData>();
    for (const r of rates) m.set(rateKey(clientName, r.city), r);
    return m;
  }, [rates, clientName]);

  const groupTotals = useMemo(() => {
    return groupByCity(lessons).map((g) => {
      const rate = rateByKey.get(rateKey(clientName, g.city));
      return {
        ...g,
        ...computeGroupTotal(g.lessons, rate, exceptionMap),
        hasRate: !!rate,
      };
    });
  }, [lessons, rateByKey, clientName, exceptionMap]);

  const lessonsSum = groupTotals.reduce((s, g) => s + g.total, 0);
  const adjustmentsSum = adjustments.reduce((s, a) => s + a.amount, 0);
  const total = lessonsSum + adjustmentsSum;
  const totalActive = groupTotals.reduce((s, g) => s + g.active.length, 0);
  const unpricedCount = groupTotals.filter((g) => !g.hasRate).length;

  const initials = name.trim().slice(0, 2);

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-background"
      style={{ borderInlineStartWidth: 4, borderInlineStartColor: theme.accent }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-start ${theme.header}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${theme.avatar}`}
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span className="font-semibold">{name}</span>
              {unpricedCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                  <AlertTriangle size={11} />
                  {unpricedCount} ללא תעריף
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {totalActive} שיעורים · {groupTotals.length} אזורים
            </span>
          </div>
        </div>
        <span className={`font-bold ${theme.text}`}>₪{money(total)}</span>
      </button>

      {expanded && (
        <div className="space-y-4 p-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="space-y-3">
            {groupTotals.map((g) => (
              <CityRateGroup
                key={g.city}
                clientName={clientName}
                group={g}
                rate={rateByKey.get(rateKey(clientName, g.city))}
                exceptionMap={exceptionMap}
                onError={setError}
                theme={theme}
              />
            ))}
          </div>

          <AdjustmentSection
            clientName={clientName}
            adjustments={adjustments}
            year={year}
            month={month}
            onError={setError}
          />
        </div>
      )}
    </div>
  );
}

function CityRateGroup({
  clientName,
  group,
  rate,
  exceptionMap,
  onError,
  theme,
}: {
  clientName: string;
  group: ReturnType<typeof groupByCity>[number] & ReturnType<typeof computeGroupTotal>;
  rate: RateData | undefined;
  exceptionMap: Map<string, ExceptionData>;
  onError: (msg: string | null) => void;
  theme: (typeof THEMES)[number];
}) {
  const router = useRouter();
  const [rateDraft, setRateDraft] = useState(String(rate?.rate_per_lesson ?? 0));
  const [showLessons, setShowLessons] = useState(false);

  useEffect(() => {
    setRateDraft(String(rate?.rate_per_lesson ?? 0));
  }, [rate?.rate_per_lesson]);

  async function saveRate() {
    const ratePerLesson = Number(rateDraft) || 0;
    if (ratePerLesson === (rate?.rate_per_lesson ?? 0)) {
      return;
    }
    const result = await updateClientPaymentRate(clientName, group.city, ratePerLesson);
    if (result.error) {
      onError(result.error);
      return;
    }
    onError(null);
    router.refresh();
  }

  const isUnpriced = !rate;

  return (
    <div
      className={`overflow-hidden rounded-lg border ${
        isUnpriced ? "border-red-300" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => setShowLessons((v) => !v)}
        className={`flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-start ${
          isUnpriced ? "bg-red-50" : "bg-muted/30"
        }`}
      >
        <div className="flex items-center gap-2 text-sm">
          {showLessons ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          <span className="font-medium">{group.city || "ללא אזור"}</span>
          <span className="text-xs text-muted-foreground">
            ({group.active.length} שיעורים)
          </span>
          {isUnpriced && (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <AlertTriangle size={12} />
              טרם הוגדר תעריף - נא למלא
            </span>
          )}
        </div>
        <span className={`text-sm font-semibold ${theme.text}`}>₪{money(group.total)}</span>
      </button>

      <div className="flex flex-wrap items-center gap-4 border-t border-border px-3 py-2">
        <label className="flex items-center gap-1.5 text-xs">
          <Banknote size={13} className="text-muted-foreground" />
          <span className="text-muted-foreground">לשיעור:</span>
          <input
            type="number"
            min={0}
            dir="ltr"
            value={rateDraft}
            onChange={(e) => setRateDraft(e.target.value)}
            onBlur={saveRate}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-16 rounded-md border border-border bg-background px-1.5 py-0.5 text-right"
          />
          <span className="text-muted-foreground">₪</span>
        </label>
      </div>

      {showLessons && (
        <div className="divide-y divide-border border-t border-border">
          {group.active.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              clientName={clientName}
              exception={exceptionMap.get(lesson.id)}
              defaultRate={rate?.rate_per_lesson ?? 0}
              onError={onError}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonRow({
  lesson,
  clientName,
  exception,
  defaultRate,
  onError,
}: {
  lesson: LessonData;
  clientName: string;
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
    const result = await setClientPaymentException(lesson.id, clientName, amount, null);
    if (result.error) {
      onError(result.error);
      return;
    }
    onError(null);
    setEditing(false);
    router.refresh();
  }

  async function clearException() {
    const result = await deleteClientPaymentException(lesson.id);
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

function AdjustmentSection({
  clientName,
  adjustments,
  year,
  month,
  onError,
}: {
  clientName: string;
  adjustments: AdjustmentData[];
  year: number;
  month: number;
  onError: (msg: string | null) => void;
}) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [adding, setAdding] = useState(false);

  async function addAdjustment() {
    const amt = Number(amount);
    if (!label.trim() || Number.isNaN(amt)) {
      onError("יש להזין תיאור וסכום תקינים להתאמה");
      return;
    }
    setAdding(true);
    const result = await addClientPaymentAdjustment(clientName, year, month, label, amt);
    setAdding(false);
    if (result.error) {
      onError(result.error);
      return;
    }
    onError(null);
    setLabel("");
    setAmount("");
    router.refresh();
  }

  async function removeAdjustment(id: string) {
    const result = await deleteClientPaymentAdjustment(id);
    if (result.error) {
      onError(result.error);
      return;
    }
    onError(null);
    router.refresh();
  }

  const sum = adjustments.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="rounded-lg border border-dashed border-border p-3">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">
        התאמות מיוחדות לחודש זה (תוספת, הנחה וכו׳ - ניתן להזין סכום שלילי להנחה)
      </p>

      {adjustments.length > 0 && (
        <div className="mb-2 space-y-1.5">
          {adjustments.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{a.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">₪{money(a.amount)}</span>
                <button
                  type="button"
                  onClick={() => removeAdjustment(a.id)}
                  className="text-muted-foreground hover:text-red-600"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-1.5 text-sm font-semibold">
            <span>{'סה"כ התאמות'}</span>
            <span>₪{money(sum)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="תיאור (למשל: תוספת, הנחה)"
          className="min-w-[10rem] flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <input
          type="number"
          dir="ltr"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="סכום"
          className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm text-right"
        />
        <button
          type="button"
          onClick={addAdjustment}
          disabled={adding}
          className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          <Plus size={13} />
          הוסף
        </button>
      </div>
    </div>
  );
}
