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
      className="min-h-[144px] flex-1 overflow-hidden rounded-[26px]"
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
          <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px]" style={{ color: accentColor }}>
            Insight
          </Text>
        </View>
        <Text className="text-sm font-body-semibold" style={{ color: accentColor }}>
          {label}
        </Text>
        <Text className="mt-4 text-3xl font-headline text-foreground">
          {value}
        </Text>
        <Text className="mt-2 text-sm font-body text-muted-foreground">
          {caption}
        </Text>
      </View>
    </Card>
  );
}
