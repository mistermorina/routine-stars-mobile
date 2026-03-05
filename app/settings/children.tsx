import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
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
import { cn } from "@/lib/utils";
import type { Child } from "@/lib/types";

export default function ChildrenSettings() {
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

  const allAvatars = Object.entries(avatarCategories);

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
      theme: "sterne",
      ageGroup: "6-8",
    };
    await addChild(newChild);
    toast({ title: `${newChild.name} wurde hinzugefügt` });
    setNewChildName("");
    setNewChildAvatar("🦁");
    setShowAddForm(false);
  }

  async function selectAvatar(childId: string, emoji: string) {
    await updateChild(childId, { avatar: emoji });
    setShowAvatarPicker(null);
    toast({ title: "Avatar aktualisiert" });
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      {/* Children list */}
      {children.length === 0 && !showAddForm && (
        <View className="items-center justify-center py-12">
          <Text className="text-5xl mb-4">👶</Text>
          <Text className="text-lg font-headline text-foreground text-center">
            Noch keine Kinder
          </Text>
          <Text className="mt-2 text-sm font-body text-muted-foreground text-center">
            Füge dein erstes Kind hinzu, um loszulegen.
          </Text>
        </View>
      )}

      {children.map((child) => (
        <Animated.View
          key={child.id}
          layout={Layout.springify()}
          entering={FadeInDown.duration(300)}
          exiting={FadeOutUp.duration(200)}
          className="mb-3"
        >
          <Card className="p-0 overflow-hidden">
            {/* Child header (always visible) */}
            <Pressable
              onPress={() => toggleExpanded(child.id)}
              className="flex-row items-center p-4 active:bg-secondary/50"
            >
              <Text className="text-3xl mr-3">{child.avatar}</Text>
              <View className="flex-1">
                <Text className="text-lg font-headline text-foreground">
                  {child.name}
                </Text>
                <Text className="text-sm font-body text-muted-foreground">
                  {child.stars} Sterne
                </Text>
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
                  <View>
                    <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                      Name
                    </Text>
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
                        <Text className="text-sm font-body text-primary">
                          Bearbeiten
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Avatar picker */}
                  <View>
                    <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                      Avatar
                    </Text>
                    {showAvatarPicker === child.id ? (
                      <View className="gap-3">
                        {allAvatars.map(([category, avatars]) => (
                          <View key={category}>
                            <Text className="text-xs font-body-semibold text-muted-foreground mb-1.5">
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
                        <Text className="text-sm font-body text-primary">
                          Ändern
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Routines overview */}
                  <View>
                    <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                      Routinen
                    </Text>
                    {routines.map((routine) => (
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
                    ))}
                  </View>

                  {/* Rewards overview */}
                  <View>
                    <Text className="text-sm font-body-semibold text-muted-foreground mb-2">
                      Belohnungen
                    </Text>
                    {rewards.map((reward) => {
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
                    })}
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
      ))}

      {/* Add child form */}
      {showAddForm ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Card className="mt-2">
            <Text className="text-lg font-headline text-foreground mb-4">
              Neues Kind hinzufügen
            </Text>

            <View className="gap-4">
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
                  Avatar wählen
                </Text>
                {allAvatars.map(([category, avatars]) => (
                  <View key={category} className="mb-3">
                    <Text className="text-xs font-body-semibold text-muted-foreground mb-1.5">
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
              </View>

              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowAddForm(false);
                    setNewChildName("");
                    setNewChildAvatar("🦁");
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
                  Hinzufügen
                </Button>
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <Button
          variant="outline"
          onPress={() => setShowAddForm(true)}
          className="mt-2"
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
