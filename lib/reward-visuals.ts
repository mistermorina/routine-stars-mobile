import {
  getCardGradient,
  getCtaGradient,
  getOnCardColor,
  HUE_IDS,
  type HueId,
  type ScreenRamp,
} from "@/lib/gradients";
import type { Reward } from "@/lib/types";

export interface RewardVisual {
  hue: HueId;
  accent: string;
  accentStrong: string;
  cardGradient: ScreenRamp;
  onCard: string;
}

/**
 * Gives every reward a stable palette hue without adding a persisted field.
 * The id is stable across filtering and sorting, so a wish never changes colour
 * just because another reward was redeemed or hidden.
 */
function getRewardHue(reward: Reward): HueId {
  let hash = 2166136261;

  for (const character of `${reward.id}:${reward.iconName}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return HUE_IDS[(hash >>> 0) % HUE_IDS.length];
}

export function getRewardVisual(reward: Reward): RewardVisual {
  const hue = getRewardHue(reward);
  const cta = getCtaGradient(hue);

  return {
    hue,
    accent: cta.from,
    accentStrong: cta.to,
    cardGradient: getCardGradient(hue),
    onCard: getOnCardColor(),
  };
}
