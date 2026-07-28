import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Check, Palette, Sparkles } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Card } from "@/components/ui/card";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import {
  BACKGROUND_SKINS,
  normalizeBackgroundSkin,
  type BackgroundSkinOption,
} from "@/lib/background-skins";
import { getThemePalette, semanticColors } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { BackgroundSkinId } from "@/lib/types";

function SkinPreview({ skin }: { skin: BackgroundSkinOption }) {
  const hasImage = Boolean(skin.image);

  return (
    <View
      className="h-28 overflow-hidden rounded-card"
      // Artwork is layered over the light base at `imageOpacity`, exactly as
      // ThemedScreenBackground does it — otherwise a scrimmed skin like
      // Weltraum would preview far darker than it ever renders.
      style={{
        backgroundColor: hasImage ? semanticColors.background : skin.previewBackground,
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {skin.image ? (
        <Image
          source={skin.image}
          contentFit="cover"
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { opacity: skin.imageOpacity }]}
        />
      ) : (
        <>
          <View
            className="absolute left-[-12px] top-[-10px] h-20 w-20 rounded-full"
            style={{ backgroundColor: skin.previewAccent, opacity: 0.7 }}
          />
          <View
            className="absolute bottom-[-14px] right-[-12px] h-24 w-24 rounded-full"
            style={{ backgroundColor: skin.previewSoft, opacity: 0.82 }}
          />
        </>
      )}

      <View
        className="absolute left-3 top-3 h-7 w-24 rounded-chip"
        style={{ backgroundColor: "rgba(255,255,255,0.84)" }}
      />
      <View
        className="absolute bottom-3 right-3 h-12 w-20 rounded-tile"
        style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
      />
    </View>
  );
}

export default function BackgroundSettingsScreen() {
  const { children, selectedChild, selectedChildId, selectChild, updateChild } = useChildren();
  const palette = getThemePalette(selectedChild?.theme);
  const selectedSkinId = normalizeBackgroundSkin(selectedChild?.backgroundSkin);

  async function handleSelectSkin(skinId: BackgroundSkinId) {
    if (!selectedChild) return;
    await updateChild(selectedChild.id, { backgroundSkin: skinId });
  }

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {children.length > 1 ? (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {children.map((child) => {
              const childPalette = getThemePalette(child.theme);
              const isSelected = selectedChildId === child.id;

              return (
                <PressableScale
                  key={child.id}
                  onPress={() => selectChild(child.id)}
                  className="min-h-11 flex-row items-center rounded-full border px-4 py-2"
                  accessibilityRole="button"
                  accessibilityLabel={`${child.name} auswählen`}
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    backgroundColor: isSelected ? childPalette.tabActiveBg : "rgba(255,255,255,0.78)",
                    borderColor: isSelected ? childPalette.accent : "rgba(157,184,216,0.32)",
                  }}
                >
                  <AvatarImage
                    avatar={child.avatar}
                    size={24}
                    borderRadius={12}
                    className="mr-1.5"
                    accessibilityLabel={`${child.name} Avatar`}
                  />
                  <Text
                    className="text-sm font-body-semibold"
                    style={{
                      color: isSelected ? childPalette.accentText : semanticColors.foreground,
                    }}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.3}
                  >
                    {child.name}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        ) : null}

        <SettingsHeroCard
          label="Profil-Skins"
          title="Hintergrund"
          description="Freie Flächen bekommen einen ruhigen Skin, Cards bleiben klar."
          badges={[
            { label: selectedChild?.name ?? "Profil" },
            { label: BACKGROUND_SKINS.find((skin) => skin.id === selectedSkinId)?.label ?? "Kein Skin" },
          ]}
          palette={palette}
        />

        {!selectedChild ? (
          <Card
            className="mt-4 rounded-[28px]"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Sparkles size={20} color={palette.accentStrong} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-headline text-foreground">
                  Kein Kinderprofil
                </Text>
                <Text className="mt-1 text-sm font-body text-muted-foreground">
                  Lege zuerst ein Profil an, dann kannst du einen Skin wählen.
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <View className="mt-4 flex-row flex-wrap justify-between" style={{ rowGap: 12 }}>
            {BACKGROUND_SKINS.map((skin) => {
              const isSelected = selectedSkinId === skin.id;

              return (
                <PressableScale
                  key={skin.id}
                  onPress={() => handleSelectSkin(skin.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Hintergrund ${skin.label} wählen`}
                  accessibilityHint={skin.description}
                  accessibilityState={{ selected: isSelected }}
                  containerStyle={{ width: "48%" }}
                  className={cn("rounded-[26px] border p-2")}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.84)",
                    borderColor: isSelected ? palette.accent : "rgba(157,184,216,0.34)",
                    borderWidth: isSelected ? 2 : 1,
                  }}
                >
                  <SkinPreview skin={skin} />

                  <View className="mt-3 flex-row items-center gap-2 px-1 pb-1">
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-sm font-body-semibold text-foreground"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.86}
                        maxFontSizeMultiplier={1.3}
                      >
                        {skin.label}
                      </Text>
                      <Text
                        className="mt-0.5 text-sm font-body text-muted-foreground"
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        {skin.description}
                      </Text>
                    </View>
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        // Neutral rather than the skin colour: dark artwork
                        // like Weltraum would put a dark glyph on a dark disc.
                        backgroundColor: isSelected ? palette.tabActiveBg : semanticColors.muted,
                      }}
                    >
                      {isSelected ? (
                        <Check size={17} color={palette.accentText} strokeWidth={2.4} />
                      ) : (
                        <Palette size={16} color={palette.accentText} strokeWidth={1.9} />
                      )}
                    </View>
                  </View>
                </PressableScale>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedScreenBackground>
  );
}
