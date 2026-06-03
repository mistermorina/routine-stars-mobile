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
  const cardLift = useSharedValue(12);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      cardLift.value = withSpring(0, { damping: 14, stiffness: 180 });
      cardOpacity.value = withTiming(1, { duration: 220 });
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
      cardLift.value = 12;
      cardOpacity.value = 0;
    }
  }, [cardLift, cardOpacity, isOpen, starRotate, starScale]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: starScale.value },
      { rotate: `${starRotate.value}deg` },
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardLift.value }],
    opacity: cardOpacity.value,
  }));

  const handleViewRewards = () => {
    onClose();
    router.push("/(tabs)/rewards");
  };

  return (
    <Dialog visible={isOpen} onClose={onClose}>
      <Animated.View style={cardAnimatedStyle}>
        <DialogContent
          className="items-center overflow-hidden rounded-[32px] px-5 py-5"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder, borderWidth: 1 }}
        >
          <View
            className="absolute inset-x-0 top-0 h-32"
            style={{ backgroundColor: palette.heroSurface }}
          />
          <View
            className="absolute right-[-22px] top-[-16px] h-28 w-28 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.32 }}
          />

          <View
            className="mb-4 rounded-full px-3 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
          >
            <Text className="text-xs font-body-semibold uppercase tracking-[0.8px]" style={{ color: palette.accentText }}>
              Routine komplett
            </Text>
          </View>

          <Animated.View style={starAnimatedStyle} className="mb-4">
            <Text className="text-5xl">⭐</Text>
          </Animated.View>

          <DialogHeader className="items-center">
            <DialogTitle className="text-center text-[28px]">
              Super!
            </DialogTitle>
            <DialogDescription className="mt-2 text-center leading-6">
              Du hast alle Aufgaben geschafft und kannst jetzt deine Sterne sichern.
            </DialogDescription>
          </DialogHeader>

          <View
            className="mt-1 w-full rounded-[22px] px-4 py-3.5"
            style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
          >
            <Text className="text-sm font-body text-muted-foreground">Nächster schöner Moment</Text>
            <Text className="mt-1 text-[16px] font-headline leading-7 text-foreground">
              Belohnung anschauen oder erst den Erfolg genießen.
            </Text>
          </View>

          <View className="mt-5 w-full gap-3">
            <Button
              onPress={handleViewRewards}
              className="h-12 w-full rounded-[20px]"
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
              className="h-12 w-full rounded-[20px]"
              style={{ borderColor: palette.accent }}
            >
              <Text className="text-base font-body-semibold text-center" style={{ color: palette.accent }}>
                Sterne sichern
              </Text>
            </Button>
          </View>
        </DialogContent>
      </Animated.View>
    </Dialog>
  );
}
