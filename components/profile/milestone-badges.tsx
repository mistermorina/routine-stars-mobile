import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Flame, Lock, Sparkles, Star } from "lucide-react-native";

import type { ThemePalette } from "@/lib/theme";

interface MilestoneBadgesProps {
  totalStars: number;
  streak: number;
  stickerCount: number;
  palette: ThemePalette;
}

interface MilestoneDef {
  id: string;
  value: string;
  label: string;
  icon: typeof Star;
  achieved: boolean;
}

/**
 * Read-only achievement badges derived from existing data
 * (stars earned, streak, collected stickers) — no new progression logic.
 */
export function MilestoneBadges({
  totalStars,
  streak,
  stickerCount,
  palette,
}: MilestoneBadgesProps) {
  const { width } = useWindowDimensions();
  const badgeWidth = width < 380 ? "31%" : "23%";
  const milestones: MilestoneDef[] = [
    { id: "streak-3", value: "3", label: "Tage-Serie", icon: Flame, achieved: streak >= 3 },
    { id: "streak-7", value: "7", label: "Tage-Serie", icon: Flame, achieved: streak >= 7 },
    { id: "stars-25", value: "25", label: "Sterne", icon: Star, achieved: totalStars >= 25 },
    { id: "stars-50", value: "50", label: "Sterne", icon: Star, achieved: totalStars >= 50 },
    { id: "stars-100", value: "100", label: "Sterne", icon: Star, achieved: totalStars >= 100 },
    { id: "sticker-5", value: "5", label: "Sticker", icon: Sparkles, achieved: stickerCount >= 5 },
    { id: "sticker-10", value: "10", label: "Sticker", icon: Sparkles, achieved: stickerCount >= 10 },
  ];
  // Achieved badges first, then the next goals — kids see wins before gaps.
  const sorted = [...milestones].sort((a, b) => Number(b.achieved) - Number(a.achieved));
  const achievedCount = milestones.filter((entry) => entry.achieved).length;

  return (
    <View>
      <View className="flex-row items-center justify-between gap-3 px-1">
        <Text className="text-lg font-headline text-foreground">Meilensteine</Text>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
        >
          <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
            {achievedCount} erreicht
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2 px-1 py-3">
        {sorted.map((milestone) => {
          const Icon = milestone.icon;
          return (
            <View
              key={milestone.id}
              className="min-h-[132px] items-center rounded-tile border px-2 py-3"
              style={{
                width: badgeWidth,
                backgroundColor: milestone.achieved ? palette.cardTint : "rgba(255,255,255,0.6)",
                borderColor: milestone.achieved ? palette.accentBorder : "#E7EDF3",
              }}
              accessibilityLabel={`Meilenstein ${milestone.value} ${milestone.label}${milestone.achieved ? ", erreicht" : ", noch offen"}`}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: milestone.achieved ? palette.surface : "#F1F4F8",
                  borderWidth: 2,
                  borderColor: milestone.achieved ? "#F7C948" : "#E2E8EF",
                }}
              >
                {milestone.achieved ? (
                  <Icon size={20} color="#B97E0B" fill={milestone.icon === Star ? "#F7C948" : "none"} />
                ) : (
                  <Lock size={16} color="#ADB7C2" />
                )}
              </View>
              <Text
                className="mt-2 text-base font-headline leading-5"
                style={{ color: milestone.achieved ? palette.accentText : "#ADB7C2" }}
              >
                {milestone.value}
              </Text>
              <Text
                className="text-xs font-body-semibold"
                style={{ color: milestone.achieved ? "#6B7785" : "#ADB7C2" }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {milestone.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
