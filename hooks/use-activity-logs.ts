import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { getLocalIsoDate } from "@/lib/local-date";
import { storage, KEYS } from "@/lib/storage";
import type { ActivityLog, Task } from "@/lib/types";

/** Logs older than this are dropped once the list gets long enough to matter. */
const LOG_RETENTION_DAYS = 180;
/** Below this size pruning is not worth the pass over the array. */
const PRUNE_THRESHOLD = 500;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function createLogId() {
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * ISO `YYYY-MM-DD` strings sort chronologically, so the cutoff is a plain
 * string comparison — no Date parsing per entry.
 */
function pruneExpiredLogs(logs: ActivityLog[]): ActivityLog[] {
  if (logs.length <= PRUNE_THRESHOLD) return logs;

  const cutoff = getLocalIsoDate(new Date(Date.now() - LOG_RETENTION_DAYS * MS_PER_DAY));
  const kept = logs.filter((log) => typeof log.date === "string" && log.date >= cutoff);
  return kept.length === logs.length ? logs : kept;
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  // Mirror of the persisted list. Mutators read this instead of the render
  // closure, so two writes in the same tick cannot overwrite each other.
  const logsRef = useRef<ActivityLog[]>([]);
  // Bumped on every local write so a slower reload cannot clobber it.
  const revisionRef = useRef(0);

  const hydrateLogs = useCallback((next: ActivityLog[]) => {
    logsRef.current = next;
    setLogs(next);
  }, []);

  const loadLogs = useCallback(async () => {
    const revisionAtStart = revisionRef.current;
    const stored = await storage.getItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS);
    if (revisionRef.current !== revisionAtStart) return;
    hydrateLogs(Array.isArray(stored) ? stored : []);
  }, [hydrateLogs]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  useFocusEffect(
    useCallback(() => {
      void loadLogs();
    }, [loadLogs])
  );

  const logActivity = useCallback(
    async (childId: string, task: Task, bonusStars = 0) => {
      const newLog: ActivityLog = {
        id: createLogId(),
        childId,
        taskId: task.id,
        taskTitle: task.title,
        date: getLocalIsoDate(),
        stars: task.stars + bonusStars,
      };

      const next = pruneExpiredLogs([...logsRef.current, newLog]);
      revisionRef.current += 1;
      hydrateLogs(next);
      await storage.setItem(KEYS.ACTIVITY_LOGS, next);
      return newLog;
    },
    [hydrateLogs]
  );

  const getLogsForChild = useCallback(
    (childId: string) => {
      return logs.filter((log) => log.childId === childId);
    },
    [logs]
  );

  return {
    logs,
    logActivity,
    getLogsForChild,
  };
}
