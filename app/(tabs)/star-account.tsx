import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Star } from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getMotivationalMessage(stars: number): string {
  if (stars === 0) return "Sammle deine ersten Sterne!";
  if (stars < 5) return "Guter Anfang!";
  if (stars < 10) return "Weiter so!";
  if (stars < 20) return "Super Fortschritt!";
  if (stars < 50) return "Du bist ein Stern-Champion!";
  return "Unglaublich! Du bist ein Superstar!";
}

function PulsingStarIcon() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="h-32 w-32 rounded-full bg-[#FFD700]/20 items-center justify-center"
    >
      <Star size={72} color="#FFD700" fill="#FFD700" />
    </Animated.View>
  );
}

export default function StarAccountScreen() {
  const { selectedChild, isLoading } = useChildren();
  const router = useRouter();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground font-body">Laden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stars = selectedChild?.stars ?? 0;
  const childName = selectedChild?.name ?? "Kind";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow items-center justify-center px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Card className="w-full items-center py-10 px-6">
          <CardContent className="items-center">
            {/* Animated gold star */}
            <PulsingStarIcon />

            {/* Star count */}
            <Text className="text-6xl font-headline text-foreground mt-6">
              {stars}
            </Text>

            {/* Child name */}
            <Text className="text-xl font-headline text-muted-foreground mt-2">
              {childName}s Sterne
            </Text>

            {/* Motivational message */}
            <View className="mt-4 bg-[#F3E5AB]/40 rounded-full px-5 py-2">
              <Text className="text-sm font-body-semibold text-[#B8860B] text-center">
                {getMotivationalMessage(stars)}
              </Text>
            </View>

            {/* Navigate to rewards */}
            <Button
              className="mt-8 w-full bg-[#87CEEB] active:bg-[#6BB5D6]"
              onPress={() => router.push("/(tabs)/rewards")}
            >
              <Text className="text-base font-body-semibold text-white">
                Belohnungen ansehen
              </Text>
            </Button>
          </CardContent>
        </Card>

        {/* No child hint */}
        {!selectedChild && (
          <Text className="text-sm font-body text-muted-foreground text-center mt-4">
            Erstelle ein Kind-Profil, um Sterne zu sammeln.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
