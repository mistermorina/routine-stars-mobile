import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Star, PawPrint, Rocket, Trash2, Check } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { avatarCategories } from "@/lib/data";
import { getThemePalette } from "@/lib/theme";
import type { AgeGroup, ChildProfile, ChildTheme } from "@/lib/types";

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
    IconComponent: Star,
  },
  {
    id: "tiere",
    name: "Tiere",
    description: "Natürlich, warm und ruhig motivierend.",
    IconComponent: PawPrint,
  },
  {
    id: "galaxy",
    name: "Galaxy",
    description: "Etwas mutiger mit kühlen Weltraum-Akzenten.",
    IconComponent: Rocket,
  },
] as const;

const ageGroupOptions: Array<{ id: AgeGroup; label: string; hint: string }> = [
  { id: "3-5", label: "3–5 Jahre", hint: "Kurze, spielerische Schritte" },
  { id: "6-8", label: "6–8 Jahre", hint: "Gute Starter-Routinen für den Alltag" },
  { id: "9-12", label: "9–12 Jahre", hint: "Mehr Eigenständigkeit und Verantwortung" },
];

const defaultAvatar = avatarCategories.Tiere[0].emoji;

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

  const palette = getThemePalette(selectedTheme);

  const resetForm = () => {
    setChildName("");
    setSelectedAvatar(defaultAvatar);
    setSelectedTheme("sterne");
    setSelectedAgeGroup("6-8");
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
      <View className="mb-4 rounded-2xl bg-card px-4 py-4">
        <Text className="text-lg font-headline text-foreground">
          In zwei Minuten startklar
        </Text>
        <Text className="mt-1 text-sm font-body text-muted-foreground">
          Lege zuerst ein Kinderprofil an. Danach bekommst du eine passende
          Starter-Routine und ein sinnvolles Belohnungspaket.
        </Text>
      </View>

      {/* Added children list */}
      {childProfiles.length > 0 && (
        <View className="mb-4 gap-2">
          <Label>Kinder ({childProfiles.length})</Label>
          {childProfiles.map((profile, index) => (
            <View
              key={`${profile.name}-${index}`}
              className="flex-row items-center rounded-lg bg-[#87CEEB]/10 border border-[#87CEEB] p-3 gap-3"
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
            {childProfiles.length > 0 ? "Noch ein Kind hinzufügen" : "Dein erstes Kind"}
          </CardTitle>
          <CardDescription>
            {childProfiles.length > 0
              ? "Du kannst weitere Kinder ergänzen oder direkt weitermachen."
              : "Wähle Name, Alter, Theme und einen Avatar."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-6">
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
              {ageGroupOptions.map((option) => {
                const isSelected = selectedAgeGroup === option.id;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedAgeGroup(option.id)}
                    className={cn(
                      "rounded-xl border px-4 py-3",
                      isSelected ? "bg-card" : "bg-secondary/40 border-border"
                    )}
                    style={
                      isSelected
                        ? {
                            borderColor: palette.accent,
                            backgroundColor: palette.accentSoft,
                          }
                        : undefined
                    }
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-base font-body-semibold text-foreground">
                          {option.label}
                        </Text>
                        <Text className="mt-0.5 text-xs font-body text-muted-foreground">
                          {option.hint}
                        </Text>
                      </View>
                      {isSelected ? (
                        <View
                          className="h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: palette.accent }}
                        >
                          <Check size={16} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Theme selection */}
            <View className="gap-3">
              <Label>Look & Feel</Label>
              {themes.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                const themePalette = getThemePalette(theme.id);

                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => setSelectedTheme(theme.id)}
                    className={cn(
                      "rounded-xl border bg-card px-4 py-3",
                      isSelected ? "" : "border-border"
                    )}
                    style={
                      isSelected
                        ? {
                            borderColor: themePalette.accent,
                            backgroundColor: themePalette.accentSoft,
                          }
                        : undefined
                    }
                  >
                    <View className="flex-row items-center">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-full"
                        style={{ backgroundColor: themePalette.surface }}
                      >
                        <theme.IconComponent size={22} color={themePalette.accentStrong} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-base font-body-semibold text-foreground">
                          {theme.name}
                        </Text>
                        <Text className="mt-0.5 text-xs font-body text-muted-foreground">
                          {theme.description}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Avatar selection */}
            <View className="gap-4">
              <Label>Avatar auswählen</Label>
              {Object.entries(avatarCategories).map(([category, avatars]) => (
                <View key={category} className="gap-2">
                  <Text className="text-sm font-body text-muted-foreground">
                    {category}
                  </Text>
                  <View className="flex-row flex-wrap justify-center gap-3">
                    {avatars.map((avatar) => (
                      <Pressable
                        key={avatar.id}
                        onPress={() => setSelectedAvatar(avatar.emoji)}
                        className={cn(
                          "h-[72px] w-[72px] items-center justify-center rounded-full border-4 bg-secondary",
                          selectedAvatar === avatar.emoji ? "" : "border-transparent"
                        )}
                        style={
                          selectedAvatar === avatar.emoji
                            ? { borderColor: palette.accent }
                            : undefined
                        }
                      >
                        <Text className="text-3xl">{avatar.emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Live preview */}
            <View
              className="rounded-2xl border px-4 py-4"
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

            {/* Add child button */}
            <Button
              variant="outline"
              onPress={handleAddChild}
              disabled={!childName.trim()}
              className="border-[#87CEEB]"
              style={{ borderColor: palette.accent }}
            >
              <Text className="text-sm font-body-semibold" style={{ color: palette.accent }}>
                {childProfiles.length > 0
                  ? "Weiteres Kind hinzufügen"
                  : "Kind hinzufügen"}
              </Text>
            </Button>

            {/* Navigation buttons */}
            <View className="flex-row justify-end pt-2">
              <Button
                onPress={handleSubmit}
                disabled={!canProceed}
                className="min-w-[120px]"
                style={{ backgroundColor: palette.button }}
              >
                Weiter
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
