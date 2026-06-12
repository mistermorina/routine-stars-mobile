import React from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { springs } from "@/lib/motion";

interface PressableScaleProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  /** Styling for the animated surface (the visible element). */
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Layout styling for the outer Pressable (flex-1, self-start, …). */
  containerClassName?: string;
  containerStyle?: StyleProp<ViewStyle>;
  /** How far the surface shrinks while pressed. */
  scaleTo?: number;
}

/**
 * Pressable with a uniform spring "shrink" so every touch answers
 * the same way. Use for CTAs, chips, and icon buttons.
 */
export function PressableScale({
  children,
  className,
  style,
  containerClassName,
  containerStyle,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  disabled,
  ...pressableProps
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      scale.value = withSpring(scaleTo, springs.press);
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    scale.value = withSpring(1, springs.press);
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      className={containerClassName}
      style={[{ minHeight: 44 }, containerStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View className={className} style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
