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
    ? undefined
    : hasTimer
      ? "Öffnet den Timer für diese Aufgabe."
      : "Tippen oder nach links wischen, um die Aufgabe zu erledigen.";

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
              accessibilityRole="button"
              accessibilityLabel={taskAccessibilityLabel}
              accessibilityHint={taskAccessibilityHint}
              accessibilityState={{ disabled: isCompleted || isAnimating, checked: isCompleted }}
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
                <View
                  className="mr-3 h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isCompleted ? starColor : "#FFFFFF",
                    borderColor: starColor,
                    borderWidth: 2,
                  }}
                >
                  {isCompleted ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : null}
                </View>

                {/* Icon */}
                <View
                  className="mr-3 h-11 w-11 items-center justify-center rounded-[14px]"
                  style={{
                    backgroundColor: isCompleted || isSuggested ? palette.tabActiveBg : palette.surface,
                  }}
                >
                  <Icon
                    size={22}
                    color={isCompleted ? starColor : routineColor || "#737373"}
                  />
                </View>

                {/* Title */}
                <View className="flex-1 min-w-0 pr-3">
                  <Text
                    className="text-[15px] font-body-semibold leading-5 text-foreground"
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
                      className="h-10 flex-row items-center gap-1.5 rounded-full px-3"
                      style={{ backgroundColor: palette.button }}
                      hitSlop={6}
                      accessibilityRole="button"
                      accessibilityLabel={`Timer für ${task.title} starten`}
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
                    className="shrink-0 flex-row items-center gap-1 px-1 py-1"
                  >
                    <Text
                      className="text-sm font-body-bold"
                      style={{ color: starColor }}
                    >
                      {task.stars}
                    </Text>
                    <Star
                      size={17}
                      color={starColor}
                      fill={starColor}
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
