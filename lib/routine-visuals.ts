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
import {
  getCardGradient,
  getCtaGradient,
  getOnCardColor,
  resolveHue,
  type HueId,
  type ScreenRamp,
} from "@/lib/gradients";

export type RoutineVisualKey =
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
  hue: HueId;
  /** AA-safe functional accent for icons, progress and small labels. */
  accent: string;
  accentStrong: string;
  accentSoft: string;
  cardGradient: ScreenRamp;
  onCard: string;
  art: ImageSourcePropType;
  completionArt: ImageSourcePropType;
  completionTitle: string;
  completionText: string;
}

interface RoutineVisualDefinition {
  hue: HueId;
  art: ImageSourcePropType;
  completionArt: ImageSourcePropType;
  completionTitle: string;
  completionText: string;
}

const ROUTINE_VISUALS: Record<RoutineVisualKey, RoutineVisualDefinition> = {
  morning: {
    hue: "amber",
    art: routineMorningSunImage,
    completionArt: routineTrophyImage,
    completionTitle: "Fantastisch!",
    completionText: "Du hast deine Morgenroutine abgeschlossen!",
  },
  evening: {
    hue: "violet",
    art: routineEveningMoonImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Gut gemacht!",
    completionText: "Schlaf schön und träum was Wunderbares!",
  },
  school: {
    hue: "blue",
    art: routineHomeworkImage,
    completionArt: routineTrophyImage,
    completionTitle: "Stark gelernt!",
    completionText: "Deine Schulaufgaben sind geschafft.",
  },
  sport: {
    hue: "coral",
    art: routineSportImage,
    completionArt: routineTrophyImage,
    completionTitle: "Stark bewegt!",
    completionText: "Training und Vorbereitung sind erledigt.",
  },
  cleanup: {
    hue: "green",
    art: routineCleanupImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Ordnung geschafft!",
    completionText: "Alles ist wieder an seinem Platz.",
  },
  hygiene: {
    hue: "cyan",
    art: routineHygieneImage,
    completionArt: routineTrophyImage,
    completionTitle: "Frisch gemacht!",
    completionText: "Waschen, Zähne und Pflege sind erledigt.",
  },
  meals: {
    hue: "amber",
    art: routineMealsImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Fein geholfen!",
    completionText: "Rund ums Essen ist alles geschafft.",
  },
  weekend: {
    hue: "lime",
    art: routineWeekendImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Schöner Tag!",
    completionText: "Deine Wochenend-Aufgaben sind erledigt.",
  },
  special: {
    hue: "magenta",
    art: routineSpecialImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Besonders gut!",
    completionText: "Diese Extra-Routine ist abgeschlossen.",
  },
  generic: {
    hue: "blue",
    art: rewardStarGiftImage,
    completionArt: rewardStarGiftImage,
    completionTitle: "Stark gemacht!",
    completionText: "Diese Routine ist komplett geschafft.",
  },
};

const ROUTINE_KEYWORDS: {
  key: RoutineVisualKey;
  words: string[];
}[] = [
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
] satisfies { key: RoutineVisualKey; words: string[] }[];

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

/** Category of a routine (name/task keyword heuristic) — used for filtering. */
export function getRoutineCategory(routine: Routine): RoutineVisualKey {
  return classifyRoutine(routine);
}

export function getRoutineVisual(routine: Routine, fallbackAccent: string): RoutineVisual {
  const key = classifyRoutine(routine);
  const definition = ROUTINE_VISUALS[key];
  // Classified routines keep their semantic colour (morning = amber, evening
  // = violet, ...). Only a generic routine consults the parent's stored swatch.
  // Old hex and HSL values are mapped at read time; storage is never rewritten.
  const hue =
    key === "generic"
      ? resolveHue(routine.color ?? fallbackAccent)
      : definition.hue;
  const cta = getCtaGradient(hue);
  const cardGradient = getCardGradient(hue);

  return {
    ...definition,
    hue,
    accent: cta.from,
    accentStrong: cta.to,
    accentSoft: cardGradient.colors[2],
    cardGradient,
    onCard: getOnCardColor(),
  };
}
