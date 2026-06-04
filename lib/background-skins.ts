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
    id: "space",
    label: "Weltraum",
    description: "Sterne und Planeten",
    previewBackground: "#F4F8FF",
    previewAccent: "#D8E8FA",
    previewSoft: "#FFF0BE",
    image: require("../assets/background-skins/space.png"),
    imageOpacity: 0.52,
  },
  {
    id: "animals",
    label: "Tiere",
    description: "Sanfte Pfoten",
    previewBackground: "#F8FBF5",
    previewAccent: "#DCEFE1",
    previewSoft: "#F5E5D6",
    image: require("../assets/background-skins/animals.png"),
    imageOpacity: 0.5,
  },
  {
    id: "magic",
    label: "Magie",
    description: "Glitzer und Zauber",
    previewBackground: "#FAF7FF",
    previewAccent: "#E2DCFF",
    previewSoft: "#FFF0BE",
    image: require("../assets/background-skins/magic.png"),
    imageOpacity: 0.48,
  },
  {
    id: "nature",
    label: "Natur",
    description: "Blätter und Sonne",
    previewBackground: "#F8FCF5",
    previewAccent: "#DCEFE1",
    previewSoft: "#FFEBC5",
    image: require("../assets/background-skins/nature.png"),
    imageOpacity: 0.5,
  },
  {
    id: "heroes",
    label: "Superhelden",
    description: "Blitz und Schild",
    previewBackground: "#F7FBFF",
    previewAccent: "#D9E7EC",
    previewSoft: "#FFEFAE",
    image: require("../assets/background-skins/heroes.png"),
    imageOpacity: 0.48,
  },
];

export const BACKGROUND_SKIN_IDS = BACKGROUND_SKINS.map((skin) => skin.id);

export function normalizeBackgroundSkin(value?: string | null): BackgroundSkinId {
  return BACKGROUND_SKIN_IDS.includes(value as BackgroundSkinId)
    ? (value as BackgroundSkinId)
    : DEFAULT_BACKGROUND_SKIN;
}

export function getBackgroundSkinOption(value?: string | null): BackgroundSkinOption {
  const skinId = normalizeBackgroundSkin(value);
  return BACKGROUND_SKINS.find((skin) => skin.id === skinId) ?? BACKGROUND_SKINS[0];
}
