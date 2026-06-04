import type { StickerRewardMode, StickerRewardSettings, StickerUnlockReason } from "./types";

export interface CreateStickerRewardEventParams {
  childId?: string;
  routineId?: string;
  routineName?: string;
  date: string;
  completedRoutineCountToday: number;
  totalRoutineCountToday: number;
  settings?: Partial<StickerRewardSettings> | null;
}

export interface StickerRewardEvent {
  childId: string;
  routineId: string;
  routineName: string;
  reason: StickerUnlockReason;
  eventKey: string;
  earnedDate: string;
}

export const DEFAULT_STICKER_REWARD_SETTINGS: StickerRewardSettings = {
  rewardMode: "routine_complete",
  selectionMode: "child_choice",
};

export function normalizeStickerRewardSettings(
  value?: Partial<StickerRewardSettings> | null
): StickerRewardSettings {
  return {
    rewardMode:
      value?.rewardMode === "daily_complete" || value?.rewardMode === "routine_complete"
        ? value.rewardMode
        : DEFAULT_STICKER_REWARD_SETTINGS.rewardMode,
    selectionMode: DEFAULT_STICKER_REWARD_SETTINGS.selectionMode,
  };
}

export function createStickerRewardEvent({
  childId,
  routineId,
  routineName,
  date,
  completedRoutineCountToday,
  totalRoutineCountToday,
  settings,
}: CreateStickerRewardEventParams): StickerRewardEvent | null {
  if (!childId || !routineId || !routineName || totalRoutineCountToday <= 0) {
    return null;
  }

  const normalizedSettings = normalizeStickerRewardSettings(settings);

  if (normalizedSettings.rewardMode === "daily_complete") {
    if (completedRoutineCountToday < totalRoutineCountToday) {
      return null;
    }

    return {
      childId,
      routineId,
      routineName,
      reason: "daily_complete",
      eventKey: `${date}:daily-complete`,
      earnedDate: date,
    };
  }

  return {
    childId,
    routineId,
    routineName,
    reason: "routine_complete",
    eventKey: `${date}:${routineId}`,
    earnedDate: date,
  };
}

export function canClaimStickerRewardEvent(
  claimedEventKeys: string[],
  eventKey?: string | null
) {
  return Boolean(eventKey && !claimedEventKeys.includes(eventKey));
}

export function getStickerRewardModeLabel(mode: StickerRewardMode) {
  switch (mode) {
    case "daily_complete":
      return "Ganzer Tag abgeschlossen";
    case "routine_complete":
      return "Jede abgeschlossene Routine";
  }
}
