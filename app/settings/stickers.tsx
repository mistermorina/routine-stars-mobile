import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CalendarDays, CheckCircle2, ShieldCheck, Sparkles } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useStickerWall } from "@/hooks/use-sticker-wall";
import { Card } from "@/components/ui/card";
import { AvatarImage } from "@/components/ui/avatar-image";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { SettingsMetricCard } from "@/components/settings/settings-metric-card";
import { StickerWall } from "@/components/stickers/sticker-wall";
import {
  STICKER_CATALOG,
  getAnimalSticker,
  getStickerRarityLabel,
} from "@/lib/animal-stickers";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { StickerRewardMode } from "@/lib/types";

const REWARD_MODE_OPTIONS: {
  value: StickerRewardMode;
  title: string;
  description: string;
  icon: typeof CheckCircle2;
}[] = [
  {
    value: "routine_complete",
    title: "Jede abgeschlossene Routine",
    description: "Ein Sticker wird angeboten, sobald eine Routine vollständig erledigt ist.",
    icon: CheckCircle2,
  },
  {
    value: "daily_complete",
    title: "Ganzer Tag abgeschlossen",
    description: "Ein Sticker wird erst angeboten, wenn alle Routinen des Tages fertig sind.",
    icon: CalendarDays,
  },
];

function formatDateLabel(value: string) {
  const [, month, day] = value.split("-");
  return day && month ? `${day}.${month}.` : value;
}

