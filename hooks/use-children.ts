import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { storage, KEYS } from "@/lib/storage";
import type { Child } from "@/lib/types";
import { normalizeChildTheme } from "@/lib/theme";

function normalizeChild(child: Child): Child {
  return {
    ...child,
    theme: normalizeChildTheme(child.theme),
  };
}

export function useChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const loadChildren = useCallback(async () => {
    const storedChildren = await storage.getItem<Child[]>(KEYS.CHILDREN);
    const lastSelectedId = await storage.getItem<string>(KEYS.LAST_SELECTED_CHILD_ID);

    if (storedChildren && storedChildren.length > 0) {
      const normalizedChildren = storedChildren.map(normalizeChild);
      setChildren(normalizedChildren);

      if (lastSelectedId && normalizedChildren.some((c) => c.id === lastSelectedId)) {
        setSelectedChildId(lastSelectedId);
      } else {
        setSelectedChildId(normalizedChildren[0].id);
        await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, normalizedChildren[0].id);
      }

      await storage.setItem(KEYS.CHILDREN, normalizedChildren);
    } else {
      setChildren([]);
      setSelectedChildId(undefined);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadChildren();
  }, [loadChildren]);

  useFocusEffect(
    useCallback(() => {
      void loadChildren();
    }, [loadChildren])
  );

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const selectChild = useCallback(
    async (id: string) => {
      setSelectedChildId(id);
      await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, id);
    },
    []
  );

  const addChild = useCallback(
    async (child: Child) => {
      const updated = [...children, normalizeChild(child)];
      setChildren(updated);
      setSelectedChildId(child.id);
      await storage.setItem(KEYS.CHILDREN, updated);
      await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, child.id);
    },
    [children]
  );

  const updateChild = useCallback(
    async (id: string, updates: Partial<Child>) => {
      const updated = children.map((c) =>
        c.id === id ? normalizeChild({ ...c, ...updates }) : c
      );
      setChildren(updated);
      await storage.setItem(KEYS.CHILDREN, updated);
    },
    [children]
  );

  const removeChild = useCallback(
    async (id: string) => {
      const updated = children.filter((c) => c.id !== id);
      setChildren(updated);
      await storage.setItem(KEYS.CHILDREN, updated);
      if (selectedChildId === id && updated.length > 0) {
        setSelectedChildId(updated[0].id);
        await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, updated[0].id);
      }
    },
    [children, selectedChildId]
  );

  const addStars = useCallback(
    async (childId: string, amount: number) => {
      const updated = children.map((c) =>
        c.id === childId ? { ...c, stars: c.stars + amount } : c
      );
      setChildren(updated);
      await storage.setItem(KEYS.CHILDREN, updated);
    },
    [children]
  );

  const deductStars = useCallback(
    async (childId: string, amount: number) => {
      const updated = children.map((c) =>
        c.id === childId ? { ...c, stars: Math.max(0, c.stars - amount) } : c
      );
      setChildren(updated);
      await storage.setItem(KEYS.CHILDREN, updated);
    },
    [children]
  );

  return {
    children,
    selectedChild,
    selectedChildId,
    isLoading,
    selectChild,
    addChild,
    updateChild,
    removeChild,
    addStars,
    deductStars,
    setChildren,
  };
}
