export type OnboardingScreenId =
  | "welcome"
  | "parent-value"
  | "child-play"
  | "stars-routines"
  | "rewards-progress"
  | "parent-safety"
  | "ready";

export type OnboardingVisual =
  | "family"
  | "calm"
  | "child"
  | "routine"
  | "rewards"
  | "safety"
  | "ready";

export type OnboardingIconName =
  | "sparkles"
  | "heart"
  | "star"
  | "listChecks"
  | "gift"
  | "shield"
  | "arrowRight";

export interface OnboardingHighlight {
  title: string;
  description: string;
  iconName: OnboardingIconName;
}

export interface OnboardingJourneyScreen {
  id: OnboardingScreenId;
  stepLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  childLine: string;
  primaryCta: string;
  secondaryCta: string;
  visual: OnboardingVisual;
  highlights: OnboardingHighlight[];
}

export const onboardingPrinciples = [
  "Routinen werden zu kleinen Erfolgen",
  "Kinder sammeln Sterne",
  "Fortschritt wird sichtbar",
  "Belohnungen motivieren",
  "Eltern behalten den Überblick",
] as const;

export const onboardingJourney: OnboardingJourneyScreen[] = [
  {
    id: "welcome",
    stepLabel: "Willkommen",
    eyebrow: "Routine Stars",
    title: "Aus Alltag wird ein kleines Erfolgsspiel.",
    description:
      "Routine Stars hilft Familien, Morgen, Abend und kleine Pflichten freundlicher zu meistern: klar für Eltern, motivierend für Kinder.",
    childLine: "Kinder sehen sofort: Ich schaffe das Schritt für Schritt.",
    primaryCta: "Weiter",
    secondaryCta: "Direkt einrichten",
    visual: "family",
    highlights: [
      {
        title: "Wärmer starten",
        description: "Der Tag beginnt mit Orientierung statt Diskussion.",
        iconName: "heart",
      },
      {
        title: "Kleine Schritte",
        description: "Jede Aufgabe wird sichtbar und machbar.",
        iconName: "listChecks",
      },
    ],
  },
  {
    id: "parent-value",
    stepLabel: "Für Eltern",
    eyebrow: "Mehr Ruhe",
    title: "Weniger Erinnern. Mehr Begleiten.",
    description:
      "Du legst Routinen einmal an und siehst danach schnell, was schon gut läuft. So bleibt mehr Raum für Nähe und weniger Alltagsdruck.",
    childLine: "Eltern behalten den Überblick, ohne jeden Schritt neu erklären zu müssen.",
    primaryCta: "Klingt gut",
    secondaryCta: "Setup starten",
    visual: "calm",
    highlights: [
      {
        title: "Klare Struktur",
        description: "Morgen, Abend, Schule und Zuhause haben feste Abläufe.",
        iconName: "listChecks",
      },
      {
        title: "Sichtbare Entlastung",
        description: "Fortschritt wird sichtbar, bevor es stressig wird.",
        iconName: "sparkles",
      },
    ],
  },
  {
    id: "child-play",
    stepLabel: "Für Kinder",
    eyebrow: "Spielerisch",
    title: "Kinder werden zu Routine Stars.",
    description:
      "Aufgaben fühlen sich wie kleine Missionen an. Fertige Schritte leuchten auf, Sterne wachsen und Erfolg wird sofort spürbar.",
    childLine: "Kinder sammeln Sterne und erleben: Heute habe ich etwas geschafft.",
    primaryCta: "Weiter zur Logik",
    secondaryCta: "Setup starten",
    visual: "child",
    highlights: [
      {
        title: "Sofortiges Feedback",
        description: "Ein erledigter Schritt fühlt sich wie ein kleiner Gewinn an.",
        iconName: "star",
      },
      {
        title: "Kindgerechte Welt",
        description: "Warme Farben, Avatare und Motive machen Lust aufs Mitmachen.",
        iconName: "sparkles",
      },
    ],
  },
  {
    id: "stars-routines",
    stepLabel: "Sterne & Routinen",
    eyebrow: "So funktioniert es",
    title: "Jede Routine besteht aus kleinen Aufgaben.",
    description:
      "Zähne putzen, anziehen, Tasche packen: Du bestimmst die Schritte. Dein Kind hakt sie ab und sammelt dafür Sterne.",
    childLine: "Routinen werden zu kleinen Erfolgen, die jeden Tag erreichbar bleiben.",
    primaryCta: "Belohnungen ansehen",
    secondaryCta: "Setup starten",
    visual: "routine",
    highlights: [
      {
        title: "Aufgaben abhaken",
        description: "Jeder Schritt zeigt klar, was als Nächstes dran ist.",
        iconName: "listChecks",
      },
      {
        title: "Sterne verdienen",
        description: "Sterne machen Anstrengung sichtbar und wertvoll.",
        iconName: "star",
      },
    ],
  },
  {
    id: "rewards-progress",
    stepLabel: "Belohnungen",
    eyebrow: "Motivation",
    title: "Fortschritt führt zu echten kleinen Highlights.",
    description:
      "Gesammelte Sterne können gegen passende Belohnungen eingelöst werden. Fortschritt wird sichtbar und Belohnungen motivieren ohne Druck.",
    childLine: "Ein voller Sternestand sagt: Dranbleiben lohnt sich.",
    primaryCta: "Sicherheit ansehen",
    secondaryCta: "Setup starten",
    visual: "rewards",
    highlights: [
      {
        title: "Belohnungen wählen",
        description: "Von Extra-Vorlesezeit bis Familienausflug ist alles möglich.",
        iconName: "gift",
      },
      {
        title: "Fortschritt sehen",
        description: "Kinder erkennen, wie nah sie ihrem Ziel sind.",
        iconName: "sparkles",
      },
    ],
  },
  {
    id: "parent-safety",
    stepLabel: "Elternbereich",
    eyebrow: "Sicher begleitet",
    title: "Kinder spielen. Eltern steuern.",
    description:
      "Der Elternbereich bleibt getrennt. Einstellungen, Belohnungen und sensible Bereiche sind für Erwachsene gedacht; Familiendaten bleiben lokal auf dem Gerät.",
    childLine: "Kinder brauchen kein eigenes Konto und bleiben in ihrer einfachen Sternenwelt.",
    primaryCta: "Fast fertig",
    secondaryCta: "Setup starten",
    visual: "safety",
    highlights: [
      {
        title: "Elternbereich",
        description: "Verwaltung und Überblick sind klar von der Kinderwelt getrennt.",
        iconName: "shield",
      },
      {
        title: "Lokal starten",
        description: "Der erste Start funktioniert lokal, ohne komplizierte Einrichtung.",
        iconName: "heart",
      },
    ],
  },
  {
    id: "ready",
    stepLabel: "Bereit",
    eyebrow: "Loslegen",
    title: "In wenigen Minuten ist eure erste Routine bereit.",
    description:
      "Lege jetzt ein Kinderprofil an, wähle eine Starter-Routine und starte mit passenden Belohnungen. Danach landet ihr direkt in der App.",
    childLine: "Der erste Stern kann schon heute gesammelt werden.",
    primaryCta: "Familie einrichten",
    secondaryCta: "Nochmal ansehen",
    visual: "ready",
    highlights: [
      {
        title: "Profil",
        description: "Name, Alter, Avatar und Look festlegen.",
        iconName: "heart",
      },
      {
        title: "Routine + Belohnung",
        description: "Vorlagen wählen, anpassen und direkt loslegen.",
        iconName: "arrowRight",
      },
    ],
  },
];
