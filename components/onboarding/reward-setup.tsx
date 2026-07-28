import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Gift, Star, X, getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RewardBrowser } from "@/components/rewards/reward-browser";
import { getStarterRewardSuggestions } from "@/lib/reward-suggestions";
import { getThemePalette, semanticColors } from "@/lib/theme";
import type { RewardSuggestion, ChildProfile } from "@/lib/types";

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
    children?: ChildProfile[];
  };
  isSaving?: boolean;
}

export function RewardSetup({ onNext, onBack, formData, isSaving = false }: RewardSetupProps) {
  const starterRewards = getStarterRewardSuggestions().map((reward) => ({
    id: reward.id,
    title: reward.title,
    cost: reward.cost,
    iconName: reward.iconName,
  }));
  const [selectedRewards, setSelectedRewards] = useState<RewardItem[]>(
    formData.rewards || []
  );
  const [isManualMode, setIsManualMode] = useState(
    (formData.rewards?.length ?? 0) > 0
  );
  const palette = getThemePalette(formData.children?.[0]?.theme);

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

  const handleStarterPack = () => {
    onNext({ rewards: starterRewards });
  };

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
          <CardTitle>Belohnungen festlegen</CardTitle>
          <CardDescription>
            Belohnungen sollen Mut machen, nicht Druck erzeugen. Starte klein und
            passe alles später im Elternbereich an.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-5">
            <View
              className="rounded-tile border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: palette.accentSoft,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Gift size={20} color={palette.accentStrong} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-body-semibold text-foreground">
                    Warmes Starterpaket
                  </Text>
                  <Text className="mt-0.5 text-sm font-body" style={{ color: palette.accentText }}>
                    Vier kleine Ziele für schnelle Erfolgserlebnisse
                  </Text>
                </View>
              </View>

              <View className="mt-4 gap-2">
                {starterRewards.map((reward) => {
                  const Icon = getIcon(reward.iconName);

                  return (
                    <View
                      key={reward.id}
                      className="max-w-full min-w-0 flex-row items-center rounded-tile border px-3 py-2"
                      style={{
                        borderColor: palette.accentBorder,
                        backgroundColor: semanticColors.card,
                      }}
                      accessible
                      accessibilityLabel={`${reward.title}, ${reward.cost} Sterne`}
                    >
                      <View
                        className="h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: palette.accentSoft }}
                      >
                        <Icon size={14} color={palette.accentStrong} />
                      </View>
                      <View className="ml-2 min-w-0 flex-1">
                        <Text
                          className="text-sm font-body-semibold leading-5 text-foreground"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {reward.title}
                        </Text>
                      </View>
                      <View className="ml-2 shrink-0 flex-row items-center gap-1">
                        <Star
                          size={13}
                          color={semanticColors.goldText}
                          fill={semanticColors.goldText}
                        />
                        <Text
                          className="text-sm font-body text-muted-foreground"
                          maxFontSizeMultiplier={1.3}
                        >
                          {reward.cost}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {!isManualMode ? (
                <View className="mt-4 gap-3">
                  <Button
                    onPress={handleStarterPack}
                    style={{ backgroundColor: palette.button }}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Starterpaket wählen"
                    accessibilityState={{ disabled: isSaving }}
                  >
                    Starterpaket wählen
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => setIsManualMode(true)}
                    style={{ borderColor: palette.accent }}
                    disabled={isSaving}
                    accessibilityRole="button"
                    accessibilityLabel="Belohnungen selbst auswählen"
                    accessibilityState={{ disabled: isSaving }}
                  >
                    <Text
                      className="text-sm font-body-semibold"
                      style={{ color: palette.accent }}
                      maxFontSizeMultiplier={1.3}
                    >
                      Belohnungen selbst auswählen
                    </Text>
                  </Button>
                </View>
              ) : null}
            </View>

            {isManualMode ? (
              <>
                {/* Selected rewards chips */}
                {selectedRewards.length > 0 && (
                  <View>
                    <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                      Gewählt ({selectedRewards.length})
                    </Text>
                    <View className="gap-2">
                      {selectedRewards.map((reward) => {
                        const Icon = getIcon(reward.iconName);
                        return (
                          <View
                            key={reward.id}
                            className="max-w-full min-w-0 flex-row items-center rounded-tile border px-3 py-2"
                            style={{
                              borderColor: palette.accentBorder,
                              backgroundColor: palette.accentSoft,
                            }}
                          >
                            <View
                              className="h-8 w-8 shrink-0 items-center justify-center rounded-full"
                              style={{ backgroundColor: palette.surface }}
                            >
                              <Icon size={14} color={palette.accentStrong} />
                            </View>
                            <View className="ml-2 min-w-0 flex-1">
                              <Text
                                className="text-sm font-body-semibold leading-5 text-foreground"
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {reward.title}
                              </Text>
                            </View>
                            <View className="ml-2 shrink-0 flex-row items-center gap-1">
                              <Star
                                size={13}
                                color={semanticColors.goldText}
                                fill={semanticColors.goldText}
                              />
                              <Text
                                className="text-sm font-body text-muted-foreground"
                                maxFontSizeMultiplier={1.3}
                              >
                                {reward.cost}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() => handleRemoveReward(reward.id)}
                              className="ml-1 h-11 w-11 shrink-0 items-center justify-center rounded-full active:opacity-70"
                              accessibilityRole="button"
                              accessibilityLabel={`Belohnung ${reward.title} entfernen`}
                              hitSlop={8}
                            >
                              <X size={14} color={semanticColors.mutedForeground} />
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {selectedRewards.length === 0 ? (
                  <View
                    className="rounded-tile px-4 py-3"
                    style={{ backgroundColor: palette.heroSurface }}
                    accessibilityLiveRegion="polite"
                  >
                    <Text className="text-sm font-body leading-5" style={{ color: palette.accentText }}>
                      Noch keine Belohnung gewählt. Tippe unten auf eine Idee oder nutze das Starterpaket.
                    </Text>
                  </View>
                ) : null}

                {/* Reward browser */}
                <RewardBrowser
                  onAddReward={handleAddReward}
                  addedRewardIds={selectedRewards.map((r) => r.id)}
                  theme={formData.children?.[0]?.theme}
                />

                <Button
                  variant="outline"
                  onPress={handleStarterPack}
                  style={{ borderColor: palette.accent }}
                  disabled={isSaving}
                  accessibilityRole="button"
                  accessibilityLabel="Stattdessen Starterpaket verwenden"
                  accessibilityState={{ disabled: isSaving }}
                >
                  <Text
                    className="text-sm font-body-semibold"
                    style={{ color: palette.accent }}
                    maxFontSizeMultiplier={1.3}
                  >
                    Stattdessen Starterpaket verwenden
                  </Text>
                </Button>
              </>
            ) : null}

            {/* Navigation buttons */}
            <View className="flex-row justify-between pt-2">
              <Button
                variant="outline"
                onPress={onBack}
                className="min-w-[100px]"
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Zurück zu den Routinen"
                accessibilityState={{ disabled: isSaving }}
              >
                Zurück
              </Button>
              <Button
                onPress={isManualMode ? handleSubmit : handleStarterPack}
                disabled={isSaving || (isManualMode && selectedRewards.length === 0)}
                className="min-w-[100px]"
                style={{ backgroundColor: palette.button }}
                accessibilityRole="button"
                accessibilityLabel={
                  isSaving ? "Einrichtung wird gespeichert" : "Einrichtung abschließen"
                }
                accessibilityState={{
                  disabled: isSaving || (isManualMode && selectedRewards.length === 0),
                  busy: isSaving,
                }}
              >
                <Text
                  className="text-base font-body-semibold text-primary-foreground"
                  maxFontSizeMultiplier={1.2}
                >
                  {isSaving ? "Wird gespeichert..." : "In die App"}
                </Text>
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
