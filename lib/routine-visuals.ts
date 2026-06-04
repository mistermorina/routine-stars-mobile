import type { ImageSourcePropType } from "react-native";
import type { Routine } from "@/lib/types";
import routineMorningSunImage from "@/assets/images/routine-morning-sun-soft.png";
import routineEveningMoonImage from "@/assets/images/routine-evening-moon-soft.png";
import routineTrophyImage from "@/assets/images/routine-trophy-soft.png";
import rewardStarGiftImage from "@/assets/images/reward-star-gift-soft.png";
import routineHomeworkImage from "@/assets/images/routine-homework-soft.png";
import routineSportImage from "@/assets/images/routine-sport-soft.png";
import routineCleanupImage from "@/assets/images/routine-cleanup-soft.png";
import routineHygieneImage from "@/assets/images/routine-hygiene-soft.png";
import routineWeekendImage from "@/assets/images/routine-weekend-soft.png";
import routineMealsImage from "@/assets/images/routine-meals-soft.png";
import routineSpecialImage from "@/assets/images/routine-special-soft.png";

type RoutineVisualKey =
  | "morning"
  | "evening"
  | "school"
  | "sport"
  | "cleanup"
  | "hygiene"
  | "meals"
  | "weekend"
  | "special"
  | "generic";

export interface RoutineVisual {
  accent: string;
  accentSoft: string;
  art: ImageSourcePropType;
  completionArt: ImageSourcePropType;
  completionTitle: string;
  completionText: string;
}

const ROUTINE_VISUALS: Record<RoutineVisualKey, RoutineVisual> = {
  morning: {
    accent: "#F7941D",
    accentSoft: "#FFF4DD",
    art: routineMorningSunImage,
    completionArt: routineTrophyImage,
    completionTitle: "Fantastisch!",
    completionText: "Du hast deine Morgenroutine abgeschlossen!",
  },
  evening: {
    accent: "#7C55E7",
    accentSoft: "#F3EEFF",
    art: routineEveningMoonImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Gut gemacht!",
    completionText: "Schlaf schön und träum was Wunderbares!",
  },
  school: {
    accent: "#2F6FDC",
    accentSoft: "#EAF3FF",
    art: routineHomeworkImage,
    completionArt: routineTrophyImage,
    completionTitle: "Stark gelernt!",
    completionText: "Deine Schulaufgaben sind geschafft.",
  },
  sport: {
    accent: "#E35D5B",
    accentSoft: "#FFF0EF",
    art: routineSportImage,
    completionArt: routineTrophyImage,
    completionTitle: "Stark bewegt!",
    completionText: "Training und Vorbereitung sind erledigt.",
  },
  cleanup: {
    accent: "#2F8E73",
    accentSoft: "#EAF8F0",
    art: routineCleanupImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Ordnung geschafft!",
    completionText: "Alles ist wieder an seinem Platz.",
  },
  hygiene: {
    accent: "#4C9CB9",
    accentSoft: "#EAF8FF",
    art: routineHygieneImage,
    completionArt: routineTrophyImage,
    completionTitle: "Frisch gemacht!",
    completionText: "Waschen, Zähne und Pflege sind erledigt.",
  },
  meals: {
    accent: "#E8893A",
    accentSoft: "#FFF0E4",
    art: routineMealsImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Fein geholfen!",
    completionText: "Rund ums Essen ist alles geschafft.",
  },
  weekend: {
    accent: "#2E9AA3",
    accentSoft: "#E8F8F8",
    art: routineWeekendImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Schöner Tag!",
    completionText: "Deine Wochenend-Aufgaben sind erledigt.",
  },
  special: {
    accent: "#D867A8",
    accentSoft: "#FFF0F8",
    art: routineSpecialImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Besonders gut!",
    completionText: "Diese Extra-Routine ist abgeschlossen.",
  },
  generic: {
    accent: "#245A74",
    accentSoft: "#F6FAFF",
    art: rewardStarGiftImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Stark gemacht!",
    completionText: "Diese Routine ist komplett geschafft.",
  },
};

