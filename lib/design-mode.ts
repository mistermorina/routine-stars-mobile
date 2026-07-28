import type { ThemePalette } from "@/lib/theme";
import { shadowPresets } from "@/lib/theme";

/**
 * Two visual languages, switchable at runtime so both can be judged against the
 * same data on the same device.
 *
 * - `soft`  — the shipped look: opaque cards, flat tinted backgrounds.
 * - `glass` — frosted translucent surfaces over a gradient/skin backdrop.
 *
 * This is a design experiment. Nothing outside the surface layer should branch
 * on the mode; screens ask for a `Surface` and get whichever look is active.
 */
export type DesignMode = "soft" | "glass";

export const DEFAULT_DESIGN_MODE: DesignMode = "soft";
export const DESIGN_MODES: DesignMode[] = ["soft", "glass"];

export function normalizeDesignMode(value?: string | null): DesignMode {
  return DESIGN_MODES.includes(value as DesignMode)
    ? (value as DesignMode)
    : DEFAULT_DESIGN_MODE;
}

export interface SurfaceTokens {
  /** Fill painted behind the content. Translucent in glass mode. */
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  shadow: (typeof shadowPresets)[keyof typeof shadowPresets];
  /** Blur strength for the frosted pane; 0 disables the BlurView entirely. */
  blurIntensity: number;
  /**
   * Glass reads as glass because of a bright hairline along the top edge. Null
   * in soft mode, where the border alone carries the shape.
   */
  highlightColor: string | null;
}

/**
 * Elevation levels. `raised` is for the hero/primary card, `flat` for the
 * quieter tiles that sit in a group — in glass mode the difference is mostly
 * blur strength and how much light the edge catches.
 */
export type SurfaceLevel = "raised" | "flat";

export function getSurfaceTokens(
  mode: DesignMode,
  palette: ThemePalette,
  level: SurfaceLevel = "flat"
): SurfaceTokens {
  if (mode === "glass") {
    return level === "raised"
      ? {
          backgroundColor: "rgba(255,255,255,0.52)",
          borderColor: "rgba(255,255,255,0.72)",
          borderWidth: 1,
          shadow: shadowPresets.shadowFloating,
          blurIntensity: 38,
          highlightColor: "rgba(255,255,255,0.85)",
        }
      : {
          backgroundColor: "rgba(255,255,255,0.42)",
          borderColor: "rgba(255,255,255,0.58)",
          borderWidth: 1,
          shadow: shadowPresets.shadowSubtle,
          blurIntensity: 26,
          highlightColor: "rgba(255,255,255,0.7)",
        };
  }

  return level === "raised"
    ? {
        backgroundColor: palette.cardTint,
        borderColor: palette.accentBorder,
        borderWidth: 1,
        shadow: shadowPresets.shadowCard,
        blurIntensity: 0,
        highlightColor: null,
      }
    : {
        backgroundColor: palette.cardTint,
        borderColor: palette.accentBorder,
        borderWidth: 1,
        shadow: shadowPresets.shadowSubtle,
        blurIntensity: 0,
        highlightColor: null,
      };
}

/**
 * Accent set for the small filled shapes — icon tiles, the active tab pill, the
 * star pill. The shipped look uses pastel vanilla; against frosted surfaces
 * that reads muddy, so glass mode swaps it for azure and lets the fills go
 * translucent. Gold stays gold everywhere: it is the star currency, not decor.
 */
export interface AccentTokens {
  /** Solid accent for strokes, active labels, progress. */
  accent: string;
  /** Fill behind icons and inactive pills. */
  tileFill: string;
  tileBorder: string | null;
  /** Fill behind the active tab pill / selected chip. */
  pillFill: string;
  pillBorder: string | null;
  /** Whether tiles should blur what is behind them. 0 = plain fill. */
  tileBlurIntensity: number;
  /** Bright top edge that sells the material. Null in soft mode. */
  tileHighlight: string | null;
  /** Icon stroke colour on top of a tile. */
  iconColor: string;
}

/** Azure, chosen to sit with the cool gradients rather than fight them. */
const GLASS_AZURE = "#1E7FBF";
const GLASS_AZURE_DEEP = "#125C8F";

export function getAccentTokens(mode: DesignMode, palette: ThemePalette): AccentTokens {
  if (mode === "glass") {
    return {
      accent: GLASS_AZURE,
      tileFill: "rgba(255,255,255,0.38)",
      tileBorder: "rgba(255,255,255,0.62)",
      pillFill: "rgba(30,127,191,0.18)",
      pillBorder: "rgba(255,255,255,0.55)",
      tileBlurIntensity: 20,
      tileHighlight: "rgba(255,255,255,0.8)",
      iconColor: GLASS_AZURE_DEEP,
    };
  }

  return {
    accent: palette.accent,
    tileFill: palette.surface,
    tileBorder: null,
    pillFill: palette.tabActiveBg,
    pillBorder: null,
    tileBlurIntensity: 0,
    tileHighlight: null,
    iconColor: palette.accentText,
  };
}

/**
 * Modals and sheets. They sit on a dimmed backdrop, so the card recipe would
 * frost something dark and drag the text down with it. The fill is therefore
 * much more opaque than a card's — enough to stay a bright panel, still
 * translucent enough to read as the same material.
 */
export function getModalTokens(mode: DesignMode) {
  if (mode === "glass") {
    return {
      backgroundColor: "rgba(255,255,255,0.82)",
      borderColor: "rgba(255,255,255,0.9)",
      blurIntensity: 60,
      highlightColor: "rgba(255,255,255,0.95)",
      /** Lighter scrim than soft mode: the blur already separates the layers. */
      backdropColor: "rgba(18,40,60,0.32)",
    };
  }

  return {
    backgroundColor: semanticColorsCard,
    borderColor: "transparent",
    blurIntensity: 0,
    highlightColor: null,
    backdropColor: "rgba(0,0,0,0.4)",
  };
}

/** Kept local to avoid a circular import with lib/theme. */
const semanticColorsCard = "#FFFFFF";

/**
 * Chrome — header and tab bar. These float above content, so they blur harder
 * than a card and keep a visible edge to stay separated from what scrolls under.
 */
export function getChromeTokens(mode: DesignMode, palette: ThemePalette) {
  if (mode === "glass") {
    return {
      backgroundColor: "rgba(255,255,255,0.30)",
      borderColor: "rgba(255,255,255,0.55)",
      blurIntensity: 55,
      highlightColor: "rgba(255,255,255,0.8)",
    };
  }

  return {
    backgroundColor: palette.headerGlass,
    borderColor: palette.accentBorder,
    blurIntensity: 0,
    highlightColor: null,
  };
}

/**
 * Screen backdrop. Soft mode keeps the flat base colour (the decorative blobs
 * are drawn separately); glass mode needs a real gradient, because frosted
 * panes have nothing to refract over a flat fill.
 */
export function getScreenGradient(
  mode: DesignMode,
  palette: ThemePalette
): { colors: [string, string, string]; enabled: boolean } {
  // The shipped ramp ends warm (cream), which reads as a stain under cool
  // frosted panels. Glass keeps the theme's own opening colours and closes on
  // a cool tint instead, so each theme stays recognisable.
  return {
    colors:
      mode === "glass"
        ? [palette.screenGradient[0], palette.screenGradient[1], GLASS_GRADIENT_END]
        : palette.screenGradient,
    enabled: mode === "glass",
  };
}

/** Pale azure — the same family as the accent, at backdrop strength. */
const GLASS_GRADIENT_END = "#DCEBF7";
