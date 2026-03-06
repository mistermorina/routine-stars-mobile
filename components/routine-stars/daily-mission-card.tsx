import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle2, Sparkles, Star, Trophy } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MissionProgress } from "@/lib/child-progression";
import type { DailyMission, StickerDefinition } from "@/lib/types";
import type { ThemePalette } from "@/lib/theme";

interface DailyMissionCardProps {
  mission: DailyMission | null;
  missionProgress: MissionProgress | null;
  isMissionComplete: boolean;
  recentUnlocks: StickerDefinition[];
  palette: ThemePalette;
}

function getMissionIcon(kind?: DailyMission["kind"]) {
  switch (kind) {
    case "earn_5_stars":
      return Star;
    case "complete_1_routine":
      return Trophy;
    default:
      return Sparkles;
  }
}

export function DailyMissionCard({
  mission,
  missionProgress,
  isMissionComplete,
  recentUnlocks,
  palette,
}: DailyMissionCardProps) {
  if (!mission || !missionProgress) {
    return null;
  }

  const MissionIcon = getMissionIcon(mission.kind);

  return (
    <Animated.View entering={FadeInDown.delay(55).duration(320)} className="mt-4">
      <Card
        className="overflow-hidden rounded-[28px]"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute right-[-12px] top-[-10px] h-20 w-20 rounded-full"
          style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
        />
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 flex-row">
            <View
              className="h-12 w-12 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <MissionIcon size={20} color={palette.accentStrong} />
            </View>
            <View className="ml-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                  Heute-Mission
                </Text>
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text
                    className="text-[10px] font-body-semibold"
                    style={{ color: palette.accentText }}
                  >
                    Album
                  </Text>
                </View>
              </View>
              <Text className="mt-1 text-xl font-headline text-foreground">{mission.title}</Text>
              <Text className="mt-1 text-sm font-body leading-6 text-muted-foreground">
                {mission.description}
              </Text>
            </View>
          </View>
          <View
            className="rounded-[18px] px-3 py-2"
            style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
          >
            <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
              Fortschritt
            </Text>
            <Text className="mt-1 text-sm font-headline" style={{ color: palette.accentText }}>
              {Math.min(missionProgress.current, missionProgress.target)}/{missionProgress.target}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-sm font-body-semibold text-muted-foreground">
              {missionProgress.current} von {missionProgress.target} {missionProgress.unitLabel}
            </Text>
            <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
              {isMissionComplete ? "Geschafft" : `${missionProgress.progressPercent}%`}
            </Text>
          </View>
          <Progress
            value={missionProgress.progressPercent}
            className="h-3"
            indicatorColor={palette.chartPrimary}
            trackStyle={{ backgroundColor: "rgba(255,255,255,0.82)" }}
          />
        </View>

        <View
          className="mt-4 rounded-[22px] border px-4 py-3"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.74)" }}
        >
          <View className="flex-row items-center gap-2">
            <CheckCircle2
              size={16}
              color={isMissionComplete ? palette.accentStrong : palette.chartSecondary}
            />
            <Text className="text-sm font-body-semibold text-foreground">
              {isMissionComplete
                ? "Mission geschafft. Heute wartet ein neuer Sticker-Moment."
                : "Wenn du fertig bist, wartet ein neuer Sticker im Album."}
            </Text>
          </View>

          {recentUnlocks.length > 0 ? (
            <View
              className="mt-3 rounded-[18px] px-3 py-3"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Neu im Album
              </Text>
              <Text className="mt-1 text-sm font-headline text-foreground">
                {recentUnlocks.map((sticker) => sticker.title).join(" • ")}
              </Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Animated.View>
  );
}
