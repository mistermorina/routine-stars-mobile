import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import {
  Users,
  BarChart3,
  CalendarDays,
  Bell,
  FileText,
  ChevronRight,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Vibrate,
  Volume2,
} from "@/lib/icons";
import { useDesignMode } from "@/contexts/design-mode-context";
import { storage } from "@/lib/storage";
import { isHapticsGloballyEnabled } from "@/lib/feedback";
import {
  initFeedback,
  isSoundEnabled,
  setHapticsEnabled,
  setSoundEnabled,
} from "@/lib/sound-adapter";
import { PressableScale } from "@/components/ui/pressable-scale";
import { GlassBackdrop } from "@/components/ui/glass-backdrop";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { semanticColors, shadowPresets } from "@/lib/theme";

const SWITCH_TRACK_COLOR = {
  false: semanticColors.border,
  true: semanticColors.primary,
};

type SettingsItem = {
  label: string;
  description: string;
  icon: typeof Users;
  route:
    | "/settings/children"
    | "/settings/background"
    | "/settings/progress"
    | "/settings/stickers"
    | "/settings/stats"
    | "/settings/account"
    | "/settings/notifications"
    | "/settings/legal";
};

const quickAccessItems: SettingsItem[] = [
  {
    label: "Kinder verwalten",
    description: "Profile, Avatare und Themes anlegen oder anpassen",
    icon: Users,
    route: "/settings/children",
  },
  {
    label: "Hintergrund-Skins",
    description: "Freie Flächen pro Kinderprofil gestalten",
    icon: Palette,
    route: "/settings/background",
  },
  {
    label: "Fortschritt",
    description: "Monatsansicht der aktiven Tage pro Kind",
    icon: CalendarDays,
    route: "/settings/progress",
  },
  {
    label: "Sticker-System",
    description: "Sticker-Galerie ansehen und Freischaltungen steuern",
    icon: Sparkles,
    route: "/settings/stickers",
  },
  {
    label: "Statistiken",
    description: "Verlauf und Nutzung im Elternüberblick",
    icon: BarChart3,
    route: "/settings/stats",
  },
];

const managementItems: SettingsItem[] = [
  {
    label: "Eltern-Bereich & Sicherheit",
    description: "PIN ändern, Bereich sperren und Daten zurücksetzen",
    icon: ShieldCheck,
    route: "/settings/account",
  },
  {
    label: "Benachrichtigungen",
    description: "Erinnerungen für Routinen einstellen",
    icon: Bell,
    route: "/settings/notifications",
  },
  {
    label: "Rechtliches",
    description: "Datenschutz, Nutzungsbedingungen und Impressum",
    icon: FileText,
    route: "/settings/legal",
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <View className="mt-2">
      <Text
        className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground"
        accessibilityRole="header"
        maxFontSizeMultiplier={1.3}
      >
        {children}
      </Text>
    </View>
  );
}

function SettingsRow({
  item,
  onPress,
  featured,
}: {
  item: SettingsItem;
  onPress: () => void;
  featured?: boolean;
}) {
  const Icon = item.icon;

  return (
    <PressableScale
      onPress={onPress}
      className="flex-row items-center overflow-hidden rounded-card px-4 py-4"
      style={shadowPresets.shadowCard}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityHint={item.description}
    >
      <GlassBackdrop />
      <View
        className={
          featured
            ? "h-12 w-12 items-center justify-center rounded-tile bg-secondary"
            : "h-11 w-11 items-center justify-center rounded-tile bg-secondary/80"
        }
      >
        <Icon size={featured ? 22 : 20} color={semanticColors.foreground} />
      </View>
      <View className="ml-3 min-w-0 flex-1 pr-3">
        <Text
          className="text-base font-body-semibold text-foreground"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.86}
          maxFontSizeMultiplier={1.3}
        >
          {item.label}
        </Text>
        <Text
          className="mt-1 text-sm font-body leading-5 text-muted-foreground"
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
      <ChevronRight
        size={18}
        color={semanticColors.mutedForeground}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    </PressableScale>
  );
}

