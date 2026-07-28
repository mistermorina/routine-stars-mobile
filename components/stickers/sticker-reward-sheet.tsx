import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { X } from "@/lib/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easings, enterStagger, springs, timings } from "@/lib/motion";
import {
  getStickerRarityLabel,
  getStickerThemeWorldLabel,
  type AnimalSticker,
} from "@/lib/animal-stickers";
import type { StickerRewardEvent } from "@/lib/sticker-reward-logic";
import { shadowPresets, type ThemePalette } from "@/lib/theme";

const BACKDROP_COLOR = "rgba(246,250,255,0.86)";

/**
 * Slide-down on dismiss. Reanimated timing config composed from motion tokens
 * (same pattern as the timer ring): ease-in-out so the sheet accelerates away
 * instead of crawling off the bottom edge.
 */
const SHEET_EXIT_TIMING = {
  duration: durations.base,
  easing: easings.inOut,
  reduceMotion: ReduceMotion.System,
} as const;

/**
 * Stagger lead for the sticker choices, expressed in `enterStagger` steps
 * (40ms each). Four steps ≈ 160ms, so the reveal starts only once the sheet
 * has travelled most of the way up — sheet lands first, stickers follow.
 */
const STICKER_REVEAL_LEAD = 4;

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
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const sheetTopPadding = Math.max(insets.top + 12, 20);
  const sheetBottomPadding = Math.max(insets.bottom + 12, 20);
  const availableSheetHeight = Math.max(1, screenHeight - sheetTopPadding - sheetBottomPadding);
  const sheetMaxHeight = Math.min(screenHeight * 0.88, availableSheetHeight);
  const isDailyReward = rewardEvent?.reason === "daily_complete";
  const isCompactWidth = screenWidth < 380;
  const stickerChoiceWidth = isCompactWidth ? "100%" : "48%";
  const eyebrow = isDailyReward ? "Tag geschafft" : "Routine geschafft";
  const rewardSource = rewardEvent?.routineName ?? "deine Routine";

  // Upper bound of the sheet's own height, so translating by it always clears
  // the bottom edge no matter how many sticker choices are on offer.
  const sheetTravel = sheetMaxHeight + sheetBottomPadding;

  // The sheet outlives `visible` by one exit animation, so the dismissal is a
  // slide-down instead of the Modal yanking its children out of the tree.
  const [isPresented, setIsPresented] = useState(visible);
  const translateY = useSharedValue(sheetTravel);
  const backdropOpacity = useSharedValue(0);

  if (visible && !isPresented) {
    // Adjusted during render, not in an effect, so the Modal mounts in the same
    // commit the sheet was asked for instead of a frame later.
    setIsPresented(true);
  }

  useEffect(() => {
    if (!isPresented) {
      return;
    }

    if (visible) {
      if (reduceMotion) {
        translateY.value = 0;
        backdropOpacity.value = 1;
        return;
      }

      translateY.value = sheetTravel;
      backdropOpacity.value = 0;
      translateY.value = withSpring(0, springs.gentle);
      backdropOpacity.value = withTiming(1, timings.base);
      return;
    }

    if (reduceMotion) {
      setIsPresented(false);
      return;
    }

    backdropOpacity.value = withTiming(0, timings.fast);
    translateY.value = withTiming(sheetTravel, SHEET_EXIT_TIMING, (finished) => {
      if (finished) {
        runOnJS(setIsPresented)(false);
      }
    });
  }, [backdropOpacity, isPresented, reduceMotion, sheetTravel, translateY, visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal visible={isPresented} transparent animationType="none" onRequestClose={onClose}>
      <View
        className="flex-1 justify-end px-4"
        style={{
          paddingTop: sheetTopPadding,
          paddingBottom: sheetBottomPadding,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: BACKDROP_COLOR },
            backdropStyle,
          ]}
        />

        <Animated.View style={sheetStyle}>
          <View
            className="overflow-hidden rounded-[30px] border px-4 pb-5 pt-4"
            style={[
              shadowPresets.shadowFloating,
              {
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
                maxHeight: sheetMaxHeight,
              },
            ]}
          >
            <View
              className="absolute inset-x-0 top-0 h-36 rounded-[30px]"
              style={{ backgroundColor: palette.heroSurface }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <View
              className="absolute right-[-24px] top-[-24px] h-32 w-32 rounded-full"
              style={{ backgroundColor: palette.motifSecondary, opacity: 0.28 }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />

            <View className="relative" style={{ flexShrink: 1 }}>
              <Pressable
                onPress={onClose}
                className="absolute right-0 top-0 z-10 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
                hitSlop={8}
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
                    <Text
                      className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                      style={{ color: palette.accentText }}
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.2}
                    >
                      {eyebrow}
                    </Text>
                  </View>
                  <Text
                    className="mt-3 text-[26px] font-headline leading-[31px] text-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    Such dir einen Sticker aus
                  </Text>
                  <Text className="mt-2 text-base font-body leading-6 text-muted-foreground">
                    {isDailyReward
                      ? `${childName} hat heute alles geschafft. Dieser Sticker landet direkt in der Sticker-Galerie.`
                      : `${childName} hat "${rewardSource}" abgeschlossen. Dieser Sticker landet direkt in der Sticker-Galerie.`}
                  </Text>
                </View>

                <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
                  {stickers.map((sticker, index) => (
                    <Animated.View
                      key={sticker.id}
                      entering={enterStagger(index + STICKER_REVEAL_LEAD, 45, 320)}
                      style={{ width: stickerChoiceWidth }}
                    >
                      <PressableScale
                        onPress={() => onSelectSticker(sticker)}
                        accessibilityRole="button"
                        accessibilityLabel={`Sticker ${sticker.title} auswählen`}
                        containerStyle={{ width: "100%" }}
                        scaleTo={0.95}
                        className="overflow-hidden rounded-card border px-3 py-3"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.8)",
                          borderColor: palette.accentBorder,
                        }}
                      >
                        <View
                          className="mx-auto h-24 w-24 items-center justify-center rounded-card"
                          style={{ backgroundColor: `${sticker.accent}18` }}
                        >
                          <Image
                            source={sticker.asset}
                            style={{ width: 82, height: 82 }}
                            contentFit="contain"
                            transition={160}
                          />
                        </View>
                        <Text
                          className="mt-3 text-center text-base font-headline text-foreground"
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.3}
                        >
                          {sticker.title}
                        </Text>
                        <Text
                          className="mt-1 text-center text-sm font-body text-muted-foreground"
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.3}
                        >
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
                              maxFontSizeMultiplier={1.2}
                            >
                              {getStickerThemeWorldLabel(sticker.themeWorld)}
                            </Text>
                          </View>
                          <View
                            className="rounded-full px-2 py-1"
                            style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                          >
                            <Text
                              className="text-xs font-body-semibold text-muted-foreground"
                              numberOfLines={1}
                              maxFontSizeMultiplier={1.2}
                            >
                              {getStickerRarityLabel(sticker.rarity)}
                            </Text>
                          </View>
                        </View>
                      </PressableScale>
                    </Animated.View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
