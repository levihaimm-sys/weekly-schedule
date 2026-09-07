import { startOfWeek, endOfWeek, format, addDays } from "date-fns";
import { he } from "date-fns/locale";

/**
 * Get today's date in Israel timezone (Asia/Jerusalem)
 * Returns the date string in YYYY-MM-DD format
 */
export function getTodayInIsrael(): string {
  // Use en-CA locale which returns YYYY-MM-DD format
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
}

/**
 * Get current Date object in Israel timezone
 */
export function getNowInIsrael(): Date {
  // Get current time in Israel timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value || '2024';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';
  const second = parts.find(p => p.type === 'second')?.value || '00';
  
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 0 }); // Sunday
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 0 });
}

export function getWeekDates(date: Date = new Date()): Date[] {
  const start = getWeekStart(date);
  return Array.from({ length: 6 }, (_, i) => addDays(start, i)); // Sun-Fri
}

export function formatDateHebrew(date: Date): string {
  return format(date, "EEEE, d בMMMM yyyy", { locale: he });
}

export function formatDateShort(date: Date): string {
  return format(date, "dd/MM/yyyy");
}

export function formatTime(time: string): string {
  // "14:40:00" -> "14:40"
  return time.slice(0, 5);
}

export function getDayIndex(date: Date): number {
  return date.getDay(); // 0 = Sunday
}

// need.start_time is when the FIRST of possibly several back-to-back lessons starts (e.g. 3
// lessons of 40 min starting at 13:00 → 13:00, 13:40, 14:20) — this computes slot N's start.
export function addMinutesToTimeString(time: string, minutesToAdd: number): string {
  const [h, m, s] = time.split(":").map(Number);
  const total = (h * 60 + m + minutesToAdd + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${String(s ?? 0).padStart(2, "0")}`;
}

/**
 * School holiday dates (no lessons) through the end of the 2026-2027 school year.
 * Auto-replication (ensureFutureWeeks / replicateWeekSchedule / syncFutureWeeksWithRecurring)
 * skips these dates instead of generating lessons from the recurring schedule.
 */
export const HOLIDAY_DATES = new Set([
  "2026-09-13", // ראש השנה
  "2026-09-20", "2026-09-21", // יום כיפור
  "2026-09-22", "2026-09-23", "2026-09-24", // בין יום כיפור לסוכות
  "2026-09-27", "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", // סוכות (כולל חול המועד)
  "2026-12-06", "2026-12-07", "2026-12-08", "2026-12-09", "2026-12-10", // חנוכה
  "2027-03-23", "2027-03-24", // פורים
  "2027-04-13", "2027-04-14", "2027-04-15", "2027-04-18", "2027-04-19", "2027-04-20", "2027-04-21", "2027-04-22", "2027-04-25", "2027-04-26", "2027-04-27", "2027-04-28", // פסח (כולל חול המועד)
  "2027-05-12", // יום העצמאות
  "2027-06-10", // שבועות
]);

export function isHoliday(dateStr: string): boolean {
  return HOLIDAY_DATES.has(dateStr);
}

/**
 * Smart sort: time ascending, group consecutive lessons by the same instructor.
 * For each instructor, their block starts at their earliest lesson time.
 */
export function smartSortLessons<
  T extends {
    start_time: string;
    instructor?: { id: string } | null;
  },
>(lessons: T[]): T[] {
  if (lessons.length <= 1) return lessons;

  // Find earliest time per instructor
  const earliestByInstructor = new Map<string, string>();
  for (const l of lessons) {
    const key = l.instructor?.id ?? "__none__";
    const current = earliestByInstructor.get(key);
    if (!current || l.start_time < current) {
      earliestByInstructor.set(key, l.start_time);
    }
  }

  return [...lessons].sort((a, b) => {
    const aKey = a.instructor?.id ?? "__none__";
    const bKey = b.instructor?.id ?? "__none__";
    const aGroupTime = earliestByInstructor.get(aKey)!;
    const bGroupTime = earliestByInstructor.get(bKey)!;

    // Sort by instructor group's earliest time
    if (aGroupTime !== bGroupTime) return aGroupTime < bGroupTime ? -1 : 1;
    // Within same group time, keep same instructor together
    if (aKey !== bKey) return aKey < bKey ? -1 : 1;
    // Within same instructor, sort by time
    return a.start_time < b.start_time ? -1 : a.start_time > b.start_time ? 1 : 0;
  });
}
