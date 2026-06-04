import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { MonthlyCompletionCalendar } from "@/components/profile/monthly-completion-calendar";
import { Card } from "@/components/ui/card";
import { AvatarImage } from "@/components/ui/avatar-image";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { SettingsMetricCard } from "@/components/settings/settings-metric-card";
import { getActivityInsights } from "@/lib/activity-insights";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ProgressSettings() {
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const { getLogsForChild } = useActivityLogs();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const palette = getThemePalette(selectedChild?.theme);

  const childLogs = useMemo(
    () => (selectedChildId ? getLogsForChild(selectedChildId) : []),
    [getLogsForChild, selectedChildId]
  );
  const insights = useMemo(
    () => getActivityInsights(childLogs, currentYear, currentMonth),
    [childLogs, currentMonth, currentYear]
  );

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((value) => value - 1);
      return;
    }
    setCurrentMonth((value) => value - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((value) => value + 1);
      return;
    }
    setCurrentMonth((value) => value + 1);
  };

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {children.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerClassName="gap-2"
          >
            {children.map((child) => (
              <Pressable
                key={child.id}
                onPress={() => selectChild(child.id)}
                className={cn(
                  "flex-row items-center rounded-full border px-4 py-2",
                  selectedChildId === child.id ? "" : "border-border"
                )}
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
                    color: selectedChildId === child.id ? palette.accentText : "#1a1a2e",
                  }}
                >
                  {child.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Animated.View entering={FadeInDown.duration(300)}>
          <SettingsHeroCard
            label="Eltern-Detailansicht"
            title="Monatsfortschritt"
            description="Sieh, an welchen Tagen Routinen erledigt wurden und wie sich der Monat entwickelt."
            badges={[{ label: `${insights.monthlyActiveDays} aktive Tage` }]}
            palette={palette}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(300)} className="mt-4">
          <Card
            className="overflow-hidden rounded-[28px]"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1 flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-[18px]"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <CalendarDays size={20} color={palette.accentStrong} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-lg font-headline text-foreground" numberOfLines={1}>
                    {insights.monthLabel}
                  </Text>
                  <Text className="text-sm font-body leading-5 text-muted-foreground" numberOfLines={2}>
                    Monat auswählen und Kalender lesen
                  </Text>
                </View>
              </View>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text
                  className="text-xs font-body-semibold"
                  style={{ color: palette.accentText }}
                  numberOfLines={1}
                >
                  {insights.monthlyCompletionRate}% Quote
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Pressable
                onPress={handlePreviousMonth}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <ChevronLeft size={20} color={palette.accentText} />
              </Pressable>
              <Text className="text-xl font-headline text-foreground">{insights.monthLabel}</Text>
              <Pressable
                onPress={handleNextMonth}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <ChevronRight size={20} color={palette.accentText} />
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(300)} className="mt-4">
          <MonthlyCompletionCalendar
            monthLabel={insights.monthLabel}
            rows={insights.calendarRows}
            palette={palette}
            monthlyActiveDays={insights.monthlyActiveDays}
            monthlyStars={insights.monthlyStars}
          />
        </Animated.View>

        {insights.monthlyActiveDays === 0 ? (
          <Animated.View entering={FadeInDown.delay(160).duration(300)} className="mt-4">
            <Card
              className="overflow-hidden rounded-[28px]"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-[18px]"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <Sparkles size={20} color={palette.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-headline text-foreground">Noch kein Monatsverlauf</Text>
                  <Text className="text-sm font-body text-muted-foreground">
                    Sobald in diesem Monat Aufgaben erledigt werden, füllt sich der Kalender automatisch.
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        <View className="mt-4 flex-row gap-3">
          <SettingsMetricCard
            label="Aktive Tage"
            value={`${insights.monthlyActiveDays}`}
            caption="Im Monat"
            accentColor={palette.accentText}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
          <SettingsMetricCard
            label="Quote"
            value={`${insights.monthlyCompletionRate}%`}
            caption="Bis heute"
            accentColor={palette.chartPrimary}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
        </View>

        <View className="mt-3 flex-row gap-3">
          <SettingsMetricCard
            label="Monatssterne"
            value={`${insights.monthlyStars}`}
            caption="Verdient"
            accentColor={palette.chartSecondary}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
          <SettingsMetricCard
            label="Serie"
            value={`${insights.currentStreak}`}
            caption="Aktuell"
            accentColor={palette.accentStrong}
            backgroundColor={palette.cardTint}
            borderColor={palette.accentBorder}
          />
        </View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
