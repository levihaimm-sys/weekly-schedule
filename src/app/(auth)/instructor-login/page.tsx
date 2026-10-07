"use client";

import { loginAsInstructor } from "@/lib/actions/auth";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Phone, User } from "lucide-react";

// Set by loginAsInstructor, cleared by logout (see lib/actions/auth.ts)
const REMEMBER_COOKIE = "remember_instructor";

function readRemembered(): { name: string; phone: string } | null {
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(REMEMBER_COOKIE + "="))
    ?.slice(REMEMBER_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return parsed?.name && parsed?.phone ? parsed : null;
  } catch {
    return null;
  }
}

export default function InstructorLoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await loginAsInstructor(formData);
    },
    null
  );
  const [remembered, setRemembered] = useState<{ name: string; phone: string } | null>(null);
  const autoTried = useRef(false);

  // Device was signed in before — log back in silently
  useEffect(() => {
    if (autoTried.current) return;
    autoTried.current = true;
    const saved = readRemembered();
    if (!saved) return;
    setRemembered(saved);
    const fd = new FormData();
    fd.set("name", saved.name);
    fd.set("phone", saved.phone);
    startTransition(() => formAction(fd));
  }, [formAction]);

  if (remembered && !state?.error) {
    return (
      <div className="rounded-xl border border-border bg-background p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">חיים בתנועה</h1>
        <p className="mt-4 text-muted-foreground">מתחבר/ת בתור {remembered.name}...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">חיים בתנועה</h1>
        <p className="mt-2 text-muted-foreground">כניסת מדריכים</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            שם מלא
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={remembered?.name}
              className="w-full rounded-lg border border-border bg-background ps-10 pe-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="הזן את שמך המלא"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            מספר טלפון
          </label>
          <div className="relative">
            <Phone
              size={18}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              defaultValue={remembered?.phone}
              dir="ltr"
              className="w-full rounded-lg border border-border bg-background ps-10 pe-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="050-1234567"
            />
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "מתחבר..." : "התחבר"}
        </button>
      </form>

      <div className="mt-6 border-t border-border pt-4 text-center">
        <a href="/login" className="text-sm text-orange-600 hover:underline">
          כניסת מנהלים
        </a>
      </div>
    </div>
  );
}
