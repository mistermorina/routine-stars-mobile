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
  return (
    <Card style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}>
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
            7 Tage
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row justify-between">
        {items.map((item, index) => (
          <Animated.View
            key={item.key}
            entering={FadeInDown.delay(index * 40).duration(260)}
            className="items-center"
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: item.isActive ? palette.heroSurface : "rgba(255,255,255,0.72)",
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
            <Text className="mt-2 text-xs font-body-semibold text-muted-foreground">
              {item.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </Card>
  );
}
