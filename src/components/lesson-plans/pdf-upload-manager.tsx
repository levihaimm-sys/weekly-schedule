"use client";

import { useState, useTransition, type FormEvent } from "react";
import { UploadCloud, CheckCircle2, XCircle, AlertTriangle, FileWarning } from "lucide-react";
import { syncLessonPlanPdfs, type PdfSyncResult } from "@/lib/actions/lesson-plan-pdf";

export function PdfUploadManager() {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<PdfSyncResult[] | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!files || files.length === 0) return;

    const form = e.currentTarget;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    startTransition(async () => {
      const res = await syncLessonPlanPdfs(formData);
      setResults(res);
      setFiles(null);
      form.reset();
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-2 block">
            בחרו קבצי PDF של מערכים מעודכנים
          </span>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium"
          />
        </label>
        <p className="text-xs text-gray-500">
          שם הקובץ חייב להיות בפורמט &quot;מערך 1 - שם (וריאנט).pdf&quot; — המספר (ולפי הצורך הוריאנט
          בסוגריים) הם מה שמשמש להתאמה למערך הקיים במערכת. העלאה תחליף את ה-PDF שהמדריכות רואות
          באפליקציה עבור המערך הזה.
        </p>
        <button
          type="submit"
          disabled={isPending || !files || files.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          <UploadCloud className="w-5 h-5" />
          {isPending ? "מעלה ומחליף..." : "העלה והחלף במערכת"}
        </button>
      </form>

      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-2">תוצאות</h3>
          {results.length === 0 ? (
            <p className="text-sm text-gray-600">לא נבחרו קבצים</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                {r.status === "ok" && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
                {r.status === "not_found" && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                {r.status === "ambiguous" && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {(r.status === "invalid_name" || r.status === "error") && (
                  <FileWarning className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{r.fileName}</p>
                  <p className="text-gray-600">{r.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
