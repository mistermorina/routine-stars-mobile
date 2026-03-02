import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Star, Settings } from "lucide-react-native";
import type { Child } from "@/lib/types";

interface HeaderProps {
  child: Child;
}

export function Header({ child }: HeaderProps) {
  const router = useRouter();
  const starScale = useSharedValue(1);
  const prevStars = useSharedValue(child.stars);

  useEffect(() => {
    if (child.stars !== prevStars.value) {
      prevStars.value = child.stars;
      starScale.value = withSpring(1.3, { damping: 6, stiffness: 200 }, () => {
        starScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      });
    }
  }, [child.stars]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const handleSettingsPress = () => {
    router.push("/parent-login");
  };

  const handleStarsPress = () => {
    router.push("/(tabs)/star-account");
  };

  return (
    <SafeAreaView edges={["top"]} className="bg-card/90">
      <View className="flex-row items-center justify-between px-4 py-3">
        {/* Left: App title */}
        <View className="flex-row items-center gap-2">
          <Star size={24} fill="#FFD700" color="#FFD700" />
          <Text className="text-xl font-headline text-foreground">
            Routine Stars
          </Text>
        </View>

        {/* Right: Star counter + settings */}
        <View className="flex-row items-center gap-3">
          {/* Star counter */}
          <Pressable onPress={handleStarsPress}>
            <Animated.View
              style={starAnimatedStyle}
              className="flex-row items-center gap-1.5 rounded-full bg-primary/80 px-3.5 py-1.5"
            >
              <Star size={18} fill="#FFD700" color="#FFD700" />
              <Text className="text-base font-body-bold text-primary-foreground">
                {child.stars}
              </Text>
            </Animated.View>
          </Pressable>

          {/* Settings button */}
          <Pressable
            onPress={handleSettingsPress}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-secondary"
            hitSlop={8}
          >
            <Settings size={22} color="#737373" />
          </Pressable>
        </View>
      </View>

      {/* Child name */}
      <View className="px-4 pb-2">
        <Text className="text-base font-body-semibold text-muted-foreground">
          {child.name}
        </Text>
      </View>
    </SafeAreaView>
  );
}
