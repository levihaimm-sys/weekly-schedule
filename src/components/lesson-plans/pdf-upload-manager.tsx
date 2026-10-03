"use client";

import { useState, useTransition } from "react";
import {
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileWarning,
  Search,
} from "lucide-react";
import {
  matchLessonPlanFiles,
  applyLessonPlanUpdates,
  type MatchResult,
  type ApplyResult,
} from "@/lib/actions/lesson-plan-pdf";

export function PdfUploadManager() {
  const [isMatching, startMatching] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [files, setFiles] = useState<File[]>([]);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [equipmentDrafts, setEquipmentDrafts] = useState<Record<number, string>>({});
  const [applyResults, setApplyResults] = useState<ApplyResult[] | null>(null);

  function handleFilesSelected(fileList: FileList | null) {
    setFiles(fileList ? Array.from(fileList) : []);
    setMatches(null);
    setApplyResults(null);
  }

  function handleCheckMatches() {
    if (files.length === 0) return;

    startMatching(async () => {
      const results = await matchLessonPlanFiles(files.map((f) => f.name));
      setMatches(results);
      const drafts: Record<number, string> = {};
      results.forEach((r, i) => {
        if (r.status === "matched") drafts[i] = r.equipmentText ?? "";
      });
      setEquipmentDrafts(drafts);
      setApplyResults(null);
    });
  }

  function handleSaveAll() {
    if (!matches) return;

    const formData = new FormData();
    let count = 0;

    matches.forEach((m, i) => {
      if (m.status !== "matched" || !m.planId) return;
      formData.append(`file_${count}`, files[i]);
      formData.append(`planId_${count}`, m.planId);
      formData.append(`equipmentText_${count}`, equipmentDrafts[i] ?? "");
      count++;
    });
    formData.append("count", String(count));

    startSaving(async () => {
      const results = await applyLessonPlanUpdates(formData);
      setApplyResults(results);
    });
  }

  const matchedCount = matches?.filter((m) => m.status === "matched").length ?? 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-2 block">
            בחרו קבצי PDF של מערכים מעודכנים
          </span>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium"
          />
        </label>
        <p className="text-xs text-gray-500">
          שם הקובץ חייב להיות בפורמט &quot;מערך 1 - שם (וריאנט).pdf&quot; — המספר (ולפי הצורך
          הוריאנט בסוגריים) הם מה שמשמש להתאמה למערך הקיים במערכת.
        </p>
        <button
          type="button"
          onClick={handleCheckMatches}
          disabled={isMatching || files.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
        >
          <Search className="w-5 h-5" />
          {isMatching ? "בודק התאמה..." : "בדוק התאמה"}
        </button>
      </div>

      {matches && (
        <div className="space-y-4">
          {matches.map((m, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                {m.status === "matched" && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />}
                {m.status === "not_found" && <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                {m.status === "ambiguous" && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {(m.status === "invalid_name" || m.status === "error") && (
                  <FileWarning className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{m.fileName}</p>
                  <p className="text-gray-600">{m.message}</p>
                </div>
              </div>

              {m.status === "matched" && (
                <div>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700 mb-1 block">
                      רשימת ציוד נדרש (שורה לכל פריט, בפורמט &quot;כמות שם&quot;) — ערכו לפי הצורך
                    </span>
                    <textarea
                      value={equipmentDrafts[i] ?? ""}
                      onChange={(e) =>
                        setEquipmentDrafts((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      rows={5}
                      className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 font-mono"
                    />
                  </label>
                </div>
              )}
            </div>
          ))}

          {matchedCount > 0 && (
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
            >
              <UploadCloud className="w-5 h-5" />
              {isSaving ? "מעלה ומעדכן..." : `שמור והחלף במערכת (${matchedCount})`}
            </button>
          )}
        </div>
      )}

      {applyResults && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-2">תוצאות</h3>
          {applyResults.map((r, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              {r.status === "ok" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-900">{r.fileName}</p>
                <p className="text-gray-600">{r.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
