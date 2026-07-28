import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  AppState,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Animated, {
  ReduceMotion,
  cancelAnimation,
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { X, Check, Award, ThumbsUp, ThumbsDown, Sparkles, Star, CircleCheckBig } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ParentGateChallenge } from "@/components/parent-gate-challenge";
import { Confetti } from "./confetti";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { triggerFeedback } from "@/lib/feedback";
import { durations, easings, modalSpring, springs, timings } from "@/lib/motion";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getModalTokens } from "@/lib/design-mode";
import { cn } from "@/lib/utils";
import type { ChildTheme, Task } from "@/lib/types";
import timerChallengeBackground from "@/assets/images/timer-challenge-bg.png";
import parentCheckBackground from "@/assets/images/parent-check-bg.png";
import taskSuccessBackground from "@/assets/images/task-success-bg.png";
import parentCheckImage from "@/assets/images/parent-check-soft.png";
import successStarImage from "@/assets/images/reward-star-gift-soft.png";
import timerMorningImage from "@/assets/images/routine-morning-sun-soft.png";
import timerEveningImage from "@/assets/images/routine-evening-moon-soft.png";
import timerHomeworkImage from "@/assets/images/routine-homework-soft.png";
import timerSportImage from "@/assets/images/routine-sport-soft.png";
import timerCleanupImage from "@/assets/images/routine-cleanup-soft.png";
import timerHygieneImage from "@/assets/images/routine-hygiene-soft.png";
import timerMealsImage from "@/assets/images/routine-meals-soft.png";
import timerDefaultImage from "@/assets/images/routine-special-soft.png";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TimerState = "running" | "confirming" | "success";

interface TaskTimerModalProps {
  task: Task | null;
  childName: string;
  childTheme?: ChildTheme;
  onClose: (success: boolean) => void;
}

const MODAL_NAVY = semanticColors.foreground;
const MODAL_MUTED = semanticColors.mutedForeground;
const MODAL_GOLD = semanticColors.goldDeep;
/**
 * Bespoke skin of the timer modal — a lavender/blue world that exists nowhere
 * else in the app and has no counterpart in the token set. Kept as named
 * constants (never inline literals) so the surface stays swappable.
 */
const MODAL_BLUE = "#2F6FDC";
const MODAL_LAVENDER_SOFT = "#F2EFFF";
const MODAL_LAVENDER_INK = "#5364A9";
const MODAL_SPARKLE = "#B9AAF2";
const MODAL_GLOW = "#DDD3FF";
const MODAL_BACKDROP = "rgba(16, 24, 48, 0.42)";

/** Card entrance scale — small enough to read as "arriving", not as a zoom. */
const CARD_ENTER_SCALE = 0.86;
/** Card exit scale — mirrors the entrance so open and close are one gesture. */
const CARD_EXIT_SCALE = 0.92;

/**
 * Dismissal timing, composed from motion tokens. Ease-in-out so the card
 * leaves with intent instead of drifting; ReduceMotion.System makes it resolve
 * instantly (and still fire its completion callback) when the OS asks for it.
 */
const CARD_EXIT_TIMING = {
  duration: durations.fast,
  easing: easings.inOut,
  reduceMotion: ReduceMotion.System,
} as const;

/** Last stretch of the countdown, where the ring is nearly closed. */
const FINAL_COUNTDOWN_SECONDS = 10;
const COUNTDOWN_PULSE_SCALE = 1.05;
/** ~800ms per beat: urgent enough to notice, calm enough for a kids app. */
const COUNTDOWN_PULSE_TIMING = {
  duration: durations.slow,
  easing: easings.inOut,
  reduceMotion: ReduceMotion.System,
} as const;

/**
 * Wall-clock resync cadence. The interval never *counts* — it only re-reads
 * `Date.now()` against the stored end timestamp, so locking the phone or
 * backgrounding the app cannot slow the countdown down.
 */
const TIMER_TICK_MS = durations.base;

