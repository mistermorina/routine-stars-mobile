import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { storage, KEYS } from "@/lib/storage";
import {
  areChildProgressStatesEqual,
  getDailyMission,
  getMissionProgress,
  getNextStickerGoal,
  getStickerAlbumEntries,
  getStickerDefinition,
  mergeUnlockedStickerIds,
  normalizeChildProgressState,
  type MissionProgress,
  type NextStickerGoal,
  type StickerAlbumEntry,
} from "@/lib/child-progression";
import type {
  ActivityLog,
  Child,
  ChildProgressState,
  DailyMission,
  Routine,
  StickerDefinition,
} from "@/lib/types";

type ProgressStateMap = Record<string, ChildProgressState>;

interface ProgressData {
  todayMission: DailyMission | null;
  missionProgress: MissionProgress | null;
  isMissionComplete: boolean;
  unlockedStickers: StickerDefinition[];
  albumStickers: StickerAlbumEntry[];
  nextSticker: NextStickerGoal | null;
  recentUnlocks: StickerDefinition[];
}

interface EvaluateProgressParams {
  childId?: string;
  child?: Child;
  logs?: ActivityLog[];
  routines?: Routine[];
  childStars?: number;
}

interface EvaluateProgressResult {
  missionCompleted: boolean;
  unlockedStickerIds: string[];
}

const EMPTY_PROGRESS: ProgressData = {
  todayMission: null,
  missionProgress: null,
  isMissionComplete: false,
  unlockedStickers: [],
  albumStickers: [],
  nextSticker: null,
  recentUnlocks: [],
};

async function loadProgressContext(childId: string) {
  const [children, logs, routines, progressMap] = await Promise.all([
    storage.getItem<Child[]>(KEYS.CHILDREN),
    storage.getItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS),
    storage.getItem<Routine[]>(KEYS.CUSTOM_ROUTINES),
    storage.getItem<ProgressStateMap>(KEYS.CHILD_PROGRESS_STATE),
  ]);

  return {
    child: children?.find((entry) => entry.id === childId),
    childLogs: (logs ?? []).filter((entry) => entry.childId === childId),
    routines: routines ?? [],
    progressMap: progressMap ?? {},
  };
}

function buildProgressSnapshot(
  child: Child | undefined,
  logs: ActivityLog[],
  routines: Routine[],
  progressState: ChildProgressState
): ProgressData {
  if (!child) {
    return EMPTY_PROGRESS;
  }

  const todayMission = getDailyMission(child.id);
  const missionProgress = getMissionProgress(todayMission, logs, routines);
  const unlockedStickerIds = progressState.unlockedStickerIds;
  const unlockedStickers = unlockedStickerIds
    .map((stickerId) => getStickerDefinition(stickerId))
    .filter((entry): entry is StickerDefinition => Boolean(entry));
  const recentUnlocks = (progressState.lastSeenUnlockIds ?? [])
    .map((stickerId) => getStickerDefinition(stickerId))
    .filter((entry): entry is StickerDefinition => Boolean(entry));

  return {
    todayMission,
    missionProgress,
    isMissionComplete: missionProgress.current >= missionProgress.target,
    unlockedStickers,
    albumStickers: getStickerAlbumEntries(child, logs, routines, progressState),
    nextSticker: getNextStickerGoal(child, logs, routines, progressState),
    recentUnlocks,
  };
}

