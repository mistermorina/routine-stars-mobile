import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Flame, Plus, Sparkles, Trophy } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useChildProgression } from "@/hooks/use-child-progression";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useRoutines } from "@/hooks/use-routines";
import { useRewards } from "@/hooks/use-rewards";
import { useCollapsibleHeader } from "@/hooks/use-collapsible-header";
import { useStickerWall } from "@/hooks/use-sticker-wall";
import { Header } from "@/components/routine-stars/header";
import { DailyMissionCard } from "@/components/routine-stars/daily-mission-card";
import { RoutineCard } from "@/components/routine-stars/routine-card";
import { TaskTimerModal } from "@/components/routine-stars/task-timer-modal";
import { RoutineCompleteDialog } from "@/components/routine-stars/routine-complete-dialog";
import { Confetti } from "@/components/routine-stars/confetti";
import { StickerRewardSheet } from "@/components/stickers/sticker-reward-sheet";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { triggerFeedback } from "@/lib/feedback";
import { getActivityInsights } from "@/lib/activity-insights";
import { getThemePalette } from "@/lib/theme";
import type { AnimalSticker } from "@/lib/animal-stickers";
import type { Routine, Task } from "@/lib/types";
import emptyRoutinesImage from "@/assets/images/empty-routines.png";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";
import routineTrophyImage from "@/assets/images/routine-trophy-soft.png";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Schön, dass du da bist";
  return "Zeit für einen ruhigen Abend";
}

