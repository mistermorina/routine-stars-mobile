import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  ReduceMotion,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Star, Check, Play, getIcon } from "@/lib/icons";
import { getThemePalette, semanticColors } from "@/lib/theme";
import { durations, easings, springs, timings } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useStarFlightLauncher, type StarFlightLauncher } from "./star-flight";
import type { ChildTheme, Task } from "@/lib/types";

const SWIPE_THRESHOLD = -80;

/** Travel of the local fallback star when no header target is available. */
const LOCAL_STAR_LIFT = -80;
const LOCAL_STAR_POP_MS = 200;
const LOCAL_STAR_FADE_MS = durations.celebration - LOCAL_STAR_POP_MS;
/**
 * Releases the row if neither the overlay flight nor the local star ever
 * reports back (detached view, cancelled animation) — a task must never stay
 * permanently un-tappable.
 */
const SETTLE_WATCHDOG_MS = durations.celebration + 200;

interface TaskItemProps {
  task: Task;
  routineColor?: string;
  childTheme?: ChildTheme;
  isSuggested?: boolean;
  onComplete: (bonusStars?: number) => void;
  onStartTimer: (task: Task) => void;
  /**
   * Hands the row's star to a screen-level overlay so it can fly into the
   * header counter. Receives the window-space centre of this row's star badge
   * and must return `true` when it took the flight; `false` (or no handler at
   * all) makes the row play its own local star instead.
   *
   * Takes precedence over the `StarFlightLauncherProvider` context.
   */
  onStarFlight?: StarFlightLauncher;
}

