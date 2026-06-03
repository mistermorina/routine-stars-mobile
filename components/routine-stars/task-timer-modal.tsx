import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, Modal, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { X, Check, Award, ThumbsUp, ThumbsDown } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Confetti } from "./confetti";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { ChildTheme, Task } from "@/lib/types";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TimerState = "running" | "confirming" | "success";

interface TaskTimerModalProps {
  task: Task | null;
  childName: string;
  childTheme?: ChildTheme;
  onClose: (success: boolean) => void;
}

export function TaskTimerModal({
  task,
  childName,
  childTheme,
  onClose,
}: TaskTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>("running");
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const circleProgress = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  const palette = getThemePalette(childTheme);
  const isCompactLayout = screenHeight < 760;
  const circleSize = Math.min(
    screenWidth * 0.56,
    isCompactLayout ? screenHeight * 0.26 : screenHeight * 0.3,
    isCompactLayout ? 178 : 210
  );
  const circleRadius = Math.max(62, Math.min(78, circleSize / 2 - 18));
  const circumference = 2 * Math.PI * circleRadius;
  const viewBox = `0 0 ${circleRadius * 2 + 24} ${circleRadius * 2 + 24}`;
  const center = circleRadius + 12;
  const timerTextFontSize = isCompactLayout ? 44 : 54;
  const timerTextLineHeight = isCompactLayout ? 52 : 62;
  const timerVisualOffset = isCompactLayout ? 8 : 6;

  useEffect(() => {
    if (task && task.timerInMinutes) {
      setTimeLeft(task.timerInMinutes * 60);
      setIsActive(true);
      setTimerState("running");
      setShowConfetti(false);
      circleProgress.value = 0;
      contentScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      contentOpacity.value = withTiming(1, { duration: 300 });
    } else {
      setIsActive(false);
    }
  }, [task, circleProgress, contentOpacity, contentScale]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (isActive && timeLeft <= 0) {
        setIsActive(false);
        setTimerState("confirming");
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (task && task.timerInMinutes) {
      const totalSeconds = task.timerInMinutes * 60;
      const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
      circleProgress.value = withTiming(progress, {
        duration: 1000,
        easing: Easing.linear,
      });
    }
  }, [timeLeft, task, circleProgress]);

  const circleAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - circleProgress.value),
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  const handleChildFinished = () => {
    setIsActive(false);
    setTimerState("confirming");
  };

  const handleParentConfirmation = useCallback(
    (success: boolean) => {
      if (success) {
        setTimerState("success");
        setShowConfetti(true);
        void triggerFeedback("stars_added");
        contentScale.value = withSpring(1.1, { damping: 10, stiffness: 200 }, () => {
          contentScale.value = withSpring(1, { damping: 15, stiffness: 200 });
        });
        setTimeout(() => {
          onClose(true);
        }, 2500);
      } else {
        onClose(false);
      }
    },
    [contentScale, onClose]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!task) {
    return null;
  }

  const visibleBonusStars = Math.max(task.bonusStars ?? 0, 0);

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <View
        className="flex-1 px-5 py-8"
        style={{ backgroundColor: "rgba(246,250,255,0.88)" }}
      >
        {showConfetti && <Confetti colors={palette.celebrationColors} />}

        <Pressable
          onPress={() => onClose(false)}
          className="absolute right-6 top-12 z-50 h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.86)" }}
          hitSlop={12}
        >
          <X size={26} color={palette.accentText} />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Animated.View
            className={cn(
              "w-full max-w-[360px] items-center justify-center self-center overflow-hidden rounded-[30px] border",
              isCompactLayout ? "px-5 pb-6 pt-8" : "px-5 pb-7 pt-10"
            )}
            style={[
              contentAnimatedStyle,
              {
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
                shadowColor: "#9DB8D8",
                shadowOpacity: 0.2,
                shadowRadius: 28,
                shadowOffset: { width: 0, height: 18 },
              },
            ]}
          >
            <View
              className="absolute inset-x-0 top-0 h-36 rounded-[30px]"
              style={{ backgroundColor: palette.heroSurface }}
            />
            <View
              className="absolute right-[-14px] top-[-10px] h-24 w-24 rounded-full"
              style={{ backgroundColor: palette.motifSecondary, opacity: 0.32 }}
            />
            <View
              className="absolute bottom-6 left-[-10px] h-20 w-20 rounded-full"
              style={{ backgroundColor: palette.motifPrimary, opacity: 0.2 }}
            />
            {timerState === "running" && (
              <>
                <View
                  className="mb-4 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.8px]" style={{ color: palette.accentText }}>
                    Bonus-Challenge
                  </Text>
                </View>
                <View className="items-center">
                  <Text
                    className={cn(
                      "max-w-[280px] font-headline text-center text-foreground",
                      isCompactLayout ? "mb-2 text-[22px] leading-[27px]" : "mb-2 text-[25px] leading-[30px]"
                    )}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <Text
                    className={cn(
                      "max-w-[260px] font-body text-center text-muted-foreground",
                      isCompactLayout ? "mb-4 text-sm leading-5" : "mb-5 text-[15px] leading-6"
                    )}
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
                      stroke="rgba(157,184,216,0.24)"
                      strokeWidth={10}
                    />
                    <AnimatedCircle
                      cx={center}
                      cy={center}
                      r={circleRadius}
                      fill="none"
                      stroke={palette.chartPrimary}
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animatedProps={circleAnimatedProps}
                    />
                  </Svg>
                  <View style={{ paddingTop: timerVisualOffset }}>
                    <Text
                      className="font-body-bold text-foreground"
                      allowFontScaling={false}
                      style={{
                        fontSize: timerTextFontSize,
                        lineHeight: timerTextLineHeight,
                      }}
                    >
                      {formatTime(timeLeft)}
                    </Text>
                  </View>
                </View>

                <Button
                  onPress={handleChildFinished}
                  className={cn(
                    "mb-4 w-full max-w-[320px]",
                    isCompactLayout ? "h-12" : "h-14"
                  )}
                  size="lg"
                  style={{ backgroundColor: palette.button }}
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
                    <Award size={19} color={palette.chartPrimary} />
                    <Text className="text-sm font-body-semibold leading-5" style={{ color: palette.accentText }}>
                      +{visibleBonusStars} Bonus-Sterne
                    </Text>
                  </View>
                ) : null}
              </>
            )}

            {timerState === "confirming" && (
              <>
                <View
                  className="mb-4 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.8px]" style={{ color: palette.accentText }}>
                    Eltern-Check
                  </Text>
                </View>
                <Text className="mb-3 max-w-[280px] text-center text-[24px] font-headline leading-[30px] text-foreground">
                  Hat {childName} die Aufgabe geschafft?
                </Text>
                <Text className="mb-6 max-w-[270px] text-center text-sm font-body leading-5 text-muted-foreground">
                  Bestätige, ob die Aufgabe rechtzeitig erledigt wurde.
                </Text>
                <View
                  className={cn(
                    "w-full max-w-[320px]",
                    isCompactLayout ? "gap-3" : "flex-row gap-5"
                  )}
                >
                  <Pressable
                    onPress={() => handleParentConfirmation(true)}
                    className={cn(
                      "items-center justify-center rounded-[22px]",
                      isCompactLayout ? "h-[52px] w-full" : "h-16 flex-1"
                    )}
                    style={{ backgroundColor: palette.button }}
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
                    className={cn(
                      "items-center justify-center rounded-[22px] border",
                      isCompactLayout ? "h-[52px] w-full" : "h-16 flex-1"
                    )}
                    style={{ backgroundColor: "#FFFFFF", borderColor: palette.accentBorder }}
                  >
                    <View className="flex-row items-center gap-2">
                      <ThumbsDown size={24} color={palette.accentText} />
                      <Text className="text-lg font-body-bold leading-6" style={{ color: palette.accentText }}>
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
                  className="mb-4 h-20 w-20 items-center justify-center rounded-[26px]"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Text className="text-5xl">⭐</Text>
                </View>
                <Text className="mb-2 text-center text-3xl font-headline text-foreground">
                  Super!
                </Text>
                <Text className="mb-5 max-w-[260px] text-center text-sm font-body leading-5 text-muted-foreground">
                  Aufgabe geschafft. Der Fortschritt wird jetzt gespeichert.
                </Text>
                {visibleBonusStars > 0 ? (
                  <View
                    className="flex-row items-center gap-3 rounded-full px-4 py-2.5"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Award size={32} color={palette.chartPrimary} />
                    <Text className="text-center text-lg font-body-bold leading-6" style={{ color: palette.chartPrimary }}>
                      +{visibleBonusStars} Bonus-Sterne!
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
