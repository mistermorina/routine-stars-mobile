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
  }, [child.stars, prevStars, starScale]);

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
      <View className="px-4 pb-2 pt-2">
        <View
          className="overflow-hidden rounded-[24px] border px-4 pb-4 pt-3"
          style={{
            backgroundColor: palette.cardTint,
            borderColor: palette.accentBorder,
          }}
        >
          <View
            className="absolute right-[-18px] top-[-14px] h-24 w-24 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.24 }}
          />
          <View
            className="absolute left-[-8px] top-12 h-14 w-14 rounded-full"
            style={{ backgroundColor: palette.motifPrimary, opacity: 0.18 }}
          />

          <View className="flex-row items-start justify-between">
            <View className="mr-3 flex-1 flex-row items-center gap-3">
              <View
                className="h-[52px] w-[52px] items-center justify-center rounded-[20px]"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Text className="text-[28px]">{child.avatar}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-body text-muted-foreground">
                    Hallo {child.name}
                  </Text>
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Text
                      className="text-[10px] font-body-semibold uppercase tracking-[0.7px]"
                      style={{ color: palette.accentText }}
                    >
                      Storyworld
                    </Text>
                  </View>
                </View>
                <View className="mt-1 flex-row items-center gap-2">
                  <Star size={18} fill="#FFD700" color="#FFD700" />
                  <Text className="text-[17px] font-headline text-foreground">
                    Routine Stars
                  </Text>
                </View>
                <Text className="mt-1 text-sm font-body" style={{ color: palette.accentText }}>
                  Heute in kleinen Schritten, großen Sternmomenten.
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
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
                style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
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
              contentContainerClassName="gap-2 pt-4"
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
                            backgroundColor: "rgba(255,255,255,0.74)",
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
            <View className="pt-4">
              <View
                className="rounded-[16px] px-3.5 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
              >
                <Text className="text-sm font-body text-muted-foreground">
                  Heute im Fokus: kleine Schritte, große Sterne.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
