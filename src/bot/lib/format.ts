const TZ = "Asia/Jerusalem";

// "היום 08:02", "אתמול 21:15", or "12/11 08:02".
export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  const day = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: TZ });
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);
  if (day(d) === day(now)) return `היום ${time}`;
  if (day(d) === day(yesterday)) return `אתמול ${time}`;
  const date = d.toLocaleDateString("he-IL", { timeZone: TZ, day: "numeric", month: "numeric" });
  return `${date} ${time}`;
}

// Compact form for lists: "08:02", "אתמול", "12/11".
export function shortWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: TZ });
  const now = new Date();
  if (day(d) === day(now)) return d.toLocaleTimeString("he-IL", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  if (day(d) === day(new Date(now.getTime() - 86_400_000))) return "אתמול";
  return d.toLocaleDateString("he-IL", { timeZone: TZ, day: "numeric", month: "numeric" });
}

// "לפני 20 דק'", "לפני 3 שעות", "אתמול 14:05", "12/11 14:05".
export function ago(iso: string | null | undefined): string {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "עכשיו";
  if (min < 60) return `לפני ${min} דק'`;
  if (min < 6 * 60) return `לפני ${Math.floor(min / 60) === 1 ? "שעה" : `${Math.floor(min / 60)} שעות`}`;
  return formatWhen(iso);
}

// Israel calendar day (YYYY-MM-DD) of a time, and of today + n days.
export function israelDay(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
}
export function israelDayFromToday(n: number): string {
  return israelDay(new Date(Date.now() + n * 86_400_000));
}

// A day only: "מחר", "ביום ראשון 30/11".
export function formatDay(iso: string): string {
  const day = israelDay(iso);
  if (day === israelDayFromToday(0)) return "היום";
  if (day === israelDayFromToday(1)) return "מחר";
  const d = new Date(iso);
  const wd = d.toLocaleDateString("he-IL", { timeZone: TZ, weekday: "long" });
  const date = d.toLocaleDateString("he-IL", { timeZone: TZ, day: "numeric", month: "numeric" });
  return `ב${wd} ${date}`;
}

// "יום חמישי, 27 בנובמבר"
export function longToday(): string {
  return new Date().toLocaleDateString("he-IL", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
}

export const KIND_LABELS: Record<string, string> = {
  voice: "🎤 הודעה קולית",
  image: "📷 תמונה",
  video: "🎬 סרטון",
  document: "📄 קובץ",
  sticker: "מדבקה",
  audio: "🎵 קובץ שמע",
  contact: "👤 איש קשר",
  location: "📍 מיקום",
  poll: "📊 סקר",
  deleted: "ההודעה נמחקה",
};

export function minutesAgo(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}

export const ACCOUNT_LABELS: Record<string, string> = {
  personal: "פרטי",
  business: "עסקי",
};
