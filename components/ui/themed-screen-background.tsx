import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { PawPrint, Sparkles, Star } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { getBackgroundSkinOption } from "@/lib/background-skins";
import { getThemePalette } from "@/lib/theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { BackgroundSkinId, ChildTheme } from "@/lib/types";

interface FloatingShapeProps {
  delay: number;
  duration: number;
  amplitude: number;
  children?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

function FloatingShape({
  delay,
  duration,
  amplitude,
  children,
  className,
  style,
}: FloatingShapeProps) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    if (reduceMotion) {
      translateY.value = 0;
      return;
    }

    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-amplitude, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(amplitude, {
            duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [amplitude, delay, duration, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      className={cn("absolute", className)}
      style={[animatedStyle, style]}
      pointerEvents="none"
    >
      {children}
    </Animated.View>
  );
}

export function ThemedScreenBackground({
  theme,
  backgroundSkin,
  children,
  className,
}: {
  theme?: ChildTheme | string | null;
  backgroundSkin?: BackgroundSkinId | string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const palette = getThemePalette(theme);
  const skin = getBackgroundSkinOption(backgroundSkin);
  const hasSkin = skin.id !== "none" && Boolean(skin.image);

  const renderMotif = () => {
    if (theme === "tiere") {
      return (
        <>
          <FloatingShape
            delay={0}
            duration={6200}
            amplitude={8}
            className="left-[-24px] top-24 h-36 w-36 rounded-full"
            style={{ backgroundColor: palette.motifPrimary, opacity: 0.38 }}
          />
          <FloatingShape
            delay={180}
            duration={7000}
            amplitude={10}
            className="right-[-40px] top-40 h-48 w-48 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.24 }}
          />
          <FloatingShape
            delay={320}
            duration={7400}
            amplitude={6}
            className="right-8 top-28"
          >
            <PawPrint size={32} color={palette.accentStrong} strokeWidth={1.75} />
          </FloatingShape>
        </>
      );
    }

    if (theme === "galaxy") {
      return (
        <>
          <FloatingShape
            delay={0}
            duration={6800}
            amplitude={8}
            className="left-[-32px] top-16 h-40 w-40 rounded-full"
            style={{ backgroundColor: palette.motifPrimary, opacity: 0.38 }}
          />
          <FloatingShape
            delay={220}
            duration={7600}
            amplitude={10}
            className="right-[-24px] top-28 h-52 w-52 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.24 }}
          />
          <FloatingShape
            delay={360}
            duration={7200}
            amplitude={5}
            className="left-10 top-36"
          >
            <Sparkles size={28} color={palette.chartSecondary} strokeWidth={1.8} />
          </FloatingShape>
        </>
      );
    }

    return (
      <>
        <FloatingShape
          delay={0}
          duration={6200}
          amplitude={8}
          className="left-[-24px] top-20 h-36 w-36 rounded-full"
          style={{ backgroundColor: palette.motifPrimary, opacity: 0.38 }}
        />
        <FloatingShape
          delay={240}
          duration={7000}
          amplitude={10}
          className="right-[-30px] top-32 h-48 w-48 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.22 }}
        />
        <FloatingShape
          delay={420}
          duration={7600}
          amplitude={6}
          className="left-6 top-32"
        >
          <Star size={28} color={palette.chartPrimary} fill={palette.chartPrimary} />
        </FloatingShape>
      </>
    );
  };

  return (
    <View className={cn("flex-1 overflow-hidden", className)} style={{ backgroundColor: palette.backgroundBase }}>
      <View
        className="absolute inset-x-0 top-0 h-[320px]"
        style={{ backgroundColor: palette.screenGradient[0], opacity: 0.65 }}
      />
      <View
        className="absolute left-10 top-24 h-64 w-64 rounded-full"
        style={{ backgroundColor: palette.screenGradient[1], opacity: 0.26 }}
      />
      <View
        className="absolute bottom-10 right-[-40px] h-72 w-72 rounded-full"
        style={{ backgroundColor: palette.screenGradient[2], opacity: 0.22 }}
      />
      {hasSkin ? (
        <>
          <Image
            source={skin.image}
            contentFit="cover"
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                opacity: skin.imageOpacity,
              },
            ]}
            transition={160}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: palette.backgroundBase,
                opacity: 0.08,
              },
            ]}
          />
        </>
      ) : (
        renderMotif()
      )}
      <View className="flex-1">{children}</View>
    </View>
  );
}
