import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import {
  Building2,
  ChevronRight,
  Download,
  FileText,
  MessageCircle,
  Scale,
  Shield,
} from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { useToast } from "@/hooks/use-toast";
import { storage, KEYS } from "@/lib/storage";
import { getThemePalette } from "@/lib/theme";

interface LegalPreferences {
  analyticsConsent: boolean;
  personalizedContent: boolean;
}

const legalItems = [
  {
    label: "Datenschutzrichtlinie",
    icon: Shield,
    url: "https://routinestars.app/privacy",
  },
  {
    label: "Nutzungsbedingungen",
    icon: FileText,
    url: "https://routinestars.app/terms",
  },
  {
    label: "Impressum",
    icon: Building2,
    url: "https://routinestars.app/imprint",
  },
  {
    label: "Support kontaktieren",
    icon: MessageCircle,
    url: "mailto:support@routinestars.app",
  },
];

export default function LegalSettings() {
  const { selectedChild } = useChildren();
  const { toast } = useToast();
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState(false);
  const palette = getThemePalette(selectedChild?.theme);

  useEffect(() => {
    async function loadPreferences() {
      const stored = await storage.getItem<LegalPreferences>(KEYS.LEGAL_PREFERENCES);
      if (stored) {
        setAnalyticsConsent(stored.analyticsConsent);
        setPersonalizedContent(stored.personalizedContent);
      }
    }

    void loadPreferences();
  }, []);

  async function persistPreferences(next: LegalPreferences) {
    setAnalyticsConsent(next.analyticsConsent);
    setPersonalizedContent(next.personalizedContent);
    await storage.setItem(KEYS.LEGAL_PREFERENCES, next);
  }

  function handleOpenLink(url: string, label: string) {
    Linking.openURL(url).catch(() => {
      toast({ title: `${label} konnte nicht geöffnet werden`, variant: "destructive" });
    });
  }

  function handleExportData() {
    toast({
      title: "Datenexport folgt später",
      description: "In dieser Version gibt es noch keinen lokalen Export als Datei.",
    });
  }

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        <Card
          className="mb-4 overflow-hidden rounded-[30px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View
            className="absolute inset-x-0 top-0 h-32"
            style={{ backgroundColor: palette.heroSurface }}
          />
          <View
            className="absolute right-[-16px] top-[-10px] h-24 w-24 rounded-full"
            style={{ backgroundColor: palette.motifPrimary, opacity: 0.18 }}
          />
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View
                className="self-start rounded-full px-3 py-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                  Transparenz
                </Text>
              </View>
              <Text
                className="mt-3 text-[26px] font-headline leading-[32px] text-foreground"
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                Rechtliches & Einwilligungen
              </Text>
              <Text className="mt-2 text-sm font-body leading-6" style={{ color: palette.accentText }}>
                Links funktionieren direkt. Einwilligungen werden lokal gespeichert. Der Datenexport ist in dieser Version noch nicht verfügbar.
              </Text>
            </View>
            <View
              className="rounded-[22px] px-3.5 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
            >
              <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Status
              </Text>
              <Text className="mt-1 text-base font-headline" style={{ color: palette.accentText }}>
                lokal
              </Text>
            </View>
          </View>
        </Card>

        <Card
          className="mb-4 overflow-hidden rounded-[28px] p-0"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          {legalItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.label}>
                <Pressable
                  onPress={() => handleOpenLink(item.url, item.label)}
                  className="flex-row items-center px-4 py-4 active:bg-secondary/50"
                >
                  <View
                    className="h-11 w-11 items-center justify-center rounded-[18px]"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Icon size={20} color={palette.accentStrong} />
                  </View>
                  <Text className="ml-3 flex-1 text-base font-body text-foreground">
                    {item.label}
                  </Text>
                  <ChevronRight size={18} color={palette.accentText} />
                </Pressable>
                {index < legalItems.length - 1 && <Separator />}
              </View>
            );
          })}
        </Card>

        <Card
          className="mb-4 rounded-[28px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: palette.heroSurface }}
            >
              <Scale size={20} color={palette.accentStrong} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-headline text-foreground">DSGVO</Text>
              <Text className="text-sm font-body text-muted-foreground">
                Exportrecht ist vorgesehen, der lokale Dateiexport folgt später.
              </Text>
            </View>
          </View>
          <Button
            variant="outline"
            onPress={handleExportData}
            className="mt-4 w-full rounded-[22px] border"
            style={{ borderColor: palette.accentBorder, backgroundColor: "rgba(255,255,255,0.82)" }}
          >
            <View className="flex-row items-center gap-2">
              <Download size={18} color={palette.accentText} />
              <Text className="text-base font-body-semibold" style={{ color: palette.accentText }}>
                Datenexport folgt später
              </Text>
            </View>
          </Button>
        </Card>

        <Card
          className="rounded-[28px]"
          style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
        >
          <Text className="text-lg font-headline text-foreground">Einwilligungen</Text>
          <Text className="mt-1 text-sm font-body text-muted-foreground">
            Diese Präferenzen werden lokal auf diesem Gerät gespeichert.
          </Text>

          <View className="mt-4 gap-0">
            <View className="flex-row items-center justify-between py-3">
              <View className="mr-3 flex-1">
                <Text className="text-base font-body text-foreground">
                  Analyse & Statistiken
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Hilft uns, die App zu verbessern
                </Text>
              </View>
              <Switch
                checked={analyticsConsent}
                onCheckedChange={(value) => {
                  const next = {
                    analyticsConsent: value,
                    personalizedContent,
                  };
                  void persistPreferences(next);
                  toast({
                    title: value
                      ? "Analyse-Präferenz gespeichert"
                      : "Analyse-Präferenz entfernt",
                  });
                }}
              />
            </View>

            <Separator />

            <View className="flex-row items-center justify-between py-3">
              <View className="mr-3 flex-1">
                <Text className="text-base font-body text-foreground">
                  Personalisierte Inhalte
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Vorschläge basierend auf Nutzung
                </Text>
              </View>
              <Switch
                checked={personalizedContent}
                onCheckedChange={(value) => {
                  const next = {
                    analyticsConsent,
                    personalizedContent: value,
                  };
                  void persistPreferences(next);
                  toast({
                    title: value
                      ? "Personalisierung lokal gespeichert"
                      : "Personalisierung entfernt",
                  });
                }}
              />
            </View>
          </View>
        </Card>

        <View className="mt-6 items-center">
          <Text className="text-xs font-body text-muted-foreground">
            Routine Stars v0.1.0
          </Text>
        </View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
