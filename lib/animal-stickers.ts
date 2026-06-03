import type { AnimalStickerId } from "@/lib/types";
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
}

export const ANIMAL_STICKERS: AnimalSticker[] = [
  {
    id: "loewe",
    title: "Mutiger Löwe",
    mood: "Für starke Schritte",
    asset: lionSticker,
    accent: "#F7A313",
  },
  {
    id: "giraffe",
    title: "Schlaue Giraffe",
    mood: "Für Überblick",
    asset: giraffeSticker,
    accent: "#E9A427",
  },
  {
    id: "panda",
    title: "Ruhiger Panda",
    mood: "Für sanfte Tage",
    asset: pandaSticker,
    accent: "#5B6B7A",
  },
  {
    id: "hase",
    title: "Flotter Hase",
    mood: "Für Tempo",
    asset: bunnySticker,
    accent: "#EFA8C8",
  },
  {
    id: "fuchs",
    title: "Cleverer Fuchs",
    mood: "Für gute Ideen",
    asset: foxSticker,
    accent: "#F97316",
  },
  {
    id: "baer",
    title: "Gemütlicher Bär",
    mood: "Für Ausdauer",
    asset: bearSticker,
    accent: "#A66A35",
  },
  {
    id: "katze",
    title: "Feine Katze",
    mood: "Für Fokus",
    asset: catSticker,
    accent: "#7C55E7",
  },
  {
    id: "hund",
    title: "Treuer Hund",
    mood: "Für Dranbleiben",
    asset: dogSticker,
    accent: "#4F8EDC",
  },
  {
    id: "eule",
    title: "Wache Eule",
    mood: "Für Lernmomente",
    asset: owlSticker,
    accent: "#5BB68A",
  },
  {
    id: "schildkroete",
    title: "Starke Schildkröte",
    mood: "Für kleine Schritte",
    asset: turtleSticker,
    accent: "#3BAF78",
  },
];

export function getAnimalSticker(stickerId: AnimalStickerId) {
  return ANIMAL_STICKERS.find((sticker) => sticker.id === stickerId) ?? ANIMAL_STICKERS[0];
}
