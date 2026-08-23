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
