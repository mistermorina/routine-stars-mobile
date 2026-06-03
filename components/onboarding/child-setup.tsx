import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Star, PawPrint, Rocket, Trash2 } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { avatarCategories } from "@/lib/data";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import type { AgeGroup, ChildProfile, ChildTheme } from "@/lib/types";
import onboardingHeroImage from "@/assets/images/onboarding-hero.png";

interface ChildSetupProps {
  onNext: (data: { children: ChildProfile[] }) => void;
  onBack: () => void;
  formData: {
    children: ChildProfile[];
  };
}

const themes = [
  {
    id: "sterne",
    name: "Sterne",
    description: "Freundlich, hell und klassisch verspielt.",
    badge: "Warm",
    IconComponent: Star,
  },
  {
    id: "tiere",
    name: "Tiere",
    description: "Natürlich, warm und ruhig motivierend.",
    badge: "Natur",
    IconComponent: PawPrint,
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Etwas mutiger mit kühlen Weltraum-Akzenten.",
    badge: "Weltraum",
    IconComponent: Rocket,
  },
] as const;

const ageGroupOptions: { id: AgeGroup; label: string; hint: string }[] = [
  { id: "3-5", label: "3–5 Jahre", hint: "Kurze, spielerische Schritte" },
  { id: "6-8", label: "6–8 Jahre", hint: "Gute Starter-Routinen für den Alltag" },
  { id: "9-12", label: "9–12 Jahre", hint: "Mehr Eigenständigkeit und Verantwortung" },
];

const defaultAvatar = avatarCategories.Tiere[0].emoji;
const avatarCategoryNames = Object.keys(avatarCategories) as (keyof typeof avatarCategories)[];

function ThemePreview({
  themeId,
}: {
  themeId: ChildTheme;
}) {
  const previewPalette = getThemePalette(themeId);

  return (
    <View className="mt-3 flex-row gap-1.5">
      <View
        className="h-8 flex-1 rounded-full"
        style={{ backgroundColor: previewPalette.screenGradient[0] }}
      />
      <View
        className="h-8 w-8 rounded-full"
        style={{ backgroundColor: previewPalette.motifPrimary }}
      />
      <View
        className="h-8 w-12 rounded-full"
        style={{ backgroundColor: previewPalette.motifSecondary }}
      />
    </View>
  );
}

