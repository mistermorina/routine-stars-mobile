import { useState, useEffect, useCallback } from "react";
import { storage, KEYS } from "@/lib/storage";
import type { ActivityLog, Task } from "@/lib/types";

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function load() {
      const stored = await storage.getItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS);
      if (stored) {
        setLogs(stored);
      }
    }
    load();
  }, []);

  const logActivity = useCallback(
    async (childId: string, task: Task, bonusStars = 0) => {
      const totalStars = task.stars + bonusStars;
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        childId,
        taskId: task.id,
        taskTitle: task.title,
        date: new Date().toISOString().split("T")[0],
        stars: totalStars,
      };

      const updated = [...logs, newLog];
      setLogs(updated);
      await storage.setItem(KEYS.ACTIVITY_LOGS, updated);
      return newLog;
    },
    [logs]
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
