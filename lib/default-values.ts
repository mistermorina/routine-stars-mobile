import type { TimeOfDay } from "@/lib/types";
import { getSolid } from "@/lib/gradients";

export function getDefaultRoutineColor(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case "morning":
      return getSolid("amber");
    case "afternoon":
      return getSolid("cyan");
    case "evening":
      return getSolid("violet");
    case "flexible":
      return getSolid("green");
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
