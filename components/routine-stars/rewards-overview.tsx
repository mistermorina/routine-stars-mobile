import React, { useCallback } from "react";
import { View, Text, FlatList, type ListRenderItemInfo } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Lock } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, Reward } from "@/lib/types";
import emptyRewardsImage from "@/assets/images/empty-rewards.png";

interface RewardsOverviewProps {
  rewards: Reward[];
  childStars: number;
  childTheme?: ChildTheme;
  onRedeem: (reward: Reward) => void;
  recentlyRedeemedRewardId?: string | null;
}

function RewardItem({
  reward,
  childStars,
  childTheme,
  onRedeem,
  index,
  recentlyRedeemedRewardId,
}: {
  reward: Reward;
  childStars: number;
  childTheme?: ChildTheme;
  onRedeem: (reward: Reward) => void;
  index: number;
  recentlyRedeemedRewardId?: string | null;
}) {
  const canAfford = childStars >= reward.cost;
  const missingStars = Math.max(reward.cost - childStars, 0);
  const isRecentlyRedeemed = recentlyRedeemedRewardId === reward.id;
  const IconComponent = getIcon(reward.iconName);
  const palette = getThemePalette(childTheme);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleRedeem = () => {
    scale.value = withSequence(
      withSpring(0.98, { damping: 14, stiffness: 220 }),
      withSpring(1.02, { damping: 10, stiffness: 240 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    onRedeem(reward);
  };

  const statusLabel = isRecentlyRedeemed
    ? "Eingelöst"
    : canAfford
      ? "Bereit"
      : `${missingStars} fehlen`;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400).springify()}
    >
      <Animated.View style={animatedStyle}>
        <Card
          className={cn(
            "mb-3 overflow-hidden rounded-[22px] px-4 py-4",
            !canAfford && "opacity-90"
          )}
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View
            className="absolute right-[-18px] top-[-12px] h-24 w-24 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: canAfford ? 0.24 : 0.12 }}
          />
          <View
            className="absolute left-[-8px] bottom-6 h-16 w-16 rounded-full"
            style={{ backgroundColor: palette.motifPrimary, opacity: canAfford ? 0.18 : 0.1 }}
          />

          <View className="flex-row items-start">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-[16px]"
              style={{
                backgroundColor: canAfford ? palette.surface : "rgba(255,255,255,0.72)",
                borderColor: palette.accentBorder,
                borderWidth: 1,
              }}
            >
              <IconComponent
                size={22}
                color={canAfford ? palette.accentStrong : "#737373"}
              />
            </View>

            <View className="flex-1 mr-3">
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-lg font-headline text-foreground"
                    numberOfLines={2}
                  >
                    {reward.title}
                  </Text>
                  <View className="mt-2 flex-row items-center gap-2">
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{
                        backgroundColor: canAfford ? palette.tabActiveBg : "rgba(255,255,255,0.74)",
                      }}
                    >
                      <Text
                        className="text-[11px] font-body-semibold"
                        style={{ color: canAfford ? palette.accentText : "#6b7280" }}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                    {!canAfford ? (
                      <View className="flex-row items-center gap-1">
                        <Lock size={12} color="#737373" />
                        <Text className="text-[11px] font-body-semibold text-muted-foreground">
                          Noch nicht genug
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Badge
                  variant="secondary"
                  className="self-start rounded-[16px] px-3 py-2"
                  style={{
                    backgroundColor: isRecentlyRedeemed
                      ? palette.heroSurface
                      : canAfford
                        ? palette.tabActiveBg
                        : "rgba(255,255,255,0.74)",
                  }}
                >
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      className="text-lg font-headline"
                      style={{ color: canAfford ? palette.accentText : "#6b7280" }}
                    >
                      {reward.cost}
                    </Text>
                    <Text
                      className="text-base font-body-bold"
                      style={{ color: canAfford ? "#9A6A00" : "#737373" }}
                    >
                      ★
                    </Text>
                  </View>
                </Badge>
              </View>
            </View>

          </View>

          {canAfford ? (
            <View className="mt-3 flex-row justify-end">
              <Button
                variant="default"
                size="sm"
                disabled={isRecentlyRedeemed}
                onPress={handleRedeem}
                accessibilityRole="button"
                accessibilityLabel={
                  isRecentlyRedeemed
                    ? `${reward.title} wurde eingelöst`
                    : `${reward.title} für ${reward.cost} Sterne einlösen`
                }
                accessibilityHint={
                  isRecentlyRedeemed
                    ? undefined
                    : "Löst die Belohnung ein und zieht die Sterne vom Konto ab."
                }
                accessibilityState={{ disabled: isRecentlyRedeemed }}
                className="h-11 rounded-[14px] px-4"
                style={
                  isRecentlyRedeemed
                    ? { backgroundColor: palette.heroSurface }
                    : { backgroundColor: palette.button }
                }
              >
                <Text
                  className={cn(
                    "text-sm font-body-semibold",
                    isRecentlyRedeemed ? "text-muted-foreground" : "text-white"
                  )}
                  style={isRecentlyRedeemed ? { color: palette.accentStrong } : undefined}
                >
                  {isRecentlyRedeemed ? "Eingelöst" : "Einlösen"}
                </Text>
              </Button>
            </View>
          ) : null}
        </Card>
      </Animated.View>
    </Animated.View>
  );
}

export function RewardsOverview({
  rewards,
  childStars,
  childTheme,
  onRedeem,
  recentlyRedeemedRewardId,
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
      />
    ),
    [childStars, childTheme, onRedeem, recentlyRedeemedRewardId]
  );

  const keyExtractor = useCallback((item: Reward) => item.id, []);

  if (rewards.length === 0) {
    const palette = getThemePalette(childTheme);

    return (
      <Card
        className="items-center overflow-hidden rounded-[22px] px-5 py-8"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="w-full max-w-[220px] overflow-hidden rounded-[22px]"
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
      scrollEnabled={false}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );
}
