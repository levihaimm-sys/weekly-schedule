"use client";

import { useState, useTransition } from "react";
import { Undo2, Loader2 } from "lucide-react";
import { revokeApproval } from "@/lib/actions/signatures";

export function RevokeApprovalButton({ lessonId }: { lessonId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <button
          onClick={() =>
            startTransition(async () => {
              await revokeApproval(lessonId);
              setConfirming(false);
            })
          }
          disabled={isPending}
          className="text-[10px] font-bold text-destructive hover:underline disabled:opacity-50"
        >
          {isPending ? <Loader2 size={10} className="animate-spin" /> : "כן, בטל"}
        </button>
        <span className="text-[10px] text-muted-foreground">|</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] font-bold text-muted-foreground hover:underline"
        >
          ביטול
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors"
    >
      <Undo2 size={10} />
      ביטול אישור
    </button>
  );
}
