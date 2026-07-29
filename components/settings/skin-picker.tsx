import React from "react";
import { FlatList, Text, View } from "react-native";
import { Image } from "expo-image";
import { Check } from "@/lib/icons";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens } from "@/lib/design-mode";
import { BACKGROUND_SKINS, normalizeBackgroundSkin } from "@/lib/background-skins";
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
  const { designMode } = useDesignMode();
  const accents = getAccentTokens(designMode, getThemePalette(theme));

  return (
    <FlatList
      data={BACKGROUND_SKINS}
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
        const isSelected = item.id === selectedId;

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
                backgroundColor: item.image ? semanticColors.background : item.previewBackground,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? accents.accent : semanticColors.border,
              }}
            >
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
  );
}
