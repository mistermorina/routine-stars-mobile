import React from "react";
import { Tabs } from "expo-router/js-tabs";
import { Home, Trophy, Star } from "@/lib/icons";
import { AppTabBar } from "@/components/routine-stars/tab-bar";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useDesignMode } from "@/contexts/design-mode-context";
import { semanticColors } from "@/lib/theme";

export default function TabsLayout() {
  const reduceMotion = useReducedMotion();
  const { designMode } = useDesignMode();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Expo Router's JavaScript tabs support 'none' | 'fade' | 'shift'.
        // 'shift' cross-fades and nudges the scenes sideways so a tab
        // switch reads as a move instead of a hard cut; under Reduce Motion we
        // drop the travel and keep the cross-fade, the way iOS does.
        animation: reduceMotion ? "fade" : "shift",
        // The scene must not paint its own fill in glass mode, otherwise the
        // floating bar frosts that instead of the screen backdrop.
        sceneStyle: designMode === "glass" ? { backgroundColor: "transparent" } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Routinen",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Belohnungen",
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="star-account"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Star
              size={size}
              color={color}
              fill={focused ? semanticColors.gold : "transparent"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
