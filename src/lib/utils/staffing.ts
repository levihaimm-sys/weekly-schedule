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
