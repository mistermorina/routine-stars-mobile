import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { BarChart3, Sparkles, Star } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { Card } from "@/components/ui/card";
import { AvatarImage } from "@/components/ui/avatar-image";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { SettingsMetricCard } from "@/components/settings/settings-metric-card";
import { formatFriendlyDate, getActivityInsights } from "@/lib/activity-insights";
import { getThemePalette, semanticColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] as const;

function localIsoDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

const RING_RADIUS = 56;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function StatsSettings() {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const { getLogsForChild } = useActivityLogs();
  const palette = getThemePalette(selectedChild?.theme);
  const childLogs = useMemo(
    () => (selectedChildId ? getLogsForChild(selectedChildId) : []),
    [getLogsForChild, selectedChildId]
  );
  const insights = useMemo(() => getActivityInsights(childLogs), [childLogs]);
  const recentSummaries = insights.summaries.slice(-7);
  // Calendar-true last 7 days (today rightmost), zero-filled for quiet days.
  const weekDays = useMemo(() => {
    const summariesByDate = new Map(insights.summaries.map((entry) => [entry.date, entry]));
    return Array.from({ length: 7 }, (_, index) => {
      const date = localIsoDaysAgo(6 - index);
      const summary = summariesByDate.get(date);
      return {
        date,
        weekday: WEEKDAY_SHORT[new Date(`${date}T12:00:00`).getDay()],
        totalStars: summary?.totalStars ?? 0,
        isToday: index === 6,
      };
    });
  }, [insights.summaries]);
  const maxWeekStars = Math.max(...weekDays.map((day) => day.totalStars), 1);
  const activeDaysThisWeek = weekDays.filter((day) => day.totalStars > 0).length;
  const weekPercent = Math.round((activeDaysThisWeek / 7) * 100);
  const groupedLogs = useMemo(
    () =>
      [...insights.summaries]
        .slice()
        .reverse()
        .slice(0, 6)
        .map((summary) => ({
          ...summary,
          entries: childLogs.filter((entry) => entry.date === summary.date),
        })),
    [childLogs, insights.summaries]
  );

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {children.length > 1 && (
          <View className="mb-4 flex-row flex-wrap gap-2">
            {children.map((child) => (
              <PressableScale
                key={child.id}
                onPress={() => selectChild(child.id)}
                className={cn(
                  "min-h-11 flex-row items-center rounded-full border px-4 py-2",
                  selectedChildId === child.id ? "" : "border-border"
                )}
                accessibilityRole="button"
                accessibilityLabel={`${child.name} auswählen`}
                accessibilityState={{ selected: selectedChildId === child.id }}
                style={
                  selectedChildId === child.id
                    ? {
                        backgroundColor: palette.tabActiveBg,
                        borderColor: palette.accent,
                      }
                    : { backgroundColor: "rgba(255,255,255,0.78)" }
                }
              >
                <AvatarImage
                  avatar={child.avatar}
                  size={24}
                  borderRadius={12}
                  className="mr-1.5"
                  accessibilityLabel={`${child.name} Avatar`}
                />
                <Text
                  className="text-sm font-body-semibold"
                  style={{
                    color:
                      selectedChildId === child.id
                        ? palette.accentText
                        : semanticColors.foreground,
                  }}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {child.name}
                </Text>
              </PressableScale>
            ))}
          </View>
        )}

        <Animated.View entering={FadeInDown.duration(300)}>
          <SettingsHeroCard
            label="Eltern-Detailansicht"
            title="Statistiken"
            description="Aktivitätstage, Tageshöhen und gesammelte Sterne aus den lokalen Daten."
            badges={[{ label: `${recentSummaries.length} Tage` }]}
            palette={palette}
          />
        </Animated.View>

        {/* Weekly ring — calm editorial summary of the last 7 days */}
        <Animated.View entering={FadeInDown.delay(40).duration(300)} className="mt-4">
          <Card
            className="overflow-hidden rounded-[28px] px-5 py-5"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View className="flex-row items-center gap-4">
              <View className="min-w-0 flex-1">
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground"
                  maxFontSizeMultiplier={1.3}
                >
                  Diese Woche
                </Text>
                <Text className="mt-1 text-[40px] font-headline leading-[46px] text-foreground">
                  {weekPercent} %
                </Text>
                <Text className="mt-1 text-sm font-body text-muted-foreground">
                  An {activeDaysThisWeek} von 7 Tagen wurden Aufgaben erledigt.
                </Text>
              </View>
              <View
                className="h-[128px] w-[128px] items-center justify-center"
                accessible
                accessibilityRole="image"
                accessibilityLabel={`An ${activeDaysThisWeek} von 7 Tagen aktiv, ${weekPercent} Prozent`}
              >
                <Svg width={128} height={128} viewBox="0 0 128 128">
                  <Circle
                    cx={64}
                    cy={64}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={palette.accentBorder}
                    strokeWidth={9}
                    opacity={0.55}
                  />
                  <Circle
                    cx={64}
                    cy={64}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={palette.chartPrimary}
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - weekPercent / 100)}
                    transform="rotate(-90 64 64)"
                  />
                </Svg>
                <View className="absolute items-center">
                  <Text
                    className="text-lg font-headline"
                    style={{ color: palette.accentText }}
                    maxFontSizeMultiplier={1.2}
                  >
                    {activeDaysThisWeek}/7
                  </Text>
                  <Text
                    className="text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    Tagen
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {groupedLogs.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(60).duration(300)} className="mt-4">
            <Card
              className="overflow-hidden rounded-[28px]"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-tile"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <Sparkles size={20} color={palette.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-headline text-foreground">Noch keine Statistikdaten</Text>
                  <Text className="text-sm font-body text-muted-foreground">
                    Sobald Aufgaben erledigt werden, erscheinen hier Trends, Tagesgruppen und Sternenhöhen.
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        <View className="mt-4 flex-row gap-3">
          <SettingsMetricCard
            label="Sterne"
            value={`${insights.totalStars}`}
            caption="Aus Aufgaben"
            accentColor={palette.chartPrimary}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
          <SettingsMetricCard
            label="Aktivitäten"
            value={`${insights.totalActivities}`}
            caption="Erledigte Aufgaben"
            accentColor={palette.chartSecondary}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
        </View>

        <View className="mt-3 flex-row gap-3">
          <SettingsMetricCard
            label="Aktive Tage"
            value={`${insights.activeDays}`}
            caption="Mit Aktivität"
            accentColor={palette.accentStrong}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
          <SettingsMetricCard
            label="Serie"
            value={`${insights.currentStreak}`}
            caption="Zusammenhängend"
            accentColor={palette.accentText}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(90).duration(320)} className="mt-4">
          <Card
            className="overflow-hidden rounded-[28px]"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View
              className="absolute right-[-12px] top-[-10px] h-20 w-20 rounded-full"
              style={{ backgroundColor: palette.motifSecondary, opacity: 0.16 }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <BarChart3 size={20} color={palette.accentStrong} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-headline text-foreground" numberOfLines={1}>
                  Letzte 7 Tage
                </Text>
                <Text className="text-sm font-body text-muted-foreground">
                  Tageshöhen anhand verdienter Sterne
                </Text>
              </View>
            </View>

            {insights.summaries.length > 0 ? (
              <View className="mt-6 flex-row items-end gap-3">
                {weekDays.map((day) => {
                  const height =
                    day.totalStars > 0
                      ? Math.max(28, (day.totalStars / maxWeekStars) * 120)
                      : 6;

                  return (
                    <View
                      key={day.date}
                      className="flex-1 items-center"
                      accessible
                      accessibilityLabel={`${day.weekday}: ${day.totalStars} Sterne`}
                    >
                      <View
                        className="w-full rounded-full"
                        style={{
                          height,
                          backgroundColor:
                            day.totalStars > 0 ? palette.chartPrimary : palette.accentBorder,
                          opacity: day.isToday ? 1 : day.totalStars > 0 ? 0.62 : 0.5,
                        }}
                      />
                      <Text
                        className={cn(
                          "mt-2 text-xs",
                          day.isToday ? "font-body-bold" : "font-body-semibold"
                        )}
                        style={{
                          color: day.isToday
                            ? palette.accentText
                            : semanticColors.mutedForeground,
                        }}
                        maxFontSizeMultiplier={1.2}
                      >
                        {day.weekday}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text className="mt-5 text-sm font-body text-muted-foreground">
                Noch keine Daten vorhanden.
              </Text>
            )}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(130).duration(320)} className="mt-4">
          <Card
            className="overflow-hidden rounded-[28px]"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View
              className="absolute right-[-14px] top-[-10px] h-20 w-20 rounded-full"
              style={{ backgroundColor: palette.motifSecondary, opacity: 0.16 }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-headline text-foreground">Letzte Einträge</Text>
              <View className="flex-row items-center gap-1">
                <Star
                  size={14}
                  color={semanticColors.gold}
                  fill={semanticColors.gold}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
                <Text
                  className="text-sm font-body-semibold text-muted-foreground"
                  maxFontSizeMultiplier={1.3}
                  accessibilityLabel={`${insights.totalStars} Sterne gesamt`}
                >
                  {insights.totalStars}
                </Text>
              </View>
            </View>

            {groupedLogs.length === 0 ? (
              <Text className="mt-4 text-sm font-body text-muted-foreground">
                Sobald Aufgaben erledigt werden, erscheinen hier die Tagesgruppen.
              </Text>
            ) : (
              <View className="mt-4 gap-3">
                {groupedLogs.map((group) => (
                  <View
                    key={group.date}
                    className="rounded-card border px-4 py-4"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.76)",
                      borderColor: palette.accentBorder,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-headline text-foreground">
                        {formatFriendlyDate(group.date)}
                      </Text>
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: palette.accentText }}
                        maxFontSizeMultiplier={1.3}
                      >
                        {group.totalStars} Sterne
                      </Text>
                    </View>
                    <View className="mt-3 gap-2">
                      {group.entries.slice(0, 3).map((entry) => (
                        <View key={entry.id} className="flex-row items-center justify-between">
                          <Text className="flex-1 pr-3 text-sm font-body text-foreground">
                            {entry.taskTitle}
                          </Text>
                          <Text className="text-sm font-body-semibold text-muted-foreground">
                            {entry.stars >= 0 ? `+${entry.stars}` : `${entry.stars}`}
                          </Text>
                        </View>
                      ))}
                      {group.entries.length > 3 ? (
                        <Text className="pt-1 text-xs font-body" style={{ color: palette.accentText }}>
                          +{group.entries.length - 3} weitere Einträge an diesem Tag
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
