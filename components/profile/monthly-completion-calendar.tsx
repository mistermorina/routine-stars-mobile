import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Star } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import type { CalendarCell, WeeklyActivityItem } from "@/lib/activity-insights";
import { semanticColors, type ThemePalette } from "@/lib/theme";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const CALENDAR_CELL_WIDTH = `${100 / 7}%`;
// Future days are deliberately quieter than `mutedForeground`; they are a
// disabled affordance, not readable copy. No semantic token covers this tint.
const FUTURE_DAY_COLOR = "#b9b9b9";

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
      className="overflow-hidden rounded-card px-4 py-4"
      style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
    >
      <View
        className="absolute left-[-10px] top-10 h-20 w-20 rounded-full"
        style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
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
            className="flex-1 rounded-tile px-4 py-3"
            style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
          >
            <Text
              className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
              maxFontSizeMultiplier={1.3}
            >
              Diese Woche
            </Text>
            <Text className="mt-2 text-2xl font-headline text-foreground" maxFontSizeMultiplier={1.3}>
              {weeklyActiveDays}/7
            </Text>
          </View>
        ) : null}
        <View
          className="flex-1 rounded-tile px-4 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <Text
            className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
            maxFontSizeMultiplier={1.3}
          >
            Aktive Tage
          </Text>
          <Text className="mt-2 text-2xl font-headline text-foreground" maxFontSizeMultiplier={1.3}>
            {monthlyActiveDays}
          </Text>
        </View>
        <View
          className="flex-1 rounded-tile px-4 py-3"
          style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
        >
          <Text
            className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
            maxFontSizeMultiplier={1.3}
          >
            Monatssterne
          </Text>
          <Text className="mt-2 text-2xl font-headline text-foreground" maxFontSizeMultiplier={1.3}>
            {monthlyStars}
          </Text>
        </View>
      </View>

      {weeklyItems ? (
        <View
          className="mt-4 rounded-tile border px-3 py-3"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.58)" }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text
              className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
              maxFontSizeMultiplier={1.3}
            >
              Wochenrhythmus
            </Text>
            <Text
              className="text-xs font-body-semibold"
              style={{ color: palette.accentText }}
              maxFontSizeMultiplier={1.3}
            >
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
                  className="text-xs font-body-semibold"
                  style={{ color: item.isToday ? palette.accentText : semanticColors.mutedForeground }}
                  maxFontSizeMultiplier={1.2}
                >
                  {item.label}
                </Text>
                <View
                  className="mt-2 items-center justify-center rounded-chip border"
                  style={{
                    width: "92%",
                    maxWidth: 40,
                    aspectRatio: 1,
                    backgroundColor: item.isActive ? palette.heroSurface : semanticColors.card,
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
                    <Text
                      className="text-xs font-body-semibold text-muted-foreground"
                      maxFontSizeMultiplier={1.2}
                    >
                      {item.dateLabel}
                    </Text>
                  )}
                </View>
                <Text
                  className="mt-1 h-4 self-stretch text-center text-xs font-body-semibold"
                  style={{ color: item.isActive ? palette.accentText : semanticColors.mutedForeground }}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
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
            <Text
              className="text-xs font-body-semibold text-muted-foreground"
              maxFontSizeMultiplier={1.2}
            >
              {label}
            </Text>
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
                    className="items-center justify-center rounded-chip border"
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
                        style={{ color: cell.isFuture ? FUTURE_DAY_COLOR : semanticColors.foreground }}
                        maxFontSizeMultiplier={1.2}
                      >
                        {cell.day}
                      </Text>
                    )}
                  </View>
                  {cell.isActive ? (
                    <Text
                      className="mt-1 h-4 self-stretch text-center text-xs font-body-semibold"
                      style={{ color: palette.accentText }}
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.2}
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
