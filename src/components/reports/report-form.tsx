"use client";

import { useState } from "react";
import { Eye, Printer } from "lucide-react";
import { ReportPreviewModal, type ReportPreviewData } from "./report-preview-modal";

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
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [instructorId, setInstructorId] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  const printUrl = instructorId
    ? `/api/reports/print/instructor?instructorId=${instructorId}&month=${month}&year=${year}`
    : null;

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!instructorId) { setError("בחר מדריך"); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, month, year, preview: true }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "שגיאה ביצירת הדוח");
        return;
      }
      setPreviewData(await response.json());
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form id="report-form" onSubmit={handlePreview} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">מדריך</label>
            <select
              name="instructor"
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              required
            >
              <option value="">בחר מדריך...</option>
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">חודש</label>
            <select
              name="month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">שנה</label>
            <select
              name="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          {printUrl ? (
            <a
              href={printUrl}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Printer size={16} />
              הדפס PDF
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-lg bg-primary/50 px-6 py-2.5 text-sm font-medium text-primary-foreground cursor-not-allowed"
            >
              <Printer size={16} />
              הדפס PDF
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Eye size={16} />
            {loading ? "טוען..." : "תצוגה מקדימה"}
          </button>
        </div>
      </form>

      {previewData && (
        <ReportPreviewModal
          data={previewData}
          onClose={() => setPreviewData(null)}
          onDownload={() => {}}
          downloading={false}
        />
      )}
    </>
  );
}
