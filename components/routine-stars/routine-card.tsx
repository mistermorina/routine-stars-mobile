import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskItem } from "./task-item";
import { getThemePalette } from "@/lib/theme";
import type { ChildTheme, Routine, Task } from "@/lib/types";
import routineMorningSunImage from "@/assets/images/routine-morning-sun-soft.png";
import routineEveningMoonImage from "@/assets/images/routine-evening-moon-soft.png";
import routineTrophyImage from "@/assets/images/routine-trophy-soft.png";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";

interface RoutineCardProps {
  routine: Routine;
  onTaskComplete: (taskId: string, bonusStars?: number) => void;
  onStartTimer: (task: Task) => void;
  childTheme?: ChildTheme;
  highlightTaskId?: string;
}

function getRoutineVisual(routine: Routine, fallbackAccent: string) {
  const name = routine.name.toLowerCase();

  if (name.includes("abend") || name.includes("nacht")) {
    return {
      accent: "#7C55E7",
      accentSoft: "#F3EEFF",
      art: routineEveningMoonImage,
      completionArt: rewardStarGiftImage,
      completionTitle: "Gut gemacht!",
      completionText: "Schlaf schön und träum was Wunderbares!",
    };
  }

  if (name.includes("morgen") || name.includes("schule")) {
    return {
      accent: "#F7941D",
      accentSoft: "#FFF4DD",
      art: routineMorningSunImage,
      completionArt: routineTrophyImage,
      completionTitle: "Fantastisch!",
      completionText: "Du hast deine Morgenroutine abgeschlossen!",
    };
  }

  return {
    accent: routine.color || fallbackAccent,
    accentSoft: "#F6FAFF",
    art: null,
    completionArt: rewardStarGiftImage,
    completionTitle: "Stark gemacht!",
    completionText: "Diese Routine ist komplett geschafft.",
  };
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
  const hasHeroArt = Boolean(visual.art);

  return (
    <Card
      className="mb-4 overflow-hidden rounded-[22px] px-4 pb-4 pt-5"
      style={{
        backgroundColor: palette.cardTint,
        borderColor: palette.accentBorder,
        shadowColor: "#9DB8D8",
        shadowOpacity: 0.14,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <View
        className="absolute inset-x-0 top-0 h-32"
        style={{ backgroundColor: visual.accentSoft, opacity: 0.82 }}
      />
      <View
        className="absolute left-[-40px] top-14 h-28 w-28 rounded-full"
        style={{ backgroundColor: "#FFFFFF", opacity: 0.34 }}
      />
      <View
        className="absolute right-[-34px] top-[-36px] h-40 w-40 rounded-full"
        style={{ backgroundColor: `${visual.accent}14` }}
      />
      {visual.art ? (
        <Image
          source={visual.art}
          style={{
            position: "absolute",
            right: -10,
            top: -18,
            width: 142,
            height: 142,
            opacity: 0.78,
          }}
          contentFit="contain"
          transition={160}
        />
      ) : null}

      <View className="relative">
        <View className={hasHeroArt ? "min-h-[94px] pr-28" : "min-h-[74px] pr-0"}>
          <Text
            className={hasHeroArt
              ? "text-[24px] font-headline leading-[30px]"
              : "text-[25px] font-headline leading-[31px]"}
            style={{ color: visual.accent }}
            numberOfLines={hasHeroArt ? 2 : 1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {routine.name}
          </Text>
          <View
            className="mt-3 self-start flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.78)" }}
          >
            <Star size={14} color={visual.accent} fill={visual.accent} />
            <Text className="text-xs font-body-semibold" style={{ color: visual.accent }}>
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
            className="mt-4 flex-row items-center overflow-hidden rounded-[20px] px-4 py-3"
            style={{ backgroundColor: visual.accentSoft }}
          >
            <Image
              source={visual.completionArt}
              style={{ width: 66, height: 66, opacity: 0.9 }}
              contentFit="contain"
              transition={160}
            />
            <View className="ml-3 flex-1">
              <Text className="text-base font-headline" style={{ color: visual.accent }}>
                {visual.completionTitle}
              </Text>
              <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
                {visual.completionText}
              </Text>
            </View>
          </View>
        ) : null}
      </CardContent>
    </Card>
  );
}
