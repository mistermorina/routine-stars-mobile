import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export type FeedbackEvent =
  | "task_complete"
  | "stars_added"
  | "routine_complete"
  | "reward_redeemed"
  | "streak_up"
  | "tab_focus"
  | "theme_preview"
  | "profile_milestone";

export interface FeedbackOptions {
  disableHaptics?: boolean;
  disableSound?: boolean;
}

type FeedbackSoundAdapter = (
  event: FeedbackEvent,
  options?: FeedbackOptions
) => void | Promise<void>;

const FEEDBACK_THROTTLE_MS: Record<FeedbackEvent, number> = {
  task_complete: 140,
  stars_added: 140,
  routine_complete: 800,
  reward_redeemed: 400,
  streak_up: 1200,
  tab_focus: 250,
  theme_preview: 180,
  profile_milestone: 1500,
};

const lastTriggered = new Map<FeedbackEvent, number>();

let soundAdapter: FeedbackSoundAdapter | null = null;

export function setFeedbackSoundAdapter(adapter: FeedbackSoundAdapter | null) {
  soundAdapter = adapter;
}

async function runHaptic(event: FeedbackEvent) {
  switch (event) {
    case "task_complete":
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    case "stars_added":
    case "tab_focus":
    case "theme_preview":
      await Haptics.selectionAsync();
      return;
    case "reward_redeemed":
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return;
    case "routine_complete":
    case "streak_up":
    case "profile_milestone":
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
  }
}

export async function triggerFeedback(
  event: FeedbackEvent,
  options: FeedbackOptions = {}
) {
  const now = Date.now();
  const lastTime = lastTriggered.get(event) ?? 0;

  if (now - lastTime < FEEDBACK_THROTTLE_MS[event]) {
    return;
  }

  lastTriggered.set(event, now);

  if (!options.disableHaptics && Platform.OS !== "web") {
    try {
      await runHaptic(event);
    } catch {
      // Ignore missing haptics support.
    }
  }

  if (!options.disableSound && soundAdapter) {
    try {
      await soundAdapter(event, options);
    } catch {
      // Sound remains optional in v1.
    }
  }
}
