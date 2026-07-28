import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, { LinearTransition, ReduceMotion } from "react-native-reanimated";
import { ArrowRight, Flame, Plus, Sparkles, Star, Trophy } from "@/lib/icons";
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
import {
  StarFlight,
  StarFlightLauncherProvider,
  type StarFlightLauncher,
} from "@/components/routine-stars/star-flight";
import { Confetti } from "@/components/routine-stars/confetti";
import { StickerRewardSheet } from "@/components/stickers/sticker-reward-sheet";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { toast } from "@/hooks/use-toast";
import {
  useStarFlightTarget,
  type StarFlightPoint,
} from "@/contexts/star-flight-target";
import { triggerFeedback } from "@/lib/feedback";
import { enterFade, enterStagger, exitFade, springs } from "@/lib/motion";
import { getActivityInsights } from "@/lib/activity-insights";
import { getLocalIsoDate, isRoutineDueOn } from "@/lib/local-date";
import {
  canClaimStickerRewardEvent,
  createStickerRewardEvent,
  type StickerRewardEvent,
} from "@/lib/sticker-reward-logic";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import type { AnimalSticker } from "@/lib/animal-stickers";
import type { Routine, Task } from "@/lib/types";
import emptyRoutinesImage from "@/assets/images/empty-routines.png";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";
import routineTrophyImage from "@/assets/images/routine-trophy-soft.png";
import { getRoutineCategory, getRoutineVisual, type RoutineVisualKey } from "@/lib/routine-visuals";

type RoutineFilter = "heute" | "alle" | RoutineVisualKey;

// Category chips appear only when at least one routine matches.
const CATEGORY_FILTERS: { key: RoutineVisualKey; label: string }[] = [
  { key: "morning", label: "Morgens" },
  { key: "evening", label: "Abends" },
  { key: "school", label: "Schule" },
  { key: "hygiene", label: "Hygiene" },
  { key: "meals", label: "Essen" },
  { key: "cleanup", label: "Haushalt" },
  { key: "sport", label: "Sport" },
  { key: "weekend", label: "Wochenende" },
  { key: "special", label: "Extra" },
  { key: "generic", label: "Weitere" },
];

/**
 * Routine cards re-order and drop out when the filter changes, so they settle
 * with a spring instead of snapping. Reanimated builders are stateful — one
 * fresh instance per node, never a shared const.
 */
function routineLayoutTransition() {
  return LinearTransition.springify()
    .damping(springs.gentle.damping)
    .stiffness(springs.gentle.stiffness)
    .mass(springs.gentle.mass)
    .reduceMotion(ReduceMotion.System);
}

