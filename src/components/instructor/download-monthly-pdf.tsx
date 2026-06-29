"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadMonthlyPdfProps {
  instructorId: string;
  year: number;
  month: number;
}

export function DownloadMonthlyPdf({
  instructorId,
  year,
  month,
}: DownloadMonthlyPdfProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, month, year }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "שגיאה בהורדת הדוח");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `לוז-חודשי-${month}-${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("שגיאה בהורדת הדוח");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      הורדת PDF
    </button>
  );
}
