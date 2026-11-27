const TZ = "Asia/Jerusalem";

// Working hours of the nonprofit, Israel time: Sun-Thu 08-20, Fri 08-13.
// 0 = Sunday.
const HOURS: Record<number, [number, number] | null> = {
  0: [8, 20],
  1: [8, 20],
  2: [8, 20],
  3: [8, 20],
  4: [8, 20],
  5: [8, 13],
  6: null,
};

const STEP_MS = 15 * 60_000;
const MAX_STEPS = 60 * 24 * 4; // 60 days

function israelDayHour(d: Date): { day: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short", hour: "2-digit", hour12: false }).formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd), hour };
}

// Working hours that passed between `fromIso` and now.
export function workingHoursSince(fromIso: string, now = new Date()): number {
  let t = new Date(fromIso).getTime();
  const end = now.getTime();
  let ms = 0;
  for (let i = 0; t < end && i < MAX_STEPS; i++, t += STEP_MS) {
    const { day, hour } = israelDayHour(new Date(t));
    const h = HOURS[day];
    if (h && hour >= h[0] && hour < h[1]) ms += Math.min(STEP_MS, end - t);
  }
  return ms / 3_600_000;
}

// 00:00 today, Israel time (the server itself runs in UTC).
export function israelStartOfDay(now = new Date()): Date {
  const day = now.toLocaleDateString("en-CA", { timeZone: TZ });
  const guess = new Date(`${day}T00:00:00Z`);
  const off = Number(guess.toLocaleString("en-US", { timeZone: TZ, timeZoneName: "shortOffset" }).match(/GMT([+-]\d+)/)?.[1] ?? 2);
  return new Date(guess.getTime() - off * 3_600_000);
}

// "20 דקות", "3 שעות", "יומיים", "5 ימים" (calendar time, for display).
export function waitingLabel(fromIso: string, now = new Date()): string {
  const min = Math.max(0, Math.floor((now.getTime() - new Date(fromIso).getTime()) / 60_000));
  if (min < 60) return `${min} דקות`;
  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? "שעה" : h === 2 ? "שעתיים" : `${h} שעות`;
  const d = Math.floor(h / 24);
  return d === 1 ? "יום" : d === 2 ? "יומיים" : `${d} ימים`;
}
