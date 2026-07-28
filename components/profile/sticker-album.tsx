import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  Star,
  Target,
  Trophy,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Progress } from "@/components/ui/progress";
import { enterStagger } from "@/lib/motion";
import type { NextStickerGoal, StickerAlbumEntry } from "@/lib/child-progression";
import type { ChildTheme, StickerId } from "@/lib/types";
import { semanticColors, type ThemePalette } from "@/lib/theme";
import stickerAlbumCoverImage from "@/assets/images/sticker-album-cover.png";

interface StickerAlbumProps {
  albumStickers: StickerAlbumEntry[];
  nextSticker: NextStickerGoal | null;
  palette: ThemePalette;
  childTheme: ChildTheme;
  onOpenAlbum?: () => void;
}

const THEME_BADGES: Record<ChildTheme, string> = {
  sterne: "Sternenwelt",
  tiere: "Tierpfad",
  galaxy: "Kosmos",
};

const GROUP_META: Record<
  StickerAlbumEntry["group"],
  { title: string; description: string }
> = {
  "erste-schritte": {
    title: "Erste Schritte",
    description: "Die ersten kleinen Erfolge im Alltag.",
  },
  missionen: {
    title: "Missionen",
    description: "Tagesziele, die extra Motivation bringen.",
  },
  "serie-sterne": {
    title: "Serie & Sterne",
    description: "Langfristige Meilensteine für Rhythmus und Sterneschätze.",
  },
};

function getStickerIcon(stickerId: StickerId) {
  switch (stickerId) {
    case "first_task":
      return CheckCircle2;
    case "first_routine":
      return Trophy;
    case "daily_mission_1":
    case "daily_mission_3":
      return Target;
    case "streak_3":
    case "streak_7":
      return Flame;
    case "stars_25":
    case "stars_50":
      return Star;
    case "active_days_10":
      return CalendarDays;
  }
}

