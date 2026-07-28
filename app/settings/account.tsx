import React, { useCallback, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronRight, Lock, Shield, Smartphone, Trash2 } from "@/lib/icons";
import { useAuth } from "@/hooks/use-auth";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { hasParentPin } from "@/lib/parent-access";
import { resetAppData } from "@/lib/reset";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";

export default function AccountSettings() {
  const router = useRouter();
  const auth = useAuth();
  const { selectedChild } = useChildren();
  const { toast } = useToast();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const palette = getThemePalette(selectedChild?.theme);

  // Re-read on focus so returning from the PIN screen shows the new status.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      void hasParentPin().then((configured) => {
        if (active) setPinConfigured(configured);
      });

      return () => {
        active = false;
      };
    }, [])
  );

  function handleChangePin() {
    router.push("/parent-login?mode=change");
  }

  function handleLockParentArea() {
    router.replace("/(tabs)");
    auth.deauthorizeParent();
    toast({
      title: "Eltern-Bereich gesperrt",
      description: "Beim nächsten Öffnen wird wieder der PIN abgefragt.",
    });
  }

  async function handleConfirmReset() {
    if (isResetting) return;

    setIsResetting(true);
    await resetAppData();
    setResetDialogVisible(false);
    router.replace("/(auth)/welcome");
    auth.deauthorizeParent();
    setIsResetting(false);
    toast({
      title: "App zurückgesetzt",
      description: "Alle lokalen Daten und Fotos wurden gelöscht.",
    });
  }

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        <SettingsHeroCard
          label="Eltern-Bereich"
          title="Sicherheit & Daten"
          description="Der Eltern-Bereich ist per PIN geschützt. Alle Inhalte liegen ausschließlich auf diesem Gerät."
          badges={[{ label: pinConfigured ? "PIN aktiv" : "Kein PIN" }, { label: "Lokal" }]}
          palette={palette}
        />

        <Card
          className="mb-4 rounded-card"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-start">
            <View
              className="mt-0.5 h-11 w-11 items-center justify-center rounded-tile"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Smartphone size={20} color={palette.accentStrong} />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <Text
                className="text-base font-body-semibold text-foreground"
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.9}
              >
                Daten bleiben auf diesem Gerät
              </Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Es gibt kein Konto und keine Cloud. Kinder, Routinen, Belohnungen, Sterne und
                Avatar-Fotos werden nur lokal gespeichert.
              </Text>
            </View>
          </View>
        </Card>

        <Text
          className="mb-2 ml-1 text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground"
          accessibilityRole="header"
          maxFontSizeMultiplier={1.3}
        >
          PIN-Schutz
        </Text>

        <PressableScale
          onPress={handleChangePin}
          className="mb-4 flex-row items-center rounded-card px-4 py-4"
          style={{ backgroundColor: palette.cardTint, ...shadowPresets.shadowCard }}
          accessibilityRole="button"
          accessibilityLabel={pinConfigured ? "PIN ändern" : "PIN einrichten"}
          accessibilityHint="Öffnet die PIN-Eingabe für den Eltern-Bereich"
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-tile"
            style={{ backgroundColor: palette.heroSurface }}
          >
            <Shield size={20} color={palette.accentStrong} />
          </View>
          <View className="ml-3 min-w-0 flex-1 pr-3">
            <Text className="text-base font-body-semibold text-foreground">
              {pinConfigured ? "PIN ändern" : "PIN einrichten"}
            </Text>
            <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
              {pinConfigured
                ? "Aktuellen PIN bestätigen und einen neuen vergeben."
                : "Schütze den Eltern-Bereich mit einem vierstelligen PIN."}
            </Text>
          </View>
          <ChevronRight
            size={18}
            color={semanticColors.mutedForeground}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </PressableScale>

        <Button
          variant="outline"
          onPress={handleLockParentArea}
          className="w-full rounded-card border"
          accessibilityRole="button"
          accessibilityLabel="Eltern-Bereich sperren"
          style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.82)" }}
        >
          <View className="flex-row items-center gap-2">
            <Lock size={18} color={palette.accentText} />
            <Text
              className="text-base font-body-semibold"
              style={{ color: palette.accentText }}
              maxFontSizeMultiplier={1.3}
            >
              Eltern-Bereich sperren
            </Text>
          </View>
        </Button>

        <Text
          className="mb-2 ml-1 mt-6 text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground"
          accessibilityRole="header"
          maxFontSizeMultiplier={1.3}
        >
          Zurücksetzen
        </Text>

        <View
          className="rounded-card border border-destructive-soft bg-card px-4 py-4"
          style={shadowPresets.shadowCard}
        >
          <View className="flex-row items-start">
            <View className="mt-0.5 h-11 w-11 items-center justify-center rounded-tile bg-destructive-soft">
              <Trash2 size={20} color={semanticColors.destructiveStrong} />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <Text className="text-base font-body-semibold text-destructive-strong">
                Alles zurücksetzen
              </Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Alle Daten und Fotos werden gelöscht. Danach startet die App wieder bei der
                Begrüßung.
              </Text>
            </View>
          </View>

          <Button
            variant="destructive"
            onPress={() => setResetDialogVisible(true)}
            className="mt-4 w-full rounded-card bg-destructive-strong"
            accessibilityRole="button"
            accessibilityLabel="Alle Daten zurücksetzen"
          >
            Zurücksetzen
          </Button>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={resetDialogVisible}
        title="Alles zurücksetzen?"
        description="Alle Daten und Fotos werden gelöscht. Kinder, Sterne, Routinen, Belohnungen und Sticker lassen sich danach nicht wiederherstellen."
        confirmLabel="Zurücksetzen"
        destructive
        onConfirm={() => {
          void handleConfirmReset();
        }}
        onCancel={() => setResetDialogVisible(false)}
      />
    </ThemedScreenBackground>
  );
}
