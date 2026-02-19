"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter, FileText } from "lucide-react";
import { useState } from "react";

interface ConfirmLessonsFiltersProps {
  cities: string[];
  gardens: string[];
  currentFilters: {
    garden?: string;
    city?: string;
    date?: string;
  };
}

export function ConfirmLessonsFilters({
  cities,
  gardens,
  currentFilters,
}: ConfirmLessonsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(
    !!(currentFilters.garden || currentFilters.city || currentFilters.date)
  );

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/confirm-lessons?${params.toString()}`);
  }

  function clearAllFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("garden");
    params.delete("city");
    params.delete("date");
    router.push(`/confirm-lessons?${params.toString()}`);
    setShowFilters(false);
  }

  function handlePrintReport() {
    window.print();
  }

  const hasActiveFilters = !!(
    currentFilters.garden ||
    currentFilters.city ||
    currentFilters.date
  );

  return (
    <div className="space-y-3">
      {/* Filter toggle and report button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "border-secondary bg-secondary/10 text-[#1C1917]"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          <Filter size={16} />
          סינון
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs text-[#1C1917]">
              {[
                currentFilters.garden,
                currentFilters.city,
                currentFilters.date,
              ].filter(Boolean).length}
            </span>
          )}
        </button>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted print:hidden"
        >
          <FileText size={16} />
          הפק דוח
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            title="נקה סינונים"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Garden filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                שם גן
              </label>
              <select
                value={currentFilters.garden ?? ""}
                onChange={(e) => updateFilter("garden", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">כל הגנים</option>
                {gardens.map((garden) => (
                  <option key={garden} value={garden}>
                    {garden}
                  </option>
                ))}
              </select>
            </div>

            {/* City filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                עיר
              </label>
              <select
                value={currentFilters.city ?? ""}
                onChange={(e) => updateFilter("city", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">כל הערים</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                תאריך ספציפי
              </label>
              <input
                type="date"
                value={currentFilters.date ?? ""}
                onChange={(e) => updateFilter("date", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
