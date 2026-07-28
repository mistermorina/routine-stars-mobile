import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { useCollapsibleHeader } from "@/hooks/use-collapsible-header";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Header } from "@/components/routine-stars/header";
import { RewardsOverview } from "@/components/routine-stars/rewards-overview";
import { Confetti } from "@/components/routine-stars/confetti";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { triggerFeedback } from "@/lib/feedback";
import { Check, Star } from "@/lib/icons";
import {
  durations,
  easings,
  enterFade,
  enterStagger,
  exitFade,
  springs,
  timings,
} from "@/lib/motion";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import type { Reward } from "@/lib/types";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";

type RewardFilter = "alle" | "verfuegbar" | "bald";

const REWARD_FILTERS: { key: RewardFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "verfuegbar", label: "Verfügbar" },
  { key: "bald", label: "Bald frei" },
];

/* ------------------------------------------------------------------ *
 * Redeem celebration timeline (press → settled card, 1.7s total):
 *   0ms    haptic + puck pop + ring ripple + confetti burst
 *   180ms  the spent-stars pill drifts away from the puck
 *   340ms  toast slides in from the bottom with the reward title
 *   1000ms puck eases out
 *   1700ms overlay + confetti unmount
 *   2600ms card leaves its "Freigeschaltet" state
 * ------------------------------------------------------------------ */
const TOAST_DELAY_MS = 340;
const CELEBRATION_VISIBLE_MS = 1700;
const CARD_SETTLE_MS = 2600;
const PUCK_HOLD_MS = 850;
const COST_PILL_DELAY_MS = 180;

interface RedeemCelebrationState {
  title: string;
  cost: number;
  childName: string;
  /** Bumped per redeem so a second redeem replays the overlay from the top. */
  runId: number;
}

/**
 * Full-screen, non-interactive payoff for a redeemed reward. Mounted only when
 * the OS is not asking for reduced motion — the haptic and the toast carry the
 * moment on their own in that case.
 */
