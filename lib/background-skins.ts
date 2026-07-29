import type { ImageProps } from "expo-image";
import type { BackgroundSkinId, GradientSkinId } from "@/lib/types";
import {
  DEFAULT_HUE,
  getNeutralRamp,
  getScreenRamp,
  HUE_LABELS,
  type HueId,
  type ScreenRamp,
} from "@/lib/gradients";

/**
 * A background is either a gradient ramp or an illustration — never both.
 *
 * They stay mutually exclusive on purpose: scripts/check-background-skins.mjs
 * measures each illustration against a flat pale base, and the partly
 * transparent ones (Weltraum runs at 0.55) let that base show through. A
 * saturated ramp underneath would silently invalidate the measurement for
 * exactly the skins that need it most.
 */
export type BackgroundSkinKind = "none" | "image" | "gradient";
export type BackgroundSkinCategory = "gradient" | "image";

export const BACKGROUND_SKIN_CATEGORIES = [
  { id: "gradient", label: "Verläufe" },
  { id: "image", label: "Illustrationen" },
] as const satisfies readonly {
  id: BackgroundSkinCategory;
  label: string;
}[];

export interface BackgroundSkinOption {
  id: BackgroundSkinId;
  kind: BackgroundSkinKind;
  /** Set on gradient entries; picks the ramp out of lib/gradients.ts. */
  hue?: HueId;
  label: string;
  description: string;
  previewBackground: string;
  previewAccent: string;
  previewSoft: string;
  image?: ImageProps["source"];
  /**
   * How much of the artwork covers the themed background underneath.
   *
   * ThemedScreenBackground paints the skin over the light `backgroundBase`, so
   * this doubles as a scrim: lowering it lightens a dark skin until dark body
   * text stays legible. These values are measured, not guessed —
   * `scripts/check-background-skins.mjs` fails the build if any skin drops
   * below 4.5:1 against the foreground colour.
   */
  imageOpacity: number;
}

export const DEFAULT_BACKGROUND_SKIN: BackgroundSkinId = "none";

/**
 * Gradient backgrounds. One per palette hue; the ramp itself and its contrast
 * guarantees live in lib/gradients.ts and are asserted by
 * scripts/check-gradients.mjs.
 */
const GRADIENT_SKINS: BackgroundSkinOption[] = (
  [
    ["verlauf-blau", "blue"],
    ["verlauf-tuerkis", "cyan"],
    ["verlauf-limette", "lime"],
    ["verlauf-gruen", "green"],
    ["verlauf-bernstein", "amber"],
    ["verlauf-koralle", "coral"],
    ["verlauf-magenta", "magenta"],
    ["verlauf-violett", "violet"],
  ] satisfies [GradientSkinId, HueId][]
).map(([id, hue]) => {
  const ramp = getScreenRamp(hue);
  return {
    id,
    kind: "gradient" as const,
    hue,
    label: HUE_LABELS[hue],
    description: "Farbverlauf",
    // Preview swatches mirror the ramp so the picker shows the real thing.
    previewBackground: ramp.colors[1],
    previewAccent: ramp.colors[2],
    previewSoft: ramp.colors[3],
    imageOpacity: 0,
  };
});

