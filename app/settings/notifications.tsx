import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Bell, BellOff, Clock, Gift } from "lucide-react-native";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsSettings() {
  const { toast } = useToast();
  const [routineReminders, setRoutineReminders] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [rewardNotifications, setRewardNotifications] = useState(true);
  const [quietFrom, setQuietFrom] = useState("20:00");
  const [quietTo, setQuietTo] = useState("07:00");

  function handleToggle(
    label: string,
    value: boolean,
    setter: (v: boolean) => void
  ) {
    setter(value);
    toast({
      title: value ? `${label} aktiviert` : `${label} deaktiviert`,
    });
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
                  Erinnere an anstehende Routinen
                </Text>
              </View>
            </View>
            <Switch
              checked={routineReminders}
              onCheckedChange={(v) =>
                handleToggle("Routinen-Erinnerungen", v, setRoutineReminders)
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
                  Allgemeine Push-Nachrichten erhalten
                </Text>
              </View>
            </View>
            <Switch
              checked={pushNotifications}
              onCheckedChange={(v) =>
                handleToggle("Push-Benachrichtigungen", v, setPushNotifications)
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
                  Benachrichtigen, wenn genug Sterne gesammelt sind
                </Text>
              </View>
            </View>
            <Switch
              checked={rewardNotifications}
              onCheckedChange={(v) =>
                handleToggle("Belohnungs-Benachrichtigung", v, setRewardNotifications)
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
                value={quietFrom}
                onChangeText={setQuietFrom}
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
                value={quietTo}
                onChangeText={setQuietTo}
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
