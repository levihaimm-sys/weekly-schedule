"use client";

import { useState } from "react";
import { X, Loader2, UserMinus } from "lucide-react";
import { submitInstructorRequest } from "@/lib/actions/schedule";
import { useRouter } from "next/navigation";

interface Props {
  lessonId: string;
  hasRequest: boolean;
  requestType: string | null;
  notes: string | null;
}

export function AbsenceRequestButton({ lessonId, hasRequest, requestType, notes }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already submitted - show status only
  if (hasRequest) {
    return (
      <div className="mt-3 rounded-xl bg-warning/10 px-3 py-2">
        <span className="text-sm font-bold text-foreground">
          📢 {requestType === "absence" ? "חיסור צפוי" : "בקשה"} נשלחה
        </span>
        {notes && (
          <span className="text-sm font-medium text-foreground/80"> - {notes}</span>
        )}
      </div>
    );
  }

  async function handleSubmit() {
    if (!note.trim()) {
      setError("יש להזין הערה");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await submitInstructorRequest(lessonId, "absence", note.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setNote("");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 active:bg-orange-100"
      >
        <UserMinus size={15} />
        דווח על חיסור צפוי
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">דיווח חיסור צפוי</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              נא להזין הסבר קצר לסיבת החיסור
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="למשל: מחלה, אירוע משפחתי..."
              rows={3}
              autoFocus
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-300"
            />

            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                שלח דיווח
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
