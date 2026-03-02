import { Stack } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

export default function SettingsLayout() {
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
