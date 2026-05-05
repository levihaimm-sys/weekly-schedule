"use client";

import { useTransition } from "react";
import { Loader2, XCircle } from "lucide-react";
import { adminCancelLesson } from "@/lib/actions/signatures";
import { useRouter } from "next/navigation";

export function AdminCancelButton({ lessonId }: { lessonId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await adminCancelLesson(lessonId);
          router.refresh();
        })
      }
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
    >
      {isPending ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
      בטל שיעור
    </button>
  );
}
