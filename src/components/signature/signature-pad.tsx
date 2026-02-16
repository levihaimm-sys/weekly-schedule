"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { uploadSignature } from "@/lib/actions/signatures";
import { useRouter } from "next/navigation";
import { Eraser, Check, Loader2 } from "lucide-react";

interface SignaturePadProps {
  lessonId: string;
  locationName: string;
}

export function SignaturePad({ lessonId, locationName }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("אנא חתום לפני השמירה");
      return;
    }
    if (!signerName.trim()) {
      setError("אנא הכנס את שם החותם");
      return;
    }

    setLoading(true);
    setError(null);

    const dataUrl = sigRef.current.toDataURL("image/png");
    const result = await uploadSignature(lessonId, signerName, dataUrl);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/my-schedule`);
      router.refresh();
    }
  }

  function handleClear() {
    sigRef.current?.clear();
    setError(null);
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col">
      <div className="mb-4 rounded-lg bg-blue-50 p-3 text-center">
        <p className="text-sm font-medium text-blue-800">
          נא למסור את הטלפון לגננת לחתימה
        </p>
        <p className="mt-1 text-xs text-blue-600">{locationName}</p>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">שם החותם/ת</label>
        <input
          type="text"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="שם הגננת"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mb-4 flex-1">
        <p className="mb-1 text-sm font-medium">חתימה</p>
        <div className="rounded-lg border-2 border-dashed border-border bg-white">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              className: "w-full touch-none",
              style: { width: "100%", height: "250px" },
            }}
            penColor="black"
            backgroundColor="white"
          />
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          <Eraser size={18} />
          נקה
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-success px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-success/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Check size={18} />
          )}
          {loading ? "שומר..." : "אשר חתימה"}
        </button>
      </div>
    </div>
  );
}
