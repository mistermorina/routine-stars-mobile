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

  const isCompactLayout = screenHeight < 760;
  const circleSize = Math.min(
    screenWidth * 0.62,
    isCompactLayout ? screenHeight * 0.3 : screenHeight * 0.36,
    isCompactLayout ? 210 : 250
  );
  const circleRadius = Math.max(72, Math.min(90, circleSize / 2 - 18));
  const circumference = 2 * Math.PI * circleRadius;
  const viewBox = `0 0 ${circleRadius * 2 + 24} ${circleRadius * 2 + 24}`;
  const center = circleRadius + 12;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <View className="flex-1 bg-black/85 px-5 py-8">
        {showConfetti && <Confetti colors={palette.celebrationColors} />}

        <Pressable
          onPress={() => onClose(false)}
          className="absolute right-6 top-12 z-50 h-12 w-12 items-center justify-center rounded-full"
          hitSlop={12}
        >
          <X size={28} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Animated.View
            style={contentAnimatedStyle}
            className={cn(
              "w-full max-w-[360px] items-center justify-center self-center overflow-hidden rounded-[34px] border",
              isCompactLayout ? "px-5 pb-7 pt-10" : "px-6 pb-8 pt-12"
            )}
          >
            <View
              className="absolute inset-0 rounded-[34px]"
              style={{ backgroundColor: "rgba(18,18,34,0.42)", borderColor: "rgba(255,255,255,0.14)", borderWidth: 1 }}
            />
            <View
              className="absolute right-[-14px] top-[-10px] h-24 w-24 rounded-full"
              style={{ backgroundColor: palette.button, opacity: 0.18 }}
            />
            <View
              className="absolute bottom-6 left-[-10px] h-20 w-20 rounded-full"
              style={{ backgroundColor: palette.chartSecondary, opacity: 0.12 }}
            />
            {timerState === "running" && (
              <>
                <View
                  className="mb-4 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-white/80">
                    Bonus-Challenge
                  </Text>
                </View>
                <View className="items-center">
                  <Text
                    className={cn(
                      "max-w-[280px] font-headline text-center text-white",
                      isCompactLayout ? "mb-2 text-[24px] leading-[29px]" : "mb-2 text-[28px] leading-[34px]"
                    )}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                  <Text
                    className={cn(
                      "max-w-[260px] font-body text-center text-white/70",
                      isCompactLayout ? "mb-5 text-sm leading-5" : "mb-7 text-base"
                    )}
                  >
                    Schaffst du es rechtzeitig?
                  </Text>
                </View>

                <View
                  style={{ width: circleSize, height: circleSize }}
                  className={cn(
                    "items-center justify-center",
                    isCompactLayout ? "mb-6" : "mb-8"
                  )}
                >
                  <Svg
                    width={circleSize}
                    height={circleSize}
                    viewBox={viewBox}
                    style={{
                      position: "absolute",
                      transform: [{ rotate: "-90deg" }],
                    }}
                  >
                    <Circle
                      cx={center}
                      cy={center}
                      r={circleRadius}
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
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
                  <Text
                    className={cn(
                      "font-body-bold text-white",
                      isCompactLayout ? "text-4xl" : "text-5xl"
                    )}
                  >
                    {formatTime(timeLeft)}
                  </Text>
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
                    <Check size={24} color="#FFFFFF" />
                    <Text className="text-xl font-body-bold text-white">
                      Fertig!
                    </Text>
                  </View>
                </Button>

                <View className="flex-row items-center gap-2">
                  <Award size={20} color={palette.chartPrimary} />
                  <Text className="text-base font-body-semibold text-white/80">
                    +{task.bonusStars} Bonus-Sterne
                  </Text>
                </View>
              </>
            )}

            {timerState === "confirming" && (
              <>
                <Text className="mb-4 max-w-[280px] text-center text-[28px] font-headline leading-[34px] text-white">
                  Hat {childName} die Aufgabe geschafft?
                </Text>
                <Text className="mb-7 max-w-[270px] text-center text-base font-body leading-6 text-white/70">
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
                      isCompactLayout ? "h-14 w-full" : "h-20 flex-1"
                    )}
                    style={{ backgroundColor: palette.button }}
                  >
                    <View className="flex-row items-center gap-2">
                      <ThumbsUp size={24} color="#FFFFFF" />
                      <Text className="text-xl font-body-bold text-white">
                        Ja!
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleParentConfirmation(false)}
                    className={cn(
                      "items-center justify-center rounded-[22px] border",
                      isCompactLayout ? "h-14 w-full" : "h-20 flex-1"
                    )}
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.16)" }}
                  >
                    <View className="flex-row items-center gap-2">
                      <ThumbsDown size={24} color="#FFFFFF" />
                      <Text className="text-xl font-body-bold text-white">
                        Nein
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </>
            )}

            {timerState === "success" && (
              <>
                <Text className="mb-5 text-center text-4xl font-headline text-white">
                  Super!
                </Text>
                <View className="flex-row items-center gap-3">
                  <Award size={36} color={palette.chartPrimary} />
                  <Text className="text-center text-[22px] font-body-bold" style={{ color: palette.chartPrimary }}>
                    +{task.bonusStars} Bonus-Sterne!
                  </Text>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
