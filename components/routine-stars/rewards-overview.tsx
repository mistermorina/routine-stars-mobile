import React, { useCallback } from "react";
import { View, Text, FlatList, type ListRenderItemInfo } from "react-native";
import Animated, {
  FadeInRight,
} from "react-native-reanimated";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Reward } from "@/lib/types";

interface RewardsOverviewProps {
  rewards: Reward[];
  childStars: number;
  onRedeem: (reward: Reward) => void;
}

function RewardItem({
  reward,
  childStars,
  onRedeem,
  index,
}: {
  reward: Reward;
  childStars: number;
  onRedeem: (reward: Reward) => void;
  index: number;
}) {
  const canAfford = childStars >= reward.cost;
  const IconComponent = getIcon(reward.iconName);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400).springify()}
    >
      <Card
        className={cn(
          "mb-3",
          !canAfford && "opacity-50"
        )}
      >
        <View className="flex-row items-center">
          {/* Icon */}
          <View
            className={cn(
              "h-12 w-12 rounded-full items-center justify-center mr-3",
              canAfford ? "bg-[#F3E5AB]" : "bg-secondary"
            )}
          >
            <IconComponent
              size={24}
              color={canAfford ? "#B8860B" : "#737373"}
            />
          </View>

          {/* Title and cost */}
          <View className="flex-1 mr-3">
            <Text
              className={cn(
                "text-base font-headline",
                canAfford ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {reward.title}
            </Text>
            <View className="mt-1">
              <Badge
                variant={canAfford ? "default" : "secondary"}
                className={cn(
                  "self-start",
                  canAfford && "bg-[#FFD700]"
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-body-semibold",
                    canAfford ? "text-[#5C4800]" : "text-muted-foreground"
                  )}
                >
                  {reward.cost} ⭐
                </Text>
              </Badge>
            </View>
          </View>

          {/* Redeem button */}
          <Button
            variant={canAfford ? "default" : "secondary"}
            size="sm"
            disabled={!canAfford}
            onPress={() => onRedeem(reward)}
            className={cn(canAfford && "bg-[#87CEEB] active:bg-[#6BB5D6]")}
          >
            <Text
              className={cn(
                "text-sm font-body-semibold",
                canAfford ? "text-white" : "text-muted-foreground"
              )}
            >
              Einlösen
            </Text>
          </Button>
        </View>
      </Card>
    </Animated.View>
  );
}

export function RewardsOverview({
  rewards,
  childStars,
  onRedeem,
}: RewardsOverviewProps) {
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Reward>) => (
      <RewardItem
        reward={item}
        childStars={childStars}
        onRedeem={onRedeem}
        index={index}
      />
    ),
    [childStars, onRedeem]
  );

  const keyExtractor = useCallback((item: Reward) => item.id, []);

  if (rewards.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground font-body text-center">
          Noch keine Belohnungen vorhanden.
        </Text>
      </View>
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