export function ChildSetup({ onNext, onBack, formData }: ChildSetupProps) {
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>(
    formData.children || []
  );
  const [childName, setChildName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [selectedTheme, setSelectedTheme] = useState<ChildTheme>("sterne");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(
    formData.children[0]?.ageGroup ?? "6-8"
  );
  const [selectedAvatarCategory, setSelectedAvatarCategory] =
    useState<keyof typeof avatarCategories>("Tiere");

  const palette = getThemePalette(selectedTheme);
  const avatarOptions = useMemo(
    () => avatarCategories[selectedAvatarCategory],
    [selectedAvatarCategory]
  );
  const isFirstChildFlow = childProfiles.length === 0;

  const resetForm = () => {
    setChildName("");
    setSelectedAvatar(defaultAvatar);
    setSelectedTheme("sterne");
    setSelectedAgeGroup("6-8");
    setSelectedAvatarCategory("Tiere");
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
        />
        <View
          className="mb-3 self-start rounded-full px-3 py-1.5"
          style={{ backgroundColor: palette.heroSurface }}
        >
          <Text className="text-xs font-body-semibold uppercase tracking-[0.8px]" style={{ color: palette.accentText }}>
            Erster Start
          </Text>
        </View>
        <Text className="text-xl font-headline text-foreground">
          Wir bauen jetzt eure erste Familienwelt
        </Text>
        <Text className="mt-2 text-sm font-body text-muted-foreground">
          Erst ein Profil, dann passende Routinen fuer Alltag, Zaehneputzen,
          Lernen und eure kleinen Familienmomente.
        </Text>
        <View
          className="mt-4 overflow-hidden rounded-[22px] border"
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
          {["Alltag", "Zaehne", "Lernen", "Zusammen"].map((moment) => (
            <View
              key={moment}
              className="rounded-full border px-3 py-1.5"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: palette.accentBorder,
              }}
            >
              <Text
                className="text-[11px] font-body-semibold uppercase tracking-[0.7px]"
                style={{ color: palette.accentText }}
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
              className="flex-row items-center rounded-[20px] border p-3 gap-3"
              style={{ backgroundColor: palette.accentSoft, borderColor: palette.accentBorder }}
            >
              <Text className="text-2xl">{profile.avatar}</Text>
              <View className="flex-1">
                <Text className="text-sm font-headline text-foreground">
                  {profile.name}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  {profile.ageGroup} • {profile.theme}
                </Text>
              </View>
              <Pressable onPress={() => handleRemoveChild(index)} hitSlop={8}>
                <Trash2 size={16} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {childProfiles.length > 0 ? "Noch ein Kind? Optional." : "Dein erstes Kind"}
          </CardTitle>
          <CardDescription>
            {childProfiles.length > 0
              ? "Du kannst direkt weitermachen oder noch ein Profil ergänzen."
              : "Nur Name, Alter, Theme und ein Avatar, dann geht es weiter."}
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
              />
            </View>

            {/* Age group selection */}
            <View className="gap-3">
              <Label>Alter</Label>
              <Text className="text-xs font-body text-muted-foreground">
                Damit die erste Routine gut passt.
              </Text>
              <View className="flex-row gap-2">
                {ageGroupOptions.map((option) => {
                  const isSelected = selectedAgeGroup === option.id;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedAgeGroup(option.id)}
                      className="flex-1 rounded-[20px] border px-3 py-3"
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
                      <Text className="text-center text-base font-body-bold text-foreground">
                        {option.id}
                      </Text>
                      <Text className="mt-1 text-center text-[11px] font-body text-muted-foreground">
                        {option.hint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Theme selection */}
            <View className="gap-3">
              <Label>Look & Feel</Label>
              <Text className="text-xs font-body text-muted-foreground">
                Jede Welt färbt die App später etwas anders ein.
              </Text>
              <View className="flex-row gap-2">
                {themes.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  const themePalette = getThemePalette(theme.id);

                  return (
                    <Pressable
                      key={theme.id}
                      onPress={() => {
                        setSelectedTheme(theme.id);
                        void triggerFeedback("theme_preview");
                      }}
                      className="flex-1 rounded-[22px] border px-3 py-3"
                      style={
                        isSelected
                          ? {
                              borderColor: themePalette.accent,
                              backgroundColor: themePalette.accentSoft,
                            }
                          : {
                              borderColor: "rgba(255,255,255,0.2)",
                              backgroundColor: "rgba(255,255,255,0.72)",
                            }
                      }
                    >
                      <View className="items-center">
                        <View
                          className="h-11 w-11 items-center justify-center rounded-full"
                          style={{ backgroundColor: themePalette.surface }}
                        >
                          <theme.IconComponent size={20} color={themePalette.accentStrong} />
                        </View>
                        <Text className="mt-2 text-center text-sm font-body-bold text-foreground">
                          {theme.name}
                        </Text>
                        <View
                          className="mt-1 rounded-full px-2 py-0.5"
                          style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
                        >
                          <Text className="text-[10px] font-body-semibold uppercase tracking-[0.6px]" style={{ color: themePalette.accentText }}>
                            {theme.badge}
                          </Text>
                        </View>
                        <ThemePreview themeId={theme.id} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Avatar selection */}
            <View className="gap-3">
              <Label>Avatar auswählen</Label>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-2"
              >
                {avatarCategoryNames.map((category) => {
                  const isSelected = category === selectedAvatarCategory;
                  return (
                    <Pressable
                      key={category}
                      onPress={() => setSelectedAvatarCategory(category)}
                      className="rounded-full border px-3 py-1.5"
                      style={
                        isSelected
                          ? {
                              backgroundColor: palette.tabActiveBg,
                              borderColor: palette.accent,
                            }
                          : {
                              backgroundColor: "rgba(255,255,255,0.74)",
                              borderColor: "rgba(255,255,255,0.2)",
                            }
                      }
                    >
                      <Text
                        className="text-xs font-body-semibold"
                        style={isSelected ? { color: palette.accentText } : undefined}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {avatarOptions.map((avatar) => (
                  <Pressable
                    key={avatar.id}
                    onPress={() => setSelectedAvatar(avatar.emoji)}
                    className="h-14 w-14 items-center justify-center rounded-full border-2"
                    style={
                      selectedAvatar === avatar.emoji
                        ? {
                            borderColor: palette.accent,
                            backgroundColor: palette.accentSoft,
                          }
                        : {
                            borderColor: "rgba(255,255,255,0.2)",
                            backgroundColor: "rgba(255,255,255,0.72)",
                          }
                    }
                  >
                    <Text className="text-2xl">{avatar.emoji}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Live preview */}
            <View
              className="rounded-[24px] border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: palette.accentSoft,
              }}
            >
              <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                Vorschau
              </Text>
              <View className="mt-3 flex-row items-center">
                <View
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                >
                  <Text className="text-3xl">{selectedAvatar}</Text>
                </View>
                <View className="ml-3 flex-1">
                <Text className="text-lg font-headline text-foreground">
                  {childName.trim() || "Dein Kind"}
                </Text>
                <Text className="text-sm font-body" style={{ color: palette.accentText }}>
                  {selectedAgeGroup} • {themes.find((theme) => theme.id === selectedTheme)?.name}
                </Text>
              </View>
            </View>
              <View
                className="mt-4 rounded-xl px-3 py-3"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <Text className="text-sm font-body text-muted-foreground">
                  Routine Stars schlägt im nächsten Schritt passende Starter-Routinen für
                  dieses Alter vor.
                </Text>
              </View>
            </View>

            {!canProceed ? (
              <View
                className="rounded-[18px] px-4 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
              >
                <Text className="text-sm font-body" style={{ color: palette.accentText }}>
                  Bitte gib einen Namen ein, damit wir mit der ersten Routine weitermachen können.
                </Text>
              </View>
            ) : null}

            {!isFirstChildFlow ? (
              <Button
                variant="outline"
                onPress={handleAddChild}
                disabled={!childName.trim()}
                style={{ borderColor: palette.accent }}
              >
                <Text className="text-sm font-body-semibold" style={{ color: palette.accent }}>
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
              >
                {isFirstChildFlow ? "Weiter zu Routinen" : "Weiter zu Routinen"}
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
