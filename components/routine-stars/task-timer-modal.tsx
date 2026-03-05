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

  const CIRCLE_RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
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
    strokeDashoffset: CIRCUMFERENCE * (1 - circleProgress.value),
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
    screenWidth * 0.64,
    isCompactLayout ? screenHeight * 0.34 : screenHeight * 0.4,
    isCompactLayout ? 220 : 260
  );
  const viewBox = `0 0 ${CIRCLE_RADIUS * 2 + 24} ${CIRCLE_RADIUS * 2 + 24}`;
  const center = CIRCLE_RADIUS + 12;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <View className="flex-1 bg-black/85 px-5 py-8">
        {showConfetti && <Confetti />}

        <Pressable
          onPress={() => onClose(false)}
          className="absolute right-6 top-16 z-50 h-12 w-12 items-center justify-center rounded-full"
          hitSlop={12}
        >
          <X size={28} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Animated.View
            style={contentAnimatedStyle}
            className="w-full max-w-[360px] items-center justify-center self-center"
          >
            {timerState === "running" && (
              <>
                <Text
                  className={cn(
                    "font-headline text-center text-white",
                    isCompactLayout ? "mb-2 text-[28px] leading-[34px]" : "mb-2 text-3xl"
                  )}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <Text
                  className={cn(
                    "font-body text-center text-white/70",
                    isCompactLayout ? "mb-6 text-sm" : "mb-8 text-base"
                  )}
                >
                  Schaffst du es rechtzeitig?
                </Text>

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
                      r={CIRCLE_RADIUS}
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth={10}
                    />
                    <AnimatedCircle
                      cx={center}
                      cy={center}
                      r={CIRCLE_RADIUS}
                      fill="none"
                      stroke={palette.button}
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
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
                  <Award size={20} color="#FFD700" />
                  <Text className="text-base font-body-semibold text-white/80">
                    +{task.bonusStars} Bonus-Sterne
                  </Text>
                </View>
              </>
            )}

            {timerState === "confirming" && (
              <>
                <Text className="mb-4 text-center text-3xl font-headline text-white">
                  Hat {childName} die Aufgabe geschafft?
                </Text>
                <Text className="mb-8 text-center text-base font-body text-white/70">
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
                      "items-center justify-center rounded-xl bg-green-500 active:bg-green-600",
                      isCompactLayout ? "h-14 w-full" : "h-20 flex-1"
                    )}
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
                      "items-center justify-center rounded-xl bg-red-500 active:bg-red-600",
                      isCompactLayout ? "h-14 w-full" : "h-20 flex-1"
                    )}
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
                <Text className="mb-6 text-center text-5xl font-headline text-white">
                  Super!
                </Text>
                <View className="flex-row items-center gap-3">
                  <Award size={36} color="#FFD700" />
                  <Text className="text-2xl font-body-bold" style={{ color: palette.button }}>
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
