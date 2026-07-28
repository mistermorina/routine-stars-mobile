import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Star } from "@/lib/icons";
import { easings } from "@/lib/motion";
import { getThemePalette } from "@/lib/theme";

/**
 * One burst, one clock.
 *
 * Every particle interpolates the same `progress` shared value instead of
 * owning three timings of its own, and every particle config is generated
 * once at module scope from a deterministic hash — so a burst costs one
 * animation driver plus N pure worklets, not 3N racing animations.
 *
 * Physics: each piece is launched upward, decelerates into an apex, then
 * falls with gravity while drifting sideways (air drag ease-out) and swaying.
 */
const PARTICLE_COUNT = 24;
const BURST_DURATION_MS = 1600;
/** Launch height as a fraction of the screen — low enough to read as a burst. */
const DEFAULT_ORIGIN_Y = 0.64;
/** How much of the clock is spent staggering the launches. */
const MAX_LAUNCH_OFFSET = 0.16;
const SWAY_TURNS = 1.6;
const TAU = Math.PI * 2;
const DEFAULT_COLORS = getThemePalette().celebrationColors;

type ParticleShape = "star" | "chip" | "dot";

interface ConfettiParticle {
  id: number;
  shape: ParticleShape;
  size: number;
  /** Horizontal launch offset from screen center, as a fraction of width. */
  startX: number;
  /** Total horizontal travel by the end of the flight, as a fraction of width. */
  drift: number;
  /** Sideways sway amplitude in px. */
  sway: number;
  swayPhase: number;
  /** Initial vertical velocity (screen heights per unit of normalized time). */
  vy0: number;
  /** Gravity (screen heights per unit of normalized time squared). */
  gravity: number;
  spin: number;
  spin0: number;
  /** Position on the master clock where this particle leaves the muzzle. */
  launchAt: number;
  colorIndex: number;
}

/** Deterministic 0..1 hash — the same burst every mount, zero RNG per frame. */
function noise(index: number, salt: number) {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function range(index: number, salt: number, min: number, max: number) {
  return min + noise(index, salt) * (max - min);
}

function shapeFor(index: number): ParticleShape {
  if (index % 5 === 0) return "star";
  if (index % 3 === 0) return "dot";
  return "chip";
}

const PARTICLES: ConfettiParticle[] = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
  // Apex height + apex time fully describe the parabola: v0 = -2h/tp, g = 2h/tp².
  const rise = range(index, 1, 0.3, 0.56);
  const peakAt = range(index, 2, 0.3, 0.42);
  const side = index % 2 === 0 ? 1 : -1;

  return {
    id: index,
    shape: shapeFor(index),
    size: Math.round(range(index, 3, 9, 17)),
    startX: side * range(index, 4, 0.02, 0.2),
    drift: side * range(index, 5, 0.08, 0.46),
    sway: range(index, 6, 4, 13),
    swayPhase: range(index, 7, 0, TAU),
    vy0: (-2 * rise) / peakAt,
    gravity: (2 * rise) / (peakAt * peakAt),
    spin: side * range(index, 8, 140, 620),
    spin0: range(index, 9, 0, 180),
    launchAt: range(index, 10, 0, MAX_LAUNCH_OFFSET),
    colorIndex: index,
  };
});

interface ConfettiPieceProps {
  particle: ConfettiParticle;
  color: string;
  progress: SharedValue<number>;
  width: number;
  height: number;
  originY: number;
}

function ConfettiPiece({
  particle,
  color,
  progress,
  width,
  height,
  originY,
}: ConfettiPieceProps) {
  const {
    shape,
    size,
    startX,
    drift,
    sway,
    swayPhase,
    vy0,
    gravity,
    spin,
    spin0,
    launchAt,
  } = particle;

  const pieceWidth = shape === "dot" ? size * 0.7 : size;
  const pieceHeight = shape === "chip" ? size * 0.58 : pieceWidth;
  const left = width * (0.5 + startX) - pieceWidth / 2;
  const top = height * originY - pieceHeight / 2;

  const animatedStyle = useAnimatedStyle(() => {
    const raw = (progress.value - launchAt) / (1 - launchAt);
    const t = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    // Sideways travel decelerates (air drag); vertical travel is pure ballistics.
    const spread = 1 - (1 - t) * (1 - t);
    const translateX = drift * width * spread + Math.sin(t * SWAY_TURNS * TAU + swayPhase) * sway;
    const translateY = (vy0 * t + 0.5 * gravity * t * t) * height;

    return {
      opacity: interpolate(t, [0, 0.06, 0.72, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX },
        { translateY },
        { rotate: `${spin0 + spin * t}deg` },
        { scale: interpolate(t, [0, 0.1, 0.26], [0.3, 1.15, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left,
          top,
          width: pieceWidth,
          height: pieceHeight,
          borderRadius: shape === "dot" ? pieceWidth : shape === "chip" ? 3 : 0,
          backgroundColor: shape === "star" ? "transparent" : color,
        },
        animatedStyle,
      ]}
    >
      {shape === "star" ? <Star size={size} fill={color} color="transparent" /> : null}
    </Animated.View>
  );
}

interface ConfettiProps {
  /** Particle palette — pass `palette.celebrationColors` for theme-matched bursts. */
  colors?: string[];
  /** Launch point as a fraction of the screen height (0 = top, 1 = bottom). */
  originY?: number;
}

export function Confetti({ colors, originY = DEFAULT_ORIGIN_Y }: ConfettiProps) {
  const reduceMotion = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const activeColors = useMemo(
    () => (colors && colors.length > 0 ? colors : DEFAULT_COLORS),
    [colors]
  );

  useEffect(() => {
    if (reduceMotion) return;

    progress.value = 0;
    progress.value = withTiming(1, {
      duration: BURST_DURATION_MS,
      easing: easings.linear,
    });
  }, [progress, reduceMotion]);

  // Decorative only — skip entirely when the OS asks for reduced motion.
  if (reduceMotion) {
    return null;
  }

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {PARTICLES.map((particle) => (
        <ConfettiPiece
          key={particle.id}
          particle={particle}
          color={activeColors[particle.colorIndex % activeColors.length]}
          progress={progress}
          width={width}
          height={height}
          originY={originY}
        />
      ))}
    </View>
  );
}
