import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { ChevronDown, ChevronUp, Lock, Star, Settings } from "@/lib/icons";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { AvatarImage } from "@/components/ui/avatar-image";
import { ParentGateChallenge } from "@/components/parent-gate-challenge";
import { useRegisterStarFlightTarget } from "@/contexts/star-flight-target";
import { cn } from "@/lib/utils";
import { durations, enterStagger, springs } from "@/lib/motion";
import { getThemePalette, semanticColors } from "@/lib/theme";
import { BlurView } from "expo-blur";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens, getChromeTokens } from "@/lib/design-mode";
import type { Child } from "@/lib/types";

/** Travel distance of the collapse/expand content swap (px). */
const SWAP_OFFSET_Y = 8;

/**
 * Collapse/expand content swap. The incoming variant keeps travelling in the
 * direction of the toggle — collapsing rises (+1), expanding drops (-1) — and
 * fades in over the header surface, which never leaves.
 *
 * enterStagger is the only translateY-capable motion token; index 0 plus the
 * base duration turns it into a one-shot swap. No `exiting`: an exiting node
 * keeps its layout slot, which would double the header height mid-toggle.
 */
function enterSwap(direction: 1 | -1) {
  return enterStagger(0)
    .duration(durations.base)
    .withInitialValues({ transform: [{ translateY: SWAP_OFFSET_Y * direction }] });
}

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
  const { designMode } = useDesignMode();
  const chrome = getChromeTokens(designMode, palette);
  const accents = getAccentTokens(designMode, palette);
  const isGlass = chrome.blurIntensity > 0;
  // Landing point for flying stars — the pill registers itself, both variants.
  const starTarget = useRegisterStarFlightTarget();
  // Sibling protection: a child must not be able to switch to another profile
  // (and spend their stars) alone — the switch waits behind the adult gate.
  const [pendingChildId, setPendingChildId] = useState<string | null>(null);

  useEffect(() => {
    if (child.stars === prevStars.value) return;

    prevStars.value = child.stars;
    // Container bounce; the digits themselves roll via <AnimatedNumber />.
    starScale.value = withSequence(
      withSpring(1.24, springs.bouncy),
      withSpring(1, springs.playful)
    );
  }, [child.stars, prevStars, starScale]);

  useEffect(() => {
    // The pill that just mounted is still running its entering transform, so the
    // first measure would land a few px off. Re-read once the swap has settled.
    const timeout = setTimeout(starTarget.measure, durations.base);
    return () => clearTimeout(timeout);
  }, [collapsed, starTarget]);

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const handleSettingsPress = () => {
    router.push("/parent-login");
  };

  const handleStarsPress = () => {
    router.push("/(tabs)/star-account");
  };

  const handleChildPress = useCallback(
    (id: string) => {
      if (!onSelectChild) return;

      // Tapping the already active profile is not a switch — stays free.
      if (id === child.id) {
        onSelectChild(id);
        return;
      }

      setPendingChildId(id);
    },
    [child.id, onSelectChild]
  );

  const handleGateSuccess = useCallback(() => {
    if (pendingChildId) onSelectChild?.(pendingChildId);
    setPendingChildId(null);
  }, [onSelectChild, pendingChildId]);

  const handleGateCancel = useCallback(() => {
    setPendingChildId(null);
  }, []);

  const starsAccessibilityLabel = `${child.stars} Sterne. Sternenkonto öffnen`;

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: isGlass ? "transparent" : palette.headerGlass }}
    >
      {isGlass ? (
        <>
          <BlurView
            intensity={chrome.blurIntensity}
            tint="light"
            pointerEvents="none"
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: chrome.backgroundColor }]}
          />
        </>
      ) : null}
      <View className="px-4 pb-2 pt-2">
        {collapsed ? (
          <Animated.View key="header-collapsed" entering={enterSwap(1)}>
            <View
              className="flex-row items-center gap-2 overflow-hidden rounded-tile border px-3 py-2"
              style={{
                backgroundColor: isGlass ? "transparent" : palette.cardTint,
                borderColor: isGlass ? "transparent" : palette.accentBorder,
              }}
            >
              <Pressable
                onPress={onToggleCollapsed}
                className="flex-1 flex-row items-center gap-2"
                accessibilityRole="button"
                accessibilityLabel="Header ausklappen"
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-chip"
                  style={{ backgroundColor: isGlass ? accents.tileFill : palette.heroSurface }}
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
                    maxFontSizeMultiplier={1.3}
                  >
                    Hallo {child.name}
                  </Text>
                  <Text
                    className="text-base font-headline leading-5 text-foreground"
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.3}
                  >
                    Routine Stars
                  </Text>
                </View>
                <ChevronDown size={18} color={palette.accentText} />
              </Pressable>

              <Pressable
                ref={starTarget.ref}
                onLayout={starTarget.measure}
                onPress={handleStarsPress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={starsAccessibilityLabel}
              >
                <Animated.View
                  className="rounded-full px-3 py-1.5"
                  style={[
                    starAnimatedStyle,
                    {
                      alignItems: "center",
                      backgroundColor: isGlass ? accents.pillFill : palette.surface,
                      borderRadius: 999,
                      borderColor: palette.accentBorder,
                      borderWidth: 1,
                      flexDirection: "row",
                      gap: 6,
                      minWidth: 56,
                    },
                  ]}
                >
                  <Star size={16} fill={semanticColors.gold} color={semanticColors.gold} />
                  <AnimatedNumber
                    value={child.stars}
                    textClassName="text-sm font-body-bold leading-5"
                    textStyle={{ color: palette.accentText }}
                    maxFontSizeMultiplier={1.2}
                  />
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
          </Animated.View>
        ) : (
          <Animated.View key="header-expanded" entering={enterSwap(-1)}>
            <View
              className="overflow-hidden rounded-card border px-4 pb-4 pt-3"
              style={{
                backgroundColor: isGlass ? "transparent" : palette.cardTint,
                borderColor: isGlass ? "transparent" : palette.accentBorder,
              }}
            >
              <View
                className="absolute right-[-18px] top-[-18px] h-24 w-24 rounded-full"
                style={{ backgroundColor: palette.motifSecondary, opacity: 0.16 }}
              />

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 flex-row items-center gap-3">
                  <View
                    className="h-[54px] w-[54px] items-center justify-center rounded-tile"
                    style={{ backgroundColor: isGlass ? accents.tileFill : palette.heroSurface }}
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
                        style={{ backgroundColor: isGlass ? accents.pillFill : palette.tabActiveBg }}
                      >
                        <Text
                          className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                          style={{ color: palette.accentText }}
                          maxFontSizeMultiplier={1.2}
                        >
                          Storyworld
                        </Text>
                      </View>
                    </View>
                    <View className="mt-1 flex-row items-center gap-2">
                      <Star size={18} fill={semanticColors.gold} color={semanticColors.gold} />
                      <Text
                        className="flex-1 text-[19px] font-headline leading-6 text-foreground"
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        Routine Stars
                      </Text>
                    </View>
                    <Pressable
                      ref={starTarget.ref}
                      onLayout={starTarget.measure}
                      onPress={handleStarsPress}
                      className="mt-2 self-start"
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={starsAccessibilityLabel}
                    >
                      <Animated.View
                        className="rounded-full px-3 py-1.5"
                        style={[
                          starAnimatedStyle,
                          {
                            alignItems: "center",
                            backgroundColor: isGlass ? accents.pillFill : palette.surface,
                            borderRadius: 999,
                            borderColor: palette.accentBorder,
                            borderWidth: 1,
                            flexDirection: "row",
                            gap: 6,
                            minWidth: 58,
                          },
                        ]}
                      >
                        <Star size={17} fill={semanticColors.gold} color={semanticColors.gold} />
                        <AnimatedNumber
                          value={child.stars}
                          textClassName="text-base font-body-bold leading-5"
                          textStyle={{ color: palette.accentText }}
                          maxFontSizeMultiplier={1.2}
                        />
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
                <>
                  <View className="flex-row flex-wrap gap-2 pt-3">
                    {allChildren.map((c) => {
                      const isActive = c.id === child.id;
                      return (
                        <Pressable
                          key={c.id}
                          onPress={() => handleChildPress(c.id)}
                          className={cn(
                            "min-h-[44px] flex-row items-center gap-1.5 rounded-full border px-3 py-2",
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
                          accessibilityRole="button"
                          accessibilityState={{ selected: isActive }}
                          accessibilityLabel={
                            isActive
                              ? `${c.name} ist ausgewählt`
                              : `Zu ${c.name} wechseln`
                          }
                          accessibilityHint={
                            isActive
                              ? undefined
                              : "Nur für Erwachsene. Eine Rechenaufgabe muss gelöst werden."
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
                            maxFontSizeMultiplier={1.3}
                          >
                            {c.name}
                          </Text>
                          {isActive ? null : (
                            <Lock size={13} color={semanticColors.mutedForeground} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  <ParentGateChallenge
                    visible={pendingChildId !== null}
                    title="Profil wechseln"
                    onSuccess={handleGateSuccess}
                    onCancel={handleGateCancel}
                  />
                </>
              ) : null}
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
