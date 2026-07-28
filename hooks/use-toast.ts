import { useCallback, useSyncExternalStore } from "react";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export type ToastOptions = Omit<ToastData, "id">;

export interface ToastHandle {
  id: string;
  dismiss: () => void;
}

const AUTO_DISMISS_MS = 3000;
/** Older toasts drop off the stack instead of piling up over the content. */
const MAX_VISIBLE_TOASTS = 3;

/*
 * Module-level store. Toasts used to live in component state, so `toast()` only
 * showed up where a local <ToastOverlay /> happened to be rendered. The store
 * lets any component fire a toast that the single <ToastHost /> in
 * app/_layout.tsx renders — the hook API is unchanged.
 */
let currentToasts: ToastData[] = [];
let toastCount = 0;

const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function setToasts(next: ToastData[]) {
  currentToasts = next;
  emit();
}

function clearTimer(id: string) {
  const timer = timers.get(id);
  if (timer === undefined) return;

  clearTimeout(timer);
  timers.delete(id);
}

/** Removes a single toast, or all of them when called without an id. */
export function dismissToast(id?: string) {
  if (id === undefined) {
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();

    if (currentToasts.length > 0) {
      setToasts([]);
    }
    return;
  }

  clearTimer(id);

  if (!currentToasts.some((entry) => entry.id === id)) return;
  setToasts(currentToasts.filter((entry) => entry.id !== id));
}

/** Queues a toast from anywhere — components, hooks or plain modules. */
export function toast({ title, description, variant = "default" }: ToastOptions): ToastHandle {
  const id = `toast-${++toastCount}`;
  const next = [...currentToasts, { id, title, description, variant }];
  const visible = next.slice(-MAX_VISIBLE_TOASTS);

  // Anything pushed off the stack must not fire its auto-dismiss later.
  for (const dropped of next.slice(0, next.length - visible.length)) {
    clearTimer(dropped.id);
  }

  setToasts(visible);
  timers.set(
    id,
    setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
  );

  return { id, dismiss: () => dismissToast(id) };
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentToasts;
}

/**
 * `const { toast, toasts, dismiss } = useToast()` — unchanged API.
 * `toasts` is only needed by <ToastHost />; every other screen just calls
 * `toast({ title, description?, variant? })`.
 */
export function useToast() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const dismiss = useCallback((id?: string) => {
    dismissToast(id);
  }, []);

  return { toasts, toast, dismiss };
}
