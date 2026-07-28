import type { ImageProps } from "expo-image";
import type { BackgroundSkinId } from "@/lib/types";

export interface BackgroundSkinOption {
  id: BackgroundSkinId;
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

export const BACKGROUND_SKINS: BackgroundSkinOption[] = [
  {
    id: "none",
    label: "Kein Skin",
    description: "Standard",
    previewBackground: "#F6FAFF",
    previewAccent: "#DCEAF7",
    previewSoft: "#FFF7E6",
    imageOpacity: 0,
  },
  {
    id: "wolken",
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