export default function DashboardScreen() {
  const router = useRouter();
  const {
    children,
    selectedChild,
    selectedChildId,
    isLoading,
    selectChild,
    addStars,
  } = useChildren();
  const { getLogsForChild, logActivity } = useActivityLogs();
  const { rewards } = useRewards();
  const { routines, toggleTaskCompletion, isLoading: routinesLoading } = useRoutines(selectedChildId);
  const {
    todayMission,
    missionProgress,
    isMissionComplete,
    recentUnlocks,
    evaluateProgressAfterTaskCompletion,
    clearRecentUnlocks,
  } = useChildProgression(selectedChildId);
  const {
    availableDailyStickers,
    hasClaimedToday,
    claimDailySticker,
  } = useStickerWall(selectedChildId);
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStickerRewardSheet, setShowStickerRewardSheet] = useState(false);
  const {
    handleHeaderScroll,
    isHeaderCollapsed,
    toggleHeaderCollapsed,
  } = useCollapsibleHeader();

  const palette = getThemePalette(selectedChild?.theme);
  const displayRoutines = routines;

  const totalTasks = displayRoutines.reduce((count, routine) => count + routine.tasks.length, 0);
  const completedTasks = displayRoutines.reduce(
    (count, routine) => count + routine.tasks.filter((task) => task.completed).length,
    0
  );
  const remainingTasks = totalTasks - completedTasks;
  const progressValue = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const firstOpenTask = displayRoutines
    .flatMap((routine) =>
      routine.tasks
        .filter((task) => !task.completed)
        .map((task) => ({ task, routineName: routine.name }))
    )
    .at(0);

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
  const nextRewardHint = nextReward && selectedChild
    ? {
        title: nextReward.title,
        missingStars: Math.max(nextReward.cost - selectedChild.stars, 0),
      }
    : undefined;
  const canClaimDailySticker = totalTasks > 0 && remainingTasks === 0 && !hasClaimedToday;

  useEffect(() => {
    if (!isLoading && children.length === 0) {
      router.replace("/(auth)/onboarding");
    }
  }, [children.length, isLoading, router]);

  useEffect(() => {
    if (recentUnlocks.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      void clearRecentUnlocks();
    }, 4800);

    return () => clearTimeout(timeout);
  }, [clearRecentUnlocks, recentUnlocks]);

  const handleTaskComplete = useCallback(
    async (taskId: string, bonusStars?: number) => {
      if (!selectedChildId || !selectedChild) return;

      let parentRoutine: Routine | undefined;
      for (const routine of routines) {
        if (routine.tasks.some((task) => task.id === taskId)) {
          parentRoutine = routine;
          break;
        }
      }

      if (!parentRoutine) return;
      const task = parentRoutine.tasks.find((entry) => entry.id === taskId);
      if (!task || task.completed) return;

      const previousInsights = getActivityInsights(getLogsForChild(selectedChildId));
      const openTasksBeforeCompletion = routines.reduce(
        (count, routine) => count + routine.tasks.filter((entry) => !entry.completed).length,
        0
      );
      const isCompletingDay =
        openTasksBeforeCompletion === 1 && totalTasks > 0 && !hasClaimedToday;

      await toggleTaskCompletion(parentRoutine.id, taskId);

      const totalStarsEarned = task.stars + (bonusStars || 0);
      await addStars(selectedChildId, totalStarsEarned);

      const newLog = await logActivity(selectedChildId, { ...task, completed: true }, bonusStars);
      const nextLogs = [...getLogsForChild(selectedChildId), newLog];
      const nextInsights = getActivityInsights(nextLogs);
      const progressionResult = await evaluateProgressAfterTaskCompletion({
        childId: selectedChildId,
        child: {
          ...selectedChild,
          stars: selectedChild.stars + totalStarsEarned,
        },
        childStars: selectedChild.stars + totalStarsEarned,
        logs: nextLogs,
        routines,
      });

      const allCompleted = parentRoutine.tasks.every((entry) =>
        entry.id === taskId ? true : entry.completed
      );

      if (progressionResult.unlockedStickerIds.length > 0) {
        void triggerFeedback("sticker_unlocked");
      }

      if (progressionResult.missionCompleted) {
        void triggerFeedback("mission_complete");
      }

      if (allCompleted) {
        setShowConfetti(true);
        if (isCompletingDay) {
          setShowStickerRewardSheet(true);
        } else {
          setShowCompleteDialog(true);
        }
        void triggerFeedback("routine_complete");
        setTimeout(() => setShowConfetti(false), 4000);
        return;
      }

      if (nextInsights.currentStreak > previousInsights.currentStreak && nextInsights.currentStreak > 1) {
        void triggerFeedback("streak_up");
        return;
      }

      void triggerFeedback("task_complete");
    },
    [
      addStars,
      evaluateProgressAfterTaskCompletion,
      getLogsForChild,
      hasClaimedToday,
      logActivity,
      routines,
      selectedChild,
      selectedChildId,
      totalTasks,
      toggleTaskCompletion,
    ]
  );

  const handleStartTimer = useCallback((task: Task) => {
    setTimerTask(task);
  }, []);

  const handleCreateRoutine = useCallback(() => {
    router.push("/parent-login");
  }, [router]);

  const handleOpenStickerReward = useCallback(() => {
    setShowStickerRewardSheet(true);
  }, []);

  const handleTimerClose = useCallback(
    (success: boolean) => {
      if (success && timerTask) {
        handleTaskComplete(timerTask.id, timerTask.bonusStars);
      }
      setTimerTask(null);
    },
    [handleTaskComplete, timerTask]
  );

  const handleSelectDailySticker = useCallback(
    async (sticker: AnimalSticker) => {
      const placedSticker = await claimDailySticker(sticker.id);
      setShowStickerRewardSheet(false);

      if (!placedSticker) {
        return;
      }

      setShowConfetti(true);
      void triggerFeedback("sticker_unlocked");
      setTimeout(() => setShowConfetti(false), 2800);
      setTimeout(() => {
        router.push("/sticker-album");
      }, 360);
    },
    [claimDailySticker, router]
  );

  if (isLoading || routinesLoading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedScreenBackground theme={selectedChild?.theme}>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={palette.chartPrimary} />
          </View>
        </ThemedScreenBackground>
      </SafeAreaView>
    );
  }

  if (!selectedChild) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedScreenBackground>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-xl font-headline text-foreground">
              Kein Kind ausgewählt
            </Text>
            <Text className="mt-2 text-center font-body text-muted-foreground">
              Bitte erstelle zuerst ein Kinderprofil.
            </Text>
          </View>
        </ThemedScreenBackground>
      </SafeAreaView>
    );
  }

  return (
    <ThemedScreenBackground theme={selectedChild.theme}>
      <View className="flex-1">
        <Header
          child={selectedChild}
          allChildren={children}
          collapsed={isHeaderCollapsed}
          onSelectChild={selectChild}
          onToggleCollapsed={toggleHeaderCollapsed}
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          onScroll={handleHeaderScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(320)} className="mx-4 mt-3">
            <Card
              className="overflow-hidden rounded-[22px] px-4 py-4"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
                shadowColor: "#9DB8D8",
                shadowOpacity: 0.14,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
              }}
            >
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-body-semibold text-muted-foreground">
                  Tagesfortschritt
                </Text>
                <Text className="text-base font-body-semibold text-foreground">
                  {completedTasks} / {totalTasks}
                </Text>
              </View>
              <Progress
                value={progressValue}
                className="h-3"
                indicatorColor={remainingTasks === 0 ? "#4FD17A" : palette.chartPrimary}
                trackStyle={{ backgroundColor: "#EAF1F7" }}
              />
              <Text className="mt-4 text-center text-sm font-body-semibold text-muted-foreground">
                {remainingTasks === 0
                  ? "Super gemacht! Alle Aufgaben erledigt!"
                  : firstOpenTask
                    ? `Als Nächstes: ${firstOpenTask.task.title}`
                    : `${getGreeting()} - kleine Schritte zählen.`}
              </Text>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(55).duration(320)} className="mx-4 mt-3 flex-row gap-3">
            <Card
              className="min-h-[156px] flex-1 overflow-hidden rounded-[20px] px-4 py-4"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
                shadowColor: "#9DB8D8",
                shadowOpacity: 0.12,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View className="flex-row items-center gap-2">
                <Flame size={17} color="#F97316" />
                <Text className="text-xs font-body-semibold text-muted-foreground">
                  Serie
                </Text>
              </View>
              <View className="mt-3 flex-row items-end gap-1">
                <Text className="text-3xl font-headline text-foreground">
                  {insights.currentStreak}
                </Text>
                <Text className="mb-1 text-xs font-body text-muted-foreground">Tag</Text>
              </View>
              <Text className="mt-2 text-xs font-body leading-5 text-muted-foreground">
                Bleib im Rhythmus und sammle weiter Sterne.
              </Text>
              <Image
                source={rewardStarGiftImage}
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: -18,
                  width: 94,
                  height: 94,
                  opacity: 0.42,
                }}
                contentFit="contain"
              />
            </Card>

            <Card
              className="min-h-[156px] flex-1 overflow-hidden rounded-[20px] px-4 py-4"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
                shadowColor: "#9DB8D8",
                shadowOpacity: 0.12,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <View className="flex-row items-center gap-2">
                <Trophy size={17} color="#F97316" />
                <Text className="text-xs font-body-semibold text-muted-foreground">
                  Nächstes Ziel
                </Text>
              </View>
              <Text className="mt-3 text-base font-headline leading-5 text-foreground">
                {nextRewardHint ? nextRewardHint.title : "Alles erreicht"}
              </Text>
              <Text className="mt-2 text-xs font-body leading-5" style={{ color: palette.accentText }}>
                {nextRewardHint
                  ? `Noch ${nextRewardHint.missingStars} Sterne`
                  : "Belohnungen sind bereit"}
              </Text>
              <Image
                source={routineTrophyImage}
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: -18,
                  width: 96,
                  height: 96,
                  opacity: 0.44,
                }}
                contentFit="contain"
              />
            </Card>
          </Animated.View>

          <View className="mx-4">
            <DailyMissionCard
              mission={todayMission}
              missionProgress={missionProgress}
              isMissionComplete={isMissionComplete}
              recentUnlocks={recentUnlocks}
              palette={palette}
            />
          </View>

          {canClaimDailySticker ? (
            <Animated.View entering={FadeInDown.delay(80).duration(320)} className="mx-4 mt-4">
              <Card
                className="overflow-hidden rounded-[22px] px-4 py-4"
                style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
              >
                <View
                  className="absolute right-[-18px] top-[-16px] h-24 w-24 rounded-full"
                  style={{ backgroundColor: palette.motifPrimary, opacity: 0.2 }}
                />
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={21} color={palette.accentStrong} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-lg font-headline text-foreground">
                      Dein Tagessticker wartet
                    </Text>
                    <Text className="mt-1 text-sm font-body text-muted-foreground">
                      Such dir ein Tier für deine Sticker-Wall aus.
                    </Text>
                  </View>
                  <Button
                    onPress={handleOpenStickerReward}
                    className="h-11 rounded-[16px] px-4"
                    style={{ backgroundColor: palette.button }}
                  >
                    <Text className="text-sm font-body-semibold text-white">
                      Aussuchen
                    </Text>
                  </Button>
                </View>
              </Card>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(90).duration(320)} className="mx-4 mt-4">
            <Card
              className="rounded-[22px]"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Sparkles size={20} color={palette.accentStrong} />
                  </View>
                  <View>
                    <Text className="text-lg font-headline text-foreground">Routinen heute</Text>
                    <Text className="text-sm font-body text-muted-foreground">
                      {displayRoutines.length} Routinen • {remainingTasks} offene Aufgaben
                    </Text>
                  </View>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
                >
                  <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                    {remainingTasks === 0 ? "Alles erledigt" : `${remainingTasks} bereit`}
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>

          <View className="mt-4 px-4">
            {displayRoutines.length > 0 ? (
              displayRoutines.map((routine, index) => (
                <Animated.View key={routine.id} entering={FadeInDown.delay(140 + index * 40).duration(320)}>
                  <RoutineCard
                    routine={routine}
                    childTheme={selectedChild.theme}
                    highlightTaskId={firstOpenTask?.task.id}
                    onTaskComplete={handleTaskComplete}
                    onStartTimer={handleStartTimer}
                  />
                </Animated.View>
              ))
            ) : (
              <Card
                className="overflow-hidden rounded-[22px] px-5 py-7"
                style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
              >
                <View
                  className="absolute right-[-24px] top-[-24px] h-28 w-28 rounded-full"
                  style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
                />
                <View
                  className="mx-auto mb-4 w-full max-w-[220px] overflow-hidden rounded-[22px]"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <Image
                    source={emptyRoutinesImage}
                    style={{ width: "100%", aspectRatio: 1 }}
                    contentFit="cover"
                    transition={180}
                    accessibilityLabel="Leeres Routine-Board mit Sternen"
                  />
                </View>
                <Text className="text-center text-lg font-headline text-foreground">
                  Noch keine Routinen für heute
                </Text>
                <Text className="mx-auto mt-2 max-w-[280px] text-center text-sm font-body leading-6 text-muted-foreground">
                  Lege im Elternbereich eine Starter-Routine an. Danach erscheint sie hier für das Kind.
                </Text>
                <Button
                  onPress={handleCreateRoutine}
                  size="lg"
                  className="mt-5 rounded-[22px]"
                  style={{ backgroundColor: palette.button }}
                >
                  <View className="flex-row items-center gap-2">
                    <Plus size={18} color="#FFFFFF" />
                    <Text className="text-base font-body-semibold text-white">
                      Routine anlegen
                    </Text>
                  </View>
                </Button>
              </Card>
            )}
          </View>
        </ScrollView>

        <TaskTimerModal
          task={timerTask}
          childName={selectedChild.name}
          childTheme={selectedChild.theme}
          onClose={handleTimerClose}
        />

        <RoutineCompleteDialog
          isOpen={showCompleteDialog}
          onClose={() => setShowCompleteDialog(false)}
          childTheme={selectedChild.theme}
        />

        <StickerRewardSheet
          visible={showStickerRewardSheet}
          childName={selectedChild.name}
          stickers={availableDailyStickers}
          palette={palette}
          onSelectSticker={handleSelectDailySticker}
          onClose={() => setShowStickerRewardSheet(false)}
        />

        {showConfetti && <Confetti colors={palette.celebrationColors} />}
      </View>
    </ThemedScreenBackground>
  );
}
