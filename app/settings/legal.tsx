import React, { useState } from "react";
import { View, Text, ScrollView, Linking } from "react-native";
import Animated from "react-native-reanimated";
import Constants from "expo-constants";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  FileText,
  Globe,
  MessageCircle,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
  TriangleAlert,
} from "@/lib/icons";
import { useChildren } from "@/hooks/use-children";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Separator } from "@/components/ui/separator";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { useToast } from "@/hooks/use-toast";
import { triggerFeedback } from "@/lib/feedback";
import { enterFade, enterStagger, exitFade } from "@/lib/motion";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import {
  legalDocuments,
  legalLastUpdated,
  privacySummary,
  type LegalDocumentId,
} from "@/lib/legal-content";

type LegalIcon = typeof Shield;

const documentIcons: Record<LegalDocumentId, LegalIcon> = {
  datenschutz: Shield,
  nutzungsbedingungen: FileText,
  impressum: Building2,
};

const summaryIcons: LegalIcon[] = [Smartphone, ShieldCheck, Globe];

/** Secondary: the same texts as web pages, handy for sharing. */
const onlineLinks: { label: string; url: string; icon?: LegalIcon }[] = [
  {
    label: "Datenschutzerklärung online",
    url: "https://routinestars.app/privacy",
  },
  {
    label: "Nutzungsbedingungen online",
    url: "https://routinestars.app/terms",
  },
  {
    label: "Impressum online",
    url: "https://routinestars.app/imprint",
  },
  {
    label: "Support kontaktieren",
    url: "mailto:support@routinestars.app",
    icon: MessageCircle,
  },
];

