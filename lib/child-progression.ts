import { buildDailySummaries } from "@/lib/activity-insights";
import type {
  ActivityLog,
  Child,
  ChildProgressState,
  DailyMission,
  DailyMissionKind,
  Routine,
  StickerDefinition,
  StickerId,
} from "@/lib/types";

export interface MissionProgress {
  current: number;
  target: number;
  unitLabel: string;
  progressPercent: number;
}

export interface NextStickerGoal {
  sticker: StickerDefinition;
  current: number;
  target: number;
  progressPercent: number;
  hint: string;
}

export interface StickerAlbumEntry {
  sticker: StickerDefinition;
  group: "erste-schritte" | "missionen" | "serie-sterne";
  current: number;
  target: number;
  progressPercent: number;
  hint: string;
  unlocked: boolean;
}

const DAILY_MISSION_KINDS: DailyMissionKind[] = [
  "complete_3_tasks",
  "earn_5_stars",
  "complete_1_routine",
];

const STICKER_IDS_IN_ORDER: StickerId[] = [
  "first_task",
  "first_routine",
  "daily_mission_1",
  "daily_mission_3",
  "streak_3",
  "streak_7",
  "stars_25",
  "stars_50",
  "active_days_10",
];

const STICKER_GROUPS: Record<StickerId, StickerAlbumEntry["group"]> = {
  first_task: "erste-schritte",
  first_routine: "erste-schritte",
  daily_mission_1: "missionen",
  daily_mission_3: "missionen",
  streak_3: "serie-sterne",
  streak_7: "serie-sterne",
  stars_25: "serie-sterne",
  stars_50: "serie-sterne",
  active_days_10: "serie-sterne",
};

export const STICKER_DEFINITIONS: StickerDefinition[] = [
  {
    id: "first_task",
    title: "Erster Schritt",
    description: "Die erste Aufgabe wurde geschafft.",
    shortLabel: "Erste Aufgabe",
  },
  {
    id: "first_routine",
    title: "Routinenstarter",
    description: "Eine ganze Routine wurde abgeschlossen.",
    shortLabel: "Erste Routine",
  },
  {
    id: "daily_mission_1",
    title: "Tagesheld",
    description: "Die erste Tagesmission wurde erfüllt.",
    shortLabel: "1 Mission",
  },
  {
    id: "daily_mission_3",
    title: "Missionenmeister",
    description: "Drei Tagesmissionen wurden geschafft.",
    shortLabel: "3 Missionen",
  },
  {
    id: "streak_3",
    title: "Im Rhythmus",
    description: "Drei aktive Tage in Folge gesammelt.",
    shortLabel: "3er-Serie",
  },
  {
    id: "streak_7",
    title: "Wochenwunder",
    description: "Sieben aktive Tage in Folge gesammelt.",
    shortLabel: "7er-Serie",
  },
  {
    id: "stars_25",
    title: "Sterneschatz",
    description: "25 Sterne gleichzeitig gesammelt.",
    shortLabel: "25 Sterne",
  },
  {
    id: "stars_50",
    title: "Sternenregen",
    description: "50 Sterne gleichzeitig gesammelt.",
    shortLabel: "50 Sterne",
  },
  {
    id: "active_days_10",
    title: "Dranbleiber",
    description: "An zehn Tagen war Fortschritt sichtbar.",
    shortLabel: "10 Tage",
  },
];