export function useChildProgression(selectedChildId?: string) {
  const [progressMap, setProgressMap] = useState<ProgressStateMap>({});
  const [progressData, setProgressData] = useState<ProgressData>(EMPTY_PROGRESS);

  const refreshProgress = useCallback(async () => {
    if (!selectedChildId) {
      setProgressMap({});
      setProgressData(EMPTY_PROGRESS);
      return;
    }

    const { child, childLogs, routines, progressMap: storedMap } =
      await loadProgressContext(selectedChildId);

    const currentState = normalizeChildProgressState(storedMap[selectedChildId]);
    const todayMission = getDailyMission(selectedChildId);
    const missionProgress = getMissionProgress(todayMission, childLogs, routines);
    const claimedDates = currentState.claimedMissionDates.includes(todayMission.date)
      ? currentState.claimedMissionDates
      : missionProgress.current >= missionProgress.target
        ? [...currentState.claimedMissionDates, todayMission.date]
        : currentState.claimedMissionDates;
    const nextBaseState: ChildProgressState = {
      ...currentState,
      claimedMissionDates: claimedDates,
    };
    const silentlyUnlockedIds = mergeUnlockedStickerIds(
      child,
      childLogs,
      routines,
      nextBaseState
    );
    const nextState: ChildProgressState = normalizeChildProgressState({
      ...nextBaseState,
      unlockedStickerIds: silentlyUnlockedIds,
    });
    const nextMap = { ...storedMap, [selectedChildId]: nextState };

    if (!areChildProgressStatesEqual(currentState, nextState)) {
      await storage.setItem(KEYS.CHILD_PROGRESS_STATE, nextMap);
    }

    setProgressMap(nextMap);
    setProgressData(buildProgressSnapshot(child, childLogs, routines, nextState));
  }, [selectedChildId]);

  useEffect(() => {
    void refreshProgress();
  }, [refreshProgress]);

  useFocusEffect(
    useCallback(() => {
      void refreshProgress();
    }, [refreshProgress])
  );

  const evaluateProgressAfterTaskCompletion = useCallback(
    async ({
      childId,
      child,
      logs,
      routines,
      childStars,
    }: EvaluateProgressParams = {}): Promise<EvaluateProgressResult> => {
      const effectiveChildId = childId ?? selectedChildId;

      if (!effectiveChildId) {
        return { missionCompleted: false, unlockedStickerIds: [] };
      }

      const context = await loadProgressContext(effectiveChildId);
      const effectiveChild =
        child ??
        (context.child
          ? {
              ...context.child,
              stars: childStars ?? context.child.stars,
            }
          : undefined);
      const effectiveLogs = logs ?? context.childLogs;
      const effectiveRoutines = routines ?? context.routines;
      const currentState = normalizeChildProgressState(
        progressMap[effectiveChildId] ?? context.progressMap[effectiveChildId]
      );
      const todayMission = getDailyMission(effectiveChildId);
      const missionProgress = getMissionProgress(todayMission, effectiveLogs, effectiveRoutines);
      const missionCompleted =
        missionProgress.current >= missionProgress.target &&
        !currentState.claimedMissionDates.includes(todayMission.date);
      const nextClaimedDates = missionCompleted
        ? [...currentState.claimedMissionDates, todayMission.date]
        : currentState.claimedMissionDates;
      const baseState: ChildProgressState = {
        ...currentState,
        claimedMissionDates: nextClaimedDates,
      };
      const nextUnlockedStickerIds = mergeUnlockedStickerIds(
        effectiveChild,
        effectiveLogs,
        effectiveRoutines,
        baseState
      );
      const newlyUnlockedStickerIds = nextUnlockedStickerIds.filter(
        (stickerId) => !currentState.unlockedStickerIds.includes(stickerId)
      );
      const nextState = normalizeChildProgressState({
        ...baseState,
        unlockedStickerIds: nextUnlockedStickerIds,
        lastSeenUnlockIds: [
          ...(currentState.lastSeenUnlockIds ?? []),
          ...newlyUnlockedStickerIds,
        ],
      });
      const nextMap = {
        ...context.progressMap,
        ...progressMap,
        [effectiveChildId]: nextState,
      };

      await storage.setItem(KEYS.CHILD_PROGRESS_STATE, nextMap);
      setProgressMap(nextMap);
      setProgressData(
        buildProgressSnapshot(effectiveChild, effectiveLogs, effectiveRoutines, nextState)
      );

      return {
        missionCompleted,
        unlockedStickerIds: newlyUnlockedStickerIds,
      };
    },
    [progressMap, selectedChildId]
  );

  const clearRecentUnlocks = useCallback(async () => {
    if (!selectedChildId) {
      return;
    }

    const current = normalizeChildProgressState(progressMap[selectedChildId]);
    if (!current.lastSeenUnlockIds || current.lastSeenUnlockIds.length === 0) {
      return;
    }

    const nextState = normalizeChildProgressState({
      ...current,
      lastSeenUnlockIds: [],
    });
    const nextMap = { ...progressMap, [selectedChildId]: nextState };

    await storage.setItem(KEYS.CHILD_PROGRESS_STATE, nextMap);
    setProgressMap(nextMap);
    setProgressData((previous) => ({
      ...previous,
      recentUnlocks: [],
    }));
  }, [progressMap, selectedChildId]);

  return {
    ...progressData,
    refreshProgress,
    evaluateProgressAfterTaskCompletion,
    clearRecentUnlocks,
  };
}
