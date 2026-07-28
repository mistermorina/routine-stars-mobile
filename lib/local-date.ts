import type { Schedule, Weekday } from "@/lib/types";

function padDatePart(value: number) {
  return value.toString().padStart(2, "0");
}

export function getLocalDateAtNoon(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function getLocalIsoDate(date = new Date()) {
  const localDate = getLocalDateAtNoon(date);
  const year = localDate.getFullYear();
  const month = padDatePart(localDate.getMonth() + 1);
  const day = padDatePart(localDate.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Weekday labels indexed by `Date.getDay()` — index 0 is Sunday.
 * This array is the ONLY place where the numeric JS weekday meets the stored
 * German label (see the weekday doc block in lib/types.ts).
 *
 * | index | 0  | 1  | 2  | 3  | 4  | 5  | 6  |
 * | label | So | Mo | Di | Mi | Do | Fr | Sa |
 */
const WEEKDAY_BY_DAY_INDEX: readonly Weekday[] = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

/** Monday-first order — the order a German parent expects to read. */
export const WEEKDAY_ORDER: readonly Weekday[] = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses "YYYY-MM-DD" into a LOCAL date at noon. `new Date("2026-07-28")`
 * would be parsed as UTC midnight and slide into the previous day west of
 * Greenwich, which is exactly the bug this whole module exists to avoid.
 * Anything unparseable falls back to today.
 */
function parseLocalIsoDate(isoDate?: string): Date {
  if (!isoDate) return getLocalDateAtNoon();

  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) return getLocalDateAtNoon();

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

/**
 * Weekday label for an ISO date (defaults to today), in the app's stored
 * convention. Use this instead of reading `Date.getDay()` at a call site.
 */
export function getLocalWeekday(isoDate?: string): Weekday {
  const dayIndex = parseLocalIsoDate(isoDate).getDay();
  return WEEKDAY_BY_DAY_INDEX[dayIndex] ?? "Mo";
}

/**
 * Pure "is this routine due on that day?" test. No schedule and an empty
 * weekday list both mean "every day" — a routine without a plan is always
 * offered rather than silently hidden.
 */
export function isRoutineDueOn(schedule: Schedule | null | undefined, isoDate?: string): boolean {
  const days = schedule?.days;
  if (!days || days.length === 0) return true;
  return days.includes(getLocalWeekday(isoDate));
}

/**
 * Human-readable weekday summary for parent-facing UI: "Mo Mi Fr",
 * or "Täglich" when every day (or no day at all) is selected.
 */
export function formatWeekdaySummary(days?: readonly Weekday[] | null): string {
  if (!days || days.length === 0) return "Täglich";

  const selected = WEEKDAY_ORDER.filter((weekday) => days.includes(weekday));
  if (selected.length === 0 || selected.length === WEEKDAY_ORDER.length) return "Täglich";

  return selected.join(" ");
}