function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function clampProgress(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

function getMissionMeta(kind: DailyMissionKind) {
  switch (kind) {
    case "complete_3_tasks":
      return {
        title: "Drei Aufgaben schaffen",
        description: "Heute drei kleine Schritte meistern.",
        target: 3,
        unitLabel: "Aufgaben",
      };
    case "earn_5_stars":
      return {
        title: "Fünf Sterne sammeln",
        description: "Heute fünf Sterne zusammenholen.",
        target: 5,
        unitLabel: "Sterne",
      };
    case "complete_1_routine":
      return {
        title: "Eine Routine beenden",
        description: "Heute eine ganze Routine abschließen.",
        target: 1,
        unitLabel: "Routinen",
      };
  }
}

function getMaxStreak(logs: ActivityLog[]) {
  const summaries = buildDailySummaries(logs);

  if (summaries.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let index = 1; index < summaries.length; index += 1) {
    const previous = new Date(`${summaries[index - 1].date}T12:00:00`);
    const next = new Date(`${summaries[index].date}T12:00:00`);
    const diff = Math.round(
      (next.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
      continue;
    }

    current = 1;
  }

  return best;
}

function countCompletedRoutinesForDate(
  logs: ActivityLog[],
  routines: Routine[],
  date: string
) {
  const completedTaskIds = new Set(
    logs.filter((log) => log.date === date).map((log) => log.taskId)
  );

  return routines.filter(
    (routine) =>
      routine.tasks.length > 0 &&
      routine.tasks.every((task) => completedTaskIds.has(task.id))
  ).length;
}

export function getDailyMission(childId: string, date = getTodayIsoDate()): DailyMission {
  const missionKind = DAILY_MISSION_KINDS[hashText(`${childId}:${date}`) % DAILY_MISSION_KINDS.length];
  const meta = getMissionMeta(missionKind);

  return {
    id: `${date}:${missionKind}`,
    date,
    kind: missionKind,
    title: meta.title,
    description: meta.description,
    target: meta.target,
  };
}

export function getMissionProgress(
  mission: DailyMission,
  logs: ActivityLog[],
  routines: Routine[],
  date = mission.date
): MissionProgress {
  const todayLogs = logs.filter((log) => log.date === date);
  const meta = getMissionMeta(mission.kind);
  let current = 0;

  switch (mission.kind) {
    case "complete_3_tasks":
      current = todayLogs.length;
      break;
    case "earn_5_stars":
      current = todayLogs.reduce((sum, log) => sum + log.stars, 0);
      break;
    case "complete_1_routine":
      current = countCompletedRoutinesForDate(logs, routines, date);
      break;
  }

  return {
    current,
    target: mission.target,
    unitLabel: meta.unitLabel,
    progressPercent: clampProgress(current, mission.target),
  };
}

export function normalizeChildProgressState(
  value?: Partial<ChildProgressState> | null
): ChildProgressState {
  return {
    unlockedStickerIds: unique((value?.unlockedStickerIds ?? []) as StickerId[]).filter(
      (stickerId): stickerId is StickerId =>
        STICKER_IDS_IN_ORDER.includes(stickerId as StickerId)
    ),
    claimedMissionDates: unique(value?.claimedMissionDates ?? []).sort(),
    lastSeenUnlockIds: unique((value?.lastSeenUnlockIds ?? []) as StickerId[]).filter(
      (stickerId): stickerId is StickerId =>
        STICKER_IDS_IN_ORDER.includes(stickerId as StickerId)
    ),
  };
}

function getUnlockableStickerIds(
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
) {
  const summaries = buildDailySummaries(logs);
  const missionCount = progressState.claimedMissionDates.length;
  const maxStreak = getMaxStreak(logs);
  const activeDays = summaries.length;
  const hasCompletedRoutine = summaries.some(
    (summary) => countCompletedRoutinesForDate(logs, routines, summary.date) > 0
  );

  const unlockable: StickerId[] = [];

  if (logs.length >= 1) unlockable.push("first_task");
  if (hasCompletedRoutine) unlockable.push("first_routine");
  if (missionCount >= 1) unlockable.push("daily_mission_1");
  if (missionCount >= 3) unlockable.push("daily_mission_3");
  if (maxStreak >= 3) unlockable.push("streak_3");
  if (maxStreak >= 7) unlockable.push("streak_7");
  if ((child?.stars ?? 0) >= 25) unlockable.push("stars_25");
  if ((child?.stars ?? 0) >= 50) unlockable.push("stars_50");
  if (activeDays >= 10) unlockable.push("active_days_10");

  return unlockable.filter((stickerId) => !progressState.unlockedStickerIds.includes(stickerId));
}

function getGoalProgress(
  stickerId: StickerId,
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
) {
  const summaries = buildDailySummaries(logs);
  const activeDays = summaries.length;
  const missionCount = progressState.claimedMissionDates.length;
  const maxStreak = getMaxStreak(logs);
  const hasCompletedRoutine = summaries.some(
    (summary) => countCompletedRoutinesForDate(logs, routines, summary.date) > 0
  );

  switch (stickerId) {
    case "first_task":
      return { current: Math.min(logs.length, 1), target: 1, hint: "Schaffe die erste Aufgabe." };
    case "first_routine":
      return {
        current: hasCompletedRoutine ? 1 : 0,
        target: 1,
        hint: "Bringe heute eine komplette Routine zu Ende.",
      };
    case "daily_mission_1":
      return {
        current: Math.min(missionCount, 1),
        target: 1,
        hint: "Schaffe heute deine erste Mission.",
      };
    case "daily_mission_3":
      return {
        current: Math.min(missionCount, 3),
        target: 3,
        hint: "Schaffe drei Tagesmissionen.",
      };
    case "streak_3":
      return {
        current: Math.min(maxStreak, 3),
        target: 3,
        hint: "Bleib drei Tage hintereinander aktiv.",
      };
    case "streak_7":
      return {
        current: Math.min(maxStreak, 7),
        target: 7,
        hint: "Halte eine Woche lang den Rhythmus.",
      };
    case "stars_25":
      return {
        current: Math.min(child?.stars ?? 0, 25),
        target: 25,
        hint: "Sammle 25 Sterne gleichzeitig.",
      };
    case "stars_50":
      return {
        current: Math.min(child?.stars ?? 0, 50),
        target: 50,
        hint: "Sammle 50 Sterne gleichzeitig.",
      };
    case "active_days_10":
      return {
        current: Math.min(activeDays, 10),
        target: 10,
        hint: "An zehn Tagen sichtbar Fortschritt sammeln.",
      };
  }
}

function buildStickerAlbumEntry(
  stickerId: StickerId,
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
): StickerAlbumEntry | null {
  const sticker = STICKER_DEFINITIONS.find((entry) => entry.id === stickerId);
  if (!sticker) {
    return null;
  }

  const goal = getGoalProgress(stickerId, child, logs, routines, progressState);

  return {
    sticker,
    group: STICKER_GROUPS[stickerId],
    current: goal.current,
    target: goal.target,
    progressPercent: clampProgress(goal.current, goal.target),
    hint: goal.hint,
    unlocked: progressState.unlockedStickerIds.includes(stickerId),
  };
}

export function mergeUnlockedStickerIds(
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
) {
  return STICKER_IDS_IN_ORDER.filter((stickerId) =>
    progressState.unlockedStickerIds.includes(stickerId) ||
    getUnlockableStickerIds(child, logs, routines, progressState).includes(stickerId)
  );
}

export function getStickerAlbumEntries(
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
) {
  return STICKER_IDS_IN_ORDER.map((stickerId) =>
    buildStickerAlbumEntry(stickerId, child, logs, routines, progressState)
  ).filter((entry): entry is StickerAlbumEntry => Boolean(entry));
}

export function getNextStickerGoal(
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
): NextStickerGoal | null {
  const lockedEntries = getStickerAlbumEntries(child, logs, routines, progressState).filter(
    (entry) => !entry.unlocked
  );

  if (lockedEntries.length === 0) {
    return null;
  }

  const [bestEntry] = [...lockedEntries].sort((left, right) => {
    if (right.progressPercent !== left.progressPercent) {
      return right.progressPercent - left.progressPercent;
    }

    const leftMissing = left.target - left.current;
    const rightMissing = right.target - right.current;

    if (leftMissing !== rightMissing) {
      return leftMissing - rightMissing;
    }

    return STICKER_IDS_IN_ORDER.indexOf(left.sticker.id) - STICKER_IDS_IN_ORDER.indexOf(right.sticker.id);
  });

  return {
    sticker: bestEntry.sticker,
    current: bestEntry.current,
    target: bestEntry.target,
    progressPercent: bestEntry.progressPercent,
    hint: bestEntry.hint,
  };
}

export function getStickerDefinition(stickerId: StickerId) {
  return STICKER_DEFINITIONS.find((entry) => entry.id === stickerId) ?? null;
}

export function areChildProgressStatesEqual(
  left: ChildProgressState,
  right: ChildProgressState
) {
  return (
    left.unlockedStickerIds.join("|") === right.unlockedStickerIds.join("|") &&
    left.claimedMissionDates.join("|") === right.claimedMissionDates.join("|") &&
    (left.lastSeenUnlockIds ?? []).join("|") === (right.lastSeenUnlockIds ?? []).join("|")
  );
}
