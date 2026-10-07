"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2, Loader2 } from "lucide-react";
import { undoLastScheduleChange } from "@/lib/actions/schedule";

/**
 * "בטל" — undoes the latest change made on the fixed or weekly board, one step per click.
 * `lastLabel` comes from the server page (getLastScheduleUndo) and refreshes with router.refresh().
 */
export function UndoButton({ lastLabel }: { lastLabel: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  async function handleUndo() {
    if (!lastLabel || loading) return;
    if (!confirm(`לבטל את השינוי האחרון: "${lastLabel}"?`)) return;

    setLoading(true);
    const result = await undoLastScheduleChange();
    setLoading(false);
    setMessage(result.error ? result.error : `בוטל: ${result.label}`);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleUndo}
        disabled={!lastLabel || loading}
        title={lastLabel ? `בטל: ${lastLabel}` : "אין שינויים לביטול"}
        className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 md:px-4 md:py-2 md:text-sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
        בטל
      </button>
      {message && (
        <div className="absolute left-0 top-full z-50 mt-1 whitespace-nowrap rounded-md bg-[#1C1917] px-3 py-1.5 text-xs text-white shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