/**
 * One tick of ring travel per tick of clock: same duration as the resync
 * cadence plus linear easing, so the sweep is continuous instead of stepped.
 */
const RING_TIMING = {
  duration: durations.base,
  easing: easings.linear,
  reduceMotion: ReduceMotion.System,
} as const;

/** How long the success screen stays up before the modal reports back. */
const SUCCESS_CLOSE_DELAY_MS = 2500;

function ModalBadge({ label }: { label: string }) {
  return (
    <View
      className="mb-4 rounded-full px-3.5 py-2"
      style={{ backgroundColor: MODAL_LAVENDER_SOFT }}
    >
      <Text
        className="text-xs font-body-bold uppercase tracking-[1px]"
        style={{ color: MODAL_LAVENDER_INK }}
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    </View>
  );
}

function getTimerArt(task: Task): ImageSourcePropType {
  const searchable = `${task.title} ${task.iconName}`.toLocaleLowerCase("de-DE");

  if (
    /hausaufgabe|lernen|schule|schul|lesen|buch|book|pencil|graduation|backpack/.test(
      searchable
    )
  ) {
    return timerHomeworkImage;
  }

  if (/sport|training|turnen|fußball|fussball|ball|laufen|schwimm|sneaker|shoe/.test(searchable)) {
    return timerSportImage;
  }

  if (/aufräum|aufraeum|zimmer|spielzeug|putzen|broom|home|trash|wisch/.test(searchable)) {
    return timerCleanupImage;
  }

  if (/zahn|zähne|zaehne|dusche|wasch|bad|tooth|brush|shower|bath/.test(searchable)) {
    return timerHygieneImage;
  }

  if (/essen|frühstück|fruehstueck|tisch|mittag|abendbrot|croissant|utensils|apple/.test(searchable)) {
    return timerMealsImage;
  }

  if (/abend|nacht|schlaf|moon|bed/.test(searchable)) {
    return timerEveningImage;
  }

  if (/morgen|sonne|aufstehen|sun|alarm/.test(searchable)) {
    return timerMorningImage;
  }

  return timerDefaultImage;
}