export const BACKGROUND_SKINS: BackgroundSkinOption[] = [
  {
    id: "none",
    kind: "none",
    hue: DEFAULT_HUE,
    label: "Standard",
    description: "Routine Stars Blau",
    previewBackground: getScreenRamp(DEFAULT_HUE).colors[1],
    previewAccent: getScreenRamp(DEFAULT_HUE).colors[2],
    previewSoft: getScreenRamp(DEFAULT_HUE).colors[3],
    imageOpacity: 0,
  },
  {
    id: "wolken",
    kind: "image",
    label: "Wolken",
    description: "Zum Träumen",
    previewBackground: "#D1F0FD",
    previewAccent: "#C4EAFD",
    previewSoft: "#E2F6FE",
    image: require("../assets/background-skins/skin-wolken.png"),
    imageOpacity: 1,
  },
  {
    id: "sonnenaufgang",
    kind: "image",
    label: "Sonnenaufgang",
    description: "Morgenlicht",
    previewBackground: "#FEF0D6",
    previewAccent: "#FEDFB3",
    previewSoft: "#FEE3BF",
    image: require("../assets/background-skins/skin-sonnenaufgang.png"),
    imageOpacity: 1,
  },
  {
    id: "regenbogen",
    kind: "image",
    label: "Regenbogen",
    description: "Sanfte Farbbögen",
    previewBackground: "#FEF8EB",
    previewAccent: "#FCF3E0",
    previewSoft: "#F4ECDC",
    image: require("../assets/background-skins/skin-regenbogen.png"),
    imageOpacity: 1,
  },
  {
    id: "konfetti",
    kind: "image",
    label: "Konfetti",
    description: "Kleine Schnipsel",
    previewBackground: "#FEFAF2",
    previewAccent: "#FEF6E9",
    previewSoft: "#FEF6E8",
    image: require("../assets/background-skins/skin-konfetti.png"),
    imageOpacity: 1,
  },
  {
    id: "sportplatz",
    kind: "image",
    label: "Sportplatz",
    description: "Platz für Bewegung",
    previewBackground: "#EAF4C5",
    previewAccent: "#D1E7A8",
    previewSoft: "#E8F3C2",
    image: require("../assets/background-skins/skin-sportplatz.png"),
    imageOpacity: 1,
  },
  {
    id: "ozean",
    kind: "image",
    label: "Ozean",
    description: "Unter Wasser",
    previewBackground: "#C7F5F6",
    previewAccent: "#7CDCE5",
    previewSoft: "#D3F6F9",
    image: require("../assets/background-skins/skin-ozean.png"),
    imageOpacity: 1,
  },
  {
    id: "minzwald",
    kind: "image",
    label: "Minzwald",
    description: "Frisches Grün",
    previewBackground: "#DDEFD9",
    previewAccent: "#A9D9B4",
    previewSoft: "#E1F0DD",
    image: require("../assets/background-skins/skin-minzwald.png"),
    imageOpacity: 1,
  },
  {
    id: "dschungel",
    kind: "image",
    label: "Dschungel",
    description: "Blätter und Pfoten",
    previewBackground: "#F0F6D6",
    previewAccent: "#A7C998",
    previewSoft: "#DCEABB",
    image: require("../assets/background-skins/skin-dschungel.png"),
    imageOpacity: 1,
  },
  {
    id: "schatzkarte",
    kind: "image",
    label: "Schatzkarte",
    description: "Auf Schatzsuche",
    previewBackground: "#FDEDC4",
    previewAccent: "#F4D78F",
    previewSoft: "#FBDD94",
    image: require("../assets/background-skins/skin-schatzkarte.png"),
    imageOpacity: 1,
  },
  {
    id: "schneewelt",
    kind: "image",
    label: "Schneewelt",
    description: "Stille und Flocken",
    previewBackground: "#F8FAFE",
    previewAccent: "#E7F2FC",
    previewSoft: "#E6F2FC",
    image: require("../assets/background-skins/skin-schneewelt.png"),
    imageOpacity: 1,
  },
  {
    id: "sternennacht",
    kind: "image",
    label: "Sternennacht",
    description: "Mond und Sterne",
    previewBackground: "#B5A9EE",
    previewAccent: "#A48DE4",
    previewSoft: "#605CBC",
    image: require("../assets/background-skins/skin-sternennacht.png"),
    // Measured 7.35:1 at full cover — a light scrim is enough.
    imageOpacity: 0.88,
  },
  {
    id: "weltraum",
    kind: "image",
    label: "Weltraum",
    description: "Ferne Planeten",
    previewBackground: "#353BAB",
    previewAccent: "#4537A8",
    previewSoft: "#0A1048",
    image: require("../assets/background-skins/skin-weltraum.png"),
    // The only genuinely dark artwork: 2.05:1 at full cover would make body
    // text unreadable. Held back so the night sky stays visible while text
    // keeps its 4.5:1.
    imageOpacity: 0.55,
  },
  ...GRADIENT_SKINS,
];

export const BACKGROUND_SKIN_IDS = BACKGROUND_SKINS.map((skin) => skin.id);

/**
 * Skins that shipped before the illustrated set. A device still carrying one
 * of these ids gets the closest new artwork instead of silently dropping back
 * to "Kein Skin".
 */
const LEGACY_SKIN_ALIASES: Record<string, BackgroundSkinId> = {
  space: "weltraum",
  magic: "sternennacht",
  animals: "dschungel",
  nature: "minzwald",
  heroes: "sportplatz",
};

export function normalizeBackgroundSkin(value?: string | null): BackgroundSkinId {
  if (BACKGROUND_SKIN_IDS.includes(value as BackgroundSkinId)) {
    return value as BackgroundSkinId;
  }

  return (value ? LEGACY_SKIN_ALIASES[value] : undefined) ?? DEFAULT_BACKGROUND_SKIN;
}

export function getBackgroundSkinOption(value?: string | null): BackgroundSkinOption {
  const skinId = normalizeBackgroundSkin(value);
  return BACKGROUND_SKINS.find((skin) => skin.id === skinId) ?? BACKGROUND_SKINS[0];
}

/** `none` is the branded default ramp, so it belongs with the gradients. */
export function getBackgroundSkinCategory(
  skin: BackgroundSkinOption
): BackgroundSkinCategory {
  return skin.kind === "image" ? "image" : "gradient";
}

export function getBackgroundSkinsByCategory(
  category: BackgroundSkinCategory
): BackgroundSkinOption[] {
  return BACKGROUND_SKINS.filter((skin) => {
    if (getBackgroundSkinCategory(skin) !== category) return false;
    // `none` already renders the blue brand ramp. Keeping the explicit blue
    // alias beside it would show two identical choices in every picker.
    return !(
      skin.kind === "gradient" &&
      skin.hue === DEFAULT_HUE
    );
  });
}

/** Collapses the explicit blue alias onto the visually identical default. */
export function getBackgroundSkinPickerId(
  value?: string | null
): BackgroundSkinId {
  const skin = getBackgroundSkinOption(value);
  return skin.kind === "gradient" && skin.hue === DEFAULT_HUE
    ? DEFAULT_BACKGROUND_SKIN
    : skin.id;
}

/**
 * Exact underlay used by both the full-screen renderer and every preview.
 * Illustrated skins always sit on the neutral ramp; gradients (including the
 * default `none` id) carry their own hue.
 */
export function getBackgroundSkinRamp(skin: BackgroundSkinOption): ScreenRamp {
  return skin.kind === "image"
    ? getNeutralRamp()
    : getScreenRamp(skin.hue ?? DEFAULT_HUE);
}
