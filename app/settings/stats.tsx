import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BarChart3, Sparkles, Star } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { InsightCard } from "@/components/profile/insight-card";
import { Card } from "@/components/ui/card";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { formatFriendlyDate, getActivityInsights } from "@/lib/activity-insights";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";

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
  const maxRecentStars = Math.max(...recentSummaries.map((item) => item.totalStars), 1);
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
              style={{ backgroundColor: palette.motifPrimary, opacity: 0.2 }}
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
                  Statistiken & Trends
                </Text>
                <Text className="mt-2 text-sm font-body leading-6" style={{ color: palette.accentText }}>
                  Die letzten Aktivitätstage, Tageshöhen und gesammelten Sterne im Überblick.
                </Text>
              </View>
              <View
                className="rounded-[22px] px-3.5 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                  Zuletzt
                </Text>
                <Text className="mt-1 text-lg font-headline" style={{ color: palette.accentText }}>
                  {recentSummaries.length}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">Tage im Blick</Text>
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
                  className="h-11 w-11 items-center justify-center rounded-[18px]"
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
          <InsightCard
            label="Verdiente Sterne"
            value={`${insights.totalStars}`}
            caption="Alle Sterne aus gespeicherten Aktivitäten"
            accentColor={palette.chartPrimary}
            backgroundColor={palette.cardTint}
          />
          <InsightCard
            label="Aktivitäten"
            value={`${insights.totalActivities}`}
            caption="So viele Aufgaben wurden insgesamt geloggt"
            accentColor={palette.chartSecondary}
            backgroundColor={palette.cardTint}
          />
        </View>

        <View className="mt-3 flex-row gap-3">
          <InsightCard
            label="Aktive Tage"
            value={`${insights.activeDays}`}
            caption="Tage mit mindestens einer erledigten Aufgabe"
            accentColor={palette.accentStrong}
            backgroundColor={palette.cardTint}
          />
          <InsightCard
            label="Beste Serie"
            value={`${insights.currentStreak}`}
            caption="Aktuelle Serie zusammenhängender Aktivitätstage"
            accentColor={palette.accentText}
            backgroundColor={palette.cardTint}
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
            />
            <View className="flex-row items-center gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-[18px]"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <BarChart3 size={20} color={palette.accentStrong} />
              </View>
              <View>
                <Text className="text-lg font-headline text-foreground">Letzte 7 Tage</Text>
                <Text className="text-sm font-body text-muted-foreground">
                  Tageshöhen anhand verdienter Sterne
                </Text>
              </View>
            </View>

            {recentSummaries.length > 0 ? (
              <View className="mt-6 flex-row items-end gap-3">
                {recentSummaries.map((summary) => {
                  const height = Math.max(36, (summary.totalStars / maxRecentStars) * 120);
                  const date = new Date(`${summary.date}T12:00:00`);

                  return (
                    <View key={summary.date} className="flex-1 items-center">
                      <View
                        className="w-full rounded-full"
                        style={{
                          height,
                          backgroundColor: palette.chartPrimary,
                          opacity: 0.85,
                        }}
                      />
                      <Text className="mt-2 text-xs font-body-semibold text-muted-foreground">
                        {date.getDate()}
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
            />
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-headline text-foreground">Letzte Einträge</Text>
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text className="text-sm font-body-semibold text-muted-foreground">
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
                    className="rounded-[22px] border px-4 py-4"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.76)",
                      borderColor: palette.accentBorder,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-headline text-foreground">
                        {formatFriendlyDate(group.date)}
                      </Text>
                      <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
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
                            +{entry.stars}
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
