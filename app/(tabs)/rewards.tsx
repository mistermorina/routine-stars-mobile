import React, { useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { Trophy, Star } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { Header } from "@/components/routine-stars/header";
import { RewardsOverview } from "@/components/routine-stars/rewards-overview";
import { Card } from "@/components/ui/card";
import { getThemePalette } from "@/lib/theme";
import type { Reward } from "@/lib/types";

export default function RewardsScreen() {
  const {
    children,
    selectedChild,
    selectChild,
    deductStars,
    isLoading,
  } = useChildren();
  const { toast } = useToast();
  const { rewards, isLoading: rewardsLoading } = useRewards();
  const palette = getThemePalette(selectedChild?.theme);
  const sortedRewards = [...rewards].sort((left, right) => left.cost - right.cost);
  const nextReward = selectedChild
    ? sortedRewards.find((reward) => reward.cost > selectedChild.stars)
    : undefined;
  const missingStars = nextReward && selectedChild
    ? nextReward.cost - selectedChild.stars
    : 0;

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
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground font-body">Laden...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header with child switcher */}
      {selectedChild && (
        <Header child={selectedChild} allChildren={children} onSelectChild={selectChild} />
      )}

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Screen title */}
        <View className="flex-row items-center mt-4 mb-6">
          <Trophy size={28} color="#FFD700" />
          <Text className="text-2xl font-headline text-foreground ml-3">
            Belohnungen
          </Text>
        </View>

        {/* Current star balance */}
        {selectedChild ? (
          <Card
            className="mb-5"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.accentBorder,
            }}
          >
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
              <View
                className="h-14 w-14 rounded-full items-center justify-center"
                style={{ backgroundColor: palette.accentSoft }}
              >
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

        {selectedChild && rewards.length > 0 ? (
          <Card
            className="mb-5"
            style={{
              backgroundColor: palette.accentSoft,
              borderColor: palette.accentBorder,
            }}
          >
            <Text className="text-sm font-body text-muted-foreground">
              Nächstes Ziel
            </Text>
            {nextReward ? (
              <>
                <Text className="mt-1 text-xl font-headline text-foreground">
                  {nextReward.title}
                </Text>
                <Text className="mt-1 text-sm font-body" style={{ color: palette.accentText }}>
                  Noch {missingStars} Sterne bis zur nächsten Belohnung.
                </Text>
              </>
            ) : (
              <>
                <Text className="mt-1 text-xl font-headline text-foreground">
                  Alle Belohnungen erreichbar
                </Text>
                <Text className="mt-1 text-sm font-body" style={{ color: palette.accentText }}>
                  {selectedChild.name} hat genug Sterne für alle aktuellen Belohnungen.
                </Text>
              </>
            )}
          </Card>
        ) : null}

        {/* Rewards list */}
        <Text className="text-lg font-headline text-foreground mb-3">
          Verfügbare Belohnungen
        </Text>
        <RewardsOverview
          rewards={rewards}
          childStars={selectedChild?.stars ?? 0}
          childTheme={selectedChild?.theme}
          onRedeem={handleRedeem}
        />
      </ScrollView>
    </View>
  );
}
