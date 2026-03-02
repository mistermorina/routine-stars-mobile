import type { TimeOfDay } from "@/lib/types";

export function getDefaultRoutineName(hour: number): string {
  if (hour < 12) return "Morgenroutine";
  if (hour < 17) return "Nachmittagsroutine";
  return "Abendroutine";
}

export function getDefaultRoutineColor(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case "morning":
      return "hsl(38, 92%, 50%)";
    case "afternoon":
      return "hsl(180, 60%, 45%)";
    case "evening":
      return "hsl(255, 82%, 60%)";
    case "flexible":
      return "hsl(150, 60%, 45%)";
  }
}

export function getDefaultStarCost(taskCategory: string): number {
  switch (taskCategory) {
    case "hygiene":
      return 1;
    case "school":
      return 2;
    case "household":
      return 2;
    default:
      return 1;
  }
}

export function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function getDefaultScheduleDays(timeOfDay: TimeOfDay): ("Mo" | "Di" | "Mi" | "Do" | "Fr" | "Sa" | "So")[] {
  switch (timeOfDay) {
    case "morning":
      return ["Mo", "Di", "Mi", "Do", "Fr"];
    case "afternoon":
      return ["Mo", "Di", "Mi", "Do", "Fr"];
    case "evening":
      return ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    case "flexible":
      return ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  }
}

export function getDefaultReminderMessage(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case "morning":
      return "Zeit für deine Morgenroutine! ☀️";
    case "afternoon":
      return "Zeit für deine Nachmittagsroutine!";
    case "evening":
      return "Zeit für deine Abendroutine! 🌙";
    case "flexible":
      return "Zeit für deine Routine!";
  }
}
