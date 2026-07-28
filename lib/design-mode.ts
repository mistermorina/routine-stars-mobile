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
 * Screen backdrop. Soft mode keeps the flat base colour (the decorative blobs
 * are drawn separately); glass mode needs a real gradient, because frosted
 * panes have nothing to refract over a flat fill.
 */
export function getScreenGradient(
  mode: DesignMode,
  palette: ThemePalette
): { colors: [string, string, string]; enabled: boolean } {
  return {
    colors: palette.screenGradient,
    enabled: mode === "glass",
  };
}
