import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/hooks/use-auth";
import { storage, KEYS } from "@/lib/storage";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function checkOnboarding() {
      const hasOnboarded = await storage.getItem<boolean>(KEYS.HAS_ONBOARDED);
      const children = await storage.getItem(KEYS.CHILDREN);

      if (!isAuthenticated && !hasOnboarded) {
        router.replace("/(auth)/login");
      } else if (children) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }

    checkOnboarding();
  }, [isAuthenticated, router]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#FFD700" />
    </View>
  );
}
