import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Star, X } from "lucide-react-native";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RewardBrowser } from "@/components/rewards/reward-browser";
import type { RewardSuggestion } from "@/lib/types";

interface RewardItem {
  id: string;
  title: string;
  cost: number;
  iconName: string;
}

interface RewardSetupProps {
  onNext: (data: { rewards: RewardItem[] }) => void;
  onBack: () => void;
  formData: {
    rewards?: RewardItem[];
  };
}

export function RewardSetup({ onNext, onBack, formData }: RewardSetupProps) {
  const [selectedRewards, setSelectedRewards] = useState<RewardItem[]>(
    formData.rewards || []
  );

  const handleAddReward = useCallback((suggestion: RewardSuggestion) => {
    setSelectedRewards((prev) => {
      if (prev.some((r) => r.id === suggestion.id)) return prev;
      return [...prev, {
        id: suggestion.id,
        title: suggestion.title,
        cost: suggestion.cost,
        iconName: suggestion.iconName,
      }];
    });
  }, []);

  const handleRemoveReward = useCallback((id: string) => {
    setSelectedRewards((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleSubmit = () => {
    if (selectedRewards.length === 0) return;
    onNext({ rewards: selectedRewards });
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Belohnungen wählen</CardTitle>
          <CardDescription>
            Was kann sich dein Kind für gesammelte Sterne verdienen?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-5">
            {/* Selected rewards chips */}
            {selectedRewards.length > 0 && (
              <View>
                <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                  Gewählt ({selectedRewards.length})
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedRewards.map((reward) => {
                    const Icon = getIcon(reward.iconName);
                    return (
                      <View
                        key={reward.id}
                        className="flex-row items-center gap-1.5 bg-[#87CEEB]/15 border border-[#87CEEB]/30 rounded-full px-3 py-1.5"
                      >
                        <Icon size={14} color="#87CEEB" />
                        <Text className="text-xs font-body-semibold text-foreground">
                          {reward.title}
                        </Text>
                        <Text className="text-xs font-body text-muted-foreground">
                          {reward.cost}⭐
                        </Text>
                        <Pressable onPress={() => handleRemoveReward(reward.id)} hitSlop={8}>
                          <X size={14} color="#737373" />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Reward browser */}
            <RewardBrowser
              onAddReward={handleAddReward}
              addedRewardIds={selectedRewards.map((r) => r.id)}
            />

            {/* Navigation buttons */}
            <View className="flex-row justify-between pt-2">
              <Button
                variant="outline"
                onPress={onBack}
                className="min-w-[100px]"
              >
                Zurück
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={selectedRewards.length === 0}
                className="min-w-[100px]"
              >
                <Text className="text-base font-body-semibold text-primary-foreground">
                  Fertig!
                </Text>
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
