import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Star, PawPrint, Rocket } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { avatarCategories } from "@/lib/data";

interface ChildSetupProps {
  onNext: (data: { childName: string; avatar: string; theme: string }) => void;
  onBack: () => void;
  formData: {
    childName: string;
    avatar: string;
    theme: string;
  };
}

const themes = [
  { id: "sterne", name: "Sterne", IconComponent: Star },
  { id: "tiere", name: "Tiere", IconComponent: PawPrint },
  { id: "galaxy", name: "Galaxy", IconComponent: Rocket },
] as const;

export function ChildSetup({ onNext, onBack, formData }: ChildSetupProps) {
  const [childName, setChildName] = useState(formData.childName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    formData.avatar || avatarCategories.Tiere[0].emoji
  );
  const [selectedTheme, setSelectedTheme] = useState(formData.theme || "sterne");

  const handleSubmit = () => {
    if (!childName.trim()) return;
    onNext({ childName: childName.trim(), avatar: selectedAvatar, theme: selectedTheme });
  };

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
    >
      <Card>
        <CardHeader>
          <CardTitle>Hallo!</CardTitle>
          <CardDescription>Lass uns dein Kind einrichten.</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-6">
            {/* Child name input */}
            <View className="gap-2">
              <Label>Name deines Kindes</Label>
              <Input
                value={childName}
                onChangeText={setChildName}
                placeholder="z.B. Leo"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Avatar selection */}
            <View className="gap-4">
              <Label>Avatar auswaehlen</Label>
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
                          selectedAvatar === avatar.emoji
                            ? "border-[#87CEEB]"
                            : "border-transparent"
                        )}
                      >
                        <Text className="text-3xl">{avatar.emoji}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Theme selection */}
            <View className="gap-2">
              <Label>Lieblingsthema</Label>
              <RadioGroup
                value={selectedTheme}
                onValueChange={setSelectedTheme}
                className="flex-row gap-3"
              >
                {themes.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <Pressable
                      key={theme.id}
                      onPress={() => setSelectedTheme(theme.id)}
                      className={cn(
                        "flex-1 items-center justify-center rounded-lg border-2 bg-card p-4",
                        isSelected ? "border-[#87CEEB]" : "border-border"
                      )}
                    >
                      <theme.IconComponent
                        size={24}
                        color={isSelected ? "#87CEEB" : "#737373"}
                      />
                      <Text
                        className={cn(
                          "mt-2 text-sm font-body-semibold",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {theme.name}
                      </Text>
                      <View className="mt-1">
                        <RadioGroupItem value={theme.id} />
                      </View>
                    </Pressable>
                  );
                })}
              </RadioGroup>
            </View>

            {/* Submit button */}
            <View className="flex-row justify-end pt-2">
              <Button
                onPress={handleSubmit}
                disabled={!childName.trim()}
                className="min-w-[120px]"
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
