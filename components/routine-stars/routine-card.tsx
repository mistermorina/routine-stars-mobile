import React from "react";
import { View, Text } from "react-native";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskItem } from "./task-item";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, Routine, Task } from "@/lib/types";

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

  return (
    <Card
      className="mb-4 overflow-hidden rounded-[30px]"
      style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
    >
      <View
        className="absolute right-[-40px] top-[-24px] h-28 w-28 rounded-full"
        style={{ backgroundColor: `${routine.color ?? palette.motifSecondary}18` }}
      />
      <CardHeader>
        <View className="flex-row items-start justify-between gap-3">
          <Text
            className="flex-1 text-xl font-headline"
            style={{ color: routine.color }}
            numberOfLines={2}
          >
            {routine.name}
          </Text>
          <Text className="shrink-0 pt-1 text-sm font-body text-muted-foreground">
            {completedTasks} / {totalTasks} Aufgaben
          </Text>
        </View>
        <Progress
          value={progressValue}
          className="mt-3 h-3"
          indicatorColor={routine.color}
          indicatorClassName={routine.color ? undefined : "bg-gold"}
          trackStyle={{ backgroundColor: "rgba(255,255,255,0.78)" }}
        />
      </CardHeader>
      <CardContent>
        <View className="gap-3">
          {routine.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              routineColor={routine.color}
              childTheme={childTheme}
              isSuggested={highlightTaskId === task.id}
              onComplete={(bonus) => onTaskComplete(task.id, bonus)}
              onStartTimer={onStartTimer}
            />
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
