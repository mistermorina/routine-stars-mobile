import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { storage, KEYS } from "@/lib/storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function checkOnboarding() {
      const hasOnboarded = await storage.getItem<boolean>(KEYS.HAS_ONBOARDED);
      const children = await storage.getItem<unknown[]>(KEYS.CHILDREN);

      if (children && children.length > 0) {
        router.replace("/(tabs)");
      } else if (hasOnboarded) {
        router.replace("/(auth)/onboarding");
      } else {
        router.replace("/(auth)/onboarding");
      }
    }

    checkOnboarding();
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}
