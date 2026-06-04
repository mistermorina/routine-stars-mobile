import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Gift, X } from "lucide-react-native";
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
import { getStarterRewardSuggestions } from "@/lib/reward-suggestions";
import { getThemePalette } from "@/lib/theme";
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
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: palette.accentSoft,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                >
                  <Gift size={20} color={palette.accentStrong} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-body-semibold text-foreground">
                    Warmes Starterpaket
                  </Text>
                  <Text className="mt-0.5 text-xs font-body" style={{ color: palette.accentText }}>
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
                      className="max-w-full min-w-0 flex-row items-center rounded-2xl border px-3 py-2"
                      style={{
                        borderColor: palette.accentBorder,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <View
                        className="h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: palette.accentSoft }}
                      >
                        <Icon size={14} color={palette.accentStrong} />
                      </View>
                      <View className="ml-2 min-w-0 flex-1">
                        <Text
                          className="text-xs font-body-semibold leading-4 text-foreground"
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {reward.title}
                        </Text>
                      </View>
                      <Text className="ml-2 shrink-0 text-xs font-body text-muted-foreground">
                        {reward.cost}⭐
                      </Text>
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
                  >
                    Starterpaket wählen
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => setIsManualMode(true)}
                    style={{ borderColor: palette.accent }}
                    disabled={isSaving}
                  >
                    <Text className="text-sm font-body-semibold" style={{ color: palette.accent }}>
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
                            className="max-w-full min-w-0 flex-row items-center rounded-2xl border px-3 py-2"
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
                                className="text-xs font-body-semibold leading-4 text-foreground"
                                numberOfLines={2}
                                ellipsizeMode="tail"
                              >
                                {reward.title}
                              </Text>
                            </View>
                            <Text className="ml-2 shrink-0 text-xs font-body text-muted-foreground">
                              {reward.cost}⭐
                            </Text>
                            <Pressable
                              onPress={() => handleRemoveReward(reward.id)}
                              className="ml-1 h-11 w-11 shrink-0 items-center justify-center rounded-full"
                              accessibilityRole="button"
                              accessibilityLabel={`Belohnung ${reward.title} entfernen`}
                              hitSlop={4}
                            >
                              <X size={14} color="#737373" />
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {selectedRewards.length === 0 ? (
                  <View
                    className="rounded-[18px] px-4 py-3"
                    style={{ backgroundColor: palette.heroSurface }}
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
                >
                  <Text className="text-sm font-body-semibold" style={{ color: palette.accent }}>
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
              >
                Zurück
              </Button>
              <Button
                onPress={isManualMode ? handleSubmit : handleStarterPack}
                disabled={isSaving || (isManualMode && selectedRewards.length === 0)}
                className="min-w-[100px]"
                style={{ backgroundColor: palette.button }}
              >
                <Text className="text-base font-body-semibold text-primary-foreground">
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
