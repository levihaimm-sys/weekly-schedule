"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";

interface ReportFormProps {
  instructors: { id: string; full_name: string }[];
}

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export function ReportForm({ instructors }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const instructorId = formData.get("instructor") as string;
    const month = parseInt(formData.get("month") as string);
    const year = parseInt(formData.get("year") as string);

    if (!instructorId) {
      setError("בחר מדריך");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, month, year }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "שגיאה ביצירת הדוח");
        setLoading(false);
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("שגיאה בחיבור לשרת");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">מדריך</label>
          <select
            name="instructor"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            required
          >
            <option value="">בחר מדריך...</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">חודש</label>
          <select
            name="month"
            defaultValue={currentMonth}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            {MONTHS.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">שנה</label>
          <select
            name="year"
            defaultValue={currentYear}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {loading ? "מייצר דוח..." : "צור והורד PDF"}
      </button>
    </form>
  );
}
