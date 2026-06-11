import { createAudioPlayer, type AudioPlayer } from "expo-audio";

import {
  setFeedbackSoundAdapter,
  setHapticsGloballyEnabled,
  type FeedbackEvent,
} from "@/lib/feedback";
import { storage, KEYS } from "@/lib/storage";

/**
 * Sound side of the feedback system. Chimes are synthesized WAVs
 * (scripts/generate-sounds.mjs). Navigation events stay silent on purpose —
 * sound is reserved for earned moments.
 */
const soundSources: Partial<Record<FeedbackEvent, number>> = {
  task_complete: require("../assets/sounds/task-complete.wav"),
  routine_complete: require("../assets/sounds/routine-complete.wav"),
  reward_redeemed: require("../assets/sounds/reward-redeemed.wav"),
  mission_complete: require("../assets/sounds/mission-complete.wav"),
  sticker_unlocked: require("../assets/sounds/sticker-unlocked.wav"),
  streak_up: require("../assets/sounds/streak-up.wav"),
  profile_milestone: require("../assets/sounds/sticker-unlocked.wav"),
};

const players: Partial<Record<FeedbackEvent, AudioPlayer>> = {};

let soundEnabled = true;

function playFeedbackSound(event: FeedbackEvent) {
  if (!soundEnabled) return;
  const source = soundSources[event];
  if (!source) return;

  try {
    let player = players[event];
    if (!player) {
      player = createAudioPlayer(source);
      player.volume = 0.8;
      players[event] = player;
    }
    player.seekTo(0);
    player.play();
  } catch {
    // Sound is decorative — never let it break an interaction.
  }
}

let readyPromise: Promise<void> | null = null;

async function loadAndRegister(): Promise<void> {
  const [sound, haptics] = await Promise.all([
    storage.getItem<boolean>(KEYS.SOUND_ENABLED),
    storage.getItem<boolean>(KEYS.HAPTICS_ENABLED),
  ]);
  soundEnabled = sound !== false;
  setHapticsGloballyEnabled(haptics !== false);
  setFeedbackSoundAdapter((event) => playFeedbackSound(event));
}

/**
 * Loads persisted toggles (default: on) and registers the sound adapter.
 * Idempotent — callers (root layout, settings) can await the same init.
 */
export function initFeedback(): Promise<void> {
  if (!readyPromise) {
    readyPromise = loadAndRegister();
  }
  return readyPromise;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  soundEnabled = enabled;
  await storage.setItem(KEYS.SOUND_ENABLED, enabled);
}

export async function setHapticsEnabled(enabled: boolean): Promise<void> {
  setHapticsGloballyEnabled(enabled);
  await storage.setItem(KEYS.HAPTICS_ENABLED, enabled);
}
