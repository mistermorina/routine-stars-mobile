import type { TaskSuggestion, TimeOfDay, AgeGroup } from "@/lib/types";

interface TaskEntry extends TaskSuggestion {
  keywords: string[];
  timeOfDay?: TimeOfDay[];
}

const taskDatabase: TaskEntry[] = [
  // --- Hygiene ---
  { title: "Zähne putzen", iconName: "tooth", stars: 1, keywords: ["morgen", "abend", "hygiene", "bad", "pflege"], timeOfDay: ["morning", "evening"], relevanceScore: 0 },
  { title: "Hände waschen", iconName: "droplets", stars: 1, keywords: ["hygiene", "morgen", "essen", "kochen", "mahlzeit", "nach-hause"], timeOfDay: ["morning", "afternoon"], relevanceScore: 0 },
  { title: "Haare kämmen", iconName: "smile", stars: 1, keywords: ["morgen", "hygiene", "pflege", "fertig"], timeOfDay: ["morning"], relevanceScore: 0 },
  { title: "Duschen", iconName: "shower-head", stars: 1, keywords: ["abend", "hygiene", "bad", "sport", "pflege"], timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Baden", iconName: "bath", stars: 1, keywords: ["abend", "bad", "hygiene", "pflege"], timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Gesicht waschen", iconName: "droplets", stars: 1, keywords: ["morgen", "hygiene", "pflege"], timeOfDay: ["morning"], relevanceScore: 0 },

  // --- Getting dressed / Bedroom ---
  { title: "Anziehen", iconName: "shirt", stars: 1, keywords: ["morgen", "anziehen", "kleidung", "fertig"], timeOfDay: ["morning"], relevanceScore: 0 },
  { title: "Schlafanzug anziehen", iconName: "shirt", stars: 1, keywords: ["abend", "schlaf", "bett", "nacht"], timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Bett machen", iconName: "bed", stars: 1, keywords: ["morgen", "zimmer", "aufräumen", "ordnung"], timeOfDay: ["morning"], relevanceScore: 0 },
  { title: "Kleidung rauslegen", iconName: "shirt", stars: 1, keywords: ["abend", "vorbereitung", "morgen", "schule"], timeOfDay: ["evening"], relevanceScore: 0 },

  // --- Meals ---
  { title: "Frühstücken", iconName: "croissant", stars: 1, keywords: ["morgen", "frühstück", "essen", "mahlzeit"], timeOfDay: ["morning"], relevanceScore: 0 },
  { title: "Mittag essen", iconName: "utensils-crossed", stars: 1, keywords: ["mittag", "essen", "mahlzeit", "nach-hause"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Abendessen", iconName: "utensils-crossed", stars: 1, keywords: ["abend", "essen", "mahlzeit"], timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Tisch decken", iconName: "utensils-crossed", stars: 1, keywords: ["essen", "mahlzeit", "haushalt", "helfen", "tisch"], timeOfDay: ["morning", "afternoon", "evening"], relevanceScore: 0 },
  { title: "Tisch abräumen", iconName: "sparkles", stars: 1, keywords: ["essen", "mahlzeit", "haushalt", "helfen", "tisch", "aufräumen"], timeOfDay: ["morning", "afternoon", "evening"], relevanceScore: 0 },
  { title: "Brotdose auspacken", iconName: "backpack", stars: 1, keywords: ["nach-hause", "schule", "mittag"], timeOfDay: ["afternoon"], relevanceScore: 0 },

  // --- School ---
  { title: "Schultasche packen", iconName: "backpack", stars: 2, keywords: ["schule", "morgen", "abend", "vorbereitung", "hausaufgaben"], timeOfDay: ["morning", "evening"], relevanceScore: 0 },
  { title: "Hausaufgaben machen", iconName: "book-text", stars: 2, keywords: ["hausaufgaben", "schule", "lernen", "nachmittag"], timerInMinutes: 30, timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Arbeitsplatz vorbereiten", iconName: "pencil-line", stars: 1, keywords: ["hausaufgaben", "schule", "lernen"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Hefte einpacken", iconName: "backpack", stars: 1, keywords: ["hausaufgaben", "schule"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Lesen üben", iconName: "book-open", stars: 1, keywords: ["schule", "lernen", "lesen", "abend"], timerInMinutes: 15, timeOfDay: ["afternoon", "evening"], relevanceScore: 0 },

  // --- Household ---
  { title: "Zimmer aufräumen", iconName: "home", stars: 2, keywords: ["aufräumen", "zimmer", "haushalt", "ordnung", "wochenende"], timerInMinutes: 15, timeOfDay: ["morning", "afternoon", "evening"], relevanceScore: 0 },
  { title: "Spielzeug aufräumen", iconName: "toy-brick", stars: 2, keywords: ["aufräumen", "spielzeug", "abend", "ordnung"], timerInMinutes: 10, timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Müll rausbringen", iconName: "refresh-ccw", stars: 2, keywords: ["haushalt", "helfen", "müll"], relevanceScore: 0 },
  { title: "Staub wischen", iconName: "broom", stars: 2, keywords: ["haushalt", "putzen", "sauber"], relevanceScore: 0 },
  { title: "Wäsche zusammenlegen", iconName: "shirt", stars: 2, keywords: ["haushalt", "wäsche", "helfen"], relevanceScore: 0 },
  { title: "Blumen gießen", iconName: "droplets", stars: 1, keywords: ["haushalt", "garten", "helfen", "pflanze"], relevanceScore: 0 },
  { title: "Geschirrspüler ausräumen", iconName: "sparkles", stars: 2, keywords: ["haushalt", "küche", "helfen", "geschirr"], relevanceScore: 0 },

  // --- Bedtime ---
  { title: "Gute-Nacht-Geschichte", iconName: "book-open", stars: 1, keywords: ["abend", "schlaf", "nacht", "bett", "geschichte"], timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Licht aus", iconName: "moon", stars: 1, keywords: ["abend", "schlaf", "nacht", "bett"], timeOfDay: ["evening"], relevanceScore: 0 },
  { title: "Kuscheln", iconName: "heart", stars: 1, keywords: ["abend", "nacht", "bett", "schlaf"], timeOfDay: ["evening"], relevanceScore: 0 },

  // --- Sport ---
  { title: "Sporttasche packen", iconName: "backpack", stars: 1, keywords: ["sport", "training", "vorbereitung", "verein"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Sportkleidung anziehen", iconName: "shirt", stars: 1, keywords: ["sport", "training", "umziehen"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Trinkflasche füllen", iconName: "glass-water", stars: 1, keywords: ["sport", "trinken", "vorbereitung", "schule"], relevanceScore: 0 },
  { title: "Aufwärmen", iconName: "dumbbell", stars: 1, keywords: ["sport", "training", "bewegung"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Draußen spielen", iconName: "tree-pine", stars: 1, keywords: ["sport", "draußen", "bewegung", "wochenende", "spielen"], timerInMinutes: 30, relevanceScore: 0 },
  { title: "Fahrrad fahren", iconName: "bike", stars: 1, keywords: ["sport", "draußen", "bewegung", "fahrrad"], relevanceScore: 0 },

  // --- Creative ---
  { title: "Malen oder Basteln", iconName: "palette", stars: 1, keywords: ["kreativ", "wochenende", "freizeit", "malen", "basteln"], relevanceScore: 0 },

  // --- Miscellaneous ---
  { title: "Schuhe ausziehen", iconName: "home", stars: 1, keywords: ["nach-hause", "ankommen"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Jacke aufhängen", iconName: "shirt", stars: 1, keywords: ["nach-hause", "ankommen", "ordnung"], timeOfDay: ["afternoon"], relevanceScore: 0 },
  { title: "Haustier füttern", iconName: "paw-print", stars: 2, keywords: ["haustier", "tier", "füttern", "morgen", "abend"], timeOfDay: ["morning", "evening"], relevanceScore: 0 },
  { title: "Wasser trinken", iconName: "glass-water", stars: 1, keywords: ["trinken", "gesund", "morgen"], timeOfDay: ["morning", "afternoon"], relevanceScore: 0 },
];

export function getSuggestedTasks(
  routineName: string,
  existingTaskTitles: string[],
  timeOfDay?: TimeOfDay,
  _ageGroup?: AgeGroup
): TaskSuggestion[] {
  const nameLower = routineName.toLowerCase();

  return taskDatabase
    .map((task) => {
      let score = 0;

      // Check keyword matches against routine name
      for (const kw of task.keywords) {
        if (nameLower.includes(kw)) {
          score += 10;
        }
      }

      // Time of day match
      if (timeOfDay && task.timeOfDay?.includes(timeOfDay)) {
        score += 5;
      }

      return { ...task, relevanceScore: score };
    })
    .filter((t) => t.relevanceScore > 0)
    .filter((t) => !existingTaskTitles.includes(t.title))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 8)
    .map(({ keywords, timeOfDay: _tod, ...rest }) => rest);
}
