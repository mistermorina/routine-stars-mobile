import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Star } from "lucide-react-native";

const NUM_STARS = 40;
const COLORS = ["#F3E5AB", "#87CEEB", "#F8E9D7", "#FFD700"];

interface StarParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  color: string;
}

function ConfettiStar({ particle }: { particle: StarParticle }) {
  const { height } = Dimensions.get("window");
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(height + 50, {
        duration: particle.duration,
        easing: Easing.linear,
      })
    );

    rotate.value = withDelay(
      particle.delay,
      withTiming(particle.rotation, {
        duration: particle.duration,
        easing: Easing.linear,
      })
    );

    opacity.value = withDelay(
      particle.delay + particle.duration * 0.7,
      withTiming(0, {
        duration: particle.duration * 0.3,
        easing: Easing.linear,
      })
    );
  }, [
    height,
    opacity,
    particle.delay,
    particle.duration,
    particle.rotation,
    rotate,
    translateY,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: `${particle.x}%` as any,
          top: -50,
          width: particle.size,
          height: particle.size,
        },
        animatedStyle,
      ]}
    >
      <Star
        size={particle.size}
        fill={particle.color}
        color="transparent"
      />
    </Animated.View>
  );
}

export function Confetti({ colors = COLORS }: { colors?: string[] }) {
  const particles = useMemo<StarParticle[]>(() => {
    return Array.from({ length: NUM_STARS }, (_, i) => ({
      id: i,
      x: Math.random() * 95,
      delay: Math.random() * 1500,
      duration: 3000 + Math.random() * 2000,
      rotation: -360 + Math.random() * 720,
      size: 12 + Math.random() * 16,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [colors]);

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}
      pointerEvents="none"
    >
      {particles.map((particle) => (
        <ConfettiStar key={particle.id} particle={particle} />
      ))}
    </View>
  );
}
