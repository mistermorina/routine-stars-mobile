import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { shadowPresets } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Soft pulsing placeholder block for loading states. */
export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 700, reduceMotion: ReduceMotion.System }),
        withTiming(0.5, { duration: 700, reduceMotion: ReduceMotion.System })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={cn("rounded-tile bg-muted", className)}
      style={animatedStyle}
    />
  );
}

interface SkeletonTextProps {
  /** Number of placeholder lines. The last one is rendered short. */
  lines?: number;
  className?: string;
  /** Per-line sizing, e.g. "h-4" for body copy or "h-6" for headlines. */
  lineClassName?: string;
}

/**
 * Text block placeholder. Match `lineClassName` to the real copy's height so
 * the layout does not jump when the content lands.
 */
export function SkeletonText({ lines = 3, className, lineClassName }: SkeletonTextProps) {
  const count = Math.max(1, Math.floor(lines));

  return (
    <View className={cn("gap-2", className)}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4 w-full rounded-chip",
            index === count - 1 && count > 1 && "w-2/3",
            lineClassName
          )}
        />
      ))}
    </View>
  );
}

interface SkeletonCircleProps {
  /** Sizing classes, e.g. "h-12 w-12". Defaults to a 48pt avatar. */
  className?: string;
}

/** Round placeholder for avatars, icon squircles and star badges. */
export function SkeletonCircle({ className }: SkeletonCircleProps) {
  return <Skeleton className={cn("h-12 w-12 rounded-full", className)} />;
}

interface SkeletonCardProps {
  /** Layout classes for the card shell (margins, height, flex). */
  className?: string;
  /** Drop the leading circle for text-only cards. */
  showAvatar?: boolean;
  /** Copy lines inside the card. */
  lines?: number;
}

/**
 * Card-shaped placeholder that mirrors the standard list row: icon squircle on
 * the left, two lines of copy on the right. Use one per expected row.
 */
export function SkeletonCard({ className, showAvatar = true, lines = 2 }: SkeletonCardProps) {
  return (
    <View
      className={cn("flex-row items-center gap-3 rounded-card bg-card p-4", className)}
      style={shadowPresets.shadowSubtle}
    >
      {showAvatar ? <SkeletonCircle className="h-[52px] w-[52px] rounded-tile" /> : null}
      <SkeletonText lines={lines} className="flex-1" />
    </View>
  );
}
