import React from "react";
import { View, Text, Pressable } from "react-native";
import { getIcon } from "@/lib/icons";
import type { RoutineTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: RoutineTemplate;
  onSelect: (template: RoutineTemplate) => void;
  isSelected: boolean;
}

export function TemplateCard({ template, onSelect, isSelected }: TemplateCardProps) {
  return (
    <Pressable
      onPress={() => onSelect(template)}
      className={cn(
        "rounded-xl border bg-card p-4 mr-3",
        isSelected
          ? "border-2 border-[#87CEEB] bg-[#87CEEB]/10"
          : "border-border"
      )}
      style={{ width: 200 }}
    >
      {/* Color indicator + name */}
      <View className="flex-row items-center mb-2">
        <View
          className="h-3 w-3 rounded-full mr-2"
          style={{ backgroundColor: template.color }}
        />
        <Text className="text-base font-headline text-foreground flex-1" numberOfLines={1}>
          {template.name}
        </Text>
      </View>

      {/* Description */}
      <Text className="text-xs font-body text-muted-foreground mb-3" numberOfLines={2}>
        {template.description}
      </Text>

      {/* Task count + age badges */}
      <View className="flex-row items-center gap-2">
        <View className="bg-secondary px-2 py-0.5 rounded-full">
          <Text className="text-xs font-body-semibold text-muted-foreground">
            {template.tasks.length} Aufgaben
          </Text>
        </View>
        {template.ageGroups.map((age) => (
          <View key={age} className="bg-[#F3E5AB]/50 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-body text-foreground">{age}</Text>
          </View>
        ))}
      </View>

      {/* Preview of first 3 task icons */}
      <View className="flex-row mt-3 gap-1.5">
        {template.tasks.slice(0, 3).map((task, i) => {
          const Icon = getIcon(task.iconName);
          return (
            <View key={i} className="h-8 w-8 rounded-lg bg-secondary items-center justify-center">
              <Icon size={16} color="#737373" />
            </View>
          );
        })}
        {template.tasks.length > 3 && (
          <View className="h-8 w-8 rounded-lg bg-secondary items-center justify-center">
            <Text className="text-xs font-body text-muted-foreground">+{template.tasks.length - 3}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