function RedeemCelebration({ cost }: { cost: number }) {
  const puckScale = useSharedValue(0.4);
  const puckOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.7);
  const glowOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.55);
  const ringOpacity = useSharedValue(0);
  const costShift = useSharedValue(0);
  const costOpacity = useSharedValue(0);

  useEffect(() => {
    // Anticipation-free: the puck is already on screen in the first frame and
    // overshoots past 1 before settling, so the tap reads as cause → effect.
    puckOpacity.value = withSequence(
      withTiming(1, timings.fast),
      withDelay(PUCK_HOLD_MS, withTiming(0, timings.base))
    );
    puckScale.value = withSequence(
      withSpring(1.04, springs.bouncy),
      withDelay(PUCK_HOLD_MS, withTiming(0.88, timings.base))
    );

    glowOpacity.value = withSequence(
      withTiming(1, timings.fast),
      withDelay(PUCK_HOLD_MS - durations.fast, withTiming(0, timings.base))
    );
    glowScale.value = withTiming(1.24, {
      duration: durations.celebration,
      easing: easings.out,
    });

    ringOpacity.value = withSequence(
      withTiming(0.55, timings.fast),
      withTiming(0, {
        duration: durations.celebration - durations.fast,
        easing: easings.out,
      })
    );
    ringScale.value = withTiming(1.9, {
      duration: durations.celebration,
      easing: easings.out,
    });

    costOpacity.value = withDelay(
      COST_PILL_DELAY_MS,
      withSequence(
        withTiming(1, timings.fast),
        withDelay(durations.slow, withTiming(0, timings.base))
      )
    );
    costShift.value = withDelay(
      COST_PILL_DELAY_MS,
      withTiming(26, { duration: durations.celebration + 120, easing: easings.out })
    );
  }, [
    costOpacity,
    costShift,
    glowOpacity,
    glowScale,
    puckOpacity,
    puckScale,
    ringOpacity,
    ringScale,
  ]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));
  const puckStyle = useAnimatedStyle(() => ({
    opacity: puckOpacity.value,
    transform: [{ scale: puckScale.value }],
  }));
  const costStyle = useAnimatedStyle(() => ({
    opacity: costOpacity.value,
    transform: [{ translateY: costShift.value }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { zIndex: 30 }]}
      className="items-center justify-center"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="h-24 w-24 items-center justify-center">
        <Animated.View
          className="absolute h-56 w-56 rounded-full"
          style={[
            { left: -64, top: -64, backgroundColor: semanticColors.successSoft },
            glowStyle,
          ]}
        />
        <Animated.View
          className="absolute h-32 w-32 rounded-full"
          style={[
            { left: -16, top: -16, borderWidth: 3, borderColor: semanticColors.success },
            ringStyle,
          ]}
        />
        <Animated.View
          className="h-24 w-24 items-center justify-center rounded-full"
          style={[
            { backgroundColor: semanticColors.success },
            shadowPresets.shadowFloating,
            puckStyle,
          ]}
        >
          <Check size={46} color={semanticColors.card} strokeWidth={3.2} />
        </Animated.View>
      </View>

      <Animated.View
        className="mt-5 flex-row items-center gap-1 rounded-full px-3 py-1.5"
        style={[{ backgroundColor: semanticColors.card }, shadowPresets.shadowSubtle, costStyle]}
      >
        <Text
          className="text-sm font-body-bold"
          style={{ color: semanticColors.goldText }}
          maxFontSizeMultiplier={1.3}
        >
          −{cost}
        </Text>
        <Star size={14} color={semanticColors.goldDeep} fill={semanticColors.gold} />
      </Animated.View>
    </View>
  );
}

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
  const reduceMotion = useReducedMotion();
  const palette = getThemePalette(selectedChild?.theme);
  const [recentlyRedeemedRewardId, setRecentlyRedeemedRewardId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<RedeemCelebrationState | null>(null);
  const [rewardFilter, setRewardFilter] = useState<RewardFilter>("alle");
  // Guards a double tap landing before React has re-rendered the card as redeemed.
  const redeemLockRef = useRef<string | null>(null);
  const runIdRef = useRef(0);
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
    const base =
      rewardFilter === "verfuegbar"
        ? sortedRewards.filter((reward) => reward.cost <= childStars)
        : rewardFilter === "bald"
          ? sortedRewards.filter((reward) => reward.cost > childStars)
          : sortedRewards;

    // The stars are gone the instant the child taps, which can push the card
    // out of the active filter mid-celebration. Hold it in place until it has
    // settled into its redeemed state.
    if (!recentlyRedeemedRewardId || base.some((reward) => reward.id === recentlyRedeemedRewardId)) {
      return base;
    }

    const redeemed = sortedRewards.find((reward) => reward.id === recentlyRedeemedRewardId);
    return redeemed
      ? [...base, redeemed].sort((left, right) => left.cost - right.cost)
      : base;
  }, [childStars, recentlyRedeemedRewardId, rewardFilter, sortedRewards]);

  const handleRedeem = useCallback(
    async (reward: Reward) => {
      if (!selectedChild) return;
      if (selectedChild.stars < reward.cost) return;
      if (redeemLockRef.current === reward.id) return;

      redeemLockRef.current = reward.id;
      runIdRef.current += 1;

      // Everything the child can feel or see fires before the write: the
      // haptic is synchronous and both state updates flush in the same frame.
      void triggerFeedback("reward_redeemed");
      setRecentlyRedeemedRewardId(reward.id);
      setCelebration({
        title: reward.title,
        cost: reward.cost,
        childName: selectedChild.name,
        runId: runIdRef.current,
      });

      await deductStars(selectedChild.id, reward.cost);
    },
    [deductStars, selectedChild]
  );

  // The toast lands after the burst has read as a burst, so the child sees the
  // effect first and the words second.
  useEffect(() => {
    if (!celebration) return;

    const toastTimeout = setTimeout(
      () => {
        toast({
          title: "Belohnung eingelöst!",
          description: `${celebration.childName} genießt jetzt „${celebration.title}“.`,
        });
      },
      reduceMotion ? 0 : TOAST_DELAY_MS
    );
    const hideTimeout = setTimeout(() => setCelebration(null), CELEBRATION_VISIBLE_MS);

    return () => {
      clearTimeout(toastTimeout);
      clearTimeout(hideTimeout);
    };
  }, [celebration, reduceMotion, toast]);

  useEffect(() => {
    if (!recentlyRedeemedRewardId) return;

    const timeout = setTimeout(() => {
      setRecentlyRedeemedRewardId(null);
      redeemLockRef.current = null;
    }, CARD_SETTLE_MS);

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
          <Animated.View entering={enterFade()} className="mt-4">
            <Text className="text-[32px] font-headline leading-10 text-foreground">
              Belohnungen
            </Text>
            <Text className="mt-0.5 text-sm font-body text-muted-foreground">
              Sammle Sterne und schalte Überraschungen frei
            </Text>
          </Animated.View>

          {/* Filter chips */}
          {sortedRewards.length > 1 ? (
            <Animated.View entering={enterStagger(1)} className="mt-3">
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
                          ? { backgroundColor: semanticColors.card, ...shadowPresets.shadowSubtle }
                          : undefined
                      }
                    >
                      <Text
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                        className={
                          isActive ? "text-sm font-body-semibold" : "text-sm font-body"
                        }
                        style={{
                          color: isActive ? palette.accentText : semanticColors.mutedForeground,
                        }}
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
          <Animated.View entering={enterStagger(2)} className="mt-3">
            <Card
              className="overflow-hidden rounded-card px-5 py-5"
              style={{
                backgroundColor: palette.heroSurface,
                borderColor: palette.accentBorder,
                ...shadowPresets.shadowCard,
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
                  <Text
                    className="shrink-0 text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.3}
                  >
                    {childStars} / {nextReward.cost}
                  </Text>
                </View>
              ) : null}
            </Card>
          </Animated.View>

          {/* Rewards grid */}
          <Animated.View
            entering={enterStagger(3)}
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
                maxFontSizeMultiplier={1.2}
              >
                {filteredRewards.length} {filteredRewards.length === 1 ? "Wunsch" : "Wünsche"}
              </Text>
            </View>
          </Animated.View>

          <View className="mt-3">
            {sortedRewards.length > 0 && filteredRewards.length === 0 ? (
              <Animated.View
                key={`empty-${rewardFilter}`}
                entering={enterStagger(0)}
                exiting={exitFade()}
              >
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
                    className="min-h-11 items-center justify-center rounded-full px-4 py-2"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Text
                      className="text-sm font-body-semibold"
                      style={{ color: palette.accentText }}
                      maxFontSizeMultiplier={1.3}
                    >
                      Alle anzeigen
                    </Text>
                  </PressableScale>
                </Card>
              </Animated.View>
            ) : (
              <Animated.View entering={enterFade()}>
                <RewardsOverview
                  rewards={filteredRewards}
                  childStars={childStars}
                  childTheme={selectedChild.theme}
                  onRedeem={handleRedeem}
                  recentlyRedeemedRewardId={recentlyRedeemedRewardId}
                  celebratingRewardId={celebration ? recentlyRedeemedRewardId : null}
                />
              </Animated.View>
            )}
          </View>
        </ScrollView>

        {celebration && !reduceMotion ? (
          <React.Fragment key={celebration.runId}>
            <RedeemCelebration cost={celebration.cost} />
            <Confetti colors={palette.celebrationColors} />
          </React.Fragment>
        ) : null}
      </View>
    </ThemedScreenBackground>
  );
}
