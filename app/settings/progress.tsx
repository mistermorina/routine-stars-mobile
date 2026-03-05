import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
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

        <Card
          className="rounded-[28px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <Text className="text-sm font-body text-muted-foreground">Eltern-Detailansicht</Text>
          <Text className="mt-1 text-2xl font-headline text-foreground">Fortschritt im Monat</Text>
          <Text className="mt-2 text-sm font-body" style={{ color: palette.accentText }}>
            Hier sieht man genauer, an welchen Tagen Routinen erledigt wurden.
          </Text>
        </Card>

        <Card
          className="mt-4 rounded-[28px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-center justify-between">
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

        <View className="mt-4">
          <MonthlyCompletionCalendar
            monthLabel={insights.monthLabel}
            rows={insights.calendarRows}
            palette={palette}
          />
        </View>

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
