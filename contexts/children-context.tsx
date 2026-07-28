import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { usePathname } from "expo-router";

import { normalizeAvatarValue } from "@/lib/avatars";
import { normalizeBackgroundSkin } from "@/lib/background-skins";
import { getLocalIsoDate } from "@/lib/local-date";
import { KEYS, storage } from "@/lib/storage";
import { normalizeChildTheme } from "@/lib/theme";
import type { Child } from "@/lib/types";

/** How often the local calendar day is re-checked while the app is in the foreground. */
const DAY_CHECK_INTERVAL_MS = 60_000;

/**
 * Heals legacy/partial records coming out of AsyncStorage: avatar, background
 * skin and theme always come back as a valid value of the current shape.
 */
export function normalizeChild(child: Child): Child {
  return {
    ...child,
    avatar: normalizeAvatarValue(child.avatar),
    backgroundSkin: normalizeBackgroundSkin(child.backgroundSkin),
    theme: normalizeChildTheme(child.theme),
  };
}

function areChildrenEqual(left: Child[], right: Child[]) {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  return JSON.stringify(left) === JSON.stringify(right);
}

export interface ChildrenContextValue {
  children: Child[];
  selectedChild: Child | undefined;
  selectedChildId: string | undefined;
  isLoading: boolean;
  /**
   * Local ISO day (`YYYY-MM-DD`). Re-evaluated on every foreground and once a
   * minute while active, so screens re-derive "today" after a midnight rollover
   * without owning a timer each.
   */
  todayIso: string;
  selectChild: (id: string) => Promise<void>;
  addChild: (child: Child) => Promise<void>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
  addStars: (childId: string, amount: number) => Promise<void>;
  deductStars: (childId: string, amount: number) => Promise<void>;
  setChildren: (value: React.SetStateAction<Child[]>) => void;
  /** Re-reads children from storage. Runs on mount, foreground and navigation. */
  reload: () => Promise<void>;
}

const ChildrenContext = createContext<ChildrenContextValue | null>(null);

/**
 * Single source of truth for the child roster.
 *
 * Mounted once in `app/_layout.tsx`, above the tabs, so every screen reads the
 * same state — expo-router keeps all three tab screens mounted, which is why a
 * per-screen hook used to go stale after a star was awarded in another tab.
 *
 * Consumers use `useChildren()` from `@/hooks/use-children`.
 */
