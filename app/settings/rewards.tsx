import React, { useMemo, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Button } from "@/components/ui/button";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SkeletonCard } from "@/components/ui/skeleton";
import { RewardBrowser } from "@/components/rewards/reward-browser";
import { useToast } from "@/hooks/use-toast";
import { useRewards } from "@/hooks/use-rewards";
import { Gift, Minus, Plus, Sparkles, Trash2, getIcon } from "@/lib/icons";
import { rewardSuggestions } from "@/lib/reward-suggestions";
import { getThemePalette, semanticColors } from "@/lib/theme";
import type { Reward, RewardSuggestion } from "@/lib/types";

function createReward(): Reward {
  return {
    id: `reward-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    cost: 5,
    iconName: "gift",
  };
}

function normalizeRewardTitle(value: string) {
  return value.trim().toLowerCase();
}

export default function RewardsSettingsScreen() {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  const { rewards, addReward, updateReward, removeReward, isLoading } = useRewards();
  const { toast } = useToast();
  const palette = getThemePalette("sterne");
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [draftReward, setDraftReward] = useState<Reward | null>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [rewardPendingDeletion, setRewardPendingDeletion] = useState<Reward | null>(null);

  const activeRewardIcon = draftReward?.iconName ?? "gift";
  const addedSuggestionIds = useMemo(
    () =>
      rewardSuggestions
        .filter((suggestion) =>
          rewards.some(
            (reward) =>
              reward.id === suggestion.id ||
              normalizeRewardTitle(reward.title) === normalizeRewardTitle(suggestion.title)
          )
        )
        .map((suggestion) => suggestion.id),
    [rewards]
  );

  const openEditor = (reward: Reward) => {
    setEditingRewardId(reward.id);
    setDraftReward({ ...reward });
  };

  const resetEditor = () => {
    setEditingRewardId(null);
    setDraftReward(null);
    setShowIconPicker(false);
  };

  const handleCreateReward = async () => {
    const reward = createReward();
    await addReward(reward);
    openEditor(reward);
    toast({
      title: "Neue Belohnung angelegt",
      description: "Vergib jetzt einen Namen, einen Wert und ein passendes Icon.",
    });
  };

  const saveReward = async () => {
    if (!draftReward) return;

    const sanitizedTitle = draftReward.title.trim();
    const sanitizedCost = Math.max(1, draftReward.cost);

    if (!sanitizedTitle) {
      toast({
        title: "Belohnung noch unvollständig",
        description: "Bitte vergib zuerst einen Namen.",
        variant: "destructive",
      });
      return;
    }

    await updateReward(draftReward.id, {
      ...draftReward,
      title: sanitizedTitle,
      cost: sanitizedCost,
    });
    toast({
      title: "Belohnung gespeichert",
      description: `${sanitizedTitle} wurde aktualisiert.`,
    });
    resetEditor();
  };

  const handleConfirmDeleteReward = async () => {
    const reward = rewardPendingDeletion;
    if (!reward) return;

    setRewardPendingDeletion(null);
    await removeReward(reward.id);
    if (editingRewardId === reward.id) {
      resetEditor();
    }
    toast({
      title: "Belohnung entfernt",
      description: reward.title
        ? `${reward.title} wurde gelöscht.`
        : "Die Belohnung wurde gelöscht.",
    });
  };

  const handleAddSuggestedReward = async (suggestion: RewardSuggestion) => {
    const exists = rewards.some(
      (reward) =>
        reward.id === suggestion.id ||
        normalizeRewardTitle(reward.title) === normalizeRewardTitle(suggestion.title)
    );

    if (exists) {
      toast({
        title: "Schon vorhanden",
        description: `${suggestion.title} ist bereits in euren Belohnungen.`,
      });
      return;
    }

    const reward: Reward = {
      id: suggestion.id,
      title: suggestion.title,
      cost: suggestion.cost,
      iconName: suggestion.iconName,
    };

    await addReward(reward);
    toast({
      title: "Belohnung hinzugefügt",
      description: `${suggestion.title} ist jetzt verfügbar.`,
    });
  };

  return (
    <ThemedScreenBackground>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
        <Card className="overflow-hidden rounded-[30px] border p-0">
          <View className="rounded-[30px] bg-secondary/70 px-4 py-5">
            <Text
              className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground"
              maxFontSizeMultiplier={1.3}
            >
              Familienbelohnungen
            </Text>
            <Text className="mt-2 text-[28px] font-headline leading-[34px] text-foreground">
              Belohnungen wirklich pflegen
            </Text>
            <Text className="mt-2 text-base font-body leading-6 text-muted-foreground">
              Hier legst du fest, welche Wünsche erreichbar sind und wie viele Sterne ein
              kleiner oder grosser Moment kosten soll.
            </Text>
            <View className="mt-4 self-start rounded-full bg-white/85 px-3 py-1.5">
              <Text
                className="text-xs font-body-semibold uppercase tracking-[0.7px] text-foreground"
                maxFontSizeMultiplier={1.3}
              >
                {isLoading ? "…" : `${rewards.length} Belohnungen`}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          onPress={handleCreateReward}
          className="mt-4 w-full"
          style={{ backgroundColor: palette.button }}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={18} color={semanticColors.accentForeground} />
            <Text
              className="text-base font-body-semibold text-white"
              maxFontSizeMultiplier={1.3}
            >
              Neue Belohnung anlegen
            </Text>
          </View>
        </Button>

        <Card
          className="mt-4 rounded-[28px] border px-4 py-4"
          style={{ borderColor: palette.accentBorder, backgroundColor: palette.accentSoft }}
        >
          <View className="flex-row items-start gap-3">
            <View
              className="mt-0.5 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: semanticColors.card }}
            >
              <Sparkles size={18} color={palette.accentStrong} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
                Gute Belohnungen bleiben erreichbar
              </Text>
              <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                Kleine Wünsche bei 3 bis 8 Sternen sorgen für schnelle Erfolgsmomente.
                Grössere Highlights dürfen mehr kosten und seltener bleiben.
              </Text>
            </View>
          </View>
        </Card>

        {isLoading ? (
          <View className="mt-4 gap-3" accessibilityLabel="Belohnungen werden geladen">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </View>
        ) : rewards.length === 0 ? (
          <Card className="mt-4 rounded-[28px] px-5 py-8">
            <Text className="text-center text-lg font-headline text-foreground">
              Noch keine Belohnungen vorhanden
            </Text>
            <Text className="mt-2 text-center text-base font-body leading-6 text-muted-foreground">
              Lege eigene Wünsche an oder nutze direkt die Vorschläge weiter unten.
            </Text>
          </Card>
        ) : (
          rewards.map((reward) => {
            const isEditing = editingRewardId === reward.id;
            const rewardDraft = isEditing ? draftReward : null;
            const Icon = getIcon((isEditing ? rewardDraft?.iconName : reward.iconName) || "gift");

            return (
              <Card key={reward.id} className="mt-4 overflow-hidden rounded-[28px] border p-0">
                <View className="px-4 py-4">
                  <View className="flex-row items-start gap-3">
                    <View
                      className="mt-0.5 h-12 w-12 items-center justify-center rounded-tile"
                      style={{ backgroundColor: palette.heroSurface }}
                    >
                      <Icon size={20} color={palette.accentStrong} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-headline text-foreground">
                        {reward.title || "Neue Belohnung"}
                      </Text>
                      <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                        {reward.cost} Sterne • familienweit einlösbar
                      </Text>
                    </View>
                    <PressableScale
                      onPress={() => (isEditing ? resetEditor() : openEditor(reward))}
                      className="justify-center rounded-full px-3 py-1.5"
                      style={{
                        backgroundColor: isEditing
                          ? semanticColors.destructiveSoft
                          : palette.tabActiveBg,
                      }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isEditing
                          ? `${reward.title || "Belohnung"} bearbeiten schliessen`
                          : `${reward.title || "Belohnung"} bearbeiten`
                      }
                      accessibilityState={{ expanded: isEditing }}
                    >
                      <Text
                        className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                        style={{
                          color: isEditing
                            ? semanticColors.destructiveStrong
                            : palette.accentText,
                        }}
                        maxFontSizeMultiplier={1.3}
                      >
                        {isEditing ? "Schliessen" : "Bearbeiten"}
                      </Text>
                    </PressableScale>
                  </View>

                  {isEditing && rewardDraft ? (
                    <View className="mt-5 gap-4">
                      <View className="gap-1.5">
                        <Label>Name der Belohnung</Label>
                        <Input
                          value={rewardDraft.title}
                          onChangeText={(value) =>
                            setDraftReward((prev) => (prev ? { ...prev, title: value } : prev))
                          }
                          placeholder="Zum Beispiel Extra Geschichte"
                        />
                      </View>

                      <View className={isCompactWidth ? "gap-3" : "flex-row gap-3"}>
                        <View className={isCompactWidth ? "gap-1.5" : "flex-1 gap-1.5"}>
                          <Label>Icon</Label>
                          <PressableScale
                            onPress={() => setShowIconPicker(true)}
                            accessibilityRole="button"
                            accessibilityLabel="Belohnungsicon wählen"
                            className="h-12 flex-row items-center rounded-tile border border-input bg-card px-4"
                          >
                            <Icon size={18} color={palette.accentStrong} />
                            <Text
                              className="ml-2 text-base font-body text-foreground"
                              numberOfLines={1}
                              maxFontSizeMultiplier={1.3}
                            >
                              Icon wählen
                            </Text>
                          </PressableScale>
                        </View>

                        <View className={isCompactWidth ? "gap-1.5" : "w-[130px] gap-1.5"}>
                          <Label>Sterne</Label>
                          <View className="h-12 flex-row items-center justify-between rounded-tile border border-input bg-card px-1">
                            <PressableScale
                              onPress={() =>
                                setDraftReward((prev) =>
                                  prev ? { ...prev, cost: Math.max(1, prev.cost - 1) } : prev
                                )
                              }
                              className="h-11 w-11 items-center justify-center rounded-full"
                              accessibilityRole="button"
                              accessibilityLabel="Sternkosten verringern"
                            >
                              <Minus size={18} color={semanticColors.mutedForeground} />
                            </PressableScale>
                            <Text
                              className="text-base font-body-semibold text-foreground"
                              maxFontSizeMultiplier={1.3}
                            >
                              {rewardDraft.cost}
                            </Text>
                            <PressableScale
                              onPress={() =>
                                setDraftReward((prev) =>
                                  prev ? { ...prev, cost: Math.min(99, prev.cost + 1) } : prev
                                )
                              }
                              className="h-11 w-11 items-center justify-center rounded-full"
                              accessibilityRole="button"
                              accessibilityLabel="Sternkosten erhöhen"
                            >
                              <Plus size={18} color={palette.accentStrong} />
                            </PressableScale>
                          </View>
                        </View>
                      </View>

                      <View className={isCompactWidth ? "gap-3" : "flex-row gap-3"}>
                        <Button variant="outline" onPress={resetEditor} className="flex-1">
                          Abbrechen
                        </Button>
                        <Button
                          onPress={() => {
                            void saveReward();
                          }}
                          className="flex-1"
                          style={{ backgroundColor: palette.button }}
                        >
                          Speichern
                        </Button>
                      </View>

                      <Button
                        variant="destructive"
                        onPress={() => setRewardPendingDeletion(reward)}
                        className="w-full"
                        accessibilityRole="button"
                        accessibilityLabel={`${reward.title || "Belohnung"} löschen`}
                      >
                        <View className="flex-row items-center gap-2">
                          <Trash2 size={18} color={semanticColors.destructiveForeground} />
                          <Text
                            className="text-base font-body-semibold text-white"
                            maxFontSizeMultiplier={1.3}
                          >
                            Belohnung löschen
                          </Text>
                        </View>
                      </Button>
                    </View>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}

        <View className="mt-5">
          <View className="mb-3 flex-row items-center">
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Gift size={20} color={palette.accentStrong} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-lg font-headline text-foreground">Schnelle Vorschläge</Text>
              <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                Wähle bewährte Belohnungen und passe sie bei Bedarf danach an.
              </Text>
            </View>
          </View>

          <RewardBrowser
            onAddReward={(suggestion) => {
              void handleAddSuggestedReward(suggestion);
            }}
            addedRewardIds={addedSuggestionIds}
            theme="sterne"
          />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={rewardPendingDeletion !== null}
        title="Belohnung löschen?"
        description={`„${rewardPendingDeletion?.title || "Diese Belohnung"}“ wird dauerhaft entfernt und kann nicht wiederhergestellt werden.`}
        confirmLabel="Löschen"
        destructive
        onConfirm={() => {
          void handleConfirmDeleteReward();
        }}
        onCancel={() => setRewardPendingDeletion(null)}
      />

      <IconPicker
        visible={showIconPicker}
        value={activeRewardIcon}
        onSelect={(iconName) =>
          setDraftReward((prev) => (prev ? { ...prev, iconName } : prev))
        }
        onClose={() => setShowIconPicker(false)}
      />
    </ThemedScreenBackground>
  );
}
