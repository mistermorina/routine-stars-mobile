import React, { useState, useMemo } from "react";
import { View, Text, Pressable, Modal, ScrollView, TextInput, useWindowDimensions } from "react-native";
import { X, getIcon } from "@/lib/icons";
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
  const { width } = useWindowDimensions();
  const iconTileWidth = width < 380 ? "31%" : "23.5%";

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
        <View className="max-h-[86%] rounded-t-3xl bg-background pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text className="text-lg font-headline text-foreground">Icon wählen</Text>
            <Pressable
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full bg-secondary"
              accessibilityRole="button"
              accessibilityLabel="Icon-Auswahl schließen"
            >
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
          <View className="mb-3 flex-row flex-wrap gap-2 px-5">
            <Pressable
              onPress={() => setSelectedCategory("all")}
              className={cn(
                "min-h-11 flex-row items-center gap-1.5 rounded-full px-3 py-2",
                selectedCategory === "all" ? "bg-accent" : "bg-secondary"
              )}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === "all" }}
            >
              {React.createElement(getIcon("sparkles"), {
                size: 15,
                color: selectedCategory === "all" ? "#FFFFFF" : "#737373",
              })}
              <Text className={cn(
                "text-sm font-body-semibold",
                selectedCategory === "all" ? "text-accent-foreground" : "text-muted-foreground"
              )}>
                Alle
              </Text>
            </Pressable>
            {iconCategories.map((cat) => {
              const CategoryIcon = getIcon(cat.iconName);
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "min-h-11 flex-row items-center gap-1.5 rounded-full px-3 py-2",
                    isSelected ? "bg-accent" : "bg-secondary"
                  )}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Icon-Kategorie ${cat.label}`}
                >
                  <CategoryIcon size={15} color={isSelected ? "#FFFFFF" : "#737373"} />
                  <Text
                    className={cn(
                      "text-sm font-body-semibold",
                      isSelected ? "text-accent-foreground" : "text-muted-foreground"
                    )}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

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
                      "min-h-[84px] items-center justify-center rounded-xl px-2 py-2",
                      isSelected
                        ? "bg-primary/40 border-2 border-accent"
                        : "bg-secondary"
                    )}
                    style={{ width: iconTileWidth }}
                    accessibilityRole="button"
                    accessibilityLabel={`Icon ${entry.label} auswählen`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Icon
                      size={24}
                      color={isSelected ? "#245A74" : "#737373"}
                    />
                    <Text
                      className="mt-1 text-center text-sm font-body-semibold text-foreground"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                    >
                      {entry.label}
                    </Text>
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
