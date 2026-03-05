import { useState, useEffect, useCallback } from "react";
import { storage, KEYS } from "@/lib/storage";
import type { Reward } from "@/lib/types";

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const stored = await storage.getItem<Reward[]>(KEYS.CUSTOM_REWARDS);
      if (stored) {
        setRewards(stored);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const addReward = useCallback(async (reward: Reward) => {
    const updated = [...rewards, reward];
    setRewards(updated);
    await storage.setItem(KEYS.CUSTOM_REWARDS, updated);
  }, [rewards]);

  const updateReward = useCallback(async (id: string, updates: Partial<Reward>) => {
    const updated = rewards.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setRewards(updated);
    await storage.setItem(KEYS.CUSTOM_REWARDS, updated);
  }, [rewards]);

  const removeReward = useCallback(async (id: string) => {
    const updated = rewards.filter((r) => r.id !== id);
    setRewards(updated);
    await storage.setItem(KEYS.CUSTOM_REWARDS, updated);
  }, [rewards]);

  return {
    rewards,
    isLoading,
    addReward,
    updateReward,
    removeReward,
    setRewards,
  };
}
