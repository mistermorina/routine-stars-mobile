import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import {
  ChevronRight,
  FileText,
  Scale,
  Building2,
  MessageCircle,
  Download,
  Shield,
} from "lucide-react-native";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState(false);

  function handleOpenLink(url: string, label: string) {
    Linking.openURL(url).catch(() => {
      toast({ title: `${label} konnte nicht geöffnet werden`, variant: "destructive" });
    });
  }

  function handleExportData() {
    toast({ title: "Datenexport wird vorbereitet..." });
    // Placeholder for actual export functionality
    setTimeout(() => {
      toast({ title: "Daten wurden exportiert" });
    }, 2000);
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      {/* Legal links */}
      <Card className="mb-4 p-0 overflow-hidden">
        {legalItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <View key={item.label}>
              <Pressable
                onPress={() => handleOpenLink(item.url, item.label)}
                className="flex-row items-center px-4 py-4 active:bg-secondary/50"
              >
                <Icon size={20} color="#737373" />
                <Text className="flex-1 ml-3 text-base font-body text-foreground">
                  {item.label}
                </Text>
                <ChevronRight size={18} color="#737373" />
              </Pressable>
              {index < legalItems.length - 1 && <Separator />}
            </View>
          );
        })}
      </Card>

      {/* DSGVO section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">DSGVO</CardTitle>
        </CardHeader>
        <Text className="text-xs font-body text-muted-foreground mb-4">
          Gemäß der Datenschutz-Grundverordnung (DSGVO) hast du das Recht,
          deine gespeicherten Daten zu exportieren.
        </Text>
        <Button
          variant="outline"
          onPress={handleExportData}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <Download size={18} color="#1a1a2e" />
            <Text className="text-base font-body-semibold text-foreground">
              Daten exportieren
            </Text>
          </View>
        </Button>
      </Card>

      {/* Cookie / Tracking consent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Einwilligungen</CardTitle>
        </CardHeader>

        <View className="gap-0">
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1 mr-3">
              <Text className="text-base font-body text-foreground">
                Analyse & Statistiken
              </Text>
              <Text className="text-xs font-body text-muted-foreground">
                Hilft uns, die App zu verbessern
              </Text>
            </View>
            <Switch
              checked={analyticsConsent}
              onCheckedChange={(v) => {
                setAnalyticsConsent(v);
                toast({
                  title: v
                    ? "Analyse-Tracking aktiviert"
                    : "Analyse-Tracking deaktiviert",
                });
              }}
            />
          </View>

          <Separator />

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1 mr-3">
              <Text className="text-base font-body text-foreground">
                Personalisierte Inhalte
              </Text>
              <Text className="text-xs font-body text-muted-foreground">
                Vorschläge basierend auf Nutzung
              </Text>
            </View>
            <Switch
              checked={personalizedContent}
              onCheckedChange={(v) => {
                setPersonalizedContent(v);
                toast({
                  title: v
                    ? "Personalisierung aktiviert"
                    : "Personalisierung deaktiviert",
                });
              }}
            />
          </View>
        </View>
      </Card>

      {/* App version */}
      <View className="mt-6 items-center">
        <Text className="text-xs font-body text-muted-foreground">
          Routine Stars v0.1.0
        </Text>
      </View>
    </ScrollView>
  );
}
