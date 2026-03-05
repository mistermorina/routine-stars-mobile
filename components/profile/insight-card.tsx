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
    <Card className="min-h-[132px] flex-1" style={{ backgroundColor }}>
      <View className="justify-between">
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
