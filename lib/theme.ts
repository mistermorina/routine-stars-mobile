import type { ViewStyle } from "react-native";

import type { ChildTheme } from "@/lib/types";

export interface ThemePalette {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentStrong: string;
  accentText: string;
  progress: string;
  button: string;
  buttonPressed: string;
  pillText: string;
  surface: string;
  backgroundBase: string;
  screenGradient: [string, string, string];
  cardTint: string;
  heroSurface: string;
  chartPrimary: string;
  chartSecondary: string;
  motifPrimary: string;
  motifSecondary: string;
  tabActiveBg: string;
  headerGlass: string;
  celebrationColors: string[];
}

export const DEFAULT_CHILD_THEME: ChildTheme = "sterne";

export const themePalettes: Record<ChildTheme, ThemePalette> = {
  sterne: {
    accent: "#87CEEB",
    accentSoft: "#E8F7FF",
    accentBorder: "#DCEAF7",
    accentStrong: "#245A74",
    accentText: "#245A74",
    progress: "#FFD700",
    button: "#245A74",
    buttonPressed: "#173E52",
    pillText: "#245A74",
    surface: "#FFF1C8",
    backgroundBase: "#F6FAFF",
    screenGradient: ["#F6FAFF", "#EDF5FF", "#FFF7E6"],
    cardTint: "#FFFFFF",
    heroSurface: "#FFF7E8",
    chartPrimary: "#F7A313",
    chartSecondary: "#245A74",
    motifPrimary: "#FFE7A8",
    motifSecondary: "#DDEEFF",
    tabActiveBg: "#FFF2C8",
    headerGlass: "rgba(246,250,255,0.94)",
    celebrationColors: ["#FFD700", "#87CEEB", "#F8E9D7", "#F6C1E4"],
  },
  tiere: {
    accent: "#5BB68A",
    accentSoft: "#EAF8F0",
    accentBorder: "#B9E2CB",
    accentStrong: "#24543B",
    accentText: "#24543B",
    progress: "#5BB68A",
    button: "#24543B",
    buttonPressed: "#173827",
    pillText: "#24543B",
    surface: "#E2F4E8",
    backgroundBase: "#F8FBF6",
    screenGradient: ["#F8FBF6", "#EAF7EF", "#FFF2E8"],
    cardTint: "#FFFFFF",
    heroSurface: "#EEF7E7",
    chartPrimary: "#5BB68A",
    chartSecondary: "#A95019",
    motifPrimary: "#C9EBCF",
    motifSecondary: "#F8DCC9",
    tabActiveBg: "#E9F8EF",
    headerGlass: "rgba(248,251,246,0.94)",
    celebrationColors: ["#5BB68A", "#F4A261", "#F2D98C", "#B8E3C8"],
  },
  galaxy: {
    accent: "#4F8EDC",
    accentSoft: "#E8F1FF",
    accentBorder: "#B8D2F4",
    accentStrong: "#1E4476",
    accentText: "#1E4476",
    progress: "#4F8EDC",
    button: "#1E4476",
    buttonPressed: "#15345D",
    pillText: "#1E4476",
    surface: "#E5F5FF",
    backgroundBase: "#F6F7FF",
    screenGradient: ["#F6F7FF", "#F2ECFF", "#E7F6FF"],
    cardTint: "#FFFFFF",
    heroSurface: "#F3F5FF",
    chartPrimary: "#4F8EDC",
    chartSecondary: "#5B4BC4",
    motifPrimary: "#CAD6FF",
    motifSecondary: "#E2CCFF",
    tabActiveBg: "#E8EDFF",
    headerGlass: "rgba(246,247,255,0.94)",
    celebrationColors: ["#4F8EDC", "#8B7CF6", "#8AE4FF", "#FFD66B"],
  },
};

export function normalizeChildTheme(theme?: string | null): ChildTheme {
  if (theme === "tiere" || theme === "galaxy" || theme === "sterne") {
    return theme;
  }
  return DEFAULT_CHILD_THEME;
}

export function getThemePalette(theme?: string | null): ThemePalette {
  return themePalettes[normalizeChildTheme(theme)];
}

/* ------------------------------------------------------------------ *
 * Semantic colors — theme-independent brand + status tokens.
 * Mirrors tailwind.config.ts. Use these whenever a raw color value is
 * unavoidable (SVG props, icon `color`, animated styles). Child-specific
 * colors still come from getThemePalette().
 * Contrast (WCAG, measured):
 *   successForeground #1F8A4C  → 4.38:1 on white, 4.15:1 on successSoft
 *     ⇒ only for ≥18px or ≥14px-bold text; small text uses successStrong.
 *   successStrong     #18773F  → 5.60:1 on white, 5.32:1 on successSoft.
 *   warningForeground #92400E  → 7.09:1 on white, 6.37:1 on warningSoft.
 *   destructiveStrong #8A1F1F  → for destructive text on light surfaces.
 * `success`/`warning`/`gold` DEFAULTs are fills/indicators, never text.
 * ------------------------------------------------------------------ */
export const semanticColors = {
  background: "#F8E9D7",
  foreground: "#1a1a2e",
  card: "#FFFFFF",
  cardForeground: "#1a1a2e",
  muted: "#F5F5F5",
  mutedForeground: "#4A4A4A",
  border: "#E5E5E5",
  primary: "#F3E5AB",
  primaryForeground: "#1a1a2e",
  accent: "#245A74",
  accentForeground: "#FFFFFF",
  gold: "#FFD700",
  goldDeep: "#F7A313",
  goldText: "#B97E0B",
  success: "#4FD17A",
  successSoft: "#ECFDF5",
  successForeground: "#1F8A4C",
  successStrong: "#18773F",
  warning: "#F7A313",
  warningSoft: "#FEF3C7",
  warningForeground: "#92400E",
  destructive: "#EF4444",
  destructiveSoft: "#FDECEC",
  destructiveForeground: "#FFFFFF",
  destructiveStrong: "#8A1F1F",
} as const;

export type SemanticColorToken = keyof typeof semanticColors;

/**
 * Brand shadow colors. `ambient` is the soft blue haze used by every card,
 * `deep` is the navy used by floating surfaces (dialogs/sheets).
 */
export const shadowColors = {
  ambient: "#9DB8D8",
  deep: "#2E3A68",
} as const;

/**
 * The ONLY sanctioned elevation recipes. Soft, wide, low opacity (≤ 0.08)
 * per docs/ai/DESIGN_DIRECTION.md — no `shadow-lg`/`shadow-md` utilities,
 * no ad-hoc shadow objects. Spread into a `style` prop.
 *   shadowSubtle   → chips, pills, segmented controls, inline tiles
 *   shadowCard     → list rows, hero cards, reward cards, summary cards
 *   shadowFloating → modals, bottom sheets, toasts, FAB-like overlays
 */
export const shadowPresets = {
  shadowSubtle: {
    shadowColor: shadowColors.ambient,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  shadowCard: {
    shadowColor: shadowColors.ambient,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  shadowFloating: {
    shadowColor: shadowColors.deep,
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
} satisfies Record<string, ViewStyle>;

export type ShadowPresetName = keyof typeof shadowPresets;
