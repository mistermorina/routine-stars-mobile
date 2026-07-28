import React from "react";
import { StyleSheet, View, Text, type TextStyle, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getSurfaceTokens } from "@/lib/design-mode";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * `tailwind-merge` only knows Tailwind's built-in radius scale, so it cannot
 * resolve `rounded-card` against a caller's `rounded-[30px]` — both classes
 * would survive the merge and the winner would depend on stylesheet order.
 * Detecting a caller-supplied radius keeps every existing call site pixel-exact
 * while un-overridden cards get the design-system radius.
 */
const HAS_RADIUS_CLASS = /(?:^|\s)rounded-/;

export function Card({ className, children, style }: CardProps) {
  const { designMode } = useDesignMode();
  const hasRadiusOverride = className ? HAS_RADIUS_CLASS.test(className) : false;
  const isGlass = designMode === "glass";

  if (isGlass) {
    // Glass tokens are palette-independent, so the default palette is fine —
    // the frosted look comes from what shows through, not from a tint.
    const tokens = getSurfaceTokens("glass", getThemePalette(null), "flat");
    // Call sites paint their own opaque fill (palette.heroSurface and friends).
    // In glass mode the surface belongs to the mode, so the caller's background
    // and border colour are dropped — everything else they pass is kept.
    const { backgroundColor: _ignoredFill, borderColor: _ignoredBorder, ...callerStyle } =
      StyleSheet.flatten(style) ?? {};

    return (
      <View
        className={cn(
          "overflow-hidden p-4",
          hasRadiusOverride ? undefined : "rounded-card",
          className
        )}
        style={[
          callerStyle,
          tokens.shadow,
          {
            borderWidth: tokens.borderWidth,
            borderColor: tokens.borderColor,
            backgroundColor: "transparent",
          },
        ]}
      >
        <BlurView
          intensity={tokens.blurIntensity}
          tint="light"
          pointerEvents="none"
          style={StyleSheet.absoluteFillObject}
        />
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: tokens.backgroundColor }]}
        />
        {children}
      </View>
    );
  }

  return (
    <View
      className={cn(
        "border border-border bg-card p-4 shadow-sm",
        hasRadiusOverride ? undefined : "rounded-card",
        className
      )}
      style={style}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <View className={cn("mb-3", className)}>
      {children}
    </View>
  );
}

export function CardTitle({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  style?: TextStyle;
}) {
  return (
    <Text className={cn("text-xl font-headline text-card-foreground", className)} style={style}>
      {children}
    </Text>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text className={cn("mt-1 text-base font-body leading-6 text-muted-foreground", className)}>
      {children}
    </Text>
  );
}

export function CardContent({ className, children }: CardProps) {
  return <View className={cn("", className)}>{children}</View>;
}

export function CardFooter({ className, children }: CardProps) {
  return (
    <View className={cn("flex-row items-center mt-4 pt-4", className)}>
      {children}
    </View>
  );
}
