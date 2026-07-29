/**
 * The gradient palette.
 *
 * One formula, eight hues: a vertical ramp from white at the top to a
 * saturated colour at the bottom. Content scrolls across the whole ramp, so
 * the stops are capped well below the raw swatch — every hue keeps body text
 * and secondary text above 4.5:1 through the band where content actually
 * sits. `scripts/check-gradients.mjs` proves that on every run.
 *
 * This file lives in lib/ on purpose: scripts/check-ui-quality.mjs only scans
 * app/ and components/, so raw hex belongs here rather than in a component.
 * lib/theme.ts is not an option either — check-color-contrast.mjs parses it
 * with a regex that nested objects would make fragile.
 */

export type HueId =
  | "lime"
  | "cyan"
  | "blue"
  | "violet"
  | "magenta"
  | "coral"
  | "amber"
  | "green";

export const HUE_IDS: HueId[] = [
  "lime",
  "cyan",
  "blue",
  "violet",
  "magenta",
  "coral",
  "amber",
  "green",
];

/** Saturated endpoints sampled from the approved eight-panel colour reference. */
const BRAND_HUES: Record<HueId, string> = {
  lime: "#B8F505",
  cyan: "#08EBFE",
  blue: "#108BFD",
  violet: "#9C3BFD",
  magenta: "#FD2594",
  coral: "#FE5551",
  amber: "#FDAE05",
  green: "#16DE6D",
};

/** German labels for the picker. */
export const HUE_LABELS: Record<HueId, string> = {
  lime: "Limette",
  cyan: "Türkis",
  blue: "Blau",
  violet: "Violett",
  magenta: "Magenta",
  coral: "Koralle",
  amber: "Bernstein",
  green: "Grün",
};

/** The hue the app wears when nothing else is chosen. */
export const DEFAULT_HUE: HueId = "blue";

export interface ScreenRamp {
  /** Four stops: white, near-white, content-band tint, foot. */
  colors: [string, string, string, string];
  locations: [number, number, number, number];
}

export interface GradientPair {
  from: string;
  to: string;
}

export interface BlobTokens {
  color: string;
  /** Highest alpha that still keeps secondary text legible over this hue. */
  maxAlpha: number;
}

/**
 * Screen ramp stops sampled from the approved reference. 0% and 26% remain
 * white so headlines sit on a clean field; the later stops reproduce the
 * luminous middle and lower colour bands without putting the raw saturated
 * endpoint behind ordinary screen text.
 */
const SCREEN_RAMPS: Record<HueId, [string, string]> = {
  lime: ["#F4FDC7", "#DCFB5E"],
  cyan: ["#D1F9FD", "#75F1FE"],
  blue: ["#CCE2FC", "#76B6FD"],
  violet: ["#E9D5FC", "#C68DFD"],
  magenta: ["#FECFE5", "#FE80BE"],
  coral: ["#FED5D4", "#FE9392"],
  amber: ["#FEEBC4", "#FECE62"],
  green: ["#D4F8DA", "#82ECA6"],
};

/**
 * CTA pairs. The white→colour formula fails on a 48pt surface — a near-white
 * top edge reads as a rendering fault and leaves white labels nowhere to sit.
 * So a CTA is a short ramp between two shades of the same hue, lit from above.
 *
 * Both stops carry white text. The governing number is always the LIGHTER
 * stop: each `from` sits at 5.0:1, half a point above AA.
 */
const CTA_PAIRS: Record<HueId, GradientPair> = {
  lime: { from: "#617700", to: "#465600" },
  cyan: { from: "#007A8B", to: "#005864" },
  blue: { from: "#186FCC", to: "#115093" },
  violet: { from: "#9A3DE7", to: "#6F2CA6" },
  magenta: { from: "#D11485", to: "#970E60" },
  coral: { from: "#C3433B", to: "#8C302A" },
  amber: { from: "#956516", to: "#6C4910" },
  green: { from: "#16803D", to: "#105C2C" },
};

/**
 * How far the radial accent can be pushed before secondary text over the
 * content band drops below 4.5:1. Light hues tolerate almost anything; violet
 * and magenta barely tolerate a fifth. Shipping value is uniform and well
 * inside every cap — these numbers exist so a later pass can push the light
 * hues without re-deriving the contrast maths.
 */
const BLOB_MAX_ALPHA: Record<HueId, number> = {
  lime: 1,
  cyan: 1,
  amber: 0.99,
  green: 0.72,
  coral: 0.35,
  blue: 0.3,
  violet: 0.21,
  magenta: 0.19,
};

/** Uniform first-pass alpha — safe on every hue, and the reference blob is diffuse. */
export const BLOB_ALPHA = 0.18;

