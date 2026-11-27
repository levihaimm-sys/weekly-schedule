"use client";

import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; text: string; steps?: string[]; error?: boolean };

const EXAMPLES = {
  personal: ["דיברנו אני ומיטל על הטיול לצפון?", "מה הוחלט בקבוצת ההורים השבוע?", "מי ביקש ממני משהו ועוד לא עניתי?"],
  business: ["אילו מועמדים שאלו על המחזור הבא?", "מה סוכם עם המדריכים השבוע?", "איזה לקוח ביקש חשבונית?"],
};

export function AskChat({ space }: { space: "personal" | "business" }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const next: Turn[] = [...turns, { role: "user", text: q }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: next.filter((t) => !t.error).map(({ role, text }) => ({ role, text })),
        }),
      });
      const data = await res.json().catch(() => ({ error: "תשובה לא תקינה מהשרת." }));
      setTurns((t) => [
        ...t,
        data.error
          ? { role: "assistant", text: data.error, error: true }
          : { role: "assistant", text: data.answer, steps: data.steps },
      ]);
    } catch {
      setTurns((t) => [...t, { role: "assistant", text: "אין חיבור לשרת. נסה שוב.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {turns.length === 0 && (
        <section className="rounded-2xl border border-line bg-card p-5 space-y-3 text-sm">
          <p className="text-muted">
            אפשר לשאול כל שאלה על השיחות שלך, בפרטי ובקבוצות. הבוט מחפש בהודעות שנשמרו ועונה עם הפניה למי אמר, איפה ומתי.
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES[space].map((e) => (
              <button
                key={e}
                onClick={() => ask(e)}
                className="rounded-full border border-line bg-sub px-3 py-1 hover:bg-accent-soft"
              >
                {e}
              </button>
            ))}
          </div>
        </section>
      )}

      <ul className="space-y-3">
        {turns.map((t, i) => (
          <li key={i} className={t.role === "user" ? "flex justify-start" : "flex justify-end"}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap break-words leading-relaxed ${
                t.role === "user"
                  ? "bg-accent text-background"
                  : t.error
                    ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm"
                    : "bg-card border border-line"
              }`}
            >
              {t.text}
              {t.steps && t.steps.length > 0 && (
                <details className="mt-2 text-xs text-muted">
                  <summary className="cursor-pointer w-fit">מה בדקתי ({t.steps.length})</summary>
                  <ul className="mt-1 space-y-0.5">
                    {t.steps.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </li>
        ))}
        {busy && (
          <li className="flex justify-end">
            <div className="rounded-2xl px-4 py-2.5 bg-card border border-line text-sm text-muted animate-pulse">
              מחפש בשיחות…
            </div>
          </li>
        )}
      </ul>
      <div ref={bottom} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="sticky bottom-2 flex gap-2 rounded-2xl bg-card border border-line p-2 shadow-[0_4px_16px_rgba(16,24,40,0.08)]"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
          rows={1}
          placeholder="מה תרצה לדעת?"
          className="flex-1 resize-none bg-transparent px-2 py-1.5 outline-none"
        />
        {turns.length > 0 && (
          <button
            type="button"
            onClick={() => setTurns([])}
            disabled={busy}
            className="rounded-lg px-3 text-sm text-muted hover:bg-sub"
          >
            שיחה חדשה
          </button>
        )}
        <button
          disabled={busy || !input.trim()}
          className="rounded-xl bg-accent text-background px-4 text-sm font-medium disabled:opacity-40"
        >
          שאל
        </button>
      </form>
    </div>
  );
}
