import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  indicatorClassName?: string;
}

export function Progress({
  value,
  className,
  indicatorClassName,
}: ProgressProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(100, Math.max(0, value)), {
      duration: 400,
    });
  }, [value, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      className={cn("h-3 w-full overflow-hidden rounded-full bg-secondary", className)}
    >
      <Animated.View
        className={cn("h-full rounded-full bg-primary", indicatorClassName)}
        style={animatedStyle}
      />
    </View>
  );
}
