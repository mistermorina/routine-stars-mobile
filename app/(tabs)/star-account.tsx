import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Sparkles } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useChildProgression } from "@/hooks/use-child-progression";
import { useRewards } from "@/hooks/use-rewards";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { Header } from "@/components/routine-stars/header";
import { Card } from "@/components/ui/card";
import { StickerAlbum } from "@/components/profile/sticker-album";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { InsightCard } from "@/components/profile/insight-card";
import { MonthlyCompletionCalendar } from "@/components/profile/monthly-completion-calendar";
import { ProfileHeroCard } from "@/components/profile/profile-hero-card";
import { WeeklyActivityStrip } from "@/components/profile/weekly-activity-strip";
import { getActivityInsights, formatFriendlyDate } from "@/lib/activity-insights";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";

const STAR_MILESTONES = [5, 10, 25, 50, 100];

export default function ProfileScreen() {
  const router = useRouter();
  const { children, selectedChild, selectChild, selectedChildId, isLoading } = useChildren();
  const { rewards } = useRewards();
  const { getLogsForChild } = useActivityLogs();
  const { albumStickers, nextSticker } = useChildProgression(selectedChildId);
  const palette = getThemePalette(selectedChild?.theme);
  const previousStarsRef = useRef(0);
  const previousStreakRef = useRef(0);

  const childLogs = useMemo(
    () => (selectedChildId ? getLogsForChild(selectedChildId) : []),
    [getLogsForChild, selectedChildId]
  );
  const insights = useMemo(() => getActivityInsights(childLogs), [childLogs]);
  const sortedRewards = useMemo(
    () => [...rewards].sort((left, right) => left.cost - right.cost),
    [rewards]
  );
  const nextReward = selectedChild
    ? sortedRewards.find((reward) => reward.cost > selectedChild.stars)
    : undefined;
  const latestActivity = insights.summaries.length > 0
    ? insights.summaries[insights.summaries.length - 1]
    : null;

  useEffect(() => {
    if (selectedChildId) {
      void triggerFeedback("tab_focus");
    }
  }, [selectedChildId]);

  useEffect(() => {
    previousStarsRef.current = selectedChild?.stars ?? 0;
    previousStreakRef.current = insights.currentStreak;
  }, [insights.currentStreak, selectedChild?.id, selectedChild?.stars]);

  useEffect(() => {
    const previousStars = previousStarsRef.current;
    const currentStars = selectedChild?.stars ?? 0;
    const crossedMilestone = STAR_MILESTONES.find(
      (value) => value > previousStars && value <= currentStars
    );

    if (crossedMilestone) {
      void triggerFeedback("profile_milestone");
    }

    previousStarsRef.current = currentStars;
  }, [selectedChild?.stars]);

  useEffect(() => {
    if (insights.currentStreak > previousStreakRef.current && insights.currentStreak > 1) {
      void triggerFeedback("streak_up");
    }
    previousStreakRef.current = insights.currentStreak;
  }, [insights.currentStreak]);

  if (isLoading) {
    return (
      <ThemedScreenBackground theme={selectedChild?.theme}>
        <View className="flex-1 items-center justify-center">
          <Text className="font-body text-muted-foreground">Laden...</Text>
        </View>
      </ThemedScreenBackground>
    );
  }

  if (!selectedChild) {
    return (
      <ThemedScreenBackground>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-xl font-headline text-foreground">
            Noch kein Profil verfügbar
          </Text>
          <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
            Erstelle zuerst ein Kinderprofil, um Fortschritt und Sterne zu sehen.
          </Text>
        </View>
      </ThemedScreenBackground>
    );
  }

  return (
    <ThemedScreenBackground theme={selectedChild.theme}>
      <View className="flex-1">
        <Header child={selectedChild} allChildren={children} onSelectChild={selectChild} />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4">
            <ProfileHeroCard
              avatar={selectedChild.avatar}
              childName={selectedChild.name}
              stars={selectedChild.stars}
              streak={insights.currentStreak}
              nextReward={
                nextReward
                  ? {
                      title: nextReward.title,
                      missingStars: Math.max(nextReward.cost - selectedChild.stars, 0),
                    }
                  : null
              }
              palette={palette}
            />
          </View>

          <Animated.View entering={FadeInDown.delay(70).duration(320)} className="mt-4">
            <WeeklyActivityStrip items={insights.weeklyItems} palette={palette} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(320)} className="mt-4">
            <MonthlyCompletionCalendar
              monthLabel={insights.monthLabel}
              rows={insights.calendarRows}
              palette={palette}
              monthlyActiveDays={insights.monthlyActiveDays}
              monthlyStars={insights.monthlyStars}
            />
          </Animated.View>

          <StickerAlbum
            albumStickers={albumStickers}
            nextSticker={nextSticker}
            palette={palette}
            childTheme={selectedChild.theme}
            onOpenAlbum={() => router.push("/sticker-album")}
          />

          {childLogs.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(160).duration(320)} className="mt-4">
              <Card
                className="overflow-hidden rounded-[22px] px-4 py-4"
                style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
              >
                <View
                  className="absolute right-[-14px] top-[-10px] h-20 w-20 rounded-full"
                  style={{ backgroundColor: palette.motifSecondary, opacity: 0.24 }}
                />
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={20} color={palette.accentStrong} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-headline text-foreground">Hier wächst dein Fortschritt</Text>
                    <Text className="text-sm font-body text-muted-foreground">
                      Sobald erste Routinen erledigt werden, füllen sich Woche, Monat und Insights
                      automatisch.
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(160).duration(320)} className="mt-4">
                <Card
                  className="overflow-hidden rounded-[22px] px-4 py-4"
                  style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-[18px]"
                        style={{ backgroundColor: palette.heroSurface }}
                      >
                        <Sparkles size={20} color={palette.accentStrong} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-headline text-foreground">Schöne Einblicke</Text>
                        <Text className="text-sm font-body text-muted-foreground">
                          Kindnah und hilfreich für den Alltag.
                        </Text>
                      </View>
                    </View>
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                    >
                      <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                        {insights.totalActivities} Aktivitäten
                      </Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>

              <View className="mt-4 flex-row gap-3">
                <InsightCard
                  label="Aktive Tage"
                  value={`${insights.activeDays}`}
                  caption="Tage mit erledigten Aufgaben"
                  accentColor={palette.accentText}
                  backgroundColor={palette.cardTint}
                />
                <InsightCard
                  label="Monatsquote"
                  value={`${insights.monthlyCompletionRate}%`}
                  caption="An wie vielen Tagen etwas geschafft wurde"
                  accentColor={palette.chartPrimary}
                  backgroundColor={palette.cardTint}
                />
              </View>

              <View className="mt-3 flex-row gap-3">
                <InsightCard
                  label="Sterne verdient"
                  value={`${insights.totalStars}`}
                  caption="Alle Sterne aus erledigten Aufgaben"
                  accentColor={palette.chartSecondary}
                  backgroundColor={palette.cardTint}
                />
                <InsightCard
                  label="Aufgaben"
                  value={`${insights.totalActivities}`}
                  caption="So viele Aktivitäten wurden schon geloggt"
                  accentColor={palette.accentStrong}
                  backgroundColor={palette.cardTint}
                />
              </View>
            </>
          )}

          <Animated.View entering={FadeInDown.delay(220).duration(320)} className="mt-4">
            <Card
              className="overflow-hidden rounded-[22px] px-4 py-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute right-[-14px] top-[-10px] h-20 w-20 rounded-full"
                style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
              />
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={20} color={palette.accentStrong} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-headline text-foreground">Rhythmus & Highlights</Text>
                    <Text className="text-sm font-body text-muted-foreground">
                      Kleine Rückblicke auf starke Tage und zuletzt geschaffte Momente.
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>

          <View className="mt-4 flex-row gap-3">
            <Card
              className="min-h-[156px] flex-1 overflow-hidden rounded-[20px] px-4 py-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
                style={{ backgroundColor: palette.chartPrimary, opacity: 0.08 }}
              />
              <Text className="text-sm font-body text-muted-foreground">Bester Tag</Text>
              <Text className="mt-2 text-xl font-headline text-foreground">
                {insights.bestDay ? formatFriendlyDate(insights.bestDay.date) : "Noch offen"}
              </Text>
              <Text className="mt-2 text-sm font-body" style={{ color: palette.accentText }}>
                {insights.bestDay
                  ? "Hier war besonders viel geschafft."
                  : "Sobald erste Routinen geschafft werden, erscheint hier der stärkste Tag."}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                    {insights.bestDay ? `${insights.bestDay.totalStars} Sterne` : "Noch keine Sterne"}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text className="text-xs font-body-semibold text-muted-foreground">
                    {insights.bestDay ? `${insights.bestDay.taskCount} Aufgaben` : "Noch keine Aufgaben"}
                  </Text>
                </View>
              </View>
            </Card>

            <Card
              className="min-h-[156px] flex-1 overflow-hidden rounded-[20px] px-4 py-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
                style={{ backgroundColor: palette.chartSecondary, opacity: 0.1 }}
              />
              <Text className="text-sm font-body text-muted-foreground">Zuletzt aktiv</Text>
              <Text className="mt-2 text-xl font-headline text-foreground">
                {latestActivity ? formatFriendlyDate(latestActivity.date) : "Noch offen"}
              </Text>
              <Text className="mt-2 text-sm font-body" style={{ color: palette.accentText }}>
                {latestActivity
                  ? "Der letzte eingetragene Fortschrittsmoment."
                  : "Sobald etwas erledigt wird, erscheint hier der letzte aktive Tag."}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                    {latestActivity ? `${latestActivity.totalStars} Sterne` : "0 Sterne"}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text className="text-xs font-body-semibold text-muted-foreground">
                    {latestActivity ? `${latestActivity.taskCount} Aufgaben` : "0 Aufgaben"}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    </ThemedScreenBackground>
  );
}
