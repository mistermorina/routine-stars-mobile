import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Check } from "@/lib/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens } from "@/lib/design-mode";
import {
  BACKGROUND_SKIN_CATEGORIES,
  getBackgroundSkinCategory,
  getBackgroundSkinOption,
  getBackgroundSkinPickerId,
  getBackgroundSkinRamp,
  getBackgroundSkinsByCategory,
  normalizeBackgroundSkin,
  type BackgroundSkinCategory,
} from "@/lib/background-skins";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import type { BackgroundSkinId, ChildTheme } from "@/lib/types";

const CARD_WIDTH = 96;
const CARD_HEIGHT = 132;
const CARD_GAP = 10;

interface SkinPickerProps {
  value?: BackgroundSkinId | string | null;
  onChange: (value: BackgroundSkinId) => void;
  theme?: ChildTheme | string | null;
}

/**
 * Horizontal row of background skins, each showing the real artwork.
 *
 * The artwork is layered at its own `imageOpacity`, the same value the screen
 * renders it at — a full-strength thumbnail would promise a richer background
 * than the child actually gets (see scripts/check-background-skins.mjs, which
 * caps dark skins for text legibility).
 */
export function SkinPicker({ value, onChange, theme }: SkinPickerProps) {
  const selectedId = normalizeBackgroundSkin(value);
  const selectedPickerId = getBackgroundSkinPickerId(selectedId);
  const { designMode } = useDesignMode();
  const accents = getAccentTokens(designMode, getThemePalette(theme));
  const listRef = useRef<FlatList>(null);

  // Open on whichever kind is already chosen, so the current background is
  // visible without hunting for it.
  const selectedCategory = getBackgroundSkinCategory(
    getBackgroundSkinOption(selectedId)
  );
  const [category, setCategory] = useState<BackgroundSkinCategory>(
    selectedCategory
  );

  // A parent can switch the child while this picker stays mounted. Keep the
  // newly selected child's current background visible in that case.
  useEffect(() => {
    setCategory(selectedCategory);
  }, [selectedCategory]);

  const items = useMemo(
    () => getBackgroundSkinsByCategory(category),
    [category]
  );

  const handleCategory = (next: BackgroundSkinCategory) => {
    if (next === category) return;
    setCategory(next);
    void triggerFeedback("theme_preview", { disableSound: true });
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <View>
      <View className="mb-3 flex-row gap-2">
        {BACKGROUND_SKIN_CATEGORIES.map((entry) => {
          const isActive = entry.id === category;

          return (
            <PressableScale
              key={entry.id}
              onPress={() => handleCategory(entry.id)}
              className="min-h-11 justify-center rounded-full px-4"
              style={{
                backgroundColor: isActive ? accents.pillFill : semanticColors.card,
                borderColor: accents.pillBorder ?? undefined,
                borderWidth: accents.pillBorder ? 1 : 0,
              }}
              accessibilityRole="tab"
              accessibilityLabel={`Kategorie ${entry.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                className="text-sm font-body-semibold"
                style={{ color: isActive ? accents.accent : semanticColors.mutedForeground }}
                maxFontSizeMultiplier={1.3}
              >
                {entry.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <FlatList
        ref={listRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: CARD_GAP, paddingVertical: 4, paddingHorizontal: 2 }}
        initialNumToRender={5}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_GAP,
          offset: (CARD_WIDTH + CARD_GAP) * index,
          index,
        })}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedPickerId;
          const ramp = getBackgroundSkinRamp(item);

          return (
            <PressableScale
              onPress={() => {
                onChange(item.id);
                void triggerFeedback("theme_preview", { disableSound: true });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Hintergrund ${item.label} auswählen`}
              accessibilityHint={item.description}
              accessibilityState={{ selected: isSelected }}
              style={isSelected ? shadowPresets.shadowCard : undefined}
            >
              <View
                className="overflow-hidden rounded-tile"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  backgroundColor: ramp.colors[0],
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? accents.accent : semanticColors.border,
                }}
              >
                <LinearGradient
                  colors={ramp.colors}
                  locations={ramp.locations}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ width: "100%", height: "100%" }}
                  pointerEvents="none"
                />
                {item.image ? (
                  <Image
                    source={item.image}
                    contentFit="cover"
                    style={{ width: "100%", height: "100%", opacity: item.imageOpacity }}
                    transition={120}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  />
                ) : null}

                {isSelected ? (
                  <View
                    className="absolute right-1.5 top-1.5 h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: accents.accent }}
                  >
                    <Check size={14} color={semanticColors.card} strokeWidth={3} />
                  </View>
                ) : null}
              </View>

              <Text
                className="mt-1.5 text-center text-xs font-body-semibold"
                style={{ width: CARD_WIDTH, color: semanticColors.foreground }}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {item.label}
              </Text>
            </PressableScale>
          );
        }}
      />
    </View>
  );
}
