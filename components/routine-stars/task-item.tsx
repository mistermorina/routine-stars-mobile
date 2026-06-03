import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Star, Check, Clock } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { getThemePalette } from "@/lib/theme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { ChildTheme, Task } from "@/lib/types";

const SWIPE_THRESHOLD = -80;

interface TaskItemProps {
  task: Task;
  routineColor?: string;
  childTheme?: ChildTheme;
  isSuggested?: boolean;
  onComplete: (bonusStars?: number) => void;
  onStartTimer: (task: Task) => void;
}

export function TaskItem({
  task,
  routineColor,
  childTheme,
  isSuggested = false,
  onComplete,
  onStartTimer,
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isAnimating, setIsAnimating] = useState(false);
  const reduceMotion = useReducedMotion();
  const palette = getThemePalette(childTheme);

  // Star flight animation values
  const starTranslateY = useSharedValue(0);
  const starOpacity = useSharedValue(0);
  const starScale = useSharedValue(1);

  // Row press animation
  const rowScale = useSharedValue(1);
  const attentionScale = useSharedValue(1);

  // Swipe animation
  const translateX = useSharedValue(0);

  useEffect(() => {
    setIsCompleted(task.completed);
    if (task.completed) {
      setIsAnimating(false);
      translateX.value = withTiming(0, { duration: 300 });
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
    setIsCompleted(true);
    setIsAnimating(false);
  };

  const handlePress = () => {
    if (isCompleted || isAnimating) return;

    // If task has timer, delegate to timer modal
    if (task.timerInMinutes && task.timerInMinutes > 0) {
      onStartTimer(task);
      return;
    }

    // Start star flight animation
    setIsAnimating(true);
    starOpacity.value = 1;
    starScale.value = 1.4;
    starTranslateY.value = 0;

    starTranslateY.value = withTiming(-80, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    starScale.value = withSequence(
      withTiming(1.6, { duration: 200 }),
      withTiming(0.5, { duration: 500 })
    );

    starOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 500 }, () => {
        runOnJS(finishAnimation)();
      })
    );

    onComplete();
  };

  const handlePressIn = () => {
    if (!isCompleted && !isAnimating) {
      rowScale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    rowScale.value = withSpring(1, { damping: 15, stiffness: 300 });
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
        runOnJS(handlePress)();
        translateX.value = withTiming(0, { duration: 180 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
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

  const starColor = isCompleted ? "#9A6A00" : routineColor || "#737373";
  const taskSurface = isCompleted
    ? "#FFFFFF"
    : isSuggested
      ? palette.heroSurface
      : "#FFFFFF";

  return (
    <View className="relative">
      {/* Flying star animation */}
      {isAnimating && !hasTimer && (
        <Animated.View
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
            style={{ backgroundColor: routineColor || "#FFD700" }}
          >
            <Star size={16} fill="#FFFFFF" color="#FFFFFF" />
          </View>
        </Animated.View>
      )}

      {/* Swipe backdrop with overflow hidden */}
      <View style={{ overflow: "hidden" }}>
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
            <Text style={{ color: "#FFFFFF", fontSize: 11, marginTop: 2, fontWeight: "600" }}>
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
              disabled={isCompleted || isAnimating}
            >
              <Animated.View
            style={[
                  rowAnimatedStyle,
                  {
                    alignSelf: "stretch",
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 0,
                    backgroundColor: taskSurface,
                    borderWidth: 1,
                    borderColor: isCompleted
                      ? "rgba(154,106,0,0.18)"
                      : isSuggested
                        ? palette.accentBorder
                        : "rgba(255,255,255,0.2)",
                    padding: 16,
                    width: "100%",
                  },
                ]}
              >
                {/* Icon */}
                <View
                  className="mr-3 h-12 w-12 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: isCompleted ? palette.tabActiveBg : isSuggested ? "#FFFFFF" : palette.surface }}
                >
                  <Icon
                    size={24}
                    color={isCompleted ? "#8A8A8A" : routineColor || "#737373"}
                  />
                </View>

                {/* Title */}
                <View className="flex-1 min-w-0 pr-3">
                  <Text
                    className={cn(
                      "text-base font-body-semibold text-foreground",
                      isCompleted && "line-through"
                    )}
                    style={isCompleted ? { color: "#6B6B6B" } : undefined}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>
                </View>

                {/* Timer button or star count */}
                {hasTimer && !isCompleted ? (
                  <View className="min-w-[92px] items-end gap-1">
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        onStartTimer(task);
                      }}
                      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                      style={{ backgroundColor: palette.button }}
                    >
                      <Clock size={14} color="#FFFFFF" />
                      <Text className="text-sm font-body-semibold text-white">
                        Timer
                      </Text>
                    </Pressable>
                    <Text className="text-xs font-body text-muted-foreground">
                      {hasBonus ? `+${task.bonusStars} Bonus` : `${task.timerInMinutes} Min.`}
                    </Text>
                  </View>
                ) : (
                  <View
                    className="shrink-0 flex-row items-center gap-1 rounded-full px-2.5 py-1"
                    style={{ backgroundColor: isCompleted ? palette.tabActiveBg : "rgba(255,255,255,0.82)" }}
                  >
                    <Text
                      className="text-sm font-body-bold"
                      style={{ color: starColor }}
                    >
                      {task.stars}
                    </Text>
                    <Star
                      size={18}
                      color={starColor}
                      fill={isCompleted ? starColor : "transparent"}
                    />
                  </View>
                )}
              </Animated.View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
