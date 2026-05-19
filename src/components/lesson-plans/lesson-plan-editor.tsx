"use client";

import { useState, useTransition, useRef } from "react";
import { Save, Eye, Music, FileText, Upload, Trash2, CheckCircle } from "lucide-react";
import type { LessonPlan } from "@/types/database";

interface LessonPlanEditorProps {
  lessonPlan: LessonPlan;
  equipment: Array<{
    equipment_name: string;
    quantity: number;
    equipment_type: string;
  }>;
}

export function LessonPlanEditor({
  lessonPlan,
  equipment,
}: LessonPlanEditorProps) {
  const [content, setContent] = useState(lessonPlan.content || "");
  const [playlistUrl, setPlaylistUrl] = useState(lessonPlan.playlist_url || "");
  const [notes, setNotes] = useState(lessonPlan.notes || "");
  const [showPreview, setShowPreview] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pdfPath, setPdfPath] = useState<string | null>(lessonPlan.pdf_path || null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    startTransition(async () => {
      const response = await fetch("/api/lesson-plans/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lessonPlan.id,
          content,
          playlist_url: playlistUrl,
          notes,
        }),
      });

      if (response.ok) {
        alert("המערך נשמר בהצלחה!");
      } else {
        alert("שגיאה בשמירת המערך");
      }
    });
  };

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    setPdfError(null);
    const form = new FormData();
    form.append("pdf", file);
    const res = await fetch(`/api/lesson-plans/${lessonPlan.id}/pdf`, {
      method: "POST",
      body: form,
    });
    setPdfUploading(false);
    if (res.ok) {
      const data = await res.json();
      setPdfPath(data.pdf_path);
    } else {
      const data = await res.json().catch(() => ({}));
      setPdfError(data.error || "שגיאה בהעלאת ה-PDF");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePdfDelete() {
    if (!confirm("למחוק את ה-PDF?")) return;
    const res = await fetch(`/api/lesson-plans/${lessonPlan.id}/pdf`, { method: "DELETE" });
    if (res.ok) setPdfPath(null);
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          מידע על המערך
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">שם:</span> {lessonPlan.name}
          </div>
          <div>
            <span className="text-blue-700">שבוע:</span> {lessonPlan.week_number}
          </div>
          <div>
            <span className="text-blue-700">קטגוריה:</span> {lessonPlan.category}
          </div>
          <div>
            <span className="text-blue-700">פריטי ציוד:</span> {equipment.length}
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">ציוד למערך</h3>
        {equipment.length > 0 ? (
          <ul className="space-y-2">
            {equipment.map((item, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className="font-semibold">{item.quantity}</span>
                <span>{item.equipment_name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">אין ציוד רשום</p>
        )}
      </div>

      {/* PDF Upload */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
          <FileText className="w-5 h-5 text-red-600" />
          קובץ PDF
        </h3>
        {pdfPath ? (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-sm text-gray-700 flex-1">{pdfPath}</span>
            <button
              type="button"
              onClick={handlePdfDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              מחק
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4" />
              החלף
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-600">אין PDF — המדריכים לא יראו תוכן</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfUploading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {pdfUploading ? "מעלה..." : "העלה PDF"}
            </button>
          </div>
        )}
        {pdfError && <p className="mt-2 text-sm text-red-600">{pdfError}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
      </div>

      {/* Playlist URL */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
          <Music className="w-5 h-5 text-purple-600" />
          קישור לרשימת השמעה
        </label>
        <input
          type="url"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://hspisrael.wixsite.com/newbuli/music"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          קישור לעמוד המוזיקה בוויקס - יוצג למדריכים ככפתור "מוזיקה"
        </p>
      </div>

      {/* Content Editor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 font-semibold text-gray-900">
            <FileText className="w-5 h-5 text-blue-600" />
            תוכן המערך
          </label>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "עריכה" : "תצוגה מקדימה"}
          </button>
        </div>

        {showPreview ? (
          <div
            className="prose prose-sm max-w-none p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="הכנס כאן את תוכן המערך...&#10;&#10;אפשר להשתמש ב-HTML בסיסי:&#10;<h2>כותרת</h2>&#10;<p>פסקה</p>&#10;<ul><li>פריט ברשימה</li></ul>&#10;<strong>מודגש</strong>&#10;<em>נטוי</em>"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}

        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p><strong>טיפים:</strong></p>
          <p>• <code>&lt;h2&gt;כותרת&lt;/h2&gt;</code> - כותרת</p>
          <p>• <code>&lt;p&gt;טקסט&lt;/p&gt;</code> - פסקה</p>
          <p>• <code>&lt;ul&gt;&lt;li&gt;פריט&lt;/li&gt;&lt;/ul&gt;</code> - רשימה</p>
          <p>• <code>&lt;strong&gt;מודגש&lt;/strong&gt;</code> - מודגש</p>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="font-semibold text-gray-900 mb-3 block">
          הערות (אופציונלי)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="הערות כלליות למערך..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          <Save className="w-5 h-5" />
          {isPending ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
}