export default function LegalSettings() {
  const { selectedChild } = useChildren();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<LegalDocumentId | null>(null);
  const palette = getThemePalette(selectedChild?.theme);
  const appVersion = Constants.expoConfig?.version ?? null;

  function handleToggleDocument(id: LegalDocumentId) {
    void triggerFeedback("theme_preview", { disableSound: true });
    setExpandedId((current) => (current === id ? null : id));
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
        <Animated.View entering={enterStagger(0)}>
          <SettingsHeroCard
            label="Transparenz"
            title="Alles bleibt auf dem Gerät"
            description="Rechtliche Texte stehen vollständig in der App. Es gibt keine Einwilligungen zu verwalten, weil nichts erhoben und nichts weitergegeben wird."
            badges={[{ label: "Lokal" }, { label: "Kein Tracking" }]}
            palette={palette}
          />
        </Animated.View>

        <Animated.View entering={enterStagger(1)}>
          <Card
            className="mb-4 rounded-card"
            style={{
              backgroundColor: palette.cardTint,
              borderColor: palette.accentBorder,
              ...shadowPresets.shadowCard,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <ShieldCheck size={20} color={palette.accentStrong} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-headline text-foreground">
                  {privacySummary.title}
                </Text>
                <Text className="mt-1 text-base font-body leading-6 text-foreground">
                  {privacySummary.statement}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-2">
              {privacySummary.points.map((point, index) => {
                const PointIcon = summaryIcons[index] ?? ShieldCheck;
                return (
                  <View
                    key={point}
                    className="flex-row items-start gap-3 rounded-tile px-3 py-2.5"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <PointIcon size={16} color={palette.accentStrong} />
                    <Text className="flex-1 text-sm font-body leading-5 text-muted-foreground">
                      {point}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enterStagger(2)}>
          <Card
            className="mb-4 overflow-hidden rounded-card p-0"
            style={{
              backgroundColor: palette.cardTint,
              borderColor: palette.accentBorder,
              ...shadowPresets.shadowCard,
            }}
          >
            {legalDocuments.map((document, index) => {
              const Icon = documentIcons[document.id];
              const isExpanded = expandedId === document.id;
              const Chevron = isExpanded ? ChevronUp : ChevronDown;

              return (
                <View key={document.id}>
                  <PressableScale
                    onPress={() => handleToggleDocument(document.id)}
                    className="flex-row items-center px-4 py-4"
                    accessibilityRole="button"
                    accessibilityLabel={document.title}
                    accessibilityHint={
                      isExpanded ? "Text schließen" : "Text in der App öffnen"
                    }
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-tile"
                      style={{ backgroundColor: palette.heroSurface }}
                    >
                      <Icon size={20} color={palette.accentStrong} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-body-semibold text-foreground">
                        {document.title}
                      </Text>
                      <Text className="mt-0.5 text-sm font-body leading-5 text-muted-foreground">
                        {document.summary}
                      </Text>
                    </View>
                    <Chevron size={18} color={palette.accentText} />
                  </PressableScale>

                  {isExpanded ? (
                    <Animated.View
                      entering={enterFade()}
                      exiting={exitFade()}
                      className="px-4 pb-5"
                    >
                      {document.hasPlaceholders ? (
                        <View className="flex-row items-start gap-2 rounded-tile bg-warning-soft px-3 py-2.5">
                          <TriangleAlert size={16} color={semanticColors.warningForeground} />
                          <Text className="flex-1 text-sm font-body leading-5 text-warning-foreground">
                            Angaben in eckigen Klammern sind Platzhalter und werden vor der
                            Veröffentlichung ergänzt.
                          </Text>
                        </View>
                      ) : null}

                      {document.sections.map((section) => (
                        <View key={section.heading} className="mt-4">
                          <Text className="text-base font-body-semibold text-foreground">
                            {section.heading}
                          </Text>
                          {section.paragraphs.map((paragraph) => (
                            <Text
                              key={paragraph}
                              className="mt-1.5 text-sm font-body leading-6 text-muted-foreground"
                            >
                              {paragraph}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </Animated.View>
                  ) : null}

                  {index < legalDocuments.length - 1 ? <Separator /> : null}
                </View>
              );
            })}
          </Card>
        </Animated.View>

        <Animated.View entering={enterStagger(3)}>
          <Card
            className="mb-4 rounded-card"
            style={{
              backgroundColor: palette.cardTint,
              borderColor: palette.accentBorder,
              ...shadowPresets.shadowCard,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Trash2 size={20} color={palette.accentStrong} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-headline text-foreground">Daten löschen</Text>
                <Text className="mt-1 text-sm font-body leading-6 text-muted-foreground">
                  Einzelne Profile, Routinen und Belohnungen entfernst du direkt im
                  Elternbereich. Alle lokalen Daten löschst du unter „Konto“ mit
                  „Alles zurücksetzen“ — oder indem du die App vom Gerät entfernst.
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={enterStagger(4)}>
          <Card
            className="mb-4 rounded-card"
            style={{
              backgroundColor: palette.cardTint,
              borderColor: palette.accentBorder,
              ...shadowPresets.shadowCard,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Download size={20} color={palette.accentStrong} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-headline text-foreground">Datenexport</Text>
                <Text className="mt-1 text-sm font-body leading-6 text-muted-foreground">
                  Ein Export deiner lokalen Daten als Datei ist vorgesehen, in dieser Version
                  aber noch nicht verfügbar.
                </Text>
              </View>
            </View>
            <Button
              variant="outline"
              onPress={handleExportData}
              accessibilityRole="button"
              accessibilityLabel="Datenexport folgt später"
              className="mt-4 w-full rounded-card border"
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
        </Animated.View>

        <Animated.View entering={enterStagger(5)}>
          <Card
            className="overflow-hidden rounded-card p-0"
            style={{
              backgroundColor: palette.cardTint,
              borderColor: palette.accentBorder,
              ...shadowPresets.shadowSubtle,
            }}
          >
            <View className="px-4 pt-4">
              <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                Online-Version
              </Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Dieselben Texte im Web — praktisch zum Weiterleiten. Maßgeblich ist die
                Fassung in der App.
              </Text>
            </View>

            <View className="mt-2">
              {onlineLinks.map((item, index) => {
                const Icon = item.icon ?? Globe;
                return (
                  <View key={item.label}>
                    <PressableScale
                      onPress={() => handleOpenLink(item.url, item.label)}
                      className="flex-row items-center px-4 py-3"
                      accessibilityRole="link"
                      accessibilityLabel={item.label}
                      accessibilityHint="Öffnet den Browser"
                    >
                      <Icon size={18} color={palette.accentText} />
                      <Text className="ml-3 flex-1 text-sm font-body text-foreground">
                        {item.label}
                      </Text>
                      <ChevronRight size={16} color={palette.accentText} />
                    </PressableScale>
                    {index < onlineLinks.length - 1 ? <Separator /> : null}
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        <View className="mt-6 items-center gap-1">
          <Text className="text-xs font-body text-muted-foreground">
            {appVersion ? `Routine Stars v${appVersion}` : "Routine Stars"}
          </Text>
          <Text className="text-xs font-body text-muted-foreground">
            Rechtliche Texte · Stand: {legalLastUpdated}
          </Text>
        </View>
      </ScrollView>
    </ThemedScreenBackground>
  );
}
