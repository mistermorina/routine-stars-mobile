import { useState, useEffect, useCallback } from "react";
import { storage, KEYS } from "@/lib/storage";
import type { Routine } from "@/lib/types";
import { mockRoutines } from "@/lib/data";

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const stored = await storage.getItem<Routine[]>(KEYS.CUSTOM_ROUTINES);
      if (stored && stored.length > 0) {
        setRoutines(stored);
      } else {
        // Seed with mock data on first use
        const seeded = JSON.parse(JSON.stringify(mockRoutines));
        setRoutines(seeded);
        await storage.setItem(KEYS.CUSTOM_ROUTINES, seeded);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const addRoutine = useCallback(async (routine: Routine) => {
    const updated = [...routines, routine];
    setRoutines(updated);
    await storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
  }, [routines]);

  const updateRoutine = useCallback(async (id: string, updates: Partial<Routine>) => {
    const updated = routines.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRoutines(updated);
    await storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
  }, [routines]);

  const removeRoutine = useCallback(async (id: string) => {
    const updated = routines.filter((r) => r.id !== id);
    setRoutines(updated);
    await storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
  }, [routines]);

  const toggleTaskCompletion = useCallback(async (routineId: string, taskId: string) => {
    const updated = routines.map((routine) => {
      if (routine.id !== routineId) return routine;
      return {
        ...routine,
        tasks: routine.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      };
    });
    setRoutines(updated);
    await storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
    // Return the toggled task for star calculation
    const routine = updated.find((r) => r.id === routineId);
    return routine?.tasks.find((t) => t.id === taskId);
  }, [routines]);

  const resetDailyProgress = useCallback(async () => {
    const updated = routines.map((routine) => ({
      ...routine,
      tasks: routine.tasks.map((task) => ({ ...task, completed: false })),
    }));
    setRoutines(updated);
    await storage.setItem(KEYS.CUSTOM_ROUTINES, updated);
  }, [routines]);

  return {
    routines,
    isLoading,
    addRoutine,
    updateRoutine,
    removeRoutine,
    toggleTaskCompletion,
    resetDailyProgress,
    setRoutines,
  };
}
