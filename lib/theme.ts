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
