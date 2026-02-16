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
