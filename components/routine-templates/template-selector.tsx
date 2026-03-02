import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { routineTemplates } from "@/lib/routine-templates";
import { TemplateCard } from "./template-card";
import type { RoutineTemplate, RoutineCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  onSelectTemplate: (template: RoutineTemplate) => void;
  selectedTemplateId?: string;
}

const categoryFilters: { id: RoutineCategory | "all"; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "hygiene", label: "Morgen" },
  { id: "evening", label: "Abend" },
  { id: "school", label: "Schule" },
  { id: "household", label: "Haushalt" },
  { id: "sport", label: "Sport" },
  { id: "meals", label: "Essen" },
  { id: "weekend", label: "Wochenende" },
  { id: "special", label: "Besonders" },
];

export function TemplateSelector({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) {
  const [category, setCategory] = useState<RoutineCategory | "all">("all");

  const filtered = useMemo(() => {
    if (category === "all") return routineTemplates;
    return routineTemplates.filter((t) => t.category === category);
  }, [category]);

  return (
    <View style={{ overflow: "hidden" }}>
      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
        className="mb-3"
        nestedScrollEnabled
      >
        {categoryFilters.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setCategory(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-full",
              category === f.id ? "bg-[#87CEEB]" : "bg-secondary"
            )}
          >
            <Text className={cn(
              "text-xs font-body-semibold",
              category === f.id ? "text-white" : "text-muted-foreground"
            )}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Template cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        nestedScrollEnabled
      >
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
            isSelected={template.id === selectedTemplateId}
          />
        ))}
      </ScrollView>
    </View>
  );
}
