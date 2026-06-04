import type {
  StickerAssetId,
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
import spaceRocketSticker from "@/assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_01_rakete.png";
import spacePlanetSticker from "@/assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_02_planet.png";
import spaceHelmetSticker from "@/assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_03_astronautenhelm.png";
import spaceRoverSticker from "@/assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_04_mondrover.png";
import nightMoonSticker from "@/assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_01_schlafmond.png";
import nightCloudSticker from "@/assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_02_traumwolke.png";
import nightBookSticker from "@/assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_03_sternenbuch.png";
import nightBearSticker from "@/assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_04_pyjama_baer.png";

export interface AnimalSticker {
  id: StickerAssetId;
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

const spaceStickerMeta = {
  themeWorld: "weltraum",
  category: "weltraum",
  appSize: 160,
  hasTransparentBackground: true,
} satisfies {
  themeWorld: StickerThemeWorld;
  category: StickerCategory;
  appSize: number;
  hasTransparentBackground: true;
};

const bedtimeStickerMeta = {
  themeWorld: "gute-nacht",
  category: "gute-nacht",
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
    rarity: "epic",
    unlockOrder: 10,
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
    unlockOrder: 8,
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
    unlockOrder: 1,
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
    rarity: "uncommon",
    unlockOrder: 6,
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
    rarity: "uncommon",
    unlockOrder: 7,
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
    unlockOrder: 2,
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
    rarity: "uncommon",
    unlockOrder: 5,
    assetSourcePath: "assets/routinestars_tier_sticker_einzeln/routinestars_12_schildkroete.png",
    masterSize: { width: 325, height: 326 },
  },
  {
    id: "weltraum_rakete",
    title: "Sternenrakete",
    mood: "Für mutige Starts",
    asset: spaceRocketSticker,
    accent: "#245A74",
    ...spaceStickerMeta,
    rarity: "common",
    unlockOrder: 11,
    assetSourcePath: "assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_01_rakete.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "weltraum_planet",
    title: "Kicherplanet",
    mood: "Für runde Tage",
    asset: spacePlanetSticker,
    accent: "#4F8EDC",
    ...spaceStickerMeta,
    rarity: "common",
    unlockOrder: 12,
    assetSourcePath: "assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_02_planet.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "weltraum_astronautenhelm",
    title: "Kosmoshelm",
    mood: "Für klare Missionen",
    asset: spaceHelmetSticker,
    accent: "#1E4476",
    ...spaceStickerMeta,
    rarity: "rare",
    unlockOrder: 13,
    assetSourcePath: "assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_03_astronautenhelm.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "weltraum_mondrover",
    title: "Mondflitzer",
    mood: "Für Entdecker",
    asset: spaceRoverSticker,
    accent: "#245A74",
    ...spaceStickerMeta,
    rarity: "uncommon",
    unlockOrder: 14,
    assetSourcePath: "assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_04_mondrover.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "gute_nacht_schlafmond",
    title: "Schlafmond",
    mood: "Für ruhige Abende",
    asset: nightMoonSticker,
    accent: "#5B7FA6",
    ...bedtimeStickerMeta,
    rarity: "common",
    unlockOrder: 15,
    assetSourcePath: "assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_01_schlafmond.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "gute_nacht_traumwolke",
    title: "Traumwolke",
    mood: "Für sanfte Schritte",
    asset: nightCloudSticker,
    accent: "#7EA8C8",
    ...bedtimeStickerMeta,
    rarity: "common",
    unlockOrder: 16,
    assetSourcePath: "assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_02_traumwolke.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "gute_nacht_sternenbuch",
    title: "Sternenbuch",
    mood: "Für Vorlesezeit",
    asset: nightBookSticker,
    accent: "#245A74",
    ...bedtimeStickerMeta,
    rarity: "uncommon",
    unlockOrder: 17,
    assetSourcePath: "assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_03_sternenbuch.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "gute_nacht_pyjama_baer",
    title: "Pyjama-Bär",
    mood: "Für kuschelige Routinen",
    asset: nightBearSticker,
    accent: "#A66A35",
    ...bedtimeStickerMeta,
    rarity: "rare",
    unlockOrder: 18,
    assetSourcePath: "assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_04_pyjama_baer.png",
    masterSize: { width: 1024, height: 1024 },
  },
] satisfies AnimalSticker[];

export const STICKER_CATALOG: AnimalSticker[] = [...animalStickers].sort(
  (left, right) => left.unlockOrder - right.unlockOrder
);

export const ANIMAL_STICKERS = STICKER_CATALOG;

export function getAnimalSticker(stickerId: StickerAssetId) {
  return STICKER_CATALOG.find((sticker) => sticker.id === stickerId) ?? STICKER_CATALOG[0];
}

export function getStickerRarityLabel(rarity: StickerRarity) {
  switch (rarity) {
    case "common":
      return "Normal";
    case "uncommon":
      return "Besonders";
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
