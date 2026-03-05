import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ChevronRight, Plus, Check } from "lucide-react-native";
import { getIcon } from "@/lib/icons";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, RewardSuggestion, RewardCategoryInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RewardCategorySectionProps {
  category: RewardCategoryInfo;
  rewards: RewardSuggestion[];
  onAdd: (reward: RewardSuggestion) => void;
  addedIds: Set<string>;
  theme?: ChildTheme;
}

export function RewardCategorySection({
  category,
  rewards,
  onAdd,
  addedIds,
  theme,
}: RewardCategorySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const chevronRotation = useSharedValue(0);
  const palette = getThemePalette(theme);

  const addedCount = rewards.filter((r) => addedIds.has(r.id)).length;
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    chevronRotation.value = withTiming(next ? 90 : 0, { duration: 180 });
  };

  return (
    <View className="mb-3">
      <Pressable
        onPress={handleToggle}
        className="flex-row items-center justify-between rounded-[24px] border p-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{category.emoji}</Text>
          <Text className="text-base font-headline text-foreground">{category.label}</Text>
          {addedCount > 0 && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: palette.button }}>
              <Text className="text-xs font-body-semibold text-white">{addedCount}</Text>
            </View>
          )}
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronRight size={18} color={palette.accentStrong} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(150)}
          className="mt-1"
        >
          {rewards.map((reward) => {
            const Icon = getIcon(reward.iconName);
            const isAdded = addedIds.has(reward.id);
            return (
              <Pressable
                key={reward.id}
                onPress={() => !isAdded && onAdd(reward)}
                className={cn(
                  "ml-2 mt-1 flex-row items-center rounded-[18px] px-3 py-3",
                  isAdded ? "" : ""
                )}
                style={{
                  backgroundColor: isAdded ? palette.accentSoft : "rgba(255,255,255,0.74)",
                  borderColor: isAdded ? palette.accentBorder : "rgba(255,255,255,0.2)",
                  borderWidth: 1,
                }}
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: isAdded ? "#FFFFFF" : palette.heroSurface }}
                >
                  <Icon size={18} color={isAdded ? palette.accentStrong : "#737373"} />
                </View>
                <Text
                  className={cn("ml-2.5 flex-1 text-sm font-body", isAdded ? "" : "text-foreground")}
                  style={isAdded ? { color: palette.accentText } : undefined}
                >
                  {reward.title}
                </Text>
                <Text className="text-xs font-body text-muted-foreground mr-2">
                  {reward.cost} ⭐
                </Text>
                {isAdded ? (
                  <Check size={16} color={palette.accentStrong} />
                ) : (
                  <Plus size={16} color="#737373" />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}