export function ChildrenProvider({ children }: { children: React.ReactNode }) {
  const [childList, setChildList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [todayIso, setTodayIso] = useState(() => getLocalIsoDate());

  // Mirrors of the latest state. React state updates are asynchronous, so every
  // mutator derives its next value from these refs instead of a render-time
  // closure — two addStars() calls in the same tick can no longer lose one another.
  const childListRef = useRef<Child[]>([]);
  const selectedChildIdRef = useRef<string | undefined>(undefined);
  // Bumped by every local change so an in-flight reload can tell that the
  // snapshot it read is already outdated.
  const localRevisionRef = useRef(0);

  // Serializes storage access so a foreground reload never reads behind a write
  // that has not landed yet.
  const storageQueueRef = useRef<Promise<unknown>>(Promise.resolve());

  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = storageQueueRef.current.then(task, task);
    storageQueueRef.current = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }, []);

  /** Applies a state update against the latest known list and returns it. */
  const applyChildren = useCallback((value: React.SetStateAction<Child[]>) => {
    const next =
      typeof value === "function"
        ? (value as (prev: Child[]) => Child[])(childListRef.current)
        : value;

    childListRef.current = next;
    localRevisionRef.current += 1;
    setChildList(next);
    return next;
  }, []);

  const applySelectedChildId = useCallback((id: string | undefined) => {
    selectedChildIdRef.current = id;
    localRevisionRef.current += 1;
    setSelectedChildId(id);
  }, []);

  const reload = useCallback(
    () =>
      enqueue(async () => {
        const revisionAtStart = localRevisionRef.current;
        const storedChildren = await storage.getItem<Child[]>(KEYS.CHILDREN);
        const lastSelectedId = await storage.getItem<string>(KEYS.LAST_SELECTED_CHILD_ID);

        // A mutation landed while we were reading: in-memory state is newer and
        // its write is already queued behind us — never overwrite it with the
        // snapshot we just read.
        if (localRevisionRef.current !== revisionAtStart) {
          setIsLoading(false);
          return;
        }

        if (storedChildren && storedChildren.length > 0) {
          const normalizedChildren = storedChildren.map(normalizeChild);

          if (!areChildrenEqual(childListRef.current, normalizedChildren)) {
            applyChildren(normalizedChildren);
          }

          const nextSelectedId =
            lastSelectedId && normalizedChildren.some((c) => c.id === lastSelectedId)
              ? lastSelectedId
              : normalizedChildren[0].id;

          if (selectedChildIdRef.current !== nextSelectedId) {
            applySelectedChildId(nextSelectedId);
          }

          if (lastSelectedId !== nextSelectedId) {
            await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, nextSelectedId);
          }

          // Write the healed shape back only when it actually changed on disk.
          if (!areChildrenEqual(storedChildren, normalizedChildren)) {
            await storage.setItem(KEYS.CHILDREN, normalizedChildren);
          }
        } else {
          if (childListRef.current.length > 0) {
            applyChildren([]);
          }
          if (selectedChildIdRef.current !== undefined) {
            applySelectedChildId(undefined);
          }
          if (lastSelectedId) {
            await storage.removeItem(KEYS.LAST_SELECTED_CHILD_ID);
          }
        }

        setIsLoading(false);
      }),
    [applyChildren, applySelectedChildId, enqueue]
  );

  const selectChild = useCallback(
    async (id: string) => {
      applySelectedChildId(id);
      await enqueue(() => storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, id));
    },
    [applySelectedChildId, enqueue]
  );

  const addChild = useCallback(
    async (child: Child) => {
      const next = applyChildren((prev) => [...prev, normalizeChild(child)]);
      applySelectedChildId(child.id);

      await enqueue(async () => {
        await storage.setItem(KEYS.CHILDREN, next);
        await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, child.id);
      });
    },
    [applyChildren, applySelectedChildId, enqueue]
  );

  const updateChild = useCallback(
    async (id: string, updates: Partial<Child>) => {
      const next = applyChildren((prev) =>
        prev.map((c) => (c.id === id ? normalizeChild({ ...c, ...updates }) : c))
      );

      await enqueue(() => storage.setItem(KEYS.CHILDREN, next));
    },
    [applyChildren, enqueue]
  );

  const removeChild = useCallback(
    async (id: string) => {
      const wasSelected = selectedChildIdRef.current === id;
      const next = applyChildren((prev) => prev.filter((c) => c.id !== id));

      let persistSelection: (() => Promise<void>) | undefined;

      if (wasSelected && next.length > 0) {
        const nextSelectedId = next[0].id;
        applySelectedChildId(nextSelectedId);
        persistSelection = () => storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, nextSelectedId);
      } else if (next.length === 0) {
        applySelectedChildId(undefined);
        persistSelection = () => storage.removeItem(KEYS.LAST_SELECTED_CHILD_ID);
      }

      await enqueue(async () => {
        await storage.setItem(KEYS.CHILDREN, next);
        await persistSelection?.();
      });
    },
    [applyChildren, applySelectedChildId, enqueue]
  );

  const addStars = useCallback(
    async (childId: string, amount: number) => {
      const next = applyChildren((prev) =>
        prev.map((c) => (c.id === childId ? { ...c, stars: c.stars + amount } : c))
      );

      await enqueue(() => storage.setItem(KEYS.CHILDREN, next));
    },
    [applyChildren, enqueue]
  );

  const deductStars = useCallback(
    async (childId: string, amount: number) => {
      const next = applyChildren((prev) =>
        prev.map((c) => (c.id === childId ? { ...c, stars: Math.max(0, c.stars - amount) } : c))
      );

      await enqueue(() => storage.setItem(KEYS.CHILDREN, next));
    },
    [applyChildren, enqueue]
  );

  const syncToday = useCallback(() => {
    const currentIso = getLocalIsoDate();
    setTodayIso((previous) => (previous === currentIso ? previous : currentIso));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Foreground: pull the roster back in (another surface may have written while
  // we slept) and re-check the local day. The interval only runs while active.
  useEffect(() => {
    let dayTimer: ReturnType<typeof setInterval> | null = null;

    const startDayTimer = () => {
      if (dayTimer !== null) return;
      dayTimer = setInterval(syncToday, DAY_CHECK_INTERVAL_MS);
    };

    const stopDayTimer = () => {
      if (dayTimer === null) return;
      clearInterval(dayTimer);
      dayTimer = null;
    };

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state !== "active") {
        stopDayTimer();
        return;
      }

      syncToday();
      startDayTimer();
      void reload();
    };

    if (AppState.currentState === "active") {
      startDayTimer();
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      stopDayTimer();
      subscription.remove();
    };
  }, [reload, syncToday]);

  // Revalidate on navigation. Onboarding and "Daten zurücksetzen" write the
  // children key directly, so a route change is the cheapest safe moment to
  // notice it — the reload is a no-op for state when nothing changed on disk.
  const pathname = usePathname();
  const revalidatedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (revalidatedPathRef.current === null) {
      // The mount load above already covers the first route.
      revalidatedPathRef.current = pathname;
      return;
    }

    if (revalidatedPathRef.current === pathname) return;

    revalidatedPathRef.current = pathname;
    void reload();
  }, [pathname, reload]);

  const selectedChild = useMemo(
    () => childList.find((c) => c.id === selectedChildId),
    [childList, selectedChildId]
  );

  const value = useMemo<ChildrenContextValue>(
    () => ({
      children: childList,
      selectedChild,
      selectedChildId,
      isLoading,
      todayIso,
      selectChild,
      addChild,
      updateChild,
      removeChild,
      addStars,
      deductStars,
      setChildren: applyChildren,
      reload,
    }),
    [
      addChild,
      addStars,
      applyChildren,
      childList,
      deductStars,
      isLoading,
      reload,
      removeChild,
      selectChild,
      selectedChild,
      selectedChildId,
      todayIso,
      updateChild,
    ]
  );

  return <ChildrenContext.Provider value={value}>{children}</ChildrenContext.Provider>;
}

export function useChildrenContext(): ChildrenContextValue {
  const context = useContext(ChildrenContext);

  if (context === null) {
    throw new Error("useChildren must be used within a ChildrenProvider");
  }

  return context;
}
