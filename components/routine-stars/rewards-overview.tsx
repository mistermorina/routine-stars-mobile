import React, { useCallback, useEffect } from "react";
import { View, Text, FlatList, type ListRenderItemInfo } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Check, Lock, Star, getIcon } from "@/lib/icons";
import { enterStagger, exitFade, springs, timings } from "@/lib/motion";
import { getThemePalette, semanticColors } from "@/lib/theme";
import type { ChildTheme, Reward } from "@/lib/types";
import emptyRewardsImage from "@/assets/images/empty-rewards.png";

interface RewardsOverviewProps {
  rewards: Reward[];
  childStars: number;
  childTheme?: ChildTheme;
  onRedeem: (reward: Reward) => void;
  recentlyRedeemedRewardId?: string | null;
  /** Reward that just got redeemed — drives a one-shot celebration pulse. */
  celebratingRewardId?: string | null;
}

function RewardItem({
  reward,
  childStars,
  childTheme,
  onRedeem,
  index,
  recentlyRedeemedRewardId,
  celebratingRewardId,
}: {
  reward: Reward;
  childStars: number;
  childTheme?: ChildTheme;
  onRedeem: (reward: Reward) => void;
  index: number;
  recentlyRedeemedRewardId?: string | null;
  celebratingRewardId?: string | null;
}) {
  const canAfford = childStars >= reward.cost;
  const missingStars = Math.max(reward.cost - childStars, 0);
  const progressPct = reward.cost > 0 ? Math.min((childStars / reward.cost) * 100, 100) : 0;
  // "Close" rewards show a progress bar, distant ones a calm "Bald frei" badge.
  const isClose = !canAfford && progressPct >= 50;
  const isRecentlyRedeemed = recentlyRedeemedRewardId === reward.id;
  const isCelebrating = celebratingRewardId === reward.id;
  const IconComponent = getIcon(reward.iconName);
  const palette = getThemePalette(childTheme);
  const reduceMotion = useReducedMotion();

  const celebrationScale = useSharedValue(1);
  const celebrationTint = useSharedValue(0);

  // Decorative one-shot pulse — haptics/sound stay with the caller.
  useEffect(() => {
    if (!isCelebrating || reduceMotion) return;

    celebrationScale.value = withSequence(
      withSpring(1.06, springs.bouncy),
      withSpring(1, springs.playful)
    );
    celebrationTint.value = withSequence(
      withTiming(1, timings.fast),
      withTiming(0, timings.slow)
    );
  }, [celebrationScale, celebrationTint, isCelebrating, reduceMotion]);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const celebrationTintStyle = useAnimatedStyle(() => ({
    opacity: celebrationTint.value,
  }));

  return (
    <Animated.View
      entering={enterStagger(index)}
      exiting={exitFade()}
      className="flex-1"
      style={[{ maxWidth: "48.8%" }, celebrationStyle]}
    >
      <Card
        className="overflow-hidden rounded-card px-3.5 py-4"
        style={{
          backgroundColor: isRecentlyRedeemed ? semanticColors.successSoft : palette.cardTint,
          borderColor: isRecentlyRedeemed ? semanticColors.success : palette.accentBorder,
          minHeight: 172,
        }}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute inset-0"
          style={[{ backgroundColor: semanticColors.successSoft }, celebrationTintStyle]}
        />

        <View
          className="absolute right-[-16px] top-[-14px] h-20 w-20 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: canAfford ? 0.22 : 0.1 }}
        />

        <View className="flex-row items-start justify-between">
          <View
            className="h-14 w-14 items-center justify-center rounded-tile"
            style={{
              backgroundColor: canAfford || isRecentlyRedeemed ? palette.surface : "rgba(255,255,255,0.78)",
              borderColor: palette.accentBorder,
              borderWidth: 1,
            }}
          >
            <IconComponent
              size={26}
              color={
                canAfford || isRecentlyRedeemed
                  ? palette.accentStrong
                  : semanticColors.mutedForeground
              }
            />
          </View>
          {/* Cost is always visible — kids need the target number */}
          <View
            className="flex-row items-center gap-1 rounded-full border px-2.5 py-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              borderColor: palette.accentBorder,
            }}
          >
            <Text
              className="text-xs font-body-bold leading-4"
              maxFontSizeMultiplier={1.2}
              style={{ color: canAfford ? semanticColors.goldText : semanticColors.mutedForeground }}
            >
              {reward.cost}
            </Text>
            <Star
              size={12}
              color={semanticColors.gold}
              fill={canAfford ? semanticColors.gold : "transparent"}
            />
          </View>
        </View>

        <Text
          className="mt-2.5 text-[15px] font-headline leading-5 text-foreground"
          maxFontSizeMultiplier={1.4}
          numberOfLines={2}
        >
          {reward.title}
        </Text>

        <View className="mt-auto pt-3">
          {isRecentlyRedeemed ? (
            <View className="flex-row items-center gap-1.5">
              <View
                className="h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: semanticColors.success }}
              >
                <Check size={14} color={semanticColors.card} strokeWidth={3} />
              </View>
              <Text
                className="text-xs font-body-semibold"
                maxFontSizeMultiplier={1.3}
                style={{ color: semanticColors.successStrong }}
              >
                Freigeschaltet
              </Text>
            </View>
          ) : canAfford ? (
            <PressableScale
              onPress={() => onRedeem(reward)}
              accessibilityRole="button"
              accessibilityLabel={`${reward.title} für ${reward.cost} Sterne einlösen`}
              accessibilityHint="Löst die Belohnung ein und zieht die Sterne vom Konto ab."
              containerClassName="self-start"
              className="flex-row items-center gap-1.5 rounded-full px-4 py-2"
              style={{ backgroundColor: palette.button }}
            >
              <Text
                className="text-sm font-body-semibold text-white"
                maxFontSizeMultiplier={1.3}
              >
                Einlösen
              </Text>
            </PressableScale>
          ) : isClose ? (
            <View>
              <Progress
                value={progressPct}
                className="h-2"
                indicatorColor={palette.chartPrimary}
                trackStyle={{ backgroundColor: semanticColors.muted }}
              />
              <Text
                className="mt-1.5 text-xs font-body-semibold"
                maxFontSizeMultiplier={1.3}
                style={{ color: palette.accentText }}
              >
                Nur {missingStars} {missingStars === 1 ? "Stern" : "Sterne"} entfernt
              </Text>
            </View>
          ) : (
            <View
              className="self-start flex-row items-center gap-1 rounded-full px-2.5 py-1"
              style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
            >
              <Lock size={12} color={semanticColors.mutedForeground} />
              <Text
                className="text-xs font-body-semibold leading-4 text-muted-foreground"
                maxFontSizeMultiplier={1.2}
              >
                Bald frei
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}

export function RewardsOverview({
  rewards,
  childStars,
  childTheme,
  onRedeem,
  recentlyRedeemedRewardId,
  celebratingRewardId,
}: RewardsOverviewProps) {
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Reward>) => (
      <RewardItem
        reward={item}
        childStars={childStars}
        childTheme={childTheme}
        onRedeem={onRedeem}
        index={index}
        recentlyRedeemedRewardId={recentlyRedeemedRewardId}
        celebratingRewardId={celebratingRewardId}
      />
    ),
    [celebratingRewardId, childStars, childTheme, onRedeem, recentlyRedeemedRewardId]
  );

  const keyExtractor = useCallback((item: Reward) => item.id, []);

  if (rewards.length === 0) {
    const palette = getThemePalette(childTheme);

    return (
      <Card
        className="items-center overflow-hidden rounded-card px-5 py-8"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="w-full max-w-[220px] overflow-hidden rounded-card"
          style={{ backgroundColor: palette.heroSurface }}
        >
          <Image
            source={emptyRewardsImage}
            style={{ width: "100%", aspectRatio: 1 }}
            contentFit="cover"
            transition={180}
            accessibilityLabel="Geschlossene Wunschbox mit Sternen"
          />
        </View>
        <Text className="mt-4 text-center text-lg font-headline text-foreground">
          Noch keine Belohnungen vorhanden
        </Text>
        <Text className="mt-2 text-center font-body text-muted-foreground">
          Sobald Belohnungen angelegt sind, erscheinen sie hier als kleine Wunschmomente.
        </Text>
      </Card>
    );
  }

  return (
    <FlatList
      data={rewards}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
    />
  );
}
