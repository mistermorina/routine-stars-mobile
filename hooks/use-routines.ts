import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { getLocalIsoDate } from "@/lib/local-date";
import { storage, KEYS } from "@/lib/storage";
import type { Routine } from "@/lib/types";

interface ChildRoutineProgress {
  date: string;
  tasks: Record<string, boolean>;
}

type RoutineProgress = Record<string, ChildRoutineProgress>;
type LegacyRoutineProgress = Record<string, Record<string, boolean>>;

function normalizeTaskProgress(tasks: Record<string, boolean> | undefined) {
  if (!tasks) return {};

  return Object.fromEntries(
    Object.entries(tasks).filter(([, isCompleted]) => typeof isCompleted === "boolean")
  );
}

function normalizeRoutineProgress(
  storedProgress: LegacyRoutineProgress | RoutineProgress | null
) {
  if (!storedProgress) {
    return { progress: {}, changed: false };
  }

  const today = getLocalIsoDate();
  let changed = false;
  const normalizedProgress: RoutineProgress = {};

  for (const [childId, rawEntry] of Object.entries(storedProgress)) {
    if (!rawEntry || typeof rawEntry !== "object") {
      changed = true;
      continue;
    }

    const maybeEntry = rawEntry as Partial<ChildRoutineProgress>;
    const hasDateEntry =
      typeof maybeEntry.date === "string" &&
      Boolean(maybeEntry.tasks) &&
      typeof maybeEntry.tasks === "object";

    if (hasDateEntry) {
      const tasks = maybeEntry.date === today
        ? normalizeTaskProgress(maybeEntry.tasks as Record<string, boolean>)
        : {};
      const normalizedEntry: ChildRoutineProgress = {
        date: today,
        tasks,
      };

      if (
        maybeEntry.date !== today ||
        Object.keys(tasks).length !== Object.keys(maybeEntry.tasks as Record<string, boolean>).length
      ) {
        changed = true;
      }

      normalizedProgress[childId] = normalizedEntry;
      continue;
    }

    changed = true;
    normalizedProgress[childId] = {
      date: today,
      tasks: normalizeTaskProgress(rawEntry as Record<string, boolean>),
    };
  }

  return { progress: normalizedProgress, changed };
}

export function useRoutines(selectedChildId?: string) {
  const [routineTemplates, setRoutineTemplates] = useState<Routine[]>([]);
  const [progress, setProgress] = useState<RoutineProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const hasMigrated = useRef(false);

  const loadRoutines = useCallback(async () => {
    const [storedRoutines, storedProgress] = await Promise.all([
      storage.getItem<Routine[]>(KEYS.CUSTOM_ROUTINES),
      storage.getItem<LegacyRoutineProgress | RoutineProgress>(KEYS.ROUTINE_PROGRESS),
    ]);

    let templates: Routine[] = storedRoutines ?? [];
    const normalizedProgressResult = normalizeRoutineProgress(storedProgress);
    const normalizedProgress = normalizedProgressResult.progress;

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
        const newProgress: RoutineProgress = {
          [selectedChildId]: {
            date: getLocalIsoDate(),
            tasks: migratedProgress,
          },
        };
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
      setProgress(normalizedProgress);
      if (normalizedProgressResult.changed) {
        await storage.setItem(KEYS.ROUTINE_PROGRESS, normalizedProgress);
      }
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
    const today = getLocalIsoDate();
    const childProgressEntry = progress[selectedChildId];
    const childProgress =
      childProgressEntry?.date === today ? childProgressEntry.tasks : {};
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
      const today = getLocalIsoDate();
      const childEntry = prev[selectedChildId];
      const childProgress =
        childEntry?.date === today ? childEntry.tasks : {};
      const newChildProgress = {
        ...childProgress,
        [taskId]: !childProgress[taskId],
      };
      const updated = {
        ...prev,
        [selectedChildId]: { date: today, tasks: newChildProgress },
      };
      storage.setItem(KEYS.ROUTINE_PROGRESS, updated);
      return updated;
    });

    // Return the toggled task for star calculation
    const routine = routineTemplates.find((r) => r.id === routineId);
    const task = routine?.tasks.find((t) => t.id === taskId);
    if (task) {
      const today = getLocalIsoDate();
      const childEntry = progress[selectedChildId];
      const childProgress =
        childEntry?.date === today ? childEntry.tasks : {};
      return { ...task, completed: !childProgress[taskId] };
    }
  }, [selectedChildId, routineTemplates, progress]);

  const resetDailyProgress = useCallback(async () => {
    if (!selectedChildId) return;

    setProgress((prev) => {
      const updated = {
        ...prev,
        [selectedChildId]: {
          date: getLocalIsoDate(),
          tasks: {},
        },
      };
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
