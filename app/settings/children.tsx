import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import {
  ChevronRight,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Star,
  Palette,
} from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { avatarCategories } from "@/lib/data";
import { useRoutines } from "@/hooks/use-routines";
import { useRewards } from "@/hooks/use-rewards";
import { getIcon } from "@/lib/icons";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { AgeGroup, Child, ChildTheme } from "@/lib/types";

const THEME_OPTIONS: Array<{ value: ChildTheme; label: string; emoji: string }> = [
  { value: "sterne", label: "Sterne", emoji: "⭐" },
  { value: "tiere", label: "Tiere", emoji: "🐾" },
  { value: "galaxy", label: "Galaxy", emoji: "🌌" },
];

const AGE_GROUP_OPTIONS: Array<{ value: AgeGroup; label: string }> = [
  { value: "3-5", label: "3-5" },
  { value: "6-8", label: "6-8" },
  { value: "9-12", label: "9-12" },
];

export default function ChildrenSettings() {
  const params = useLocalSearchParams<{ preview?: string | string[] }>();
  const { children, addChild, updateChild, removeChild } = useChildren();
  const { toast } = useToast();
  const { routines } = useRoutines();
  const { rewards } = useRewards();
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAvatar, setNewChildAvatar] = useState("🦁");
  const [newChildTheme, setNewChildTheme] = useState<ChildTheme>("sterne");
  const [newChildAgeGroup, setNewChildAgeGroup] = useState<AgeGroup>("6-8");

  const allAvatars = Object.entries(avatarCategories);
  const newChildPalette = getThemePalette(newChildTheme);
  const previewMode = Array.isArray(params.preview) ? params.preview[0] : params.preview;
  const totalStars = useMemo(
    () => children.reduce((sum, child) => sum + child.stars, 0),
    [children]
  );

  useEffect(() => {
    if (!__DEV__) return;

    if (previewMode === "add") {
      setShowAddForm(true);
      setExpandedChildId(null);
      setEditingNameId(null);
      setShowAvatarPicker(null);
      return;
    }

    if ((previewMode === "expanded" || previewMode === "name" || previewMode === "avatar") && children.length > 0) {
      setExpandedChildId(children[0].id);
      setShowAddForm(false);
      setEditingNameId(previewMode === "name" ? children[0].id : null);
      setEditNameValue(previewMode === "name" ? children[0].name : "");
      setShowAvatarPicker(previewMode === "avatar" ? children[0].id : null);
    }
  }, [children, previewMode]);

  function getThemeLabel(theme: Child["theme"]) {
    if (theme === "tiere") return "Tiere";
    if (theme === "galaxy") return "Galaxy";
    return "Sterne";
  }

  function toggleExpanded(childId: string) {
    setExpandedChildId((prev) => (prev === childId ? null : childId));
    setEditingNameId(null);
    setShowAvatarPicker(null);
  }

  function startEditName(child: Child) {
    setEditingNameId(child.id);
    setEditNameValue(child.name);
  }

  async function saveEditName(childId: string) {
    if (editNameValue.trim()) {
      await updateChild(childId, { name: editNameValue.trim() });
      toast({ title: "Name aktualisiert" });
    }
    setEditingNameId(null);
  }

  function confirmDelete(child: Child) {
    Alert.alert(
      "Kind entfernen",
      `Möchtest du "${child.name}" wirklich entfernen? Alle Daten gehen verloren.`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Entfernen",
          style: "destructive",
          onPress: async () => {
            await removeChild(child.id);
            toast({ title: `${child.name} wurde entfernt`, variant: "destructive" });
            if (expandedChildId === child.id) {
              setExpandedChildId(null);
            }
          },
        },
      ]
    );
  }

  async function handleAddChild() {
    if (!newChildName.trim()) return;
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: newChildName.trim(),
      avatar: newChildAvatar,
      stars: 0,
      theme: newChildTheme,
      ageGroup: newChildAgeGroup,
    };
    await addChild(newChild);
    toast({ title: `${newChild.name} wurde hinzugefügt` });
    setNewChildName("");
    setNewChildAvatar("🦁");
    setNewChildTheme("sterne");
    setNewChildAgeGroup("6-8");
    setShowAddForm(false);
  }

  async function selectAvatar(childId: string, emoji: string) {
    await updateChild(childId, { avatar: emoji });
    setShowAvatarPicker(null);
    toast({ title: "Avatar aktualisiert" });
  }

  async function selectTheme(childId: string, theme: ChildTheme) {
    await updateChild(childId, { theme });
    toast({ title: "Theme aktualisiert" });
  }

  async function selectAgeGroup(childId: string, ageGroup: AgeGroup) {
    await updateChild(childId, { ageGroup });
    toast({ title: "Altersgruppe aktualisiert" });
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      <Card className="mb-4 overflow-hidden rounded-[30px] border p-0">
        <View className="rounded-[30px] bg-secondary/70 px-4 py-5">
          <View className="flex-row items-start justify-between">
            <View className="mr-4 flex-1">
              <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                Kinderprofile
              </Text>
              <Text className="mt-2 text-[28px] font-headline text-foreground">
                Eure kleine Sternen-Crew
              </Text>
              <Text className="mt-2 text-sm font-body leading-6 text-muted-foreground">
                Profile bleiben lokal auf diesem Gerät und wechseln direkt in den Kindermodus
                zurück.
              </Text>
            </View>
            <View className="items-end gap-2">
              <View className="rounded-full bg-white/85 px-3 py-1.5">
                <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-foreground">
                  {children.length} Kinder
                </Text>
              </View>
              <View className="rounded-full bg-white/85 px-3 py-1.5">
                <Text className="text-[10px] font-body-semibold uppercase tracking-[0.7px] text-foreground">
                  {totalStars} Sterne
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* Children list */}
      {children.length === 0 && !showAddForm && (
        <Card className="mb-3 items-center rounded-[28px] px-5 py-10">
          <Text className="mb-4 text-5xl">👶</Text>
          <Text className="text-center text-lg font-headline text-foreground">
            Noch keine Kinder
          </Text>
          <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
            Füge dein erstes Profil hinzu, damit Dashboard, Belohnungen und Profilansicht direkt
            damit arbeiten können.
          </Text>
        </Card>
      )}

      {children.map((child) => {
        const childPalette = getThemePalette(child.theme);

        return (
          <Animated.View
            key={child.id}
            layout={Layout.springify()}
            entering={FadeInDown.duration(300)}
            exiting={FadeOutUp.duration(200)}
            className="mb-3"
          >
            <Card
              className="overflow-hidden rounded-[28px] border p-0"
              style={{ borderColor: childPalette.accentBorder, backgroundColor: childPalette.cardTint }}
            >
              <View
                className="absolute inset-x-0 top-0 h-24"
                style={{ backgroundColor: childPalette.heroSurface }}
              />
              <View
                className="absolute right-[-18px] top-[-10px] h-24 w-24 rounded-full"
                style={{ backgroundColor: childPalette.motifSecondary, opacity: 0.28 }}
              />
            {/* Child header (always visible) */}
            <Pressable
              onPress={() => toggleExpanded(child.id)}
              className="flex-row items-center px-4 py-4 active:bg-secondary/50"
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-[20px]"
                style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
              >
                <Text className="text-3xl">{child.avatar}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-lg font-headline text-foreground">
                  {child.name}
                </Text>
                <View className="mt-1 flex-row flex-wrap items-center gap-2">
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                  >
                    <Text className="text-[10px] font-body-semibold uppercase tracking-[0.6px]" style={{ color: childPalette.accentText }}>
                      {getThemeLabel(child.theme)}
                    </Text>
                  </View>
                  {child.ageGroup ? (
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                    >
                      <Text className="text-[10px] font-body-semibold uppercase tracking-[0.6px] text-muted-foreground">
                        {child.ageGroup}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View className="mr-3 items-end">
                <View
                  className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: childPalette.tabActiveBg }}
                >
                  <Star size={14} color="#F0B400" fill="#F0B400" />
                  <Text className="text-sm font-body-bold" style={{ color: childPalette.accentText }}>
                    {child.stars}
                  </Text>
                </View>
              </View>
              <Animated.View
                style={{
                  transform: [
                    { rotate: expandedChildId === child.id ? "90deg" : "0deg" },
                  ],
                }}
              >
                <ChevronRight size={20} color="#737373" />
              </Animated.View>
            </Pressable>

            {/* Expanded content */}
            {expandedChildId === child.id && (
              <Animated.View
                entering={FadeInDown.duration(200)}
                exiting={FadeOutUp.duration(150)}
              >
                <Separator />
                <View className="p-4 gap-4">
                  {/* Edit name */}
                  <View
                    className="rounded-[22px] border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: childPalette.accentSoft }}
                  >
                    <View className="mb-3 flex-row items-center gap-2">
                      <Sparkles size={16} color={childPalette.accentStrong} />
                      <Text className="text-sm font-body-semibold" style={{ color: childPalette.accentText }}>
                        Name
                      </Text>
                    </View>
                    {editingNameId === child.id ? (
                      <View className="flex-row items-center gap-2">
                        <Input
                          value={editNameValue}
                          onChangeText={setEditNameValue}
                          autoFocus
                          className="flex-1"
                          onSubmitEditing={() => saveEditName(child.id)}
                        />
                        <Pressable
                          onPress={() => saveEditName(child.id)}
                          className="h-12 w-12 items-center justify-center rounded-lg bg-primary"
                        >
                          <Check size={20} color="#1a1a2e" />
                        </Pressable>
                        <Pressable
                          onPress={() => setEditingNameId(null)}
                          className="h-12 w-12 items-center justify-center rounded-lg bg-secondary"
                        >
                          <X size={20} color="#737373" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => startEditName(child)}
                        className="flex-row items-center justify-between rounded-lg border border-input bg-card px-4 py-3"
                      >
                        <Text className="text-base font-body text-foreground">
                          {child.name}
                        </Text>
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                        >
                          Bearbeiten
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Avatar picker */}
                  <View
                    className="rounded-[22px] border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-3 flex-row items-center gap-2">
                      <Palette size={16} color={childPalette.accentStrong} />
                      <Text className="text-sm font-body-semibold" style={{ color: childPalette.accentText }}>
                        Avatar
                      </Text>
                    </View>
                    {showAvatarPicker === child.id ? (
                      <View className="gap-3">
                        <ScrollView
                          nestedScrollEnabled
                          showsVerticalScrollIndicator={false}
                          className="max-h-[240px] rounded-[20px]"
                          contentContainerClassName="gap-3 pb-1"
                        >
                          {allAvatars.map(([category, avatars]) => (
                            <View key={category}>
                              <Text className="mb-1.5 text-xs font-body-semibold text-muted-foreground">
                                {category}
                              </Text>
                              <View className="flex-row flex-wrap gap-2">
                                {avatars.map((avatar) => (
                                  <Pressable
                                    key={avatar.id}
                                    onPress={() =>
                                      selectAvatar(child.id, avatar.emoji)
                                    }
                                    className={cn(
                                      "h-12 w-12 items-center justify-center rounded-xl",
                                      child.avatar === avatar.emoji
                                        ? "bg-primary/40 border-2 border-primary"
                                        : "bg-secondary"
                                    )}
                                  >
                                    <Text className="text-2xl">
                                      {avatar.emoji}
                                    </Text>
                                  </Pressable>
                                ))}
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setShowAvatarPicker(null)}
                        >
                          Schliessen
                        </Button>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setShowAvatarPicker(child.id)}
                        className="flex-row items-center justify-between rounded-lg border border-input bg-card px-4 py-3"
                      >
                        <View className="flex-row items-center gap-2">
                          <Text className="text-2xl">{child.avatar}</Text>
                          <Text className="text-base font-body text-foreground">
                            Aktueller Avatar
                          </Text>
                        </View>
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                        >
                          Ändern
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  <View
                    className="rounded-[22px] border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-3 flex-row items-center gap-2">
                      <Palette size={16} color={childPalette.accentStrong} />
                      <Text className="text-sm font-body-semibold" style={{ color: childPalette.accentText }}>
                        Welt & Alter
                      </Text>
                    </View>

                    <Text className="text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Theme
                    </Text>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {THEME_OPTIONS.map((option) => {
                        const optionPalette = getThemePalette(option.value);
                        const isActive = child.theme === option.value;

                        return (
                          <Pressable
                            key={option.value}
                            onPress={() => selectTheme(child.id, option.value)}
                            className="rounded-[18px] border px-3 py-2"
                            style={{
                              backgroundColor: isActive ? optionPalette.heroSurface : "rgba(255,255,255,0.76)",
                              borderColor: isActive ? optionPalette.accent : childPalette.accentBorder,
                            }}
                          >
                            <Text className="text-sm font-body-semibold" style={{ color: isActive ? optionPalette.accentText : "#1a1a2e" }}>
                              {option.emoji} {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text className="mt-4 text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground">
                      Altersgruppe
                    </Text>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {AGE_GROUP_OPTIONS.map((option) => {
                        const isActive = child.ageGroup === option.value;

                        return (
                          <Pressable
                            key={option.value}
                            onPress={() => selectAgeGroup(child.id, option.value)}
                            className="rounded-full border px-3 py-2"
                            style={{
                              backgroundColor: isActive ? childPalette.tabActiveBg : "rgba(255,255,255,0.76)",
                              borderColor: isActive ? childPalette.accent : childPalette.accentBorder,
                            }}
                          >
                            <Text className="text-sm font-body-semibold" style={{ color: isActive ? childPalette.accentText : "#1a1a2e" }}>
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Routines overview */}
                  <View
                    className="rounded-[22px] border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <Text className="mb-2 text-sm font-body-semibold" style={{ color: childPalette.accentText }}>
                      Routinen
                    </Text>
                    {routines.length === 0 ? (
                      <Text className="text-sm font-body text-muted-foreground">
                        Noch keine Routinen angelegt.
                      </Text>
                    ) : (
                      routines.map((routine) => (
                        <View
                          key={routine.id}
                          className="flex-row items-center py-2 px-1"
                        >
                          <View
                            className="h-3 w-3 rounded-full mr-2"
                            style={{
                              backgroundColor: routine.color || "#F3E5AB",
                            }}
                          />
                          <Text className="flex-1 text-sm font-body text-foreground">
                            {routine.name}
                          </Text>
                          <Text className="text-xs font-body text-muted-foreground">
                            {routine.tasks.length} Aufgaben
                          </Text>
                        </View>
                      ))
                    )}
                  </View>

                  {/* Rewards overview */}
                  <View
                    className="rounded-[22px] border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <Text className="mb-2 text-sm font-body-semibold" style={{ color: childPalette.accentText }}>
                      Belohnungen
                    </Text>
                    {rewards.length === 0 ? (
                      <Text className="text-sm font-body text-muted-foreground">
                        Noch keine Belohnungen angelegt.
                      </Text>
                    ) : (
                      rewards.map((reward) => {
                        const Icon = getIcon(reward.iconName);
                        return (
                          <View
                            key={reward.id}
                            className="flex-row items-center py-2 px-1"
                          >
                            <Icon size={16} color="#737373" />
                            <Text className="flex-1 ml-2 text-sm font-body text-foreground">
                              {reward.title}
                            </Text>
                            <Text className="text-xs font-body text-muted-foreground">
                              {reward.cost} Sterne
                            </Text>
                          </View>
                        );
                      })
                    )}
                  </View>

                  {/* Delete button */}
                  <Separator />
                  <Button
                    variant="destructive"
                    size="sm"
                    onPress={() => confirmDelete(child)}
                    className="self-start"
                  >
                    <View className="flex-row items-center gap-2">
                      <Trash2 size={16} color="#FFFFFF" />
                      <Text className="text-sm font-body-semibold text-destructive-foreground">
                        Kind entfernen
                      </Text>
                    </View>
                  </Button>
                </View>
              </Animated.View>
            )}
            </Card>
          </Animated.View>
        );
      })}

      {/* Add child form */}
      {showAddForm ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Card className="mt-2 overflow-hidden rounded-[28px] border p-0">
            <View
              className="px-4 py-4"
              style={{ backgroundColor: newChildPalette.heroSurface }}
            >
              <Text className="text-lg font-headline text-foreground">
                Neues Kind hinzufügen
              </Text>
              <Text className="mt-1 text-sm font-body text-muted-foreground">
                Name, Welt, Alter und Avatar reichen für einen guten Start.
              </Text>
            </View>

            <View className="gap-4 px-4 py-4">
              <View
                className="rounded-[24px] border px-4 py-4"
                style={{
                  borderColor: newChildPalette.accentBorder,
                  backgroundColor: newChildPalette.cardTint,
                }}
              >
                <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground">
                  Vorschau
                </Text>
                <View className="mt-3 flex-row items-center">
                  <View
                    className="h-16 w-16 items-center justify-center rounded-[22px]"
                    style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
                  >
                    <Text className="text-3xl">{newChildAvatar}</Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xl font-headline text-foreground">
                      {newChildName.trim() || "Neues Kind"}
                    </Text>
                    <Text className="mt-1 text-sm font-body" style={{ color: newChildPalette.accentText }}>
                      {getThemeLabel(newChildTheme)} · {newChildAgeGroup}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                  Name
                </Text>
                <Input
                  value={newChildName}
                  onChangeText={setNewChildName}
                  placeholder="Name des Kindes"
                  autoFocus
                />
              </View>

              <View>
                <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                  Theme
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {THEME_OPTIONS.map((option) => {
                    const optionPalette = getThemePalette(option.value);
                    const isActive = newChildTheme === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setNewChildTheme(option.value)}
                        className="rounded-[18px] border px-3 py-2"
                        style={{
                          backgroundColor: isActive ? optionPalette.heroSurface : "rgba(255,255,255,0.76)",
                          borderColor: isActive ? optionPalette.accent : "#e5e7eb",
                        }}
                      >
                        <Text className="text-sm font-body-semibold" style={{ color: isActive ? optionPalette.accentText : "#1a1a2e" }}>
                          {option.emoji} {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                  Altersgruppe
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {AGE_GROUP_OPTIONS.map((option) => {
                    const isActive = newChildAgeGroup === option.value;

                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => setNewChildAgeGroup(option.value)}
                        className="rounded-full border px-3 py-2"
                        style={{
                          backgroundColor: isActive ? newChildPalette.tabActiveBg : "rgba(255,255,255,0.76)",
                          borderColor: isActive ? newChildPalette.accent : "#e5e7eb",
                        }}
                      >
                        <Text className="text-sm font-body-semibold" style={{ color: isActive ? newChildPalette.accentText : "#1a1a2e" }}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                  Avatar wählen
                </Text>
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  className="max-h-[260px] rounded-[20px]"
                  contentContainerClassName="gap-3 pb-1"
                >
                  {allAvatars.map(([category, avatars]) => (
                    <View key={category}>
                      <Text className="mb-1.5 text-xs font-body-semibold text-muted-foreground">
                        {category}
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {avatars.map((avatar) => (
                          <Pressable
                            key={avatar.id}
                            onPress={() => setNewChildAvatar(avatar.emoji)}
                            className={cn(
                              "h-12 w-12 items-center justify-center rounded-xl",
                              newChildAvatar === avatar.emoji
                                ? "bg-primary/40 border-2 border-primary"
                                : "bg-secondary"
                            )}
                          >
                            <Text className="text-2xl">{avatar.emoji}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowAddForm(false);
                    setNewChildName("");
                    setNewChildAvatar("🦁");
                    setNewChildTheme("sterne");
                    setNewChildAgeGroup("6-8");
                  }}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onPress={handleAddChild}
                  disabled={!newChildName.trim()}
                  className="flex-1"
                >
                  Kind anlegen
                </Button>
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <Button
          variant="outline"
          onPress={() => setShowAddForm(true)}
          className="mt-2 rounded-[24px]"
        >
          <View className="flex-row items-center gap-2">
            <Plus size={20} color="#1a1a2e" />
            <Text className="text-base font-body-semibold text-foreground">
              Kind hinzufügen
            </Text>
          </View>
        </Button>
      )}
    </ScrollView>
  );
}