export default function SettingsIndex() {
  const router = useRouter();
  const { designMode, setDesignMode } = useDesignMode();
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

  const handleRestartOnboarding = async () => {
    await storage.setItem(storage.KEYS.HAS_ONBOARDED, false);
    router.replace("/(auth)/onboarding");
  };

  return (
    <ThemedScreenBackground>
      <ScrollView className="flex-1">
        <View className="gap-3 p-4">
        <SettingsHeroCard
          label="Elternbereich"
          title="Alles bleibt auf diesem Gerät"
          description="Kinder, Routinen, Belohnungen und Fortschritt werden nur lokal gespeichert. Der Elternbereich ist per PIN geschützt."
          badges={[{ label: "Lokal" }, { label: "PIN" }]}
        />

        <SectionLabel>Schnellzugriff</SectionLabel>

        {quickAccessItems.map((item) => (
          <SettingsRow
            key={item.route}
            item={item}
            featured
            onPress={() => router.push(item.route)}
          />
        ))}

        <SectionLabel>Verwaltung</SectionLabel>

        {managementItems.map((item) => (
          <SettingsRow key={item.route} item={item} onPress={() => router.push(item.route)} />
        ))}

        <SectionLabel>Ton & Vibration</SectionLabel>

        <View className="overflow-hidden rounded-card px-4" style={shadowPresets.shadowCard}>
          <GlassBackdrop />
          <View className="flex-row items-center border-b border-border/60 py-4">
            <View className="h-11 w-11 items-center justify-center rounded-tile bg-secondary/80">
              <Volume2 size={20} color={semanticColors.foreground} />
            </View>
            <View className="ml-3 min-w-0 flex-1 pr-3">
              <Text className="text-base font-body-semibold text-foreground">Soundeffekte</Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Kurze Klänge bei Aufgaben, Belohnungen und Stickern.
              </Text>
            </View>
            <Switch
              value={soundOn}
              onValueChange={handleToggleSound}
              trackColor={SWITCH_TRACK_COLOR}
              thumbColor={soundOn ? semanticColors.gold : semanticColors.card}
              ios_backgroundColor={semanticColors.border}
              accessibilityRole="switch"
              accessibilityLabel="Soundeffekte ein- oder ausschalten"
              accessibilityState={{ checked: soundOn }}
            />
          </View>
          <View className="flex-row items-center py-4">
            <View className="h-11 w-11 items-center justify-center rounded-tile bg-secondary/80">
              <Vibrate size={20} color={semanticColors.foreground} />
            </View>
            <View className="ml-3 min-w-0 flex-1 pr-3">
              <Text className="text-base font-body-semibold text-foreground">Vibration</Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Sanftes haptisches Feedback bei wichtigen Momenten.
              </Text>
            </View>
            <Switch
              value={hapticsOn}
              onValueChange={handleToggleHaptics}
              trackColor={SWITCH_TRACK_COLOR}
              thumbColor={hapticsOn ? semanticColors.gold : semanticColors.card}
              ios_backgroundColor={semanticColors.border}
              accessibilityRole="switch"
              accessibilityLabel="Vibration ein- oder ausschalten"
              accessibilityState={{ checked: hapticsOn }}
            />
          </View>
        </View>

        {/* Design experiment — remove along with lib/design-mode.ts once the
            look is decided either way. */}
        <SectionLabel>Design (Test)</SectionLabel>

        <View className="overflow-hidden rounded-card px-4" style={shadowPresets.shadowCard}>
          <GlassBackdrop />
          <View className="flex-row items-center py-4">
            <View className="h-11 w-11 items-center justify-center rounded-tile bg-secondary/80">
              <Sparkles size={20} color={semanticColors.foreground} />
            </View>
            <View className="ml-3 min-w-0 flex-1 pr-3">
              <Text className="text-base font-body-semibold text-foreground">Glas-Optik</Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Milchige Flächen und Farbverlauf statt flächiger Pastelltöne.
              </Text>
            </View>
            <Switch
              value={designMode === "glass"}
              onValueChange={(next) => {
                void setDesignMode(next ? "glass" : "soft");
              }}
              trackColor={SWITCH_TRACK_COLOR}
              thumbColor={designMode === "glass" ? semanticColors.gold : semanticColors.card}
              ios_backgroundColor={semanticColors.border}
              accessibilityRole="switch"
              accessibilityLabel="Glas-Optik ein- oder ausschalten"
              accessibilityState={{ checked: designMode === "glass" }}
            />
          </View>
        </View>

        <PressableScale
          onPress={() => {
            void handleRestartOnboarding();
          }}
          className="mt-2 flex-row items-center overflow-hidden rounded-card border border-border px-4 py-4"
          accessibilityRole="button"
          accessibilityLabel="Onboarding erneut starten"
          accessibilityHint="Öffnet den Einrichtungsassistenten. Bestehende Daten bleiben erhalten."
        >
          <GlassBackdrop />
          <View className="h-12 w-12 items-center justify-center rounded-tile bg-secondary/80">
            <Rocket size={22} color={semanticColors.foreground} />
          </View>
          <View className="ml-3 min-w-0 flex-1">
            <Text className="text-base font-body-semibold text-foreground">
              Onboarding erneut starten
            </Text>
            <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
              Öffnet den Einrichtungsassistenten. Bestehende Daten bleiben erhalten.
            </Text>
          </View>
        </PressableScale>
      </View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
