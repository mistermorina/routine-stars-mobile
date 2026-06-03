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
