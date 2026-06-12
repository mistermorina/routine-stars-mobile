import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { useCollapsibleHeader } from "@/hooks/use-collapsible-header";
import { Header } from "@/components/routine-stars/header";
import { RewardsOverview } from "@/components/routine-stars/rewards-overview";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import type { Reward } from "@/lib/types";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";

type RewardFilter = "alle" | "verfuegbar" | "bald";

const REWARD_FILTERS: { key: RewardFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "verfuegbar", label: "Verfügbar" },
  { key: "bald", label: "Bald frei" },
];

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
  const [recentlyRedeemedRewardId, setRecentlyRedeemedRewardId] = useState<string | null>(null);
  const [rewardFilter, setRewardFilter] = useState<RewardFilter>("alle");
  const {
    handleHeaderScroll,
    isHeaderCollapsed,
    toggleHeaderCollapsed,
  } = useCollapsibleHeader();
  const sortedRewards = useMemo(
    () => [...rewards].sort((left, right) => left.cost - right.cost),
    [rewards]
  );
  const childStars = selectedChild?.stars ?? 0;
  const nextReward = selectedChild
    ? sortedRewards.find((reward) => reward.cost > selectedChild.stars)
    : undefined;
  const missingStars = nextReward && selectedChild
    ? nextReward.cost - selectedChild.stars
    : 0;
  const nextRewardProgress = nextReward && nextReward.cost > 0
    ? Math.min((childStars / nextReward.cost) * 100, 100)
    : 100;
  const filteredRewards = useMemo(() => {
    if (rewardFilter === "verfuegbar") {
      return sortedRewards.filter((reward) => reward.cost <= childStars);
    }
    if (rewardFilter === "bald") {
      return sortedRewards.filter((reward) => reward.cost > childStars);
    }
    return sortedRewards;
  }, [childStars, rewardFilter, sortedRewards]);

  const handleRedeem = useCallback(
    async (reward: Reward) => {
      if (!selectedChild) return;
      if (selectedChild.stars < reward.cost) return;

      await deductStars(selectedChild.id, reward.cost);
      setRecentlyRedeemedRewardId(reward.id);
      void triggerFeedback("reward_redeemed");
      toast({
        title: "Belohnung eingelöst!",
        description: `${selectedChild.name} genießt jetzt "${reward.title}".`,
      });
    },
    [deductStars, selectedChild, toast]
  );

  useEffect(() => {
    if (!recentlyRedeemedRewardId) return;

    const timeout = setTimeout(() => {
      setRecentlyRedeemedRewardId(null);
    }, 2400);

    return () => clearTimeout(timeout);
  }, [recentlyRedeemedRewardId]);

  if (isLoading || rewardsLoading) {
    return (
      <ThemedScreenBackground
        theme={selectedChild?.theme}
        backgroundSkin={selectedChild?.backgroundSkin}
      >
        <View className="flex-1 px-4 pt-6 gap-3">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-64 rounded-chip" />
          <Skeleton className="mt-2 h-11 w-full rounded-full" />
          <Skeleton className="mt-1 h-44 w-full rounded-card" />
          <View className="flex-row gap-3">
            <Skeleton className="h-44 flex-1 rounded-card" />
            <Skeleton className="h-44 flex-1 rounded-card" />
          </View>
        </View>
      </ThemedScreenBackground>
    );
  }

  if (!selectedChild) {
    return (
      <ThemedScreenBackground>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-xl font-headline text-foreground">
            Noch kein Kind ausgewählt
          </Text>
          <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
            Erstelle zuerst ein Kinderprofil, damit Belohnungen passend angezeigt werden.
          </Text>
        </View>
      </ThemedScreenBackground>
    );
  }

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <View className="flex-1">
        {selectedChild && (
          <Header
            child={selectedChild}
            allChildren={children}
            collapsed={isHeaderCollapsed}
            onSelectChild={selectChild}
            onToggleCollapsed={toggleHeaderCollapsed}
          />
        )}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Screen headline */}
          <Animated.View entering={FadeInDown.duration(320)} className="mt-4">
            <Text className="text-[32px] font-headline leading-10 text-foreground">
              Belohnungen
            </Text>
            <Text className="mt-0.5 text-sm font-body text-muted-foreground">
              Sammle Sterne und schalte Überraschungen frei
            </Text>
          </Animated.View>

          {/* Filter chips */}
          {sortedRewards.length > 1 ? (
            <Animated.View entering={FadeInDown.delay(40).duration(320)} className="mt-3">
              <View
                className="flex-row gap-1 rounded-full border p-1"
                style={{
                  backgroundColor: "rgba(255,255,255,0.72)",
                  borderColor: palette.accentBorder,
                }}
              >
                {REWARD_FILTERS.map((filter) => {
                  const isActive = filter.key === rewardFilter;
                  return (
                    <PressableScale
                      key={filter.key}
                      onPress={() => {
                        if (!isActive) {
                          void triggerFeedback("tab_focus");
                          setRewardFilter(filter.key);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Belohnungen filtern: ${filter.label}`}
                      accessibilityState={{ selected: isActive }}
                      containerClassName="flex-1"
                      className="min-h-11 items-center justify-center rounded-full py-2.5"
                      style={
                        isActive
                          ? {
                              backgroundColor: "#FFFFFF",
                              shadowColor: "#9DB8D8",
                              shadowOpacity: 0.18,
                              shadowRadius: 8,
                              shadowOffset: { width: 0, height: 3 },
                              elevation: 2,
                            }
                          : undefined
                      }
                    >
                      <Text
                        numberOfLines={1}
                        className={
                          isActive ? "text-sm font-body-semibold" : "text-sm font-body"
                        }
                        style={{ color: isActive ? palette.accentText : "#8E99A6" }}
                      >
                        {filter.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}

          {/* Hero: next reward */}
          <Animated.View entering={FadeInDown.delay(55).duration(320)} className="mt-3">
            <Card
              className="overflow-hidden rounded-card px-5 py-5"
              style={{
                backgroundColor: palette.heroSurface,
                borderColor: palette.accentBorder,
                shadowColor: "#9DB8D8",
                shadowOpacity: 0.16,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
              }}
            >
              <View
                className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full"
                style={{ backgroundColor: palette.motifPrimary, opacity: 0.35 }}
              />
              <View
                className="absolute bottom-[-44px] left-[-30px] h-36 w-36 rounded-full"
                style={{ backgroundColor: palette.motifSecondary, opacity: 0.3 }}
              />
              <Text
                className="text-xs font-body-semibold uppercase tracking-[0.7px]"
                style={{ color: palette.accentText }}
              >
                Nächste Belohnung
              </Text>
              <Text
                className="mt-1 text-[24px] font-headline leading-8 text-foreground"
                numberOfLines={2}
              >
                {nextReward ? nextReward.title : "Alles erreichbar!"}
              </Text>
              <View className="mt-1 flex-row items-end gap-3">
                <Text className="min-w-0 flex-1 text-base font-body leading-6 text-muted-foreground">
                  {nextReward
                    ? `Noch ${missingStars} ${missingStars === 1 ? "Stern" : "Sterne"} bis zur Überraschung`
                    : "Du kannst dir gerade jede Belohnung aussuchen."}
                </Text>
                <Image
                  source={rewardStarGiftImage}
                  style={{ width: 96, height: 96 }}
                  contentFit="contain"
                  transition={180}
                  accessibilityLabel="Geschenk mit Sternen"
                />
              </View>
              {nextReward ? (
                <View className="mt-4 flex-row items-center gap-3">
                  <View className="flex-1">
                    <Progress
                      value={nextRewardProgress}
                      className="h-2.5"
                      indicatorColor={palette.chartPrimary}
                      trackStyle={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                    />
                  </View>
                  <Text className="shrink-0 text-xs font-body-semibold text-muted-foreground">
                    {childStars} / {nextReward.cost}
                  </Text>
                </View>
              ) : null}
            </Card>
          </Animated.View>

          {/* Rewards grid */}
          <Animated.View
            entering={FadeInDown.delay(90).duration(320)}
            className="mt-5 flex-row items-center justify-between gap-3"
          >
            <Text className="text-lg font-headline text-foreground">Belohnungen für dich</Text>
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
            >
              <Text
                className="text-xs font-body-semibold"
                style={{ color: palette.accentText }}
                numberOfLines={1}
              >
                {filteredRewards.length} {filteredRewards.length === 1 ? "Wunsch" : "Wünsche"}
              </Text>
            </View>
          </Animated.View>

          <View className="mt-3">
            {sortedRewards.length > 0 && filteredRewards.length === 0 ? (
              <Card
                className="items-center rounded-card px-5 py-6"
                style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
              >
                <Text className="text-center text-base font-headline text-foreground">
                  {rewardFilter === "verfuegbar"
                    ? "Noch nichts freigeschaltet"
                    : "Alles ist schon erreichbar"}
                </Text>
                <Text className="mt-1 text-center text-base font-body leading-6 text-muted-foreground">
                  {rewardFilter === "verfuegbar"
                    ? "Sammle weiter Sterne, dann öffnet sich hier deine erste Belohnung."
                    : "Schau unter „Alle“ – du kannst dir alles aussuchen."}
                </Text>
                <PressableScale
                  onPress={() => setRewardFilter("alle")}
                  accessibilityRole="button"
                  accessibilityLabel="Alle Belohnungen anzeigen"
                  containerClassName="mt-3 self-center"
                  className="min-h-11 rounded-full px-4 py-2"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
                    Alle anzeigen
                  </Text>
                </PressableScale>
              </Card>
            ) : (
              <RewardsOverview
                rewards={filteredRewards}
                childStars={childStars}
                childTheme={selectedChild.theme}
                onRedeem={handleRedeem}
                recentlyRedeemedRewardId={recentlyRedeemedRewardId}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </ThemedScreenBackground>
  );
}
