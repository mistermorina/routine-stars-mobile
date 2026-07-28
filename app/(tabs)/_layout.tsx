import React from "react";
import { Tabs } from "expo-router";
import { Home, Trophy, Star } from "@/lib/icons";
import { AppTabBar } from "@/components/routine-stars/tab-bar";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { semanticColors } from "@/lib/theme";

export default function TabsLayout() {
  const reduceMotion = useReducedMotion();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // expo-router 6 forwards screenOptions straight to
        // @react-navigation/bottom-tabs 7, which supports 'none' | 'fade' |
        // 'shift'. 'shift' cross-fades and nudges the scenes sideways so a tab
        // switch reads as a move instead of a hard cut; under Reduce Motion we
        // drop the travel and keep the cross-fade, the way iOS does.
        animation: reduceMotion ? "fade" : "shift",
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
