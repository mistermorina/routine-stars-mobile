import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { rewardCategories, getRewardsByCategory } from "@/lib/reward-suggestions";
import { RewardCategorySection } from "./reward-category";
import { enterFade, enterStagger } from "@/lib/motion";
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
  const sections = useMemo(
    () =>
      rewardCategories
        .map((category) => ({ category, rewards: getRewardsByCategory(category.id) }))
        .filter((section) => section.rewards.length > 0),
    []
  );

  if (sections.length === 0) {
    return (
      <Animated.View entering={enterFade()}>
        <Text className="text-base font-body leading-6 text-muted-foreground">
          Gerade gibt es keine Vorschläge – lege eine Belohnung von Hand an.
        </Text>
      </Animated.View>
    );
  }

  return (
    <View>
      <Animated.View
        entering={enterFade()}
        className="mb-3 flex-row items-center justify-between"
      >
        <Text className="text-sm font-body-semibold text-muted-foreground">
          Vorschläge
        </Text>
        <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
          {addedRewardIds.length} gewählt
        </Text>
      </Animated.View>
      {sections.map(({ category, rewards }, index) => (
        <Animated.View key={category.id} entering={enterStagger(index)}>
          <RewardCategorySection
            category={category}
            rewards={rewards}
            onAdd={onAddReward}
            addedIds={addedSet}
            theme={theme}
          />
        </Animated.View>
      ))}
    </View>
  );
}
