import React, { useEffect } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  ReduceMotion,
  type SharedValue,
} from "react-native-reanimated";
import { Sparkles, Star } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easings, enterStagger, modalSpring, timings } from "@/lib/motion";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme } from "@/lib/types";
import routineCompleteBackground from "@/assets/images/task-success-bg.png";
import routineCompleteHero from "@/assets/images/reward-star-gift-soft.png";

interface RoutineCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  childTheme?: ChildTheme;
}

const RING_PARTICLES = [
  { type: "star", left: 2, top: 34, size: 17, color: "#F7B633" },
  { type: "sparkle", left: 22, top: 8, size: 15, color: "#8BCDEB" },
  { type: "pill", left: 138, top: 24, width: 20, rotate: "18deg", color: "#F2A6CA" },
  { type: "star", left: 150, top: 72, size: 14, color: "#B9AAF2" },
  { type: "sparkle", left: 126, top: 4, size: 14, color: "#F7B633" },
  { type: "dot", left: 10, top: 94, size: 8, color: "#8BCDEB" },
  { type: "dot", left: 148, top: 110, size: 8, color: "#F7B633" },
  { type: "pill", left: 0, top: 116, width: 18, rotate: "-26deg", color: "#A793F4" },
] as const;

type RingParticleSpec = (typeof RING_PARTICLES)[number];

/** One full orbit of the shared particle clock. Decorative loop — gated below. */
const ORBIT_PERIOD_MS = 4200;
/** Orbit radii: barely a nudge, just enough to make the ring feel alive. */
const ORBIT_RADIUS_X = 4;
const ORBIT_RADIUS_Y = 6;
/** Sway added on top of each particle's resting rotation (degrees). */
const ORBIT_WOBBLE_DEG = 7;

/** Hero star: half-period of the pulse and the legs of the wobble. */
const HERO_PULSE_MS = durations.slow;
const HERO_WOBBLE_MS = durations.base;
const HERO_WOBBLE_ACROSS_MS = durations.base * 2;

function RingParticle({
  particle,
  index,
  clock,
  animate,
}: {
  particle: RingParticleSpec;
  index: number;
  clock: SharedValue<number>;
  animate: boolean;
}) {
  // Every particle rides the same clock, offset by its own phase — one
  // animation driving eight elements instead of eight competing timers.
  const phase = index / RING_PARTICLES.length;
  const baseRotateDeg = particle.type === "pill" ? parseFloat(particle.rotate) : 0;

  const animatedStyle = useAnimatedStyle(() => {
    if (!animate) {
      return {
        opacity: 1,
        transform: [
          { translateX: 0 },
          { translateY: 0 },
          { rotate: `${baseRotateDeg}deg` },
          { scale: 1 },
        ],
      };
    }

    const angle = (clock.value + phase) * 2 * Math.PI;
    const pulse = 0.5 + 0.5 * Math.sin(angle * 2);

    return {
      opacity: 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(angle)),
      transform: [
        { translateX: Math.cos(angle) * ORBIT_RADIUS_X },
        { translateY: Math.sin(angle) * ORBIT_RADIUS_Y },
        { rotate: `${baseRotateDeg + Math.sin(angle) * ORBIT_WOBBLE_DEG}deg` },
        { scale: 0.9 + 0.18 * pulse },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", left: particle.left, top: particle.top },
        animatedStyle,
      ]}
    >
      {particle.type === "star" ? (
        <Star size={particle.size} color={particle.color} fill={particle.color} />
      ) : particle.type === "sparkle" ? (
        <Sparkles size={particle.size} color={particle.color} />
      ) : particle.type === "dot" ? (
        <View
          style={{
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: particle.color,
          }}
        />
      ) : (
        <View
          style={{
            width: particle.width,
            height: 7,
            borderRadius: 999,
            backgroundColor: particle.color,
          }}
        />
      )}
    </Animated.View>
  );
}

/**
 * Confetti ring around the hero. Purely decorative, so the orbit is dropped
 * entirely under reduced motion and the particles render at their resting pose.
 */
