import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { storage, KEYS } from "@/lib/storage";
import { ToastOverlay } from "@/components/ui/toast";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { toasts, toast, dismiss } = useToast();
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const resolveNextRoute = async () => {
    const children = await storage.getItem<unknown[]>(KEYS.CHILDREN);
    return children && children.length > 0 ? "/(tabs)" : "/(auth)/onboarding";
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;

    // Optional local session until cloud accounts exist
    login();

    if (authMode === "signup") {
      await storage.setItem(KEYS.HAS_ONBOARDED, false);
      toast({
        title: "Lokaler Zugang aktiviert",
        description: "Du richtest jetzt deine Familie ein.",
      });
      router.replace(await resolveNextRoute());
    } else {
      toast({
        title: "Willkommen zurück",
        description: "Cloud-Konten folgen später. Du nutzt die App lokal auf diesem Gerät.",
      });
      router.replace(await resolveNextRoute());
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    login();
    toast({
      title: `${provider === "google" ? "Google" : "Apple"} ist vorbereitet`,
      description: "Fürs Erste startest du lokal auf diesem Gerät.",
    });
    router.replace(await resolveNextRoute());
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="items-center mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="rounded-lg bg-primary p-2">
                <Check size={18} color="#1a1a2e" strokeWidth={3} />
              </View>
              <Text className="text-xl font-headline text-foreground">
                Routine Stars
              </Text>
            </View>
            <Text className="text-2xl font-headline text-foreground text-center">
              Optionales Familienkonto
            </Text>
            <Text className="mt-2 text-sm font-body text-muted-foreground text-center">
              Die Einrichtung läuft lokal. Cloud-Synchronisierung kommt später.
            </Text>
          </View>

          {/* Auth mode toggle */}
          <View className="flex-row rounded-lg border border-border bg-card p-1.5 mb-8">
            <Button
              variant={authMode === "signup" ? "secondary" : "ghost"}
              onPress={() => setAuthMode("signup")}
              className="flex-1"
            >
              Registrieren
            </Button>
            <Button
              variant={authMode === "login" ? "secondary" : "ghost"}
              onPress={() => setAuthMode("login")}
              className="flex-1"
            >
              Anmelden
            </Button>
          </View>

          {/* Email & Password fields */}
          <View className="gap-4 mb-4">
            <View className="gap-1.5">
              <Label>E-Mail</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Deine E-Mail-Adresse"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>
            <View className="gap-1.5">
              <Label>Passwort</Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Dein Passwort"
                secureTextEntry
                textContentType={
                  authMode === "signup" ? "newPassword" : "password"
                }
              />
            </View>
          </View>

          {/* Submit button */}
          <Button
            onPress={handleSubmit}
            size="lg"
            className="w-full mb-2"
            disabled={!email.trim() || !password.trim()}
          >
            {authMode === "signup" ? "Konto erstellen" : "Anmelden"}
          </Button>

          {/* Divider */}
          <View className="my-6 flex-row items-center">
            <Separator className="flex-1" />
            <Text className="mx-4 text-xs font-body text-muted-foreground uppercase">
              oder
            </Text>
            <Separator className="flex-1" />
          </View>

          {/* Social login buttons */}
          <View className="gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onPress={() => {
                void handleSocialLogin("google");
              }}
            >
              <Text className="text-base font-body-semibold text-foreground">
                Weiter mit Google
              </Text>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-[#000000]"
              onPress={() => {
                void handleSocialLogin("apple");
              }}
            >
              <Text className="text-base font-body-semibold text-white">
                Weiter mit Apple
              </Text>
            </Button>
          </View>

          {/* Terms / Privacy footer for signup */}
          {authMode === "signup" && (
            <Text className="mt-8 px-4 text-center text-xs font-body text-muted-foreground leading-5">
              Mit der Aktivierung des lokalen Zugangs stimmst du unseren{" "}
              <Text className="text-primary font-body-semibold">
                Nutzungsbedingungen
              </Text>{" "}
              und der{" "}
              <Text className="text-primary font-body-semibold">
                Datenschutzerklaerung
              </Text>{" "}
              zu.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast overlay */}
      <ToastOverlay toasts={toasts} onDismiss={dismiss} />
    </SafeAreaView>
  );
}
