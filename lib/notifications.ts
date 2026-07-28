import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { WEEKDAY_ORDER, formatWeekdaySummary } from "@/lib/local-date";
import { KEYS, storage } from "@/lib/storage";
import type { NotificationSettings, Routine, Weekday } from "@/lib/types";

/* ================================================================== *
 * Local routine reminders.
 *
 * Everything here is LOCAL scheduling — no push server, no token, no
 * network. One weekly repeating notification per (routine × weekday),
 * rebuilt from scratch whenever routines change.
 *
 * Contract for callers: no function in this module ever throws and no
 * function ever prompts for permission behind the user's back. Failures
 * come back as a `status` field. `ensurePermissions()` is the only
 * function that may show the system dialog, and only from a user tap.
 * ================================================================== */

/* ------------------------------------------------------------------ *
 * Weekday mapping — the one conversion table.
 *
 * | Routine.schedule.days | JS Date.getDay() | expo/iOS weekday |
 * |-----------------------|------------------|------------------|
 * | "So"                  | 0                | 1  (Sunday)      |
 * | "Mo"                  | 1                | 2  (Monday)      |
 * | "Di"                  | 2                | 3  (Tuesday)     |
 * | "Mi"                  | 3                | 4  (Wednesday)   |
 * | "Do"                  | 4                | 5  (Thursday)    |
 * | "Fr"                  | 5                | 6  (Friday)      |
 * | "Sa"                  | 6                | 7  (Saturday)    |
 *
 * Invariants (asserted by `assertWeekdayMapping()` below, which runs in
 * __DEV__ so a wrong edit trips on the first app start, not on a Monday
 * morning that stays silent):
 *   expoWeekday === jsDay + 1
 *   1 <= expoWeekday <= 7   (expo throws a RangeError outside that)
 * The off-by-one is real: iOS `UNCalendarNotificationTrigger` counts
 * Sunday as 1, JavaScript counts Sunday as 0.
 * ------------------------------------------------------------------ */
const EXPO_WEEKDAY_BY_LABEL: Record<Weekday, number> = {
  So: 1,
  Mo: 2,
  Di: 3,
  Mi: 4,
  Do: 5,
  Fr: 6,
  Sa: 7,
};

const LABEL_BY_EXPO_WEEKDAY: Record<number, Weekday> = {
  1: "So",
  2: "Mo",
  3: "Di",
  4: "Mi",
  5: "Do",
  6: "Fr",
  7: "Sa",
};

function toExpoWeekday(weekday: Weekday): number {
  return EXPO_WEEKDAY_BY_LABEL[weekday];
}

function fromExpoWeekday(weekday: number | undefined): Weekday | null {
  if (weekday === undefined) return null;
  return LABEL_BY_EXPO_WEEKDAY[weekday] ?? null;
}

function assertWeekdayMapping() {
  // JS weekday order, index === Date.getDay().
  const jsOrder: Weekday[] = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  jsOrder.forEach((label, jsDay) => {
    const expoWeekday = toExpoWeekday(label);
    if (expoWeekday !== jsDay + 1) {
      console.error(
        `Weekday mapping broken: ${label} maps to ${expoWeekday}, expected ${jsDay + 1}.`
      );
    }
    if (fromExpoWeekday(expoWeekday) !== label) {
      console.error(`Weekday mapping is not reversible for ${label}.`);
    }
  });
}

if (__DEV__) {
  assertWeekdayMapping();
}

/* ------------------------------------------------------------------ *
 * Identifiers
 *
 * Routine reminders own the "routine-" prefix; `cancelAllRoutineReminders`
 * cancels exactly those and leaves anything else on the system queue
 * alone. The test notification deliberately uses a different prefix so a
 * sync cannot swallow it mid-flight.
 * ------------------------------------------------------------------ */
const REMINDER_IDENTIFIER_PREFIX = "routine-";
const TEST_IDENTIFIER_PREFIX = "test-reminder-";
const REMINDER_DATA_KIND = "routine-reminder";

function buildReminderIdentifier(routineId: string, weekday: Weekday): string {
  return `${REMINDER_IDENTIFIER_PREFIX}${routineId}-${weekday}`;
}

/* ------------------------------------------------------------------ *
 * Foreground presentation
 *
 * Without a handler iOS silently drops a notification that arrives while
 * the app is in the foreground — which is exactly the case a parent hits
 * when testing from the settings screen. Registered at module scope so
 * it is in place before any notification can land.
 * ------------------------------------------------------------------ */
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/* ------------------------------------------------------------------ *
 * Permissions
 * ------------------------------------------------------------------ */
