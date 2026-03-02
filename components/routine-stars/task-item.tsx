import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Star, Check, Clock } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import type { Task } from "@/lib/types";

const SWIPE_THRESHOLD = -80;

interface TaskItemProps {
  task: Task;
  routineColor?: string;
  onComplete: (bonusStars?: number) => void;
  onStartTimer: (task: Task) => void;
}

export function TaskItem({
  task,
  routineColor,
  onComplete,
  onStartTimer,
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isAnimating, setIsAnimating] = useState(false);

  // Star flight animation values
  const starTranslateY = useSharedValue(0);
  const starOpacity = useSharedValue(0);
  const starScale = useSharedValue(1);

  // Row press animation
  const rowScale = useSharedValue(1);

  // Swipe animation
  const translateX = useSharedValue(0);

  useEffect(() => {
    setIsCompleted(task.completed);
    if (task.completed) {
      setIsAnimating(false);
      translateX.value = withTiming(0, { duration: 300 });
    }
  }, [task.completed]);

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
        translateX.value = withTiming(-120, { duration: 200 });
        runOnJS(handlePress)();
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
    transform: [{ scale: rowScale.value }],
  }));

  const swipeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const Icon = getIcon(task.iconName);
  const hasTimer = task.timerInMinutes && task.timerInMinutes > 0;

  // Star color: use routineColor, fall back to gold (completed) or gray (incomplete)
  const starColor = routineColor || (isCompleted ? "#FFD700" : "#737373");

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
      <View style={{ borderRadius: 12, overflow: "hidden" }}>
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
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    backgroundColor: "#f5f5f5",
                    padding: 16,
                    opacity: isCompleted ? 0.5 : 1,
                  },
                ]}
              >
                {/* Icon */}
                <View className="mr-3">
                  <Icon
                    size={28}
                    color={isCompleted ? "#737373" : routineColor || "#737373"}
                  />
                </View>

                {/* Title */}
                <Text
                  className={cn(
                    "flex-1 text-base font-body-semibold text-foreground",
                    isCompleted && "text-muted-foreground line-through"
                  )}
                >
                  {task.title}
                </Text>

                {/* Timer button or star count */}
                {hasTimer && !isCompleted ? (
                  <View className="items-center">
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        onStartTimer(task);
                      }}
                      className="flex-row items-center gap-1.5 rounded-lg bg-primary/90 px-3 py-1.5"
                    >
                      <Clock size={14} color="#1a1a2e" />
                      <Text className="text-sm font-body-semibold text-primary-foreground">
                        Timer
                      </Text>
                    </Pressable>
                    <Text className="text-xs text-muted-foreground mt-1">
                      +{task.bonusStars} Bonus
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1">
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
