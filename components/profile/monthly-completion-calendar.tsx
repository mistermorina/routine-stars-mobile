import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Star } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import type { CalendarCell, WeeklyActivityItem } from "@/lib/activity-insights";
import type { ThemePalette } from "@/lib/theme";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const CALENDAR_CELL_WIDTH = `${100 / 7}%`;

interface MonthlyCompletionCalendarProps {
  monthLabel: string;
  rows: CalendarCell[][];
  weeklyItems?: WeeklyActivityItem[];
  palette: ThemePalette;
  monthlyActiveDays: number;
  monthlyStars: number;
}

export function MonthlyCompletionCalendar({
  monthLabel,
  rows,
  weeklyItems,
  palette,
  monthlyActiveDays,
  monthlyStars,
}: MonthlyCompletionCalendarProps) {
  const weeklyActiveDays = weeklyItems?.filter((item) => item.isActive).length ?? 0;

  return (
    <Card
      className="overflow-hidden rounded-[24px] px-4 py-4"
      style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
    >
      <View
        className="absolute left-[-10px] top-10 h-20 w-20 rounded-full"
        style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
      />
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-body text-muted-foreground">Fortschritt</Text>
          <Text className="mt-1 text-[26px] font-headline leading-[31px] text-foreground">
            {monthLabel}
          </Text>
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

      <View className="mt-4 flex-row gap-3">
        {weeklyItems ? (
          <View
            className="flex-1 rounded-[16px] px-4 py-3"
            style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
          >
            <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
              Diese Woche
            </Text>
            <Text className="mt-2 text-2xl font-headline text-foreground">
              {weeklyActiveDays}/7
            </Text>
          </View>
        ) : null}
        <View
          className="flex-1 rounded-[16px] px-4 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
            Aktive Tage
          </Text>
          <Text className="mt-2 text-2xl font-headline text-foreground">
            {monthlyActiveDays}
          </Text>
        </View>
        <View
          className="flex-1 rounded-[16px] px-4 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
            Monatssterne
          </Text>
          <Text className="mt-2 text-2xl font-headline text-foreground">
            {monthlyStars}
          </Text>
        </View>
      </View>

      {weeklyItems ? (
        <View
          className="mt-4 rounded-[18px] border px-3 py-3"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.58)" }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
              Wochenrhythmus
            </Text>
            <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
              {weeklyActiveDays} aktive Tage
            </Text>
          </View>
          <View className="flex-row self-stretch">
            {weeklyItems.map((item, index) => (
              <Animated.View
                key={item.key}
                entering={FadeInDown.delay(index * 35).duration(240)}
                className="items-center"
                style={{ width: CALENDAR_CELL_WIDTH }}
              >
                <Text
                  className="text-[11px] font-body-semibold"
                  style={{ color: item.isToday ? palette.accentText : "#737373" }}
                >
                  {item.label}
                </Text>
                <View
                  className="mt-2 items-center justify-center rounded-[14px] border"
                  style={{
                    width: "92%",
                    maxWidth: 40,
                    aspectRatio: 1,
                    backgroundColor: item.isActive ? palette.heroSurface : "#FFFFFF",
                    borderColor: item.isToday
                      ? palette.accent
                      : item.isActive
                        ? palette.accentBorder
                        : "rgba(229,229,229,0.85)",
                  }}
                >
                  {item.isActive ? (
                    <Star
                      size={16}
                      color={palette.chartPrimary}
                      fill={palette.chartPrimary}
                    />
                  ) : (
                    <Text className="text-xs font-body-semibold text-muted-foreground">
                      {item.dateLabel}
                    </Text>
                  )}
                </View>
                <Text
                  className="mt-1 h-4 self-stretch text-center text-[10px] font-body-semibold"
                  style={{ color: item.isActive ? palette.accentText : "#A3A3A3" }}
                  numberOfLines={1}
                >
                  {item.isActive ? `${item.stars}` : ""}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-5 h-px" style={{ backgroundColor: palette.accentBorder, opacity: 0.65 }} />

      <View className="mt-5 flex-row self-stretch">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} className="items-center" style={{ width: CALENDAR_CELL_WIDTH }}>
            <Text className="text-xs font-body-semibold text-muted-foreground">{label}</Text>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2 self-stretch">
        {rows.map((row, rowIndex) => (
          <Animated.View
            key={`row-${rowIndex}`}
            entering={FadeInDown.delay(rowIndex * 50).duration(280)}
            className="flex-row self-stretch"
          >
            {row.map((cell) => {
              if (cell.day === null) {
                return (
                  <View
                    key={cell.key}
                    className="items-center py-1"
                    style={{ width: CALENDAR_CELL_WIDTH }}
                  />
                );
              }

              return (
                <View
                  key={cell.key}
                  className="items-center py-1"
                  style={{ width: CALENDAR_CELL_WIDTH }}
                >
                  <View
                    className="items-center justify-center rounded-[15px] border"
                    style={{
                      width: "92%",
                      maxWidth: 44,
                      aspectRatio: 1,
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
                      className="mt-1 h-4 self-stretch text-center text-[10px] font-body-semibold"
                      style={{ color: palette.accentText }}
                      numberOfLines={1}
                    >
                      {cell.stars} ★
                    </Text>
                  ) : (
                    <View className="mt-1 h-4" />
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
