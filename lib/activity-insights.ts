import type { ActivityLog } from "@/lib/types";
import { getLocalDateAtNoon, getLocalIsoDate } from "@/lib/local-date";

const WEEKDAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WEEKDAY_SHORT = ["S", "M", "D", "M", "D", "F", "S"];
const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export interface DailySummary {
  date: string;
  totalStars: number;
  taskCount: number;
}

export interface WeeklyActivityItem {
  key: string;
  label: string;
  dateLabel: string;
  isToday: boolean;
  isActive: boolean;
  stars: number;
  taskCount: number;
}

export interface CalendarCell {
  key: string;
  day: number | null;
  date?: string;
  isToday: boolean;
  isFuture: boolean;
  isActive: boolean;
  stars: number;
  taskCount: number;
}

export interface ActivityInsights {
  summaries: DailySummary[];
  totalStars: number;
  totalActivities: number;
  activeDays: number;
  currentStreak: number;
  bestDay: DailySummary | null;
  weeklyItems: WeeklyActivityItem[];
  calendarRows: CalendarCell[][];
  monthlyActiveDays: number;
  monthlyStars: number;
  monthlyCompletionRate: number;
  monthLabel: string;
}

function toLocalDate(date: Date) {
  return getLocalDateAtNoon(date);
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function formatIsoDate(date: Date) {
  return getLocalIsoDate(date);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function buildDailySummaries(logs: ActivityLog[]) {
  const grouped = new Map<string, DailySummary>();

  logs.forEach((log) => {
    const existing = grouped.get(log.date);
    if (existing) {
      existing.totalStars += log.stars;
      existing.taskCount += 1;
      return;
    }

    grouped.set(log.date, {
      date: log.date,
      totalStars: log.stars,
      taskCount: 1,
    });
  });

  return Array.from(grouped.values()).sort((left, right) =>
    left.date.localeCompare(right.date)
  );
}

function getStreakFromSummaries(summaries: DailySummary[], today: string) {
  if (summaries.length === 0) return 0;

  const activeDays = new Set(summaries.map((item) => item.date));
  const cursor = parseDate(today);

  // Grace rule: when today has no activity yet, anchor on yesterday instead.
  if (!activeDays.has(formatIsoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);

    if (!activeDays.has(formatIsoDate(cursor))) {
      return 0;
    }
  }

  let streak = 0;

  // The set is finite and the cursor strictly decreases, so this always ends.
  while (activeDays.has(formatIsoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Consecutive active days, anchored at the local calendar day — not at the last
 * log in the list.
 *
 * Grace rule: a streak may end **today** or **yesterday**.
 * - Activity today → the streak is counted backwards starting at today.
 * - No activity today but activity yesterday → the streak still shows, so the
 *   child does not appear to lose it before the day is over.
 * - Last activity older than yesterday → the streak is broken and this is `0`.
 *
 * Days are compared on the device's local calendar (noon-anchored, so DST
 * shifts cannot swallow a day), never in UTC. Future-dated logs are ignored.
 * Multiple logs on the same day count as one day.
 *
 * Pure function — pass `today` (`YYYY-MM-DD`) to make it deterministic in tests.
 */
export function getCurrentStreak(
  logs: ActivityLog[],
  today: string = getLocalIsoDate()
) {
  return getStreakFromSummaries(buildDailySummaries(logs), today);
}

function buildWeeklyItems(summaryMap: Map<string, DailySummary>) {
  const today = toLocalDate(new Date());
  const items: WeeklyActivityItem[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const isoDate = formatIsoDate(date);
    const summary = summaryMap.get(isoDate);

    items.push({
      key: isoDate,
      label: WEEKDAY_SHORT[date.getDay()],
      dateLabel: `${date.getDate()}`,
      isToday: offset === 0,
      isActive: Boolean(summary),
      stars: summary?.totalStars ?? 0,
      taskCount: summary?.taskCount ?? 0,
    });
  }

  return items;
}

function buildCalendarRows(
  summaryMap: Map<string, DailySummary>,
  currentYear: number,
  currentMonth: number
) {
  const today = toLocalDate(new Date());
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    cells.push({
      key: `empty-leading-${i}`,
      day: null,
      isToday: false,
      isFuture: false,
      isActive: false,
      stars: 0,
      taskCount: 0,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(currentYear, currentMonth, day, 12);
    const isoDate = formatIsoDate(date);
    const summary = summaryMap.get(isoDate);
    const isFuture = date.getTime() > today.getTime();

    cells.push({
      key: isoDate,
      day,
      date: isoDate,
      isToday:
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear(),
      isFuture,
      isActive: Boolean(summary),
      stars: summary?.totalStars ?? 0,
      taskCount: summary?.taskCount ?? 0,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      key: `empty-trailing-${cells.length}`,
      day: null,
      isToday: false,
      isFuture: false,
      isActive: false,
      stars: 0,
      taskCount: 0,
    });
  }

  return Array.from({ length: cells.length / 7 }).map((_, rowIndex) =>
    cells.slice(rowIndex * 7, rowIndex * 7 + 7)
  );
}

export function formatFriendlyDate(dateString: string) {
  const date = parseDate(dateString);
  return `${WEEKDAY_LABELS[date.getDay()]}, ${date.getDate()}. ${MONTH_NAMES[date.getMonth()]}`;
}

export function getActivityInsights(
  logs: ActivityLog[],
  currentYear = new Date().getFullYear(),
  currentMonth = new Date().getMonth()
): ActivityInsights {
  const summaries = buildDailySummaries(logs);
  const summaryMap = new Map(summaries.map((item) => [item.date, item]));
  const today = toLocalDate(new Date());
  const monthSummaries = summaries.filter((item) => {
    const date = parseDate(item.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });

  const totalStars = summaries.reduce((sum, item) => sum + item.totalStars, 0);
  const totalActivities = logs.length;
  const activeDays = summaries.length;
  const currentStreak = getStreakFromSummaries(summaries, formatIsoDate(today));
  const bestDay =
    summaries.length > 0
      ? [...summaries].sort((left, right) => right.totalStars - left.totalStars)[0]
      : null;
  const weeklyItems = buildWeeklyItems(summaryMap);
  const calendarRows = buildCalendarRows(summaryMap, currentYear, currentMonth);
  const monthlyActiveDays = monthSummaries.length;
  const monthlyStars = monthSummaries.reduce((sum, item) => sum + item.totalStars, 0);
  const elapsedDays =
    currentYear === today.getFullYear() && currentMonth === today.getMonth()
      ? today.getDate()
      : getDaysInMonth(currentYear, currentMonth);
  const monthlyCompletionRate =
    elapsedDays > 0 ? Math.round((monthlyActiveDays / elapsedDays) * 100) : 0;

  return {
    summaries,
    totalStars,
    totalActivities,
    activeDays,
    currentStreak,
    bestDay,
    weeklyItems,
    calendarRows,
    monthlyActiveDays,
    monthlyStars,
    monthlyCompletionRate,
    monthLabel: `${MONTH_NAMES[currentMonth]} ${currentYear}`,
  };
}