function CelebrationRing({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const clock = useSharedValue(0);
  const animate = active && !reduceMotion;

  useEffect(() => {
    if (!animate) {
      cancelAnimation(clock);
      clock.value = 0;
      return;
    }

    clock.value = 0;
    clock.value = withRepeat(
      withTiming(1, {
        duration: ORBIT_PERIOD_MS,
        easing: easings.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(clock);
    };
  }, [animate, clock]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 170,
        height: 138,
        left: "50%",
        marginLeft: -85,
        top: 0,
      }}
    >
      {RING_PARTICLES.map((particle, index) => (
        <RingParticle
          key={index}
          particle={particle}
          index={index}
          clock={clock}
          animate={animate}
        />
      ))}
    </View>
  );
}

export function RoutineCompleteDialog({
  isOpen,
  onClose,
  childTheme,
}: RoutineCompleteDialogProps) {
  const router = useRouter();
  const palette = getThemePalette(childTheme);
  const reduceMotion = useReducedMotion();
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableDialogHeight = Math.max(1, screenHeight - insets.top - insets.bottom - 32);
  const dialogMaxHeight = Math.min(520, screenHeight * 0.88, availableDialogHeight);
  const dialogFooterHeight = 124;
  const dialogBodyMaxHeight = Math.max(180, dialogMaxHeight - dialogFooterHeight);

  const starScale = useSharedValue(1);
  const starRotate = useSharedValue(0);
  const cardLift = useSharedValue(12);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isOpen) {
      cancelAnimation(starScale);
      cancelAnimation(starRotate);
      starScale.value = 1;
      starRotate.value = 0;
      cardLift.value = 12;
      cardOpacity.value = 0;
      return;
    }

    cardLift.value = withSpring(0, modalSpring);
    cardOpacity.value = withTiming(1, timings.base);

    // The hero pulse is an infinite decorative loop — never start it when the
    // system asks for reduced motion.
    if (reduceMotion) {
      starScale.value = 1;
      starRotate.value = 0;
      return;
    }

    starScale.value = withRepeat(
      withSequence(
        withTiming(1.3, {
          duration: HERO_PULSE_MS,
          easing: easings.out,
          reduceMotion: ReduceMotion.System,
        }),
        withTiming(1, {
          duration: HERO_PULSE_MS,
          easing: easings.inOut,
          reduceMotion: ReduceMotion.System,
        })
      ),
      -1,
      true
    );
    starRotate.value = withRepeat(
      withSequence(
        withTiming(15, { duration: HERO_WOBBLE_MS, reduceMotion: ReduceMotion.System }),
        withTiming(-15, { duration: HERO_WOBBLE_ACROSS_MS, reduceMotion: ReduceMotion.System }),
        withTiming(0, { duration: HERO_WOBBLE_MS, reduceMotion: ReduceMotion.System })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(starScale);
      cancelAnimation(starRotate);
    };
  }, [cardLift, cardOpacity, isOpen, reduceMotion, starRotate, starScale]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: starScale.value },
      { rotate: `${starRotate.value}deg` },
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardLift.value }],
    opacity: cardOpacity.value,
  }));

  const handleViewRewards = () => {
    onClose();
    router.push("/(tabs)/rewards");
  };

  return (
    <Dialog visible={isOpen} onClose={onClose}>
      <Animated.View style={cardAnimatedStyle}>
        <DialogContent
          className="items-center overflow-hidden rounded-[30px] border p-0"
          style={{
            backgroundColor: "#FFF9F0",
            borderColor: "rgba(255,255,255,0.9)",
            maxHeight: dialogMaxHeight,
            padding: 0,
            shadowColor: "#2E3A68",
            shadowOpacity: 0.18,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 14 },
          }}
        >
          <Image
            source={routineCompleteBackground}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={160}
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(255,255,255,0.08)" },
            ]}
          />

          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            className="w-full"
            style={{ maxHeight: dialogBodyMaxHeight }}
            contentContainerStyle={{
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 12,
            }}
          >
            {/* The dialog is a Modal, so it remounts on every open — the
                staggered entrance replays each time the routine is finished. */}
            <Animated.View entering={enterStagger(0)}>
              <View
                className="mb-3 rounded-full px-3.5 py-2"
                style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
              >
                <Text
                  className="text-xs font-body-bold uppercase tracking-[1px]"
                  style={{ color: palette.accentText }}
                >
                  Routine komplett
                </Text>
              </View>
            </Animated.View>

            <Animated.View
              entering={enterStagger(1)}
              className="mb-2 h-[130px] w-full items-center justify-center"
            >
              <CelebrationRing active={isOpen} />
              <Animated.View style={starAnimatedStyle}>
                <Image
                  source={routineCompleteHero}
                  style={{ width: 132, height: 132 }}
                  contentFit="contain"
                  transition={160}
                />
              </Animated.View>
            </Animated.View>

            <Animated.View entering={enterStagger(2)}>
              <DialogHeader className="items-center">
                <DialogTitle className="text-center text-[38px] leading-[44px] text-[#071A49]">
                  Super!
                </DialogTitle>
                <DialogDescription className="mt-2 max-w-[270px] text-center text-[16px] leading-6">
                  Alle Aufgaben geschafft. Die Sterne sind gesichert.
                </DialogDescription>
              </DialogHeader>
            </Animated.View>
          </ScrollView>

          <View className="w-full gap-3 px-5 pb-5 pt-2">
            <Animated.View entering={enterStagger(3)}>
              <Button
                onPress={handleViewRewards}
                className="h-12 w-full rounded-[20px]"
                style={{ backgroundColor: palette.button }}
                textClassName="text-white"
              >
                <Text className="text-base font-body-semibold text-center text-white">
                  Belohnungen ansehen
                </Text>
              </Button>
            </Animated.View>
            <Animated.View entering={enterStagger(4)}>
              <Button
                variant="outline"
                onPress={onClose}
                className="h-12 w-full rounded-[20px]"
                style={{ borderColor: palette.accent }}
              >
                <Text className="text-base font-body-semibold text-center" style={{ color: palette.accent }}>
                  Sterne sichern
                </Text>
              </Button>
            </Animated.View>
          </View>
        </DialogContent>
      </Animated.View>
    </Dialog>
  );
}
