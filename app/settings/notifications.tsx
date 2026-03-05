import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Bell, BellOff, Clock, Gift } from "lucide-react-native";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { storage, KEYS } from "@/lib/storage";
import type { NotificationSettings } from "@/lib/types";

const defaultSettings: NotificationSettings = {
  routineReminders: true,
  pushNotifications: false,
  rewardNotifications: true,
  quietFrom: "20:00",
  quietTo: "07:00",
};

export default function NotificationsSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    async function loadSettings() {
      const storedSettings = await storage.getItem<NotificationSettings>(
        KEYS.NOTIFICATION_SETTINGS
      );

      if (storedSettings) {
        setSettings(storedSettings);
      }
    }

    loadSettings();
  }, []);

  async function persistSettings(nextSettings: NotificationSettings) {
    setSettings(nextSettings);
    await storage.setItem(KEYS.NOTIFICATION_SETTINGS, nextSettings);
  }

  async function handleToggle(
    label: string,
    value: boolean,
    key: keyof Pick<
      NotificationSettings,
      "routineReminders" | "pushNotifications" | "rewardNotifications"
    >
  ) {
    const updated = {
      ...settings,
      [key]: value,
    };
    await persistSettings(updated);
    toast({
      title: value ? `${label} aktiviert` : `${label} deaktiviert`,
    });
  }

  async function handleTimeChange(
    key: keyof Pick<NotificationSettings, "quietFrom" | "quietTo">,
    value: string
  ) {
    const updated = {
      ...settings,
      [key]: value,
    };
    await persistSettings(updated);
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      {/* Routine reminders */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Benachrichtigungen</CardTitle>
        </CardHeader>

        <View className="gap-0">
          {/* Routine reminders */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1">
              <Bell size={20} color="#737373" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-body text-foreground">
                  Erinnerungen für Routinen
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Lokal gespeicherte Erinnerungseinstellung für Routinen
                </Text>
              </View>
            </View>
            <Switch
              checked={settings.routineReminders}
              onCheckedChange={(v) =>
                handleToggle("Routinen-Erinnerungen", v, "routineReminders")
              }
            />
          </View>

          <Separator />

          {/* Push notifications */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1">
              <BellOff size={20} color="#737373" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-body text-foreground">
                  Push-Benachrichtigungen
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Wird lokal gespeichert. Eine echte Push-Integration folgt später.
                </Text>
              </View>
            </View>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(v) =>
                handleToggle("Push-Benachrichtigungen", v, "pushNotifications")
              }
            />
          </View>

          <Separator />

          {/* Reward notifications */}
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1">
              <Gift size={20} color="#737373" />
              <View className="ml-3 flex-1">
                <Text className="text-base font-body text-foreground">
                  Belohnung erreicht
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Lokale Einstellung für den Hinweis auf erreichbare Belohnungen
                </Text>
              </View>
            </View>
            <Switch
              checked={settings.rewardNotifications}
              onCheckedChange={(v) =>
                handleToggle("Belohnungs-Benachrichtigung", v, "rewardNotifications")
              }
            />
          </View>
        </View>
      </Card>

      {/* Quiet hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ruhezeit</CardTitle>
        </CardHeader>
        <Text className="text-xs font-body text-muted-foreground mb-4">
          Während der Ruhezeit werden keine Benachrichtigungen gesendet.
        </Text>

        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-sm font-body-semibold text-muted-foreground mb-1.5">
              Ruhezeit von
            </Text>
            <View className="flex-row items-center">
              <Clock size={16} color="#737373" />
              <Input
                value={settings.quietFrom}
                onChangeText={(value) => {
                  void handleTimeChange("quietFrom", value);
                }}
                placeholder="20:00"
                keyboardType="numbers-and-punctuation"
                className="ml-2 flex-1"
              />
            </View>
          </View>

          <View className="flex-1">
            <Text className="text-sm font-body-semibold text-muted-foreground mb-1.5">
              bis
            </Text>
            <View className="flex-row items-center">
              <Clock size={16} color="#737373" />
              <Input
                value={settings.quietTo}
                onChangeText={(value) => {
                  void handleTimeChange("quietTo", value);
                }}
                placeholder="07:00"
                keyboardType="numbers-and-punctuation"
                className="ml-2 flex-1"
              />
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
