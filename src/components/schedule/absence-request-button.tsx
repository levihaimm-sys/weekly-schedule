"use client";

import { useState } from "react";
import { requestAbsence } from "@/lib/actions/schedule";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AbsenceRequestButton({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const result = await requestAbsence(lessonId, notes);
    setLoading(false);

    if (result.success) {
      setDone(true);
      router.refresh();
      setTimeout(() => setOpen(false), 1500);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
        <CheckCircle2 size={16} />
        הבקשה נשלחה
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-100"
      >
        <AlertTriangle size={16} />
        לא יכול/ה להגיע
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
      <p className="text-sm font-medium text-orange-700">בקשת היעדרות</p>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="סיבה (אופציונלי)..."
        className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          שלח בקשה
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg border border-orange-200 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100"
        >
          ביטול
        </button>
      </div>
    </div>
  );
}
