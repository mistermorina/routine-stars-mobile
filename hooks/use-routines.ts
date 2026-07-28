import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useFocusEffect } from "expo-router";
import { getLocalIsoDate } from "@/lib/local-date";
import { syncRoutineReminders } from "@/lib/notifications";
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
  // Mirrors of the persisted state. Mutators read these instead of the render
  // closure, so two writes in the same tick cannot overwrite each other.
  const routineTemplatesRef = useRef<Routine[]>([]);
  const progressRef = useRef<RoutineProgress>({});
  // Bumped on every local write so a slower reload cannot clobber it.
  const revisionRef = useRef(0);

  const hydrateTemplates = useCallback((next: Routine[]) => {
    routineTemplatesRef.current = next;
    setRoutineTemplates(next);
  }, []);

  const hydrateProgress = useCallback((next: RoutineProgress) => {
    progressRef.current = next;
    setProgress(next);
  }, []);

  const loadRoutines = useCallback(async () => {
    const revisionAtStart = revisionRef.current;
    const [storedRoutines, storedProgress] = await Promise.all([
      storage.getItem<Routine[]>(KEYS.CUSTOM_ROUTINES),
      storage.getItem<LegacyRoutineProgress | RoutineProgress>(KEYS.ROUTINE_PROGRESS),
    ]);

    // A local write landed while we were reading — its value is the newer one.
    if (revisionRef.current !== revisionAtStart) {
      setIsLoading(false);
      return;
    }

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
        hydrateProgress(newProgress);
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
      hydrateProgress(normalizedProgress);
      if (normalizedProgressResult.changed) {
        await storage.setItem(KEYS.ROUTINE_PROGRESS, normalizedProgress);
      }
    }

    hydrateTemplates(templates);
    setIsLoading(false);
  }, [hydrateProgress, hydrateTemplates, selectedChildId]);

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

  const commitTemplates = useCallback(
    async (next: Routine[]) => {
      revisionRef.current += 1;
      hydrateTemplates(next);
      await storage.setItem(KEYS.CUSTOM_ROUTINES, next);

      // Every template mutation can change a name, a weekday, a time or a
      // reminder switch, so the schedule is rebuilt from `next` here — the
      // single choke point add/update/remove all pass through. Fire and
      // forget: notification scheduling must never delay or fail a save,
      // and syncRoutineReminders() resolves with a status instead of
      // throwing.
      void syncRoutineReminders(next);
    },
    [hydrateTemplates]
  );

  const addRoutine = useCallback(
    async (routine: Routine) => {
      await commitTemplates([
        ...routineTemplatesRef.current,
        { ...routine, tasks: routine.tasks.map((t) => ({ ...t, completed: false })) },
      ]);
    },
    [commitTemplates]
  );

  const updateRoutine = useCallback(
    async (id: string, updates: Partial<Routine>) => {
      await commitTemplates(
        routineTemplatesRef.current.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    [commitTemplates]
  );

  const removeRoutine = useCallback(
    async (id: string) => {
      await commitTemplates(routineTemplatesRef.current.filter((r) => r.id !== id));
    },
    [commitTemplates]
  );

  /**
   * Targeted toggle for the notification settings screen: flips only
   * `reminders.enabled` and keeps a custom message intact. Goes through
   * commitTemplates, so the reminder schedule is rebuilt automatically.
   */
  const setRoutineReminderEnabled = useCallback(
    async (routineId: string, enabled: boolean) => {
      await commitTemplates(
        routineTemplatesRef.current.map((r) =>
          r.id === routineId ? { ...r, reminders: { ...r.reminders, enabled } } : r
        )
      );
    },
    [commitTemplates]
  );

  const toggleTaskCompletion = useCallback(
    async (routineId: string, taskId: string) => {
      if (!selectedChildId) return;

      const today = getLocalIsoDate();
      const previous = progressRef.current;
      const childEntry = previous[selectedChildId];
      const childProgress = childEntry?.date === today ? childEntry.tasks : {};
      const nextCompleted = !childProgress[taskId];
      const updated: RoutineProgress = {
        ...previous,
        [selectedChildId]: {
          date: today,
          tasks: { ...childProgress, [taskId]: nextCompleted },
        },
      };

      revisionRef.current += 1;
      hydrateProgress(updated);
      await storage.setItem(KEYS.ROUTINE_PROGRESS, updated);

      // Return the toggled task for star calculation. `nextCompleted` is the
      // value that was actually persisted, so a double tap cannot report a
      // stale completion state.
      const routine = routineTemplatesRef.current.find((r) => r.id === routineId);
      const task = routine?.tasks.find((t) => t.id === taskId);
      if (task) {
        return { ...task, completed: nextCompleted };
      }
    },
    [hydrateProgress, selectedChildId]
  );

  // Same signature and (non-persisting) semantics as the raw state setter this
  // hook used to hand out — it just keeps the mirror in sync as well.
  const replaceRoutines = useCallback<Dispatch<SetStateAction<Routine[]>>>(
    (action) => {
      const next =
        typeof action === "function"
          ? (action as (previous: Routine[]) => Routine[])(routineTemplatesRef.current)
          : action;
      hydrateTemplates(next);
    },
    [hydrateTemplates]
  );

  return {
    routines,
    isLoading,
    addRoutine,
    updateRoutine,
    removeRoutine,
    setRoutineReminderEnabled,
    toggleTaskCompletion,
    setRoutines: replaceRoutines,
  };
}
