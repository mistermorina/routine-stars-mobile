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
    accentBorder: "#B4E4F7",
    accentStrong: "#6BB5D6",
    accentText: "#245A74",
    progress: "#FFD700",
    button: "#87CEEB",
    buttonPressed: "#6BB5D6",
    pillText: "#245A74",
    surface: "#F3E5AB",
    backgroundBase: "#F7ECD9",
    screenGradient: ["#FFF5CF", "#FCE4F0", "#DFF4FF"],
    cardTint: "rgba(255,255,255,0.92)",
    heroSurface: "#FFF8E4",
    chartPrimary: "#F0B400",
    chartSecondary: "#87CEEB",
    motifPrimary: "#FFE4A3",
    motifSecondary: "#CDEEFF",
    tabActiveBg: "#FFF2C8",
    headerGlass: "rgba(255,255,255,0.88)",
    celebrationColors: ["#FFD700", "#87CEEB", "#F8E9D7", "#F6C1E4"],
  },
  tiere: {
    accent: "#5BB68A",
    accentSoft: "#EAF8F0",
    accentBorder: "#B9E2CB",
    accentStrong: "#3E8E67",
    accentText: "#24543B",
    progress: "#5BB68A",
    button: "#5BB68A",
    buttonPressed: "#3E8E67",
    pillText: "#24543B",
    surface: "#E2F4E8",
    backgroundBase: "#F4ECDC",
    screenGradient: ["#F5F1D7", "#E5F6EA", "#FFE7D8"],
    cardTint: "rgba(255,255,255,0.92)",
    heroSurface: "#EEF7E7",
    chartPrimary: "#5BB68A",
    chartSecondary: "#F4A261",
    motifPrimary: "#C9EBCF",
    motifSecondary: "#F8DCC9",
    tabActiveBg: "#E9F8EF",
    headerGlass: "rgba(255,255,255,0.9)",
    celebrationColors: ["#5BB68A", "#F4A261", "#F2D98C", "#B8E3C8"],
  },
  galaxy: {
    accent: "#4F8EDC",
    accentSoft: "#E8F1FF",
    accentBorder: "#B8D2F4",
    accentStrong: "#2F67AD",
    accentText: "#1E4476",
    progress: "#4F8EDC",
    button: "#4F8EDC",
    buttonPressed: "#2F67AD",
    pillText: "#1E4476",
    surface: "#E5F5FF",
    backgroundBase: "#EEF1FF",
    screenGradient: ["#EEF1FF", "#F6EAFE", "#DCF3FF"],
    cardTint: "rgba(255,255,255,0.9)",
    heroSurface: "#F3F5FF",
    chartPrimary: "#4F8EDC",
    chartSecondary: "#8B7CF6",
    motifPrimary: "#CAD6FF",
    motifSecondary: "#E2CCFF",
    tabActiveBg: "#E8EDFF",
    headerGlass: "rgba(255,255,255,0.84)",
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
