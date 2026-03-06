import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { storage, KEYS } from "@/lib/storage";
import type { Routine } from "@/lib/types";

// Progress structure: Record<childId, Record<taskId, boolean>>
type RoutineProgress = Record<string, Record<string, boolean>>;

export function useRoutines(selectedChildId?: string) {
  const [routineTemplates, setRoutineTemplates] = useState<Routine[]>([]);
  const [progress, setProgress] = useState<RoutineProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const hasMigrated = useRef(false);

  const loadRoutines = useCallback(async () => {
    const [storedRoutines, storedProgress] = await Promise.all([
      storage.getItem<Routine[]>(KEYS.CUSTOM_ROUTINES),
      storage.getItem<RoutineProgress>(KEYS.ROUTINE_PROGRESS),
    ]);

    let templates: Routine[] = storedRoutines ?? [];

    // Migration: if no progress exists yet but routines have completed tasks,
    // migrate existing completion state as progress for the current child
    if (!storedProgress && !hasMigrated.current) {
      hasMigrated.current = true;
      const hasCompletedTasks = templates.some((r) =>
        r.tasks.some((t) => t.completed)
      );

      if (hasCompletedTasks && selectedChildId) {
        const migratedProgress: Record<string, boolean> = {};
        for (const routine of templates) {
          for (const task of routine.tasks) {
            if (task.completed) {
              migratedProgress[task.id] = true;
            }
          }
        }
        const newProgress: RoutineProgress = { [selectedChildId]: migratedProgress };
        setProgress(newProgress);
        await storage.setItem(KEYS.ROUTINE_PROGRESS, newProgress);

        // Reset all tasks in templates to completed: false
        const cleanTemplates = templates.map((r) => ({
          ...r,
          tasks: r.tasks.map((t) => ({ ...t, completed: false })),
        }));
        templates = cleanTemplates;
        await storage.setItem(KEYS.CUSTOM_ROUTINES, cleanTemplates);
      }
    } else {
      setProgress(storedProgress ?? {});
    }

    setRoutineTemplates(templates);
    setIsLoading(false);
  }, [selectedChildId]);

  // Load routine templates and progress
  useEffect(() => {
    void loadRoutines();
  }, [loadRoutines]);

  useFocusEffect(
    useCallback(() => {
      void loadRoutines();
    }, [loadRoutines])
  );

  // Computed routines: merge templates with child-specific progress
  const routines = useMemo(() => {
    if (!selectedChildId) return routineTemplates;
    const childProgress = progress[selectedChildId] ?? {};
    return routineTemplates.map((r) => ({
      ...r,
      tasks: r.tasks.map((t) => ({
        ...t,
        completed: childProgress[t.id] ?? false,
      })),
    }));
  }, [routineTemplates, progress, selectedChildId]);

  const addRoutine = useCallback(async (routine: Routine) => {
    setRoutineTemplates((prev) => {
      const updated = [...prev, { ...routine, tasks: routine.tasks.map((t) => ({ ...t, completed: false })) }];
      storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
      return updated;
    });
  }, []);

  const updateRoutine = useCallback(async (id: string, updates: Partial<Routine>) => {
    setRoutineTemplates((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
      storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
      return updated;
    });
  }, []);

  const removeRoutine = useCallback(async (id: string) => {
    setRoutineTemplates((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
      return updated;
    });
  }, []);

  const toggleTaskCompletion = useCallback(async (routineId: string, taskId: string) => {
    if (!selectedChildId) return;

    setProgress((prev) => {
      const childProgress = prev[selectedChildId] ?? {};
      const newChildProgress = {
        ...childProgress,
        [taskId]: !childProgress[taskId],
      };
      const updated = { ...prev, [selectedChildId]: newChildProgress };
      storage.setItem(KEYS.ROUTINE_PROGRESS, updated);
      return updated;
    });

    // Return the toggled task for star calculation
    const routine = routineTemplates.find((r) => r.id === routineId);
    const task = routine?.tasks.find((t) => t.id === taskId);
    if (task) {
      const childProgress = progress[selectedChildId] ?? {};
      return { ...task, completed: !childProgress[taskId] };
    }
  }, [selectedChildId, routineTemplates, progress]);

  const resetDailyProgress = useCallback(async () => {
    if (!selectedChildId) return;

    setProgress((prev) => {
      const updated = { ...prev, [selectedChildId]: {} };
      storage.setItem(KEYS.ROUTINE_PROGRESS, updated);
      return updated;
    });
  }, [selectedChildId]);

  return {
    routines,
    isLoading,
    addRoutine,
    updateRoutine,
    removeRoutine,
    toggleTaskCompletion,
    resetDailyProgress,
    setRoutines: setRoutineTemplates,
  };
}
