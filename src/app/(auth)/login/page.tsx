"use client";

import { loginWithPassword } from "@/lib/actions/auth";
import { useActionState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await loginWithPassword(formData);
    },
    null
  );

  return (
    <div className="rounded-xl border border-border bg-background p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">חיים בתנועה</h1>
        <p className="mt-2 text-muted-foreground">כניסת מנהלים</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            אימייל
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium"
          >
            סיסמה
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <LogIn size={18} />
          {isPending ? "מתחבר..." : "כניסה"}
        </button>
      </form>

      <div className="mt-6 border-t border-border pt-4 text-center">
        <a
          href="/instructor-login"
          className="text-sm text-orange-600 hover:underline"
        >
          כניסת מדריכים
        </a>
      </div>
    </div>
  );
}
