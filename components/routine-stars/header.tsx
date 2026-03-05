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
    <SafeAreaView edges={["top"]} style={{ backgroundColor: palette.headerGlass }}>
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Text className="text-2xl">{child.avatar}</Text>
            </View>
            <View>
              <Text className="text-sm font-body text-muted-foreground">Hallo {child.name}</Text>
              <View className="mt-1 flex-row items-center gap-2">
                <Star size={18} fill="#FFD700" color="#FFD700" />
                <Text className="text-2xl font-headline text-foreground">
                  Routine Stars
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Pressable onPress={handleStarsPress}>
              <Animated.View
                className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2"
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

            <Pressable
              onPress={handleSettingsPress}
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              hitSlop={8}
            >
              <Settings size={20} color={palette.accentText} />
            </Pressable>
          </View>
        </View>

        {allChildren && allChildren.length > 1 && onSelectChild ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 pt-3"
          >
            {allChildren.map((c) => {
              const isActive = c.id === child.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => onSelectChild(c.id)}
                  className={cn(
                    "flex-row items-center gap-1.5 rounded-full border px-3 py-2",
                    isActive ? "" : "border-border"
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: palette.tabActiveBg,
                          borderColor: palette.accent,
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.68)",
                        }
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
          <View className="pt-3">
            <Text className="text-sm font-body text-muted-foreground">
              Heute im Fokus: kleine Schritte, große Sterne.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