export type PermissionState = "granted" | "denied" | "undetermined" | "unsupported";

export interface PermissionResult {
  granted: boolean;
  /** False once iOS has recorded a "Don't Allow" — only Settings can undo it. */
  canAskAgain: boolean;
  status: PermissionState;
}

const UNSUPPORTED_PERMISSION: PermissionResult = {
  granted: false,
  canAskAgain: false,
  status: "unsupported",
};

/** Local notifications exist on iOS and Android only. */
function isSupported(): boolean {
  return Platform.OS !== "web";
}

function toPermissionResult(
  status: Notifications.NotificationPermissionsStatus
): PermissionResult {
  const iosStatus = status.ios?.status;

  if (iosStatus !== undefined) {
    // Provisional/ephemeral authorisations may post quietly — good enough.
    if (
      iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
      iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
      iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL
    ) {
      return { granted: true, canAskAgain: status.canAskAgain, status: "granted" };
    }
    if (iosStatus === Notifications.IosAuthorizationStatus.NOT_DETERMINED) {
      return { granted: false, canAskAgain: true, status: "undetermined" };
    }
    return { granted: false, canAskAgain: false, status: "denied" };
  }

  if (status.granted) {
    return { granted: true, canAskAgain: status.canAskAgain, status: "granted" };
  }
  return {
    granted: false,
    canAskAgain: status.canAskAgain,
    status: status.canAskAgain ? "undetermined" : "denied",
  };
}

/** Reads the current permission state. Never prompts, never throws. */
export async function getPermissionState(): Promise<PermissionResult> {
  if (!isSupported()) return UNSUPPORTED_PERMISSION;

  try {
    return toPermissionResult(await Notifications.getPermissionsAsync());
  } catch (error) {
    console.error("Failed to read notification permissions:", error);
    return UNSUPPORTED_PERMISSION;
  }
}

/**
 * Reads the permission state and asks the user exactly once, when iOS has
 * not decided yet. Call this from a button press only — an unprompted
 * system dialog is the fastest way to a permanent "Don't Allow".
 */
export async function ensurePermissions(): Promise<PermissionResult> {
  if (!isSupported()) return UNSUPPORTED_PERMISSION;

  try {
    const current = toPermissionResult(await Notifications.getPermissionsAsync());
    if (current.status !== "undetermined") return current;

    const requested = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return toPermissionResult(requested);
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return UNSUPPORTED_PERMISSION;
  }
}

/* ------------------------------------------------------------------ *
 * Master switch (parent-facing kill switch, persisted)
 * ------------------------------------------------------------------ */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  routineReminders: true,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const stored = await storage.getItem<NotificationSettings>(KEYS.NOTIFICATION_SETTINGS);
  return {
    routineReminders:
      typeof stored?.routineReminders === "boolean"
        ? stored.routineReminders
        : DEFAULT_NOTIFICATION_SETTINGS.routineReminders,
  };
}

export async function setRoutineRemindersEnabled(enabled: boolean): Promise<void> {
  await storage.setItem<NotificationSettings>(KEYS.NOTIFICATION_SETTINGS, {
    routineReminders: enabled,
  });
}

/* ------------------------------------------------------------------ *
 * Reminder content
 * ------------------------------------------------------------------ */
interface TimeOfDay {
  hour: number;
  minute: number;
}

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** "07:30" → { hour: 7, minute: 30 }. Anything else → null. */
function parseTimeOfDay(time: string | undefined): TimeOfDay | null {
  if (!time) return null;

  const match = TIME_PATTERN.exec(time.trim());
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return { hour, minute };
}

