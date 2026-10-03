"use client";

import { useEffect, useState } from "react";

// Personal warehouse checklist — stored only in this browser (localStorage).
export function CollectedCheckbox({
  weekStartDate,
  instructorId,
}: {
  weekStartDate: string;
  instructorId: string;
}) {
  const key = `equipment-collected:${weekStartDate}:${instructorId}`;
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      setChecked(localStorage.getItem(key) === "1");
    } catch {}
  }, [key]);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    try {
      if (next) localStorage.setItem(key, "1");
      else localStorage.removeItem(key);
    } catch {}
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={toggle}
      aria-label="נאסף"
      className="h-5 w-5 cursor-pointer accent-green-600"
    />
  );
}
