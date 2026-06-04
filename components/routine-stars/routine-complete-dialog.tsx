import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { CircleCheckBig, Sparkles, Star } from "lucide-react-native";
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
import routineCompleteBackground from "@/assets/images/task-success-bg.png";
import routineCompleteHero from "@/assets/images/reward-star-gift-soft.png";

interface RoutineCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  childTheme?: ChildTheme;
}

const RING_PARTICLES = [
  { type: "star", left: 2, top: 34, size: 17, color: "#F7B633" },
  { type: "sparkle", left: 22, top: 8, size: 15, color: "#8BCDEB" },
  { type: "pill", left: 138, top: 24, width: 20, rotate: "18deg", color: "#F2A6CA" },
  { type: "star", left: 150, top: 72, size: 14, color: "#B9AAF2" },
  { type: "sparkle", left: 126, top: 4, size: 14, color: "#F7B633" },
  { type: "dot", left: 10, top: 94, size: 8, color: "#8BCDEB" },
  { type: "dot", left: 148, top: 110, size: 8, color: "#F7B633" },
  { type: "pill", left: 0, top: 116, width: 18, rotate: "-26deg", color: "#A793F4" },
] as const;

function CelebrationRing() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: 170,
        height: 138,
        left: "50%",
        marginLeft: -85,
        top: 0,
      }}
    >
      {RING_PARTICLES.map((particle, index) => {
        if (particle.type === "star") {
          return (
            <Star
              key={index}
              size={particle.size}
              color={particle.color}
              fill={particle.color}
              style={{ position: "absolute", left: particle.left, top: particle.top }}
            />
          );
        }

        if (particle.type === "sparkle") {
          return (
            <Sparkles
              key={index}
              size={particle.size}
              color={particle.color}
              style={{ position: "absolute", left: particle.left, top: particle.top }}
            />
          );
        }

        if (particle.type === "dot") {
          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: particle.color,
              }}
            />
          );
        }

        return (
          <View
            key={index}
            style={{
              position: "absolute",
              left: particle.left,
              top: particle.top,
              width: particle.width,
              height: 7,
              borderRadius: 999,
              backgroundColor: particle.color,
              transform: [{ rotate: particle.rotate }],
            }}
          />
        );
      })}
    </View>
  );
}

export function RoutineCompleteDialog({
  isOpen,
  onClose,
  childTheme,
}: RoutineCompleteDialogProps) {
  const router = useRouter();
  const palette = getThemePalette(childTheme);

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
          className="items-center overflow-hidden rounded-[30px] border p-0"
          style={{
            backgroundColor: "#FFF9F0",
            borderColor: "rgba(255,255,255,0.9)",
            padding: 0,
            shadowColor: "#2E3A68",
            shadowOpacity: 0.18,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 14 },
          }}
        >
          <Image
            source={routineCompleteBackground}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={160}
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: "rgba(255,255,255,0.08)" },
            ]}
          />

          <View className="w-full items-center px-5 pb-5 pt-6">
            <View
              className="mb-3 rounded-full px-3.5 py-2"
              style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
            >
              <Text
                className="text-[11px] font-body-bold uppercase tracking-[1px]"
                style={{ color: palette.accentText }}
              >
                Routine komplett
              </Text>
            </View>

            <View className="mb-2 h-[130px] w-full items-center justify-center">
              <CelebrationRing />
              <Animated.View style={starAnimatedStyle}>
                <Image
                  source={routineCompleteHero}
                  style={{ width: 132, height: 132 }}
                  contentFit="contain"
                  transition={160}
                />
              </Animated.View>
            </View>

            <DialogHeader className="items-center">
              <DialogTitle className="text-center text-[38px] leading-[44px] text-[#071A49]">
                Super!
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-[270px] text-center text-[16px] leading-6">
                Alle Aufgaben geschafft. Die Sterne sind gesichert.
              </DialogDescription>
            </DialogHeader>

            <View
              className="mt-3 w-full rounded-[18px] px-4 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
            >
              <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Nächster Moment
              </Text>
              <Text className="mt-1 text-base font-headline leading-6 text-foreground">
                Belohnung ansehen oder weiter Routinen erledigen.
              </Text>
            </View>

            <View
              className="mt-4 h-[54px] w-[54px] items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(240,247,236,0.86)" }}
            >
              <View
                className="h-[40px] w-[40px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#DCEED3",
                  borderWidth: 1,
                }}
              >
                <CircleCheckBig size={26} color="#7FB565" strokeWidth={3} />
              </View>
            </View>

            <View className="mt-4 w-full gap-3">
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
          </View>
        </DialogContent>
      </Animated.View>
    </Dialog>
  );
}
