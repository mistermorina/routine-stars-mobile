import { Easing, FadeIn, FadeInDown, ReduceMotion } from "react-native-reanimated";

/**
 * Central motion tokens (see docs/ai/DESIGN_DIRECTION.md).
 * playful/bouncy = child-facing flows, gentle = parent-facing flows.
 * Every preset carries ReduceMotion.System; decorative loops must
 * additionally gate via hooks/use-reduced-motion.
 */
export const springs = {
  playful: { damping: 12, stiffness: 250, mass: 1, reduceMotion: ReduceMotion.System },
  bouncy: { damping: 9, stiffness: 220, mass: 1, reduceMotion: ReduceMotion.System },
  gentle: { damping: 20, stiffness: 180, mass: 1, reduceMotion: ReduceMotion.System },
  press: { damping: 15, stiffness: 300, mass: 1, reduceMotion: ReduceMotion.System },
} as const;

export const durations = {
  fast: 150,
  base: 250,
  slow: 400,
  celebration: 700,
} as const;

export const easings = {
  out: Easing.out(Easing.cubic),
  inOut: Easing.inOut(Easing.quad),
  linear: Easing.linear,
} as const;

export const timings = {
  fast: { duration: durations.fast, easing: easings.out, reduceMotion: ReduceMotion.System },
  base: { duration: durations.base, easing: easings.out, reduceMotion: ReduceMotion.System },
  slow: { duration: durations.slow, easing: easings.out, reduceMotion: ReduceMotion.System },
} as const;

/** Staggered card/list entrance. Usage: entering={enterStagger(index)} */
export function enterStagger(index: number, baseDelay = 40) {
  return FadeInDown.duration(320)
    .delay(index * baseDelay)
    .reduceMotion(ReduceMotion.System);
}

/** Plain fade for content that should not move. */
export function enterFade(delay = 0) {
  return FadeIn.duration(durations.base).delay(delay).reduceMotion(ReduceMotion.System);
}
