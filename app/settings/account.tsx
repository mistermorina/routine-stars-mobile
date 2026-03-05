import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Shield, Lock, Smartphone } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { hasParentPin } from "@/lib/parent-access";
import { storage, KEYS } from "@/lib/storage";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountSettings() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [pinConfigured, setPinConfigured] = useState(false);

  useEffect(() => {
    async function loadPinStatus() {
      setPinConfigured(await hasParentPin());
    }

    loadPinStatus();
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
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Lokaler App-Status</CardTitle>
        </CardHeader>
        <View className="flex-row items-start">
          <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Smartphone size={20} color="#737373" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-body-semibold text-foreground">
              Daten bleiben auf diesem Gerät
            </Text>
            <Text className="mt-1 text-sm font-body text-muted-foreground">
              Routine Stars speichert Kinder, Routinen und Belohnungen lokal.
              Cloud-Konten und Synchronisierung kommen später.
            </Text>
          </View>
        </View>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Elternschutz</CardTitle>
        </CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Shield size={20} color="#737373" />
            <View className="ml-3 flex-1">
              <Text className="text-base font-body text-foreground">
                {pinConfigured ? "PIN ist eingerichtet" : "Noch kein PIN eingerichtet"}
              </Text>
              <Text className="text-xs font-body text-muted-foreground">
                Der Eltern-Bereich bleibt pro Sitzung entsperrt.
              </Text>
            </View>
          </View>
          <Button variant="ghost" size="sm" onPress={handleResetPin}>
            <Text className="text-sm font-body-semibold text-primary">
              {pinConfigured ? "Neu setzen" : "Einrichten"}
            </Text>
          </Button>
        </View>
      </Card>

      {/* Actions */}
      <View className="mt-4 gap-3">
        <Button
          variant="outline"
          onPress={handleLockParentArea}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <Lock size={18} color="#1a1a2e" />
            <Text className="text-base font-body-semibold text-foreground">
              Eltern-Bereich sperren
            </Text>
          </View>
        </Button>

        <Button
          variant="outline"
          onPress={handleResetLocalSession}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <Shield size={18} color="#1a1a2e" />
            <Text className="text-base font-body-semibold text-foreground">
              Lokale Sitzung beenden
            </Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
}
