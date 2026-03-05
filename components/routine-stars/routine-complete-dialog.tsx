import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme } from "@/lib/types";

interface RoutineCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  childTheme?: ChildTheme;
}

export function RoutineCompleteDialog({
  isOpen,
  onClose,
  childTheme,
}: RoutineCompleteDialogProps) {
  const router = useRouter();
  const palette = getThemePalette(childTheme);

  // Star emoji bounce animation
  const starScale = useSharedValue(1);
  const starRotate = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      starScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 400, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 400, easing: Easing.in(Easing.quad) })
        ),
        -1,
        true
      );
      starRotate.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 300 }),
          withTiming(-15, { duration: 600 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      starScale.value = 1;
      starRotate.value = 0;
    }
  }, [isOpen]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: starScale.value },
      { rotate: `${starRotate.value}deg` },
    ],
  }));

  const handleViewRewards = () => {
    onClose();
    router.push("/(tabs)/rewards");
  };

  return (
    <Dialog visible={isOpen} onClose={onClose}>
      <DialogContent className="items-center">
        {/* Animated star emoji */}
        <Animated.View style={starAnimatedStyle} className="mb-4">
          <Text className="text-6xl">⭐</Text>
        </Animated.View>

        <DialogHeader className="items-center">
          <DialogTitle className="text-center text-2xl">
            Super!
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            Du hast alle Aufgaben geschafft!
          </DialogDescription>
        </DialogHeader>

        <View className="mt-6 w-full gap-3">
          <Button
            onPress={handleViewRewards}
            className="w-full"
            style={{ backgroundColor: palette.button }}
            textClassName="text-white"
          >
            <Text className="text-base font-body-semibold text-center text-white">
              Belohnungen ansehen
            </Text>
          </Button>
          <Button
            variant="outline"
            onPress={onClose}
            className="w-full"
            style={{ borderColor: palette.accent }}
          >
            <Text className="text-base font-body-semibold text-center" style={{ color: palette.accent }}>
              Sterne sichern
            </Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
