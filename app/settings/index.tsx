import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import {
  Users,
  BarChart3,
  CalendarDays,
  User,
  Bell,
  CreditCard,
  FileText,
  ChevronRight,
  Palette,
  RefreshCcw,
  Rocket,
  Sparkles,
  Vibrate,
  Volume2,
} from "lucide-react-native";
import { storage } from "@/lib/storage";
import { isHapticsGloballyEnabled } from "@/lib/feedback";
import {
  initFeedback,
  isSoundEnabled,
  setHapticsEnabled,
  setSoundEnabled,
} from "@/lib/sound-adapter";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";

const SWITCH_TRACK_COLOR = { false: "#E5E5E5", true: "#87CEEB" };

const settingsItems = [
  {
    label: "Kinder verwalten",
    description: "Profile lokal pflegen und direkt in der App weiternutzen",
    status: "Live",
    icon: Users,
    route: "/settings/children" as const,
  },
  {
    label: "Hintergrund-Skins",
    description: "Freie Flächen pro Kinderprofil gestalten",
    status: "Neu",
    icon: Palette,
    route: "/settings/background" as const,
  },
  {
    label: "Fortschritt",
    description: "Monatsansicht mit echten Aktivitätstagen und Empty States",
    status: "Live",
    icon: CalendarDays,
    route: "/settings/progress" as const,
  },
  {
    label: "Sticker-System",
    description: "Sticker-Galerie prüfen und Freischaltlogik steuern",
    status: "Live",
    icon: Sparkles,
    route: "/settings/stickers" as const,
  },
  {
    label: "Statistiken",
    description: "Elternsicht auf Verlauf und Nutzung mit echten lokalen Daten",
    status: "Live",
    icon: BarChart3,
    route: "/settings/stats" as const,
  },
  {
    label: "Konto",
    description: "Lokaler Elternschutz, PIN und Sitzungsstatus auf diesem Gerät",
    status: "Lokal",
    icon: User,
    route: "/settings/account" as const,
  },
  {
    label: "Benachrichtigungen",
    description: "Schalter werden lokal gespeichert, Push folgt später",
    status: "Lokal",
    icon: Bell,
    route: "/settings/notifications" as const,
  },
  {
    label: "Abonnement",
    description: "Premium ist geplant, aber in dieser Version noch nicht live",
    status: "Demnächst",
    icon: CreditCard,
    route: "/settings/billing" as const,
  },
  {
    label: "Rechtliches",
    description: "Links funktionieren, Präferenzen werden lokal gespeichert",
    status: "Teilweise",
    icon: FileText,
    route: "/settings/legal" as const,
  },
];

const featuredRoutes = new Set([
  "/settings/children",
  "/settings/background",
  "/settings/progress",
  "/settings/stickers",
  "/settings/stats",
]);

