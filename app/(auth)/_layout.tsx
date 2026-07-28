import { Stack } from "expo-router";

import { semanticColors } from "@/lib/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: semanticColors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
