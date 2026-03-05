import type { RoutineTemplate, RoutineCategory, AgeGroup, TimeOfDay } from "@/lib/types";

export const routineTemplates: RoutineTemplate[] = [
  // 1. Morgenroutine (Schultag)
  {
    id: "morning-school",
    name: "Morgenroutine (Schultag)",
    description: "Alles was dein Kind morgens vor der Schule erledigen sollte.",
    category: "hygiene",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "morning",
    suggestedTime: "06:30",
    color: "hsl(38, 92%, 50%)",
    tasks: [
      { title: "Aufstehen", iconName: "sunrise", stars: 1 },
      { title: "Bett machen", iconName: "bed", stars: 1 },
      { title: "Waschen & Anziehen", iconName: "shirt", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Frühstücken", iconName: "croissant", stars: 1 },
      { title: "Schultasche packen", iconName: "backpack", stars: 2 },
    ],
  },
  // 2. Morgenroutine (Wochenende)
  {
    id: "morning-weekend",
    name: "Morgenroutine (Wochenende)",
    description: "Entspannter Start in den freien Tag.",
    category: "hygiene",
    ageGroups: ["3-5", "6-8", "9-12"],
    timeOfDay: "morning",
    suggestedTime: "08:00",
    color: "hsl(38, 92%, 50%)",
    tasks: [
      { title: "Aufstehen", iconName: "sun", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Anziehen", iconName: "shirt", stars: 1 },
      { title: "Frühstücken", iconName: "croissant", stars: 1 },
      { title: "Zimmer aufräumen", iconName: "home", stars: 2, timerInMinutes: 10 },
    ],
  },
  // 3. Morgenroutine (Ferien)
  {
    id: "morning-vacation",
    name: "Morgenroutine (Ferien)",
    description: "Lockere Routine für die Ferienzeit.",
    category: "hygiene",
    ageGroups: ["3-5", "6-8", "9-12"],
    timeOfDay: "morning",
    suggestedTime: "09:00",
    color: "hsl(38, 92%, 50%)",
    tasks: [
      { title: "Aufstehen & Strecken", iconName: "sun", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Anziehen", iconName: "shirt", stars: 1 },
      { title: "Frühstücken", iconName: "croissant", stars: 1 },
    ],
  },
  // 4. Abendroutine (mit Bad)
  {
    id: "evening-bath",
    name: "Abendroutine (mit Bad)",
    description: "Gemütliche Abendroutine mit Baden oder Duschen.",
    category: "evening",
    ageGroups: ["3-5", "6-8"],
    timeOfDay: "evening",
    suggestedTime: "18:30",
    color: "hsl(255, 82%, 60%)",
    tasks: [
      { title: "Spielzeug aufräumen", iconName: "toy-brick", stars: 2, timerInMinutes: 10 },
      { title: "Baden / Duschen", iconName: "bath", stars: 1 },
      { title: "Schlafanzug anziehen", iconName: "shirt", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Gute-Nacht-Geschichte", iconName: "book-open", stars: 1 },
      { title: "Licht aus & Kuscheln", iconName: "moon", stars: 1 },
    ],
  },
  // 5. Abendroutine (ohne Bad)
  {
    id: "evening-no-bath",
    name: "Abendroutine (ohne Bad)",
    description: "Schnelle Abendroutine an Tagen ohne Baden.",
    category: "evening",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "evening",
    suggestedTime: "19:00",
    color: "hsl(255, 82%, 60%)",
    tasks: [
      { title: "Zimmer aufräumen", iconName: "home", stars: 2, timerInMinutes: 10 },
      { title: "Schlafanzug anziehen", iconName: "shirt", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Lesen oder Hörspiel", iconName: "book-open", stars: 1 },
      { title: "Licht aus", iconName: "moon", stars: 1 },
    ],
  },
  // 6. Abendroutine (Kleinkind)
  {
    id: "evening-toddler",
    name: "Abendroutine (Kleinkind)",
    description: "Einfache Abendroutine für die Kleinsten.",
    category: "evening",
    ageGroups: ["3-5"],
    timeOfDay: "evening",
    suggestedTime: "18:00",
    color: "hsl(255, 82%, 60%)",
    tasks: [
      { title: "Spielzeug aufräumen", iconName: "toy-brick", stars: 1, timerInMinutes: 5 },
      { title: "Hände waschen", iconName: "droplets", stars: 1 },
      { title: "Schlafanzug anziehen", iconName: "shirt", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Geschichte vorlesen", iconName: "book-open", stars: 1 },
    ],
  },
  // 7. Abendroutine (Schulkind)
  {
    id: "evening-schoolkid",
    name: "Abendroutine (Schulkind)",
    description: "Strukturierte Abendroutine für Schulkinder.",
    category: "evening",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "evening",
    suggestedTime: "19:30",
    color: "hsl(255, 82%, 60%)",
    tasks: [
      { title: "Schultasche für morgen packen", iconName: "backpack", stars: 2 },
      { title: "Kleidung rauslegen", iconName: "shirt", stars: 1 },
      { title: "Zimmer aufräumen", iconName: "home", stars: 2, timerInMinutes: 10 },
      { title: "Duschen", iconName: "shower-head", stars: 1 },
      { title: "Zähne putzen", iconName: "tooth", stars: 1 },
      { title: "Lesen", iconName: "book-text", stars: 1, timerInMinutes: 15 },
      { title: "Licht aus", iconName: "moon", stars: 1 },
    ],
  },
  // 8. Hausaufgaben
  {
    id: "homework",
    name: "Hausaufgaben",
    description: "Strukturierter Ablauf für die Hausaufgabenzeit.",
    category: "school",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "afternoon",
    suggestedTime: "14:30",
    color: "hsl(210, 80%, 55%)",
    tasks: [
      { title: "Hände waschen", iconName: "droplets", stars: 1 },
      { title: "Arbeitsplatz vorbereiten", iconName: "pencil-line", stars: 1 },
      { title: "Hausaufgaben machen", iconName: "book-text", stars: 2, timerInMinutes: 30 },
      { title: "Hefte einpacken", iconName: "backpack", stars: 1 },
      { title: "Aufräumen", iconName: "home", stars: 1 },
    ],
  },
  // 9. Haushalt
  {
    id: "household",
    name: "Haushalt",
    description: "Kleine Aufgaben im Haushalt, die Kinder übernehmen können.",
    category: "household",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "flexible",
    color: "hsl(150, 60%, 45%)",
    tasks: [
      { title: "Zimmer aufräumen", iconName: "home", stars: 2, timerInMinutes: 15 },
      { title: "Tisch decken", iconName: "utensils-crossed", stars: 1 },
      { title: "Geschirrspüler ausräumen", iconName: "sparkles", stars: 2 },
      { title: "Müll rausbringen", iconName: "refresh-ccw", stars: 2 },
      { title: "Staub wischen", iconName: "broom", stars: 2 },
      { title: "Wäsche zusammenlegen", iconName: "shirt", stars: 2 },
    ],
  },
  // 10. Sport-Vorbereitung
  {
    id: "sport-prep",
    name: "Sport-Vorbereitung",
    description: "Alles Wichtige vor dem Training oder Sportverein.",
    category: "sport",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "afternoon",
    suggestedTime: "15:00",
    color: "hsl(0, 75%, 55%)",
    tasks: [
      { title: "Sporttasche packen", iconName: "backpack", stars: 1 },
      { title: "Sportkleidung anziehen", iconName: "shirt", stars: 1 },
      { title: "Trinkflasche füllen", iconName: "glass-water", stars: 1 },
      { title: "Snack einpacken", iconName: "apple", stars: 1 },
      { title: "Schuhe bereitstellen", iconName: "dumbbell", stars: 1 },
    ],
  },
  // 11. Mahlzeiten-Helfer
  {
    id: "meals",
    name: "Mahlzeiten-Helfer",
    description: "Aufgaben rund ums Essen, die Kinder übernehmen können.",
    category: "meals",
    ageGroups: ["3-5", "6-8", "9-12"],
    timeOfDay: "flexible",
    color: "hsl(25, 85%, 55%)",
    tasks: [
      { title: "Hände waschen", iconName: "droplets", stars: 1 },
      { title: "Tisch decken", iconName: "utensils-crossed", stars: 1 },
      { title: "Beim Kochen helfen", iconName: "utensils-crossed", stars: 2 },
      { title: "Tisch abräumen", iconName: "sparkles", stars: 1 },
      { title: "Abtrocknen helfen", iconName: "droplets", stars: 2 },
    ],
  },
  // 12. Wochenend-Routine
  {
    id: "weekend",
    name: "Wochenend-Routine",
    description: "Spaßige Aufgaben fürs Wochenende.",
    category: "weekend",
    ageGroups: ["3-5", "6-8", "9-12"],
    timeOfDay: "flexible",
    color: "hsl(180, 60%, 45%)",
    tasks: [
      { title: "Bett machen", iconName: "bed", stars: 1 },
      { title: "Zimmer aufräumen", iconName: "home", stars: 2, timerInMinutes: 15 },
      { title: "Draußen spielen", iconName: "tree-pine", stars: 1, timerInMinutes: 30 },
      { title: "Kreativ sein", iconName: "palette", stars: 1 },
      { title: "Lesen oder Malen", iconName: "book-open", stars: 1 },
      { title: "Beim Haushalt helfen", iconName: "broom", stars: 2 },
    ],
  },
  // 13. Koffer packen
  {
    id: "packing",
    name: "Koffer packen",
    description: "Checkliste für die Reisevorbereitung.",
    category: "special",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "flexible",
    color: "hsl(320, 70%, 55%)",
    tasks: [
      { title: "Kleidung einpacken", iconName: "shirt", stars: 2 },
      { title: "Zahnbürste & Hygiene", iconName: "tooth", stars: 1 },
      { title: "Lieblingsspielzeug", iconName: "toy-brick", stars: 1 },
      { title: "Bücher / Spiele", iconName: "book-open", stars: 1 },
      { title: "Trinkflasche", iconName: "glass-water", stars: 1 },
      { title: "Kuscheltier", iconName: "heart", stars: 1 },
    ],
  },
  // 14. Geburtstag vorbereiten
  {
    id: "birthday-prep",
    name: "Geburtstag vorbereiten",
    description: "Alles für den besonderen Tag vorbereiten.",
    category: "special",
    ageGroups: ["3-5", "6-8", "9-12"],
    timeOfDay: "flexible",
    color: "hsl(320, 70%, 55%)",
    tasks: [
      { title: "Zimmer dekorieren", iconName: "sparkles", stars: 2 },
      { title: "Tisch festlich decken", iconName: "utensils-crossed", stars: 1 },
      { title: "Geschenke basteln", iconName: "scissors", stars: 2 },
      { title: "Geburtstagskarte malen", iconName: "palette", stars: 2 },
      { title: "Aufräumen für Gäste", iconName: "home", stars: 2, timerInMinutes: 15 },
    ],
  },
  // 15. Nach-Hause-kommen
  {
    id: "coming-home",
    name: "Nach-Hause-kommen",
    description: "Was nach der Schule oder dem Kindergarten zu tun ist.",
    category: "school",
    ageGroups: ["6-8", "9-12"],
    timeOfDay: "afternoon",
    suggestedTime: "13:30",
    color: "hsl(210, 80%, 55%)",
    tasks: [
      { title: "Schuhe ausziehen", iconName: "home", stars: 1 },
      { title: "Hände waschen", iconName: "droplets", stars: 1 },
      { title: "Brotdose auspacken", iconName: "backpack", stars: 1 },
      { title: "Jacke aufhängen", iconName: "shirt", stars: 1 },
      { title: "Mittag essen", iconName: "utensils-crossed", stars: 1 },
      { title: "Kurze Pause", iconName: "armchair", stars: 1, timerInMinutes: 15 },
    ],
  },
];

function getPreferredTimeOfDay(): TimeOfDay {
  const currentHour = new Date().getHours();

  if (currentHour < 11) {
    return "morning";
  }

  if (currentHour < 17) {
    return "afternoon";
  }

  return "evening";
}

export function getRecommendedRoutineTemplates(
  ageGroup?: AgeGroup,
  limit = 3
): RoutineTemplate[] {
  const preferredTime = getPreferredTimeOfDay();
  const filteredTemplates = ageGroup
    ? routineTemplates.filter((template) => template.ageGroups.includes(ageGroup))
    : routineTemplates;

  const scoredTemplates = filteredTemplates.map((template, index) => {
    let score = 0;

    if (template.timeOfDay === preferredTime) {
      score += 4;
    } else if (template.timeOfDay === "flexible") {
      score += 2;
    }

    if (
      (preferredTime === "morning" && template.category === "hygiene") ||
      (preferredTime === "afternoon" && template.category === "school") ||
      (preferredTime === "evening" && template.category === "evening")
    ) {
      score += 3;
    }

    if (template.ageGroups.includes("3-5")) {
      score += 0.2;
    }

    return {
      template,
      score,
      index,
    };
  });

  return scoredTemplates
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    })
    .slice(0, limit)
    .map((entry) => entry.template);
}

export function getTemplatesByCategory(category: RoutineCategory): RoutineTemplate[] {
  return routineTemplates.filter((t) => t.category === category);
}

export function getTemplatesForAge(age: AgeGroup): RoutineTemplate[] {
  return routineTemplates.filter((t) => t.ageGroups.includes(age));
}

export function getTemplatesByTimeOfDay(time: TimeOfDay): RoutineTemplate[] {
  return routineTemplates.filter((t) => t.timeOfDay === time);
}
