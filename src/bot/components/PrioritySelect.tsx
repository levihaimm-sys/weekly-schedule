"use client";

import { useState, useTransition } from "react";
import { setChatPriority } from "@/bot/actions/chats";

const OPTIONS = [
  { value: "important", label: "חשוב", on: "text-emerald-700 dark:text-emerald-400" },
  { value: "normal", label: "רגיל", on: "text-foreground" },
  { value: "background", label: "רקע", on: "text-amber-700 dark:text-amber-400" },
  { value: "ignore", label: "להתעלם", on: "text-red-600 dark:text-red-400" },
];

// One tap saves. The pressed button lights up immediately.
export function PrioritySelect({ account, jid, value }: { account: string; jid: string; value: string }) {
  const [current, setCurrent] = useState(value);
  const [pending, startTransition] = useTransition();

  const choose = (priority: string) => {
    if (priority === current) return;
    const previous = current;
    setCurrent(priority);
    const fd = new FormData();
    fd.set("account", account);
    fd.set("jid", jid);
    fd.set("priority", priority);
    startTransition(async () => {
      try {
        await setChatPriority(fd);
      } catch {
        setCurrent(previous);
      }
    });
  };

  return (
    <div role="radiogroup" className={`flex gap-0.5 rounded-lg border border-line bg-sub p-0.5 ${pending ? "opacity-70" : ""}`}>
      {OPTIONS.map((o) => {
        const active = current === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(o.value)}
            className={`rounded-md px-2.5 py-1 text-sm whitespace-nowrap transition-colors ${
              active ? `bg-card shadow-[0_1px_2px_rgba(16,24,40,0.1)] font-semibold ${o.on}` : "text-muted hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
