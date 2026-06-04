import type {
  StickerAssetId,
  StickerCategory,
  StickerRarity,
  StickerThemeWorld,
} from "@/lib/types";
import heroCapeSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_01_sternencape.png";
import heroShieldSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_02_mut_schild.png";
import heroHelmetSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_03_helferhelm.png";
import heroMegaphoneSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_04_freundlichkeits_megafon.png";
import heroCompassSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_05_mutkompass.png";
import heroBackpackSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_06_rettungsrucksack.png";
import heroGlovesSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_07_teamhandschuhe.png";
import heroMaskSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_08_funkelmaske.png";
import heroLighthouseSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_09_leuchtturm.png";
import heroMedalSticker from "@/assets/routinestars_helden_sticker_einzeln/routinestars_helden_10_heldenmedaille.png";
import foodStrawberrySticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_01_erdbeere.png";
import foodBananaSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_02_banane.png";
import foodPorridgeSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_03_porridge.png";
import foodSandwichSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_04_sandwich.png";
import foodSoupSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_05_suppe.png";
import foodCupcakeSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_06_cupcake.png";
import foodCookieSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_07_sternkeks.png";
import foodBentoSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_08_bento_box.png";
import foodJuiceSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_09_orangensaft.png";
import foodIceCreamSticker from "@/assets/routinestars_essen_sticker_einzeln/routinestars_essen_10_eiswaffel.png";
import musicDrumSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_01_trommel.png";
import musicGuitarSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_02_gitarre.png";
import musicTambourineSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_03_tamburin.png";
import musicMicrophoneSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_04_mikrofon.png";
import musicHeadphonesSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_05_kopfhoerer.png";
import musicPianoSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_06_klavier.png";
import musicTrumpetSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_07_trompete.png";
import musicNotesSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_08_noten.png";
import musicRecordSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_09_plattenspieler.png";
import musicTicketSticker from "@/assets/routinestars_musik_sticker_einzeln/routinestars_musik_10_konzertkarte.png";
import sportSoccerSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_01_fussball.png";
import sportBasketballSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_02_basketball.png";
import sportSneakerSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_03_sneaker.png";
import sportTrophySticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_04_pokal.png";
import sportGogglesSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_05_schwimmbrille.png";
import sportJumpRopeSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_06_springseil.png";
import sportTargetSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_07_zielscheibe.png";
import sportSkateboardSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_08_skateboard.png";
import sportYogaSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_09_yogamatte.png";
import sportFlagSticker from "@/assets/routinestars_sport_sticker_einzeln/routinestars_sport_10_zielflagge.png";
import oceanWhaleSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_01_wal.png";
import oceanSailboatSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_02_segelboot.png";
import oceanStarfishSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_03_seestern.png";
import oceanLighthouseSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_04_leuchtturm.png";
import oceanMapSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_05_schatzkarte.png";
import oceanShellSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_06_muschel.png";
import oceanDolphinSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_07_delfin.png";
import oceanCoralSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_08_korallenriff.png";
import oceanBottleSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_09_flaschenpost.png";
import oceanWaveSticker from "@/assets/routinestars_meer_sticker_einzeln/routinestars_meer_10_mondwelle.png";

