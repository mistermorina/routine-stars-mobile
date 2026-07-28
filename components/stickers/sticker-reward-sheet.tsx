import React from "react";
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { X } from "@/lib/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import {
  getStickerRarityLabel,
  getStickerThemeWorldLabel,
  type AnimalSticker,
} from "@/lib/animal-stickers";
import type { StickerRewardEvent } from "@/lib/sticker-reward-logic";
import type { ThemePalette } from "@/lib/theme";

interface StickerRewardSheetProps {
  visible: boolean;
  childName: string;
  stickers: AnimalSticker[];
  palette: ThemePalette;
  rewardEvent?: StickerRewardEvent | null;
  onSelectSticker: (sticker: AnimalSticker) => void;
  onClose: () => void;
}

export function StickerRewardSheet({
  visible,
  childName,
  stickers,
  palette,
  rewardEvent,
  onSelectSticker,
  onClose,
}: StickerRewardSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetTopPadding = Math.max(insets.top + 12, 20);
  const sheetBottomPadding = Math.max(insets.bottom + 12, 20);
  const availableSheetHeight = Math.max(1, screenHeight - sheetTopPadding - sheetBottomPadding);
  const sheetMaxHeight = Math.min(screenHeight * 0.88, availableSheetHeight);
  const isDailyReward = rewardEvent?.reason === "daily_complete";
  const isCompactWidth = screenWidth < 380;
  const stickerChoiceWidth = isCompactWidth ? "100%" : "48%";
  const eyebrow = isDailyReward ? "Tag geschafft" : "Routine geschafft";
  const rewardSource = rewardEvent?.routineName ?? "deine Routine";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1 justify-end px-4"
        style={{
          backgroundColor: "rgba(246,250,255,0.86)",
          paddingTop: sheetTopPadding,
          paddingBottom: sheetBottomPadding,
        }}
      >
        <View
          className="overflow-hidden rounded-[30px] border px-4 pb-5 pt-4"
          style={{
            backgroundColor: palette.cardTint,
            borderColor: palette.accentBorder,
            maxHeight: sheetMaxHeight,
            shadowColor: "#9DB8D8",
            shadowOpacity: 0.22,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 18 },
          }}
        >
          <View
            className="absolute inset-x-0 top-0 h-36 rounded-[30px]"
            style={{ backgroundColor: palette.heroSurface }}
          />
          <View
            className="absolute right-[-24px] top-[-24px] h-32 w-32 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.28 }}
          />

          <View className="relative" style={{ flexShrink: 1 }}>
            <Pressable
              onPress={onClose}
              className="absolute right-0 top-0 z-10 h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
              accessibilityRole="button"
              accessibilityLabel="Sticker-Auswahl schließen"
            >
              <X size={20} color={palette.accentText} />
            </Pressable>

            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              <View className="min-w-0 pr-12">
                <View
                  className="self-start rounded-full px-3 py-1.5"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.6px]" style={{ color: palette.accentText }} numberOfLines={1}>
                    {eyebrow}
                  </Text>
                </View>
                <Text className="mt-3 text-[26px] font-headline leading-[31px] text-foreground">
                  Such dir einen Sticker aus
                </Text>
                <Text className="mt-2 text-base font-body leading-6 text-muted-foreground">
                  {isDailyReward
                    ? `${childName} hat heute alles geschafft. Dieser Sticker landet direkt in der Sticker-Galerie.`
                    : `${childName} hat "${rewardSource}" abgeschlossen. Dieser Sticker landet direkt in der Sticker-Galerie.`}
                </Text>
              </View>

              <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
                {stickers.map((sticker) => (
                  <PressableScale
                    key={sticker.id}
                    onPress={() => onSelectSticker(sticker)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sticker ${sticker.title} auswählen`}
                    containerStyle={{ width: stickerChoiceWidth }}
                    scaleTo={0.95}
                    className="overflow-hidden rounded-card border px-3 py-3"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderColor: palette.accentBorder,
                    }}
                  >
                    <View
                      className="mx-auto h-24 w-24 items-center justify-center rounded-[24px]"
                      style={{ backgroundColor: `${sticker.accent}18` }}
                    >
                      <Image
                        source={sticker.asset}
                        style={{ width: 82, height: 82 }}
                        contentFit="contain"
                        transition={160}
                      />
                    </View>
                    <Text className="mt-3 text-center text-base font-headline text-foreground" numberOfLines={1}>
                      {sticker.title}
                    </Text>
                    <Text className="mt-1 text-center text-sm font-body text-muted-foreground" numberOfLines={1}>
                      {sticker.mood}
                    </Text>
                    <View className="mt-2 flex-row justify-center gap-1.5">
                      <View
                        className="rounded-full px-2 py-1"
                        style={{ backgroundColor: `${sticker.accent}14` }}
                      >
                        <Text
                          className="text-xs font-body-semibold"
                          style={{ color: palette.accentText }}
                          numberOfLines={1}
                        >
                          {getStickerThemeWorldLabel(sticker.themeWorld)}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-2 py-1"
                        style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                      >
                        <Text className="text-xs font-body-semibold text-muted-foreground" numberOfLines={1}>
                          {getStickerRarityLabel(sticker.rarity)}
                        </Text>
                      </View>
                    </View>
                  </PressableScale>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
