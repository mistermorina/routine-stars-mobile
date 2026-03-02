import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Mail, KeyRound, Shield, LogOut, Trash2 } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AccountSettings() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleLogout() {
    auth.logout();
    await storage.clear();
    toast({ title: "Erfolgreich abgemeldet" });
    router.replace("/(auth)/login");
  }

  function handleDeleteAccount() {
    setShowDeleteDialog(true);
  }

  async function confirmDeleteAccount() {
    setShowDeleteDialog(false);
    auth.logout();
    await storage.clear();
    toast({ title: "Konto wurde gelöscht", variant: "destructive" });
    router.replace("/(auth)/login");
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      {/* Email section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">E-Mail</CardTitle>
        </CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Mail size={20} color="#737373" />
            <Text className="ml-3 text-base font-body text-foreground">
              eltern@beispiel.de
            </Text>
          </View>
          <Button variant="ghost" size="sm" onPress={() => toast({ title: "Kommt bald" })}>
            <Text className="text-sm font-body-semibold text-primary">Ändern</Text>
          </Button>
        </View>
      </Card>

      {/* Password section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Passwort</CardTitle>
        </CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <KeyRound size={20} color="#737373" />
            <Text className="ml-3 text-base font-body text-foreground">
              ••••••••
            </Text>
          </View>
          <Button variant="ghost" size="sm" onPress={() => toast({ title: "Kommt bald" })}>
            <Text className="text-sm font-body-semibold text-primary">Ändern</Text>
          </Button>
        </View>
      </Card>

      {/* Security section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Sicherheit</CardTitle>
        </CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Shield size={20} color="#737373" />
            <Text className="ml-3 text-base font-body text-foreground">
              PIN / Face ID
            </Text>
          </View>
          <Switch
            checked={faceIdEnabled}
            onCheckedChange={setFaceIdEnabled}
          />
        </View>
        <Text className="mt-2 text-xs font-body text-muted-foreground">
          Verwende Face ID oder deine PIN, um den Eltern-Bereich zu schützen.
        </Text>
      </Card>

      {/* Actions */}
      <View className="mt-4 gap-3">
        <Button
          variant="outline"
          onPress={handleLogout}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <LogOut size={18} color="#1a1a2e" />
            <Text className="text-base font-body-semibold text-foreground">
              Abmelden
            </Text>
          </View>
        </Button>

        <Button
          variant="destructive"
          onPress={handleDeleteAccount}
          className="w-full"
        >
          <View className="flex-row items-center gap-2">
            <Trash2 size={18} color="#FFFFFF" />
            <Text className="text-base font-body-semibold text-destructive-foreground">
              Konto löschen
            </Text>
          </View>
        </Button>
      </View>

      {/* Delete confirmation dialog */}
      <Dialog visible={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konto löschen?</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten,
              Kinder-Profile und Fortschritte werden unwiderruflich gelöscht.
            </DialogDescription>
          </DialogHeader>

          <View className="mt-4 gap-3">
            <Button
              variant="destructive"
              onPress={confirmDeleteAccount}
              className="w-full"
            >
              Ja, Konto löschen
            </Button>
            <Button
              variant="outline"
              onPress={() => setShowDeleteDialog(false)}
              className="w-full"
            >
              Abbrechen
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </ScrollView>
  );
}