function StickerDetailSheet({
  entry,
  palette,
  onClose,
  onOpenAlbum,
}: {
  entry: StickerAlbumEntry | null;
  palette: ThemePalette;
  onClose: () => void;
  onOpenAlbum?: () => void;
}) {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetTopPadding = Math.max(insets.top + 12, 20);
  const sheetBottomPadding = Math.max(insets.bottom + 16, 32);
  const availableSheetHeight = Math.max(1, screenHeight - sheetTopPadding - sheetBottomPadding);
  const sheetMaxHeight = Math.min(screenHeight * 0.9, availableSheetHeight);

  if (!entry) {
    return null;
  }

  const StickerIcon = getStickerIcon(entry.sticker.id);
  const groupMeta = GROUP_META[entry.group];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/45"
        style={{ paddingTop: sheetTopPadding }}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="rounded-t-card px-5 pt-5"
          style={{
            backgroundColor: palette.cardTint,
            maxHeight: sheetMaxHeight,
            paddingBottom: sheetBottomPadding,
          }}
        >
          <View
            className="mb-4 self-center h-1.5 w-16 rounded-full bg-black/10"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-3">
                <View
                  className="h-14 w-14 shrink-0 items-center justify-center rounded-tile"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <StickerIcon
                    size={24}
                    color={palette.accentStrong}
                    fill={StickerIcon === Star ? palette.chartPrimary : "none"}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-xl font-headline text-foreground" numberOfLines={2}>
                    {entry.sticker.title}
                  </Text>
                  <Text className="mt-1 text-sm font-body text-muted-foreground" numberOfLines={1}>
                    {groupMeta.title}
                  </Text>
                </View>
              </View>

              <View
                className="max-w-[112px] shrink-0 rounded-full px-3 py-1.5"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <Text
                  className="text-xs font-body-semibold"
                  style={{ color: palette.accentText }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.86}
                  maxFontSizeMultiplier={1.3}
                >
                  {entry.unlocked ? "Freigeschaltet" : "In Arbeit"}
                </Text>
              </View>
            </View>

            <View
              className="mt-5 rounded-card border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: "rgba(255,255,255,0.76)",
              }}
            >
              <Text className="text-sm font-body text-muted-foreground">
                So bekommst du diesen Sticker
              </Text>
              <Text className="mt-2 text-base font-headline text-foreground">
                {entry.hint}
              </Text>
              <Text className="mt-2 text-sm font-body" style={{ color: palette.accentText }}>
                {entry.sticker.description}
              </Text>
            </View>

            <View className="mt-5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-body-semibold text-muted-foreground">
                  Fortschritt
                </Text>
                <Text
                  className="text-sm font-body-semibold"
                  style={{ color: palette.accentText }}
                >
                  {entry.unlocked ? "100%" : `${entry.current}/${entry.target}`}
                </Text>
              </View>
              <Progress
                value={entry.unlocked ? 100 : entry.progressPercent}
                className="h-3"
                indicatorColor={entry.unlocked ? palette.chartPrimary : palette.chartSecondary}
                trackStyle={{ backgroundColor: "rgba(255,255,255,0.84)" }}
              />
            </View>
          </ScrollView>

          <View className="gap-3">
            {onOpenAlbum ? (
              <Button
                onPress={() => {
                  onClose();
                  onOpenAlbum();
                }}
                className="h-12 rounded-tile"
                style={{ backgroundColor: palette.button }}
                textClassName="text-white"
              >
                Ganzes Album ansehen
              </Button>
            ) : null}
            <Button
              variant="outline"
              onPress={onClose}
              className="h-12 rounded-tile"
              style={{ borderColor: palette.accentBorder }}
            >
              Schließen
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function StickerCard({
  entry,
  palette,
  index,
  onPress,
}: {
  entry: StickerAlbumEntry;
  palette: ThemePalette;
  index: number;
  onPress: (entry: StickerAlbumEntry) => void;
}) {
  const StickerIcon = getStickerIcon(entry.sticker.id);

  const lockedText = semanticColors.mutedForeground;

  return (
    <Animated.View entering={enterStagger(index)} style={{ width: "48.3%", marginBottom: 12 }}>
      <PressableScale
        onPress={() => onPress(entry)}
        containerClassName="w-full"
        className="min-h-[194px] rounded-card border px-3.5 py-3.5"
        style={{
          borderColor: entry.unlocked ? palette.accentBorder : "rgba(148,163,184,0.18)",
          backgroundColor: entry.unlocked ? "rgba(255,255,255,0.84)" : "rgba(255,255,255,0.54)",
        }}
        accessibilityRole="button"
        accessibilityLabel={`${entry.sticker.title}, ${
          entry.unlocked ? "freigeschaltet" : `${entry.current} von ${entry.target}`
        }`}
      >
        <View className="flex-row items-start justify-between gap-2">
          <View
            className="h-12 w-12 items-center justify-center rounded-tile"
            style={{
              backgroundColor: entry.unlocked ? palette.tabActiveBg : "rgba(255,255,255,0.8)",
            }}
          >
            <StickerIcon
              size={20}
              color={entry.unlocked ? palette.accentStrong : lockedText}
              fill={StickerIcon === Star && entry.unlocked ? palette.chartPrimary : "none"}
            />
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{
              backgroundColor: entry.unlocked ? palette.heroSurface : "rgba(255,255,255,0.8)",
            }}
          >
            <Text
              className="text-xs font-body-semibold"
              style={{ color: entry.unlocked ? palette.accentText : lockedText }}
              maxFontSizeMultiplier={1.3}
            >
              {entry.unlocked ? "Frei" : `${entry.current}/${entry.target}`}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-base font-headline text-foreground" numberOfLines={2}>
          {entry.sticker.title}
        </Text>
        <Text
          className="mt-1 text-xs font-body leading-5"
          numberOfLines={3}
          style={{ color: entry.unlocked ? palette.accentText : lockedText }}
        >
          {entry.hint}
        </Text>

        <View className="mt-auto pt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text
              className="text-xs font-body-semibold text-muted-foreground"
              maxFontSizeMultiplier={1.3}
            >
              {entry.unlocked ? "Freigeschaltet" : "Fortschritt"}
            </Text>
            <Text
              className="text-xs font-body-semibold"
              style={{ color: entry.unlocked ? palette.accentText : lockedText }}
              maxFontSizeMultiplier={1.3}
            >
              {entry.unlocked ? "100%" : `${entry.progressPercent}%`}
            </Text>
          </View>
          <Progress
            value={entry.unlocked ? 100 : entry.progressPercent}
            className="h-2.5"
            indicatorColor={entry.unlocked ? palette.chartPrimary : palette.chartSecondary}
            trackStyle={{ backgroundColor: "rgba(255,255,255,0.88)" }}
          />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export function StickerAlbum({
  albumStickers,
  nextSticker,
  palette,
  childTheme,
  onOpenAlbum,
}: StickerAlbumProps) {
  const [selectedSticker, setSelectedSticker] = useState<StickerAlbumEntry | null>(null);
  const unlockedCount = useMemo(
    () => albumStickers.filter((entry) => entry.unlocked).length,
    [albumStickers]
  );
  const groups = Object.entries(GROUP_META).map(([groupKey, meta]) => ({
    key: groupKey as StickerAlbumEntry["group"],
    title: meta.title,
    description: meta.description,
    entries: albumStickers.filter((entry) => entry.group === groupKey),
  }));

  return (
    <Animated.View entering={enterStagger(4)} className="mt-4">
      <Card
        className="overflow-hidden rounded-card px-4 py-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute right-[-14px] top-[-10px] h-24 w-24 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.22 }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <PressableScale
          disabled={!onOpenAlbum}
          onPress={onOpenAlbum}
          accessibilityRole={onOpenAlbum ? "button" : undefined}
          accessibilityLabel={onOpenAlbum ? "Sticker-Album öffnen" : undefined}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Award size={22} color={palette.accentStrong} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-headline text-foreground">Sticker-Album</Text>
                <Text className="mt-1 text-sm font-body text-muted-foreground">
                  Klare Meilensteine statt geheimer Slots.
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <View
                className="rounded-tile px-3 py-2"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
                  maxFontSizeMultiplier={1.3}
                >
                  {THEME_BADGES[childTheme]}
                </Text>
                <Text
                  className="mt-1 text-sm font-headline"
                  style={{ color: palette.accentText }}
                  maxFontSizeMultiplier={1.3}
                >
                  {unlockedCount}/9
                </Text>
              </View>
              {onOpenAlbum ? (
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <ChevronRight size={18} color={palette.accentStrong} />
                </View>
              ) : null}
            </View>
          </View>
        </PressableScale>

        <PressableScale
          disabled={!onOpenAlbum}
          onPress={onOpenAlbum}
          containerClassName="mt-4"
          className="overflow-hidden rounded-tile border"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.74)" }}
          accessibilityRole={onOpenAlbum ? "button" : undefined}
          accessibilityLabel={onOpenAlbum ? "Nächsten Sticker im Album ansehen" : undefined}
        >
          <Image
            source={stickerAlbumCoverImage}
            style={{ width: "100%", aspectRatio: 1.45 }}
            contentFit="cover"
            transition={180}
            accessibilityLabel="Sticker-Album mit Sammelstickern"
          />
          <View className="flex-row items-start justify-between gap-3 px-4 pb-4 pt-4">
            <View className="flex-1">
              <Text
                className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
                maxFontSizeMultiplier={1.3}
              >
                Als Nächstes
              </Text>
              <Text className="mt-1 text-lg font-headline text-foreground">
                {nextSticker ? nextSticker.sticker.title : "Album komplett"}
              </Text>
              <Text className="mt-1 text-sm font-body" style={{ color: palette.accentText }}>
                {nextSticker
                  ? `${nextSticker.hint} Du bist hier gerade am nächsten dran.`
                  : "Alle Sticker sind schon freigeschaltet. Weiter so."}
              </Text>
            </View>
            {onOpenAlbum ? (
              <View
                className="mt-1 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <ChevronRight size={18} color={palette.accentStrong} />
              </View>
            ) : null}
          </View>

          {nextSticker ? (
            <View className="px-4 pb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-body-semibold text-muted-foreground">
                  {nextSticker.current}/{nextSticker.target}
                </Text>
                <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
                  {nextSticker.progressPercent}%
                </Text>
              </View>
              <Progress
                value={nextSticker.progressPercent}
                className="h-3"
                indicatorColor={palette.chartSecondary}
                trackStyle={{ backgroundColor: "rgba(255,255,255,0.84)" }}
              />
            </View>
          ) : null}
        </PressableScale>

        {groups.map((group, groupIndex) => (
          <View key={group.key} className={groupIndex === 0 ? "mt-5" : "mt-6"}>
            <View className="mb-3 flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="text-base font-headline text-foreground">{group.title}</Text>
                <Text className="mt-1 text-sm font-body text-muted-foreground">
                  {group.description}
                </Text>
              </View>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <Text
                  className="text-xs font-body-semibold"
                  style={{ color: palette.accentText }}
                  maxFontSizeMultiplier={1.3}
                >
                  {group.entries.filter((entry) => entry.unlocked).length}/{group.entries.length}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {group.entries.map((entry, entryIndex) => (
                <StickerCard
                  key={entry.sticker.id}
                  entry={entry}
                  palette={palette}
                  index={groupIndex * 4 + entryIndex}
                  onPress={setSelectedSticker}
                />
              ))}
            </View>
          </View>
        ))}
      </Card>

      <StickerDetailSheet
        entry={selectedSticker}
        palette={palette}
        onClose={() => setSelectedSticker(null)}
        onOpenAlbum={onOpenAlbum}
      />
    </Animated.View>
  );
}
