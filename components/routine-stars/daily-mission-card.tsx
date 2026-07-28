import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle2, Sparkles, Star, Trophy } from "@/lib/icons";
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
  const visibleMissionCurrent = Math.min(missionProgress.current, missionProgress.target);

  return (
    <Animated.View entering={FadeInDown.delay(55).duration(320)} className="mt-4">
      <Card
        className="overflow-hidden rounded-[22px]"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute right-[-12px] top-[-10px] h-20 w-20 rounded-full"
          style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
        />
        <View className="flex-row items-start gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-[16px]"
            style={{ backgroundColor: palette.heroSurface }}
          >
            <MissionIcon size={20} color={palette.accentStrong} />
          </View>
          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Heute-Mission
              </Text>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: palette.tabActiveBg }}
              >
                <Text
                  className="text-xs font-body-semibold"
                  style={{ color: palette.accentText }}
                >
                  Ziel
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-[22px] font-headline leading-[28px] text-foreground">
              {mission.title}
            </Text>
            <Text className="mt-1 text-sm font-body leading-6 text-muted-foreground">
              {mission.description}
            </Text>
          </View>
        </View>

        <View
          className="mt-4 rounded-[18px] px-3.5 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <View className="mb-2 flex-row items-center justify-between gap-3">
            <Text className="text-sm font-body-semibold text-muted-foreground">
              {visibleMissionCurrent} von {missionProgress.target} {missionProgress.unitLabel}
            </Text>
            <Text className="shrink-0 text-sm font-headline" style={{ color: palette.accentText }}>
              {isMissionComplete
                ? "Geschafft"
                : `${visibleMissionCurrent}/${missionProgress.target}`}
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
          className="mt-4 rounded-[18px] border px-4 py-3"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.74)" }}
        >
          <View className="flex-row items-start gap-2">
            <CheckCircle2
              size={16}
              color={isMissionComplete ? palette.accentStrong : palette.chartSecondary}
            />
            <Text className="min-w-0 flex-1 text-sm font-body-semibold leading-5 text-foreground">
              {isMissionComplete
                ? "Mission geschafft. Der nächste Meilenstein rückt näher."
                : "Wenn du fertig bist, wächst dein Tagesfortschritt weiter."}
            </Text>
          </View>

          {recentUnlocks.length > 0 ? (
            <View
              className="mt-3 rounded-[18px] px-3 py-3"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Neue Meilensteine
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
