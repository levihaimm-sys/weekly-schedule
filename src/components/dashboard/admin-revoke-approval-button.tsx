"use client";

import { useState, useTransition } from "react";
import { Loader2, Undo2 } from "lucide-react";
import { revokeApproval } from "@/lib/actions/signatures";
import { useRouter } from "next/navigation";

export function AdminRevokeApprovalButton({ lessonId }: { lessonId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            startTransition(async () => {
              await revokeApproval(lessonId);
              router.refresh();
            })
          }
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
        >
          {isPending ? <Loader2 size={11} className="animate-spin" /> : "כן, בטל אישור"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          חזרה
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
    >
      <Undo2 size={11} />
      בטל אישור
    </button>
  );
}
