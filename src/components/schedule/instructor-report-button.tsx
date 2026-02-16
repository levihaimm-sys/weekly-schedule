"use client";

import { useState, useOptimistic, useTransition } from "react";
import { submitInstructorRequest } from "@/lib/actions/schedule";
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { INSTRUCTOR_REQUEST_TYPES } from "@/lib/utils/constants";

type RequestType = "absence" | "lateness" | "other";

const REQUEST_OPTIONS: {
  type: RequestType;
  label: string;
  icon: typeof AlertTriangle;
  color: string;
}[] = [
  {
    type: "absence",
    label: "חיסור",
    icon: AlertTriangle,
    color: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
  {
    type: "lateness",
    label: "איחור צפוי",
    icon: Clock,
    color: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  },
  {
    type: "other",
    label: "הודעה",
    icon: MessageSquare,
    color: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
];

export function InstructorReportButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [optimisticDone, setOptimisticDone] = useOptimistic(false);

  function handleSubmit() {
    if (!selectedType) return;
    
    startTransition(async () => {
      // Show success immediately
      setOptimisticDone(true);
      
      const result = await submitInstructorRequest(lessonId, selectedType, notes);
      if (result.error) {
        // Revert on error
        setOptimisticDone(false);
      }
      // No router.refresh() needed - optimistic update already shows the change
    });
  }

  if (optimisticDone) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
        <CheckCircle2 size={16} />
        הבקשה נשלחה
      </div>
    );
  }

  if (!selectedType) {
    return (
      <div className="flex gap-2">
        {REQUEST_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setSelectedType(opt.type)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors ${opt.color}`}
          >
            <opt.icon size={14} />
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  const selected = REQUEST_OPTIONS.find((o) => o.type === selectedType)!;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
      <div className="flex items-center gap-2">
        <selected.icon size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">
          {INSTRUCTOR_REQUEST_TYPES[selectedType]}
        </span>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={
          selectedType === "lateness"
            ? "כמה זמן איחור צפוי?"
            : "הערה (אופציונלי)..."
        }
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          שלח
        </button>
        <button
          onClick={() => {
            setSelectedType(null);
            setNotes("");
          }}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
