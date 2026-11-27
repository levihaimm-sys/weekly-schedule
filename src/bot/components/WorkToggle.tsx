"use client";

import { useState, useTransition } from "react";
import { setChatWork } from "@/bot/actions/chats";

// On/off for "work". Unmarked chats follow the name keywords (byName).
export function WorkToggle({ account, jid, marked, byName }: { account: string; jid: string; marked: boolean | null; byName: boolean }) {
  const [value, setValue] = useState(marked);
  const [pending, startTransition] = useTransition();
  const on = value ?? byName;

  const toggle = () => {
    const next = !on;
    const previous = value;
    setValue(next);
    const fd = new FormData();
    fd.set("account", account);
    fd.set("jid", jid);
    fd.set("work", String(next));
    startTransition(async () => {
      try {
        await setChatWork(fd);
      } catch {
        setValue(previous);
      }
    });
  };

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      title={value === null && byName ? "סומן אוטומטית לפי השם" : undefined}
      className={`rounded-lg border px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${pending ? "opacity-70" : ""} ${
        on ? "bg-accent-soft text-accent border-transparent font-semibold" : "border-line text-muted hover:bg-sub"
      }`}
    >
      💼 עבודה{value === null && byName ? " (אוטו')" : ""}
    </button>
  );
}
