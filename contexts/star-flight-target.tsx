import React, { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { View } from "react-native";

/** Center point of the star pill in absolute window coordinates. */
export interface StarFlightPoint {
  x: number;
  y: number;
}

/** Full measured rect, for flights that also scale into the pill. */
export interface StarFlightRect extends StarFlightPoint {
  width: number;
  height: number;
}

interface StarFlightTargetContextValue {
  registerNode: (node: View | null) => void;
  measureTarget: () => void;
  getTargetRect: () => StarFlightRect | null;
}

const StarFlightTargetContext = createContext<StarFlightTargetContextValue | null>(null);

function scheduleMeasure(measure: () => void) {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(measure);
    return;
  }
  measure();
}

/**
 * Coordinate registry for the "star flies into the counter" effect.
 *
 * Holds nothing but the last measured position of the header star pill, so any
 * screen can launch a star toward it without prop-drilling refs. Contains no
 * animation and triggers no re-renders — everything lives in refs.
 *
 * Mount once, above the tabs/stack (e.g. in app/_layout.tsx).
 */
export function StarFlightTargetProvider({ children }: { children: React.ReactNode }) {
  const nodeRef = useRef<View | null>(null);
  const rectRef = useRef<StarFlightRect | null>(null);

  const measureTarget = useCallback(() => {
    const node = nodeRef.current;

    if (!node || typeof node.measureInWindow !== "function") {
      return;
    }

    node.measureInWindow((x, y, width, height) => {
      // The pill may have unmounted while the async measure was in flight.
      if (nodeRef.current !== node) {
        return;
      }

      if (![x, y, width, height].every((n) => Number.isFinite(n)) || width <= 0 || height <= 0) {
        return;
      }

      rectRef.current = { x: x + width / 2, y: y + height / 2, width, height };
    });
  }, []);

  const registerNode = useCallback(
    (node: View | null) => {
      nodeRef.current = node;

      if (!node) {
        rectRef.current = null;
        return;
      }

      // Measure once the current layout pass has flushed.
      scheduleMeasure(measureTarget);
    },
    [measureTarget]
  );

  const getTargetRect = useCallback(() => rectRef.current, []);

  const value = useMemo<StarFlightTargetContextValue>(
    () => ({ registerNode, measureTarget, getTargetRect }),
    [getTargetRect, measureTarget, registerNode]
  );

  return (
    <StarFlightTargetContext.Provider value={value}>{children}</StarFlightTargetContext.Provider>
  );
}

/**
 * For the header star pill. Attach `ref` to the pill's <View> and call
 * `measure()` from its `onLayout` (and after header collapse animations).
 *
 * ```tsx
 * const starTarget = useRegisterStarFlightTarget();
 * <View ref={starTarget.ref} onLayout={starTarget.measure} className="...">…</View>
 * ```
 *
 * Safe without a provider: both members become no-ops.
 */
export function useRegisterStarFlightTarget() {
  const context = useContext(StarFlightTargetContext);

  const ref = useCallback(
    (node: View | null) => {
      context?.registerNode(node);
    },
    [context]
  );

  const measure = useCallback(() => {
    context?.measureTarget();
  }, [context]);

  return useMemo(() => ({ ref, measure }), [measure, ref]);
}

/**
 * For anything that launches a star (task rows, reward redeem, mission cards).
 * `getTarget()` returns the pill's center in window coordinates, or null when
 * the pill is not mounted/measured yet — always handle null by skipping the
 * flight and updating the counter directly.
 */
export function useStarFlightTarget() {
  const context = useContext(StarFlightTargetContext);

  const getTarget = useCallback((): StarFlightPoint | null => {
    const rect = context?.getTargetRect() ?? null;
    return rect ? { x: rect.x, y: rect.y } : null;
  }, [context]);

  const getTargetRect = useCallback(
    (): StarFlightRect | null => context?.getTargetRect() ?? null,
    [context]
  );

  return useMemo(() => ({ getTarget, getTargetRect }), [getTarget, getTargetRect]);
}
