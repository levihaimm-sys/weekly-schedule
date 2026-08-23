import { DAYS_HEBREW, TIME_PERIODS, type TimePeriod } from "./constants";

export function dayLabel(day: number | null | undefined): string {
  if (day === null || day === undefined) return "גמיש (יום לא נקבע)";
  return DAYS_HEBREW[day] ?? "-";
}

export function timePeriodLabel(period: string | null | undefined): string {
  if (!period) return "-";
  return TIME_PERIODS[period as TimePeriod] ?? period;
}
