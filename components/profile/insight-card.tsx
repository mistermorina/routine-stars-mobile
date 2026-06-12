import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui/card";

interface InsightCardProps {
  label: string;
  value: string;
  caption: string;
  accentColor: string;
  backgroundColor: string;
}

export function InsightCard({
  label,
  value,
  caption,
  accentColor,
  backgroundColor,
}: InsightCardProps) {
  return (
    <Card
      className="min-h-[132px] flex-1 overflow-hidden rounded-[20px]"
      style={{ backgroundColor }}
    >
      <View
        className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.08 }}
      />
      <View className="justify-between">
        <View
          className="self-start rounded-full px-2.5 py-1"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <Text className="text-xs font-body-semibold uppercase tracking-[0.6px]" style={{ color: accentColor }} numberOfLines={1}>
            Insight
          </Text>
        </View>
        <Text className="text-sm font-body-semibold" style={{ color: accentColor }}>
          {label}
        </Text>
        <Text className="mt-3 text-3xl font-headline text-foreground">
          {value}
        </Text>
        <Text className="mt-2 text-base font-body leading-6 text-muted-foreground">
          {caption}
        </Text>
      </View>
    </Card>
  );
}
