import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Check,
  Heart,
  LogIn,
  Shield,
  Sparkles,
  UserRoundPlus,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { FamilyHeroArt } from "@/components/ui/family-hero-art";
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
    description: "Danach geht es direkt in Kind, Starter-Routine und Belohnungen.",
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
  const trustPoints = useMemo(
    () => [
      {
        icon: Shield,
        label: "Privat auf diesem Gerät",
      },
      {
        icon: Heart,
        label: "Eltern richten alles ein",
      },
      {
        icon: Sparkles,
        label: "Danach startet euer Onboarding",
      },
    ],
    []
  );

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
      router.replace(await getPostAuthRoute());
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
    router.replace(await getPostAuthRoute());
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
              className="rounded-[32px] border px-4 pb-4 pt-4"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className="rounded-2xl p-2.5"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <Check size={18} color={palette.accentText} strokeWidth={3} />
                  </View>
                  <Text className="text-xl font-headline text-foreground">
                    Routine Stars
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
                    Familienstart
                  </Text>
                </View>
              </View>

              <Text className="mt-4 text-[30px] font-headline leading-[36px] text-foreground">
                Erst kurz anmelden, dann startet euer echtes Onboarding.
              </Text>
              <Text className="mt-3 text-sm font-body leading-6 text-muted-foreground">
                Der erste Eindruck soll Vertrauen schaffen: Eltern richten alles ein,
                Kinder bekommen danach eine liebevollere App-Welt mit Routinen,
                Sternen und Belohnungen.
              </Text>

              <FamilyHeroArt theme="sterne" className="mt-4" />

              <View className="mt-4 flex-row flex-wrap gap-2">
                {trustPoints.map((point) => (
                  <View
                    key={point.label}
                    className="flex-row items-center gap-2 rounded-full border px-3 py-2"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: palette.accentBorder,
                    }}
                  >
                    <point.icon size={14} color={palette.accentStrong} />
                    <Text className="text-xs font-body-semibold text-foreground">
                      {point.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                className="mt-4 rounded-[22px] px-4 py-3"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                  So laeuft der Start
                </Text>
                <View className="mt-3 flex-row items-center gap-2">
                  <View className="rounded-full bg-white px-3 py-2">
                    <Text className="text-xs font-body-semibold text-foreground">
                      1 Konto
                    </Text>
                  </View>
                  <ArrowRight size={14} color={palette.accentStrong} />
                  <View className="rounded-full bg-white px-3 py-2">
                    <Text className="text-xs font-body-semibold text-foreground">
                      2 Kind
                    </Text>
                  </View>
                  <ArrowRight size={14} color={palette.accentStrong} />
                  <View className="rounded-full bg-white px-3 py-2">
                    <Text className="text-xs font-body-semibold text-foreground">
                      3 Routine
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              className="mt-4 rounded-[28px] border px-4 py-4"
              style={{
                backgroundColor: palette.cardTint,
                borderColor: palette.accentBorder,
              }}
            >
              <Text className="text-lg font-headline text-foreground">
                Wie moechtest du starten?
              </Text>
              <Text className="mt-1 text-sm font-body text-muted-foreground">
                Registrieren und Anmelden sind jetzt klar getrennt.
              </Text>

              <View className="mt-4 gap-3">
                {(["signup", "login"] as AuthMode[]).map((mode) => {
                  const isSelected = authMode === mode;
                  const modeDetails = authModeContent[mode];
                  const ModeIcon = modeDetails.Icon;

                  return (
                    <Pressable
                      key={mode}
                      onPress={() => handleModeChange(mode)}
                      className="rounded-[24px] border px-4 py-4"
                      style={
                        isSelected
                          ? {
                              backgroundColor: palette.accentSoft,
                              borderColor: palette.accent,
                            }
                          : {
                              backgroundColor: "#FFFFFF",
                              borderColor: palette.accentBorder,
                            }
                      }
                    >
                      <View className="flex-row items-start gap-3">
                        <View
                          className="mt-0.5 h-11 w-11 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? palette.surface
                              : palette.heroSurface,
                          }}
                        >
                          <ModeIcon size={20} color={palette.accentStrong} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-headline text-foreground">
                            {modeDetails.title}
                          </Text>
                          <Text className="mt-1 text-sm font-body text-muted-foreground">
                            {mode === "signup"
                              ? "Fuer neue Familien. Danach geht es direkt in den Einrichtungsflow."
                              : "Fuer bestehende Familien. Bei unvollstaendiger Einrichtung startet danach wieder das Onboarding."}
                          </Text>
                        </View>
                        {isSelected ? (
                          <View
                            className="rounded-full px-2 py-1"
                            style={{ backgroundColor: palette.tabActiveBg }}
                          >
                            <Text
                              className="text-[11px] font-body-semibold uppercase tracking-[0.7px]"
                              style={{ color: palette.accentText }}
                            >
                              Aktiv
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View
              className="mt-4 rounded-[28px] border px-4 py-4"
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
                className="mt-5 w-full"
                style={{ backgroundColor: palette.button }}
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
                  className="w-full"
                  style={{ borderColor: palette.accentBorder, backgroundColor: "#FFFFFF" }}
                  onPress={() => {
                    void handleSocialLogin("google");
                  }}
                >
                  <Text className="text-base font-body-semibold text-foreground">
                    {authMode === "signup" ? "Mit Google registrieren" : "Mit Google anmelden"}
                  </Text>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-[#111111]"
                  style={{ borderColor: "#111111" }}
                  onPress={() => {
                    void handleSocialLogin("apple");
                  }}
                >
                  <Text className="text-base font-body-semibold text-white">
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
                  Datenschutzerklaerung
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
