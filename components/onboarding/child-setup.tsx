import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { ImagePlus, Trash2 } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AvatarImage } from "@/components/ui/avatar-image";
import { AvatarPicker } from "@/components/settings/avatar-picker";
import { SkinPicker } from "@/components/settings/skin-picker";
import {
  DEFAULT_AVATAR_VALUE,
} from "@/lib/avatars";
import { pickAvatarPhotoAsync } from "@/lib/avatar-photo-picker";
import { useToast } from "@/hooks/use-toast";
import { getThemePalette, semanticColors } from "@/lib/theme";
import type {
  AgeGroup,
  AvatarValue,
  BackgroundSkinId,
  ChildProfile,
  ChildTheme,
} from "@/lib/types";
import onboardingHeroImage from "@/assets/images/onboarding-hero.png";

interface ChildSetupProps {
  onNext: (data: { children: ChildProfile[] }) => void;
  onBack: () => void;
  formData: {
    children: ChildProfile[];
  };
}

const ageGroupOptions: { id: AgeGroup; label: string; hint: string }[] = [
  { id: "3-5", label: "3–5 Jahre", hint: "Kurze, spielerische Schritte" },
  { id: "6-8", label: "6–8 Jahre", hint: "Gute Starter-Routinen für den Alltag" },
  { id: "9-12", label: "9–12 Jahre", hint: "Mehr Eigenständigkeit und Verantwortung" },
];



