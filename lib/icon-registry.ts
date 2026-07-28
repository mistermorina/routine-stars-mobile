import type { IconEntry, IconCategory } from "@/lib/types";

export const iconCategories: { id: IconCategory; label: string; iconName: string }[] = [
  { id: "hygiene", label: "Hygiene", iconName: "droplets" },
  { id: "clothing", label: "Anziehen", iconName: "shirt" },
  { id: "meals", label: "Mahlzeiten", iconName: "utensils-crossed" },
  { id: "school", label: "Schule", iconName: "book-open" },
  { id: "household", label: "Haushalt", iconName: "broom" },
  { id: "leisure", label: "Freizeit", iconName: "gamepad-2" },
  { id: "sport", label: "Sport", iconName: "dumbbell" },
  { id: "bedtime", label: "Schlafenszeit", iconName: "moon" },
  { id: "time", label: "Zeit", iconName: "clock" },
  { id: "rewards", label: "Belohnungen", iconName: "gift" },
  { id: "general", label: "Allgemein", iconName: "sparkles" },
];

export const iconEntries: IconEntry[] = [
  // Hygiene (6+)
  { name: "tooth", label: "Zähne putzen", category: "hygiene" },
  { name: "droplets", label: "Händewaschen", category: "hygiene" },
  { name: "shower-head", label: "Duschen", category: "hygiene" },
  { name: "bath", label: "Baden", category: "hygiene" },
  { name: "scissors", label: "Haare kämmen", category: "hygiene" },
  { name: "smile", label: "Gesicht waschen", category: "hygiene" },

  // Clothing (3+)
  { name: "shirt", label: "Anziehen", category: "clothing" },
  { name: "backpack", label: "Rucksack", category: "clothing" },

  // Meals (8+)
  { name: "croissant", label: "Frühstück", category: "meals" },
  { name: "apple", label: "Obst/Snack", category: "meals" },
  { name: "pizza", label: "Mittagessen", category: "meals" },
  { name: "sandwich", label: "Brotzeit", category: "meals" },
  { name: "cookie", label: "Keks/Nachtisch", category: "meals" },
  { name: "grape", label: "Obst", category: "meals" },
  { name: "glass-water", label: "Trinken", category: "meals" },
  { name: "utensils-crossed", label: "Essen", category: "meals" },

  // School (5+)
  { name: "book-open", label: "Lesen", category: "school" },
  { name: "book-text", label: "Hausaufgaben", category: "school" },
  { name: "pencil-line", label: "Schreiben", category: "school" },
  { name: "globe", label: "Lernen", category: "school" },
  { name: "palette", label: "Malen", category: "school" },

  // Household (5+)
  { name: "broom", label: "Aufräumen", category: "household" },
  { name: "toy-brick", label: "Spielzeug aufräumen", category: "household" },
  { name: "bed", label: "Bett machen", category: "household" },
  { name: "dog", label: "Haustier versorgen", category: "household" },
  { name: "hand-heart", label: "Helfen", category: "household" },

  // Leisure (6+)
  { name: "gamepad-2", label: "Spielen", category: "leisure" },
  { name: "tv", label: "Fernsehen", category: "leisure" },
  { name: "music", label: "Musik", category: "leisure" },
  { name: "camera", label: "Foto/Video", category: "leisure" },
  { name: "heart", label: "Kuscheln", category: "leisure" },
  { name: "tree-pine", label: "Draußen spielen", category: "leisure" },

  // Sport (4+)
  { name: "bike", label: "Radfahren", category: "sport" },
  { name: "dumbbell", label: "Sport", category: "sport" },
  { name: "waves", label: "Schwimmen", category: "sport" },
  { name: "zap", label: "Bewegung", category: "sport" },

  // Bedtime (5+)
  { name: "moon", label: "Schlafenszeit", category: "bedtime" },
  { name: "lamp", label: "Licht aus", category: "bedtime" },
  { name: "armchair", label: "Schlafanzug", category: "bedtime" },
  { name: "sunrise", label: "Aufstehen", category: "bedtime" },
  { name: "sun", label: "Guten Morgen", category: "bedtime" },

  // Time (3+)
  { name: "clock", label: "Uhrzeit", category: "time" },
  { name: "bell", label: "Erinnerung", category: "time" },
  { name: "calendar-days", label: "Kalender", category: "time" },

  // Rewards (5+)
  { name: "star", label: "Stern", category: "rewards" },
  { name: "trophy", label: "Pokal", category: "rewards" },
  { name: "award", label: "Auszeichnung", category: "rewards" },
  { name: "gift", label: "Geschenk", category: "rewards" },
  { name: "sparkles", label: "Besonders", category: "rewards" },
  { name: "rocket", label: "Super", category: "rewards" },

  // General (5+)
  { name: "check", label: "Erledigt", category: "general" },
  { name: "circle-check", label: "Abgehakt", category: "general" },
  { name: "home", label: "Zuhause", category: "general" },
  { name: "paw-print", label: "Tier", category: "general" },
  { name: "shield", label: "Sicherheit", category: "general" },
];

export function getIconsByCategory(category: IconCategory): IconEntry[] {
  return iconEntries.filter((e) => e.category === category);
}

export function searchIcons(query: string): IconEntry[] {
  const q = query.toLowerCase();
  return iconEntries.filter(
    (e) => e.label.toLowerCase().includes(q) || e.name.toLowerCase().includes(q)
  );
}

export function getAllIconNames(): string[] {
  return iconEntries.map((e) => e.name);
}
