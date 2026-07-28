import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getSurfaceTokens, type SurfaceLevel } from "@/lib/design-mode";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ChildTheme } from "@/lib/types";

interface SurfaceProps {
  children: React.ReactNode;
  theme?: ChildTheme | string | null;
  level?: SurfaceLevel;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Corner radius in px — needed on the blur pane, which cannot inherit it. */
  radius?: number;
}

/**
 * A panel that renders as an opaque card or a frosted pane depending on the
 * active design mode, so screens can be written once and judged in both looks.
 *
 * In glass mode the stack is: blur pane → translucent fill → top hairline →
 * content. The blur has to be a sibling behind the content rather than a
 * wrapper, because BlurView clips oddly when it also lays out children.
 */
export function Surface({
  children,
  theme,
  level = "flat",
  className,
  style,
  radius = 22,
}: SurfaceProps) {
  const { designMode } = useDesignMode();
  const palette = getThemePalette(theme);
  const tokens = getSurfaceTokens(designMode, palette, level);
  const isGlass = tokens.blurIntensity > 0;

  return (
    <View
      className={cn("overflow-hidden", className)}
      style={[
        {
          borderRadius: radius,
          borderWidth: tokens.borderWidth,
          borderColor: tokens.borderColor,
          backgroundColor: isGlass ? "transparent" : tokens.backgroundColor,
        },
        tokens.shadow,
        style,
      ]}
    >
      {isGlass ? (
        <>
          <BlurView
            intensity={tokens.blurIntensity}
            tint="light"
            pointerEvents="none"
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: tokens.backgroundColor },
            ]}
          />
          {tokens.highlightColor ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: radius * 0.6,
                right: radius * 0.6,
                height: 1,
                backgroundColor: tokens.highlightColor,
              }}
            />
          ) : null}
        </>
      ) : null}
      {children}
    </View>
  );
}
