/** Calendar-date helpers using plain YYYY-MM-DD strings (no timezone drift). */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => n.toString().padStart(2, '0');

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

export function parseISODate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const y = +match[1];
  const m = +match[2];
  const d = +match[3];
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function isValidISODate(iso: string): boolean {
  return parseISODate(iso) !== null;
}

/** m is 1-12 */
export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/** 0 = Sunday. m is 1-12 */
export function weekdayOfFirst(y: number, m: number): number {
  return new Date(y, m - 1, 1).getDay();
}

export function makeISO(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** "2026-11-24" -> "Nov 24, 2026" */
export function formatDateLong(iso: string): string {
  const p = parseISODate(iso);
  return p ? `${MONTHS[p.m - 1]} ${p.d}, ${p.y}` : iso;
}

/** "18:18" -> "6:18 PM" */
export function formatTime12(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return hhmm;
  const h = +match[1];
  return `${h % 12 === 0 ? 12 : h % 12}:${match[2]} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function timeNowHHmm(now: Date = new Date()): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function addDaysISO(iso: string, delta: number): string {
  const p = parseISODate(iso);
  if (!p) return iso;
  return toISODate(new Date(p.y, p.m - 1, p.d + delta));
}

/** "Today, 10:42 AM" | "Yesterday, 6:18 PM" | "Nov 22, 2026" */
export function activityLabel(date: string, time: string | undefined, now: Date = new Date()): string {
  const today = todayISO(now);
  const t = time ? `, ${formatTime12(time)}` : '';
  if (date === today) return `Today${t}`;
  if (date === addDaysISO(today, -1)) return `Yesterday${t}`;
  return formatDateLong(date);
}
