import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, Modal, Dimensions } from "react-native";
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
import type { Task } from "@/lib/types";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type TimerState = "running" | "confirming" | "success";

interface TaskTimerModalProps {
  task: Task | null;
  childName: string;
  onClose: (success: boolean) => void;
}

export function TaskTimerModal({
  task,
  childName,
  onClose,
}: TaskTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timerState, setTimerState] = useState<TimerState>("running");

  // Circle animation
  const circleProgress = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  const CIRCLE_RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

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
  }, [task]);

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

  // Update circle progress based on time
  useEffect(() => {
    if (task && task.timerInMinutes) {
      const totalSeconds = task.timerInMinutes * 60;
      const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
      circleProgress.value = withTiming(progress, {
        duration: 1000,
        easing: Easing.linear,
      });
    }
  }, [timeLeft, task]);

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
    [onClose]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!task) {
    return null;
  }

  const { width: screenWidth } = Dimensions.get("window");
  const circleSize = Math.min(screenWidth * 0.65, 260);
  const viewBox = `0 0 ${CIRCLE_RADIUS * 2 + 24} ${CIRCLE_RADIUS * 2 + 24}`;
  const center = CIRCLE_RADIUS + 12;

  return (
    <Modal
      visible={!!task}
      transparent
      animationType="fade"
      onRequestClose={() => onClose(false)}
    >
      <View className="flex-1 bg-black/85 items-center justify-center">
        {showConfetti && <Confetti />}

        {/* Close button */}
        <Pressable
          onPress={() => onClose(false)}
          className="absolute top-16 right-6 z-50 h-12 w-12 items-center justify-center rounded-full"
          hitSlop={12}
        >
          <X size={28} color="rgba(255,255,255,0.7)" />
        </Pressable>

        <Animated.View
          style={contentAnimatedStyle}
          className="items-center justify-center px-6"
        >
          {timerState === "running" && (
            <>
              <Text className="text-3xl font-headline text-white text-center mb-2">
                {task.title}
              </Text>
              <Text className="text-base font-body text-white/70 text-center mb-8">
                Schaffst du es rechtzeitig?
              </Text>

              {/* Timer circle */}
              <View
                style={{ width: circleSize, height: circleSize }}
                className="items-center justify-center mb-8"
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
                  {/* Background circle */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={10}
                  />
                  {/* Progress circle */}
                  <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={CIRCLE_RADIUS}
                    fill="none"
                    stroke="#F3E5AB"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    animatedProps={circleAnimatedProps}
                  />
                </Svg>
                <Text className="text-5xl font-body-bold text-white">
                  {formatTime(timeLeft)}
                </Text>
              </View>

              {/* Finish button */}
              <Button
                onPress={handleChildFinished}
                className="w-56 h-14 mb-4"
                size="lg"
              >
                <View className="flex-row items-center gap-3">
                  <Check size={24} color="#1a1a2e" />
                  <Text className="text-xl font-body-bold text-primary-foreground">
                    Fertig!
                  </Text>
                </View>
              </Button>

              {/* Bonus stars indicator */}
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
              <Text className="text-3xl font-headline text-white text-center mb-4">
                Hat {childName} die Aufgabe geschafft?
              </Text>
              <Text className="text-base font-body text-white/70 text-center mb-10">
                Bestaetige, ob die Aufgabe rechtzeitig erledigt wurde.
              </Text>
              <View className="flex-row gap-5">
                <Pressable
                  onPress={() => handleParentConfirmation(true)}
                  className="w-36 h-20 items-center justify-center rounded-xl bg-green-500 active:bg-green-600"
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
                  className="w-36 h-20 items-center justify-center rounded-xl bg-red-500 active:bg-red-600"
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
              <Text className="text-5xl font-headline text-white text-center mb-6">
                Super!
              </Text>
              <View className="flex-row items-center gap-3">
                <Award size={36} color="#FFD700" />
                <Text className="text-2xl font-body-bold text-gold">
                  +{task.bonusStars} Bonus-Sterne!
                </Text>
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
