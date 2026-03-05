import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Star, Flame, Trophy } from "lucide-react-native";
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
        className="overflow-hidden"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute inset-x-0 top-0 h-40 rounded-[28px]"
          style={{ backgroundColor: palette.heroSurface }}
        />
        <View className="relative">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center">
              <View
                className="h-20 w-20 items-center justify-center rounded-[28px]"
                style={{ backgroundColor: palette.accentSoft }}
              >
                <Text className="text-4xl">{avatar}</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-sm font-body text-muted-foreground">Profil</Text>
                <Text className="mt-1 text-3xl font-headline text-foreground">
                  {childName}
                </Text>
                <Text className="mt-1 text-sm font-body" style={{ color: palette.accentText }}>
                  Heute weiter Sterne sammeln und Belohnungen freispielen.
                </Text>
              </View>
            </View>
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
            >
              <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                Storyworld
              </Text>
            </View>
          </View>

          <View className="mt-6 flex-row gap-3">
            <View
              className="flex-1 rounded-[22px] px-4 py-4"
              style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
            >
              <View className="flex-row items-center gap-2">
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text className="text-sm font-body-semibold text-muted-foreground">Sterne</Text>
              </View>
              <Text className="mt-3 text-4xl font-headline text-foreground">{stars}</Text>
            </View>

            <View
              className="flex-1 rounded-[22px] px-4 py-4"
              style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
            >
              <View className="flex-row items-center gap-2">
                <Flame size={16} color={palette.chartSecondary} />
                <Text className="text-sm font-body-semibold text-muted-foreground">Serie</Text>
              </View>
              <Text className="mt-3 text-4xl font-headline text-foreground">{streak}</Text>
            </View>
          </View>

          <View
            className="mt-4 flex-row items-center rounded-[22px] px-4 py-4"
            style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.accentSoft }}
            >
              <Trophy size={20} color={palette.accentStrong} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-body text-muted-foreground">Nächste Belohnung</Text>
              <Text className="mt-1 text-lg font-headline text-foreground">
                {nextReward ? nextReward.title : "Alles freigeschaltet"}
              </Text>
            </View>
            <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
              {nextReward ? `${nextReward.missingStars} Sterne` : "Bereit"}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}
