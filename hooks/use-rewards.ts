import { useState, useEffect, useCallback, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useFocusEffect } from "expo-router";
import { storage, KEYS } from "@/lib/storage";
import type { Reward } from "@/lib/types";

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Mirror of the persisted list. Mutators read this instead of the render
  // closure, so two writes in the same tick cannot overwrite each other.
  const rewardsRef = useRef<Reward[]>([]);
  // Bumped on every local write so a slower reload cannot clobber it.
  const revisionRef = useRef(0);

  const hydrateRewards = useCallback((next: Reward[]) => {
    rewardsRef.current = next;
    setRewards(next);
  }, []);

  const commitRewards = useCallback(
    async (next: Reward[]) => {
      revisionRef.current += 1;
      hydrateRewards(next);
      await storage.setItem(KEYS.CUSTOM_REWARDS, next);
    },
    [hydrateRewards]
  );

  const loadRewards = useCallback(async () => {
    const revisionAtStart = revisionRef.current;
    const stored = await storage.getItem<Reward[]>(KEYS.CUSTOM_REWARDS);
    if (revisionRef.current === revisionAtStart) {
      hydrateRewards(Array.isArray(stored) ? stored : []);
    }
    setIsLoading(false);
  }, [hydrateRewards]);

  useEffect(() => {
    void loadRewards();
  }, [loadRewards]);

  useFocusEffect(
    useCallback(() => {
      void loadRewards();
    }, [loadRewards])
  );

  const addReward = useCallback(
    async (reward: Reward) => {
      await commitRewards([...rewardsRef.current, reward]);
    },
    [commitRewards]
  );

  const updateReward = useCallback(
    async (id: string, updates: Partial<Reward>) => {
      await commitRewards(
        rewardsRef.current.map((reward) =>
          reward.id === id ? { ...reward, ...updates } : reward
        )
      );
    },
    [commitRewards]
  );

  const removeReward = useCallback(
    async (id: string) => {
      await commitRewards(rewardsRef.current.filter((reward) => reward.id !== id));
    },
    [commitRewards]
  );

  // Same signature and (non-persisting) semantics as the raw state setter this
  // hook used to hand out — it just keeps the mirror in sync as well.
  const replaceRewards = useCallback<Dispatch<SetStateAction<Reward[]>>>(
    (action) => {
      const next =
        typeof action === "function"
          ? (action as (previous: Reward[]) => Reward[])(rewardsRef.current)
          : action;
      hydrateRewards(next);
    },
    [hydrateRewards]
  );

  return {
    rewards,
    isLoading,
    addReward,
    updateReward,
    removeReward,
    setRewards: replaceRewards,
  };
}
