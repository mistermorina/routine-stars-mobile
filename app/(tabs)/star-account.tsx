import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { Sparkles } from "@/lib/icons";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { useChildren } from "@/hooks/use-children";
import { useRewards } from "@/hooks/use-rewards";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useStickerWall } from "@/hooks/use-sticker-wall";
import { useChildProgression } from "@/hooks/use-child-progression";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StickerWall } from "@/components/stickers/sticker-wall";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { InsightCard } from "@/components/profile/insight-card";
import { MilestoneBadges } from "@/components/profile/milestone-badges";
import { MonthlyCompletionCalendar } from "@/components/profile/monthly-completion-calendar";
import { ProfileHeroCard } from "@/components/profile/profile-hero-card";
import { getActivityInsights, formatFriendlyDate } from "@/lib/activity-insights";
import { triggerFeedback } from "@/lib/feedback";
import { enterFade, enterStagger } from "@/lib/motion";
import { getThemePalette, semanticColors } from "@/lib/theme";

const STAR_MILESTONES = [5, 10, 25, 50, 100];

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  const { children, selectedChild, selectChild, selectedChildId, isLoading } = useChildren();
  const { rewards } = useRewards();
  const { getLogsForChild } = useActivityLogs();
  const { collectedEntries } = useStickerWall(selectedChildId);
  const { nextSticker } = useChildProgression(selectedChildId);
  const palette = getThemePalette(selectedChild?.theme);
  const previousStarsRef = useRef(0);
  const previousStreakRef = useRef(0);
  // `null` is a sentinel no real id can match, so the very first run only
  // baselines and never buzzes on mount.
  const childIdRef = useRef<string | null | undefined>(null);

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

  // One effect owns both comparisons AND the ref writes. Splitting them let a
  // separate "sync refs" effect run first and overwrite the baseline, so the
  // milestone/streak feedback could never fire.
  useEffect(() => {
    const currentStars = selectedChild?.stars ?? 0;
    const currentStreak = insights.currentStreak;

    // A child switch is not progress — re-baseline without any feedback.
    if (childIdRef.current !== selectedChildId) {
      childIdRef.current = selectedChildId;
      previousStarsRef.current = currentStars;
      previousStreakRef.current = currentStreak;
      return;
    }

    const crossedMilestone = STAR_MILESTONES.find(
      (value) => value > previousStarsRef.current && value <= currentStars
    );

    if (crossedMilestone) {
      void triggerFeedback("profile_milestone");
    }

    if (currentStreak > previousStreakRef.current && currentStreak > 1) {
      void triggerFeedback("streak_up");
    }

    previousStarsRef.current = currentStars;
    previousStreakRef.current = currentStreak;
  }, [insights.currentStreak, selectedChild?.stars, selectedChildId]);

  if (isLoading) {
    return (
      <ThemedScreenBackground
        theme={selectedChild?.theme}
        backgroundSkin={selectedChild?.backgroundSkin}
      >
        <View className="flex-1 px-4 pt-6 gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-56 rounded-chip" />
          <Skeleton className="mt-2 h-44 w-full rounded-card" />
          <Skeleton className="h-24 w-full rounded-card" />
          <View className="flex-row gap-3">
            <Skeleton className="h-28 flex-1 rounded-tile" />
            <Skeleton className="h-28 flex-1 rounded-tile" />
            <Skeleton className="h-28 flex-1 rounded-tile" />
          </View>
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
    <ThemedScreenBackground
      theme={selectedChild.theme}
      backgroundSkin={selectedChild.backgroundSkin}
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-2"
          showsVerticalScrollIndicator={false}
        >
          {/* Screen headline */}
          <Animated.View entering={enterFade()} className="mt-2">
            <Text className="text-[32px] font-headline leading-10 text-foreground">
              Profil
            </Text>
            <Text className="mt-0.5 text-sm font-body text-muted-foreground">
              Deine Sterne, Erfolge und Sticker
            </Text>
          </Animated.View>

          <View className="mt-3">
            <ProfileHeroCard
              child={selectedChild}
              allChildren={children}
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
              onSelectChild={selectChild}
              onSettingsPress={() => router.push("/parent-login")}
            />
          </View>

          {/* Next sticker goal — the honest "XP bar" */}
          {nextSticker ? (
            <Animated.View entering={enterStagger(1)} className="mt-4">
              <Card
                className="overflow-hidden rounded-card px-4 py-4"
                style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
              >
                <View
                  className="absolute right-[-14px] top-[-12px] h-20 w-20 rounded-full"
                  style={{ backgroundColor: palette.motifPrimary, opacity: 0.18 }}
                />
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.7px]"
                  style={{ color: palette.accentText }}
                  maxFontSizeMultiplier={1.2}
                >
                  Nächstes Sticker-Ziel
                </Text>
                <Text className="mt-1 text-lg font-headline text-foreground" numberOfLines={1}>
                  {nextSticker.sticker.title}
                </Text>
                <Text className="mt-0.5 text-base font-body leading-6 text-muted-foreground" numberOfLines={2}>
                  {nextSticker.hint}
                </Text>
                <View className="mt-3 flex-row items-center gap-3">
                  <View className="flex-1">
                    <Progress
                      value={nextSticker.progressPercent}
                      className="h-2.5"
                      indicatorColor={palette.chartPrimary}
                      trackStyle={{ backgroundColor: semanticColors.muted }}
                    />
                  </View>
                  <View
                    className="shrink-0 flex-row items-center gap-1"
                    accessible
                    accessibilityLabel={`${nextSticker.current} von ${nextSticker.target}`}
                  >
                    <AnimatedNumber
                      value={nextSticker.current}
                      textClassName="text-xs font-body-semibold text-muted-foreground"
                      maxFontSizeMultiplier={1.3}
                    />
                    <Text
                      className="text-xs font-body-semibold text-muted-foreground"
                      maxFontSizeMultiplier={1.3}
                    >
                      / {nextSticker.target}
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ) : null}

          {/* Milestone badges */}
          <Animated.View entering={enterStagger(2)} className="mt-4">
            <MilestoneBadges
              totalStars={insights.totalStars}
              streak={insights.currentStreak}
              stickerCount={collectedEntries.length}
              palette={palette}
              childId={selectedChildId}
            />
          </Animated.View>

          <Animated.View entering={enterStagger(3)} className="mt-4">
            <MonthlyCompletionCalendar
              monthLabel={insights.monthLabel}
              rows={insights.calendarRows}
              weeklyItems={insights.weeklyItems}
              palette={palette}
              monthlyActiveDays={insights.monthlyActiveDays}
              monthlyStars={insights.monthlyStars}
            />
          </Animated.View>

          <StickerWall
            entries={collectedEntries}
            palette={palette}
            compact
            onOpenWall={() => router.push("/sticker-album")}
          />

          {childLogs.length === 0 ? (
            <Animated.View entering={enterStagger(4)} className="mt-4">
              <Card
                className="overflow-hidden rounded-card px-4 py-4"
                style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
              >
                <View
                  className="absolute right-[-14px] top-[-10px] h-20 w-20 rounded-full"
                  style={{ backgroundColor: palette.motifSecondary, opacity: 0.24 }}
                />
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-tile"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={20} color={palette.accentStrong} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-headline text-foreground">Hier wächst dein Fortschritt</Text>
                    <Text className="text-base font-body leading-6 text-muted-foreground">
                      Sobald erste Routinen erledigt werden, füllen sich Woche, Monat und Insights
                      automatisch.
                    </Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ) : (
            <>
              <Animated.View entering={enterStagger(4)} className="mt-4">
                <Card
                  className="overflow-hidden rounded-card px-4 py-4"
                  style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-tile"
                        style={{ backgroundColor: palette.heroSurface }}
                      >
                        <Sparkles size={20} color={palette.accentStrong} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-headline text-foreground">Schöne Einblicke</Text>
                        <Text className="text-base font-body leading-6 text-muted-foreground">
                          Kindnah und hilfreich für den Alltag.
                        </Text>
                      </View>
                    </View>
                    <View
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                    >
                      <Text
                        className="text-xs font-body-semibold"
                        style={{ color: palette.accentText }}
                        maxFontSizeMultiplier={1.2}
                      >
                        {insights.totalActivities} Aktivitäten
                      </Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>

              <View className={isCompactWidth ? "mt-4 gap-3" : "mt-4 flex-row gap-3"}>
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

              <View className={isCompactWidth ? "mt-3 gap-3" : "mt-3 flex-row gap-3"}>
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

          <Animated.View entering={enterStagger(5)} className="mt-4">
            <Card
              className="overflow-hidden rounded-card px-4 py-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute right-[-14px] top-[-10px] h-20 w-20 rounded-full"
                style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
              />
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-tile"
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

          <View className={isCompactWidth ? "mt-4 gap-3" : "mt-4 flex-row gap-3"}>
            <Card
              className={isCompactWidth ? "min-h-[156px] overflow-hidden rounded-card px-4 py-4" : "min-h-[156px] flex-1 overflow-hidden rounded-card px-4 py-4"}
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
                style={{ backgroundColor: palette.chartPrimary, opacity: 0.08 }}
              />
              <Text className="text-sm font-body text-muted-foreground">Bester Tag</Text>
              <Text
                className="mt-2 text-xl font-headline text-foreground"
                maxFontSizeMultiplier={1.3}
              >
                {insights.bestDay ? formatFriendlyDate(insights.bestDay.date) : "Noch offen"}
              </Text>
              <Text className="mt-2 text-base font-body leading-6" style={{ color: palette.accentText }}>
                {insights.bestDay
                  ? "Hier war besonders viel geschafft."
                  : "Sobald erste Routinen geschafft werden, erscheint hier der stärkste Tag."}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text
                    className="text-xs font-body-semibold"
                    style={{ color: palette.accentText }}
                    maxFontSizeMultiplier={1.2}
                  >
                    {insights.bestDay ? `${insights.bestDay.totalStars} Sterne` : "Noch keine Sterne"}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text
                    className="text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    {insights.bestDay ? `${insights.bestDay.taskCount} Aufgaben` : "Noch keine Aufgaben"}
                  </Text>
                </View>
              </View>
            </Card>

            <Card
              className={isCompactWidth ? "min-h-[156px] overflow-hidden rounded-card px-4 py-4" : "min-h-[156px] flex-1 overflow-hidden rounded-card px-4 py-4"}
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View
                className="absolute right-[-10px] top-[-10px] h-16 w-16 rounded-full"
                style={{ backgroundColor: palette.chartSecondary, opacity: 0.1 }}
              />
              <Text className="text-sm font-body text-muted-foreground">Zuletzt aktiv</Text>
              <Text
                className="mt-2 text-xl font-headline text-foreground"
                maxFontSizeMultiplier={1.3}
              >
                {latestActivity ? formatFriendlyDate(latestActivity.date) : "Noch offen"}
              </Text>
              <Text className="mt-2 text-base font-body leading-6" style={{ color: palette.accentText }}>
                {latestActivity
                  ? "Der letzte eingetragene Fortschrittsmoment."
                  : "Sobald etwas erledigt wird, erscheint hier der letzte aktive Tag."}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text
                    className="text-xs font-body-semibold"
                    style={{ color: palette.accentText }}
                    maxFontSizeMultiplier={1.2}
                  >
                    {latestActivity ? `${latestActivity.totalStars} Sterne` : "0 Sterne"}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
                >
                  <Text
                    className="text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    {latestActivity ? `${latestActivity.taskCount} Aufgaben` : "0 Aufgaben"}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedScreenBackground>
  );
}
