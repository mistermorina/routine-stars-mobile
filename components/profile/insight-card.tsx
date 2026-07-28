import React from "react";
import { View, Text } from "react-native";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card } from "@/components/ui/card";

interface InsightCardProps {
  label: string;
  /** Pre-formatted display string ("12 %", "3 Tage"). Used unless `numericValue` is set. */
  value: string;
  /**
   * Pure number metrics. When set it wins over `value` and renders through
   * AnimatedNumber, so the tile counts up instead of snapping. `value` stays the
   * static fallback for call sites that pass formatted strings.
   */
  numericValue?: number;
  caption: string;
  accentColor: string;
  backgroundColor: string;
}

export function InsightCard({
  label,
  value,
  numericValue,
  caption,
  accentColor,
  backgroundColor,
}: InsightCardProps) {
  return (
    <Card
      className="min-h-[132px] flex-1 overflow-hidden rounded-card"
      style={{ backgroundColor }}
    >
      <View
        className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.08 }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <View className="justify-between">
        <View
          className="self-start rounded-full px-2.5 py-1"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <Text
            className="text-xs font-body-semibold uppercase tracking-[0.6px]"
            style={{ color: accentColor }}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
          >
            Insight
          </Text>
        </View>
        <Text
          className="text-sm font-body-semibold"
          style={{ color: accentColor }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
        {numericValue === undefined ? (
          <Text className="mt-3 text-3xl font-headline text-foreground" maxFontSizeMultiplier={1.3}>
            {value}
          </Text>
        ) : (
          <View className="mt-3">
            <AnimatedNumber
              value={numericValue}
              textClassName="text-3xl font-headline text-foreground"
              maxFontSizeMultiplier={1.3}
            />
          </View>
        )}
        <Text
          className="mt-2 text-base font-body leading-6 text-muted-foreground"
          maxFontSizeMultiplier={1.3}
        >
          {caption}
        </Text>
      </View>
    </Card>
  );
}
