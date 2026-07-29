import React, { useMemo, useRef, useState } from "react";
import { FlatList, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens, getAvatarTileFill } from "@/lib/design-mode";
import { avatarCategories, areAvatarValuesEqual, type AvatarCategoryName } from "@/lib/avatars";
import { enterFade } from "@/lib/motion";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import { triggerFeedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import type { AvatarValue, ChildTheme } from "@/lib/types";

const CATEGORY_NAMES = Object.keys(avatarCategories) as AvatarCategoryName[];

const TILE_SIZE = 68;
const TILE_GAP = 10;

interface AvatarPickerProps {
  value: AvatarValue;
  onChange: (value: AvatarValue) => void;
  theme?: ChildTheme | string | null;
}

/**
 * Category chips over a horizontal row of avatars.
 *
 * The set is 70 illustrations — a wrapped grid would push the rest of the form
 * far below the fold, so each category scrolls sideways instead and the chips
 * carry the navigation. `FlatList` (not a horizontal ScrollView) keeps the
 * off-screen tiles unmounted; at this count that is the difference between a
 * smooth row and a stutter on first paint.
 */
export function AvatarPicker({ value, onChange, theme }: AvatarPickerProps) {
  const [category, setCategory] = useState<AvatarCategoryName>(CATEGORY_NAMES[0]);
  const { designMode } = useDesignMode();
  const accents = getAccentTokens(designMode, getThemePalette(theme));
  const tileFill = getAvatarTileFill();
  const listRef = useRef<FlatList>(null);

  const avatars = useMemo(() => avatarCategories[category], [category]);

  const handleCategory = (next: AvatarCategoryName) => {
    if (next === category) return;
    setCategory(next);
    void triggerFeedback("theme_preview", { disableSound: true });
    // Jump back to the start; leaving the row mid-scroll on a new category
    // reads as if items are missing.
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  return (
    <View>
      <View className="mb-3 flex-row flex-wrap gap-2">
        {CATEGORY_NAMES.map((name) => {
          const isActive = name === category;

          return (
            <PressableScale
              key={name}
              onPress={() => handleCategory(name)}
              className={cn(
                "min-h-11 justify-center rounded-full border px-4",
                isActive ? "" : "border-border"
              )}
              style={
                isActive
                  ? { backgroundColor: accents.pillFill, borderColor: accents.accent }
                  : { backgroundColor: semanticColors.card }
              }
              accessibilityRole="tab"
              accessibilityLabel={`Kategorie ${name}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                className="text-sm font-body-semibold"
                style={{ color: isActive ? accents.accent : semanticColors.mutedForeground }}
                maxFontSizeMultiplier={1.3}
              >
                {name}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <Animated.View key={category} entering={enterFade()}>
        <FlatList
          ref={listRef}
          data={avatars}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: TILE_GAP, paddingVertical: 4, paddingHorizontal: 2 }}
          initialNumToRender={8}
          windowSize={5}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: TILE_SIZE + TILE_GAP,
            offset: (TILE_SIZE + TILE_GAP) * index,
            index,
          })}
          renderItem={({ item }) => {
            const isSelected = areAvatarValuesEqual(value, item.value);

            return (
              <PressableScale
                onPress={() => {
                  onChange(item.value);
                  void triggerFeedback("theme_preview", { disableSound: true });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Avatar ${item.label} auswählen`}
                accessibilityState={{ selected: isSelected }}
                style={isSelected ? shadowPresets.shadowCard : undefined}
              >
                {/* Solid, not frosted: a translucent tile takes on whatever
                    screen colour sits behind it, and the illustrations need a
                    calm, constant backdrop to read against. */}
                <View
                  className="items-center justify-center overflow-hidden"
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    borderRadius: 20,
                    backgroundColor: tileFill,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? accents.accent : semanticColors.border,
                  }}
                >
                  <AvatarImage
                    avatar={item.value}
                    size={TILE_SIZE - 12}
                    borderRadius={16}
                    backgroundColor="transparent"
                    accessibilityElementsHidden
                  />
                </View>
              </PressableScale>
            );
          }}
        />
      </Animated.View>
    </View>
  );
}
