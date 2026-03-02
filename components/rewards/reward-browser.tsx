import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { rewardCategories, rewardSuggestions, getRewardsByCategory } from "@/lib/reward-suggestions";
import { RewardCategorySection } from "./reward-category";
import type { RewardSuggestion } from "@/lib/types";

interface RewardBrowserProps {
  onAddReward: (reward: RewardSuggestion) => void;
  addedRewardIds: string[];
}

export function RewardBrowser({ onAddReward, addedRewardIds }: RewardBrowserProps) {
  const addedSet = useMemo(() => new Set(addedRewardIds), [addedRewardIds]);

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-body-semibold text-muted-foreground">
          Vorschläge
        </Text>
        <Text className="text-sm font-body text-[#87CEEB]">
          {addedRewardIds.length} gewählt
        </Text>
      </View>
      {rewardCategories.map((cat) => {
        const rewards = getRewardsByCategory(cat.id);
        return (
          <RewardCategorySection
            key={cat.id}
            category={cat}
            rewards={rewards}
            onAdd={onAddReward}
            addedIds={addedSet}
          />
        );
      })}
    </View>
  );
}
