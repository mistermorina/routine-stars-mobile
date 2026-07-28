import React, { useEffect, useRef, useState } from "react";
import { Text, useWindowDimensions, View, type DimensionValue } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Flame, Lock, Sparkles, Star } from "@/lib/icons";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { durations, easings, enterStagger, springs, timings } from "@/lib/motion";
import type { ThemePalette } from "@/lib/theme";

interface MilestoneBadgesProps {
  totalStars: number;
  streak: number;
  stickerCount: number;
  palette: ThemePalette;
  /**
   * Re-baselines the "newly earned" celebration on a child switch — another
   * child's badges are not this child's fresh win.
   */
  childId?: string;
}

interface MilestoneDef {
  id: string;
  value: string;
  label: string;
  icon: typeof Star;
  achieved: boolean;
}

/** Scale the tile pops in from. */
const POP_FROM = 0.9;
/** Mirrors enterStagger's defaults so tile scale and fade travel together. */
const STAGGER_STEP = 40;
const STAGGER_CAP = 240;

function staggerDelay(index: number) {
  return Math.min(Math.max(0, index) * STAGGER_STEP, STAGGER_CAP);
}

interface MilestoneBadgeProps {
  milestone: MilestoneDef;
  index: number;
  width: DimensionValue;
  palette: ThemePalette;
  /** True for a badge that flipped to "earned" while the screen was open. */
  isNew: boolean;
}

function MilestoneBadge({ milestone, index, width, palette, isNew }: MilestoneBadgeProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(POP_FROM);
  const haloOpacity = useSharedValue(0);
  const haloScale = useSharedValue(0.85);
  // Captured once: re-sorting badges must not re-trigger the entrance pop.
  const popDelay = useRef(staggerDelay(index)).current;
  const hasPopped = useRef(false);
  const Icon = milestone.icon;

  useEffect(() => {
    // Also catches reduce-motion resolving after mount: cancels a pending pop.
    if (reduceMotion) {
      scale.value = 1;
      return;
    }
    if (hasPopped.current) return;

    hasPopped.current = true;
    scale.value = withDelay(popDelay, withSpring(1, springs.bouncy));
  }, [popDelay, reduceMotion, scale]);

  useEffect(() => {
    // Visual only — star-account.tsx owns the "profile_milestone" feedback.
    if (!isNew || reduceMotion) return;

    scale.value = withSequence(
      withSpring(1.16, springs.bouncy),
      withSpring(1, springs.playful)
    );
    haloOpacity.value = withSequence(
      withTiming(0.5, timings.fast),
      withTiming(0, { duration: durations.celebration - durations.fast, easing: easings.out })
    );
    haloScale.value = withSequence(
      withTiming(0.95, timings.fast),
      withTiming(1.6, { duration: durations.celebration - durations.fast, easing: easings.out })
    );
  }, [haloOpacity, haloScale, isNew, reduceMotion, scale]);

  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  return (
    <Animated.View entering={enterStagger(index)} style={{ width }}>
      <Animated.View
        className="min-h-[132px] items-center rounded-tile border px-2 py-3"
        style={[
          tileStyle,
          {
            backgroundColor: milestone.achieved ? palette.cardTint : "rgba(255,255,255,0.6)",
            borderColor: milestone.achieved ? palette.accentBorder : "#E7EDF3",
          },
        ]}
        accessible
        accessibilityLabel={`Meilenstein ${milestone.value} ${milestone.label}${milestone.achieved ? ", erreicht" : ", noch offen"}`}
      >
        <View className="h-12 w-12 items-center justify-center">
          <Animated.View
            pointerEvents="none"
            className="absolute h-12 w-12 rounded-full"
            style={[haloStyle, { backgroundColor: palette.accent }]}
          />
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{
              backgroundColor: milestone.achieved ? palette.surface : "#F1F4F8",
              borderWidth: 2,
              borderColor: milestone.achieved ? "#F7C948" : "#E2E8EF",
            }}
          >
            {milestone.achieved ? (
              <Icon size={20} color="#B97E0B" fill={milestone.icon === Star ? "#F7C948" : "none"} />
            ) : (
              <Lock size={16} color="#ADB7C2" />
            )}
          </View>
        </View>
        <Text
          className="mt-2 text-base font-headline leading-5"
          style={{ color: milestone.achieved ? palette.accentText : "#ADB7C2" }}
        >
          {milestone.value}
        </Text>
        <Text
          className="text-xs font-body-semibold"
          style={{ color: milestone.achieved ? "#6B7785" : "#ADB7C2" }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.82}
        >
          {milestone.label}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Read-only achievement badges derived from existing data
 * (stars earned, streak, collected stickers) — no new progression logic.
 */
export function MilestoneBadges({
  totalStars,
  streak,
  stickerCount,
  palette,
  childId,
}: MilestoneBadgesProps) {
  const { width } = useWindowDimensions();
  const badgeWidth = width < 380 ? "31%" : "23%";
  const milestones: MilestoneDef[] = [
    { id: "streak-3", value: "3", label: "Tage-Serie", icon: Flame, achieved: streak >= 3 },
    { id: "streak-7", value: "7", label: "Tage-Serie", icon: Flame, achieved: streak >= 7 },
    { id: "stars-25", value: "25", label: "Sterne", icon: Star, achieved: totalStars >= 25 },
    { id: "stars-50", value: "50", label: "Sterne", icon: Star, achieved: totalStars >= 50 },
    { id: "stars-100", value: "100", label: "Sterne", icon: Star, achieved: totalStars >= 100 },
    { id: "sticker-5", value: "5", label: "Sticker", icon: Sparkles, achieved: stickerCount >= 5 },
    { id: "sticker-10", value: "10", label: "Sticker", icon: Sparkles, achieved: stickerCount >= 10 },
  ];
  // Achieved badges first, then the next goals — kids see wins before gaps.
  const sorted = [...milestones].sort((a, b) => Number(b.achieved) - Number(a.achieved));
  const achievedIds = milestones.filter((entry) => entry.achieved).map((entry) => entry.id);
  const achievedCount = achievedIds.length;
  const achievedKey = achievedIds.join("|");

  const [celebratingIds, setCelebratingIds] = useState<string[]>([]);
  // `null` means "not baselined yet", so the first paint never celebrates.
  const seenRef = useRef<Set<string> | null>(null);
  const childRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const current = achievedKey ? achievedKey.split("|") : [];
    const seen = seenRef.current;

    if (seen === null || childRef.current !== childId) {
      childRef.current = childId;
      seenRef.current = new Set(current);
      setCelebratingIds((ids) => (ids.length === 0 ? ids : []));
      return;
    }

    const fresh = current.filter((id) => !seen.has(id));
    seenRef.current = new Set(current);

    if (fresh.length > 0) {
      setCelebratingIds(fresh);
    }
  }, [achievedKey, childId]);

  return (
    <View>
      <View className="flex-row items-center justify-between gap-3 px-1">
        <Text className="text-lg font-headline text-foreground">Meilensteine</Text>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
        >
          <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
            {achievedCount} erreicht
          </Text>
        </View>
      </View>
      <View className="flex-row flex-wrap gap-2 px-1 py-3">
        {sorted.map((milestone, index) => (
          <MilestoneBadge
            key={milestone.id}
            milestone={milestone}
            index={index}
            width={badgeWidth}
            palette={palette}
            isNew={celebratingIds.includes(milestone.id)}
          />
        ))}
      </View>
    </View>
  );
}
