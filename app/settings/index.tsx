import React from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Users,
  BarChart3,
  CalendarDays,
  User,
  Bell,
  CreditCard,
  FileText,
  ChevronRight,
  RefreshCcw,
  Rocket,
} from "lucide-react-native";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";

const settingsItems = [
  { label: "Kinder verwalten", icon: Users, route: "/settings/children" as const },
  { label: "Fortschritt", icon: CalendarDays, route: "/settings/progress" as const },
  { label: "Statistiken", icon: BarChart3, route: "/settings/stats" as const },
  { label: "Konto", icon: User, route: "/settings/account" as const },
  { label: "Benachrichtigungen", icon: Bell, route: "/settings/notifications" as const },
  { label: "Abonnement", icon: CreditCard, route: "/settings/billing" as const },
  { label: "Rechtliches", icon: FileText, route: "/settings/legal" as const },
];

export default function SettingsIndex() {
  const router = useRouter();

  const handleResetApp = () => {
    Alert.alert(
      "App zurücksetzen",
      "Alle Daten werden gelöscht und das Onboarding startet neu. Fortfahren?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Zurücksetzen",
          style: "destructive",
          onPress: async () => {
            await storage.clear();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              className="flex-row items-center bg-card rounded-xl px-4 py-4 active:bg-secondary"
            >
              <Icon size={22} color="#1a1a2e" />
              <Text className="flex-1 ml-3 text-base font-body-semibold text-foreground">
                {item.label}
              </Text>
              <ChevronRight size={20} color="#737373" />
            </Pressable>
          );
        })}

        {/* Onboarding erneut starten */}
        <Pressable
          onPress={async () => {
            await storage.setItem(storage.KEYS.HAS_ONBOARDED, false);
            router.replace("/(auth)/onboarding");
          }}
          className="flex-row items-center bg-card rounded-xl px-4 py-4 mt-4 border border-blue-200 active:bg-blue-50"
        >
          <Rocket size={22} color="#3b82f6" />
          <Text className="flex-1 ml-3 text-base font-body-semibold text-blue-500">
            Onboarding erneut starten
          </Text>
        </Pressable>

        {/* Reset button */}
        <Pressable
          onPress={handleResetApp}
          className="flex-row items-center bg-card rounded-xl px-4 py-4 border border-red-200 active:bg-red-50"
        >
          <RefreshCcw size={22} color="#ef4444" />
          <Text className="flex-1 ml-3 text-base font-body-semibold text-red-500">
            App zurücksetzen
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
