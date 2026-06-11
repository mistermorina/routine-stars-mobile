import React, { useEffect } from "react";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
