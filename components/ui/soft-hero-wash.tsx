import React, { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

interface SoftHeroWashProps {
  surfaceColor: string;
  baseColor: string;
  holdOffset?: string;
}

export function SoftHeroWash({
  surfaceColor,
  baseColor,
  holdOffset = "56%",
}: SoftHeroWashProps) {
  const gradientId = `softHeroWash${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={surfaceColor} stopOpacity={0.98} />
            <Stop offset={holdOffset} stopColor={surfaceColor} stopOpacity={0.88} />
            <Stop offset="100%" stopColor={baseColor} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}
