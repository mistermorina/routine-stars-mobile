import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskItem } from "./task-item";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import { getRoutineVisual } from "@/lib/routine-visuals";
import type { ChildTheme, Routine, Task } from "@/lib/types";

const ROUTINE_HEADER_ART_SIZE = 88;

interface RoutineCardProps {
  routine: Routine;
  onTaskComplete: (taskId: string, bonusStars?: number) => void;
  onStartTimer: (task: Task) => void;
  childTheme?: ChildTheme;
  highlightTaskId?: string;
}

export function RoutineCard({
  routine,
  onTaskComplete,
  onStartTimer,
  childTheme,
  highlightTaskId,
}: RoutineCardProps) {
  const completedTasks = routine.tasks.filter((t) => t.completed).length;
  const totalTasks = routine.tasks.length;
  const progressValue = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const palette = getThemePalette(childTheme);
  const visual = getRoutineVisual(routine, palette.chartPrimary);
  const isComplete = totalTasks > 0 && completedTasks === totalTasks;

  return (
    <Card
      className="mb-4 overflow-hidden rounded-card px-4 pb-4 pt-5"
      style={{
        backgroundColor: palette.cardTint,
        borderColor: palette.accentBorder,
        ...shadowPresets.shadowCard,
      }}
    >
      <LinearGradient
        colors={visual.cardGradient.colors}
        locations={visual.cardGradient.locations}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFillObject}
      />
      <View
        className="absolute left-[-40px] top-14 h-28 w-28 rounded-full"
        style={{ backgroundColor: semanticColors.card, opacity: 0.34 }}
      />
      <View
        className="absolute right-[-34px] top-[-36px] h-40 w-40 rounded-full"
        style={{ backgroundColor: `${visual.accentStrong}14` }}
      />
      {visual.art ? (
        <Image
          source={visual.art}
          style={{
            position: "absolute",
            right: 8,
            top: 2,
            width: ROUTINE_HEADER_ART_SIZE,
            height: ROUTINE_HEADER_ART_SIZE,
            opacity: 0.84,
          }}
          contentFit="contain"
          transition={160}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}

      <View className="relative">
        <View className="min-h-[76px] pr-[74px]">
          <Text
            className="text-lg font-headline leading-6"
            style={{ color: visual.onCard }}
            numberOfLines={1}
            maxFontSizeMultiplier={1.3}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {routine.name}
          </Text>
          <View
            className="mt-2 self-start flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
          >
            <Star size={14} color={visual.accent} fill={visual.accent} />
            <Text
              className="text-sm font-body-semibold"
              style={{ color: visual.accent }}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            >
              {completedTasks} / {totalTasks} Aufgaben
            </Text>
          </View>
        </View>
        <Progress
          value={progressValue}
          className="mt-1 h-2.5"
          indicatorColor={visual.accent}
          trackStyle={{ backgroundColor: "rgba(255,255,255,0.82)" }}
        />
      </View>

      <CardContent className="mt-4">
        <View className="gap-2.5">
          {routine.tasks.map((task) => (
            <View
              key={task.id}
            >
              <TaskItem
                task={task}
                routineColor={visual.accent}
                routineHue={visual.hue}
                childTheme={childTheme}
                isSuggested={highlightTaskId === task.id}
                onComplete={(bonus) => onTaskComplete(task.id, bonus)}
                onStartTimer={onStartTimer}
              />
            </View>
          ))}
        </View>

        {isComplete ? (
          <View
            className="mt-4 flex-row items-center overflow-hidden rounded-tile px-4 py-3"
            style={{ backgroundColor: visual.accentSoft }}
          >
            <Image
              source={visual.completionArt}
              style={{ width: 66, height: 66, opacity: 0.9 }}
              contentFit="contain"
              transition={160}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-headline" style={{ color: visual.accent }}>
                {visual.completionTitle}
              </Text>
              <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                {visual.completionText}
              </Text>
            </View>
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}
