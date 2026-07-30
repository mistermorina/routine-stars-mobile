import React, { useCallback, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { PressableScale } from "@/components/ui/pressable-scale";
import { triggerFeedback } from "@/lib/feedback";
import { ChevronRight, Plus, Check, Star, getIcon } from "@/lib/icons";
import { enterFade, enterStagger, exitFade, springs } from "@/lib/motion";
import { getThemePalette, semanticColors } from "@/lib/theme";
import type { ChildTheme, RewardSuggestion, RewardCategoryInfo } from "@/lib/types";

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
  const CategoryIcon = getIcon(category.iconName);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const handleToggle = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    // Springs the last few degrees instead of stopping dead on 90.
    chevronRotation.value = withSpring(next ? 90 : 0, springs.gentle);
    // Parent-facing surface: tick without sound.
    void triggerFeedback("theme_preview", { disableSound: true });
  }, [chevronRotation, expanded]);

  const handleAdd = useCallback(
    (reward: RewardSuggestion) => {
      void triggerFeedback("theme_preview", { disableSound: true });
      onAdd(reward);
    },
    [onAdd]
  );

  return (
    <View className="mb-3">
      <PressableScale
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={`${category.label}, ${rewards.length} Vorschläge`}
        accessibilityState={{ expanded }}
        className="min-h-14 flex-row items-center justify-between rounded-card border p-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-tile"
            style={{ backgroundColor: palette.heroSurface }}
          >
            <CategoryIcon size={20} color={palette.accentStrong} />
          </View>
          <Text className="text-[21px] font-headline leading-7 text-foreground">
            {category.label}
          </Text>
          {addedCount > 0 && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: palette.button }}>
              <Text className="text-xs font-body-semibold text-white" maxFontSizeMultiplier={1.3}>
                {addedCount}
              </Text>
            </View>
          )}
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronRight size={18} color={palette.accentStrong} />
        </Animated.View>
      </PressableScale>

      {expanded && (
        <Animated.View entering={enterFade()} exiting={exitFade()} className="mt-1">
          {rewards.map((reward, index) => {
            const Icon = getIcon(reward.iconName);
            const isAdded = addedIds.has(reward.id);
            return (
              <Animated.View key={reward.id} entering={enterStagger(index)}>
                <PressableScale
                  onPress={() => handleAdd(reward)}
                  disabled={isAdded}
                  accessibilityRole="button"
                  accessibilityLabel={`${reward.title}, ${reward.cost} Sterne`}
                  accessibilityHint={
                    isAdded ? undefined : "Fügt die Belohnung zur Auswahl hinzu."
                  }
                  accessibilityState={{ disabled: isAdded, selected: isAdded }}
                  containerClassName="ml-2 mt-1"
                  className="flex-row items-center rounded-tile border px-3 py-3"
                  style={{
                    backgroundColor: isAdded ? palette.accentSoft : "rgba(255,255,255,0.74)",
                    borderColor: isAdded ? palette.accentBorder : "rgba(255,255,255,0.2)",
                  }}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-chip"
                    style={{
                      backgroundColor: isAdded ? semanticColors.card : palette.heroSurface,
                    }}
                  >
                    <Icon
                      size={18}
                      color={isAdded ? palette.accentStrong : semanticColors.mutedForeground}
                    />
                  </View>
                  <Text
                    className="ml-2.5 flex-1 text-base font-body leading-6 text-foreground"
                    style={isAdded ? { color: palette.accentText } : undefined}
                  >
                    {reward.title}
                  </Text>
                  <View className="mr-2 flex-row items-center gap-1">
                    <Star size={13} color={semanticColors.goldText} fill={semanticColors.goldText} />
                    <Text className="text-sm font-body-semibold text-muted-foreground">
                      {reward.cost}
                    </Text>
                  </View>
                  {isAdded ? (
                    <Check size={16} color={palette.accentStrong} />
                  ) : (
                    <Plus size={16} color={semanticColors.mutedForeground} />
                  )}
                </PressableScale>
              </Animated.View>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}