/** One star currently arcing from a task row into the header counter. */
interface StarFlightRequest {
  id: number;
  from: StarFlightPoint;
  to: StarFlightPoint;
  color?: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  const {
    children,
    selectedChild,
    selectedChildId,
    isLoading,
    selectChild,
    addStars,
    deductStars,
    todayIso,
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
    availableStickers,
    claimedEventKeys,
    claimStickerReward,
    settings: stickerRewardSettings,
  } = useStickerWall(selectedChildId);
  const [timerTask, setTimerTask] = useState<Task | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStickerRewardSheet, setShowStickerRewardSheet] = useState(false);
  const [pendingStickerRewardEvent, setPendingStickerRewardEvent] =
    useState<StickerRewardEvent | null>(null);
  const {
    handleHeaderScroll,
    isHeaderCollapsed,
    toggleHeaderCollapsed,
  } = useCollapsibleHeader();
  const [routineFilter, setRoutineFilter] = useState<RoutineFilter>("heute");
  const [pendingUndoTaskId, setPendingUndoTaskId] = useState<string | null>(null);
  const [pendingScrollRoutineId, setPendingScrollRoutineId] = useState<string | null>(null);
  const [starFlights, setStarFlights] = useState<StarFlightRequest[]>([]);
  const starFlightSeq = useRef(0);
  const { getTarget } = useStarFlightTarget();
  const scrollRef = useRef<ScrollView>(null);
  const routineListY = useRef(0);
  const routinePositions = useRef<Record<string, number>>({});

  const palette = getThemePalette(selectedChild?.theme);
  const routineCategories = useMemo(() => {
    const map = new Map<string, RoutineVisualKey>();
    for (const routine of routines) {
      map.set(routine.id, getRoutineCategory(routine));
    }
    return map;
  }, [routines]);
  const availableFilters = useMemo<{ key: RoutineFilter; label: string }[]>(() => {
    const present = new Set(routineCategories.values());
    return [
      { key: "heute" as const, label: "Heute" },
      ...CATEGORY_FILTERS.filter((entry) => present.has(entry.key)),
      { key: "alle" as const, label: "Alle" },
    ];
  }, [routineCategories]);
  const showTimeFilters = routines.length > 1;
  const displayRoutines = useMemo(() => {
    if (!showTimeFilters || routineFilter === "alle") return routines;
    // `todayIso` comes from ChildrenProvider, so the list re-filters itself on a
    // midnight rollover / foreground without this screen owning a timer.
    // A routine without a schedule (or with an empty day list) is always due.
    if (routineFilter === "heute") {
      return routines.filter((routine) => isRoutineDueOn(routine.schedule, todayIso));
    }
    return routines.filter((routine) => routineCategories.get(routine.id) === routineFilter);
  }, [routineCategories, routineFilter, routines, showTimeFilters, todayIso]);

  const totalTasks = routines.reduce((count, routine) => count + routine.tasks.length, 0);
  const completedTasks = routines.reduce(
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
  const heroRoutine =
    displayRoutines.find((routine) => routine.tasks.some((task) => !task.completed)) ??
    routines.find((routine) => routine.tasks.some((task) => !task.completed));
  const heroOpenTasks = heroRoutine
    ? heroRoutine.tasks.filter((task) => !task.completed).length
    : 0;
  const allDone = totalTasks > 0 && remainingTasks === 0;
  // Cut-out art (transparent PNG) matching the hero routine's category.
  const heroArt =
    allDone || !heroRoutine
      ? routineTrophyImage
      : getRoutineVisual(heroRoutine, palette.chartPrimary).art;
  const completedRoutines = routines.filter(
    (routine) => routine.tasks.length > 0 && routine.tasks.every((task) => task.completed)
  ).length;
  const countableRoutines = routines.filter((routine) => routine.tasks.length > 0).length;

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
  const hasPendingStickerReward = Boolean(pendingStickerRewardEvent);
  const starsToday = useMemo(
    () =>
      childLogs
        .filter((log) => log.date === todayIso)
        .reduce((sum, log) => sum + log.stars, 0),
    [childLogs, todayIso]
  );

  /**
   * Task behind the open undo dialog, resolved from the live routine list so a
   * reload cannot leave the dialog pointing at a stale copy.
   */
  const pendingUndo = useMemo(() => {
    if (!pendingUndoTaskId) return null;
    for (const routine of routines) {
      const task = routine.tasks.find((entry) => entry.id === pendingUndoTaskId);
      if (task) return { routine, task };
    }
    return null;
  }, [pendingUndoTaskId, routines]);

  const handleHeroPress = useCallback(() => {
    if (allDone || !heroRoutine) {
      router.push("/(tabs)/rewards");
      return;
    }
    const isVisible = displayRoutines.some((routine) => routine.id === heroRoutine.id);
    if (!isVisible) {
      // Hero routine is hidden by the current filter: reveal it first,
      // then scroll once the list has re-laid out.
      setRoutineFilter("alle");
      setPendingScrollRoutineId(heroRoutine.id);
      return;
    }
    const itemY = routinePositions.current[heroRoutine.id] ?? 0;
    scrollRef.current?.scrollTo({
      y: Math.max(routineListY.current + itemY - 12, 0),
      animated: true,
    });
  }, [allDone, displayRoutines, heroRoutine, router]);

  useEffect(() => {
    if (!pendingScrollRoutineId) return;
    const timeout = setTimeout(() => {
      const itemY = routinePositions.current[pendingScrollRoutineId];
      if (itemY !== undefined) {
        scrollRef.current?.scrollTo({
          y: Math.max(routineListY.current + itemY - 12, 0),
          animated: true,
        });
      }
      setPendingScrollRoutineId(null);
    }, 160);
    return () => clearTimeout(timeout);
  }, [pendingScrollRoutineId]);

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

  /**
   * A task row asks for its star to fly into the header counter. Returns false
   * when the header pill has not been measured (collapsed/unmounted header) so
   * the row can play its own local star instead of losing the moment.
   */
  const launchStarFlight = useCallback<StarFlightLauncher>(
    (origin) => {
      const target = getTarget();
      if (!target) return false;

      starFlightSeq.current += 1;
      const id = starFlightSeq.current;
      setStarFlights((current) => [
        ...current,
        { id, from: { x: origin.x, y: origin.y }, to: target, color: origin.color },
      ]);
      return true;
    },
    [getTarget]
  );

  const handleStarFlightDone = useCallback(
    (id: number) => {
      setStarFlights((current) => current.filter((flight) => flight.id !== id));
      // Landing tick — silent by design (no sound is mapped to stars_added).
      // Skipped while a celebration is running so the confetti/dialog beat stays clean.
      if (!showConfetti) {
        void triggerFeedback("stars_added", { disableSound: true });
      }
    },
    [showConfetti]
  );

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
      if (!task) return;

      // Already checked off: the tap is an undo intent, never a second award.
      // Everything below therefore still runs exactly once per task and day.
      if (task.completed) {
        setPendingUndoTaskId(taskId);
        return;
      }

      // First line after the undo branch, before any await: the tap has to be
      // answered in the same frame it happened, not four awaits later.
      void triggerFeedback("task_complete");

      const previousInsights = getActivityInsights(getLogsForChild(selectedChildId));
      const totalRoutineCountToday = routines.filter((routine) => routine.tasks.length > 0).length;
      const completedRoutineCountToday = routines.reduce((count, routine) => {
        if (routine.tasks.length === 0) {
          return count;
        }

        const isRoutineComplete = routine.tasks.every((entry) =>
          routine.id === parentRoutine.id && entry.id === taskId ? true : entry.completed
        );

        return count + (isRoutineComplete ? 1 : 0);
      }, 0);

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
      const stickerRewardEvent = createStickerRewardEvent({
        childId: selectedChildId,
        routineId: parentRoutine.id,
        routineName: parentRoutine.name,
        date: getLocalIsoDate(),
        completedRoutineCountToday,
        totalRoutineCountToday,
        settings: stickerRewardSettings,
      });
      const canClaimStickerReward = canClaimStickerRewardEvent(
        claimedEventKeys,
        stickerRewardEvent?.eventKey
      );

      if (progressionResult.unlockedStickerIds.length > 0) {
        void triggerFeedback("sticker_unlocked");
      }

      if (progressionResult.missionCompleted) {
        void triggerFeedback("mission_complete");
      }

      if (allCompleted) {
        setShowConfetti(true);
        if (stickerRewardEvent && canClaimStickerReward) {
          setPendingStickerRewardEvent(stickerRewardEvent);
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
      }
    },
    [
      addStars,
      evaluateProgressAfterTaskCompletion,
      getLogsForChild,
      claimedEventKeys,
      logActivity,
      routines,
      selectedChild,
      selectedChildId,
      stickerRewardSettings,
      toggleTaskCompletion,
    ]
  );

  const handleCancelTaskUndo = useCallback(() => {
    setPendingUndoTaskId(null);
  }, []);

  /**
   * Same-day un-complete.
   *
   * No extra date guard is needed: `useRoutines` stores progress as
   * `{ date, tasks }` per child and only merges `tasks` when `date` equals the
   * local day, so a task that renders as completed was completed *today*.
   * Yesterday's flags are dropped (and rewritten) on load.
   */
  const handleConfirmTaskUndo = useCallback(async () => {
    const target = pendingUndo;
    setPendingUndoTaskId(null);

    if (!target || !selectedChildId || !target.task.completed) return;

    // Give back exactly what was awarded — the completion may have included a
    // timer bonus, which `task.stars` alone does not cover.
    const awardedStars = childLogs
      .filter((log) => log.taskId === target.task.id && log.date === todayIso)
      .reduce((sum, log) => sum + log.stars, 0);
    const starsToRevoke = awardedStars > 0 ? awardedStars : target.task.stars;

    await toggleTaskCompletion(target.routine.id, target.task.id);
    await deductStars(selectedChildId, starsToRevoke);
    // The log has no undo flag, so the correction is a negative-star entry that
    // keeps the ledger and "Heute geschafft" in sync with the balance.
    await logActivity(selectedChildId, {
      ...target.task,
      completed: false,
      title: `Zurückgenommen: ${target.task.title}`,
      stars: -starsToRevoke,
      bonusStars: undefined,
    });

    void triggerFeedback("theme_preview", { disableSound: true });
    toast({
      title: "Aufgabe zurückgenommen",
      description: `${starsToRevoke} ${starsToRevoke === 1 ? "Stern" : "Sterne"} wieder abgezogen.`,
    });
  }, [
    childLogs,
    deductStars,
    logActivity,
    pendingUndo,
    selectedChildId,
    todayIso,
    toggleTaskCompletion,
  ]);

  const handleStartTimer = useCallback((task: Task) => {
    setTimerTask(task);
  }, []);

  const handleCreateRoutine = useCallback(() => {
    router.push("/parent-login");
  }, [router]);

  const handleOpenStickerReward = useCallback(() => {
    if (pendingStickerRewardEvent) {
      setShowStickerRewardSheet(true);
    }
  }, [pendingStickerRewardEvent]);

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
      const placedSticker = await claimStickerReward(pendingStickerRewardEvent, sticker.id);
      setShowStickerRewardSheet(false);
      setPendingStickerRewardEvent(null);

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
    [claimStickerReward, pendingStickerRewardEvent, router]
  );

  if (isLoading || routinesLoading) {
    return (
      <SafeAreaView className="flex-1">
        <ThemedScreenBackground
          theme={selectedChild?.theme}
          backgroundSkin={selectedChild?.backgroundSkin}
        >
          <View className="flex-1 px-4 pt-6 gap-3">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-4 w-60 rounded-chip" />
            <Skeleton className="mt-2 h-11 w-full rounded-full" />
            <Skeleton className="mt-1 h-48 w-full rounded-card" />
            <Skeleton className="h-36 w-full rounded-card" />
            <Skeleton className="h-36 w-full rounded-card" />
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
    <ThemedScreenBackground
      theme={selectedChild.theme}
      backgroundSkin={selectedChild.backgroundSkin}
    >
      <StarFlightLauncherProvider launch={launchStarFlight}>
        <View className="flex-1">
          <Header
            child={selectedChild}
            allChildren={children}
            collapsed={isHeaderCollapsed}
            onSelectChild={selectChild}
            onToggleCollapsed={toggleHeaderCollapsed}
          />

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="pb-8"
            onScroll={handleHeaderScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Screen headline */}
            <Animated.View entering={enterFade()} className="mx-4 mt-4">
              <Text className="text-[32px] font-headline leading-10 text-foreground">
                Routinen
              </Text>
              <Text className="mt-0.5 text-sm font-body text-muted-foreground">
                Deine täglichen Sterne-Missionen
              </Text>
            </Animated.View>

            {/* Category filter chips */}
            {showTimeFilters ? (
              <Animated.View entering={enterStagger(1)} className="mt-3">
                <View className="flex-row flex-wrap gap-2 px-4">
                  {availableFilters.map((filter) => {
                    const isActive = filter.key === routineFilter;
                    return (
                      <PressableScale
                        key={filter.key}
                        onPress={() => {
                          if (!isActive) {
                            void triggerFeedback("tab_focus");
                            setRoutineFilter(filter.key);
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Routinen filtern: ${filter.label}`}
                        accessibilityState={{ selected: isActive }}
                        className="min-h-11 items-center justify-center rounded-full border px-4 py-2.5"
                        style={
                          isActive
                            ? {
                                backgroundColor: palette.button,
                                borderColor: palette.button,
                                ...shadowPresets.shadowSubtle,
                              }
                            : {
                                backgroundColor: "rgba(255,255,255,0.8)",
                                borderColor: palette.accentBorder,
                              }
                        }
                      >
                        <Text
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.2}
                          className={
                            isActive ? "text-sm font-body-semibold" : "text-sm font-body"
                          }
                          style={{
                            color: isActive
                              ? semanticColors.accentForeground
                              : semanticColors.mutedForeground,
                          }}
                        >
                          {filter.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </Animated.View>
            ) : null}

            {/* Hero: next routine */}
            <Animated.View entering={enterStagger(2)} className="mx-4 mt-3">
              <Card
                className="overflow-hidden rounded-card px-5 py-5"
                style={{
                  backgroundColor: palette.heroSurface,
                  borderColor: palette.accentBorder,
                  ...shadowPresets.shadowCard,
                }}
              >
                <View
                  className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full"
                  style={{ backgroundColor: palette.motifPrimary, opacity: 0.35 }}
                />
                <View
                  className="absolute bottom-[-44px] left-[-30px] h-36 w-36 rounded-full"
                  style={{ backgroundColor: palette.motifSecondary, opacity: 0.3 }}
                />
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.7px]"
                  style={{ color: palette.accentText }}
                  maxFontSizeMultiplier={1.2}
                >
                  {allDone ? "Heute geschafft" : "Nächste Routine"}
                </Text>
                <Text
                  className="mt-1 text-[24px] font-headline leading-8 text-foreground"
                  numberOfLines={2}
                >
                  {allDone
                    ? "Alles erledigt!"
                    : heroRoutine
                      ? heroRoutine.name
                      : "Bereit für den Start"}
                </Text>
                <View className="mt-1 flex-row items-end gap-3">
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-body text-muted-foreground">
                      {allDone
                        ? "Du hast dir deine Sterne verdient."
                        : heroRoutine
                          ? `${heroOpenTasks} ${heroOpenTasks === 1 ? "Aufgabe wartet" : "Aufgaben warten"} auf dich`
                          : "Wähle eine Routine aus."}
                    </Text>
                    <PressableScale
                      onPress={handleHeroPress}
                      accessibilityRole="button"
                      accessibilityLabel={allDone ? "Belohnungen ansehen" : "Routine starten"}
                      containerClassName="mt-4 self-start"
                      className="flex-row items-center gap-2 rounded-full px-5 py-3"
                      style={{ backgroundColor: palette.button }}
                    >
                      <Text
                        className="text-base font-body-semibold leading-[22px] text-white"
                        maxFontSizeMultiplier={1.3}
                      >
                        {allDone ? "Belohnungen" : "Starten"}
                      </Text>
                      <ArrowRight size={18} color={semanticColors.accentForeground} />
                    </PressableScale>
                  </View>
                  <Image
                    source={heroArt}
                    style={{ width: 104, height: 104 }}
                    contentFit="contain"
                    transition={180}
                    accessibilityLabel={
                      allDone ? "Pokal für den geschafften Tag" : "Symbolbild der nächsten Routine"
                    }
                  />
                </View>
                <View className="mt-4 flex-row items-center gap-3">
                  <View className="flex-1">
                    <Progress
                      value={progressValue}
                      className="h-2.5"
                      indicatorColor={allDone ? semanticColors.success : palette.chartPrimary}
                      trackStyle={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                    />
                  </View>
                  <Text
                    className="shrink-0 text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.3}
                  >
                    {completedTasks} / {totalTasks}
                  </Text>
                </View>
              </Card>
            </Animated.View>

            <Animated.View
              entering={enterStagger(2)}
              className={isCompactWidth ? "mx-4 mt-3 gap-3" : "mx-4 mt-3 flex-row gap-3"}
            >
              <Card
                className={isCompactWidth ? "min-h-[132px] overflow-hidden rounded-card px-4 py-4" : "min-h-[156px] flex-1 overflow-hidden rounded-card px-4 py-4"}
                style={{
                  backgroundColor: palette.cardTint,
                  borderColor: palette.accentBorder,
                  ...shadowPresets.shadowCard,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Flame size={17} color={semanticColors.goldDeep} />
                  <Text
                    className="text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    Serie
                  </Text>
                </View>
                <View className="mt-3 flex-row items-end gap-1">
                  <Text
                    className="text-3xl font-headline text-foreground"
                    maxFontSizeMultiplier={1.3}
                  >
                    {insights.currentStreak}
                  </Text>
                  <Text
                    className="mb-1 text-xs font-body text-muted-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    Tag
                  </Text>
                </View>
                <Text className="mt-2 text-base font-body leading-6 text-muted-foreground">
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
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              </Card>

              <Card
                className={isCompactWidth ? "min-h-[132px] overflow-hidden rounded-card px-4 py-4" : "min-h-[156px] flex-1 overflow-hidden rounded-card px-4 py-4"}
                style={{
                  backgroundColor: palette.cardTint,
                  borderColor: palette.accentBorder,
                  ...shadowPresets.shadowCard,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Trophy size={17} color={semanticColors.goldDeep} />
                  <Text
                    className="text-xs font-body-semibold text-muted-foreground"
                    maxFontSizeMultiplier={1.2}
                  >
                    Nächstes Ziel
                  </Text>
                </View>
                <Text className="mt-3 text-base font-headline leading-5 text-foreground">
                  {nextRewardHint ? nextRewardHint.title : "Alles erreicht"}
                </Text>
                <Text className="mt-2 text-base font-body leading-6" style={{ color: palette.accentText }}>
                  {nextRewardHint
                    ? `Noch ${nextRewardHint.missingStars} ${
                        nextRewardHint.missingStars === 1 ? "Stern" : "Sterne"
                      }`
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
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
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

            {hasPendingStickerReward ? (
              <Animated.View entering={enterStagger(2)} className="mx-4 mt-4">
                <Card
                  className="overflow-hidden rounded-card px-4 py-4"
                  style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
                >
                  <View
                    className="absolute right-[-18px] top-[-16px] h-24 w-24 rounded-full"
                    style={{ backgroundColor: palette.motifPrimary, opacity: 0.2 }}
                  />
                  <View className={isCompactWidth ? "gap-3" : "flex-row items-center gap-3"}>
                    <View
                      className="h-12 w-12 items-center justify-center rounded-tile"
                      style={{ backgroundColor: palette.heroSurface }}
                    >
                      <Sparkles size={21} color={palette.accentStrong} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-lg font-headline text-foreground">
                        Dein Sticker wartet
                      </Text>
                      <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                        {pendingStickerRewardEvent?.reason === "daily_complete"
                          ? "Such dir ein Tier für deine Sticker-Galerie aus."
                          : `${pendingStickerRewardEvent?.routineName ?? "Die Routine"} ist geschafft.`}
                      </Text>
                    </View>
                    <Button
                      onPress={handleOpenStickerReward}
                      accessibilityRole="button"
                      accessibilityLabel="Sticker aussuchen"
                      className="h-12 rounded-tile px-4"
                      style={{ backgroundColor: palette.button }}
                    >
                      <Text
                        className="text-sm font-body-semibold text-white"
                        maxFontSizeMultiplier={1.3}
                      >
                        Aussuchen
                      </Text>
                    </Button>
                  </View>
                </Card>
              </Animated.View>
            ) : null}

            <Animated.View
              entering={enterStagger(3)}
              className="mx-4 mt-5 flex-row items-center justify-between gap-3"
            >
              <Text className="text-lg font-headline text-foreground">Deine Routinen</Text>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text
                  className="text-xs font-body-semibold"
                  style={{ color: palette.accentText }}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                >
                  {remainingTasks === 0 ? "Alles erledigt" : `${remainingTasks} offen`}
                </Text>
              </View>
            </Animated.View>

            <View
              className="mt-3 px-4"
              onLayout={(event) => {
                routineListY.current = event.nativeEvent.layout.y;
              }}
            >
              {displayRoutines.length > 0 ? (
                displayRoutines.map((routine, index) => (
                  <Animated.View
                    key={routine.id}
                    entering={enterStagger(index)}
                    exiting={exitFade()}
                    layout={routineLayoutTransition()}
                    onLayout={(event) => {
                      routinePositions.current[routine.id] = event.nativeEvent.layout.y;
                    }}
                  >
                    <RoutineCard
                      routine={routine}
                      childTheme={selectedChild.theme}
                      highlightTaskId={firstOpenTask?.task.id}
                      onTaskComplete={handleTaskComplete}
                      onStartTimer={handleStartTimer}
                    />
                  </Animated.View>
                ))
              ) : routines.length > 0 ? (
                <Card
                  className="items-center rounded-card px-5 py-6"
                  style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
                >
                  <Text className="text-center text-base font-headline text-foreground">
                    Hier ist gerade nichts geplant
                  </Text>
                  <Text className="mt-1 text-center text-base font-body leading-6 text-muted-foreground">
                    Schau unter „Alle“ nach deinen Routinen.
                  </Text>
                  <PressableScale
                    onPress={() => setRoutineFilter("alle")}
                    accessibilityRole="button"
                    accessibilityLabel="Alle Routinen anzeigen"
                    containerClassName="mt-3 self-center"
                    className="min-h-11 rounded-full px-4 py-2"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Text
                      className="text-sm font-body-semibold"
                      style={{ color: palette.accentText }}
                      maxFontSizeMultiplier={1.3}
                    >
                      Alle anzeigen
                    </Text>
                  </PressableScale>
                </Card>
              ) : (
                <Card
                  className="overflow-hidden rounded-card px-5 py-7"
                  style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
                >
                  <View
                    className="absolute right-[-24px] top-[-24px] h-28 w-28 rounded-full"
                    style={{ backgroundColor: palette.motifPrimary, opacity: 0.16 }}
                  />
                  <View
                    className="mx-auto mb-4 w-full max-w-[220px] overflow-hidden rounded-card"
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
                  <Text className="mx-auto mt-2 max-w-[280px] text-center text-base font-body leading-6 text-muted-foreground">
                    Lege im Elternbereich eine Starter-Routine an. Danach erscheint sie hier für das Kind.
                  </Text>
                  <Button
                    onPress={handleCreateRoutine}
                    size="lg"
                    accessibilityRole="button"
                    accessibilityLabel="Routine anlegen"
                    className="mt-5 rounded-card"
                    style={{ backgroundColor: palette.button }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Plus size={18} color={semanticColors.accentForeground} />
                      <Text
                        className="text-base font-body-semibold text-white"
                        maxFontSizeMultiplier={1.3}
                      >
                        Routine anlegen
                      </Text>
                    </View>
                  </Button>
                </Card>
              )}
            </View>

            {/* Day summary */}
            {routines.length > 0 ? (
              <Animated.View entering={enterStagger(4)} className="mx-4 mt-2">
                <Card
                  className="rounded-card px-4 py-4"
                  style={{
                    backgroundColor: palette.cardTint,
                    borderColor: palette.accentBorder,
                    ...shadowPresets.shadowCard,
                  }}
                >
                  <View className={isCompactWidth ? "gap-3" : "flex-row items-center gap-3"}>
                    <View
                      className="h-12 w-12 shrink-0 items-center justify-center rounded-tile"
                      style={{ backgroundColor: palette.surface }}
                    >
                      <Star
                        size={24}
                        color={semanticColors.goldDeep}
                        fill={semanticColors.goldDeep}
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-xs font-body-semibold text-muted-foreground"
                        maxFontSizeMultiplier={1.2}
                      >
                        Heute geschafft
                      </Text>
                      <Text
                        className="text-xl font-headline text-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        {starsToday} {starsToday === 1 ? "Stern" : "Sterne"}
                      </Text>
                      <Text
                        className="text-sm font-body text-muted-foreground"
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        {allDone ? "Du bist großartig!" : "Weiter so, du schaffst das!"}
                      </Text>
                    </View>
                    <View className={isCompactWidth ? "items-start gap-1.5" : "shrink-0 items-end gap-1.5"}>
                      <Text
                        className="text-xs font-body-semibold text-muted-foreground"
                        maxFontSizeMultiplier={1.2}
                      >
                        {completedRoutines} / {countableRoutines} Routinen
                      </Text>
                      <View className="w-[96px]">
                        <Progress
                          value={
                            countableRoutines > 0
                              ? (completedRoutines / countableRoutines) * 100
                              : 0
                          }
                          className="h-2"
                          indicatorColor={allDone ? semanticColors.success : palette.chartPrimary}
                          trackStyle={{ backgroundColor: semanticColors.muted }}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ) : null}
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

          <ConfirmDialog
            visible={pendingUndo !== null}
            title="Aufgabe zurücknehmen?"
            description="Die Sterne werden wieder abgezogen."
            confirmLabel="Zurücknehmen"
            onConfirm={handleConfirmTaskUndo}
            onCancel={handleCancelTaskUndo}
          />

          <StickerRewardSheet
            visible={showStickerRewardSheet}
            childName={selectedChild.name}
            stickers={availableStickers}
            palette={palette}
            rewardEvent={pendingStickerRewardEvent}
            onSelectSticker={handleSelectDailySticker}
            onClose={() => setShowStickerRewardSheet(false)}
          />

          {showConfetti && <Confetti colors={palette.celebrationColors} />}

          {/* Stars in transit from a task row to the header counter. Window-space
              coordinates, so this layer must stay a full-screen, non-interactive
              sibling at the top of the screen root. */}
          {starFlights.length > 0 ? (
            <View
              pointerEvents="none"
              // elevation keeps the layer on top on Android, where sibling
              // order alone does not win against elevated cards.
              style={[StyleSheet.absoluteFill, { zIndex: 30, elevation: 30 }]}
            >
              {starFlights.map((flight) => (
                <StarFlight
                  key={flight.id}
                  from={flight.from}
                  to={flight.to}
                  color={flight.color}
                  onDone={() => handleStarFlightDone(flight.id)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </StarFlightLauncherProvider>
    </ThemedScreenBackground>
  );
}
