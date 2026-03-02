import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trophy, Star } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { RewardsOverview } from "@/components/routine-stars/rewards-overview";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Reward } from "@/lib/types";

export default function RewardsScreen() {
  const {
    children,
    selectedChild,
    selectedChildId,
    selectChild,
    deductStars,
    isLoading,
  } = useChildren();
  const { toast } = useToast();
  const { rewards, isLoading: rewardsLoading } = useRewards();

  const handleRedeem = useCallback(
    async (reward: Reward) => {
      if (!selectedChild) return;
      if (selectedChild.stars < reward.cost) return;

      await deductStars(selectedChild.id, reward.cost);
      toast({
        title: "Belohnung eingelöst!",
        description: `${selectedChild.name} hat "${reward.title}" eingelöst.`,
      });
    },
    [selectedChild, deductStars, toast]
  );

  if (isLoading || rewardsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground font-body">Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center mt-4 mb-6">
          <Trophy size={28} color="#FFD700" />
          <Text className="text-2xl font-headline text-foreground ml-3">
            Belohnungen
          </Text>
        </View>

        {/* Current star balance */}
        {selectedChild ? (
          <Card className="mb-5 bg-[#F3E5AB]/40 border-[#F3E5AB]">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-body text-muted-foreground">
                  {selectedChild.name}s Sterne
                </Text>
                <View className="flex-row items-center mt-1">
                  <Star size={22} color="#FFD700" fill="#FFD700" />
                  <Text className="text-3xl font-headline text-foreground ml-2">
                    {selectedChild.stars}
                  </Text>
                </View>
              </View>
              <View className="h-14 w-14 rounded-full bg-[#FFD700]/20 items-center justify-center">
                <Star size={30} color="#FFD700" fill="#FFD700" />
              </View>
            </View>
          </Card>
        ) : (
          <Card className="mb-5">
            <Text className="text-muted-foreground font-body text-center">
              Bitte erstelle zuerst ein Kind-Profil.
            </Text>
          </Card>
        )}

        {/* Child selector (only if multiple children) */}
        {children.length > 1 && (
          <View className="mb-5">
            <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
              Kind auswählen
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  onPress={() => selectChild(child.id)}
                  className={cn(
                    "px-4 py-2 rounded-full border",
                    child.id === selectedChildId
                      ? "bg-[#87CEEB] border-[#87CEEB]"
                      : "bg-card border-border"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-body-semibold",
                      child.id === selectedChildId
                        ? "text-white"
                        : "text-foreground"
                    )}
                  >
                    {child.avatar} {child.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Rewards list */}
        <Text className="text-lg font-headline text-foreground mb-3">
          Verfügbare Belohnungen
        </Text>
        <RewardsOverview
          rewards={rewards}
          childStars={selectedChild?.stars ?? 0}
          onRedeem={handleRedeem}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
