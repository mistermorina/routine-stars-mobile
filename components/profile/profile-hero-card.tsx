import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Star, Flame, Trophy, Sparkles } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import type { ThemePalette } from "@/lib/theme";

interface ProfileHeroCardProps {
  avatar: string;
  childName: string;
  stars: number;
  streak: number;
  nextReward?: { title: string; missingStars: number } | null;
  palette: ThemePalette;
}

export function ProfileHeroCard({
  avatar,
  childName,
  stars,
  streak,
  nextReward,
  palette,
}: ProfileHeroCardProps) {
  return (
    <Animated.View entering={FadeInDown.duration(320)}>
      <Card
        className="overflow-hidden rounded-[32px] px-5 pb-5 pt-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute inset-x-0 top-0 h-44 rounded-[32px]"
          style={{ backgroundColor: palette.heroSurface }}
        />
        <View
          className="absolute right-[-18px] top-[-10px] h-28 w-28 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.3 }}
        />
        <View
          className="absolute left-[-10px] bottom-8 h-20 w-20 rounded-full"
          style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
        />
        <View className="relative">
          <View className="flex-row items-start justify-between">
            <View className="mr-4 flex-1 flex-row items-center">
              <View
                className="h-24 w-24 items-center justify-center rounded-[32px]"
                style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
              >
                <Text className="text-5xl">{avatar}</Text>
              </View>
              <View className="ml-4 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-body text-muted-foreground">Profil</Text>
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                  >
                    <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px]" style={{ color: palette.accentText }}>
                      Storyworld
                    </Text>
                  </View>
                </View>
                <Text className="mt-2 text-[32px] font-headline text-foreground">
                  {childName}
                </Text>
                <Text className="mt-2 text-sm font-body leading-6" style={{ color: palette.accentText }}>
                  Heute weiter Sterne sammeln und Belohnungen freispielen.
                </Text>
              </View>
            </View>
            <View
              className="rounded-[20px] px-3.5 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
            >
              <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Heute
              </Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                <Sparkles size={14} color={palette.accentStrong} />
                <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                  Im Flow
                </Text>
              </View>
            </View>
          </View>

          <View
            className="mt-5 rounded-[24px] border px-4 py-4"
            style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.74)" }}
          >
            <View className="flex-row items-center">
              <View
                className="h-12 w-12 items-center justify-center rounded-[18px]"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <Trophy size={20} color={palette.accentStrong} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                  Nächster schöner Moment
                </Text>
                <Text className="mt-1 text-lg font-headline text-foreground">
                  {nextReward ? nextReward.title : "Alles freigeschaltet"}
                </Text>
                <Text className="mt-1 text-xs font-body" style={{ color: palette.accentText }}>
                  {nextReward
                    ? `${nextReward.missingStars} Sterne fehlen noch bis zur nächsten Belohnung.`
                    : "Gerade ist alles freigeschaltet und bereit."}
                </Text>
              </View>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <Text className="text-[10px] font-body-semibold" style={{ color: palette.accentText }}>
                  {nextReward ? `${nextReward.missingStars} offen` : "Bereit"}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View
              className="flex-1 rounded-[22px] px-4 py-4"
              style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text className="text-sm font-body-semibold text-muted-foreground">Sterne</Text>
                </View>
                <View
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-[10px] font-body-semibold" style={{ color: palette.accentText }}>
                    gesammelt
                  </Text>
                </View>
              </View>
              <Text className="mt-3 text-4xl font-headline text-foreground">{stars}</Text>
              <Text className="mt-1 text-xs font-body text-muted-foreground">
                Jeder kleine Schritt macht die Wunschliste erreichbarer.
              </Text>
            </View>

            <View
              className="flex-1 rounded-[22px] px-4 py-4"
              style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Flame size={16} color={palette.chartSecondary} />
                  <Text className="text-sm font-body-semibold text-muted-foreground">Serie</Text>
                </View>
                <View
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-[10px] font-body-semibold" style={{ color: palette.accentText }}>
                    Tage
                  </Text>
                </View>
              </View>
              <Text className="mt-3 text-4xl font-headline text-foreground">{streak}</Text>
              <Text className="mt-1 text-xs font-body text-muted-foreground">
                Ein stetiger Rhythmus macht Fortschritt sichtbar.
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}
