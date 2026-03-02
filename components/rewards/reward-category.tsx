import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { ChevronRight, Plus, Check } from "lucide-react-native";
import { getIcon } from "@/lib/icons";
import type { RewardSuggestion, RewardCategoryInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RewardCategorySectionProps {
  category: RewardCategoryInfo;
  rewards: RewardSuggestion[];
  onAdd: (reward: RewardSuggestion) => void;
  addedIds: Set<string>;
}

export function RewardCategorySection({ category, rewards, onAdd, addedIds }: RewardCategorySectionProps) {
  const [expanded, setExpanded] = useState(false);

  const addedCount = rewards.filter((r) => addedIds.has(r.id)).length;

  return (
    <View className="mb-3">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between bg-card rounded-xl p-3 border border-border"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{category.emoji}</Text>
          <Text className="text-base font-headline text-foreground">{category.label}</Text>
          {addedCount > 0 && (
            <View className="bg-[#87CEEB] px-2 py-0.5 rounded-full">
              <Text className="text-xs font-body-semibold text-white">{addedCount}</Text>
            </View>
          )}
        </View>
        <Animated.View
          style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
        >
          <ChevronRight size={18} color="#737373" />
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
                  "flex-row items-center px-3 py-2.5 rounded-lg ml-2 mt-1",
                  isAdded ? "bg-[#87CEEB]/10" : "bg-secondary/50 active:bg-secondary"
                )}
              >
                <Icon size={18} color={isAdded ? "#87CEEB" : "#737373"} />
                <Text className={cn(
                  "flex-1 ml-2.5 text-sm font-body",
                  isAdded ? "text-[#87CEEB]" : "text-foreground"
                )}>
                  {reward.title}
                </Text>
                <Text className="text-xs font-body text-muted-foreground mr-2">
                  {reward.cost} ⭐
                </Text>
                {isAdded ? (
                  <Check size={16} color="#87CEEB" />
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
