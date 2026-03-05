import React, { useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Star, Settings } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { getThemePalette } from "@/lib/theme";
import type { Child } from "@/lib/types";

interface HeaderProps {
  child: Child;
  allChildren?: Child[];
  onSelectChild?: (id: string) => void;
}

export function Header({ child, allChildren, onSelectChild }: HeaderProps) {
  const router = useRouter();
  const starScale = useSharedValue(1);
  const prevStars = useSharedValue(child.stars);
  const palette = getThemePalette(child.theme);

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
              className="flex-row items-center gap-1.5 rounded-full px-3.5 py-1.5"
              style={[
                starAnimatedStyle,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.accentBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <Star size={18} fill="#FFD700" color="#FFD700" />
              <Text className="text-base font-body-bold" style={{ color: palette.accentText }}>
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

      {/* Child name / switcher */}
      <View className="px-4 pb-2">
        {allChildren && allChildren.length > 1 && onSelectChild ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2"
          >
            {allChildren.map((c) => {
              const isActive = c.id === child.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => onSelectChild(c.id)}
                  className={cn(
                    "flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
                    isActive ? "" : "bg-card border-border"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: palette.accentSoft,
                          borderColor: palette.accent,
                        }
                      : undefined
                  }
                >
                  <Text className="text-sm">{c.avatar}</Text>
                  <Text
                    className={cn(
                      "text-sm font-body-semibold",
                      isActive ? "" : "text-muted-foreground"
                    )}
                    style={isActive ? { color: palette.accentText } : undefined}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <Text className="text-base font-body-semibold text-muted-foreground">
            {child.name}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
