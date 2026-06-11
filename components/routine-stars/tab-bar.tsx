import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { triggerFeedback } from "@/lib/feedback";
import { springs } from "@/lib/motion";

// Brand colors on purpose (not per-child theme): useChildren keeps local
// state per consumer, so a themed tab bar would go stale on child switch.
const ACTIVE_TEXT = "#245A74";
const INACTIVE_TEXT = "#9AA5B1";
const ACTIVE_PILL = "#FFF2C8";

interface TabButtonProps {
  label: string;
  focused: boolean;
  onPress: () => void;
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
}

function TabButton({ label, focused, onPress, icon }: TabButtonProps) {
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      className="flex-1 items-center justify-center gap-0.5 py-1.5"
    >
      <Animated.View
        style={iconAnimatedStyle}
        className="h-9 w-16 items-center justify-center rounded-full"
      >
        <View
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: focused ? ACTIVE_PILL : "transparent" }}
        />
        {icon?.({
          focused,
          color: focused ? ACTIVE_TEXT : INACTIVE_TEXT,
          size: 22,
        })}
      </Animated.View>
      <Text
        className={focused ? "font-body-semibold" : "font-body"}
        style={{ fontSize: 11, color: focused ? ACTIVE_TEXT : INACTIVE_TEXT }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Custom bottom tab bar: pill highlight, focus bounce, haptic tick. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t"
      style={{
        backgroundColor: "#FFFFFF",
        borderTopColor: "#ECF1F6",
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 6,
      }}
    >
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
            icon={options.tabBarIcon}
          />
        );
      })}
    </View>
  );
}
