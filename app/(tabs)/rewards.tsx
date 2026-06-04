import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { getIcon, Trophy, Star, Sparkles } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { useCollapsibleHeader } from "@/hooks/use-collapsible-header";
import { Header } from "@/components/routine-stars/header";
import { RewardsOverview } from "@/components/routine-stars/rewards-overview";
import { Card } from "@/components/ui/card";
import { SoftHeroWash } from "@/components/ui/soft-hero-wash";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import type { Reward } from "@/lib/types";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";

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
  const {
    handleHeaderScroll,
    isHeaderCollapsed,
    toggleHeaderCollapsed,
  } = useCollapsibleHeader();
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
  const featuredReward = selectedChild
    ? sortedRewards.find((reward) => reward.cost <= selectedChild.stars) ?? nextReward ?? sortedRewards[0]
    : sortedRewards[0];
  const FeaturedRewardIcon = featuredReward ? getIcon(featuredReward.iconName) : Trophy;

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
        <View className="flex-1 items-center justify-center">
          <Text className="font-body text-muted-foreground">Laden...</Text>
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
          <Animated.View entering={FadeInDown.duration(320)} className="mt-4">
            <Card
              className="overflow-hidden rounded-[22px] px-4 pb-4 pt-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <SoftHeroWash
                surfaceColor={palette.heroSurface}
                baseColor={palette.cardTint}
                holdOffset="48%"
              />
              <View
                className="absolute right-[-16px] top-[-8px] h-24 w-24 rounded-full"
                style={{ backgroundColor: palette.motifSecondary, opacity: 0.28 }}
              />
              <View
                className="absolute left-[-8px] bottom-10 h-20 w-20 rounded-full"
                style={{ backgroundColor: palette.motifPrimary, opacity: 0.18 }}
              />
              <Image
                source={rewardStarGiftImage}
                style={{
                  position: "absolute",
                  right: -24,
                  top: 20,
                  width: 128,
                  height: 128,
                  opacity: 0.34,
                }}
                contentFit="contain"
                transition={180}
                accessible={false}
              />

              <View className="relative">
                <View>
                  <View>
                    <View
                      className="self-start rounded-full px-3 py-1.5"
                      style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                    >
                      <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                        Belohnungen
                      </Text>
                    </View>
                    <Text
                      className="mt-2 text-[27px] font-headline leading-[32px] text-foreground"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                    >
                      Wunschliste
                    </Text>
                    <Text className="mt-2 max-w-[240px] text-sm font-body leading-5" style={{ color: palette.accentText }}>
                      Sterne werden zu Wunschmomenten. Erreichbare Belohnungen
                      kannst du direkt einlösen.
                    </Text>
                  </View>
                  <View
                    className="mt-3 flex-row items-center justify-between rounded-[16px] px-3.5 py-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
                  >
                    <View>
                      <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                        Bereit
                      </Text>
                      <Text className="text-xs font-body text-muted-foreground">
                        Belohnungen frei
                      </Text>
                    </View>
                    <Text className="text-2xl font-headline leading-7" style={{ color: palette.accentText }}>
                      {availableRewards}
                    </Text>
                  </View>
                </View>

                <View
                  className="mt-4 rounded-[18px] border px-4 py-3.5"
                  style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.74)" }}
                >
                  <View className="flex-row items-center">
                    <View
                      className="h-14 w-14 items-center justify-center rounded-[20px]"
                      style={{ backgroundColor: palette.tabActiveBg }}
                    >
                      <FeaturedRewardIcon size={24} color={palette.accentStrong} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                        {featuredReward && selectedChild.stars >= featuredReward.cost ? "Heute erreichbar" : "Nächstes Ziel"}
                      </Text>
                      <Text className="mt-1 text-lg font-headline text-foreground">
                        {featuredReward ? featuredReward.title : "Noch keine Belohnung"}
                      </Text>
                      <Text className="mt-1 text-xs font-body" style={{ color: palette.accentText }}>
                        {featuredReward
                          ? selectedChild.stars >= featuredReward.cost
                            ? "Bereit zum Einlösen."
                            : `Noch ${Math.max(featuredReward.cost - selectedChild.stars, 0)} Sterne bis zum Wunschmoment.`
                          : "Lege im Onboarding oder in den Einstellungen Belohnungen an."}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mt-4 flex-row gap-3">
                  <View
                    className="flex-1 rounded-[18px] px-4 py-3.5"
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
                    className="flex-1 rounded-[18px] px-4 py-3.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                  >
                    <Text className="text-sm font-body text-muted-foreground">Wunschstatus</Text>
                    <Text className="mt-3 text-base font-headline text-foreground">
                      {nextReward ? "Fast da" : "Alles erreichbar"}
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
              className="rounded-[22px] px-4 py-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View className="flex-row items-center justify-between gap-3">
                <View className="min-w-0 flex-1 flex-row items-center gap-3">
                  <View
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={20} color={palette.accentStrong} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-lg font-headline text-foreground">Belohnungen zum Freispielen</Text>
                    <Text className="text-sm font-body text-muted-foreground">
                      Einlösen, wenn genug Sterne gesammelt wurden.
                    </Text>
                  </View>
                </View>
                <View
                  className="max-w-[96px] shrink-0 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
                >
                  <Text
                    className="text-xs font-body-semibold"
                    style={{ color: palette.accentText }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.78}
                  >
                    {sortedRewards.length} Wünsche
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>

          <View className="mt-4">
            <RewardsOverview
              rewards={sortedRewards}
              childStars={selectedChild.stars}
              childTheme={selectedChild.theme}
              onRedeem={handleRedeem}
              recentlyRedeemedRewardId={recentlyRedeemedRewardId}
            />
          </View>
        </ScrollView>
      </View>
    </ThemedScreenBackground>
  );
}
