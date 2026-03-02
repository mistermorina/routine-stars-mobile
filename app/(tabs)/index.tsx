import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { RefreshCcw } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useToast } from "@/hooks/use-toast";
import { useRoutines } from "@/hooks/use-routines";
import type { Routine, Task } from "@/lib/types";
import { Header } from "@/components/routine-stars/header";
import { ChildSelector } from "@/components/routine-stars/child-selector";
import { RoutineCard } from "@/components/routine-stars/routine-card";
import { TaskTimerModal } from "@/components/routine-stars/task-timer-modal";
import { RoutineCompleteDialog } from "@/components/routine-stars/routine-complete-dialog";
import { Confetti } from "@/components/routine-stars/confetti";
import { Button } from "@/components/ui/button";

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
  const { toast } = useToast();
  const { routines, toggleTaskCompletion, resetDailyProgress, isLoading: routinesLoading } = useRoutines();

  // Timer modal state
  const [timerTask, setTimerTask] = useState<Task | null>(null);

  // Routine complete dialog state
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Redirect to auth if no children
  useEffect(() => {
    if (!isLoading && children.length === 0) {
      router.replace("/(auth)/login");
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

  const handleResetRoutines = useCallback(() => {
    resetDailyProgress();
    toast({
      title: "Routinen zurueckgesetzt",
      description: "Alle Aufgaben wurden zurueckgesetzt.",
    });
  }, [resetDailyProgress, toast]);

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
          Kein Kind ausgewaehlt
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
      <Header child={selectedChild} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        {/* Child selector */}
        {children.length > 1 && (
          <ChildSelector
            children={children}
            selectedChildId={selectedChildId!}
            onSelectChild={selectChild}
          />
        )}

        {/* Routine cards */}
        <View className="px-4 mt-4">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onTaskComplete={handleTaskComplete}
              onStartTimer={handleStartTimer}
            />
          ))}
        </View>

        {/* Reset button (Demo) */}
        <View className="px-4 mt-4 mb-4">
          <Button
            variant="ghost"
            onPress={handleResetRoutines}
            className="self-center"
          >
            <View className="flex-row items-center gap-2">
              <RefreshCcw size={16} color="#737373" />
              <Text className="text-sm font-body text-muted-foreground">
                Routinen zuruecksetzen (Demo)
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>

      {/* Timer modal */}
      <TaskTimerModal
        task={timerTask}
        childName={selectedChild.name}
        onClose={handleTimerClose}
      />

      {/* Routine complete dialog */}
      <RoutineCompleteDialog
        isOpen={showCompleteDialog}
        onClose={handleCloseCompleteDialog}
      />

      {/* Confetti overlay - rendered last so it appears in front */}
      {showConfetti && <Confetti />}
    </View>
  );
}
