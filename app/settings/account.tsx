import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Lock, Shield, Smartphone, Sparkles } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { hasParentPin } from "@/lib/parent-access";
import { storage, KEYS } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { getThemePalette } from "@/lib/theme";

export default function AccountSettings() {
  const router = useRouter();
  const auth = useAuth();
  const { selectedChild } = useChildren();
  const { toast } = useToast();
  const [pinConfigured, setPinConfigured] = useState(false);
  const palette = getThemePalette(selectedChild?.theme);

  useEffect(() => {
    async function loadPinStatus() {
      setPinConfigured(await hasParentPin());
    }

    void loadPinStatus();
  }, []);

  async function handleLockParentArea() {
    auth.deauthorizeParent();
    toast({ title: "Eltern-Bereich gesperrt" });
    router.replace("/(tabs)");
  }

  async function handleResetPin() {
    await storage.removeItem(KEYS.PARENT_PIN_HASH);
    auth.deauthorizeParent();
    toast({
      title: "PIN zurückgesetzt",
      description: "Lege beim nächsten Öffnen der Einstellungen einen neuen PIN fest.",
    });
    router.replace("/parent-login");
  }

  async function handleResetLocalSession() {
    auth.logout();
    toast({
      title: "Lokale Sitzung beendet",
      description: "Deine Daten bleiben auf diesem Gerät gespeichert.",
    });
    router.replace("/(tabs)");
  }

  return (
    <ThemedScreenBackground theme={selectedChild?.theme}>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        <SettingsHeroCard
          label="Lokal & geschützt"
          title="Lokal geschützt"
          description="Kinderprofile, Routinen und Belohnungen bleiben auf diesem Gerät. Der Elternbereich ist per PIN geschützt."
          badges={[{ label: pinConfigured ? "PIN aktiv" : "PIN offen" }]}
          palette={palette}
        />

        <Card
          className="mb-4 rounded-[28px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-start">
            <View
              className="mt-0.5 h-11 w-11 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Smartphone size={20} color={palette.accentStrong} />
            </View>
            <View className="ml-3 flex-1">
              <Text
                className="text-base font-body-semibold text-foreground"
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.9}
              >
                Daten bleiben auf diesem Gerät
              </Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Routine Stars speichert Kinder, Routinen und Belohnungen lokal. Cloud-Konten und Synchronisierung kommen später.
              </Text>
            </View>
          </View>
        </Card>

        <Card
          className="mb-4 rounded-[28px] border-dashed"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View
            className="rounded-[22px] px-4 py-4"
            style={{ backgroundColor: palette.heroSurface }}
          >
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color={palette.accentStrong} />
              <Text
                className="text-sm font-body-semibold"
                style={{ color: palette.accentText }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.86}
              >
                Kein Cloud-Konto aktiv
              </Text>
            </View>
            <Text className="mt-2 text-sm font-body leading-5 text-muted-foreground">
              Diese App arbeitet aktuell komplett lokal auf diesem Gerät. PIN-Schutz und Sitzung betreffen nur diesen lokalen Elternbereich.
            </Text>
          </View>
        </Card>

        <Card
          className="mb-4 rounded-[28px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-center justify-between">
            <View className="mr-3 flex-1 flex-row items-center">
              <View
                className="h-11 w-11 items-center justify-center rounded-[18px]"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Shield size={20} color={palette.accentStrong} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-body text-foreground">
                  {pinConfigured ? "PIN ist eingerichtet" : "Noch kein PIN eingerichtet"}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Der Eltern-Bereich bleibt nur für die aktuelle Sitzung entsperrt.
                </Text>
              </View>
            </View>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleResetPin}
              className="rounded-full"
            >
              <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
                {pinConfigured ? "Neu setzen" : "Einrichten"}
              </Text>
            </Button>
          </View>
        </Card>

        <View className="mt-2 gap-3">
          <Button
            variant="outline"
            onPress={handleLockParentArea}
            className="w-full rounded-[22px] border"
            style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.82)" }}
          >
            <View className="flex-row items-center gap-2">
              <Lock size={18} color={palette.accentText} />
              <Text className="text-base font-body-semibold" style={{ color: palette.accentText }}>
                Eltern-Bereich sperren
              </Text>
            </View>
          </Button>

          <Button
            variant="outline"
            onPress={handleResetLocalSession}
            className="w-full rounded-[22px] border"
            style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.82)" }}
          >
            <View className="flex-row items-center gap-2">
              <Shield size={18} color={palette.accentText} />
              <Text className="text-base font-body-semibold" style={{ color: palette.accentText }}>
                Lokale Sitzung beenden
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