export default function SettingsIndex() {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(true);
  const [hapticsOn, setHapticsOn] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Idempotent: resolves instantly if the root layout already initialized.
    void initFeedback().then(() => {
      if (!mounted) return;
      setSoundOn(isSoundEnabled());
      setHapticsOn(isHapticsGloballyEnabled());
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleSound = (value: boolean) => {
    setSoundOn(value);
    void setSoundEnabled(value);
  };

  const handleToggleHaptics = (value: boolean) => {
    setHapticsOn(value);
    void setHapticsEnabled(value);
  };

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
            router.replace("/(auth)/welcome" as never);
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-3">
        <SettingsHeroCard
          label="Elternbereich"
          title="Lokal geschützt"
          description="Profile, Fortschritt und Elternschutz bleiben auf diesem Gerät. Geplante Bereiche sind klar markiert."
          badges={[{ label: "Lokal" }, { label: "PIN" }]}
        />

        <View className="mt-1">
          <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
            Schnellzugriff
          </Text>
        </View>

        {settingsItems.filter((item) => featuredRoutes.has(item.route)).map((item) => {
          const Icon = item.icon;
          const badgeColors =
            item.status === "Demnächst"
              ? { backgroundColor: "#FEF3C7", color: "#92400E" }
              : item.status === "Teilweise"
                ? { backgroundColor: "#E0F2FE", color: "#0C4A6E" }
                : { backgroundColor: "#ECFDF5", color: "#166534" };

          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              className="flex-row items-center rounded-[26px] bg-card px-4 py-4 active:bg-secondary"
            >
              <View className="h-12 w-12 items-center justify-center rounded-[18px] bg-secondary">
                <Icon size={22} color="#1a1a2e" />
              </View>
              <View className="ml-3 min-w-0 flex-1 pr-3">
                <View className="flex-row items-start justify-between gap-2">
                  <Text
                    className="min-w-0 flex-1 text-base font-body-semibold text-foreground"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.86}
                  >
                    {item.label}
                  </Text>
                  <View
                    className="shrink-0 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: badgeColors.backgroundColor }}
                  >
                    <Text
                      className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                      style={{ color: badgeColors.color }}
                      numberOfLines={1}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary/70">
                <ChevronRight size={18} color="#737373" />
              </View>
            </Pressable>
          );
        })}

        <View className="mt-2">
          <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
            Verwaltung & Hinweise
          </Text>
        </View>

        {settingsItems.filter((item) => !featuredRoutes.has(item.route)).map((item) => {
          const Icon = item.icon;
          const badgeColors =
            item.status === "Demnächst"
              ? { backgroundColor: "#FEF3C7", color: "#92400E" }
              : item.status === "Teilweise"
                ? { backgroundColor: "#E0F2FE", color: "#0C4A6E" }
                : { backgroundColor: "#ECFDF5", color: "#166534" };

          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.route)}
              className="flex-row items-center rounded-[24px] bg-card px-4 py-4 active:bg-secondary"
            >
              <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-secondary/80">
                <Icon size={20} color="#1a1a2e" />
              </View>
              <View className="ml-3 min-w-0 flex-1 pr-3">
                <View className="flex-row items-start justify-between gap-2">
                  <Text
                    className="min-w-0 flex-1 text-base font-body-semibold text-foreground"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.86}
                  >
                    {item.label}
                  </Text>
                  <View
                    className="shrink-0 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: badgeColors.backgroundColor }}
                  >
                    <Text
                      className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                      style={{ color: badgeColors.color }}
                      numberOfLines={1}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <ChevronRight size={18} color="#737373" />
            </Pressable>
          );
        })}

        <View className="mt-2">
          <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
            Ton & Vibration
          </Text>
        </View>

        <View className="rounded-[24px] bg-card px-4">
          <View className="flex-row items-center border-b border-border/60 py-4">
            <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-secondary/80">
              <Volume2 size={20} color="#1a1a2e" />
            </View>
            <View className="ml-3 min-w-0 flex-1 pr-3">
              <Text className="text-base font-body-semibold text-foreground">Soundeffekte</Text>
              <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
                Kurze Klänge bei Aufgaben, Belohnungen und Stickern.
              </Text>
            </View>
            <Switch
              value={soundOn}
              onValueChange={handleToggleSound}
              trackColor={SWITCH_TRACK_COLOR}
              accessibilityLabel="Soundeffekte ein- oder ausschalten"
            />
          </View>
          <View className="flex-row items-center py-4">
            <View className="h-11 w-11 items-center justify-center rounded-[16px] bg-secondary/80">
              <Vibrate size={20} color="#1a1a2e" />
            </View>
            <View className="ml-3 min-w-0 flex-1 pr-3">
              <Text className="text-base font-body-semibold text-foreground">Vibration</Text>
              <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
                Sanftes haptisches Feedback bei wichtigen Momenten.
              </Text>
            </View>
            <Switch
              value={hapticsOn}
              onValueChange={handleToggleHaptics}
              trackColor={SWITCH_TRACK_COLOR}
              accessibilityLabel="Vibration ein- oder ausschalten"
            />
          </View>
        </View>

        {/* Onboarding erneut starten */}
        <Pressable
          onPress={async () => {
            await storage.setItem(storage.KEYS.HAS_ONBOARDED, false);
            router.replace("/(auth)/onboarding");
          }}
          className="mt-4 flex-row items-center rounded-[24px] border border-border bg-card px-4 py-4 active:bg-secondary"
        >
          <View className="h-12 w-12 items-center justify-center rounded-[18px] bg-secondary/80">
            <Rocket size={22} color="#1a1a2e" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-body-semibold text-foreground">
              Onboarding erneut starten
            </Text>
            <Text className="mt-1 text-xs font-body text-muted-foreground">
              Startet den ersten Einrichtungsflow mit aktuellen lokalen Daten neu.
            </Text>
          </View>
        </Pressable>

        {/* Reset button */}
        <Pressable
          onPress={handleResetApp}
          className="flex-row items-center rounded-[24px] border border-red-200 bg-card px-4 py-4 active:bg-red-50"
        >
          <View className="h-12 w-12 items-center justify-center rounded-[18px] bg-red-50">
            <RefreshCcw size={22} color="#ef4444" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-body-semibold text-red-500">
              App zurücksetzen
            </Text>
            <Text className="mt-1 text-xs font-body text-red-400">
              Löscht alle lokalen Daten und startet wieder beim Onboarding.
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