export function TaskTimerModal({
  task,
  childName,
  childTheme,
  onClose,
}: TaskTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>("running");
  const [isParentGateVisible, setIsParentGateVisible] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const circleProgress = useSharedValue(0);
  const contentScale = useSharedValue(CARD_ENTER_SCALE);
  const contentOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const { designMode } = useDesignMode();
  const timerModalTokens = getModalTokens(designMode);
  const isGlassTimer = timerModalTokens.blurIntensity > 0;
  const countdownPulse = useSharedValue(1);

  // The card outlives `task` by one exit animation so closing is a scale-down
  // instead of the Modal ripping its children out of the tree mid-frame.
  const [renderedTask, setRenderedTask] = useState<Task | null>(task);
  if (task && task.id !== renderedTask?.id) {
    // Adjusted during render, not in an effect: an effect would leave the modal
    // blank for one commit before the incoming task reached the tree.
    setRenderedTask(task);
  }

  const taskId = task?.id ?? null;
  const totalSeconds = Math.max(0, Math.round((task?.timerInMinutes ?? 0) * 60));

  const palette = getThemePalette(childTheme);
  const isCompactLayout = screenHeight < 760;
  const isVeryCompactLayout = screenHeight < 700;
  const modalPaddingTop = Math.max(insets.top + 12, isCompactLayout ? 18 : 34);
  const modalPaddingBottom = Math.max(insets.bottom + 12, isCompactLayout ? 18 : 34);
  const availableModalHeight = Math.max(1, screenHeight - modalPaddingTop - modalPaddingBottom);
  const modalMaxHeight = Math.min(screenHeight * 0.9, availableModalHeight);
  const circleSize = Math.min(
    screenWidth * 0.6,
    isCompactLayout ? screenHeight * 0.27 : screenHeight * 0.31,
    isCompactLayout ? 188 : 224
  );
  const circleRadius = Math.max(
    isVeryCompactLayout ? 44 : 58,
    Math.min(isCompactLayout ? 78 : 88, circleSize / 2 - 14)
  );
  const circumference = 2 * Math.PI * circleRadius;
  const viewBox = `0 0 ${circleRadius * 2 + 24} ${circleRadius * 2 + 24}`;
  const center = circleRadius + 12;
  const timerTextFontSize = isCompactLayout ? 36 : 42;
  const timerTextLineHeight = isCompactLayout ? 44 : 50;
  const timerTextMaxFontMultiplier = isVeryCompactLayout ? 1.15 : isCompactLayout ? 1.25 : 1.35;
  const timerVisualOffset = isCompactLayout ? 8 : 6;
  const timerArtFrameSize = isCompactLayout ? 64 : 74;
  const timerArtImageSize = isCompactLayout ? 86 : 98;
  const modalMaxWidth = Math.min(screenWidth - 34, 372);

  // Anchor the run to a wall-clock end timestamp, keyed on the task identity so
  // an unrelated re-render of the parent can never restart a running countdown.
  useEffect(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }

    setIsParentGateVisible(false);

    if (!taskId || totalSeconds <= 0) {
      // Leave the animated values alone — a pending exit animation owns them.
      setEndTimestamp(null);
      return;
    }

    setTimeLeft(totalSeconds);
    setEndTimestamp(Date.now() + totalSeconds * 1000);
    setTimerState("running");
    setShowConfetti(false);
    circleProgress.value = 0;

    // Explicit start values so a re-open right after a dismissal still gets the
    // full entrance instead of springing from wherever the exit stopped.
    backdropOpacity.value = 0;
    contentOpacity.value = 0;
    contentScale.value = CARD_ENTER_SCALE;

    backdropOpacity.value = withTiming(1, timings.base);
    contentOpacity.value = withTiming(1, timings.fast);
    contentScale.value = withSpring(1, modalSpring);
  }, [taskId, totalSeconds, backdropOpacity, circleProgress, contentOpacity, contentScale]);

  // Dismissal: mirror the entrance, then drop the card from the tree. A re-open
  // mid-exit cancels these animations, so the callback lands with
  // `finished === false` and never unmounts a card that is coming back.
  useEffect(() => {
    if (task || !renderedTask) {
      return;
    }

    backdropOpacity.value = withTiming(0, timings.fast);
    contentOpacity.value = withTiming(0, timings.fast);
    contentScale.value = withTiming(CARD_EXIT_SCALE, CARD_EXIT_TIMING, (finished) => {
      if (finished) {
        runOnJS(setRenderedTask)(null);
      }
    });
  }, [backdropOpacity, contentOpacity, contentScale, renderedTask, task]);

  // The only source of truth is `endTimestamp - Date.now()`; the interval and
  // the foreground listener merely resync. Returning from background past zero
  // therefore lands directly in the parent-check step.
  useEffect(() => {
    if (timerState !== "running" || endTimestamp === null || totalSeconds <= 0) {
      return;
    }

    const totalMs = totalSeconds * 1000;

    const syncToWallClock = () => {
      const remainingMs = Math.max(0, endTimestamp - Date.now());
      const remaining = Math.ceil(remainingMs / 1000);

      setTimeLeft((previous) => (previous === remaining ? previous : remaining));
      circleProgress.value = withTiming(
        Math.min(1, Math.max(0, 1 - remainingMs / totalMs)),
        RING_TIMING
      );

      if (remainingMs === 0) {
        setTimerState("confirming");
      }
    };

    syncToWallClock();

    const intervalId = setInterval(syncToWallClock, TIMER_TICK_MS);
    const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        syncToWallClock();
      }
    });

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [circleProgress, endTimestamp, timerState, totalSeconds]);

  // Decorative heartbeat for the closing seconds. Infinite loop, so it needs
  // the explicit reduced-motion gate on top of the token's ReduceMotion.System.
  const isFinalCountdown =
    timerState === "running" &&
    endTimestamp !== null &&
    timeLeft > 0 &&
    timeLeft <= FINAL_COUNTDOWN_SECONDS;

  useEffect(() => {
    if (!isFinalCountdown || reduceMotion) {
      cancelAnimation(countdownPulse);
      countdownPulse.value = withTiming(1, timings.fast);
      return;
    }

    countdownPulse.value = withRepeat(
      withSequence(
        withTiming(COUNTDOWN_PULSE_SCALE, COUNTDOWN_PULSE_TIMING),
        withTiming(1, COUNTDOWN_PULSE_TIMING)
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(countdownPulse);
    };
  }, [countdownPulse, isFinalCountdown, reduceMotion]);

  useEffect(
    () => () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    },
    []
  );

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - circleProgress.value),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const countdownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownPulse.value }],
  }));

  const handleChildFinished = () => {
    setTimerState("confirming");
  };

  const handleParentConfirmation = useCallback(
    (success: boolean) => {
      if (!success) {
        onClose(false);
        return;
      }

      setTimerState("success");
      setShowConfetti(true);
      void triggerFeedback("stars_added");
      // Small "yes!" pop as the card swaps to the success face.
      contentScale.value = withSequence(
        withSpring(1.03, springs.playful),
        withSpring(1, springs.gentle)
      );

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        successTimeoutRef.current = null;
        onClose(true);
      }, SUCCESS_CLOSE_DELAY_MS);
    },
    [contentScale, onClose]
  );

  // The bonus is real currency for the child, so only an adult may grant it.
  // The gate sits on the confirming tap alone — declining stays one tap.
  const handleParentApprovalRequest = useCallback(() => {
    setIsParentGateVisible(true);
  }, []);

  const handleParentGateSuccess = useCallback(() => {
    setIsParentGateVisible(false);
    handleParentConfirmation(true);
  }, [handleParentConfirmation]);

  const handleParentGateCancel = useCallback(() => {
    setIsParentGateVisible(false);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!renderedTask) {
    return null;
  }

  const visibleBonusStars = Math.max(renderedTask.bonusStars ?? 0, 0);
  const timerArtImage = getTimerArt(renderedTask);
  const cardBackgroundImage =
    timerState === "running"
      ? timerChallengeBackground
      : timerState === "confirming"
        ? parentCheckBackground
        : taskSuccessBackground;
  const cardPaddingClass =
    timerState === "running"
      ? isVeryCompactLayout
        ? "px-5 pb-5 pt-7"
        : "px-6 pb-7 pt-9"
      : isVeryCompactLayout
        ? "px-5 pb-6 pt-8"
        : "px-6 pb-8 pt-10";

  return (
    <Modal
      visible={!!renderedTask}
      transparent
      animationType="none"
      onRequestClose={() => onClose(false)}
    >
      <View
        className="flex-1 px-4"
        style={{
          paddingTop: modalPaddingTop,
          paddingBottom: modalPaddingBottom,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: MODAL_BACKDROP },
            backdropAnimatedStyle,
          ]}
        />

        {showConfetti && <Confetti colors={palette.celebrationColors} />}

        <View className="flex-1 items-center justify-center">
          <Animated.View
            className="w-full items-center self-center"
            pointerEvents={task ? "auto" : "none"}
            style={[
              contentAnimatedStyle,
              {
                maxWidth: modalMaxWidth,
                maxHeight: modalMaxHeight,
                ...shadowPresets.shadowFloating,
              },
            ]}
          >
            <View
              className="w-full overflow-hidden rounded-[32px] border"
              style={{
                backgroundColor: isGlassTimer ? "transparent" : semanticColors.card,
                borderColor: isGlassTimer
                  ? timerModalTokens.borderColor
                  : "rgba(255,255,255,0.88)",
                maxHeight: modalMaxHeight,
                ...shadowPresets.shadowCard,
              }}
            >
              {isGlassTimer ? (
                // The painted card art belongs to the pastel look; frosting it
                // would just smear it, so glass swaps the whole backing.
                <>
                  <BlurView
                    intensity={timerModalTokens.blurIntensity}
                    tint="light"
                    pointerEvents="none"
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View
                    pointerEvents="none"
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: timerModalTokens.backgroundColor },
                    ]}
                  />
                </>
              ) : (
                <>
                  <Image
                    source={cardBackgroundImage}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                    transition={160}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  />
                  <View
                    style={[
                      StyleSheet.absoluteFillObject,
                      { backgroundColor: "rgba(255,255,255,0.12)" },
                    ]}
                  />
                </>
              )}
              <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: modalMaxHeight }}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View
                  className={cn(
                    "w-full items-center justify-center",
                    cardPaddingClass
                  )}
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                {timerState === "running" && (
                  <>
                    <ModalBadge label="Bonus-Challenge" />
                    <View className="items-center">
                      <Text
                        className={cn(
                          "max-w-[318px] font-headline text-center",
                          isCompactLayout ? "mb-2 text-[25px] leading-[30px]" : "mb-2 text-[30px] leading-[35px]"
                        )}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.68}
                        style={{ color: MODAL_NAVY }}
                      >
                        {renderedTask.title}
                      </Text>
                      <Text
                        className={cn(
                          "max-w-[260px] font-body text-center",
                          isCompactLayout ? "mb-4 text-[15px] leading-5" : "mb-5 text-[17px] leading-6"
                        )}
                        style={{ color: MODAL_MUTED }}
                      >
                        Schaffst du es rechtzeitig?
                      </Text>
                    </View>

                    <View
                      style={{ width: circleSize, height: circleSize + timerVisualOffset }}
                      className={cn(
                        "items-center justify-center",
                        isCompactLayout ? "mb-5" : "mb-6"
                      )}
                    >
                      <Svg
                        width={circleSize}
                        height={circleSize}
                        viewBox={viewBox}
                        style={{
                          position: "absolute",
                          top: timerVisualOffset / 2,
                          transform: [{ rotate: "-90deg" }],
                        }}
                      >
                        <Circle
                          cx={center}
                          cy={center}
                          r={circleRadius}
                          fill="none"
                          stroke="rgba(205,191,248,0.58)"
                          strokeWidth={12}
                        />
                        <AnimatedCircle
                          cx={center}
                          cy={center}
                          r={circleRadius}
                          fill="none"
                          stroke={MODAL_BLUE}
                          strokeWidth={12}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          animatedProps={circleAnimatedProps}
                        />
                      </Svg>
                      <View className="items-center" style={{ paddingTop: timerVisualOffset }}>
                        <View
                          className="items-center justify-center rounded-full"
                          style={{
                            width: timerArtFrameSize,
                            height: timerArtFrameSize,
                            backgroundColor: "rgba(255,247,231,0.82)",
                            borderColor: "rgba(255,255,255,0.92)",
                            borderWidth: 3,
                          }}
                        >
                          <Image
                            source={timerArtImage}
                            style={{
                              width: timerArtImageSize,
                              height: timerArtImageSize,
                            }}
                            contentFit="contain"
                            transition={160}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                          />
                        </View>
                        <Animated.View style={countdownAnimatedStyle}>
                          <Text
                            className="font-body-bold"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.72}
                            maxFontSizeMultiplier={timerTextMaxFontMultiplier}
                            style={{
                              fontSize: timerTextFontSize,
                              lineHeight: timerTextLineHeight,
                              color: MODAL_NAVY,
                              marginTop: -2,
                            }}
                          >
                            {formatTime(timeLeft)}
                          </Text>
                        </Animated.View>
                      </View>
                    </View>

                    <Button
                      onPress={handleChildFinished}
                      accessibilityRole="button"
                      accessibilityLabel="Aufgabe als fertig melden"
                      className={cn(
                        "mb-4 w-full max-w-[320px] rounded-card",
                        isCompactLayout ? "h-[54px]" : "h-[60px]"
                      )}
                      size="lg"
                      style={{
                        backgroundColor: MODAL_BLUE,
                        ...shadowPresets.shadowCard,
                      }}
                      textClassName="text-white"
                    >
                      <View className="flex-row items-center gap-3">
                        <Check size={22} color={semanticColors.card} />
                        <Text
                          className="text-lg font-body-bold leading-6 text-white"
                          maxFontSizeMultiplier={1.3}
                        >
                          Fertig!
                        </Text>
                      </View>
                    </Button>

                    {visibleBonusStars > 0 ? (
                      <View className="flex-row items-center gap-2">
                        <Award size={19} color={MODAL_GOLD} />
                        <Text
                          className="text-sm font-body-semibold leading-5"
                          style={{ color: MODAL_LAVENDER_INK }}
                          maxFontSizeMultiplier={1.3}
                        >
                          +{visibleBonusStars} Bonus-Sterne
                        </Text>
                      </View>
                    ) : null}
                  </>
                )}

                {timerState === "confirming" && (
                  <>
                    <ModalBadge label="Eltern-Check" />
                    <Text
                      className={cn(
                        "mb-3 max-w-[318px] text-center font-headline",
                        isCompactLayout ? "text-[27px] leading-[32px]" : "text-[31px] leading-[36px]"
                      )}
                      style={{ color: MODAL_NAVY }}
                      numberOfLines={3}
                      adjustsFontSizeToFit
                      minimumFontScale={0.72}
                    >
                      Hat {childName} die Aufgabe geschafft?
                    </Text>
                    <Text
                      className={cn(
                        "max-w-[286px] text-center font-body",
                        isCompactLayout ? "mb-5 text-[15px] leading-5" : "mb-7 text-[17px] leading-6"
                      )}
                      style={{ color: MODAL_MUTED }}
                    >
                      Bestätige, ob die Aufgabe rechtzeitig erledigt wurde. Für „Ja“ folgt eine
                      kurze Eltern-Frage.
                    </Text>

                    <View
                      className={cn(
                        "items-center justify-center",
                        isCompactLayout ? "mb-5 h-[146px] w-[190px]" : "mb-7 h-[168px] w-[214px]"
                      )}
                    >
                      <Image
                        source={parentCheckImage}
                        style={{
                          width: isCompactLayout ? 206 : 232,
                          height: isCompactLayout ? 206 : 232,
                        }}
                        contentFit="contain"
                        transition={160}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                      />
                      <Sparkles
                        size={18}
                        color={MODAL_SPARKLE}
                        style={{ position: "absolute", right: 4, top: 18 }}
                      />
                      <Star
                        size={13}
                        color={MODAL_SPARKLE}
                        fill={MODAL_SPARKLE}
                        style={{ position: "absolute", left: 10, bottom: 26 }}
                      />
                    </View>
                    <View className="w-full max-w-[320px] flex-row gap-3">
                      <PressableScale
                        onPress={handleParentApprovalRequest}
                        containerClassName="flex-1"
                        className="h-[58px] items-center justify-center rounded-card"
                        style={{
                          backgroundColor: MODAL_BLUE,
                          ...shadowPresets.shadowCard,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${childName} hat die Aufgabe geschafft`}
                        accessibilityHint="Öffnet den Eltern-Check zum Bestätigen der Bonus-Sterne"
                      >
                        <View className="flex-row items-center gap-2">
                          <ThumbsUp size={24} color={semanticColors.card} />
                          <Text
                            className="text-lg font-body-bold leading-6 text-white"
                            maxFontSizeMultiplier={1.3}
                          >
                            Ja!
                          </Text>
                        </View>
                      </PressableScale>
                      <PressableScale
                        onPress={() => handleParentConfirmation(false)}
                        containerClassName="flex-1"
                        className="h-[58px] items-center justify-center rounded-card border"
                        style={{
                          backgroundColor: semanticColors.card,
                          borderColor: "rgba(7,26,73,0.28)",
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${childName} hat die Aufgabe nicht geschafft`}
                      >
                        <View className="flex-row items-center gap-2">
                          <ThumbsDown size={24} color={MODAL_BLUE} />
                          <Text
                            className="text-lg font-body-bold leading-6"
                            style={{ color: MODAL_BLUE }}
                            maxFontSizeMultiplier={1.3}
                          >
                            Nein
                          </Text>
                        </View>
                      </PressableScale>
                    </View>
                  </>
                )}

                {timerState === "success" && (
                  <>
                    <View
                      className={cn(
                        "items-center justify-center",
                        isCompactLayout ? "mb-4 h-[156px]" : "mb-5 h-[178px]"
                      )}
                    >
                      <View
                        className="absolute h-32 w-32 rounded-full"
                        style={{ backgroundColor: MODAL_GLOW, opacity: 0.8 }}
                      />
                      <Sparkles
                        size={18}
                        color={MODAL_SPARKLE}
                        style={{ position: "absolute", left: 24, top: 22 }}
                      />
                      <Star
                        size={14}
                        color={MODAL_GOLD}
                        fill={MODAL_GOLD}
                        style={{ position: "absolute", right: 34, top: 18 }}
                      />
                      <Image
                        source={successStarImage}
                        style={{
                          width: isCompactLayout ? 150 : 172,
                          height: isCompactLayout ? 150 : 172,
                        }}
                        contentFit="contain"
                        transition={160}
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                      />
                    </View>
                    <Text
                      className={cn(
                        "mb-2 text-center font-headline",
                        isCompactLayout ? "text-[42px] leading-[46px]" : "text-[50px] leading-[54px]"
                      )}
                      style={{ color: MODAL_NAVY }}
                    >
                      Super!
                    </Text>
                    <Text
                      className="mb-6 max-w-[270px] text-center text-[17px] font-body leading-6"
                      style={{ color: MODAL_MUTED }}
                    >
                      Aufgabe geschafft. Der Fortschritt wird jetzt gespeichert.
                    </Text>
                    <View
                      className="mb-1 h-[58px] w-[58px] items-center justify-center rounded-full"
                      style={{ backgroundColor: semanticColors.successSoft }}
                    >
                      <View
                        className="h-[42px] w-[42px] items-center justify-center rounded-full"
                        style={{
                          backgroundColor: semanticColors.card,
                          borderColor: semanticColors.success,
                          borderWidth: 1,
                        }}
                      >
                        <CircleCheckBig
                          size={27}
                          color={semanticColors.success}
                          strokeWidth={3}
                        />
                      </View>
                    </View>
                    {visibleBonusStars > 0 ? (
                      <View
                        className="mt-3 flex-row items-center gap-3 rounded-full px-4 py-2.5"
                        style={{ backgroundColor: MODAL_LAVENDER_SOFT }}
                      >
                        <Award size={28} color={MODAL_GOLD} />
                        <Text
                          className="text-center text-base font-body-bold leading-6"
                          style={{ color: MODAL_LAVENDER_INK }}
                          maxFontSizeMultiplier={1.3}
                        >
                          +{visibleBonusStars} Bonus-Sterne!
                        </Text>
                      </View>
                    ) : null}
                  </>
                )}
                </View>
              </ScrollView>
            </View>

            <PressableScale
              onPress={() => onClose(false)}
              containerClassName="absolute right-[-8px] top-[-12px] z-50"
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: semanticColors.card,
                ...shadowPresets.shadowSubtle,
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Timer schließen"
            >
              <X size={25} color={MODAL_NAVY} />
            </PressableScale>
          </Animated.View>
        </View>

        <ParentGateChallenge
          visible={isParentGateVisible}
          title="Eltern-Check"
          onSuccess={handleParentGateSuccess}
          onCancel={handleParentGateCancel}
        />
      </View>
    </Modal>
  );
}
