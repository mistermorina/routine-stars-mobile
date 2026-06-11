import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui/card";
import { SoftHeroWash } from "@/components/ui/soft-hero-wash";
import type { ThemePalette } from "@/lib/theme";

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
  const cardBackground = palette?.cardTint ?? "#FFFFFF";
  const borderColor = palette?.accentBorder ?? "#DCEAF7";
  const heroSurface = palette?.heroSurface ?? "#FFF7E8";
  const motifColor = palette?.motifSecondary ?? "#DDEEFF";
  const accentText = palette?.accentText ?? "#245A74";

  return (
    <Card
      className="mb-4 overflow-hidden rounded-[28px] px-4 py-4"
      style={{ backgroundColor: cardBackground, borderColor }}
    >
      <SoftHeroWash
        surfaceColor={heroSurface}
        baseColor={cardBackground}
        holdOffset="64%"
      />
      <View
        className="absolute right-[-18px] top-[-16px] h-24 w-24 rounded-full"
        style={{ backgroundColor: motifColor, opacity: 0.2 }}
      />

      <View className="flex-row items-start justify-between gap-3">
        <View
          className="min-w-0 max-w-[58%] rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
        >
          <Text
            className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {label}
          </Text>
        </View>

        {badges.length > 0 ? (
          <View className="max-w-[48%] flex-row flex-wrap justify-end gap-2">
            {badges.map((badge) => (
              <View
                key={`${badge.label}-${badge.value ?? ""}`}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.84)" }}
              >
                <Text
                  className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-foreground"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                >
                  {badge.value !== undefined ? `${badge.value} ${badge.label}` : badge.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Text
        className="mt-5 text-[30px] font-headline leading-[36px] text-foreground"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {title}
      </Text>
      <Text className="mt-3 text-[18px] font-body leading-7" style={{ color: accentText }}>
        {description}
      </Text>
    </Card>
  );
}
