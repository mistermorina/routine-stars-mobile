import React, { useCallback, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Trophy, Star, Sparkles } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { Header } from "@/components/routine-stars/header";
import { RewardsOverview } from "@/components/routine-stars/rewards-overview";
import { Card } from "@/components/ui/card";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import type { Reward } from "@/lib/types";

export default function RewardsScreen() {
  const {
    children,
    selectedChild,
    selectChild,
    deductStars,
    isLoading,
  } = useChildren();
  const { toast } = useToast();
  const { rewards, isLoading: rewardsLoading } = useRewards();
  const palette = getThemePalette(selectedChild?.theme);
  const sortedRewards = useMemo(
    () => [...rewards].sort((left, right) => left.cost - right.cost),
    [rewards]
  );
  const nextReward = selectedChild
    ? sortedRewards.find((reward) => reward.cost > selectedChild.stars)
    : undefined;
  const missingStars = nextReward && selectedChild
    ? nextReward.cost - selectedChild.stars
    : 0;
  const availableRewards = selectedChild
    ? sortedRewards.filter((reward) => reward.cost <= selectedChild.stars).length
    : 0;

  const handleRedeem = useCallback(
    async (reward: Reward) => {
      if (!selectedChild) return;
      if (selectedChild.stars < reward.cost) return;

      await deductStars(selectedChild.id, reward.cost);
      void triggerFeedback("reward_redeemed");
      toast({
        title: "Belohnung eingelöst!",
        description: `${selectedChild.name} hat "${reward.title}" eingelöst.`,
      });
    },
    [deductStars, selectedChild, toast]
  );

  if (isLoading || rewardsLoading) {
    return (
      <ThemedScreenBackground theme={selectedChild?.theme}>
        <View className="flex-1 items-center justify-center">
          <Text className="font-body text-muted-foreground">Laden...</Text>
        </View>
      </ThemedScreenBackground>
    );
  }

  return (
    <ThemedScreenBackground theme={selectedChild?.theme}>
      <View className="flex-1">
        {selectedChild && (
          <Header child={selectedChild} allChildren={children} onSelectChild={selectChild} />
        )}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(320)} className="mt-4">
            <Card
              className="overflow-hidden rounded-[30px] px-5 py-5"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute inset-x-0 top-0 h-36 rounded-[30px]"
                style={{ backgroundColor: palette.heroSurface }}
              />

              <View className="relative">
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-14 w-14 items-center justify-center rounded-[20px]"
                      style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
                    >
                      <Trophy size={28} color="#FFD700" />
                    </View>
                    <View>
                      <Text className="text-sm font-body text-muted-foreground">Belohnungen</Text>
                      <Text className="mt-1 text-3xl font-headline text-foreground">
                        Fast geschafft
                      </Text>
                    </View>
                  </View>
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
                  >
                    <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                      {availableRewards} frei
                    </Text>
                  </View>
                </View>

                <View className="mt-6 flex-row gap-3">
                  <View
                    className="flex-1 rounded-[22px] px-4 py-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                  >
                    <Text className="text-sm font-body text-muted-foreground">
                      {selectedChild?.name ?? "Kind"}s Sterne
                    </Text>
                    <View className="mt-3 flex-row items-center gap-2">
                      <Star size={22} color="#FFD700" fill="#FFD700" />
                      <Text className="text-3xl font-headline text-foreground">
                        {selectedChild?.stars ?? 0}
                      </Text>
                    </View>
                  </View>

                  <View
                    className="flex-1 rounded-[22px] px-4 py-4"
                    style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                  >
                    <Text className="text-sm font-body text-muted-foreground">Nächstes Ziel</Text>
                    <Text className="mt-3 text-base font-headline text-foreground">
                      {nextReward ? nextReward.title : "Alles erreichbar"}
                    </Text>
                    <Text className="mt-1 text-xs font-body" style={{ color: palette.accentText }}>
                      {nextReward
                        ? `Noch ${missingStars} Sterne bis zur nächsten Belohnung`
                        : "Alle Belohnungen sind aktuell freigeschaltet"}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(70).duration(320)} className="mt-4">
            <Card
              className="rounded-[28px]"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-[18px]"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <Sparkles size={20} color={palette.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-headline text-foreground">Belohnungen zum Freispielen</Text>
                  <Text className="text-sm font-body text-muted-foreground">
                    Einlösen, wenn genug Sterne gesammelt wurden.
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>

          <View className="mt-4">
            <RewardsOverview
              rewards={sortedRewards}
              childStars={selectedChild?.stars ?? 0}
              childTheme={selectedChild?.theme}
              onRedeem={handleRedeem}
            />
          </View>
        </ScrollView>
      </View>
    </ThemedScreenBackground>
  );
}
