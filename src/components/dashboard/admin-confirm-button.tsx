"use client";

import { useTransition } from "react";
import { Loader2, CheckCheck } from "lucide-react";
import { adminConfirmLesson } from "@/lib/actions/signatures";
import { useRouter } from "next/navigation";

export function AdminConfirmButton({
  lessonId,
  instructorName,
}: {
  lessonId: string;
  instructorName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await adminConfirmLesson(lessonId, instructorName);
          router.refresh();
        })
      }
      disabled={isPending}
      className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
    >
      {isPending ? <Loader2 size={11} className="animate-spin" /> : <CheckCheck size={11} />}
      אשר ידנית
    </button>
  );
}
