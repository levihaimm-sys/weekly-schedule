import { DAYS_HEBREW, TIME_PERIODS, type TimePeriod } from "./constants";
import type { StaffingInstructor, StaffingCandidate, StaffingClient } from "@/types/staffing";

export function dayLabel(day: number | null | undefined): string {
  if (day === null || day === undefined) return "גמיש (יום לא נקבע)";
  return DAYS_HEBREW[day] ?? "-";
}

export function timePeriodLabel(period: string | null | undefined): string {
  if (!period) return "-";
  return TIME_PERIODS[period as TimePeriod] ?? period;
}

export function personLabel(
  instructorId: string | null,
  candidateId: string | null,
  instructors: StaffingInstructor[],
  candidates: StaffingCandidate[]
): string {
  if (instructorId) {
    const i = instructors.find((x) => x.id === instructorId);
    return i ? i.full_name : "מדריך לא ידוע";
  }
  if (candidateId) {
    const c = candidates.find((x) => x.id === candidateId);
    return c ? `${c.first_name} ${c.last_name} (מועמד)` : "מועמד לא ידוע";
  }
  return "-";
}

export function clientLabel(
  need: { client_id: string | null; client_name_override: string | null },
  clients: StaffingClient[]
): string {
  if (need.client_name_override) return need.client_name_override;
  const c = clients.find((x) => x.id === need.client_id);
  return c ? c.name : "לקוח לא ידוע";
}
