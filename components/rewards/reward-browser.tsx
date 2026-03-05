import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { rewardCategories, getRewardsByCategory } from "@/lib/reward-suggestions";
import { RewardCategorySection } from "./reward-category";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, RewardSuggestion } from "@/lib/types";

interface RewardBrowserProps {
  onAddReward: (reward: RewardSuggestion) => void;
  addedRewardIds: string[];
  theme?: ChildTheme;
}

export function RewardBrowser({ onAddReward, addedRewardIds, theme }: RewardBrowserProps) {
  const addedSet = useMemo(() => new Set(addedRewardIds), [addedRewardIds]);
  const palette = getThemePalette(theme);

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-body-semibold text-muted-foreground">
          Vorschläge
        </Text>
        <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
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
            theme={theme}
          />
        );
      })}
    </View>
  );
}
