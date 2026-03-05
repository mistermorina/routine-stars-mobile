import type { RewardSuggestion, RewardCategory, RewardCategoryInfo } from "@/lib/types";

export const rewardCategories: RewardCategoryInfo[] = [
  { id: "screen-time", label: "Bildschirmzeit", emoji: "📺" },
  { id: "activities", label: "Aktivitäten", emoji: "🎨" },
  { id: "treats", label: "Leckereien", emoji: "🍰" },
  { id: "privileges", label: "Privilegien", emoji: "⏰" },
  { id: "social", label: "Soziales", emoji: "👥" },
  { id: "material", label: "Materielles", emoji: "🎁" },
  { id: "special", label: "Besonderes", emoji: "🌟" },
];

export const rewardSuggestions: RewardSuggestion[] = [
  // --- screen-time (7 items) ---
  { id: "st-1", title: "15 Min. fernsehen", category: "screen-time", cost: 5, iconName: "tv" },
  { id: "st-2", title: "30 Min. Tablet spielen", category: "screen-time", cost: 8, iconName: "gamepad-2" },
  { id: "st-3", title: "Einen Film schauen", category: "screen-time", cost: 15, iconName: "tv" },
  { id: "st-4", title: "15 Min. Videospiele", category: "screen-time", cost: 5, iconName: "gamepad-2" },
  { id: "st-5", title: "YouTube-Video anschauen", category: "screen-time", cost: 3, iconName: "tv" },
  { id: "st-6", title: "30 Min. Lieblingsserie", category: "screen-time", cost: 8, iconName: "tv" },
  { id: "st-7", title: "Hörspiel hören", category: "screen-time", cost: 3, iconName: "music" },

  // --- activities (8 items) ---
  { id: "ac-1", title: "Zusammen malen", category: "activities", cost: 5, iconName: "palette" },
  { id: "ac-2", title: "Zusammen basteln", category: "activities", cost: 8, iconName: "scissors" },
  { id: "ac-3", title: "Zusammen backen", category: "activities", cost: 10, iconName: "cookie" },
  { id: "ac-4", title: "Auf den Spielplatz gehen", category: "activities", cost: 8, iconName: "smile" },
  { id: "ac-5", title: "Fahrrad fahren", category: "activities", cost: 8, iconName: "bike" },
  { id: "ac-6", title: "Im Garten spielen", category: "activities", cost: 5, iconName: "tree-pine" },
  { id: "ac-7", title: "Musik machen", category: "activities", cost: 5, iconName: "music" },
  { id: "ac-8", title: "Fotos machen", category: "activities", cost: 5, iconName: "camera" },

  // --- treats (8 items) ---
  { id: "tr-1", title: "Ein Eis essen", category: "treats", cost: 8, iconName: "sparkles" },
  { id: "tr-2", title: "Einen Keks", category: "treats", cost: 3, iconName: "cookie" },
  { id: "tr-3", title: "Stück Schokolade", category: "treats", cost: 3, iconName: "heart" },
  { id: "tr-4", title: "Stück Kuchen", category: "treats", cost: 5, iconName: "croissant" },
  { id: "tr-5", title: "Gummibärchen", category: "treats", cost: 3, iconName: "smile" },
  { id: "tr-6", title: "Lieblings-Smoothie", category: "treats", cost: 5, iconName: "glass-water" },
  { id: "tr-7", title: "Pizza zum Abendessen", category: "treats", cost: 10, iconName: "pizza" },
  { id: "tr-8", title: "Sandwich nach Wunsch", category: "treats", cost: 5, iconName: "sandwich" },

  // --- privileges (7 items) ---
  { id: "pr-1", title: "15 Min. länger aufbleiben", category: "privileges", cost: 8, iconName: "moon" },
  { id: "pr-2", title: "Abendessen aussuchen", category: "privileges", cost: 10, iconName: "utensils-crossed" },
  { id: "pr-3", title: "Eine Aufgabe überspringen", category: "privileges", cost: 10, iconName: "zap" },
  { id: "pr-4", title: "Musik beim Essen hören", category: "privileges", cost: 3, iconName: "music" },
  { id: "pr-5", title: "Im Elternbett schlafen", category: "privileges", cost: 8, iconName: "bed" },
  { id: "pr-6", title: "Nachtlicht anlassen", category: "privileges", cost: 3, iconName: "lamp" },
  { id: "pr-7", title: "Extra Geschichte vor dem Schlafen", category: "privileges", cost: 5, iconName: "book-open" },

  // --- social (6 items) ---
  { id: "so-1", title: "Freund einladen", category: "social", cost: 15, iconName: "users" },
  { id: "so-2", title: "Übernachtung bei Freund", category: "social", cost: 20, iconName: "moon" },
  { id: "so-3", title: "Familien-Spieleabend", category: "social", cost: 10, iconName: "gamepad-2" },
  { id: "so-4", title: "Oma & Opa anrufen", category: "social", cost: 3, iconName: "heart" },
  { id: "so-5", title: "Gemeinsam kochen", category: "social", cost: 8, iconName: "utensils-crossed" },
  { id: "so-6", title: "Familienausflug planen", category: "social", cost: 15, iconName: "globe" },

  // --- material (6 items) ---
  { id: "ma-1", title: "Sticker aussuchen", category: "material", cost: 5, iconName: "award" },
  { id: "ma-2", title: "Kleines Spielzeug", category: "material", cost: 15, iconName: "toy-brick" },
  { id: "ma-3", title: "Comic / Buch", category: "material", cost: 10, iconName: "book-text" },
  { id: "ma-4", title: "Malbuch", category: "material", cost: 8, iconName: "palette" },
  { id: "ma-5", title: "Haarschmuck / Accessoire", category: "material", cost: 10, iconName: "sparkles" },
  { id: "ma-6", title: "Geschenk aussuchen", category: "material", cost: 20, iconName: "gift" },

  // --- special (5 items) ---
  { id: "sp-1", title: "Zoo-Besuch", category: "special", cost: 30, iconName: "paw-print" },
  { id: "sp-2", title: "Kino-Besuch", category: "special", cost: 25, iconName: "tv" },
  { id: "sp-3", title: "Schwimmbad gehen", category: "special", cost: 20, iconName: "waves" },
  { id: "sp-4", title: "Freizeitpark", category: "special", cost: 50, iconName: "rocket" },
  { id: "sp-5", title: "Lieblingsrestaurant besuchen", category: "special", cost: 30, iconName: "utensils-crossed" },
];

const starterRewardIds = ["ma-1", "ac-1", "pr-7", "ac-4"] as const;

export function getRewardsByCategory(category: RewardCategory): RewardSuggestion[] {
  return rewardSuggestions.filter((r) => r.category === category);
}

export function getStarterRewardSuggestions(): RewardSuggestion[] {
  return starterRewardIds
    .map((rewardId) => rewardSuggestions.find((reward) => reward.id === rewardId))
    .filter((reward): reward is RewardSuggestion => Boolean(reward));
}
