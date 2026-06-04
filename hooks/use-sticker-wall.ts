import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { STICKER_CATALOG } from "@/lib/animal-stickers";
import { getLocalIsoDate } from "@/lib/local-date";
import {
  DEFAULT_STICKER_REWARD_SETTINGS,
  canClaimStickerRewardEvent,
  getStickerRewardModeLabel,
  normalizeStickerRewardSettings,
  type StickerRewardEvent,
} from "@/lib/sticker-reward-logic";
import { KEYS, storage } from "@/lib/storage";
import type {
  StickerAssetId,
  StickerCollectionEntry,
  StickerCollectionState,
  StickerRewardSettings,
} from "@/lib/types";

type StickerCollectionMap = Record<string, StickerCollectionState>;
type StoredStickerEntry = Partial<StickerCollectionEntry> & {
  reason?: StickerCollectionEntry["reason"] | "day_complete";
};
type StoredStickerState = {
  collectedStickers?: StoredStickerEntry[];
  claimedEventKeys?: string[];
  placedStickers?: StoredStickerEntry[];
  claimedDayDates?: string[];
};
type StoredStickerMap = Record<string, StoredStickerState>;

const EMPTY_COLLECTION: StickerCollectionState = {
  collectedStickers: [],
  claimedEventKeys: [],
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function getDailyEventKey(date: string) {
  return `${date}:daily-complete`;
}

function normalizeCollectionState(value?: StoredStickerState | null): StickerCollectionState {
  const validStickerIds = new Set(STICKER_CATALOG.map((sticker) => sticker.id));
  const sourceStickers = value?.collectedStickers ?? value?.placedStickers ?? [];
  const collectedStickers = sourceStickers
    .map((entry): StickerCollectionEntry | null => {
      if (
        !entry ||
        typeof entry.id !== "string" ||
        typeof entry.earnedDate !== "string" ||
        typeof entry.createdAt !== "string" ||
        typeof entry.slot !== "number" ||
        !entry.stickerId ||
          !validStickerIds.has(entry.stickerId as StickerAssetId)
      ) {
        return null;
      }

      const { id, stickerId, earnedDate, slot, createdAt } = entry;
      const reason =
        entry.reason === "routine_complete" || entry.reason === "daily_complete"
          ? entry.reason
          : "daily_complete";
      const eventKey =
        typeof entry.eventKey === "string" && entry.eventKey.length > 0
          ? entry.eventKey
          : reason === "daily_complete"
            ? getDailyEventKey(earnedDate)
            : `${earnedDate}:${entry.routineId ?? slot}`;

      return {
        id,
        stickerId: stickerId as StickerAssetId,
        earnedDate,
        reason,
        eventKey,
        routineId: typeof entry.routineId === "string" ? entry.routineId : undefined,
        routineName: typeof entry.routineName === "string" ? entry.routineName : undefined,
        slot,
        createdAt,
      };
    })
    .filter((entry): entry is StickerCollectionEntry => Boolean(entry))
    .sort((left, right) => left.slot - right.slot);
  const legacyClaimedEventKeys = (value?.claimedDayDates ?? []).map(getDailyEventKey);

  return {
    collectedStickers,
    claimedEventKeys: unique([
      ...(value?.claimedEventKeys ?? []),
      ...legacyClaimedEventKeys,
      ...collectedStickers.map((entry) => entry.eventKey),
    ]).sort(),
  };
}

function normalizeCollectionMap(
  collectionMap?: StoredStickerMap | null,
  legacyMap?: StoredStickerMap | null
): StickerCollectionMap {
  const childIds = unique([
    ...Object.keys(collectionMap ?? {}),
    ...Object.keys(legacyMap ?? {}),
  ]);

  return childIds.reduce<StickerCollectionMap>((nextMap, childId) => {
    nextMap[childId] = normalizeCollectionState(collectionMap?.[childId] ?? legacyMap?.[childId]);
    return nextMap;
  }, {});
}

function getNextSlot(entries: StickerCollectionEntry[]) {
  const usedSlots = new Set(entries.map((entry) => entry.slot));
  let slot = 0;

  while (usedSlots.has(slot)) {
    slot += 1;
  }

  return slot;
}

export function useStickerWall(selectedChildId?: string) {
  const [collectionMap, setCollectionMap] = useState<StickerCollectionMap>({});
  const [settings, setSettings] = useState<StickerRewardSettings>(
    DEFAULT_STICKER_REWARD_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(true);
  const today = getLocalIsoDate();

  const refreshStickerWall = useCallback(async () => {
    const [storedCollectionMap, legacyWallMap, storedSettings] = await Promise.all([
      storage.getItem<StoredStickerMap>(KEYS.STICKER_COLLECTION),
      storage.getItem<StoredStickerMap>(KEYS.STICKER_WALL),
      storage.getItem<Partial<StickerRewardSettings>>(KEYS.STICKER_REWARD_SETTINGS),
    ]);
    const nextMap = normalizeCollectionMap(storedCollectionMap, legacyWallMap);
    const nextSettings = normalizeStickerRewardSettings(storedSettings);

    setCollectionMap(nextMap);
    setSettings(nextSettings);
    setIsLoading(false);

    if (Object.keys(nextMap).length > 0) {
      await storage.setItem(KEYS.STICKER_COLLECTION, nextMap);
    }

    await storage.setItem(KEYS.STICKER_REWARD_SETTINGS, nextSettings);
  }, []);

  useEffect(() => {
    void refreshStickerWall();
  }, [refreshStickerWall]);

  useFocusEffect(
    useCallback(() => {
      void refreshStickerWall();
    }, [refreshStickerWall])
  );

  const collectionState = useMemo(
    () =>
      selectedChildId
        ? normalizeCollectionState(collectionMap[selectedChildId])
        : EMPTY_COLLECTION,
    [collectionMap, selectedChildId]
  );
  const collectedStickerIds = useMemo(
    () => new Set(collectionState.collectedStickers.map((entry) => entry.stickerId)),
    [collectionState.collectedStickers]
  );
  const availableStickers = useMemo(() => {
    const freshStickers = STICKER_CATALOG.filter(
      (sticker) => !collectedStickerIds.has(sticker.id)
    );
    return freshStickers.length > 0 ? freshStickers : STICKER_CATALOG;
  }, [collectedStickerIds]);
  const todayEventKey = getDailyEventKey(today);
  const hasClaimedToday = collectionState.claimedEventKeys.includes(todayEventKey);

  const claimStickerReward = useCallback(
    async (event: StickerRewardEvent | null, stickerId: StickerAssetId) => {
      if (!selectedChildId || !event || event.childId !== selectedChildId) {
        return null;
      }

      const [storedMap, legacyMap] = await Promise.all([
        storage.getItem<StoredStickerMap>(KEYS.STICKER_COLLECTION),
        storage.getItem<StoredStickerMap>(KEYS.STICKER_WALL),
      ]);
      const normalizedMap = normalizeCollectionMap(storedMap, legacyMap);
      const current = normalizeCollectionState(normalizedMap[selectedChildId]);

      if (!canClaimStickerRewardEvent(current.claimedEventKeys, event.eventKey)) {
        return null;
      }

      const nextEntry: StickerCollectionEntry = {
        id: `${selectedChildId}:${event.eventKey}:${Date.now()}`,
        stickerId,
        earnedDate: event.earnedDate,
        reason: event.reason,
        eventKey: event.eventKey,
        routineId: event.routineId,
        routineName: event.routineName,
        slot: getNextSlot(current.collectedStickers),
        createdAt: new Date().toISOString(),
      };
      const nextState: StickerCollectionState = {
        collectedStickers: [...current.collectedStickers, nextEntry],
        claimedEventKeys: unique([...current.claimedEventKeys, event.eventKey]).sort(),
      };
      const nextMap = {
        ...normalizedMap,
        [selectedChildId]: nextState,
      };

      await storage.setItem(KEYS.STICKER_COLLECTION, nextMap);
      setCollectionMap(nextMap);
      return nextEntry;
    },
    [selectedChildId]
  );

  const claimDailySticker = useCallback(
    async (stickerId: StickerAssetId) =>
      claimStickerReward(
        selectedChildId
          ? {
              childId: selectedChildId,
              routineId: "daily-complete",
              routineName: "Tagesabschluss",
              reason: "daily_complete",
              eventKey: todayEventKey,
              earnedDate: today,
            }
          : null,
        stickerId
      ),
    [claimStickerReward, selectedChildId, today, todayEventKey]
  );

  const updateRewardSettings = useCallback(
    async (updates: Partial<StickerRewardSettings>) => {
      const nextSettings = normalizeStickerRewardSettings({ ...settings, ...updates });
      setSettings(nextSettings);
      await storage.setItem(KEYS.STICKER_REWARD_SETTINGS, nextSettings);
    },
    [settings]
  );

  return {
    isLoading,
    collectionState,
    wallState: collectionState,
    collectedEntries: collectionState.collectedStickers,
    placedStickers: collectionState.collectedStickers,
    claimedEventKeys: collectionState.claimedEventKeys,
    availableStickers,
    availableDailyStickers: availableStickers,
    settings,
    rewardModeLabel: getStickerRewardModeLabel(settings.rewardMode),
    hasClaimedToday,
    refreshStickerWall,
    claimStickerReward,
    claimDailySticker,
    updateRewardSettings,
  };
}
