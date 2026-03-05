import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Star } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import type { CalendarCell } from "@/lib/activity-insights";
import type { ThemePalette } from "@/lib/theme";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface MonthlyCompletionCalendarProps {
  monthLabel: string;
  rows: CalendarCell[][];
  palette: ThemePalette;
}

export function MonthlyCompletionCalendar({
  monthLabel,
  rows,
  palette,
}: MonthlyCompletionCalendarProps) {
  return (
    <Card
      className="overflow-hidden"
      style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-body text-muted-foreground">Monatsblick</Text>
          <Text className="mt-1 text-2xl font-headline text-foreground">{monthLabel}</Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: palette.heroSurface }}
        >
          <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
            Aktivität
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="flex-1 items-center">
            <Text className="text-xs font-body-semibold text-muted-foreground">{label}</Text>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2">
        {rows.map((row, rowIndex) => (
          <Animated.View
            key={`row-${rowIndex}`}
            entering={FadeInDown.delay(rowIndex * 50).duration(280)}
            className="flex-row"
          >
            {row.map((cell) => {
              if (cell.day === null) {
                return <View key={cell.key} className="flex-1 items-center py-1.5" />;
              }

              return (
                <View key={cell.key} className="flex-1 items-center py-1.5">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: cell.isActive
                        ? palette.heroSurface
                        : "rgba(255,255,255,0.6)",
                      borderColor: cell.isToday
                        ? palette.accent
                        : cell.isActive
                          ? palette.accentBorder
                          : "rgba(229,229,229,0.7)",
                    }}
                  >
                    {cell.isActive ? (
                      <Star
                        size={18}
                        color={palette.chartPrimary}
                        fill={palette.chartPrimary}
                      />
                    ) : (
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: cell.isFuture ? "#b9b9b9" : "#1a1a2e" }}
                      >
                        {cell.day}
                      </Text>
                    )}
                  </View>
                  {cell.isActive ? (
                    <Text
                      className="mt-1 text-[11px] font-body-semibold"
                      style={{ color: palette.accentText }}
                    >
                      {cell.stars}
                    </Text>
                  ) : (
                    <Text className="mt-1 text-[11px] font-body text-muted-foreground">
                      {cell.day}
                    </Text>
                  )}
                </View>
              );
            })}
          </Animated.View>
        ))}
      </View>
    </Card>
  );
}
