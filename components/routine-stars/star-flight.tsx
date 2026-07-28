import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Star } from "@/lib/icons";
import { durations, easings } from "@/lib/motion";
import { semanticColors } from "@/lib/theme";
import type { StarFlightPoint } from "@/contexts/star-flight-target";

/** Disc diameter of the flying star. */
const STAR_DIAMETER = 28;
const STAR_ICON_SIZE = 16;

/**
 * Progress → travelled fraction. The star shoots out of the row (30 % of the
 * way in the first 18 % of the time), floats for a beat, then gets vacuumed
 * into the counter — "ease-out launch, slight ease-in landing" without a
 * hand-rolled bezier.
 */
const TRAVEL_IN: readonly number[] = [0, 0.18, 0.55, 1];
const TRAVEL_OUT: readonly number[] = [0, 0.3, 0.55, 1];

/** How far the arc bows past the straight line, as a share of the distance. */
const ARC_RATIO = 0.3;
const ARC_MIN = 28;
const ARC_MAX = 78;
/** Keeps the apex of the lob on screen when the pill sits near the top edge. */
const ARC_TOP_INSET = 8;

/** Full turns the star makes on the way up — pure decoration, transform only. */
const SPIN_DEGREES = 200;

/** Comet tail: the same star, lagging in progress and dimmed. */
interface TrailSpec {
  lag: number;
  peakScale: number;
  maxOpacity: number;
  fadeStart: number;
}

const TRAIL: readonly TrailSpec[] = [
  { lag: 0.11, peakScale: 0.92, maxOpacity: 0.16, fadeStart: 0.6 },
  { lag: 0.055, peakScale: 1.04, maxOpacity: 0.32, fadeStart: 0.7 },
];

const HEAD: TrailSpec = { lag: 0, peakScale: 1.2, maxOpacity: 1, fadeStart: 0.86 };

/** Quadratic-bezier control point + endpoints, resolved once per flight. */
interface FlightGeometry {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  ctrlX: number;
  ctrlY: number;
}

export interface StarFlightOrigin extends StarFlightPoint {
  /** Disc tint — usually the routine accent. Defaults to the gold token. */
  color?: string;
}

/**
 * Hands a star to whoever owns the overlay.
 *
 * Returns `true` when a flight was actually mounted. `false` means the header
 * pill has not been measured yet (or no overlay is mounted) and the caller
 * should play its own local fallback instead.
 */
export type StarFlightLauncher = (origin: StarFlightOrigin) => boolean;

const StarFlightLauncherContext = createContext<StarFlightLauncher | null>(null);

/**
 * Bridges the screen-level overlay to deeply nested task rows without
 * prop-drilling through every intermediate card. Rows still accept an explicit
 * `onStarFlight` prop — that one wins when both are present.
 */
export function StarFlightLauncherProvider({
  launch,
  children,
}: {
  launch: StarFlightLauncher;
  children: React.ReactNode;
}) {
  return (
    <StarFlightLauncherContext.Provider value={launch}>
      {children}
    </StarFlightLauncherContext.Provider>
  );
}

/** `null` outside a provider — always handle that by skipping the flight. */
export function useStarFlightLauncher(): StarFlightLauncher | null {
  return useContext(StarFlightLauncherContext);
}

function useFlightStyle(
  progress: SharedValue<number>,
  geometry: FlightGeometry,
  spec: TrailSpec
) {
  const { lag, peakScale, maxOpacity, fadeStart } = spec;

  return useAnimatedStyle(() => {
    const raw = Math.max(0, progress.value - lag);
    const t = interpolate(raw, TRAVEL_IN, TRAVEL_OUT, Extrapolation.CLAMP);
    const inverse = 1 - t;

    // Quadratic bezier: a lob that overshoots above the pill and drops in.
    const x =
      inverse * inverse * geometry.fromX +
      2 * inverse * t * geometry.ctrlX +
      t * t * geometry.toX;
    const y =
      inverse * inverse * geometry.fromY +
      2 * inverse * t * geometry.ctrlY +
      t * t * geometry.toY;

    return {
      opacity: interpolate(
        t,
        [0, 0.07, fadeStart, 1],
        [0, maxOpacity, maxOpacity, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        { translateX: x - STAR_DIAMETER / 2 },
        { translateY: y - STAR_DIAMETER / 2 },
        // Pops on launch, shrinks as it "falls into" the counter.
        { scale: interpolate(t, [0, 0.12, 1], [0.72, peakScale, 0.6], Extrapolation.CLAMP) },
        { rotate: `${t * SPIN_DEGREES}deg` },
      ],
    };
  });
}

function StarFlightBody({
  progress,
  geometry,
  spec,
  color,
}: {
  progress: SharedValue<number>;
  geometry: FlightGeometry;
  spec: TrailSpec;
  color: string;
}) {
  const animatedStyle = useFlightStyle(progress, geometry, spec);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.node, { backgroundColor: color }, animatedStyle]}
    >
      <Star size={STAR_ICON_SIZE} color={semanticColors.card} fill={semanticColors.card} />
    </Animated.View>
  );
}

export interface StarFlightProps {
  /** Window coordinates of the tapped row's star badge (its centre). */
  from: StarFlightPoint;
  /** Window coordinates of the header star pill (its centre). */
  to: StarFlightPoint;
  /** Disc tint — usually the routine accent. */
  color?: string;
  /** Fired once, on landing (or immediately under reduced motion). */
  onDone: () => void;
}

/**
 * One star arcing from a task row into the header counter.
 *
 * Renders absolutely positioned nodes in window space — mount it inside a
 * `StyleSheet.absoluteFill` overlay at the screen root, above the scroll view.
 * Everything is `transform` + `opacity`, driven by a single linear clock whose
 * shaping lives in the interpolation tables above.
 *
 * Reduced motion: nothing is drawn and `onDone` fires on the next tick, so the
 * caller's bookkeeping stays identical either way.
 */
export function StarFlight({ from, to, color, onDone }: StarFlightProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const hasFinished = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    onDoneRef.current();
  }, []);

  const geometry = useMemo<FlightGeometry>(() => {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const arc = Math.min(ARC_MAX, Math.max(ARC_MIN, distance * ARC_RATIO));

    return {
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
      ctrlX: from.x + deltaX * 0.16,
      ctrlY: Math.max(ARC_TOP_INSET, Math.min(from.y, to.y) - arc),
    };
  }, [from.x, from.y, to.x, to.y]);

  useEffect(() => {
    if (reduceMotion) {
      finish();
      return;
    }

    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        // The clock is linear on purpose — the physicality comes from the
        // travel curve and the arc, not from the driver.
        duration: durations.celebration,
        easing: easings.linear,
        reduceMotion: ReduceMotion.System,
      },
      (completed) => {
        if (completed) {
          runOnJS(finish)();
        }
      }
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [finish, progress, reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  const discColor = color ?? semanticColors.goldDeep;

  return (
    <>
      {TRAIL.map((spec) => (
        <StarFlightBody
          key={spec.lag}
          progress={progress}
          geometry={geometry}
          spec={spec}
          color={discColor}
        />
      ))}
      <StarFlightBody
        progress={progress}
        geometry={geometry}
        spec={HEAD}
        color={discColor}
      />
    </>
  );
}

const styles = StyleSheet.create({
  node: {
    position: "absolute",
    left: 0,
    top: 0,
    width: STAR_DIAMETER,
    height: STAR_DIAMETER,
    borderRadius: STAR_DIAMETER / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
