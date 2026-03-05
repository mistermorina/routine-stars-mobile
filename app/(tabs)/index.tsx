import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useRoutines } from "@/hooks/use-routines";
import type { Routine, Task } from "@/lib/types";
import { getThemePalette } from "@/lib/theme";
import { Header } from "@/components/routine-stars/header";
import { RoutineCard } from "@/components/routine-stars/routine-card";
import { TaskTimerModal } from "@/components/routine-stars/task-timer-modal";
import { RoutineCompleteDialog } from "@/components/routine-stars/routine-complete-dialog";
import { Confetti } from "@/components/routine-stars/confetti";

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
  const { logActivity } = useActivityLogs();
  const { routines, toggleTaskCompletion, isLoading: routinesLoading } = useRoutines(selectedChildId);

  // Timer modal state
  const [timerTask, setTimerTask] = useState<Task | null>(null);

  // Routine complete dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const palette = getThemePalette(selectedChild?.theme);
  const displayRoutines = useMemo(
    () =>
      [...routines].sort((left, right) => {
        const leftRemaining = left.tasks.filter((task) => !task.completed).length;
        const rightRemaining = right.tasks.filter((task) => !task.completed).length;
        return leftRemaining - rightRemaining;
      }),
    [routines]
  );
  const remainingTasks = displayRoutines.reduce(
    (count, routine) => count + routine.tasks.filter((task) => !task.completed).length,
    0
  );
  const firstOpenTask = displayRoutines
    .flatMap((routine) =>
      routine.tasks
        .filter((task) => !task.completed)
        .map((task) => ({ task, routineName: routine.name }))
    )
    .at(0);

  // Redirect to auth if no children
  useEffect(() => {
    if (!isLoading && children.length === 0) {
      router.replace("/(auth)/onboarding");
    }
  }, [isLoading, children.length, router]);

  const handleTaskComplete = useCallback(
    async (taskId: string, bonusStars?: number) => {
      if (!selectedChildId) return;

      // Find which routine contains this task
      let parentRoutine: Routine | undefined;
      for (const r of routines) {
        if (r.tasks.some((t) => t.id === taskId)) {
          parentRoutine = r;
          break;
        }
      }
      if (!parentRoutine) return;
      const task = parentRoutine.tasks.find((t) => t.id === taskId);
      if (!task || task.completed) return;

      await toggleTaskCompletion(parentRoutine.id, taskId);

      // Add stars to child
      const totalStars = task.stars + (bonusStars || 0);
      await addStars(selectedChildId, totalStars);

      // Log activity
      await logActivity(selectedChildId, { ...task, completed: true }, bonusStars);

      // Check if all tasks in routine completed
      const allCompleted = parentRoutine.tasks.every((t) =>
        t.id === taskId ? true : t.completed
      );
      if (allCompleted) {
        setShowConfetti(true);
        setShowCompleteDialog(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    },
    [selectedChildId, routines, toggleTaskCompletion, addStars, logActivity]
  );

  const handleStartTimer = useCallback((task: Task) => {
    setTimerTask(task);
  }, []);

  const handleTimerClose = useCallback(
    (success: boolean) => {
      if (success && timerTask) {
        handleTaskComplete(timerTask.id, timerTask.bonusStars);
      }
      setTimerTask(null);
    },
    [timerTask, handleTaskComplete]
  );

  const handleCloseCompleteDialog = useCallback(() => {
    setShowCompleteDialog(false);
  }, []);

  // Loading state
  if (isLoading || routinesLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </SafeAreaView>
    );
  }

  // No children state (should redirect, but fallback)
  if (!selectedChild) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-xl font-headline text-foreground text-center">
          Kein Kind ausgewählt
        </Text>
        <Text className="mt-2 text-muted-foreground font-body text-center">
          Bitte erstelle zuerst ein Kinderprofil.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <Header child={selectedChild} allChildren={children} onSelectChild={selectChild} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mx-4 mt-4 rounded-2xl border px-4 py-4"
          style={{
            borderColor: palette.accentBorder,
            backgroundColor: palette.accentSoft,
          }}
        >
          <Text className="text-sm font-body text-muted-foreground">Heute zuerst</Text>
          <Text className="mt-1 text-2xl font-headline text-foreground">
            {remainingTasks === 0
              ? "Alles geschafft!"
              : `${remainingTasks} Aufgaben warten noch`}
          </Text>
          {firstOpenTask ? (
            <View className="mt-3 flex-row items-center">
              <View className="flex-1">
                <Text className="text-sm font-body" style={{ color: palette.accentText }}>
                  Starte am besten mit „{firstOpenTask.task.title}“ aus {firstOpenTask.routineName}.
                </Text>
              </View>
              <ArrowRight size={18} color={palette.accentStrong} />
            </View>
          ) : (
            <Text className="mt-3 text-sm font-body" style={{ color: palette.accentText }}>
              Belohnungen oder Sternenkonto ansehen und den Erfolg feiern.
            </Text>
          )}
        </View>

        {/* Routine cards */}
        <View className="px-4 mt-4">
          {displayRoutines.length > 0 ? (
            displayRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onTaskComplete={handleTaskComplete}
                onStartTimer={handleStartTimer}
              />
            ))
          ) : (
            <View className="rounded-2xl bg-card px-5 py-8">
              <Text className="text-lg font-headline text-foreground text-center">
                Noch keine Routinen angelegt
              </Text>
              <Text className="mt-2 text-sm font-body text-muted-foreground text-center">
                Bitte öffne im Eltern-Bereich das Onboarding erneut, um eine Starter-Routine
                anzulegen.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Timer modal */}
      <TaskTimerModal
        task={timerTask}
        childName={selectedChild.name}
        childTheme={selectedChild.theme}
        onClose={handleTimerClose}
      />

      {/* Routine complete dialog */}
      <RoutineCompleteDialog
        isOpen={showCompleteDialog}
        onClose={handleCloseCompleteDialog}
        childTheme={selectedChild.theme}
      />

      {/* Confetti overlay - rendered last so it appears in front */}
      {showConfetti && <Confetti />}
    </View>
  );
}
