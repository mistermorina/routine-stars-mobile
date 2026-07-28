import React, { useEffect, useRef } from "react";
import { type LayoutChangeEvent, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { springs, timings } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Brief overshoot when the bar lands on 100%. */
const MILESTONE_POP = 1.04;

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  indicatorClassName?: string;
  indicatorColor?: string;
  trackStyle?: ViewStyle;
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value)) / 100;
}

/**
 * Determinate progress bar.
 *
 * The fill is an absolutely positioned, full-width bar that is scaled on the X
 * axis instead of having its `width` animated — `width` is a layout property
 * and cannot run on the UI thread. `translateX` compensates for the fact that
 * RN scales around a view's center, which re-anchors the fill to the left edge:
 * a view of width `w` scaled by `p` has to move back by `w * (1 - p) / 2`.
 *
 * Reaching 100% adds a short pop on the track. That is decorative, so it is
 * gated on `useReducedMotion` on top of the presets' `ReduceMotion.System`.
 */
export function Progress({
  value,
  className,
  indicatorClassName,
  indicatorColor,
  trackStyle,
}: ProgressProps) {
  const reduceMotion = useReducedMotion();
  const target = clampRatio(value);

  const progress = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const pop = useSharedValue(1);
  const wasComplete = useRef(target >= 1);

  useEffect(() => {
    progress.value = withSpring(target, springs.gentle);
  }, [progress, target]);

  useEffect(() => {
    const isComplete = target >= 1;
    const justCompleted = isComplete && !wasComplete.current;
    wasComplete.current = isComplete;

    if (!justCompleted || reduceMotion) return;

    pop.value = withSequence(
      withTiming(MILESTONE_POP, timings.fast),
      withSpring(1, springs.playful)
    );
  }, [pop, reduceMotion, target]);

  const fillStyle = useAnimatedStyle(() => {
    const width = trackWidth.value;

    // Before the first layout pass the compensation distance is unknown —
    // stay collapsed rather than flashing a centered bar for one frame.
    if (width === 0) {
      return { transform: [{ scaleX: 0 }] };
    }

    const ratio = progress.value;

    return {
      transform: [
        { translateX: -(width * (1 - ratio)) / 2 },
        { scaleX: ratio },
      ],
    };
  });

  const trackPopStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
  }));

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  return (
    <Animated.View
      className={cn("h-3 w-full overflow-hidden rounded-full bg-secondary", className)}
      style={[trackStyle, trackPopStyle]}
      onLayout={handleTrackLayout}
    >
      <Animated.View
        className={cn("absolute inset-0 rounded-full bg-primary", indicatorClassName)}
        style={[indicatorColor ? { backgroundColor: indicatorColor } : null, fillStyle]}
      />
    </Animated.View>
  );
}
