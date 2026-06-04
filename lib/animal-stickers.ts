import type {
  StickerAssetId,
  StickerCategory,
  StickerRarity,
  StickerThemeWorld,
} from "@/lib/types";
import { V4_STICKERS } from "@/lib/generated-stickers-v4";
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
import magicHatSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_01_zauberhut.png";
import magicWandSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_02_sternenstab.png";
import magicDragonSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_03_sternendrache.png";
import magicCrystalsSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_04_kristalle.png";
import magicUnicornSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_05_einhorn.png";
import magicPotionSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_06_sternentrank.png";
import magicBookSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_07_zauberbuch.png";
import magicTowerSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_08_schlossturm.png";
import magicChestSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_09_schatztruhe.png";
import magicLanternSticker from "@/assets/routinestars_magie_sticker_einzeln/routinestars_magie_10_mondlaterne.png";
import vehicleFiretruckSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_01_feuerwehr.png";
import vehicleTrainSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_02_lokomotive.png";
import vehicleBusSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_03_schulbus.png";
import vehicleBalloonSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_04_heissluftballon.png";
import vehicleHelicopterSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_05_hubschrauber.png";
import vehicleScooterSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_06_roller.png";
import vehicleTractorSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_07_traktor.png";
import vehicleSubmarineSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_08_uboot.png";
import vehicleRocketboardSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_09_raketenboard.png";
import vehicleCraneSticker from "@/assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_10_baukran.png";
import natureSunflowerSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_01_sonnenblume.png";
import natureRainbowSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_02_regenbogen.png";
import natureMountainSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_03_berg.png";
import natureMushroomSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_04_pilzhaus.png";
import natureAppleTreeSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_05_apfelbaum.png";
import natureWaterfallSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_06_wasserfall.png";
import natureLeafSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_07_herbstblatt.png";
import natureShellSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_08_muschel.png";
import natureRaincloudSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_09_regenwolke.png";
import naturePineconeSticker from "@/assets/routinestars_natur_sticker_einzeln/routinestars_natur_10_tannenzapfen.png";

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

const magicStickerMeta = {
  themeWorld: "magie",
  category: "magie",
  appSize: 160,
  hasTransparentBackground: true,
} satisfies {
  themeWorld: StickerThemeWorld;
  category: StickerCategory;
  appSize: number;
  hasTransparentBackground: true;
};

const vehicleStickerMeta = {
  themeWorld: "fahrzeuge",
  category: "fahrzeuge",
  appSize: 160,
  hasTransparentBackground: true,
} satisfies {
  themeWorld: StickerThemeWorld;
  category: StickerCategory;
  appSize: number;
  hasTransparentBackground: true;
};

