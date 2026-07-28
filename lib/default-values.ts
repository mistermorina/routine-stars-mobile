import type { TimeOfDay } from "@/lib/types";

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

// Kept for the upcoming routine-reminder notifications (Phase 2):
// default weekday selection per routine slot.
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

// Kept for the upcoming routine-reminder notifications (Phase 2):
// default push-notification body per routine slot.
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
