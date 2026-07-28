import {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  ReduceMotion,
} from "react-native-reanimated";

/**
 * Central motion tokens (see docs/ai/DESIGN_DIRECTION.md).
 * playful/bouncy = child-facing flows, gentle = parent-facing flows.
 * Every preset carries ReduceMotion.System; decorative loops must
 * additionally gate via hooks/use-reduced-motion.
 */
export const springs = {
  /** Star pop, check-mark, reward unlock — child-facing "yes!" moments. */
  playful: { damping: 12, stiffness: 250, mass: 1, reduceMotion: ReduceMotion.System },
  /** Celebration overshoot: confetti trigger, level-up badge, mascot bounce. */
  bouncy: { damping: 9, stiffness: 220, mass: 1, reduceMotion: ReduceMotion.System },
  /** Parent-facing / structural motion: cards settling, progress, chips. */
  gentle: { damping: 20, stiffness: 180, mass: 1, reduceMotion: ReduceMotion.System },
  /** Touch-down shrink. Prefer <PressableScale> over re-implementing this. */
  press: { damping: 15, stiffness: 300, mass: 1, reduceMotion: ReduceMotion.System },
  /** Centered dialog card lift-in (canonized from routine-complete-dialog). */
  modal: { damping: 14, stiffness: 180, mass: 1, reduceMotion: ReduceMotion.System },
  /** Bottom-sheet / full-screen modal content settle (from task-timer-modal). */
  sheet: { damping: 15, stiffness: 200, mass: 1, reduceMotion: ReduceMotion.System },
} as const;

/** Alias: dialog card entrance. Use with withSpring(0, modalSpring). */
export const modalSpring = springs.modal;
/** Alias: sheet/modal content entrance. Use with withSpring(1, sheetSpring). */
export const sheetSpring = springs.sheet;
/** Alias: press-in/press-out scale. Use with withSpring(0.96, pressSpring). */
export const pressSpring = springs.press;

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
  /** Micro-feedback: opacity flips, chip tint changes. */
  fast: { duration: durations.fast, easing: easings.out, reduceMotion: ReduceMotion.System },
  /** Default for anything the user is looking at while it moves. */
  base: { duration: durations.base, easing: easings.out, reduceMotion: ReduceMotion.System },
  /** Progress rings, count-ups, longer travel. */
  slow: { duration: durations.slow, easing: easings.out, reduceMotion: ReduceMotion.System },
} as const;

/** Entrance travel distance for FadeInDown-based presets (px). */
const ENTER_OFFSET_Y = 14;

/**
 * Staggered card/list entrance. Usage: `entering={enterStagger(index)}` on an
 * Animated.View inside a mapped list. Creates a fresh builder per call
 * (Reanimated builders are stateful and must not be shared between nodes).
 * The cumulative delay is capped so long lists never feel laggy.
 */
export function enterStagger(index: number, baseDelay = 40, maxDelay = 240) {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const delay = Math.min(safeIndex * baseDelay, maxDelay);

  return FadeInDown.duration(durations.slow - 80)
    .delay(delay)
    .withInitialValues({ transform: [{ translateY: ENTER_OFFSET_Y }] })
    .reduceMotion(ReduceMotion.System);
}

/** Plain fade for content that should not move (headers, hero copy, empty states). */
export function enterFade(delay = 0) {
  return FadeIn.duration(durations.base).delay(delay).reduceMotion(ReduceMotion.System);
}

/**
 * Exit fade for conditionally rendered content (toasts, inline errors, chips).
 * Usage: `exiting={exitFade()}` — pairs with enterFade().
 */
export function exitFade(delay = 0) {
  return FadeOut.duration(durations.fast).delay(delay).reduceMotion(ReduceMotion.System);
}

/**
 * Exit for elements that arrived with enterStagger/enterFade and should leave
 * downward (list rows being removed, sheets, dismissed cards).
 * Usage: `exiting={exitSlideDown()}`.
 */
export function exitSlideDown(delay = 0) {
  return FadeOutDown.duration(durations.base).delay(delay).reduceMotion(ReduceMotion.System);
}
