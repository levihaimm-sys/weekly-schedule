"use client";

import { loginAsInstructor } from "@/lib/actions/auth";
import { useActionState } from "react";
import { Phone, User } from "lucide-react";

export default function InstructorLoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await loginAsInstructor(formData);
    },
    null
  );

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
        <a href="/login" className="text-sm text-primary hover:underline">
          כניסת מנהלים
        </a>
      </div>
    </div>
  );
}
