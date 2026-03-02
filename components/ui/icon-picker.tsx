import React, { useState, useMemo } from "react";
import { View, Text, Pressable, Modal, ScrollView, TextInput } from "react-native";
import { X } from "lucide-react-native";
import { getIcon } from "@/lib/icons";
import { iconEntries, iconCategories } from "@/lib/icon-registry";
import type { IconCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onSelect: (iconName: string) => void;
  visible: boolean;
  onClose: () => void;
}

export function IconPicker({ value, onSelect, visible, onClose }: IconPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = useMemo(() => {
    let icons = iconEntries;
    if (selectedCategory !== "all") {
      icons = icons.filter((e) => e.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      icons = icons.filter(
        (e) => e.label.toLowerCase().includes(q) || e.name.toLowerCase().includes(q)
      );
    }
    return icons;
  }, [selectedCategory, searchQuery]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl max-h-[80%] pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text className="text-lg font-headline text-foreground">Icon wählen</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={24} color="#737373" />
            </Pressable>
          </View>

          {/* Search */}
          <View className="px-5 pb-3">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Icon suchen..."
              className="bg-secondary rounded-xl px-4 py-3 text-base font-body text-foreground"
              placeholderTextColor="#737373"
            />
          </View>

          {/* Category tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            className="mb-3 max-h-10"
          >
            <Pressable
              onPress={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-full",
                selectedCategory === "all" ? "bg-[#87CEEB]" : "bg-secondary"
              )}
            >
              <Text className={cn(
                "text-xs font-body-semibold",
                selectedCategory === "all" ? "text-white" : "text-muted-foreground"
              )}>
                Alle
              </Text>
            </Pressable>
            {iconCategories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full",
                  selectedCategory === cat.id ? "bg-[#87CEEB]" : "bg-secondary"
                )}
              >
                <Text className={cn(
                  "text-xs font-body-semibold",
                  selectedCategory === cat.id ? "text-white" : "text-muted-foreground"
                )}>
                  {cat.emoji} {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Icon grid */}
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            <View className="flex-row flex-wrap gap-2">
              {filteredIcons.map((entry) => {
                const Icon = getIcon(entry.name);
                const isSelected = value === entry.name;
                return (
                  <Pressable
                    key={entry.name}
                    onPress={() => {
                      onSelect(entry.name);
                      onClose();
                    }}
                    className={cn(
                      "h-14 w-14 items-center justify-center rounded-xl",
                      isSelected
                        ? "bg-primary/40 border-2 border-[#87CEEB]"
                        : "bg-secondary"
                    )}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? "#87CEEB" : "#737373"}
                    />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
