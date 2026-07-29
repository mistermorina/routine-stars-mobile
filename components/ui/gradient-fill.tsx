import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getCtaGradient, type HueId } from "@/lib/gradients";

/**
 * The CTA gradient as a drop-in layer for surfaces that are not `Button` —
 * the hero pill, the redeem button, the timer play control. They are
 * `PressableScale`s with their own fill, so they cannot inherit Button's
 * treatment.
 *
 * Mount it as the first child of a surface that has `overflow-hidden` and a
 * transparent background. Renders nothing outside glass mode, so call sites
 * keep their soft-mode fill untouched.
 */
export function GradientFill({ hue }: { hue?: HueId }) {
  const { designMode } = useDesignMode();

  if (designMode !== "glass") return null;

  const { from, to } = getCtaGradient(hue);

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      pointerEvents="none"
      style={StyleSheet.absoluteFillObject}
    />
  );
}
