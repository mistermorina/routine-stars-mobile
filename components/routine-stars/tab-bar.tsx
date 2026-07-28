import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { triggerFeedback } from "@/lib/feedback";
import { springs, timings } from "@/lib/motion";

// Brand colors on purpose (not per-child theme): useChildren keeps local
// state per consumer, so a themed tab bar would go stale on child switch.
const ACTIVE_TEXT = "#245A74";
const INACTIVE_TEXT = "#9AA5B1";
const ACTIVE_PILL = "#FFF2C8";

/** Pill geometry. Kept in JS because the pill is positioned, not laid out. */
const PILL_WIDTH = 64;
const PILL_HEIGHT = 36;
/** Row paddingTop — the pill sits behind the icon, not behind the label. */
const ROW_PADDING_TOP = 6;
/** Vertical inset of the tab button content (`py-1.5`). */
const TAB_PADDING_TOP = 6;
/** Sideways stretch while the pill travels. Transform only, no layout. */
const PILL_STRETCH = 1.06;

/** ≥12.5 so the label survives the 12px floor with room to breathe. */
const LABEL_FONT_SIZE = 12.5;
const LABEL_LINE_HEIGHT = 16;

interface TabButtonProps {
  label: string;
  focused: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
}

function TabButton({ label, focused, onPress, onLayout, icon }: TabButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      // Joy-bounce when the tab becomes active (snaps to end under reduced motion)
      scale.value = withSequence(
        withSpring(1.16, springs.bouncy),
        withSpring(1, springs.gentle)
      );
    }
  }, [focused, scale]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      className="flex-1 items-center justify-center gap-0.5 py-1.5"
    >
      <Animated.View
        style={[iconAnimatedStyle, { height: PILL_HEIGHT, width: PILL_WIDTH }]}
        className="items-center justify-center"
      >
        {icon?.({
          focused,
          color: focused ? ACTIVE_TEXT : INACTIVE_TEXT,
          size: 22,
        })}
      </Animated.View>
      <Text
        className={focused ? "font-body-semibold" : "font-body"}
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
        style={{
          fontSize: LABEL_FONT_SIZE,
          lineHeight: LABEL_LINE_HEIGHT,
          color: focused ? ACTIVE_TEXT : INACTIVE_TEXT,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Custom bottom tab bar: sliding pill, focus bounce, haptic tick. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Measured tab centers keep the pill honest even if a label wraps or a tab
  // is hidden via `href: null` — no assumptions about equal-width columns.
  const [tabCenters, setTabCenters] = useState<Record<string, number>>({});
  const hasPlacedPillRef = useRef(false);
  const pillTranslateX = useSharedValue(0);
  const pillStretch = useSharedValue(1);
  const pillOpacity = useSharedValue(0);

  const handleTabLayout = useCallback((routeKey: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    const center = x + width / 2;

    setTabCenters((previous) => {
      const known = previous[routeKey];
      if (known !== undefined && Math.abs(known - center) < 0.5) {
        return previous;
      }
      return { ...previous, [routeKey]: center };
    });
  }, []);

  const focusedKey = state.routes[state.index]?.key;
  const focusedCenter = focusedKey === undefined ? undefined : tabCenters[focusedKey];

  useEffect(() => {
    if (focusedCenter === undefined) {
      return;
    }

    const target = focusedCenter - PILL_WIDTH / 2;

    if (!hasPlacedPillRef.current) {
      // First measurement: appear in place instead of sliding in from x=0.
      hasPlacedPillRef.current = true;
      pillTranslateX.value = target;
      pillOpacity.value = withTiming(1, timings.fast);
      return;
    }

    pillTranslateX.value = withSpring(target, springs.gentle);
    // Squash-and-settle so the pill reads as one object moving, not a jump cut.
    pillStretch.value = withSequence(
      withSpring(PILL_STRETCH, springs.playful),
      withSpring(1, springs.gentle)
    );
  }, [focusedCenter, pillOpacity, pillStretch, pillTranslateX]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ translateX: pillTranslateX.value }, { scaleX: pillStretch.value }],
  }));

  return (
    <View
      className="border-t"
      style={{
        backgroundColor: "#FFFFFF",
        borderTopColor: "#ECF1F6",
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: ROW_PADDING_TOP,
      }}
    >
      <View className="flex-row">
        <Animated.View
          pointerEvents="none"
          className="absolute left-0 rounded-full"
          style={[
            {
              top: TAB_PADDING_TOP,
              height: PILL_HEIGHT,
              width: PILL_WIDTH,
              backgroundColor: ACTIVE_PILL,
            },
            pillAnimatedStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;

          const handlePress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              void triggerFeedback("tab_focus");
              navigation.navigate(route.name);
            }
          };

          return (
            <TabButton
              key={route.key}
              label={label}
              focused={focused}
              onPress={handlePress}
              onLayout={(event) => handleTabLayout(route.key, event)}
              icon={options.tabBarIcon}
            />
          );
        })}
      </View>
    </View>
  );
}
