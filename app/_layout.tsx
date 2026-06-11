import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/auth-context";
import { initFeedback } from "@/lib/sound-adapter";
import "../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../assets/fonts/Poppins-Regular.ttf"),
    Poppins_600SemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    Poppins_700Bold: require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    void initFeedback();
  }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F8E9D7" },
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
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
