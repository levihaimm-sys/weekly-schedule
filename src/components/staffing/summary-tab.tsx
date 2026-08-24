"use client";

import { useMemo } from "react";
import type { StaffingNeed } from "@/types/database";

const NOT_SPECIFIED = "לא צוין";

export function SummaryTab({ needs }: { needs: StaffingNeed[] }) {
  const { regions, fields, cellTotals, regionTotals, fieldTotals, grandTotal } = useMemo(() => {
    const regionsSet = new Set<string>();
    const fieldsSet = new Set<string>();
    const cell = new Map<string, number>(); // key: `${region}||${field}`
    const regionTotal = new Map<string, number>();
    const fieldTotal = new Map<string, number>();
    let grand = 0;

    for (const n of needs) {
      const region = n.region?.trim() || NOT_SPECIFIED;
      const field = n.field?.trim() || NOT_SPECIFIED;
      const count = n.lessons_count;

      regionsSet.add(region);
      fieldsSet.add(field);

      const key = `${region}||${field}`;
      cell.set(key, (cell.get(key) ?? 0) + count);
      regionTotal.set(region, (regionTotal.get(region) ?? 0) + count);
      fieldTotal.set(field, (fieldTotal.get(field) ?? 0) + count);
      grand += count;
    }

    const sortHe = (a: string, b: string) => {
      if (a === NOT_SPECIFIED) return 1;
      if (b === NOT_SPECIFIED) return -1;
      return a.localeCompare(b, "he");
    };

    return {
      regions: Array.from(regionsSet).sort(sortHe),
      fields: Array.from(fieldsSet).sort(sortHe),
      cellTotals: cell,
      regionTotals: regionTotal,
      fieldTotals: fieldTotal,
      grandTotal: grand,
    };
  }, [needs]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        סה&quot;כ {grandTotal} שיעורים נדרשים, ב-{regions.length} ישובים, ב-{fields.length} תחומים
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-right text-xs font-medium text-muted-foreground">
              <th className="px-3 py-2.5 whitespace-nowrap">ישוב</th>
              {fields.map((f) => (
                <th key={f} className="px-3 py-2.5 text-center whitespace-nowrap">
                  {f}
                </th>
              ))}
              <th className="px-3 py-2.5 text-center whitespace-nowrap font-bold">סה&quot;כ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {regions.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 2} className="py-10 text-center text-muted-foreground">
                  אין שיעורים נדרשים במערכת
                </td>
              </tr>
            ) : (
              regions.map((region) => (
                <tr key={region}>
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{region}</td>
                  {fields.map((f) => {
                    const value = cellTotals.get(`${region}||${f}`) ?? 0;
                    return (
                      <td key={f} className="px-3 py-2.5 text-center text-muted-foreground">
                        {value > 0 ? value : "—"}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center font-bold">{regionTotals.get(region)}</td>
                </tr>
              ))
            )}
          </tbody>
          {regions.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/40 font-bold">
                <td className="px-3 py-2.5 whitespace-nowrap">סה&quot;כ</td>
                {fields.map((f) => (
                  <td key={f} className="px-3 py-2.5 text-center">
                    {fieldTotals.get(f)}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-center">{grandTotal}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
