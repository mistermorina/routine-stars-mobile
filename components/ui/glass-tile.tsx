import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens } from "@/lib/design-mode";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ChildTheme } from "@/lib/types";

interface GlassTileProps {
  children: React.ReactNode;
  theme?: ChildTheme | string | null;
  /** Pill variant reads as "selected"; tile is the neutral icon holder. */
  variant?: "tile" | "pill";
  className?: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** Overrides the fill in soft mode only — glass owns its own material. */
  softFill?: string;
}

/**
 * The little filled square behind an icon (and the active tab pill).
 *
 * Soft mode paints a flat pastel fill. Glass mode makes it a small frosted
 * pane with a bright top edge, so icons feel set into the same material as the
 * cards instead of sitting on coloured stickers.
 */
export function GlassTile({
  children,
  theme,
  variant = "tile",
  className,
  style,
  radius = 14,
  softFill,
}: GlassTileProps) {
  const { designMode } = useDesignMode();
  const palette = getThemePalette(theme);
  const tokens = getAccentTokens(designMode, palette);
  const isGlass = tokens.tileBlurIntensity > 0;

  // `softFill` is the caller's pastel — it must not leak into glass, where the
  // fill is the material itself.
  const fill =
    variant === "pill"
      ? tokens.pillFill
      : isGlass
        ? tokens.tileFill
        : softFill ?? tokens.tileFill;
  const border = variant === "pill" ? tokens.pillBorder : tokens.tileBorder;

  return (
    <View
      className={cn("items-center justify-center overflow-hidden", className)}
      style={[
        {
          borderRadius: radius,
          backgroundColor: isGlass ? "transparent" : fill,
          borderWidth: border ? 1 : 0,
          borderColor: border ?? undefined,
        },
        style,
      ]}
    >
      {isGlass ? (
        <>
          <BlurView
            intensity={tokens.tileBlurIntensity}
            tint="light"
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: fill }]}
          />
          {tokens.tileHighlight ? (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: radius * 0.45,
                right: radius * 0.45,
                height: 1,
                backgroundColor: tokens.tileHighlight,
              }}
            />
          ) : null}
        </>
      ) : null}
      {children}
    </View>
  );
}
