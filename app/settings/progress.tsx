import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { MonthlyCompletionCalendar } from "@/components/profile/monthly-completion-calendar";
import { InsightCard } from "@/components/profile/insight-card";
import { Card } from "@/components/ui/card";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
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
    <ThemedScreenBackground theme={selectedChild?.theme}>
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
                <Text className="mr-1.5 text-lg">{child.avatar}</Text>
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
          <Card
            className="overflow-hidden rounded-[30px]"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View
              className="absolute inset-x-0 top-0 h-32"
              style={{ backgroundColor: palette.heroSurface }}
            />
            <View
              className="absolute right-[-16px] top-[-10px] h-24 w-24 rounded-full"
              style={{ backgroundColor: palette.motifSecondary, opacity: 0.22 }}
            />
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <View
                  className="self-start rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                    Eltern-Detailansicht
                  </Text>
                </View>
                <Text className="mt-3 text-[30px] font-headline text-foreground">
                  Fortschritt im Monat
                </Text>
                <Text className="mt-2 text-sm font-body leading-6" style={{ color: palette.accentText }}>
                  Hier sieht man genauer, an welchen Tagen Routinen erledigt wurden und wie sich der Monat entwickelt.
                </Text>
              </View>
              <View
                className="rounded-[22px] px-3.5 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                  Dieser Monat
                </Text>
                <Text className="mt-1 text-lg font-headline" style={{ color: palette.accentText }}>
                  {insights.monthlyActiveDays}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">aktive Tage</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(300)} className="mt-4">
          <Card
            className="overflow-hidden rounded-[28px]"
            style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
          >
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-[18px]"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <CalendarDays size={20} color={palette.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-headline text-foreground">{insights.monthLabel}</Text>
                  <Text className="text-sm font-body text-muted-foreground">
                    Monat auswählen und Aktivität im Kalender lesen
                  </Text>
                </View>
              </View>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
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
          <InsightCard
            label="Aktive Tage"
            value={`${insights.monthlyActiveDays}`}
            caption="Tage mit erledigten Routinen im gewählten Monat"
            accentColor={palette.accentText}
            backgroundColor={palette.cardTint}
          />
          <InsightCard
            label="Monatsquote"
            value={`${insights.monthlyCompletionRate}%`}
            caption="Aktive Tage gemessen an den vergangenen Kalendertagen"
            accentColor={palette.chartPrimary}
            backgroundColor={palette.cardTint}
          />
        </View>

        <View className="mt-3 flex-row gap-3">
          <InsightCard
            label="Monatssterne"
            value={`${insights.monthlyStars}`}
            caption="In diesem Monat durch Aufgaben verdient"
            accentColor={palette.chartSecondary}
            backgroundColor={palette.cardTint}
          />
          <InsightCard
            label="Aktivitätsserie"
            value={`${insights.currentStreak}`}
            caption="Aktuelle Serie auf Basis zusammenhängender Tage"
            accentColor={palette.accentStrong}
            backgroundColor={palette.cardTint}
          />
        </View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