const natureStickerMeta = {
  themeWorld: "natur",
  category: "natur",
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
  {
    id: "magie_zauberhut",
    title: "Zauberhut",
    mood: "Für kleine Wunder",
    asset: magicHatSticker,
    accent: "#7C55E7",
    ...magicStickerMeta,
    rarity: "common",
    unlockOrder: 19,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_01_zauberhut.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_sternenstab",
    title: "Sternenstab",
    mood: "Für Glitzer-Momente",
    asset: magicWandSticker,
    accent: "#F6B73C",
    ...magicStickerMeta,
    rarity: "common",
    unlockOrder: 20,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_02_sternenstab.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_sternendrache",
    title: "Sternendrache",
    mood: "Für mutige Fantasie",
    asset: magicDragonSticker,
    accent: "#2F9CA3",
    ...magicStickerMeta,
    rarity: "rare",
    unlockOrder: 21,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_03_sternendrache.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_kristalle",
    title: "Funkelkristalle",
    mood: "Für klare Ziele",
    asset: magicCrystalsSticker,
    accent: "#5BA7D8",
    ...magicStickerMeta,
    rarity: "uncommon",
    unlockOrder: 22,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_04_kristalle.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_einhorn",
    title: "Traum-Einhorn",
    mood: "Für sanften Mut",
    asset: magicUnicornSticker,
    accent: "#B981D8",
    ...magicStickerMeta,
    rarity: "epic",
    unlockOrder: 23,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_05_einhorn.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_sternentrank",
    title: "Sternentrank",
    mood: "Für Extra-Energie",
    asset: magicPotionSticker,
    accent: "#A56CE0",
    ...magicStickerMeta,
    rarity: "common",
    unlockOrder: 24,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_06_sternentrank.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_zauberbuch",
    title: "Zauberbuch",
    mood: "Für Lernzauber",
    asset: magicBookSticker,
    accent: "#245A74",
    ...magicStickerMeta,
    rarity: "uncommon",
    unlockOrder: 25,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_07_zauberbuch.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_schlossturm",
    title: "Schlossturm",
    mood: "Für große Pläne",
    asset: magicTowerSticker,
    accent: "#8067C9",
    ...magicStickerMeta,
    rarity: "rare",
    unlockOrder: 26,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_08_schlossturm.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_schatztruhe",
    title: "Sternenschatz",
    mood: "Für Entdeckerfreude",
    asset: magicChestSticker,
    accent: "#C28A2C",
    ...magicStickerMeta,
    rarity: "uncommon",
    unlockOrder: 27,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_09_schatztruhe.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "magie_mondlaterne",
    title: "Mondlaterne",
    mood: "Für ruhiges Leuchten",
    asset: magicLanternSticker,
    accent: "#4F8EDC",
    ...magicStickerMeta,
    rarity: "common",
    unlockOrder: 28,
    assetSourcePath: "assets/routinestars_magie_sticker_einzeln/routinestars_magie_10_mondlaterne.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_feuerwehr",
    title: "Feuerwehr",
    mood: "Für schnelle Hilfe",
    asset: vehicleFiretruckSticker,
    accent: "#E34A34",
    ...vehicleStickerMeta,
    rarity: "common",
    unlockOrder: 29,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_01_feuerwehr.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_lokomotive",
    title: "Sternen-Lok",
    mood: "Für volle Fahrt",
    asset: vehicleTrainSticker,
    accent: "#245A74",
    ...vehicleStickerMeta,
    rarity: "common",
    unlockOrder: 30,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_02_lokomotive.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_schulbus",
    title: "Lernbus",
    mood: "Für gute Wege",
    asset: vehicleBusSticker,
    accent: "#F2B638",
    ...vehicleStickerMeta,
    rarity: "common",
    unlockOrder: 31,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_03_schulbus.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_heissluftballon",
    title: "Sternenballon",
    mood: "Für luftige Ziele",
    asset: vehicleBalloonSticker,
    accent: "#DB7C50",
    ...vehicleStickerMeta,
    rarity: "rare",
    unlockOrder: 32,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_04_heissluftballon.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_hubschrauber",
    title: "Sause-Heli",
    mood: "Für Überblick",
    asset: vehicleHelicopterSticker,
    accent: "#E76F51",
    ...vehicleStickerMeta,
    rarity: "uncommon",
    unlockOrder: 33,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_05_hubschrauber.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_roller",
    title: "Flitzer-Roller",
    mood: "Für Tempo",
    asset: vehicleScooterSticker,
    accent: "#77C9B3",
    ...vehicleStickerMeta,
    rarity: "common",
    unlockOrder: 34,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_06_roller.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_traktor",
    title: "Hof-Traktor",
    mood: "Für kräftiges Anpacken",
    asset: vehicleTractorSticker,
    accent: "#2F8F7C",
    ...vehicleStickerMeta,
    rarity: "uncommon",
    unlockOrder: 35,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_07_traktor.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_uboot",
    title: "Blubber-U-Boot",
    mood: "Für tiefe Konzentration",
    asset: vehicleSubmarineSticker,
    accent: "#245A74",
    ...vehicleStickerMeta,
    rarity: "rare",
    unlockOrder: 36,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_08_uboot.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_raketenboard",
    title: "Raketenboard",
    mood: "Für coole Sprünge",
    asset: vehicleRocketboardSticker,
    accent: "#F97316",
    ...vehicleStickerMeta,
    rarity: "epic",
    unlockOrder: 37,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_09_raketenboard.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "fahrzeuge_baukran",
    title: "Sternenkran",
    mood: "Für große Bauwerke",
    asset: vehicleCraneSticker,
    accent: "#D99B1E",
    ...vehicleStickerMeta,
    rarity: "uncommon",
    unlockOrder: 38,
    assetSourcePath: "assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_10_baukran.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_sonnenblume",
    title: "Sonnenblume",
    mood: "Für helle Laune",
    asset: natureSunflowerSticker,
    accent: "#F7C948",
    ...natureStickerMeta,
    rarity: "common",
    unlockOrder: 39,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_01_sonnenblume.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_regenbogen",
    title: "Regenbogen",
    mood: "Für bunte Tage",
    asset: natureRainbowSticker,
    accent: "#E76F51",
    ...natureStickerMeta,
    rarity: "common",
    unlockOrder: 40,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_02_regenbogen.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_berg",
    title: "Mut-Berg",
    mood: "Für hohe Ziele",
    asset: natureMountainSticker,
    accent: "#5B7FA6",
    ...natureStickerMeta,
    rarity: "uncommon",
    unlockOrder: 41,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_03_berg.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_pilzhaus",
    title: "Pilzhaus",
    mood: "Für gemütliche Pausen",
    asset: natureMushroomSticker,
    accent: "#E76F51",
    ...natureStickerMeta,
    rarity: "rare",
    unlockOrder: 42,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_04_pilzhaus.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_apfelbaum",
    title: "Apfelbaum",
    mood: "Für gute Ernte",
    asset: natureAppleTreeSticker,
    accent: "#5A9C4F",
    ...natureStickerMeta,
    rarity: "common",
    unlockOrder: 43,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_05_apfelbaum.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_wasserfall",
    title: "Wasserfall",
    mood: "Für frische Kraft",
    asset: natureWaterfallSticker,
    accent: "#4F8EDC",
    ...natureStickerMeta,
    rarity: "rare",
    unlockOrder: 44,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_06_wasserfall.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_herbstblatt",
    title: "Herbstblatt",
    mood: "Für ruhige Schritte",
    asset: natureLeafSticker,
    accent: "#F97316",
    ...natureStickerMeta,
    rarity: "common",
    unlockOrder: 45,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_07_herbstblatt.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_muschel",
    title: "Sternmuschel",
    mood: "Für kleine Schätze",
    asset: natureShellSticker,
    accent: "#EFA8C8",
    ...natureStickerMeta,
    rarity: "uncommon",
    unlockOrder: 46,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_08_muschel.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_regenwolke",
    title: "Regenwolke",
    mood: "Für sanfte Abkühlung",
    asset: natureRaincloudSticker,
    accent: "#7EA8C8",
    ...natureStickerMeta,
    rarity: "uncommon",
    unlockOrder: 47,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_09_regenwolke.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "natur_tannenzapfen",
    title: "Tannenzapfen",
    mood: "Für Waldruhe",
    asset: naturePineconeSticker,
    accent: "#A66A35",
    ...natureStickerMeta,
    rarity: "epic",
    unlockOrder: 48,
    assetSourcePath: "assets/routinestars_natur_sticker_einzeln/routinestars_natur_10_tannenzapfen.png",
    masterSize: { width: 1024, height: 1024 },
  },
  ...V4_STICKERS,
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
    case "helden":
      return "Helden";
    case "essen":
      return "Essen";
    case "musik":
      return "Musik";
    case "sport":
      return "Sport";
    case "meer":
      return "Meer";
    case "gute-nacht":
      return "Gute Nacht";
  }
}