const ROUTINE_KEYWORDS: Array<{
  key: RoutineVisualKey;
  words: string[];
}> = [
  {
    key: "evening",
    words: ["abend", "nacht", "schlaf", "bett", "licht aus", "schlafanzug", "kuscheln"],
  },
  {
    key: "morning",
    words: ["morgen", "aufstehen", "frühstück", "fruehstueck", "schultag", "wochenende morgens"],
  },
  {
    key: "school",
    words: [
      "hausaufgaben",
      "schule",
      "schultasche",
      "heft",
      "lernen",
      "lesen",
      "book-text",
      "book-open",
      "backpack",
      "pencil",
    ],
  },
  {
    key: "sport",
    words: ["sport", "training", "bewegung", "dumbbell", "glass-water", "trinkflasche", "schuhe"],
  },
  {
    key: "cleanup",
    words: [
      "haushalt",
      "aufräumen",
      "aufraeumen",
      "zimmer",
      "putzen",
      "wischen",
      "müll",
      "muell",
      "broom",
      "sparkles",
    ],
  },
  {
    key: "meals",
    words: ["mahlzeit", "essen", "kochen", "tisch", "geschirr", "croissant", "apple", "utensils"],
  },
  {
    key: "special",
    words: ["koffer", "reise", "packen", "geburtstag", "gäste", "gaeste", "geschenk", "special"],
  },
  {
    key: "weekend",
    words: ["wochenend", "draußen", "draussen", "kreativ", "malen", "palette", "tree-pine"],
  },
  {
    key: "hygiene",
    words: ["hygiene", "zähne", "zaehne", "waschen", "duschen", "baden", "tooth", "droplets", "bath"],
  },
];

const ROUTINE_NAME_KEYWORDS = [
  { key: "evening", words: ["abend", "nacht"] },
  { key: "morning", words: ["morgen"] },
  { key: "school", words: ["hausaufgaben", "schule", "school", "coming-home"] },
  { key: "sport", words: ["sport", "training"] },
  { key: "meals", words: ["mahlzeit", "meals", "essen"] },
  { key: "special", words: ["koffer", "reise", "geburtstag", "birthday", "packing"] },
  { key: "weekend", words: ["wochenend", "weekend"] },
  { key: "cleanup", words: ["haushalt", "household", "aufräumen", "aufraeumen"] },
  { key: "hygiene", words: ["hygiene", "zähne", "zaehne", "waschen"] },
] satisfies Array<{ key: RoutineVisualKey; words: string[] }>;

function routineSearchText(routine: Routine): string {
  return [
    routine.name,
    routine.id,
    ...routine.tasks.flatMap((task) => [task.title, task.iconName]),
  ]
    .join(" ")
    .toLowerCase();
}

function classifyRoutine(routine: Routine): RoutineVisualKey {
  const nameText = `${routine.name} ${routine.id}`.toLowerCase();
  const nameMatch = ROUTINE_NAME_KEYWORDS.find(({ words }) =>
    words.some((word) => nameText.includes(word))
  );

  if (nameMatch) {
    return nameMatch.key;
  }

  const searchText = routineSearchText(routine);

  const match = ROUTINE_KEYWORDS.find(({ words }) =>
    words.some((word) => searchText.includes(word))
  );

  return match?.key ?? "generic";
}

export function getRoutineVisual(routine: Routine, fallbackAccent: string): RoutineVisual {
  const key = classifyRoutine(routine);
  const visual = ROUTINE_VISUALS[key];

  if (key === "generic" && routine.color) {
    return {
      ...visual,
      accent: routine.color,
    };
  }

  if (key === "generic") {
    return {
      ...visual,
      accent: fallbackAccent,
    };
  }

  return visual;
}
