import React from "react";
import { View, Text, ScrollView } from "react-native";
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
import { Header } from "@/components/routine-stars/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getThemePalette } from "@/lib/theme";

function getMotivationalMessage(stars: number): string {
  if (stars === 0) return "Sammle deine ersten Sterne!";
  if (stars < 5) return "Guter Anfang!";
  if (stars < 10) return "Weiter so!";
  if (stars < 20) return "Super Fortschritt!";
  if (stars < 50) return "Du bist ein Stern-Champion!";
  return "Unglaublich! Du bist ein Superstar!";
}

function PulsingStarIcon({ accentSoft }: { accentSoft: string }) {
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
      className="h-32 w-32 rounded-full items-center justify-center"
      style={[animatedStyle, { backgroundColor: accentSoft }]}
    >
      <Star size={72} color="#FFD700" fill="#FFD700" />
    </Animated.View>
  );
}

export default function StarAccountScreen() {
  const { children, selectedChild, selectChild, isLoading } = useChildren();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground font-body">Laden...</Text>
      </View>
    );
  }

  const stars = selectedChild?.stars ?? 0;
  const childName = selectedChild?.name ?? "Kind";
  const palette = getThemePalette(selectedChild?.theme);

  return (
    <View className="flex-1 bg-background">
      {/* Header with child switcher */}
      {selectedChild && (
        <Header child={selectedChild} allChildren={children} onSelectChild={selectChild} />
      )}

      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow items-center justify-center px-5 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Card className="w-full items-center py-10 px-6">
            <CardContent className="items-center">
            {/* Animated gold star */}
            <PulsingStarIcon accentSoft={palette.accentSoft} />

            {/* Star count */}
            <Text className="text-6xl font-headline text-foreground mt-6">
              {stars}
            </Text>

            {/* Child name */}
            <Text className="text-xl font-headline mt-2" style={{ color: palette.accentText }}>
              {childName}s Sterne
            </Text>

            {/* Motivational message */}
            <View
              className="mt-4 rounded-full px-5 py-2"
              style={{ backgroundColor: palette.surface }}
            >
              <Text className="text-sm font-body-semibold text-center" style={{ color: palette.accentText }}>
                {getMotivationalMessage(stars)}
              </Text>
            </View>

            {/* Navigate to rewards */}
            <Button
              className="mt-8 w-full"
              onPress={() => router.push("/(tabs)/rewards")}
              style={{ backgroundColor: palette.button }}
              textClassName="text-white"
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
    </View>
  );
}
