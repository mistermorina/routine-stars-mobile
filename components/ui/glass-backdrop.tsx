import React from "react";
import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getSurfaceTokens, type SurfaceLevel } from "@/lib/design-mode";
import { getThemePalette, semanticColors } from "@/lib/theme";

/**
 * Drop-in fill for a container that used to carry `bg-card`.
 *
 * Renders the frosted stack in glass mode and a plain white fill otherwise, so
 * a call site only has to drop its background class and mount this as the
 * first child. The parent needs `overflow-hidden` and a radius; this layer
 * inherits both by filling it absolutely.
 */
export function GlassBackdrop({ level = "flat" }: { level?: SurfaceLevel }) {
  const { designMode } = useDesignMode();
  const tokens = getSurfaceTokens(designMode, getThemePalette(null), level);
  const isGlass = tokens.blurIntensity > 0;

  if (!isGlass) {
    return (
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: semanticColors.card }]}
      />
    );
  }

  return (
    <>
      <BlurView
        intensity={tokens.blurIntensity}
        tint="light"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: tokens.backgroundColor }]}
      />
    </>
  );
}
