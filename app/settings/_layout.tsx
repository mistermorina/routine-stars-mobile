import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsLayout() {
  const router = useRouter();
  const { isParentAuthorized } = useAuth();

  useEffect(() => {
    if (!isParentAuthorized) {
      router.replace("/parent-login");
    }
  }, [isParentAuthorized, router]);

  if (!isParentAuthorized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#F8E9D7" },
        headerTintColor: "#1a1a2e",
        headerTitleStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F8E9D7" },
        animation: "slide_from_right",
        headerRight: () => (
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            hitSlop={8}
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
          >
            <Text
              style={{
                color: "#1a1a2e",
                fontFamily: "Poppins_600SemiBold",
                fontSize: 13,
              }}
            >
              Zur App
            </Text>
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Einstellungen" }}
      />
      <Stack.Screen
        name="children"
        options={{ title: "Kinder verwalten" }}
      />
      <Stack.Screen
        name="progress"
        options={{ title: "Fortschritt" }}
      />
      <Stack.Screen
        name="stats"
        options={{ title: "Statistiken" }}
      />
      <Stack.Screen
        name="account"
        options={{ title: "Konto" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Benachrichtigungen" }}
      />
      <Stack.Screen
        name="billing"
        options={{ title: "Abonnement" }}
      />
      <Stack.Screen
        name="legal"
        options={{ title: "Rechtliches" }}
      />
    </Stack>
  );
}
