import React from "react";
import { View, Text } from "react-native";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskItem } from "./task-item";
import type { Routine, Task } from "@/lib/types";

interface RoutineCardProps {
  routine: Routine;
  onTaskComplete: (taskId: string, bonusStars?: number) => void;
  onStartTimer: (task: Task) => void;
}

export function RoutineCard({
  routine,
  onTaskComplete,
  onStartTimer,
}: RoutineCardProps) {
  const completedTasks = routine.tasks.filter((t) => t.completed).length;
  const totalTasks = routine.tasks.length;
  const progressValue = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="mb-4">
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
          className="mt-2 h-2"
          indicatorColor={routine.color}
          indicatorClassName={routine.color ? undefined : "bg-gold"}
        />
      </CardHeader>
      <CardContent>
        <View className="gap-3">
          {routine.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              routineColor={routine.color}
              onComplete={(bonus) => onTaskComplete(task.id, bonus)}
              onStartTimer={onStartTimer}
            />
          ))}
        </View>
      </CardContent>
    </Card>
  );
}
