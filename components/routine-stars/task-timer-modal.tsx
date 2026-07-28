import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
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
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { X, Check, Award, ThumbsUp, ThumbsDown, Sparkles, Star, CircleCheckBig } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { ParentGateChallenge } from "@/components/parent-gate-challenge";
import { Confetti } from "./confetti";
import { triggerFeedback } from "@/lib/feedback";
import { durations, easings, sheetSpring, timings } from "@/lib/motion";
import { getThemePalette } from "@/lib/theme";
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

const MODAL_NAVY = "#071A49";
const MODAL_MUTED = "#606B80";
const MODAL_BLUE = "#2F6FDC";
const MODAL_LAVENDER_SOFT = "#F2EFFF";
const MODAL_GOLD = "#F7B633";

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
        style={{ color: "#5364A9" }}
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

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const circleProgress = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

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
      setEndTimestamp(null);
      contentScale.value = 0.8;
      contentOpacity.value = 0;
      return;
    }

    setTimeLeft(totalSeconds);
    setEndTimestamp(Date.now() + totalSeconds * 1000);
    setTimerState("running");
    setShowConfetti(false);
    circleProgress.value = 0;
    contentScale.value = withSpring(1, sheetSpring);
    contentOpacity.value = withTiming(1, timings.base);
  }, [taskId, totalSeconds, circleProgress, contentOpacity, contentScale]);

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
      contentScale.value = withSpring(1, sheetSpring);

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

  if (!task) {
    return null;
  }

  const visibleBonusStars = Math.max(task.bonusStars ?? 0, 0);
  const timerArtImage = getTimerArt(task);
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
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <View
        className="flex-1 px-4"
        style={{
          backgroundColor: "rgba(16, 24, 48, 0.42)",
          paddingTop: modalPaddingTop,
          paddingBottom: modalPaddingBottom,
        }}
      >
        {showConfetti && <Confetti colors={palette.celebrationColors} />}

        <View className="flex-1 items-center justify-center">
          <Animated.View
            className="w-full items-center self-center"
            style={[
              contentAnimatedStyle,
              {
                maxWidth: modalMaxWidth,
                maxHeight: modalMaxHeight,
                shadowColor: "#2E3A68",
                shadowOpacity: 0.2,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: 18 },
              },
            ]}
          >
            <View
              className="w-full overflow-hidden rounded-[32px] border"
              style={{
                backgroundColor: "#FBFAFF",
                borderColor: "rgba(255,255,255,0.88)",
                maxHeight: modalMaxHeight,
                shadowColor: "#9DB8D8",
                shadowOpacity: 0.18,
                shadowRadius: 28,
                shadowOffset: { width: 0, height: 12 },
              }}
            >
              <Image
                source={cardBackgroundImage}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={160}
              />
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: "rgba(255,255,255,0.12)" },
                ]}
              />
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
                        {task.title}
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
                          />
                        </View>
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
                      </View>
                    </View>

                    <Button
                      onPress={handleChildFinished}
                      className={cn(
                        "mb-4 w-full max-w-[320px] rounded-[22px]",
                        isCompactLayout ? "h-[54px]" : "h-[60px]"
                      )}
                      size="lg"
                      style={{
                        backgroundColor: MODAL_BLUE,
                        shadowColor: MODAL_BLUE,
                        shadowOpacity: 0.26,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 8 },
                      }}
                      textClassName="text-white"
                    >
                      <View className="flex-row items-center gap-3">
                        <Check size={22} color="#FFFFFF" />
                        <Text className="text-lg font-body-bold leading-6 text-white">
                          Fertig!
                        </Text>
                      </View>
                    </Button>

                    {visibleBonusStars > 0 ? (
                      <View className="flex-row items-center gap-2">
                        <Award size={19} color={MODAL_GOLD} />
                        <Text className="text-sm font-body-semibold leading-5" style={{ color: "#5364A9" }}>
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
                      />
                      <Sparkles
                        size={18}
                        color="#B9AAF2"
                        style={{ position: "absolute", right: 4, top: 18 }}
                      />
                      <Star
                        size={13}
                        color="#B9AAF2"
                        fill="#B9AAF2"
                        style={{ position: "absolute", left: 10, bottom: 26 }}
                      />
                    </View>
                    <View className="w-full max-w-[320px] flex-row gap-3">
                      <Pressable
                        onPress={handleParentApprovalRequest}
                        className="h-[58px] flex-1 items-center justify-center rounded-[20px]"
                        style={{
                          backgroundColor: MODAL_BLUE,
                          shadowColor: MODAL_BLUE,
                          shadowOpacity: 0.24,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 7 },
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${childName} hat die Aufgabe geschafft`}
                        accessibilityHint="Öffnet den Eltern-Check zum Bestätigen der Bonus-Sterne"
                      >
                        <View className="flex-row items-center gap-2">
                          <ThumbsUp size={24} color="#FFFFFF" />
                          <Text className="text-lg font-body-bold leading-6 text-white">
                            Ja!
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => handleParentConfirmation(false)}
                        className="h-[58px] flex-1 items-center justify-center rounded-[20px] border"
                        style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(7,26,73,0.28)" }}
                        accessibilityRole="button"
                        accessibilityLabel={`${childName} hat die Aufgabe nicht geschafft`}
                      >
                        <View className="flex-row items-center gap-2">
                          <ThumbsDown size={24} color={MODAL_BLUE} />
                          <Text
                            className="text-lg font-body-bold leading-6"
                            style={{ color: MODAL_BLUE }}
                          >
                            Nein
                          </Text>
                        </View>
                      </Pressable>
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
                        style={{ backgroundColor: "#DDD3FF", opacity: 0.8 }}
                      />
                      <Sparkles
                        size={18}
                        color="#B9AAF2"
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
                      style={{ backgroundColor: "#F0F7EC" }}
                    >
                      <View
                        className="h-[42px] w-[42px] items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#DCEED3",
                          borderWidth: 1,
                        }}
                      >
                        <CircleCheckBig size={27} color="#7FB565" strokeWidth={3} />
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
                          style={{ color: "#5364A9" }}
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

            <Pressable
              onPress={() => onClose(false)}
              className="absolute right-[-8px] top-[-12px] z-50 h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: "#FFFFFF",
                shadowColor: "#2E3A68",
                shadowOpacity: 0.14,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 5 },
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Timer schließen"
            >
              <X size={25} color={MODAL_NAVY} />
            </Pressable>
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
