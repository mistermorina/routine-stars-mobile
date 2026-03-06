import React, { useCallback } from "react";
import { View, Text, FlatList, type ListRenderItemInfo } from "react-native";
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Sparkles, Lock } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, Reward } from "@/lib/types";

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

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400).springify()}
    >
      <Animated.View style={animatedStyle}>
        <Card
          className={cn(
            "mb-3 overflow-hidden rounded-[30px]",
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
              className="mr-3 h-16 w-16 items-center justify-center rounded-[22px]"
              style={{
                backgroundColor: canAfford ? palette.surface : "rgba(255,255,255,0.72)",
                borderColor: palette.accentBorder,
                borderWidth: 1,
              }}
            >
              <IconComponent
                size={26}
                color={canAfford ? palette.accentStrong : "#737373"}
              />
            </View>

            <View className="flex-1 mr-3">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-lg font-headline",
                      canAfford ? "text-foreground" : "text-foreground"
                    )}
                  >
                    {reward.title}
                  </Text>
                  <Text
                    className="mt-1 text-sm font-body leading-5"
                    style={{ color: canAfford ? palette.accentText : "#6b7280" }}
                  >
                    {canAfford
                      ? "Genug Sterne gesammelt. Dieser Wunsch kann jetzt eingelöst werden."
                      : `Noch ${missingStars} Sterne bis zu diesem Wunschmoment.`}
                  </Text>
                </View>
                <Badge
                  variant="secondary"
                  className="self-start"
                  style={{
                    backgroundColor: isRecentlyRedeemed
                      ? palette.heroSurface
                      : canAfford
                        ? palette.tabActiveBg
                        : "rgba(255,255,255,0.74)",
                  }}
                >
                  <Text
                    className="text-xs font-body-semibold"
                    style={{
                      color: isRecentlyRedeemed
                        ? palette.accentStrong
                        : canAfford
                          ? palette.accentText
                          : "#6b7280",
                    }}
                  >
                    {isRecentlyRedeemed ? "Gerade eingelöst" : canAfford ? "Bereit" : `Noch ${missingStars}`}
                  </Text>
                </Badge>
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <Badge
                  variant="secondary"
                  className="self-start"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                    {reward.cost} ⭐
                  </Text>
                </Badge>
                {isRecentlyRedeemed ? (
                  <View
                    className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={14} color={palette.accentStrong} />
                    <Text className="text-[11px] font-body-semibold" style={{ color: palette.accentStrong }}>
                      Wunschmoment läuft
                    </Text>
                  </View>
                ) : canAfford ? (
                  <View className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: palette.tabActiveBg }}>
                    <Sparkles size={14} color={palette.accentStrong} />
                    <Text className="text-[11px] font-body-semibold" style={{ color: palette.accentText }}>
                      Wunsch bereit
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,0.74)" }}>
                    <Lock size={14} color="#737373" />
                    <Text className="text-[11px] font-body-semibold text-muted-foreground">
                      Bald erreichbar
                    </Text>
                  </View>
                )}
              </View>
            </View>

          </View>

          <View className="mt-4">
            <Button
              variant={canAfford ? "default" : "secondary"}
              size="sm"
              disabled={!canAfford || isRecentlyRedeemed}
              onPress={handleRedeem}
              className="rounded-[18px]"
              style={
                isRecentlyRedeemed
                  ? { backgroundColor: palette.heroSurface }
                  : canAfford
                    ? { backgroundColor: palette.button }
                    : { backgroundColor: "rgba(255,255,255,0.72)" }
              }
            >
              <Text
                className={cn(
                  "text-sm font-body-semibold",
                  canAfford && !isRecentlyRedeemed ? "text-white" : "text-muted-foreground"
                )}
                style={isRecentlyRedeemed ? { color: palette.accentStrong } : undefined}
              >
                {isRecentlyRedeemed
                  ? "Gerade eingelöst"
                  : canAfford
                    ? "Jetzt einlösen"
                    : "Noch nicht genug Sterne"}
              </Text>
            </Button>
          </View>
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
    return (
      <Card className="items-center rounded-[28px] px-5 py-10">
        <Text className="text-5xl">🎁</Text>
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
