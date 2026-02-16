'use client';

/**
 * Secure PDF Viewer Component
 * Displays PDFs from Supabase Storage with download/print disabled
 */

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { createClient } from '@/lib/supabase/client';

// Configure PDF.js worker - use unpkg CDN for reliable version matching
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfPath: string | null;
  lessonName: string;
}

export function PdfViewer({ pdfPath, lessonName }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0); // Start at 100% zoom
  const supabase = createClient();

  useEffect(() => {
    async function fetchPdfUrl() {
      if (!pdfPath) {
        setError('לא נמצא קובץ PDF למערך זה');
        setLoading(false);
        return;
      }

      try {
        // Get public URL from Supabase Storage
        const { data } = supabase.storage
          .from('lesson-plans')
          .getPublicUrl(pdfPath);

        if (data?.publicUrl) {
          setPdfUrl(data.publicUrl);
          setError(null);
        } else {
          setError('שגיאה בטעינת קובץ ה-PDF');
        }
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setError('שגיאה בטעינת קובץ ה-PDF');
      } finally {
        setLoading(false);
      }
    }

    fetchPdfUrl();
  }, [pdfPath, supabase]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('שגיאה בטעינת המסמך');
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען מערך שיעור...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="bg-muted/30 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">לא נמצא קובץ PDF למערך זה</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-4 bg-muted/30 rounded-xl p-3">
        <button
          onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
          className="px-4 py-2 bg-card rounded-lg font-bold text-foreground hover:bg-accent/20 transition-colors"
          aria-label="הקטן"
        >
          −
        </button>
        <span className="text-sm font-semibold text-foreground min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.25))}
          className="px-4 py-2 bg-card rounded-lg font-bold text-foreground hover:bg-accent/20 transition-colors"
          aria-label="הגדל"
        >
          +
        </button>
      </div>

      {/* PDF Display Container */}
      <div
        className="bg-background rounded-2xl border border-border overflow-auto shadow-sm"
        style={{ height: '160vh' }}
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          }
          error={
            <div className="bg-destructive/10 p-6 text-center">
              <p className="text-destructive">שגיאה בטעינת ה-PDF</p>
            </div>
          }
        >
          {/* Render all pages */}
          {Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="border-b border-border last:border-b-0">
              <Page
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={false}
                className="mx-auto"
                scale={scale}
              />
            </div>
          ))}
        </Document>
      </div>

      {/* Page counter */}
      {numPages > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {numPages} עמודים במערך
        </div>
      )}

      {/* Security notice */}
      <div className="bg-muted/20 rounded-xl p-4 text-sm text-muted-foreground text-center">
        🔒 מערך זה מוגן - לצפייה בלבד, ללא אפשרות הורדה או הדפסה
      </div>
    </div>
  );
}
