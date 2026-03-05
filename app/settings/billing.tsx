import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Check, Crown, Star, Sparkles } from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const premiumFeatures = [
  { label: "Unbegrenzte Kinder", description: "Keine Begrenzung der Kinder-Profile" },
  { label: "Unbegrenzte Routinen", description: "Erstelle so viele Routinen wie nötig" },
  { label: "Statistiken & Berichte", description: "Detaillierte Einblicke und Fortschritt" },
  { label: "Prioritäts-Support", description: "Schnelle Hilfe bei Fragen und Problemen" },
];

export default function BillingSettings() {
  const { toast } = useToast();

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      {/* Current plan */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Aktueller Plan</CardTitle>
        </CardHeader>
        <View className="flex-row items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Star size={24} color="#737373" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-lg font-headline text-foreground">
              Kostenlos
            </Text>
            <Text className="text-sm font-body text-muted-foreground">
              Lokale Grundfunktionen für den Einstieg
            </Text>
          </View>
        </View>
      </Card>

      {/* Premium upgrade card */}
      <Card className="mb-4 border-primary/50">
        <View className="flex-row items-center mb-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/30">
            <Crown size={24} color="#FFD700" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-xl font-headline text-foreground">
              Premium ist geplant
            </Text>
            <Text className="text-sm font-body text-muted-foreground">
              Dieses Abo ist noch nicht live
            </Text>
          </View>
        </View>

        <Separator className="mb-4" />

        {/* Feature list */}
        <View className="gap-3 mb-6">
          {premiumFeatures.map((feature) => (
            <View key={feature.label} className="flex-row items-start">
              <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                <Check size={14} color="#FFD700" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-body-semibold text-foreground">
                  {feature.label}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Price info */}
        <View className="items-center mb-4">
          <Text className="text-3xl font-headline text-foreground">
            Demnächst
          </Text>
          <Text className="text-sm font-body text-muted-foreground">
            Wir informieren dich, sobald Premium startet.
          </Text>
        </View>

        {/* CTA button */}
        <Button
          onPress={() => toast({ title: "Premium ist noch nicht verfügbar." })}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <Sparkles size={18} color="#1a1a2e" />
            <Text className="text-base font-body-semibold text-primary-foreground">
              Premium holen
            </Text>
          </View>
        </Button>
      </Card>

      {/* FAQ hint */}
      <Card>
        <View className="flex-row items-start">
          <Text className="text-lg mr-2">💡</Text>
          <View className="flex-1">
            <Text className="text-sm font-body-semibold text-foreground">
              Wusstest du?
            </Text>
            <Text className="text-xs font-body text-muted-foreground mt-1">
              Der aktuelle Fokus liegt auf einem starken lokalen Familien-Setup.
              Premium-Funktionen folgen später.
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