export interface GeneratedStickerV4 {
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

function createStickerMeta(themeWorld: StickerThemeWorld, category: StickerCategory) {
  return {
    themeWorld,
    category,
    appSize: 160,
    hasTransparentBackground: true,
  } satisfies {
    themeWorld: StickerThemeWorld;
    category: StickerCategory;
    appSize: number;
    hasTransparentBackground: true;
  };
}

const heroStickerMeta = createStickerMeta("helden", "helden");
const foodStickerMeta = createStickerMeta("essen", "essen");
const musicStickerMeta = createStickerMeta("musik", "musik");
const sportStickerMeta = createStickerMeta("sport", "sport");
const oceanStickerMeta = createStickerMeta("meer", "meer");

export const V4_STICKERS = [
  {
    id: "helden_sternencape",
    title: "Sternencape",
    mood: "Fuer mutige Auftritte",
    asset: heroCapeSticker,
    accent: "#D94A38",
    ...heroStickerMeta,
    rarity: "common",
    unlockOrder: 49,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_01_sternencape.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_mut_schild",
    title: "Mut-Schild",
    mood: "Fuer Schutz und Staerke",
    asset: heroShieldSticker,
    accent: "#245A74",
    ...heroStickerMeta,
    rarity: "common",
    unlockOrder: 50,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_02_mut_schild.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_helferhelm",
    title: "Helferhelm",
    mood: "Fuer gute Taten",
    asset: heroHelmetSticker,
    accent: "#D99B1E",
    ...heroStickerMeta,
    rarity: "uncommon",
    unlockOrder: 51,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_03_helferhelm.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_freundlichkeits_megafon",
    title: "Freundlichkeits-Megafon",
    mood: "Fuer starke Worte",
    asset: heroMegaphoneSticker,
    accent: "#E76F51",
    ...heroStickerMeta,
    rarity: "rare",
    unlockOrder: 52,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_04_freundlichkeits_megafon.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_mutkompass",
    title: "Mutkompass",
    mood: "Fuer klare Richtung",
    asset: heroCompassSticker,
    accent: "#2F8F7C",
    ...heroStickerMeta,
    rarity: "uncommon",
    unlockOrder: 53,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_05_mutkompass.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_rettungsrucksack",
    title: "Rettungsrucksack",
    mood: "Fuer Vorbereitung",
    asset: heroBackpackSticker,
    accent: "#D94A38",
    ...heroStickerMeta,
    rarity: "common",
    unlockOrder: 54,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_06_rettungsrucksack.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_teamhandschuhe",
    title: "Teamhandschuhe",
    mood: "Fuer Zusammenhalt",
    asset: heroGlovesSticker,
    accent: "#245A74",
    ...heroStickerMeta,
    rarity: "common",
    unlockOrder: 55,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_07_teamhandschuhe.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_funkelmaske",
    title: "Funkelmaske",
    mood: "Fuer mutiges Spielen",
    asset: heroMaskSticker,
    accent: "#2F9CA3",
    ...heroStickerMeta,
    rarity: "rare",
    unlockOrder: 56,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_08_funkelmaske.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_leuchtturm",
    title: "Helden-Leuchtturm",
    mood: "Fuer Orientierung",
    asset: heroLighthouseSticker,
    accent: "#E76F51",
    ...heroStickerMeta,
    rarity: "uncommon",
    unlockOrder: 57,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_09_leuchtturm.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "helden_heldenmedaille",
    title: "Heldenmedaille",
    mood: "Fuer grossen Einsatz",
    asset: heroMedalSticker,
    accent: "#D99B1E",
    ...heroStickerMeta,
    rarity: "epic",
    unlockOrder: 58,
    assetSourcePath: "assets/routinestars_helden_sticker_einzeln/routinestars_helden_10_heldenmedaille.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_erdbeere",
    title: "Erdbeere",
    mood: "Fuer frische Energie",
    asset: foodStrawberrySticker,
    accent: "#E85D75",
    ...foodStickerMeta,
    rarity: "common",
    unlockOrder: 59,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_01_erdbeere.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_banane",
    title: "Banane",
    mood: "Fuer gute Laune",
    asset: foodBananaSticker,
    accent: "#F7C948",
    ...foodStickerMeta,
    rarity: "common",
    unlockOrder: 60,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_02_banane.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_porridge",
    title: "Sternen-Porridge",
    mood: "Fuer warme Starts",
    asset: foodPorridgeSticker,
    accent: "#7EA8C8",
    ...foodStickerMeta,
    rarity: "uncommon",
    unlockOrder: 61,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_03_porridge.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_sandwich",
    title: "Sandwich",
    mood: "Fuer Pausenfreude",
    asset: foodSandwichSticker,
    accent: "#E9A427",
    ...foodStickerMeta,
    rarity: "common",
    unlockOrder: 62,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_04_sandwich.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_suppe",
    title: "Sternensuppe",
    mood: "Fuer gemuetliche Kraft",
    asset: foodSoupSticker,
    accent: "#F97316",
    ...foodStickerMeta,
    rarity: "rare",
    unlockOrder: 63,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_05_suppe.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_cupcake",
    title: "Cupcake",
    mood: "Fuer kleine Feiern",
    asset: foodCupcakeSticker,
    accent: "#EFA8C8",
    ...foodStickerMeta,
    rarity: "uncommon",
    unlockOrder: 64,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_06_cupcake.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_sternkeks",
    title: "Sternkeks",
    mood: "Fuer knusprige Ziele",
    asset: foodCookieSticker,
    accent: "#C28A2C",
    ...foodStickerMeta,
    rarity: "common",
    unlockOrder: 65,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_07_sternkeks.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_bento_box",
    title: "Bento-Box",
    mood: "Fuer bunte Pausen",
    asset: foodBentoSticker,
    accent: "#77C9B3",
    ...foodStickerMeta,
    rarity: "epic",
    unlockOrder: 66,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_08_bento_box.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_orangensaft",
    title: "Orangensaft",
    mood: "Fuer sonnige Minuten",
    asset: foodJuiceSticker,
    accent: "#F6B73C",
    ...foodStickerMeta,
    rarity: "common",
    unlockOrder: 67,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_09_orangensaft.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "essen_eiswaffel",
    title: "Eiswaffel",
    mood: "Fuer coole Belohnungen",
    asset: foodIceCreamSticker,
    accent: "#EFA8C8",
    ...foodStickerMeta,
    rarity: "rare",
    unlockOrder: 68,
    assetSourcePath: "assets/routinestars_essen_sticker_einzeln/routinestars_essen_10_eiswaffel.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_trommel",
    title: "Trommel",
    mood: "Fuer starken Rhythmus",
    asset: musicDrumSticker,
    accent: "#F6B73C",
    ...musicStickerMeta,
    rarity: "common",
    unlockOrder: 69,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_01_trommel.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_gitarre",
    title: "Gitarre",
    mood: "Fuer neue Lieder",
    asset: musicGuitarSticker,
    accent: "#E9A427",
    ...musicStickerMeta,
    rarity: "common",
    unlockOrder: 70,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_02_gitarre.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_tamburin",
    title: "Tamburin",
    mood: "Fuer Funkel-Takte",
    asset: musicTambourineSticker,
    accent: "#E76F51",
    ...musicStickerMeta,
    rarity: "uncommon",
    unlockOrder: 71,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_03_tamburin.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_mikrofon",
    title: "Mikrofon",
    mood: "Fuer mutige Stimmen",
    asset: musicMicrophoneSticker,
    accent: "#5B6B7A",
    ...musicStickerMeta,
    rarity: "rare",
    unlockOrder: 72,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_04_mikrofon.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_kopfhoerer",
    title: "Kopfhoerer",
    mood: "Fuer ruhiges Hoeren",
    asset: musicHeadphonesSticker,
    accent: "#2F9CA3",
    ...musicStickerMeta,
    rarity: "uncommon",
    unlockOrder: 73,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_05_kopfhoerer.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_klavier",
    title: "Mini-Klavier",
    mood: "Fuer klare Noten",
    asset: musicPianoSticker,
    accent: "#245A74",
    ...musicStickerMeta,
    rarity: "common",
    unlockOrder: 74,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_06_klavier.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_trompete",
    title: "Trompete",
    mood: "Fuer laute Freude",
    asset: musicTrumpetSticker,
    accent: "#F6B73C",
    ...musicStickerMeta,
    rarity: "rare",
    unlockOrder: 75,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_07_trompete.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_noten",
    title: "Notensterne",
    mood: "Fuer leichte Schritte",
    asset: musicNotesSticker,
    accent: "#E76F51",
    ...musicStickerMeta,
    rarity: "common",
    unlockOrder: 76,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_08_noten.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_plattenspieler",
    title: "Plattenspieler",
    mood: "Fuer Lieblingsmusik",
    asset: musicRecordSticker,
    accent: "#245A74",
    ...musicStickerMeta,
    rarity: "epic",
    unlockOrder: 77,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_09_plattenspieler.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "musik_konzertkarte",
    title: "Sternenkarte",
    mood: "Fuer kleine Shows",
    asset: musicTicketSticker,
    accent: "#E76F51",
    ...musicStickerMeta,
    rarity: "uncommon",
    unlockOrder: 78,
    assetSourcePath: "assets/routinestars_musik_sticker_einzeln/routinestars_musik_10_konzertkarte.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_fussball",
    title: "Fussball",
    mood: "Fuer Teamgeist",
    asset: sportSoccerSticker,
    accent: "#245A74",
    ...sportStickerMeta,
    rarity: "common",
    unlockOrder: 79,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_01_fussball.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_basketball",
    title: "Basketball",
    mood: "Fuer Trefferlaune",
    asset: sportBasketballSticker,
    accent: "#F97316",
    ...sportStickerMeta,
    rarity: "common",
    unlockOrder: 80,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_02_basketball.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_sneaker",
    title: "Sternen-Sneaker",
    mood: "Fuer schnelle Schritte",
    asset: sportSneakerSticker,
    accent: "#E76F51",
    ...sportStickerMeta,
    rarity: "uncommon",
    unlockOrder: 81,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_03_sneaker.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_pokal",
    title: "Pokal",
    mood: "Fuer stolze Momente",
    asset: sportTrophySticker,
    accent: "#D99B1E",
    ...sportStickerMeta,
    rarity: "rare",
    unlockOrder: 82,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_04_pokal.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_schwimmbrille",
    title: "Schwimmbrille",
    mood: "Fuer klare Sicht",
    asset: sportGogglesSticker,
    accent: "#2F9CA3",
    ...sportStickerMeta,
    rarity: "uncommon",
    unlockOrder: 83,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_05_schwimmbrille.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_springseil",
    title: "Springseil",
    mood: "Fuer lockere Spruenge",
    asset: sportJumpRopeSticker,
    accent: "#E76F51",
    ...sportStickerMeta,
    rarity: "common",
    unlockOrder: 84,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_06_springseil.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_zielscheibe",
    title: "Zielscheibe",
    mood: "Fuer Fokus",
    asset: sportTargetSticker,
    accent: "#245A74",
    ...sportStickerMeta,
    rarity: "rare",
    unlockOrder: 85,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_07_zielscheibe.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_skateboard",
    title: "Skateboard",
    mood: "Fuer Balance",
    asset: sportSkateboardSticker,
    accent: "#245A74",
    ...sportStickerMeta,
    rarity: "uncommon",
    unlockOrder: 86,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_08_skateboard.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_yogamatte",
    title: "Yogamatte",
    mood: "Fuer Ruhepausen",
    asset: sportYogaSticker,
    accent: "#2F9CA3",
    ...sportStickerMeta,
    rarity: "common",
    unlockOrder: 87,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_09_yogamatte.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "sport_zielflagge",
    title: "Zielflagge",
    mood: "Fuer den Endspurt",
    asset: sportFlagSticker,
    accent: "#245A74",
    ...sportStickerMeta,
    rarity: "epic",
    unlockOrder: 88,
    assetSourcePath: "assets/routinestars_sport_sticker_einzeln/routinestars_sport_10_zielflagge.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_wal",
    title: "Sanfter Wal",
    mood: "Fuer tiefe Ruhe",
    asset: oceanWhaleSticker,
    accent: "#4F8EDC",
    ...oceanStickerMeta,
    rarity: "common",
    unlockOrder: 89,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_01_wal.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_segelboot",
    title: "Segelboot",
    mood: "Fuer neue Wege",
    asset: oceanSailboatSticker,
    accent: "#7EA8C8",
    ...oceanStickerMeta,
    rarity: "common",
    unlockOrder: 90,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_02_segelboot.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_seestern",
    title: "Seestern",
    mood: "Fuer Strandfreude",
    asset: oceanStarfishSticker,
    accent: "#E76F51",
    ...oceanStickerMeta,
    rarity: "common",
    unlockOrder: 91,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_03_seestern.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_leuchtturm",
    title: "Meer-Leuchtturm",
    mood: "Fuer sichere Wege",
    asset: oceanLighthouseSticker,
    accent: "#E76F51",
    ...oceanStickerMeta,
    rarity: "rare",
    unlockOrder: 92,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_04_leuchtturm.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_schatzkarte",
    title: "Schatzkarte",
    mood: "Fuer Entdecker",
    asset: oceanMapSticker,
    accent: "#C28A2C",
    ...oceanStickerMeta,
    rarity: "uncommon",
    unlockOrder: 93,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_05_schatzkarte.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_muschel",
    title: "Perlenmuschel",
    mood: "Fuer kleine Schaetze",
    asset: oceanShellSticker,
    accent: "#EFA8C8",
    ...oceanStickerMeta,
    rarity: "common",
    unlockOrder: 94,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_06_muschel.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_delfin",
    title: "Delfin",
    mood: "Fuer leichte Spruenge",
    asset: oceanDolphinSticker,
    accent: "#4F8EDC",
    ...oceanStickerMeta,
    rarity: "rare",
    unlockOrder: 95,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_07_delfin.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_korallenriff",
    title: "Korallenriff",
    mood: "Fuer bunte Welten",
    asset: oceanCoralSticker,
    accent: "#E76F51",
    ...oceanStickerMeta,
    rarity: "epic",
    unlockOrder: 96,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_08_korallenriff.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_flaschenpost",
    title: "Flaschenpost",
    mood: "Fuer kleine Nachrichten",
    asset: oceanBottleSticker,
    accent: "#7EA8C8",
    ...oceanStickerMeta,
    rarity: "uncommon",
    unlockOrder: 97,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_09_flaschenpost.png",
    masterSize: { width: 1024, height: 1024 },
  },
  {
    id: "meer_mondwelle",
    title: "Mondwelle",
    mood: "Fuer ruhige Abende",
    asset: oceanWaveSticker,
    accent: "#4F8EDC",
    ...oceanStickerMeta,
    rarity: "uncommon",
    unlockOrder: 98,
    assetSourcePath: "assets/routinestars_meer_sticker_einzeln/routinestars_meer_10_mondwelle.png",
    masterSize: { width: 1024, height: 1024 },
  },
] satisfies GeneratedStickerV4[];