export function TaskItem({
  task,
  routineColor,
  childTheme,
  isSuggested = false,
  onComplete,
  onStartTimer,
  onStarFlight,
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLocalStar, setShowLocalStar] = useState(false);
  const reduceMotion = useReducedMotion();
  const palette = getThemePalette(childTheme);
  const contextLauncher = useStarFlightLauncher();
  const launchStarFlight = onStarFlight ?? contextLauncher;

  /** Measured at press time so the overlay knows where the star comes from. */
  const starAnchorRef = useRef<View | null>(null);
  const isMountedRef = useRef(true);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local fallback star
  const starTranslateY = useSharedValue(0);
  const starOpacity = useSharedValue(0);
  const starScale = useSharedValue(1);

  // Row press animation
  const rowScale = useSharedValue(1);
  const attentionScale = useSharedValue(1);

  // Swipe animation
  const translateX = useSharedValue(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setIsCompleted(task.completed);
    if (task.completed) {
      setIsAnimating(false);
      translateX.value = withTiming(0, timings.base);
    }
  }, [task.completed, translateX]);

  useEffect(() => {
    if (reduceMotion || !isSuggested || isCompleted || isAnimating) {
      attentionScale.value = 1;
      return;
    }

    attentionScale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [attentionScale, isAnimating, isCompleted, isSuggested, reduceMotion]);

  const finishAnimation = () => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    if (!isMountedRef.current) return;
    setIsCompleted(true);
    setIsAnimating(false);
    setShowLocalStar(false);
  };

  /** No header pill to aim at: the star pops out of the row and fades. */
  const runLocalStarFlight = () => {
    if (!isMountedRef.current) return;

    if (reduceMotion) {
      finishAnimation();
      return;
    }

    setShowLocalStar(true);
    starOpacity.value = 1;
    starScale.value = 1.4;
    starTranslateY.value = 0;

    starTranslateY.value = withTiming(LOCAL_STAR_LIFT, {
      duration: durations.celebration,
      easing: easings.out,
      reduceMotion: ReduceMotion.System,
    });

    starScale.value = withSequence(
      withTiming(1.6, { duration: LOCAL_STAR_POP_MS, reduceMotion: ReduceMotion.System }),
      withSpring(0.5, springs.playful)
    );

    starOpacity.value = withSequence(
      withTiming(1, { duration: LOCAL_STAR_POP_MS, reduceMotion: ReduceMotion.System }),
      withTiming(
        0,
        {
          duration: LOCAL_STAR_FADE_MS,
          easing: easings.out,
          reduceMotion: ReduceMotion.System,
        },
        () => {
          runOnJS(finishAnimation)();
        }
      )
    );
  };

  /**
   * Measures this row's star badge and asks the screen overlay to fly it into
   * the header counter. Falls back to the local star when the badge cannot be
   * measured or the overlay has no target yet.
   */
  const startStarFlight = () => {
    const anchor = starAnchorRef.current;

    if (reduceMotion || !launchStarFlight || typeof anchor?.measureInWindow !== "function") {
      runLocalStarFlight();
      return;
    }

    anchor.measureInWindow((x, y, width, height) => {
      const isMeasured =
        [x, y, width, height].every((value) => Number.isFinite(value)) &&
        width > 0 &&
        height > 0;

      const launched =
        isMeasured &&
        launchStarFlight({
          x: x + width / 2,
          y: y + height / 2,
          color: routineColor,
        });

      if (launched) {
        // The star now lives in the overlay — the row can flip to "done" at
        // once, so the badge visibly leaves the row behind.
        finishAnimation();
        return;
      }

      runLocalStarFlight();
    });
  };

  const handlePress = () => {
    if (isAnimating) return;

    // Completed tasks stay tappable so the dashboard can offer same-day undo
    if (isCompleted) {
      onComplete();
      return;
    }

    // If task has timer, delegate to timer modal
    if (task.timerInMinutes && task.timerInMinutes > 0) {
      onStartTimer(task);
      return;
    }

    setIsAnimating(true);
    // Before any measuring or animation work: the dashboard fires the haptic
    // on the very first line of its handler, so the tap answers instantly.
    onComplete();

    watchdogRef.current = setTimeout(finishAnimation, SETTLE_WATCHDOG_MS);
    startStarFlight();
  };

  const handlePressIn = () => {
    if (!isCompleted && !isAnimating) {
      rowScale.value = withSpring(0.97, springs.press);
    }
  };

  const handlePressOut = () => {
    rowScale.value = withSpring(1, springs.press);
  };

  // Swipe-left gesture
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -120);
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        // Same completion path as a tap, so the swipe launches the same flight.
        runOnJS(handlePress)();
        translateX.value = withTiming(0, timings.fast);
      } else {
        translateX.value = withSpring(0, springs.gentle);
      }
    })
    .enabled(!isCompleted && !isAnimating);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: starTranslateY.value },
      { scale: starScale.value },
    ],
    opacity: starOpacity.value,
  }));

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rowScale.value * attentionScale.value }],
  }));

  const swipeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const Icon = getIcon(task.iconName);
  const hasTimer = task.timerInMinutes && task.timerInMinutes > 0;
  const hasBonus = task.bonusStars && task.bonusStars > 0;

  const starColor = routineColor || "#737373";
  const taskSurface = isCompleted
    ? "#FFFFFF"
    : isSuggested
      ? palette.heroSurface
      : "#FFFFFF";
  const taskAccessibilityLabel = isCompleted
    ? `${task.title}, erledigt`
    : hasTimer
      ? `${task.title}, Timer starten`
      : `${task.title}, Aufgabe erledigen`;
  const taskAccessibilityHint = isCompleted
    ? "Doppeltippen zum Zurücknehmen."
    : hasTimer
      ? "Öffnet den Timer für diese Aufgabe."
      : "Tippen oder nach links wischen, um die Aufgabe zu erledigen.";

  return (
    <View className="relative">
      {/* Local fallback star (used when the header counter is not measurable) */}
      {showLocalStar && !hasTimer && (
        <Animated.View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            {
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 20,
            },
            starAnimatedStyle,
          ]}
        >
          <View
            className="rounded-full p-1.5"
            style={{ backgroundColor: routineColor || semanticColors.gold }}
          >
            <Star size={16} fill={semanticColors.card} color={semanticColors.card} />
          </View>
        </Animated.View>
      )}

      {/* Swipe backdrop with overflow hidden */}
      <View
        style={{
          overflow: "hidden",
          borderRadius: 18,
          backgroundColor: taskSurface,
        }}
      >
        {/* "Erledigt" backdrop revealed on swipe (only for incomplete tasks) */}
        {!isCompleted && (
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 120,
              backgroundColor: routineColor || "#22c55e",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Check size={24} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 12, marginTop: 2, fontWeight: "600" }} numberOfLines={1}>
              Erledigt
            </Text>
          </View>
        )}

        {/* Swipeable + tappable row */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={swipeAnimatedStyle}>
            <Pressable
              onPress={handlePress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isAnimating}
              accessibilityRole="button"
              accessibilityLabel={taskAccessibilityLabel}
              accessibilityHint={taskAccessibilityHint}
              accessibilityState={{ disabled: isAnimating, checked: isCompleted }}
            >
              <Animated.View
            style={[
                  rowAnimatedStyle,
                  {
                    alignSelf: "stretch",
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 18,
                    backgroundColor: taskSurface,
                    borderWidth: 1,
                    borderColor: isCompleted
                      ? "rgba(157,184,216,0.28)"
                      : isSuggested
                        ? palette.accentBorder
                        : "#EAF1F7",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    shadowColor: "#9DB8D8",
                    shadowOpacity: 0.11,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 6 },
                    width: "100%",
                  },
                ]}
              >
                {/* Icon squircle */}
                <View
                  className="mr-3 h-[52px] w-[52px] items-center justify-center rounded-tile"
                  style={{
                    backgroundColor: isCompleted || isSuggested ? palette.tabActiveBg : palette.surface,
                  }}
                >
                  <Icon
                    size={26}
                    color={isCompleted ? starColor : routineColor || "#737373"}
                  />
                </View>

                {/* Title + reward chip */}
                <View className="flex-1 min-w-0 pr-3">
                  <Text
                    className="text-base font-body-semibold leading-6 text-foreground"
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <View className="mt-1 flex-row items-center gap-1.5">
                    <View className="flex-row items-center gap-1">
                      {/* Launch point of the star flight — measured on press. */}
                      <View ref={starAnchorRef} collapsable={false}>
                        <Star size={12} color="#F7A313" fill="#F7A313" />
                      </View>
                      <Text className="text-sm font-body-semibold" style={{ color: "#B97E0B" }}>
                        +{task.stars}
                      </Text>
                    </View>
                    {hasTimer && !isCompleted ? (
                      <Text className="text-sm font-body text-muted-foreground" numberOfLines={1}>
                        · {task.timerInMinutes} Min.{hasBonus ? ` · +${task.bonusStars} Bonus` : ""}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Status affordance: check / play / open ring */}
                {isCompleted ? (
                  <View
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#4FD17A" }}
                  >
                    <Check size={22} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : hasTimer ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      onStartTimer(task);
                    }}
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: palette.button }}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Timer für ${task.title} starten`}
                  >
                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                  </Pressable>
                ) : (
                  <View
                    className="h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderWidth: 2,
                      borderColor: routineColor || palette.accentBorder,
                    }}
                  />
                )}
              </Animated.View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
