import type {
  AnimalStickerId,
  StickerCategory,
  StickerRarity,
  StickerThemeWorld,
} from "@/lib/types";
import lionSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_01_loewe.png";
import giraffeSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_03_giraffe.png";
import pandaSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_04_panda.png";
import bunnySticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_05_hase.png";
import foxSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_06_fuchs.png";
import bearSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_07_baer.png";
import catSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_09_katze.png";
import dogSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_10_hund.png";
import owlSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_11_eule.png";
import turtleSticker from "@/assets/routinestars_tier_sticker_einzeln/routinestars_12_schildkroete.png";

export interface AnimalSticker {
  id: AnimalStickerId;
  title: string;
  mood: string;
  asset: number;
  accent: string;
  themeWorld: StickerThemeWorld;
  category: StickerCategory;
  rarity: StickerRarity;
  unlockOrder: number;
  assetSourcePath: string;
  appSize: number;
  masterSize: {
    width: number;
    height: number;
  };
  hasTransparentBackground: true;
}

const baseStickerMeta = {
  themeWorld: "tierfreunde",
  category: "tiere",
  appSize: 160,
  hasTransparentBackground: true,
} satisfies {
  themeWorld: StickerThemeWorld;
  category: StickerCategory;
  appSize: number;
  hasTransparentBackground: true;
};

const animalStickers = [
  {
    id: "loewe",
    title: "Mutiger Löwe",
    mood: "Für starke Schritte",
    asset: lionSticker,
    accent: "#F7A313",
    ...baseStickerMeta,
    rarity: "rare",
    unlockOrder: 1,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_01_loewe.png",
    masterSize: { width: 325, height: 359 },
  },
  {
    id: "giraffe",
    title: "Schlaue Giraffe",
    mood: "Für Überblick",
    asset: giraffeSticker,
    accent: "#E9A427",
    ...baseStickerMeta,
    rarity: "rare",
    unlockOrder: 7,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_03_giraffe.png",
    masterSize: { width: 297, height: 362 },
  },
  {
    id: "panda",
    title: "Ruhiger Panda",
    mood: "Für sanfte Tage",
    asset: pandaSticker,
    accent: "#5B6B7A",
    ...baseStickerMeta,
    rarity: "common",
    unlockOrder: 4,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_04_panda.png",
    masterSize: { width: 301, height: 329 },
  },
  {
    id: "hase",
    title: "Flotter Hase",
    mood: "Für Tempo",
    asset: bunnySticker,
    accent: "#EFA8C8",
    ...baseStickerMeta,
    rarity: "common",
    unlockOrder: 2,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_05_hase.png",
    masterSize: { width: 288, height: 362 },
  },
  {
    id: "fuchs",
    title: "Cleverer Fuchs",
    mood: "Für gute Ideen",
    asset: foxSticker,
    accent: "#F97316",
    ...baseStickerMeta,
    rarity: "common",
    unlockOrder: 5,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_06_fuchs.png",
    masterSize: { width: 294, height: 362 },
  },
  {
    id: "baer",
    title: "Gemütlicher Bär",
    mood: "Für Ausdauer",
    asset: bearSticker,
    accent: "#A66A35",
    ...baseStickerMeta,
    rarity: "rare",
    unlockOrder: 8,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_07_baer.png",
    masterSize: { width: 336, height: 362 },
  },
  {
    id: "katze",
    title: "Feine Katze",
    mood: "Für Fokus",
    asset: catSticker,
    accent: "#7C55E7",
    ...baseStickerMeta,
    rarity: "common",
    unlockOrder: 3,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_09_katze.png",
    masterSize: { width: 294, height: 346 },
  },
  {
    id: "hund",
    title: "Treuer Hund",
    mood: "Für Dranbleiben",
    asset: dogSticker,
    accent: "#4F8EDC",
    ...baseStickerMeta,
    rarity: "common",
    unlockOrder: 6,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_10_hund.png",
    masterSize: { width: 307, height: 347 },
  },
  {
    id: "eule",
    title: "Wache Eule",
    mood: "Für Lernmomente",
    asset: owlSticker,
    accent: "#5BB68A",
    ...baseStickerMeta,
    rarity: "rare",
    unlockOrder: 9,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_11_eule.png",
    masterSize: { width: 288, height: 336 },
  },
  {
    id: "schildkroete",
    title: "Starke Schildkröte",
    mood: "Für kleine Schritte",
    asset: turtleSticker,
    accent: "#3BAF78",
    ...baseStickerMeta,
    rarity: "epic",
    unlockOrder: 10,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_12_schildkroete.png",
    masterSize: { width: 325, height: 326 },
  },
] satisfies AnimalSticker[];

export const ANIMAL_STICKERS: AnimalSticker[] = [...animalStickers].sort(
  (left, right) => left.unlockOrder - right.unlockOrder
);

export function getAnimalSticker(stickerId: AnimalStickerId) {
  return ANIMAL_STICKERS.find((sticker) => sticker.id === stickerId) ?? ANIMAL_STICKERS[0];
}

export function getStickerRarityLabel(rarity: StickerRarity) {
  switch (rarity) {
    case "common":
      return "Normal";
    case "rare":
      return "Selten";
    case "epic":
      return "Episch";
  }
}

export function getStickerThemeWorldLabel(themeWorld: StickerThemeWorld) {
  switch (themeWorld) {
    case "tierfreunde":
      return "Tierfreunde";
    case "weltraum":
      return "Weltraum";
    case "magie":
      return "Magie";
    case "fahrzeuge":
      return "Fahrzeuge";
    case "natur":
      return "Natur";
    case "gute-nacht":
      return "Gute Nacht";
  }
}
