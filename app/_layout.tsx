import React, { useCallback, useEffect } from "react";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { InstrumentSerif_400Regular } from "@expo-google-fonts/instrument-serif/400Regular";
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
import { DesignModeProvider, useDesignMode } from "@/contexts/design-mode-context";
import { getNeutralFill } from "@/lib/design-mode";
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
    InstrumentSerif_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
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
      <DesignModeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ChildrenProvider>
              <StarFlightTargetProvider>
              <AppStack>
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
              </AppStack>
                <ToastHost />
              </StarFlightTargetProvider>
            </ChildrenProvider>
          </AuthProvider>
        </ErrorBoundary>
      </DesignModeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Scene background for the whole app. Lives in its own component because
 * RootLayout renders the provider and therefore cannot read the mode itself.
 */
function AppStack({ children }: { children: React.ReactNode }) {
  const { designMode } = useDesignMode();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: getNeutralFill(designMode, semanticColors.background),
        },
        animation: "slide_from_right",
      }}
    >
      {children}
    </Stack>
  );
}
