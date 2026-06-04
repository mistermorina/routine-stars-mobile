import React from "react";
import { View, Text } from "react-native";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsMetricCardProps {
  label: string;
  value: string;
  caption: string;
  accentColor: string;
  backgroundColor: string;
  borderColor?: string;
  className?: string;
}

export function SettingsMetricCard({
  label,
  value,
  caption,
  accentColor,
  backgroundColor,
  borderColor,
  className,
}: SettingsMetricCardProps) {
  return (
    <Card
      className={cn("min-h-[124px] flex-1 overflow-hidden rounded-[22px] px-4 py-4", className)}
      style={{ backgroundColor, borderColor }}
    >
      <View
        className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.08 }}
      />
      <Text
        className="text-[11px] font-body-semibold uppercase tracking-[0.7px]"
        style={{ color: accentColor }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
      <Text className="mt-2 text-[34px] font-headline leading-[38px] text-foreground">
        {value}
      </Text>
      <Text className="mt-2 text-sm font-body leading-5 text-muted-foreground" numberOfLines={2}>
        {caption}
      </Text>
    </Card>
  );
}