export default function StickerSettingsScreen() {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const {
    collectedEntries,
    isLoading,
    rewardModeLabel,
    settings,
    updateRewardSettings,
  } = useStickerWall(selectedChildId);
  const palette = getThemePalette(selectedChild?.theme);
  const collectedStickerIds = useMemo(
    () => new Set(collectedEntries.map((entry) => entry.stickerId)),
    [collectedEntries]
  );
  const uniqueCollectedCount = collectedStickerIds.size;
  const remainingCount = Math.max(STICKER_CATALOG.length - uniqueCollectedCount, 0);
  const latestEntries = useMemo(
    () =>
      [...collectedEntries]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 3),
    [collectedEntries]
  );

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <SettingsHeroCard
          label="Sticker-System"
          title="Belohnungslogik"
          description="Hier siehst du, welche Sticker bereits gesammelt wurden und wann neue Sticker freigeschaltet werden."
          badges={[
            { label: "Aktiv", value: rewardModeLabel },
            { label: "Sticker", value: `${uniqueCollectedCount}/${STICKER_CATALOG.length}` },
          ]}
          palette={palette}
        />

        {children.length > 1 ? (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {children.map((child) => {
              const childPalette = getThemePalette(child.theme);
              const isSelected = selectedChildId === child.id;

              return (
                <Pressable
                  key={child.id}
                  onPress={() => selectChild(child.id)}
                  className="min-h-11 flex-row items-center rounded-full border px-4 py-2"
                  accessibilityRole="button"
                  accessibilityLabel={`${child.name} auswählen`}
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    backgroundColor: isSelected ? childPalette.tabActiveBg : "rgba(255,255,255,0.78)",
                    borderColor: isSelected ? childPalette.accent : "rgba(157,184,216,0.32)",
                  }}
                >
                  <AvatarImage
                    avatar={child.avatar}
                    size={24}
                    borderRadius={12}
                    className="mr-1.5"
                    accessibilityLabel={`${child.name} Avatar`}
                  />
                  <Text
                    className="text-sm font-body-semibold"
                    style={{ color: isSelected ? childPalette.accentText : "#1a1a2e" }}
                    numberOfLines={1}
                  >
                    {child.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="flex-row gap-3">
        <SettingsMetricCard
          label="Gesammelt"
          value={`${uniqueCollectedCount}`}
          caption="Einmalige Sticker"
          accentColor={palette.accentText}
          backgroundColor={palette.cardTint}
          borderColor={palette.accentBorder}
        />
        <SettingsMetricCard
          label="Offen"
          value={`${remainingCount}`}
          caption="3 Themenwelten"
          accentColor={palette.chartSecondary}
          backgroundColor={palette.cardTint}
          borderColor={palette.accentBorder}
        />
      </View>

      <Animated.View entering={FadeInDown.delay(80).duration(300)} className="mt-4">
        <Card
          className="overflow-hidden rounded-[28px] px-4 py-4"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-start gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <ShieldCheck size={21} color={palette.accentStrong} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-headline text-foreground">
                Aktive Freischaltung
              </Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Diese Einstellung gilt lokal für alle Kinderprofile auf diesem Gerät.
              </Text>
            </View>
          </View>

          <View className="mt-4 gap-3">
            {REWARD_MODE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = settings.rewardMode === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => void updateRewardSettings({ rewardMode: option.value })}
                  className={cn(
                    "rounded-[22px] border px-4 py-4 active:opacity-90",
                    isSelected ? "" : "border-border"
                  )}
                  style={{
                    backgroundColor: isSelected ? palette.tabActiveBg : "rgba(255,255,255,0.72)",
                    borderColor: isSelected ? palette.accent : palette.accentBorder,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-[16px]"
                      style={{ backgroundColor: isSelected ? "#FFFFFF" : palette.heroSurface }}
                    >
                      <Icon
                        size={19}
                        color={isSelected ? palette.accentStrong : palette.accentText}
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-base font-headline text-foreground">
                        {option.title}
                      </Text>
                      <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                        {option.description}
                      </Text>
                    </View>
                    {isSelected ? (
                      <View
                        className="mt-1 rounded-full px-2.5 py-1"
                        style={{ backgroundColor: "#FFFFFF" }}
                      >
                        <Text
                          className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                          style={{ color: palette.accentText }}
                        >
                          Aktiv
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </Animated.View>

      <StickerWall entries={collectedEntries} palette={palette} />

      <Animated.View entering={FadeInDown.delay(150).duration(300)} className="mt-4">
        <Card
          className="overflow-hidden rounded-[28px] px-4 py-4"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-start gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Sparkles size={21} color={palette.accentStrong} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-headline text-foreground">
                Zuletzt freigeschaltet
              </Text>
              <Text className="mt-1 text-sm font-body text-muted-foreground">
                Routine-Name und Datum helfen beim schnellen Elternüberblick.
              </Text>
            </View>
          </View>

          {isLoading ? (
            <Text className="mt-4 text-sm font-body text-muted-foreground">Laden...</Text>
          ) : latestEntries.length === 0 ? (
            <View
              className="mt-4 rounded-[22px] border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: "rgba(255,255,255,0.72)",
              }}
            >
              <Text className="text-base font-headline text-foreground">
                Noch keine Sticker gesammelt
              </Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Sobald eine Routine abgeschlossen wird, erscheint der erste Sticker hier.
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-3">
              {latestEntries.map((entry) => {
                const sticker = getAnimalSticker(entry.stickerId);

                return (
                  <View
                    key={entry.id}
                    className="flex-row items-center gap-3 rounded-[22px] border px-3 py-3"
                    style={{
                      borderColor: palette.accentBorder,
                      backgroundColor: "rgba(255,255,255,0.72)",
                    }}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-[16px]"
                      style={{ backgroundColor: `${sticker.accent}18` }}
                    >
                      <Text className="text-base font-headline" style={{ color: sticker.accent }}>
                        {sticker.unlockOrder}
                      </Text>
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-base font-headline text-foreground" numberOfLines={1}>
                        {sticker.title}
                      </Text>
                      <Text className="mt-1 text-xs font-body text-muted-foreground" numberOfLines={1}>
                        {entry.routineName ?? "Routine"} am {formatDateLabel(entry.earnedDate)}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: palette.tabActiveBg }}
                    >
                      <Text
                        className="text-xs font-body-semibold"
                        style={{ color: palette.accentText }}
                      >
                        {getStickerRarityLabel(sticker.rarity)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </Animated.View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
