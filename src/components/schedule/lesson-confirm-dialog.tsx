"use client";

import { useRef, useState, useTransition } from "react";
import SignatureCanvas from "react-signature-canvas";
import { uploadSignature } from "@/lib/actions/signatures";
import { Eraser, Check, Loader2, X } from "lucide-react";

interface LessonConfirmDialogProps {
  lessonId: string;
  locationName: string;
  startTime: string;
  open: boolean;
  onClose: () => void;
}

export function LessonConfirmDialog({
  lessonId,
  locationName,
  startTime,
  open,
  onClose,
}: LessonConfirmDialogProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [signerName, setSignerName] = useState("");
  const [time, setTime] = useState(startTime.slice(0, 5));
  const [duration, setDuration] = useState(45);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("אנא חתום לפני השמירה");
      return;
    }
    if (!signerName.trim()) {
      setError("אנא הכנס את שם הגננת");
      return;
    }

    setError(null);
    const dataUrl = sigRef.current.toDataURL("image/png");
    
    startTransition(async () => {
      const result = await uploadSignature(
        lessonId,
        signerName,
        dataUrl,
        time + ":00",
        duration
      );

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  function handleClear() {
    sigRef.current?.clear();
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-background p-5 sm:rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">אישור שיעור</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{locationName}</p>

        {/* Teacher name */}
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium">שם הגננת</label>
          <input
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="שם מלא"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Time and duration row */}
        <div className="mb-3 flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">שעת שיעור</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              dir="ltr"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">
              משך (דקות)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={15}
              max={120}
              step={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              dir="ltr"
            />
          </div>
        </div>

        {/* Signature */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium">חתימת הגננת</label>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Eraser size={12} />
              נקה
            </button>
          </div>
          <div
            className="rounded-lg border-2 border-dashed border-border bg-white"
            onTouchStart={() => {
              // Dismiss keyboard so user can sign immediately after filling name
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
          >
            <SignatureCanvas
              ref={sigRef}
              canvasProps={{
                className: "w-full touch-none",
                style: { width: "100%", height: "100px" },
              }}
              penColor="black"
              backgroundColor="white"
            />
          </div>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {isPending ? "שומר..." : "אשר"}
          </button>
        </div>
      </div>
    </div>
  );
}
