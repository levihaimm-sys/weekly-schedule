"use client";

import { useState } from "react";
import { Eye, Download, Loader2 } from "lucide-react";
import { CityReportPreviewModal, type CityReportPreviewData } from "./report-preview-modal";

interface CityReportFormProps {
  cities: string[];
}

const MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export function LocationReportForm({ cities }: CityReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CityReportPreviewData | null>(null);
  const [downloading, setDownloading] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  function getFormValues(form: HTMLFormElement) {
    const formData = new FormData(form);
    return {
      city: formData.get("city") as string,
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
    };
  }

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { city, month, year } = getFormValues(e.currentTarget);

    if (!city) {
      setError("בחר עיר");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/generate-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, month, year, preview: true }),
      });

      if (!response.ok) {
        let errorMsg = "שגיאה ביצירת הדוח";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `שגיאת שרת (${response.status})`;
        }
        setError(errorMsg);
        return;
      }

      const data = await response.json();
      setPreviewData(data);
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(city?: string, month?: number, year?: number) {
    const form = document.getElementById("city-report-form") as HTMLFormElement | null;
    if (!form) return;
    const values = getFormValues(form);
    const c = city ?? values.city;
    const m = month ?? values.month;
    const y = year ?? values.year;

    setDownloading(true);
    setError(null);

    try {
      const response = await fetch("/api/reports/generate-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: c, month: m, year: y }),
      });

      if (!response.ok) {
        let errorMsg = "שגיאה ביצירת הדוח";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch {
          errorMsg = `שגיאת שרת (${response.status})`;
        }
        setError(errorMsg);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${c}-${m}-${y}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <form id="city-report-form" onSubmit={handlePreview} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">עיר</label>
            <select
              name="city"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              required
            >
              <option value="">בחר עיר...</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
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
                <option key={i} value={i + 1}>{name}</option>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || downloading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
            {loading ? "טוען..." : "תצוגה מקדימה"}
          </button>

          <button
            type="button"
            disabled={loading || downloading}
            onClick={() => handleDownload()}
            className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {downloading ? "מוריד..." : "הורד PDF ישירות"}
          </button>
        </div>
      </form>

      {previewData && (
        <CityReportPreviewModal
          data={previewData}
          onClose={() => setPreviewData(null)}
          onDownload={() => handleDownload(previewData.city, previewData.month, previewData.year)}
          downloading={downloading}
        />
      )}
    </>
  );
}
