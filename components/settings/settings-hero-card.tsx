import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { Card } from "@/components/ui/card";
import { SoftHeroWash } from "@/components/ui/soft-hero-wash";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getThemePalette, type ThemePalette } from "@/lib/theme";

type HeroBadge = {
  label: string;
  value?: string | number;
};

interface SettingsHeroCardProps {
  label: string;
  title: string;
  description: string;
  badges?: HeroBadge[];
  palette?: ThemePalette;
}

export function SettingsHeroCard({
  label,
  title,
  description,
  badges = [],
  palette,
}: SettingsHeroCardProps) {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  // No child selected yet → the default ("sterne") palette carries exactly the
  // same values the literal fallbacks used to hardcode.
  const { designMode } = useDesignMode();
  const isGlass = designMode === "glass";
  const resolvedPalette = palette ?? getThemePalette();
  const cardBackground = resolvedPalette.cardTint;
  const borderColor = resolvedPalette.accentBorder;
  const heroSurface = resolvedPalette.heroSurface;
  const motifColor = resolvedPalette.motifSecondary;
  const accentText = resolvedPalette.accentText;

  return (
    <Card
      className="mb-4 overflow-hidden rounded-[28px] px-4 py-4"
      style={{ backgroundColor: cardBackground, borderColor }}
    >
      {isGlass ? null : (
        <>
          {/* Opaque tint + motif: they would sit on top of the frosted pane. */}
          <SoftHeroWash
            surfaceColor={heroSurface}
            baseColor={cardBackground}
            holdOffset="64%"
          />
          <View
            className="absolute right-[-18px] top-[-16px] h-24 w-24 rounded-full"
            style={{ backgroundColor: motifColor, opacity: 0.2 }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </>
      )}

      <View className={isCompactWidth ? "gap-3" : "flex-row items-start justify-between gap-3"}>
        <View
          className="min-h-11 self-start rounded-full px-3 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
        >
          <Text
            className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            maxFontSizeMultiplier={1.3}
          >
            {label}
          </Text>
        </View>

        {badges.length > 0 ? (
          <View className={isCompactWidth ? "flex-row flex-wrap gap-2" : "flex-row flex-wrap justify-end gap-2"}>
            {badges.map((badge) => (
              <View
                key={`${badge.label}-${badge.value ?? ""}`}
                className="min-h-11 justify-center rounded-full px-3 py-2"
                style={{ backgroundColor: "rgba(255,255,255,0.84)" }}
              >
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.7px] text-foreground"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  maxFontSizeMultiplier={1.3}
                >
                  {badge.value !== undefined ? `${badge.value} ${badge.label}` : badge.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Text
        className="mt-5 text-3xl font-headline leading-[36px] text-foreground"
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.78}
      >
        {title}
      </Text>
      <Text className="mt-3 text-lg font-body leading-7" style={{ color: accentText }}>
        {description}
      </Text>
    </Card>
  );
}
