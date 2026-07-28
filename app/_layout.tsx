import React, { useCallback, useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ErrorBoundary } from "@/components/error-boundary";
import { ToastHost } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/auth-context";
import { ChildrenProvider } from "@/contexts/children-context";
import { StarFlightTargetProvider } from "@/contexts/star-flight-target";
import { initFeedback } from "@/lib/sound-adapter";
import { semanticColors } from "@/lib/theme";
import "../global.css";

// Keep the native splash up until the fonts have settled, so the first frame is
// already branded. Rejects only when the splash is gone already (fast reloads).
void SplashScreen.preventAutoHideAsync().catch(() => {
  /* splash already hidden */
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular: require("../assets/fonts/Poppins-Regular.ttf"),
    Poppins_600SemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700Bold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  // A font that fails to load must not strand the user on a splash screen —
  // render with the system font instead.
  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    void initFeedback();
  }, []);

  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      /* already hidden */
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void hideSplash();
  }, [hideSplash, isReady]);

  // Nothing between the splash and the first real frame — no spinner flash.
  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Outside the boundary so the fallback screen keeps dark status bar icons. */}
      <StatusBar style="dark" />
      <ErrorBoundary>
        <AuthProvider>
          <ChildrenProvider>
            <StarFlightTargetProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: semanticColors.background },
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="sticker-album" />
                <Stack.Screen
                  name="parent-login"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                  }}
                />
                <Stack.Screen name="settings" />
              </Stack>
              <ToastHost />
            </StarFlightTargetProvider>
          </ChildrenProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
