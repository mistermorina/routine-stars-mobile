import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Card } from "@/components/ui/card";
import type { WeeklyActivityItem } from "@/lib/activity-insights";
import type { ThemePalette } from "@/lib/theme";

interface WeeklyActivityStripProps {
  items: WeeklyActivityItem[];
  palette: ThemePalette;
}

export function WeeklyActivityStrip({
  items,
  palette,
}: WeeklyActivityStripProps) {
  const activeCount = items.filter((item) => item.isActive).length;

  return (
    <Card
      className="overflow-hidden rounded-[22px] px-4 py-4"
      style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
    >
      <View
        className="absolute right-[-12px] top-[-10px] h-20 w-20 rounded-full"
        style={{ backgroundColor: palette.motifSecondary, opacity: 0.2 }}
      />
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-body text-muted-foreground">Diese Woche</Text>
          <Text className="mt-1 text-xl font-headline text-foreground">
            Kleine Schritte, große Sterne
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: palette.heroSurface }}
        >
          <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
            {activeCount}/7 aktiv
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row justify-between">
        {items.map((item, index) => (
          <Animated.View
            key={item.key}
            entering={FadeInDown.delay(index * 40).duration(260)}
            className="items-center"
          >
            <Text
              className="mb-2 text-xs font-body-semibold"
              style={{ color: item.isToday ? palette.accentText : "#6b7280" }}
            >
              {item.label}
            </Text>
            <View
              className="h-12 w-12 items-center justify-center rounded-[16px] border"
              style={{
                backgroundColor: item.isActive ? palette.heroSurface : "rgba(255,255,255,0.76)",
                borderColor: item.isToday ? palette.accent : "rgba(255,255,255,0.72)",
              }}
            >
              <Text
                className="text-sm font-body-bold"
                style={{ color: item.isActive ? palette.accentText : "#737373" }}
              >
                {item.isActive ? item.stars : item.dateLabel}
              </Text>
            </View>
            <Text className="mt-2 text-xs font-body text-muted-foreground">
              {item.isActive ? `${item.taskCount} Aufg.` : `Tag ${item.dateLabel}`}
            </Text>
          </Animated.View>
        ))}
      </View>
    </Card>
  );
}
