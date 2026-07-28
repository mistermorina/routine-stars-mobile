import React, { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { routineTemplates } from "@/lib/routine-templates";
import { TemplateCard } from "./template-card";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, RoutineTemplate, RoutineCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  onSelectTemplate: (template: RoutineTemplate) => void;
  selectedTemplateId?: string;
  theme?: ChildTheme;
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

export function TemplateSelector({
  onSelectTemplate,
  selectedTemplateId,
  theme,
}: TemplateSelectorProps) {
  const [category, setCategory] = useState<RoutineCategory | "all">("all");
  const palette = getThemePalette(theme);

  const filtered = useMemo(() => {
    if (category === "all") return routineTemplates;
    return routineTemplates.filter((t) => t.category === category);
  }, [category]);

  return (
    <View>
      {/* Category filter */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        {categoryFilters.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setCategory(f.id)}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2.5",
              category === f.id ? "" : "border-transparent"
            )}
            style={
              category === f.id
                ? {
                    backgroundColor: palette.tabActiveBg,
                    borderColor: palette.accent,
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.74)",
                  }
            }
          >
            <Text
              className={cn("text-sm font-body-semibold", category === f.id ? "" : "text-muted-foreground")}
              style={category === f.id ? { color: palette.accentText } : undefined}
              numberOfLines={1}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Template cards */}
      <View className="gap-3">
        {filtered.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onSelectTemplate}
            isSelected={template.id === selectedTemplateId}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}
