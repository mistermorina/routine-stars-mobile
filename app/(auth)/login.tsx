import React, { useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogIn, UserRoundPlus } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { storage, KEYS } from "@/lib/storage";
import { ToastOverlay } from "@/components/ui/toast";
import { getPostAuthRoute } from "@/lib/auth-flow";
import { getThemePalette } from "@/lib/theme";
import { triggerFeedback } from "@/lib/feedback";

type AuthMode = "signup" | "login";

const authModeContent: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    action: string;
    Icon: typeof UserRoundPlus;
  }
> = {
  signup: {
    eyebrow: "Neu hier",
    title: "Familienkonto anlegen",
    description: "Danach geht es direkt in euer Setup für Kind, Starter-Routine und Belohnungen.",
    action: "Familienkonto anlegen",
    Icon: UserRoundPlus,
  },
  login: {
    eyebrow: "Schon eingerichtet",
    title: "Anmelden",
    description: "Wenn deine Familie schon angelegt ist, landest du direkt wieder in eurer App.",
    action: "Anmelden",
    Icon: LogIn,
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { toasts, toast, dismiss } = useToast();
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const palette = getThemePalette("sterne");
  const currentMode = authModeContent[authMode];

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
      router.replace("/(auth)/onboarding");
    } else {
      toast({
        title: "Willkommen zurück",
        description: "Cloud-Konten folgen später. Du nutzt die App lokal auf diesem Gerät.",
      });
      router.replace((await getPostAuthRoute()) as never);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    login();
    if (authMode === "signup") {
      await storage.setItem(KEYS.HAS_ONBOARDED, false);
    }
    toast({
      title: `${provider === "google" ? "Google" : "Apple"} ist vorbereitet`,
      description: "Fürs Erste startest du lokal auf diesem Gerät.",
    });
    if (authMode === "signup") {
      router.replace("/(auth)/onboarding");
      return;
    }
    router.replace((await getPostAuthRoute()) as never);
  };

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    void triggerFeedback("tab_focus");
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedScreenBackground theme="sterne">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="px-4 pb-10 pt-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              className="rounded-[20px] border px-4 py-3"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                >
                  <currentMode.Icon size={20} color={palette.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                    Familienzugang
                  </Text>
                  <Text className="text-lg font-headline leading-6 text-foreground">
                    {authMode === "signup" ? "Neu starten" : "Zurückkehren"}
                  </Text>
                </View>
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <Text
                    className="text-xs font-body-semibold uppercase tracking-[0.8px]"
                    style={{ color: palette.accentText }}
                  >
                    Lokal
                  </Text>
                </View>
              </View>
            </View>

            <View
              className="mt-3 rounded-[22px] border px-4 py-4"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                >
                  <currentMode.Icon size={20} color={palette.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                    {currentMode.eyebrow}
                  </Text>
                  <Text className="text-lg font-headline text-foreground">
                    {currentMode.title}
                  </Text>
                </View>
              </View>

              <Text className="mt-3 text-sm font-body leading-6 text-muted-foreground">
                {currentMode.description}
              </Text>

              <View
                className="mt-4 flex-row rounded-[18px] p-1"
                style={{ backgroundColor: palette.heroSurface }}
              >
                {(["signup", "login"] as AuthMode[]).map((mode) => {
                  const isSelected = authMode === mode;
                  const modeDetails = authModeContent[mode];

                  return (
                    <Pressable
                      key={mode}
                      onPress={() => handleModeChange(mode)}
                      className="flex-1 rounded-[14px] px-3 py-2.5"
                      style={{
                        backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                      }}
                    >
                      <Text
                        className="text-center text-sm font-body-semibold leading-5"
                        style={{
                          color: isSelected ? palette.accentText : "#6F6F74",
                        }}
                      >
                        {modeDetails.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-5 gap-4">
                <View className="gap-1.5">
                  <Label>E-Mail</Label>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="deine@email.de"
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
                    placeholder={authMode === "signup" ? "Mindestens 8 Zeichen" : "Dein Passwort"}
                    secureTextEntry
                    textContentType={
                      authMode === "signup" ? "newPassword" : "password"
                    }
                  />
                </View>
              </View>

              <Button
                onPress={handleSubmit}
                size="lg"
                className="mt-5 h-14 w-full rounded-[18px]"
                style={{
                  backgroundColor:
                    !email.trim() || !password.trim() ? "#DDE8EC" : palette.button,
                }}
                textClassName={
                  !email.trim() || !password.trim()
                    ? "text-[#344A53] font-body-semibold leading-5"
                    : "text-white font-body-semibold leading-5"
                }
                disabled={!email.trim() || !password.trim()}
              >
                {currentMode.action}
              </Button>

              <View className="my-6 flex-row items-center">
                <Separator className="flex-1" />
                <Text className="mx-4 text-xs font-body text-muted-foreground uppercase">
                  oder
                </Text>
                <Separator className="flex-1" />
              </View>

              <View className="gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 w-full rounded-[18px]"
                  style={{ borderColor: palette.accentBorder, backgroundColor: "#FFFFFF" }}
                  onPress={() => {
                    void handleSocialLogin("google");
                  }}
                >
                  <Text className="text-center text-base font-body-semibold leading-5 text-foreground">
                    {authMode === "signup" ? "Mit Google registrieren" : "Mit Google anmelden"}
                  </Text>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 w-full rounded-[18px] bg-[#111111]"
                  style={{ borderColor: "#111111" }}
                  onPress={() => {
                    void handleSocialLogin("apple");
                  }}
                >
                  <Text className="text-center text-base font-body-semibold leading-5 text-white">
                    {authMode === "signup" ? "Mit Apple registrieren" : "Mit Apple anmelden"}
                  </Text>
                </Button>
              </View>
            </View>

            {authMode === "signup" ? (
              <Text className="mt-6 px-4 text-center text-xs font-body leading-5 text-muted-foreground">
                Mit der Aktivierung des lokalen Zugangs stimmst du unseren{" "}
                <Text className="font-body-semibold" style={{ color: palette.accentStrong }}>
                  Nutzungsbedingungen
                </Text>{" "}
                und der{" "}
                <Text className="font-body-semibold" style={{ color: palette.accentStrong }}>
                  Datenschutzerklärung
                </Text>{" "}
                zu.
              </Text>
            ) : (
              <Text className="mt-6 px-4 text-center text-xs font-body leading-5 text-muted-foreground">
                Wenn noch kein Kinderprofil vorhanden ist, startet nach dem Login direkt das
                neue Onboarding statt des Dashboards.
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedScreenBackground>

      <ToastOverlay toasts={toasts} onDismiss={dismiss} />
    </SafeAreaView>
  );
}
