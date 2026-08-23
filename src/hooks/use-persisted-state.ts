"use client";

import { useEffect, useState } from "react";

// Keeps filter/sort UI state in localStorage so it survives switching tabs (which unmounts
// the tab's component) and navigating away and back — not just router.refresh(), which
// already preserves in-memory state on its own.
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch {
      // ignore — falls back to defaultValue
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore — e.g. private browsing with storage disabled
    }
  }, [key, value]);

  return [value, setValue] as const;
}
