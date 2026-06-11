import React from "react";
import { Tabs } from "expo-router";
import { Home, Trophy, Star } from "lucide-react-native";
import { AppTabBar } from "@/components/routine-stars/tab-bar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
            <Star size={size} color={color} fill={focused ? "#FFD700" : "transparent"} />
          ),
        }}
      />
    </Tabs>
  );
}