export function ChildSetup({ onNext, formData }: ChildSetupProps) {
  const { toast } = useToast();
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(
    formData.children || []
  );
  const [childName, setChildName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarValue>(DEFAULT_AVATAR_VALUE);
  const [selectedTheme, setSelectedTheme] = useState<ChildTheme>("sterne");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(
    formData.children[0]?.ageGroup ?? "6-8"
  );
  const [selectedSkin, setSelectedSkin] = useState<BackgroundSkinId>("none");
  const palette = getThemePalette(selectedTheme);
  const isFirstChildFlow = childProfiles.length === 0;

  const resetForm = () => {
    setChildName("");
    setSelectedAvatar(DEFAULT_AVATAR_VALUE);
    setSelectedTheme("sterne");
    setSelectedAgeGroup("6-8");
    setSelectedSkin("none");
  };

  const handlePickAvatarPhoto = async () => {
    const result = await pickAvatarPhotoAsync();

    if (result.status === "selected") {
      setSelectedAvatar(result.avatar);
      return;
    }

    if (result.status === "denied") {
      // Same channel and wording as app/settings/children.tsx — never Alert.alert.
      toast({
        title: "Fotozugriff benötigt",
        description:
          "Erlaube den Zugriff auf deine Fotomediathek, um ein eigenes Profilbild zu wählen.",
        variant: "destructive",
      });
    }
  };

  const handleAddChild = () => {
    const trimmed = childName.trim();
    if (!trimmed) return;
    setChildProfiles((prev) => [
      ...prev,
      {
        name: trimmed,
        avatar: selectedAvatar,
        theme: selectedTheme,
      backgroundSkin: selectedSkin,
        ageGroup: selectedAgeGroup,
      },
    ]);
    resetForm();
  };

  const handleRemoveChild = (index: number) => {
    setChildProfiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Auto-save if there's a name in the field
    let allChildren = [...childProfiles];
    const trimmed = childName.trim();
    if (trimmed) {
      allChildren.push({
        name: trimmed,
        avatar: selectedAvatar,
        theme: selectedTheme,
      backgroundSkin: selectedSkin,
        ageGroup: selectedAgeGroup,
      });
    }
    if (allChildren.length === 0) return;
    onNext({ children: allChildren });
  };

  const hasUnsavedChild = childName.trim().length > 0;
  const canProceed = childProfiles.length > 0 || hasUnsavedChild;

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
    >
      <View
        className="mb-4 overflow-hidden rounded-[28px] border px-4 py-4"
        style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
      >
        <View
          className="absolute right-[-24px] top-[-18px] h-24 w-24 rounded-full"
          style={{ backgroundColor: palette.motifSecondary, opacity: 0.3 }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        <View
          className="mb-3 self-start rounded-full px-3 py-1.5"
          style={{ backgroundColor: palette.heroSurface }}
        >
          <Text
            className="text-xs font-body-semibold uppercase"
            style={{ color: palette.accentText }}
            maxFontSizeMultiplier={1.3}
          >
            Erster Start
          </Text>
        </View>
        <Text className="text-xl font-headline text-foreground">
          Wir bauen eure erste Sternenwelt
        </Text>
        <Text className="mt-2 text-sm font-body text-muted-foreground">
          Erst ein Profil, dann passende Routinen für Alltag, Zähneputzen,
          Lernen und eure kleinen Familienmomente.
        </Text>
        <View
          className="mt-4 overflow-hidden rounded-card border"
          style={{ borderColor: palette.accentBorder, backgroundColor: palette.heroSurface }}
        >
          <Image
            source={onboardingHeroImage}
            style={{ width: "100%", aspectRatio: 1 }}
            contentFit="cover"
            transition={180}
            accessibilityLabel="Kind und Elternteil planen gemeinsam eine Routine"
          />
        </View>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {["Alltag", "Zähne", "Lernen", "Zusammen"].map((moment) => (
            <View
              key={moment}
              className="rounded-full border px-3 py-1.5"
              style={{
                backgroundColor: semanticColors.card,
                borderColor: palette.accentBorder,
              }}
            >
              <Text
                className="text-xs font-body-semibold uppercase"
                style={{ color: palette.accentText }}
                maxFontSizeMultiplier={1.2}
              >
                {moment}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Added children list */}
      {childProfiles.length > 0 && (
        <View className="mb-4 gap-2">
          <Label>Kinder ({childProfiles.length})</Label>
          {childProfiles.map((profile, index) => (
            <View
              key={`${profile.name}-${index}`}
              className="flex-row items-center rounded-tile border p-3 gap-3"
              style={{ backgroundColor: palette.accentSoft, borderColor: palette.accentBorder }}
            >
              <AvatarImage
                avatar={profile.avatar}
                size={36}
                borderRadius={14}
                fallbackLabel={profile.name}
                accessibilityLabel={`Avatar von ${profile.name}`}
              />
              <View className="min-w-0 flex-1">
                <Text className="text-sm font-headline text-foreground">
                  {profile.name}
                </Text>
                <Text className="text-xs font-body text-muted-foreground" maxFontSizeMultiplier={1.4}>
                  {profile.ageGroup}
                </Text>
              </View>
              <Pressable
                onPress={() => handleRemoveChild(index)}
                className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel={`Kind ${profile.name} entfernen`}
                hitSlop={8}
              >
                <Trash2 size={16} color={semanticColors.destructive} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {childProfiles.length > 0 ? "Noch ein Kind? Optional." : "Wer sammelt Sterne?"}
          </CardTitle>
          <CardDescription>
            {childProfiles.length > 0
              ? "Du kannst direkt weitermachen oder noch ein Profil ergänzen."
              : "Ein kurzer Start reicht: Name, Alter, Avatar und eine kleine Welt."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-5">
            {/* Child name input */}
            <View className="gap-2">
              <Label>Name deines Kindes</Label>
              <Input
                value={childName}
                onChangeText={setChildName}
                placeholder="Zum Beispiel Leo"
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Name deines Kindes"
              />
            </View>

            {/* Age group selection */}
            <View className="gap-3">
              <Label>Alter</Label>
              <Text className="text-sm font-body text-muted-foreground">
                So passen Vorlagen und Texte besser zu deinem Kind.
              </Text>
              <View className="flex-row gap-2">
                {ageGroupOptions.map((option) => {
                  const isSelected = selectedAgeGroup === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedAgeGroup(option.id)}
                      className="flex-1 rounded-tile border px-3 py-3 active:opacity-80"
                      accessibilityRole="button"
                      accessibilityLabel={`Alter ${option.label}. ${option.hint}`}
                      accessibilityState={{ selected: isSelected }}
                      style={
                        isSelected
                          ? {
                              borderColor: palette.accent,
                              backgroundColor: palette.accentSoft,
                            }
                          : {
                              borderColor: "rgba(255,255,255,0.2)",
                              backgroundColor: "rgba(255,255,255,0.7)",
                            }
                      }
                    >
                      <Text
                        className="text-center text-base font-body-bold text-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        {option.id}
                      </Text>
                      <Text
                        className="mt-1 text-center text-xs font-body text-muted-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        {option.hint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-3">
              <Label>Hintergrund</Label>
              <SkinPicker
                value={selectedSkin}
                onChange={setSelectedSkin}
                theme={selectedTheme}
              />
            </View>

            {/* Avatar selection */}
            <View className="gap-3">
              <Label>Avatar auswählen</Label>
              <AvatarPicker
                value={selectedAvatar}
                onChange={setSelectedAvatar}
                theme={selectedTheme}
              />

              <Pressable
                onPress={handlePickAvatarPhoto}
                className="mt-1 flex-row items-center justify-center rounded-tile border px-4 py-3 active:opacity-80"
                style={{
                  backgroundColor: "rgba(255,255,255,0.76)",
                  borderColor: palette.accentBorder,
                }}
                accessibilityRole="button"
                accessibilityLabel="Eigenes Foto aus der Fotomediathek auswählen"
              >
                <ImagePlus size={18} color={palette.accentStrong} />
                <Text
                  className="ml-2 text-sm font-body-semibold"
                  style={{ color: palette.accentText }}
                  maxFontSizeMultiplier={1.3}
                >
                  Eigenes Foto auswählen
                </Text>
              </Pressable>
            </View>

            {/* Live preview */}
            <View
              className="rounded-card border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: palette.accentSoft,
              }}
            >
              <Text
                className="text-xs font-body-semibold uppercase text-muted-foreground"
                maxFontSizeMultiplier={1.3}
              >
                Vorschau
              </Text>
              <View className="mt-3 flex-row items-center">
                <View
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                >
                  <AvatarImage
                    avatar={selectedAvatar}
                    size={56}
                    borderRadius={28}
                    backgroundColor={palette.surface}
                  />
                </View>
                <View className="ml-3 flex-1">
                <Text className="text-lg font-headline text-foreground">
                  {childName.trim() || "Dein Kind"}
                </Text>
                <Text className="text-sm font-body" style={{ color: palette.accentText }}>
                  {selectedAgeGroup}
                </Text>
              </View>
            </View>
              <View
                className="mt-4 rounded-tile px-3 py-3"
                style={{ backgroundColor: semanticColors.card }}
              >
                <Text className="text-sm font-body text-muted-foreground">
                  Im nächsten Schritt schlagen wir passende Starter-Routinen vor.
                  Du kannst alles sofort anpassen.
                </Text>
              </View>
            </View>

            {!canProceed ? (
              <View
                className="rounded-tile px-4 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
                accessibilityLiveRegion="polite"
              >
                <Text className="text-sm font-body" style={{ color: palette.accentText }}>
                  Bitte gib einen Namen ein. Dann kann die erste Routine entstehen.
                </Text>
              </View>
            ) : null}

            {!isFirstChildFlow ? (
              <Button
                variant="outline"
                onPress={handleAddChild}
                disabled={!childName.trim()}
                style={{ borderColor: palette.accent }}
                accessibilityRole="button"
                accessibilityLabel="Dieses Kind speichern"
                accessibilityState={{ disabled: !childName.trim() }}
              >
                <Text
                  className="text-sm font-body-semibold"
                  style={{ color: palette.accent }}
                  maxFontSizeMultiplier={1.3}
                >
                  Dieses Kind speichern
                </Text>
              </Button>
            ) : null}

            {/* Navigation buttons */}
            <View className="pt-2">
              <Button
                onPress={handleSubmit}
                disabled={!canProceed}
                className="min-w-[120px]"
                style={{ backgroundColor: palette.button }}
                accessibilityRole="button"
                accessibilityLabel="Weiter zu den Routinen"
                accessibilityState={{ disabled: !canProceed }}
              >
                Weiter: Routinen wählen
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
