import { Stack } from "expo-router";

import { semanticColors } from "@/lib/theme";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getNeutralFill } from "@/lib/design-mode";

export default function AuthLayout() {
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
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
