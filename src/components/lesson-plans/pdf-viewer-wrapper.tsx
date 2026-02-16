'use client';

/**
 * Client Component wrapper for PdfViewer
 * This allows us to use dynamic import with ssr: false
 */

import dynamic from 'next/dynamic';

// Dynamically import PdfViewer to avoid SSR issues
const PdfViewer = dynamic(
  () => import('./pdf-viewer').then((mod) => mod.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">טוען מערך שיעור...</p>
        </div>
      </div>
    ),
  }
);

interface PdfViewerWrapperProps {
  pdfPath: string | null;
  lessonName: string;
}

export function PdfViewerWrapper({ pdfPath, lessonName }: PdfViewerWrapperProps) {
  return <PdfViewer pdfPath={pdfPath} lessonName={lessonName} />;
}
