import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { ArrowLeft, Award } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useStickerWall } from "@/hooks/use-sticker-wall";
import { StickerWallGallery } from "@/components/stickers/sticker-wall";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { enterFade } from "@/lib/motion";
import { getThemePalette } from "@/lib/theme";
import type { StickerAssetId, StickerCollectionEntry } from "@/lib/types";

/**
 * The dashboard pushes this route ~360ms after a sticker is claimed, so an entry
 * younger than this window is the sticker the child just unlocked.
 */
const FRESH_UNLOCK_WINDOW_MS = 30_000;
const SKELETON_TILE_COUNT = 12;

/**
 * Which sticker gets the "landed just now" treatment. Prefers an explicit route
 * param (`/sticker-album?highlightStickerId=…`) and otherwise falls back to the
 * freshest collected entry — both derived from existing data, nothing persisted.
 */
function getHighlightStickerId(
  paramValue: string | string[] | undefined,
  entries: StickerCollectionEntry[]
): StickerAssetId | null {
  const requestedId = Array.isArray(paramValue) ? paramValue[0] : paramValue;

  if (requestedId) {
    const requested = entries.find((entry) => entry.stickerId === requestedId);

    if (requested) {
      return requested.stickerId;
    }
  }

  const newest = entries.reduce<StickerCollectionEntry | null>((latest, entry) => {
    if (!latest) {
      return entry;
    }

    return Date.parse(entry.createdAt) > Date.parse(latest.createdAt) ? entry : latest;
  }, null);

  if (!newest) {
    return null;
  }

  const age = Date.now() - Date.parse(newest.createdAt);

  return Number.isFinite(age) && age >= 0 && age < FRESH_UNLOCK_WINDOW_MS
    ? newest.stickerId
    : null;
}

export default function StickerAlbumScreen() {
  const router = useRouter();
  const { highlightStickerId: highlightParam } = useLocalSearchParams<{
    highlightStickerId?: string;
  }>();
  const { selectedChild, selectedChildId, isLoading } = useChildren();
  const { collectedEntries, isLoading: isLoadingStickers } = useStickerWall(selectedChildId);
  const palette = getThemePalette(selectedChild?.theme);
  const highlightStickerId = useMemo(
    () => getHighlightStickerId(highlightParam, collectedEntries),
    [collectedEntries, highlightParam]
  );

  if (isLoading || isLoadingStickers) {
    return (
      <ThemedScreenBackground
        theme={selectedChild?.theme}
        backgroundSkin={selectedChild?.backgroundSkin}
      >
        <SafeAreaView className="flex-1">
          <View className="px-4 pb-3 pt-2">
            <View className="flex-row items-center justify-between gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="flex-1 items-center gap-2">
                <Skeleton className="h-7 w-48 rounded-chip" />
                <Skeleton className="h-4 w-40 rounded-chip" />
              </View>
              <Skeleton className="h-12 w-12 rounded-full" />
            </View>
          </View>
          <View className="mx-4 flex-row flex-wrap justify-between rounded-card px-3 pt-3">
            {Array.from({ length: SKELETON_TILE_COUNT }).map((_, index) => (
              <Skeleton key={index} className="mb-3 h-[78px] w-[23%] rounded-tile" />
            ))}
          </View>
        </SafeAreaView>
      </ThemedScreenBackground>
    );
  }

  if (!selectedChild) {
    return (
      <ThemedScreenBackground>
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-xl font-headline text-foreground">
              Kein Profil gefunden
            </Text>
            <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
              Erstelle zuerst ein Kinderprofil, um Sticker zu sammeln.
            </Text>
          </View>
        </SafeAreaView>
      </ThemedScreenBackground>
    );
  }

  return (
    <ThemedScreenBackground
      theme={selectedChild.theme}
      backgroundSkin={selectedChild.backgroundSkin}
    >
      <SafeAreaView className="flex-1">
        <Animated.View entering={enterFade()} className="px-4 pb-3 pt-2">
          <View className="flex-row items-center justify-between gap-3">
            <PressableScale
              onPress={() => router.back()}
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Zurück"
            >
              <ArrowLeft size={22} color={palette.accentText} />
            </PressableScale>

            <View className="flex-1">
              <Text
                className="text-center text-3xl font-headline text-foreground"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                Sticker-Galerie
              </Text>
              <Text
                className="text-center text-sm font-body"
                style={{ color: palette.accentText }}
                numberOfLines={1}
              >
                {selectedChild.name}s gesammelte Routine-Sticker
              </Text>
            </View>

            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Award size={20} color={palette.accentStrong} />
            </View>
          </View>
        </Animated.View>

        {/*
          The gallery IS the scroll container (virtualized FlatList) — never wrap
          it in a ScrollView, that would nest two virtualized lists.
        */}
        <StickerWallGallery
          entries={collectedEntries}
          palette={palette}
          highlightStickerId={highlightStickerId}
          bottomInset={24}
        />
      </SafeAreaView>
    </ThemedScreenBackground>
  );
}
