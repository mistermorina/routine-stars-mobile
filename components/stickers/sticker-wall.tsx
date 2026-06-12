import React from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChevronRight, Sparkles } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import {
  STICKER_CATALOG,
  getStickerRarityLabel,
  getStickerThemeWorldLabel,
} from "@/lib/animal-stickers";
import type { ThemePalette } from "@/lib/theme";
import type { StickerCollectionEntry } from "@/lib/types";

interface StickerWallProps {
  entries: StickerCollectionEntry[];
  palette: ThemePalette;
  compact?: boolean;
  onOpenWall?: () => void;
}

function formatDateLabel(value: string) {
  const [, month, day] = value.split("-");
  return day && month ? `${day}.${month}.` : value;
}

export function StickerWall({
  entries,
  palette,
  compact = false,
  onOpenWall,
}: StickerWallProps) {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  const catalogStickers = compact ? STICKER_CATALOG.slice(0, 8) : STICKER_CATALOG;
  const entriesByStickerId = new Map(entries.map((entry) => [entry.stickerId, entry]));
  const filledCount = entries.length;
  const totalCount = STICKER_CATALOG.length;
  const stickerTileWidth = isCompactWidth ? "31%" : "23%";

  return (
    <Animated.View entering={FadeInDown.delay(155).duration(320)} className="mt-4">
      <Card
        className="overflow-hidden rounded-[24px] px-4 py-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute right-[-18px] top-[-18px] h-28 w-28 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.2 }}
        />
        <Pressable
          disabled={!onOpenWall}
          onPress={onOpenWall}
          className="active:opacity-95"
          accessibilityRole={onOpenWall ? "button" : undefined}
          accessibilityLabel={onOpenWall ? "Sticker-Galerie öffnen" : undefined}
        >
          <View className={isCompactWidth ? "gap-3" : "flex-row items-start justify-between gap-3"}>
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View
                className="h-12 w-12 shrink-0 items-center justify-center rounded-[18px]"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Sparkles size={21} color={palette.accentStrong} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-headline text-foreground" numberOfLines={1}>
                  Sticker-Galerie
                </Text>
                <Text className="mt-1 text-base font-body leading-6 text-muted-foreground" numberOfLines={2}>
                  Sammle Sticker aus vielen Themenwelten nach geschafften Routinen.
                </Text>
              </View>
            </View>
            <View className="shrink-0 flex-row items-center gap-2">
              <View
                className="min-h-11 rounded-[18px] px-3 py-2"
                style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
              >
                <Text className="text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground" numberOfLines={1}>
                  Gesammelt
                </Text>
                <Text className="mt-1 text-sm font-headline" style={{ color: palette.accentText }}>
                  {Math.min(filledCount, totalCount)}/{totalCount}
                </Text>
              </View>
              {onOpenWall ? (
                <View
                  className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <ChevronRight size={18} color={palette.accentStrong} />
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>

        <View
          className="mt-4 flex-row flex-wrap justify-between rounded-[22px] border px-3 py-3"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.62)" }}
        >
          {catalogStickers.map((sticker) => {
            const entry = entriesByStickerId.get(sticker.id);
            return (
              <View
                key={sticker.id}
                className="mb-3 items-center"
                style={{ width: stickerTileWidth }}
              >
                <View
                  className="h-[78px] w-full items-center justify-center rounded-[18px] border"
                  style={{
                    backgroundColor: entry ? `${sticker.accent}14` : "rgba(255,255,255,0.58)",
                    borderColor: entry ? `${sticker.accent}55` : "rgba(157,184,216,0.32)",
                  }}
                >
                  {entry ? (
                    <Image
                      source={sticker.asset}
                      style={{ width: 62, height: 62 }}
                      contentFit="contain"
                      transition={160}
                    />
                  ) : (
                    <Text className="text-lg font-headline text-muted-foreground">?</Text>
                  )}
                </View>
                <Text
                  className="mt-1 min-h-5 text-xs font-body-semibold"
                  style={{ color: entry ? palette.accentText : "#A3A3A3" }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                >
                  {entry ? formatDateLabel(entry.earnedDate) : getStickerRarityLabel(sticker.rarity)}
                </Text>
                {!compact ? (
                  <Text
                    className="min-h-5 text-xs font-body text-muted-foreground"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  >
                    {entry?.routineName ?? getStickerThemeWorldLabel(sticker.themeWorld)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </Card>
    </Animated.View>
  );
}
