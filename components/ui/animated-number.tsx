import React, { useEffect, useRef } from "react";
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { cssInterop } from "nativewind";
import Animated, {
  ReduceMotion,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easings } from "@/lib/motion";
import { cn } from "@/lib/utils";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// NativeWind only maps className -> style for components it registered itself.
// The animated wrapper is a brand-new component type, so register it explicitly
// (mirrors the built-in TextInput mapping in react-native-css-interop).
cssInterop(AnimatedTextInput, {
  className: { target: "style", nativeStyleToProp: { textAlign: true } },
});

/** TextInput has no public `text` prop — it is the native-only odometer channel. */
type OdometerTextProps = TextInputProps & { text?: string };

export interface AnimatedNumberProps {
  /** Target value. Changes count up/down from the previous value. */
  value: number;
  /** Poppins, size and color classes, e.g. "font-body-bold text-base text-foreground". */
  textClassName?: string;
  /** Caps Dynamic Type growth so pills/badges keep their layout. */
  maxFontSizeMultiplier?: number;
  /** Count duration; defaults to durations.slow (400ms). */
  durationMs?: number;
  /** Escape hatch for dynamic colors (theme palettes) that no static class covers. */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Odometer-style count-up number.
 *
 * Drives a native TextInput `text` prop from the UI thread via
 * `useAnimatedProps`, so the number ticks at 60fps without a single React
 * re-render. The first paint shows `value` immediately (no count-up on mount);
 * every later change animates.
 *
 * Reduced motion: jumps straight to the new value (hook + ReduceMotion.System).
 * Accessibility: the wrapper is one static element labelled with the final
 * value, so VoiceOver never reads intermediate frames.
 *
 * Usage: <AnimatedNumber value={child.stars} textClassName="font-body-bold text-base text-foreground" />
 */
export function AnimatedNumber({
  value,
  textClassName,
  maxFontSizeMultiplier = 1.4,
  durationMs = durations.slow,
  textStyle,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const target = Math.round(value);
  const count = useSharedValue(target);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      count.value = target;
      return;
    }

    if (reduceMotion) {
      count.value = target;
      return;
    }

    count.value = withTiming(target, {
      duration: durationMs,
      easing: easings.out,
      reduceMotion: ReduceMotion.System,
    });
  }, [count, durationMs, reduceMotion, target]);

  const animatedProps = useAnimatedProps<OdometerTextProps>(() => ({
    text: String(Math.round(count.value)),
  }));

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={String(target)}
      pointerEvents="none"
    >
      <AnimatedTextInput
        animatedProps={animatedProps}
        defaultValue={String(target)}
        editable={false}
        caretHidden
        contextMenuHidden
        underlineColorAndroid="transparent"
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        importantForAccessibility="no-hide-descendants"
        className={cn("font-body-bold text-base text-foreground", textClassName)}
        style={[{ padding: 0, margin: 0, includeFontPadding: false }, textStyle]}
      />
    </View>
  );
}
