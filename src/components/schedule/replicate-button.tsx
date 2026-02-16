"use client";

import { useState } from "react";
import { replicateWeekSchedule } from "@/lib/actions/schedule";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function ReplicateButton({ targetDate }: { targetDate?: string } = {}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    const result = await replicateWeekSchedule(targetDate);

    if (result.error) {
      setMessage(result.error);
    } else if (result.message) {
      setMessage(result.message);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "יוצר..." : "צור שיעורים לשבוע"}
      </button>
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}
