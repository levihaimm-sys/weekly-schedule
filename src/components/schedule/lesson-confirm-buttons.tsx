"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { confirmByInstructor, markLessonDidNotHappen } from "@/lib/actions/signatures";
import { LessonConfirmDialog } from "./lesson-confirm-dialog";
import { PenLine, Check, CheckCircle, Loader2, XCircle } from "lucide-react";

interface LessonConfirmButtonsProps {
  lessonId: string;
  locationName: string;
  startTime: string;
  signature?: {
    signer_name: string;
    signer_role: string;
    signature_url: string | null;
  } | null;
}

export function LessonConfirmButtons({
  lessonId,
  locationName,
  startTime,
  signature,
}: LessonConfirmButtonsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDidNotHappenPending, startDidNotHappenTransition] = useTransition();
  const router = useRouter();
  
  // Optimistic state for instructor confirmation
  const [optimisticSignature, setOptimisticSignature] = useOptimistic(
    signature,
    (state, newSignature: typeof signature) => newSignature
  );

  // Already confirmed
  if (optimisticSignature) {
    const isTeacher = optimisticSignature.signer_role === "teacher";
    return (
      <div className="flex items-center gap-2 rounded-xl bg-success/20 px-3 py-2 text-sm font-bold text-success">
        <CheckCircle size={16} />
        <span>
          {isTeacher
            ? `אושר ע"י גננת (${optimisticSignature.signer_name})`
            : "אושר ע\"י המדריכה"}
        </span>
      </div>
    );
  }

  function handleInstructorConfirm() {
    startTransition(async () => {
      // Show optimistic update immediately
      setOptimisticSignature({
        signer_name: "מדריכה",
        signer_role: "instructor",
        signature_url: null,
      });
      
      const result = await confirmByInstructor(lessonId);
      if (result.error) {
        // Revert on error
        setOptimisticSignature(null);
      }
      // No router.refresh() needed - optimistic update already shows the change
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <PenLine size={14} />
          אישור גננת
        </button>
        <button
          onClick={handleInstructorConfirm}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-foreground shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          אישור מדריכה
        </button>
        <button
          onClick={() => {
            startDidNotHappenTransition(async () => {
              await markLessonDidNotHappen(lessonId);
              router.refresh();
            });
          }}
          disabled={isDidNotHappenPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive shadow-sm transition-all hover:bg-destructive/20 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          {isDidNotHappenPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          )}
          לא התקיים
        </button>
      </div>

      <LessonConfirmDialog
        lessonId={lessonId}
        locationName={locationName}
        startTime={startTime}
        open={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
}
