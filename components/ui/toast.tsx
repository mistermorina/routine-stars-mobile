import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import type { ToastData } from "@/hooks/use-toast";

interface ToastOverlayProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastOverlay({ toasts, onDismiss }: ToastOverlayProps) {
  if (toasts.length === 0) return null;

  return (
    <View className="absolute bottom-24 left-4 right-4 z-50 items-center gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </View>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => onDismiss(toast.id)}
        className={cn(
          "w-full rounded-xl px-4 py-3 shadow-lg",
          toast.variant === "destructive" ? "bg-destructive" : "bg-card border border-border"
        )}
      >
        <Text
          className={cn(
            "font-body-semibold text-sm",
            toast.variant === "destructive"
              ? "text-destructive-foreground"
              : "text-card-foreground"
          )}
        >
          {toast.title}
        </Text>
        {toast.description && (
          <Text
            className={cn(
              "font-body text-xs mt-0.5",
              toast.variant === "destructive"
                ? "text-destructive-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {toast.description}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
