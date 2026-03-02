import React from "react";
import { View, Text } from "react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
        <View className="flex-row items-center justify-between">
          <CardTitle
            className="text-xl"
            style={{ color: routine.color }}
          >
            {routine.name}
          </CardTitle>
          <Text className="text-sm font-body text-muted-foreground">
            {completedTasks} / {totalTasks} Aufgaben
          </Text>
        </View>
        <Progress
          value={progressValue}
          className="mt-2 h-2"
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
