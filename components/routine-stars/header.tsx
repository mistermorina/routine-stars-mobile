import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChevronDown, ChevronUp, Star, Settings } from "lucide-react-native";
import { AvatarImage } from "@/components/ui/avatar-image";
import { cn } from "@/lib/utils";
import { getThemePalette } from "@/lib/theme";
import type { Child } from "@/lib/types";

interface HeaderProps {
  child: Child;
  allChildren?: Child[];
  collapsed?: boolean;
  onSelectChild?: (id: string) => void;
  onToggleCollapsed?: () => void;
}

export function Header({
  child,
  allChildren,
  collapsed = false,
  onSelectChild,
  onToggleCollapsed,
}: HeaderProps) {
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

  if (collapsed) {
    return (
      <SafeAreaView edges={["top"]} style={{ backgroundColor: palette.headerGlass }}>
        <View className="px-4 pb-2 pt-2">
          <View
            className="flex-row items-center gap-2 overflow-hidden rounded-[18px] border px-3 py-2"
            style={{
              backgroundColor: palette.cardTint,
              borderColor: palette.accentBorder,
            }}
          >
            <Pressable
              onPress={onToggleCollapsed}
              className="flex-1 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="Header ausklappen"
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <AvatarImage
                  avatar={child.avatar}
                  size={40}
                  borderRadius={14}
                  backgroundColor="transparent"
                  accessibilityLabel={`${child.name} Avatar`}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  className="text-xs font-body text-muted-foreground"
                  numberOfLines={1}
                >
                  Hallo {child.name}
                </Text>
                <Text
                  className="text-base font-headline leading-5 text-foreground"
                  numberOfLines={1}
                >
                  Routine Stars
                </Text>
              </View>
              <ChevronDown size={18} color={palette.accentText} />
            </Pressable>

            <Pressable onPress={handleStarsPress} hitSlop={8}>
              <Animated.View
                className="rounded-full px-3 py-1.5"
                style={[
                  starAnimatedStyle,
                  {
                    alignItems: "center",
                    backgroundColor: palette.surface,
                    borderRadius: 999,
                    borderColor: palette.accentBorder,
                    borderWidth: 1,
                    flexDirection: "row",
                    gap: 6,
                    minWidth: 56,
                  },
                ]}
              >
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Text
                  className="text-sm font-body-bold leading-5"
                  numberOfLines={1}
                  style={{ color: palette.accentText }}
                >
                  {child.stars}
                </Text>
              </Animated.View>
            </Pressable>

            <Pressable
              onPress={handleSettingsPress}
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Elternbereich öffnen"
            >
              <Settings size={19} color={palette.accentText} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: palette.headerGlass }}>
      <View className="px-4 pb-2 pt-2">
        <View
          className="overflow-hidden rounded-[22px] border px-4 pb-4 pt-3"
          style={{
            backgroundColor: palette.cardTint,
            borderColor: palette.accentBorder,
          }}
        >
          <View
            className="absolute right-[-18px] top-[-18px] h-24 w-24 rounded-full"
            style={{ backgroundColor: palette.motifSecondary, opacity: 0.16 }}
          />

          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              <View
                className="h-[54px] w-[54px] items-center justify-center rounded-[18px]"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <AvatarImage
                  avatar={child.avatar}
                  size={54}
                  borderRadius={18}
                  backgroundColor="transparent"
                  accessibilityLabel={`${child.name} Avatar`}
                />
              </View>
              <View className="flex-1">
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text className="text-sm font-body text-muted-foreground">
                    Hallo {child.name}
                  </Text>
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Text
                      className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                      style={{ color: palette.accentText }}
                    >
                      Storyworld
                    </Text>
                  </View>
                </View>
                <View className="mt-1 flex-row items-center gap-2">
                  <Star size={18} fill="#FFD700" color="#FFD700" />
                  <Text
                    className="flex-1 text-[19px] font-headline leading-6 text-foreground"
                    numberOfLines={1}
                  >
                    Routine Stars
                  </Text>
                </View>
                <Pressable onPress={handleStarsPress} className="mt-2 self-start">
                  <Animated.View
                    className="rounded-full px-3 py-1.5"
                    style={[
                      starAnimatedStyle,
                      {
                        alignItems: "center",
                        backgroundColor: palette.surface,
                        borderRadius: 999,
                        borderColor: palette.accentBorder,
                        borderWidth: 1,
                        flexDirection: "row",
                        gap: 6,
                        minWidth: 58,
                      },
                    ]}
                  >
                    <Star size={17} fill="#FFD700" color="#FFD700" />
                    <Text
                      className="text-base font-body-bold leading-5"
                      numberOfLines={1}
                      style={{ color: palette.accentText }}
                    >
                      {child.stars}
                    </Text>
                  </Animated.View>
                </Pressable>
              </View>
            </View>

            <View className="gap-2">
              <Pressable
                onPress={onToggleCollapsed}
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Header einklappen"
              >
                <ChevronUp size={19} color={palette.accentText} />
              </Pressable>
              <Pressable
                onPress={handleSettingsPress}
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Elternbereich öffnen"
              >
                <Settings size={19} color={palette.accentText} />
              </Pressable>
            </View>
          </View>

          {allChildren && allChildren.length > 1 && onSelectChild ? (
            <View className="flex-row flex-wrap gap-2 pt-3">
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
                    <AvatarImage
                      avatar={c.avatar}
                      size={24}
                      borderRadius={12}
                      accessibilityLabel={`${c.name} Avatar`}
                    />
                    <Text
                      className={cn(
                        "text-sm font-body-semibold",
                        isActive ? "" : "text-muted-foreground"
                      )}
                      style={isActive ? { color: palette.accentText } : undefined}
                      numberOfLines={1}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
