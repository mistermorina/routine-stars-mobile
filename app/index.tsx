import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { getInitialAuthRoute } from "@/lib/auth-flow";

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    async function checkOnboarding() {
      router.replace((await getInitialAuthRoute()) as never);
    }

    void checkOnboarding();
  }, [rootNavigationState?.key, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}
