import React, { useId } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { getBlob, type HueId } from "@/lib/gradients";

/**
 * The soft colour bloom in the upper third of a screen.
 *
 * SVG rather than a blurred circle: the app already carries ~30 BlurView
 * instances on a loaded dashboard, and this is one rasterized native view with
 * no blur cost. The same Defs/Stop pattern (and the useId collision guard) is
 * already used by soft-hero-wash.tsx.
 *
 * Alpha is capped per hue in lib/gradients — violet and magenta go dark fast,
 * and secondary text sits over this.
 */
export function RadialBlob({ hue }: { hue: HueId }) {
  const { width, height } = useWindowDimensions();
  const gradientId = useId();
  const blob = getBlob(hue);

  return (
    <Svg
      width={width}
      height={height}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <RadialGradient id={gradientId} cx="55%" cy="30%" r="65%">
          <Stop offset="0" stopColor={blob.color} stopOpacity={blob.maxAlpha} />
          <Stop offset="0.55" stopColor={blob.color} stopOpacity={blob.maxAlpha * 0.45} />
          <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={`url(#${gradientId})`} />
    </Svg>
  );
}