function formatTimeOfDay({ hour, minute }: TimeOfDay): string {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function getRoutineTitle(routine: Routine): string {
  const name = routine.name?.trim();
  return name && name.length > 0 ? name : "Routine Stars";
}

/** Kid-warm German default; a routine's own message always wins. */
function getReminderBody(routine: Routine): string {
  const custom = routine.reminders?.message?.trim();
  if (custom && custom.length > 0) return custom;

  const name = routine.name?.trim();
  if (name && name.length > 0) {
    return `Zeit für „${name}“! Deine Sterne warten. ⭐`;
  }
  return "Zeit für deine Routine! Deine Sterne warten. ⭐";
}

/**
 * Weekdays a routine actually gets a reminder for: deduplicated, in
 * Monday-first order, and only when the routine has an enabled reminder
 * plus a usable time. Returns [] when the routine is not reminder-ready.
 */
function getReminderWeekdays(routine: Routine): Weekday[] {
  if (!routine.reminders?.enabled) return [];
  if (!parseTimeOfDay(routine.schedule?.time)) return [];

  const days = routine.schedule?.days;
  if (!days || days.length === 0) return [];

  return WEEKDAY_ORDER.filter((weekday) => days.includes(weekday));
}

/** True when this routine could carry a reminder at all (UI affordance). */
export function isReminderReady(routine: Routine): boolean {
  const hasDays = (routine.schedule?.days?.length ?? 0) > 0;
  return hasDays && parseTimeOfDay(routine.schedule?.time) !== null;
}

/* ------------------------------------------------------------------ *
 * Scheduling
 * ------------------------------------------------------------------ */
export interface ReminderSyncResult {
  /** Weekly reminders that are scheduled now. */
  scheduled: number;
  /** Stale reminders that were removed first. */
  cancelled: number;
  status: "ok" | "unsupported" | "permission-denied" | "master-off" | "error";
}

function isRoutineReminder(request: Notifications.NotificationRequest): boolean {
  if (request.identifier.startsWith(REMINDER_IDENTIFIER_PREFIX)) return true;
  return request.content.data?.kind === REMINDER_DATA_KIND;
}

/**
 * Removes every reminder this module scheduled. Foreign notifications
 * (other libraries, the test notification) are left untouched, so this is
 * safe to call unconditionally.
 */
export async function cancelAllRoutineReminders(): Promise<number> {
  if (!isSupported()) return 0;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const ours = scheduled.filter(isRoutineReminder);

    await Promise.all(
      ours.map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier)
      )
    );

    return ours.length;
  } catch (error) {
    console.error("Failed to cancel routine reminders:", error);
    return 0;
  }
}

/*
 * Syncs run one at a time. Each sync cancels before it schedules, so two
 * overlapping runs could cancel each other's freshly written reminders.
 * The queue also gives the settings screen a defined moment to read the
 * schedule back — see whenRemindersSynced().
 */
let syncQueue: Promise<unknown> = Promise.resolve();

/**
 * Rebuilds the whole reminder schedule from the routines passed in:
 * cancel everything we own, then schedule one weekly repeating
 * notification per (routine × weekday).
 *
 * Rebuilding beats diffing here — the set is tiny, and a stale reminder
 * for a routine the parent already deleted is the one bug a kids' app
 * cannot afford.
 *
 * Never prompts and never throws; when it cannot schedule it says why.
 */
export function syncRoutineReminders(routines: Routine[]): Promise<ReminderSyncResult> {
  const run = syncQueue.then(
    () => runSyncRoutineReminders(routines),
    () => runSyncRoutineReminders(routines)
  );

  syncQueue = run.catch(() => undefined);
  return run;
}

/** Resolves once every queued sync has finished. For UI that reads back. */
export function whenRemindersSynced(): Promise<void> {
  return syncQueue.then(
    () => undefined,
    () => undefined
  );
}

async function runSyncRoutineReminders(
  routines: Routine[]
): Promise<ReminderSyncResult> {
  if (!isSupported()) return { scheduled: 0, cancelled: 0, status: "unsupported" };

  try {
    const cancelled = await cancelAllRoutineReminders();

    const settings = await getNotificationSettings();
    if (!settings.routineReminders) {
      return { scheduled: 0, cancelled, status: "master-off" };
    }

    const permission = await getPermissionState();
    if (!permission.granted) {
      return { scheduled: 0, cancelled, status: "permission-denied" };
    }

    let scheduled = 0;

    for (const routine of routines) {
      const weekdays = getReminderWeekdays(routine);
      if (weekdays.length === 0) continue;

      const time = parseTimeOfDay(routine.schedule?.time);
      if (!time) continue;

      for (const weekday of weekdays) {
        await Notifications.scheduleNotificationAsync({
          identifier: buildReminderIdentifier(routine.id, weekday),
          content: {
            title: getRoutineTitle(routine),
            body: getReminderBody(routine),
            sound: true,
            data: {
              kind: REMINDER_DATA_KIND,
              routineId: routine.id,
              routineName: getRoutineTitle(routine),
              weekday,
              time: formatTimeOfDay(time),
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: toExpoWeekday(weekday),
            hour: time.hour,
            minute: time.minute,
          },
        });
        scheduled += 1;
      }
    }

    return { scheduled, cancelled, status: "ok" };
  } catch (error) {
    console.error("Failed to sync routine reminders:", error);
    return { scheduled: 0, cancelled: 0, status: "error" };
  }
}

export interface TestNotificationResult {
  scheduled: boolean;
  status: PermissionState;
}

/** Fires in 5 seconds so the parent can see what a reminder looks like. */
export async function scheduleTestNotification(): Promise<TestNotificationResult> {
  if (!isSupported()) return { scheduled: false, status: "unsupported" };

  const permission = await getPermissionState();
  if (!permission.granted) return { scheduled: false, status: permission.status };

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `${TEST_IDENTIFIER_PREFIX}${Date.now()}`,
      content: {
        title: "Routine Stars",
        body: "So sieht eine Erinnerung aus!",
        sound: true,
        data: { kind: "reminder-test" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });

    return { scheduled: true, status: "granted" };
  } catch (error) {
    console.error("Failed to schedule the test notification:", error);
    return { scheduled: false, status: permission.status };
  }
}

