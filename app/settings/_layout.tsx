import React, { useEffect } from "react";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { semanticColors } from "@/lib/theme";

export default function SettingsLayout() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const { isParentAuthorized } = useAuth();

  // Only bounce to the PIN screen while settings is actually the visible route.
  // "Eltern-Bereich sperren" and the data reset navigate away *and* drop the
  // authorization — without this check the pending redirect would win the race
  // and drop the parent back on the PIN pad instead of the app.
  const isSettingsRoute = segments[0] === "settings";

  useEffect(() => {
    if (!rootNavigationState?.key || isParentAuthorized || !isSettingsRoute) return;
    router.replace("/parent-login");
  }, [isParentAuthorized, isSettingsRoute, rootNavigationState?.key, router]);

  if (!isParentAuthorized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={semanticColors.gold} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: semanticColors.background },
        headerTintColor: semanticColors.foreground,
        headerTitleStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: semanticColors.background },
        animation: "slide_from_right",
        headerRight: () => (
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            hitSlop={8}
            className="min-h-11 justify-center rounded-full px-3 py-1.5 active:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.76)" }}
            accessibilityRole="button"
            accessibilityLabel="Zur App zurückkehren"
          >
            <Text
              maxFontSizeMultiplier={1.3}
              style={{
                color: semanticColors.foreground,
                fontFamily: "Poppins_600SemiBold",
                fontSize: 14,
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
        name="background"
        options={{ title: "Hintergrund-Skins" }}
      />
      <Stack.Screen
        name="routines"
        options={{ title: "Routinen bearbeiten" }}
      />
      <Stack.Screen
        name="rewards"
        options={{ title: "Belohnungen bearbeiten" }}
      />
      <Stack.Screen
        name="progress"
        options={{ title: "Fortschritt" }}
      />
      <Stack.Screen
        name="stickers"
        options={{ title: "Sticker-System" }}
      />
      <Stack.Screen
        name="stats"
        options={{ title: "Statistiken" }}
      />
      <Stack.Screen
        name="account"
        options={{ title: "Eltern-Bereich" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Benachrichtigungen" }}
      />
      <Stack.Screen
        name="legal"
        options={{ title: "Rechtliches" }}
      />
    </Stack>
  );
}
