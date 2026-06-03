import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ANIMAL_STICKERS } from "@/lib/animal-stickers";
import { getLocalIsoDate } from "@/lib/local-date";
import { KEYS, storage } from "@/lib/storage";
import type { AnimalStickerId, StickerWallEntry, StickerWallState } from "@/lib/types";

type StickerWallMap = Record<string, StickerWallState>;

const EMPTY_WALL: StickerWallState = {
  placedStickers: [],
  claimedDayDates: [],
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function normalizeWallState(value?: Partial<StickerWallState> | null): StickerWallState {
  const validStickerIds = new Set(ANIMAL_STICKERS.map((sticker) => sticker.id));
  const placedStickers = (value?.placedStickers ?? [])
    .filter((entry): entry is StickerWallEntry => {
      return Boolean(
        entry &&
          typeof entry.id === "string" &&
          typeof entry.earnedDate === "string" &&
          typeof entry.createdAt === "string" &&
          typeof entry.slot === "number" &&
          validStickerIds.has(entry.stickerId)
      );
    })
    .sort((left, right) => left.slot - right.slot);

  return {
    placedStickers,
    claimedDayDates: unique(value?.claimedDayDates ?? []).sort(),
  };
}

function getNextSlot(entries: StickerWallEntry[]) {
  const usedSlots = new Set(entries.map((entry) => entry.slot));
  let slot = 0;

  while (usedSlots.has(slot)) {
    slot += 1;
  }

  return slot;
}

export function useStickerWall(selectedChildId?: string) {
  const [wallMap, setWallMap] = useState<StickerWallMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const today = getLocalIsoDate();

  const refreshStickerWall = useCallback(async () => {
    if (!selectedChildId) {
      setWallMap({});
      setIsLoading(false);
      return;
    }

    const storedMap = (await storage.getItem<StickerWallMap>(KEYS.STICKER_WALL)) ?? {};
    const normalizedState = normalizeWallState(storedMap[selectedChildId]);
    const nextMap = { ...storedMap, [selectedChildId]: normalizedState };

    setWallMap(nextMap);
    setIsLoading(false);
  }, [selectedChildId]);

  useEffect(() => {
    void refreshStickerWall();
  }, [refreshStickerWall]);

  useFocusEffect(
    useCallback(() => {
      void refreshStickerWall();
    }, [refreshStickerWall])
  );

  const wallState = selectedChildId
    ? normalizeWallState(wallMap[selectedChildId])
    : EMPTY_WALL;
  const placedStickerIds = useMemo(
    () => new Set(wallState.placedStickers.map((entry) => entry.stickerId)),
    [wallState.placedStickers]
  );
  const availableDailyStickers = useMemo(() => {
    const freshStickers = ANIMAL_STICKERS.filter((sticker) => !placedStickerIds.has(sticker.id));
    return freshStickers.length > 0 ? freshStickers : ANIMAL_STICKERS;
  }, [placedStickerIds]);
  const hasClaimedToday = wallState.claimedDayDates.includes(today);

  const claimDailySticker = useCallback(
    async (stickerId: AnimalStickerId) => {
      if (!selectedChildId) {
        return null;
      }

      const storedMap = (await storage.getItem<StickerWallMap>(KEYS.STICKER_WALL)) ?? {};
      const current = normalizeWallState(storedMap[selectedChildId]);

      if (current.claimedDayDates.includes(today)) {
        return null;
      }

      const nextEntry: StickerWallEntry = {
        id: `${selectedChildId}:${today}:${Date.now()}`,
        stickerId,
        earnedDate: today,
        reason: "day_complete",
        slot: getNextSlot(current.placedStickers),
        createdAt: new Date().toISOString(),
      };
      const nextState: StickerWallState = {
        placedStickers: [...current.placedStickers, nextEntry],
        claimedDayDates: unique([...current.claimedDayDates, today]).sort(),
      };
      const nextMap = { ...storedMap, [selectedChildId]: nextState };

      await storage.setItem(KEYS.STICKER_WALL, nextMap);
      setWallMap(nextMap);
      return nextEntry;
    },
    [selectedChildId, today]
  );

  return {
    isLoading,
    wallState,
    placedStickers: wallState.placedStickers,
    availableDailyStickers,
    hasClaimedToday,
    refreshStickerWall,
    claimDailySticker,
  };
}
