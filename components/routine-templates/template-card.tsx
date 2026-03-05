import React from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getIcon } from "@/lib/icons";
import { getThemePalette } from "@/lib/theme";
import type { RoutineTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ChildTheme } from "@/lib/types";

interface TemplateCardProps {
  template: RoutineTemplate;
  onSelect: (template: RoutineTemplate) => void;
  isSelected: boolean;
  theme?: ChildTheme;
}

export function TemplateCard({
  template,
  onSelect,
  isSelected,
  theme,
}: TemplateCardProps) {
  const palette = getThemePalette(theme);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={() => onSelect(template)}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 14, stiffness: 240 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
    >
      <Animated.View
        className={cn("mr-3 overflow-hidden rounded-[26px] border p-4", isSelected ? "" : "")}
        style={[
          animatedStyle,
          {
            width: 216,
            backgroundColor: isSelected ? palette.heroSurface : palette.cardTint,
            borderColor: isSelected ? palette.accent : palette.accentBorder,
            shadowColor: template.color,
            shadowOpacity: isSelected ? 0.16 : 0.08,
            shadowRadius: isSelected ? 16 : 10,
            shadowOffset: { width: 0, height: 8 },
          },
        ]}
      >
        <View
          className="absolute right-[-26px] top-[-22px] h-24 w-24 rounded-full"
          style={{ backgroundColor: template.color, opacity: 0.14 }}
        />

        <View className="flex-row items-start justify-between">
          <View
            className="h-12 w-12 items-center justify-center rounded-[18px]"
            style={{ backgroundColor: `${template.color}22` }}
          >
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: template.color }} />
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
          >
            <Text className="text-[11px] font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
              {template.timeOfDay === "morning"
                ? "Morgen"
                : template.timeOfDay === "evening"
                  ? "Abend"
                  : template.timeOfDay === "afternoon"
                    ? "Nachmittag"
                    : "Flexibel"}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-lg font-headline text-foreground" numberOfLines={2}>
            {template.name}
          </Text>
          <Text className="mt-2 text-sm font-body text-muted-foreground" numberOfLines={3}>
            {template.description}
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: palette.surface }}
          >
            <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
              {template.tasks.length} Aufgaben
            </Text>
          </View>
          {template.suggestedTime ? (
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
            >
              <Text className="text-xs font-body text-muted-foreground">
                {template.suggestedTime}
              </Text>
            </View>
          ) : null}
          {template.ageGroups.slice(0, 2).map((age) => (
            <View
              key={age}
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: "rgba(255,255,255,0.74)" }}
            >
              <Text className="text-xs font-body text-foreground">{age}</Text>
            </View>
          ))}
        </View>

        <View className="mt-4 flex-row gap-2">
          {template.tasks.slice(0, 3).map((task, i) => {
            const Icon = getIcon(task.iconName);
            return (
              <View
                key={i}
                className="h-10 w-10 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
              >
                <Icon size={18} color={template.color} />
              </View>
            );
          })}
          {template.tasks.length > 3 ? (
            <View
              className="h-10 min-w-10 items-center justify-center rounded-[14px] px-2"
              style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
            >
              <Text className="text-xs font-body-semibold" style={{ color: palette.accentText }}>
                +{template.tasks.length - 3}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}
