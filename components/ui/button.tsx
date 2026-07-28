import React from "react";
import {
  Pressable,
  Text,
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

import { triggerFeedback } from "@/lib/feedback";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens } from "@/lib/design-mode";
import { getThemePalette } from "@/lib/theme";

/**
 * The Pressable itself is animated instead of being wrapped in an extra view:
 * every caller's layout class (`flex-1`, `w-full`, `mt-4`, `self-start`) stays
 * on the node the parent lays out, so nothing about sizing changes. Reanimated
 * resolves the animated style before the props reach the inner RN Pressable,
 * which means NativeWind still applies `className` and the `active:` variants.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Touch-down shrink. A button is a large surface, so it travels less than a chip. */
const PRESS_SCALE = 0.97;

const buttonVariants = {
  default: "bg-primary active:bg-primary/80",
  destructive: "bg-destructive active:bg-destructive/80",
  outline: "border border-border bg-card active:bg-secondary",
  secondary: "bg-secondary active:bg-secondary/80",
  ghost: "active:bg-secondary",
  link: "",
} as const;

const buttonSizes = {
  default: "h-12 px-5 py-0",
  sm: "h-11 px-4 py-0",
  lg: "h-14 px-6 py-0",
  icon: "h-11 w-11",
} as const;

const textVariants = {
  default: "text-primary-foreground font-body-semibold text-base",
  destructive: "text-destructive-foreground font-body-semibold text-base",
  outline: "text-foreground font-body-semibold text-base",
  secondary: "text-secondary-foreground font-body-semibold text-base",
  ghost: "text-foreground font-body-semibold text-base",
  link: "text-primary font-body-semibold text-base underline",
} as const;

// Roomier line height centers Poppins glyphs inside the fixed-height button
// (tight line boxes make the ascender-heavy font sit visibly high).
const textSizes = {
  default: "text-base leading-[22px]",
  sm: "text-base leading-[22px]",
  lg: "text-base leading-[22px]",
  icon: "text-base leading-[22px]",
} as const;

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  /**
   * Built-in touch-down tick. Set `false` when the press handler already fires
   * its own semantic event (`reward_redeemed`, `mission_complete`, …) so the
   * user does not feel two haptics for one tap.
   */
  haptic?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  className,
  textClassName,
  style,
  haptic = true,
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const { designMode } = useDesignMode();
  const accents = getAccentTokens(designMode, getThemePalette(null));
  const isGlassPrimary = designMode === "glass" && variant === "default";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (event: GestureResponderEvent) => {
    if (!disabled) {
      scale.value = withSpring(PRESS_SCALE, springs.press);

      if (haptic) {
        // lib/feedback has no dedicated "button_press" event; `theme_preview`
        // is the generic selection tick (Haptics.selectionAsync) and carries no
        // sound, so it is the correct primitive-level acknowledgement.
        void triggerFeedback("theme_preview", { disableSound: true });
      }
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    scale.value = withSpring(1, springs.press);
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...props}
      className={cn(
        "flex-row items-center justify-center rounded-lg",
        // Glass mode paints the primary fill itself (azure), so the pastel
        // class is dropped for that one variant.
        isGlassPrimary ? "" : buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[isGlassPrimary ? { backgroundColor: accents.accent } : null, style, animatedStyle]}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            isGlassPrimary ? "font-body-semibold text-base text-white" : textVariants[variant],
            textSizes[size],
            textClassName
          )}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.88}
          style={{ includeFontPadding: false }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
