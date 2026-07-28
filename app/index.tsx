import { useEffect } from "react";
import { useRouter, useRootNavigationState } from "expo-router";
import { View } from "react-native";
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

  // Pure hand-off screen: the branded splash background carries over into the
  // target route, so there is nothing to show and nothing to flash.
  return <View className="flex-1 bg-background" />;
}