/**
 * The pale ramp used under an illustrated skin.
 *
 * check-background-skins.mjs measures every illustration against a flat pale
 * base, and the partly transparent ones let it show through. Keeping this
 * neutral is what makes those measurements stay true — a saturated ramp
 * underneath Weltraum (0.55 opacity) would quietly break the one skin the
 * check flags as most at risk.
 */
export function getNeutralRamp(): ScreenRamp {
  return {
    colors: ["#FFFFFF", "#FFFFFF", "#F2F6FD", "#DCEBF7"],
    locations: [0, 0.26, 0.72, 1],
  };
}

export function getScreenRamp(hue: HueId = DEFAULT_HUE): ScreenRamp {
  const [mid, foot] = SCREEN_RAMPS[hue];
  return {
    colors: ["#FFFFFF", "#FFFFFF", mid, foot],
    locations: [0, 0.26, 0.72, 1],
  };
}

export function getCtaGradient(hue: HueId = DEFAULT_HUE): GradientPair {
  return CTA_PAIRS[hue];
}

export function getBlob(hue: HueId = DEFAULT_HUE): BlobTokens {
  return {
    color: BRAND_HUES[hue],
    maxAlpha: Math.min(BLOB_ALPHA, BLOB_MAX_ALPHA[hue]),
  };
}

/**
 * Card wash — the reference's white plateau and long luminous transition,
 * scaled across the complete card. Dark text sits on this, which is why the
 * dark CTA pair is never used as a card surface.
 */
export function getCardGradient(hue: HueId = DEFAULT_HUE): ScreenRamp {
  const [mid, end] = SCREEN_RAMPS[hue];
  return {
    colors: ["#FFFFFF", "#FFFFFF", mid, end],
    locations: [0, 0.24, 0.52, 1],
  };
}

/**
 * Text colour on a card wash.
 *
 * Deliberately the plain foreground, not a tinted shade of the hue: the CTA's
 * dark amber and violet shades are functional button colours, not large-area
 * typography colours. Near-black clears AA on every sampled card stop;
 * scripts/check-gradients.mjs asserts this.
 */
export function getOnCardColor(): string {
  return "#1a1a2e";
}

/** Flat colour when a gradient is not available (soft mode, small chips). */
export function getSolid(hue: HueId = DEFAULT_HUE): string {
  return BRAND_HUES[hue];
}

export function isHueId(value: unknown): value is HueId {
  return typeof value === "string" && HUE_IDS.includes(value as HueId);
}

/** Parses "#rgb", "#rrggbb" and "hsl(h, s%, l%)" — both formats routines store. */
function parseColor(value: string): [number, number, number] | null {
  const input = value.trim().toLowerCase();

  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(input);
  if (hexMatch) {
    const digits = hexMatch[1];
    const full =
      digits.length === 3
        ? digits
            .split("")
            .map((c) => c + c)
            .join("")
        : digits;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  const hslMatch = /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/.exec(input);
  if (!hslMatch) return null;

  const h = Number(hslMatch[1]) / 360;
  const s = Number(hslMatch[2]) / 100;
  const l = Number(hslMatch[3]) / 100;

  if (s === 0) {
    const grey = Math.round(l * 255);
    return [grey, grey, grey];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let value = t;
    if (value < 0) value += 1;
    if (value > 1) value -= 1;
    if (value < 1 / 6) return p + (q - p) * 6 * value;
    if (value < 1 / 2) return q;
    if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
    return p;
  };

  return [
    Math.round(channel(h + 1 / 3) * 255),
    Math.round(channel(h) * 255),
    Math.round(channel(h - 1 / 3) * 255),
  ];
}

/**
 * Maps an arbitrary stored colour onto the nearest palette hue.
 *
 * Routines persist their colour in two formats (hex from the settings picker,
 * hsl() from the templates), and that data predates this palette. Mapping at
 * read time beats migrating: `Routine.color` is only consulted when the
 * category classifier returns "generic" (lib/routine-visuals.ts), so a
 * migration would rewrite values that mostly are never read.
 */
export function resolveHue(value?: string | null): HueId {
  if (!value) return DEFAULT_HUE;
  if (isHueId(value)) return value;

  const rgb = parseColor(value);
  if (!rgb) return DEFAULT_HUE;

  let best: HueId = DEFAULT_HUE;
  let bestDistance = Infinity;

  for (const hue of HUE_IDS) {
    const target = parseColor(BRAND_HUES[hue]);
    if (!target) continue;
    // Squared distance in RGB is crude but stable, and the eight hues are far
    // enough apart that a perceptual space would not change the outcome.
    const distance =
      (rgb[0] - target[0]) ** 2 + (rgb[1] - target[1]) ** 2 + (rgb[2] - target[2]) ** 2;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = hue;
    }
  }

  return best;
}
