import { DAYS_HEBREW, TIME_PERIODS, type TimePeriod } from "./constants";

export function dayLabel(day: number | null | undefined): string {
  if (day === null || day === undefined) return "גמיש (יום לא נקבע)";
  return DAYS_HEBREW[day] ?? "-";
}

export function timePeriodLabel(period: string | null | undefined): string {
  if (!period) return "-";
  return TIME_PERIODS[period as TimePeriod] ?? period;
}

export function regionsMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return true;
  return a.includes(b) || b.includes(a);
}

// Instructor names are typed freely (e.g. "טל" vs. the availability row's "טל שומרת"), so
// linking logic tolerates one name being a substring of the other rather than requiring
// an exact match.
export function nameMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const x = a.trim();
  const y = b.trim();
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

// staffing_needs.start_date is a free-text field (no input mask), so parsing tolerates the
// same shapes admins actually type: ISO, or d/m/yyyy with '/', '.', or '-' separators and a
// 2- or 4-digit year.
export function parseFreeTextDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const clean = raw.trim();
  if (!clean) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const dmy = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/.exec(clean);
  if (dmy) {
    const year = dmy[3].length === 2 ? 2000 + parseInt(dmy[3]) : parseInt(dmy[3]);
    const d = new Date(year, Number(dmy[2]) - 1, Number(dmy[1]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}
