import React from "react";
import { Pressable, View, Text, useWindowDimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Settings, Star, Flame, Trophy, Sparkles } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { AvatarImage } from "@/components/ui/avatar-image";
import { SoftHeroWash } from "@/components/ui/soft-hero-wash";
import type { ThemePalette } from "@/lib/theme";
import type { Child } from "@/lib/types";

interface ProfileHeroCardProps {
  child: Child;
  allChildren?: Child[];
  stars: number;
  streak: number;
  nextReward?: { title: string; missingStars: number } | null;
  palette: ThemePalette;
  onSelectChild?: (id: string) => void;
  onSettingsPress?: () => void;
}

export function ProfileHeroCard({
  child,
  allChildren,
  stars,
  streak,
  nextReward,
  palette,
  onSelectChild,
  onSettingsPress,
}: ProfileHeroCardProps) {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  const hasChildSwitcher = Boolean(allChildren && allChildren.length > 1 && onSelectChild);

  return (
    <Animated.View entering={FadeInDown.duration(320)}>
      <Card
        className="overflow-hidden rounded-[24px] px-4 pb-4 pt-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <SoftHeroWash
          surfaceColor={palette.heroSurface}
          baseColor={palette.cardTint}
          holdOffset="48%"
        />
        <View
          className="absolute right-[-30px] top-[-26px] h-36 w-36 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.28 }}
        />
        <View
          className="absolute left-[-18px] bottom-10 h-24 w-24 rounded-full"
          style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
        />
        <View className="relative">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center">
              <View
                className="h-[92px] w-[92px] items-center justify-center rounded-[26px]"
                style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
              >
                <AvatarImage
                  avatar={child.avatar}
                  size={92}
                  borderRadius={26}
                  backgroundColor="transparent"
                  accessibilityLabel={`${child.name} Avatar`}
                />
              </View>
              <View className="ml-4 min-w-0 flex-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text className="text-sm font-body text-muted-foreground">Profil</Text>
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                  >
                    <Text className="text-xs font-body-semibold uppercase tracking-[0.6px]" style={{ color: palette.accentText }} numberOfLines={1}>
                      Storyworld
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Sparkles size={12} color={palette.accentStrong} />
                    <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }} numberOfLines={1}>
                      Im Flow
                    </Text>
                  </View>
                </View>
                <Text
                  className="mt-1 text-[34px] font-headline leading-[39px] text-foreground"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                >
                  {child.name}
                </Text>
                <Text className="mt-1 text-base font-body leading-6" style={{ color: palette.accentText }}>
                  Fortschritt, Sterne und schöne Momente an einem Ort.
                </Text>
              </View>
            </View>
            {onSettingsPress ? (
              <Pressable
                onPress={onSettingsPress}
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Elternbereich öffnen"
              >
                <Settings size={20} color={palette.accentText} />
              </Pressable>
            ) : null}
          </View>

          <View className={isCompactWidth ? "mt-5 gap-3" : "mt-5 flex-row gap-3"}>
            <View
              className={isCompactWidth ? "rounded-[18px] px-4 py-3.5" : "flex-1 rounded-[18px] px-4 py-3.5"}
              style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
            >
              <View className="flex-row items-center gap-2">
                <Star size={17} color="#FFD700" fill="#FFD700" />
                <Text className="text-sm font-body-semibold text-muted-foreground">Sterne</Text>
              </View>
              <Text className="mt-2 text-[34px] font-headline leading-[39px] text-foreground">
                {stars}
              </Text>
              <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                Verfügbar für Wünsche.
              </Text>
            </View>

            <View
              className={isCompactWidth ? "rounded-[18px] px-4 py-3.5" : "flex-1 rounded-[18px] px-4 py-3.5"}
              style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
            >
              <View className="flex-row items-center gap-2">
                <Flame size={17} color={palette.chartSecondary} />
                <Text className="text-sm font-body-semibold text-muted-foreground">Serie</Text>
              </View>
              <Text className="mt-2 text-[34px] font-headline leading-[39px] text-foreground">
                {streak}
              </Text>
              <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                Tage im Rhythmus.
              </Text>
            </View>
          </View>

          <View
            className="mt-3 rounded-[18px] border px-4 py-3.5"
            style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.76)" }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-12 w-12 shrink-0 items-center justify-center rounded-[18px]"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <Trophy size={20} color={palette.accentStrong} />
              </View>
              <View className="min-w-0 flex-1">
                <View className="flex-row items-start gap-2">
                  <View className="min-w-0 flex-1">
                    <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                      Nächster Moment
                    </Text>
                    <Text
                      className="mt-1 min-w-0 text-lg font-headline text-foreground"
                      numberOfLines={2}
                    >
                      {nextReward ? nextReward.title : "Alles freigeschaltet"}
                    </Text>
                  </View>
                  <View
                    className="max-w-[96px] shrink-0 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Text
                      className="text-xs font-body-semibold"
                      style={{ color: palette.accentText }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {nextReward ? `${nextReward.missingStars} offen` : "Bereit"}
                    </Text>
                  </View>
                </View>
                <Text className="mt-1 text-base font-body leading-6" style={{ color: palette.accentText }}>
                  {nextReward
                    ? `${nextReward.missingStars} Sterne fehlen noch bis zur nächsten Belohnung.`
                    : "Gerade ist alles freigeschaltet und bereit."}
                </Text>
              </View>
            </View>
          </View>

          {hasChildSwitcher ? (
            <View className="mt-3">
              <Text className="mb-2 text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Kind wechseln
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {allChildren?.map((entry) => {
                  const isActive = entry.id === child.id;
                  return (
                    <Pressable
                      key={entry.id}
                      onPress={() => onSelectChild?.(entry.id)}
                      className="h-12 w-12 items-center justify-center rounded-full border"
                      style={{
                        backgroundColor: isActive ? palette.tabActiveBg : "rgba(255,255,255,0.78)",
                        borderColor: isActive ? palette.accent : palette.accentBorder,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${entry.name} auswählen`}
                    >
                      <AvatarImage
                        avatar={entry.avatar}
                        size={48}
                        borderRadius={24}
                        backgroundColor="transparent"
                        accessibilityLabel={`${entry.name} Avatar`}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}
        </View>
      </Card>
    </Animated.View>
  );
}