/* ------------------------------------------------------------------ *
 * Reading back what is scheduled
 * ------------------------------------------------------------------ */
export interface ScheduledReminder {
  identifier: string;
  routineId: string | null;
  routineName: string | null;
  weekday: Weekday | null;
  /** "HH:mm" or null when the trigger carried no usable time. */
  time: string | null;
}

function readString(data: Record<string, unknown> | undefined, key: string): string | null {
  const value = data?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNumber(source: Record<string, unknown>, key: string): number | undefined {
  const value = source[key];
  return typeof value === "number" ? value : undefined;
}

/**
 * Pulls weekday/hour/minute out of a scheduled trigger without leaning on
 * the trigger union: iOS hands back a calendar trigger with nested
 * `dateComponents`, Android a flat weekly trigger. Both are read the same
 * way here.
 */
function readTriggerFacts(trigger: unknown): {
  weekday?: number;
  hour?: number;
  minute?: number;
} {
  if (typeof trigger !== "object" || trigger === null) return {};

  const raw = trigger as Record<string, unknown>;
  const nested = raw.dateComponents;
  const source =
    typeof nested === "object" && nested !== null ? (nested as Record<string, unknown>) : raw;

  return {
    weekday: readNumber(source, "weekday"),
    hour: readNumber(source, "hour"),
    minute: readNumber(source, "minute"),
  };
}

/**
 * Every routine reminder currently on the system queue, sorted the way a
 * parent reads a week. Backed by `content.data` where possible and by the
 * raw trigger as a fallback.
 */
export async function getScheduledRoutineNotifications(): Promise<ScheduledReminder[]> {
  if (!isSupported()) return [];

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    const reminders = scheduled.filter(isRoutineReminder).map<ScheduledReminder>((request) => {
      const data = request.content.data;
      const facts = readTriggerFacts(request.trigger);

      const dataWeekday = readString(data, "weekday");
      const weekday =
        dataWeekday && WEEKDAY_ORDER.includes(dataWeekday as Weekday)
          ? (dataWeekday as Weekday)
          : fromExpoWeekday(facts.weekday);

      const time =
        readString(data, "time") ??
        (facts.hour !== undefined && facts.minute !== undefined
          ? formatTimeOfDay({ hour: facts.hour, minute: facts.minute })
          : null);

      return {
        identifier: request.identifier,
        routineId: readString(data, "routineId"),
        routineName: readString(data, "routineName") ?? request.content.title,
        weekday,
        time,
      };
    });

    return reminders.sort((a, b) => {
      const dayDelta =
        WEEKDAY_ORDER.indexOf(a.weekday ?? "So") - WEEKDAY_ORDER.indexOf(b.weekday ?? "So");
      if (dayDelta !== 0) return dayDelta;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
  } catch (error) {
    console.error("Failed to read scheduled routine reminders:", error);
    return [];
  }
}

/** "Mo Mi Fr · 07:30" — the one-line summary shown next to a routine. */
export function formatReminderSchedule(routine: Routine): string | null {
  const time = parseTimeOfDay(routine.schedule?.time);
  if (!time) return null;

  return `${formatWeekdaySummary(routine.schedule?.days)} · ${formatTimeOfDay(time)}`;
}
