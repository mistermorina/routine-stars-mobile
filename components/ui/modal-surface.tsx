import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getModalTokens } from "@/lib/design-mode";
import { cn } from "@/lib/utils";

interface ModalSurfaceProps {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}

/**
 * The panel of a dialog or sheet.
 *
 * Soft mode is a plain white card. Glass mode frosts the dimmed backdrop
 * behind it at a high fill opacity, so the panel stays bright enough for body
 * text while still reading as the same material as the rest of the surface.
 */
export function ModalSurface({ children, className, style, radius = 24 }: ModalSurfaceProps) {
  const { designMode } = useDesignMode();
  const tokens = getModalTokens(designMode);
  const isGlass = tokens.blurIntensity > 0;

  return (
    <View
      className={cn("overflow-hidden", className)}
      style={[
        {
          borderRadius: radius,
          backgroundColor: isGlass ? "transparent" : tokens.backgroundColor,
          borderWidth: isGlass ? 1 : 0,
          borderColor: isGlass ? tokens.borderColor : undefined,
        },
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
            style={[StyleSheet.absoluteFillObject, { backgroundColor: tokens.backgroundColor }]}
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

/** Backdrop tint that matches the active mode. */
export function useModalBackdropColor(): string {
  const { designMode } = useDesignMode();
  return getModalTokens(designMode).backdropColor;
}
