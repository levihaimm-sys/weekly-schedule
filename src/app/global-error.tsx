"use client";

import { useEffect } from "react";

const RELOAD_KEY = "global-error-reloaded-at";

// Last-resort boundary: instead of a blank "Application error" screen,
// reload once (fixes stale-deployment chunk errors), then offer a retry.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last > 30_000) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          fontFamily: "sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 18 }}>משהו השתבש בטעינת הדף</p>
        <button
          onClick={() => {
            reset();
            window.location.reload();
          }}
          style={{
            background: "#A3BA8F",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "12px 24px",
            fontSize: 16,
          }}
        >
          נסה שוב
        </button>
      </body>
    </html>
  );
}
