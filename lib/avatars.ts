import type { AvatarAssetId, AvatarValue } from "@/lib/types";
import {
  ANIMAL_AVATARS,
  HERO_AVATARS,
  JOB_AVATARS,
  KID_AVATARS,
} from "@/lib/avatar-catalog";
import superheroBoyBlue from "@/assets/avatars/superheroes/superheld_junge_blau.png";
import superheroBoyGreen from "@/assets/avatars/superheroes/superheld_junge_gruen.png";
import superheroBoyRed from "@/assets/avatars/superheroes/superheld_junge_rot.png";
import superheroBoyTurquoise from "@/assets/avatars/superheroes/superheld_junge_tuerkis.png";
import superheroBoyPurple from "@/assets/avatars/superheroes/superheld_junge_lila.png";
import superheroGirlPink from "@/assets/avatars/superheroes/superheld_maedchen_pink.png";
import superheroGirlTurquoise from "@/assets/avatars/superheroes/superheld_maedchen_tuerkis.png";
import superheroGirlYellow from "@/assets/avatars/superheroes/superheld_maedchen_gelb.png";
import superheroGirlBlue from "@/assets/avatars/superheroes/superheld_maedchen_blau.png";
import superheroGirlPurple from "@/assets/avatars/superheroes/superheld_maedchen_lila.png";

export interface AvatarOption {
  id: string;
  label: string;
  value: AvatarValue;
}

export interface AvatarAssetEntry {
  id: AvatarAssetId;
  label: string;
  asset: number;
}

export const DEFAULT_AVATAR_VALUE: Extract<AvatarValue, { type: "asset" }> = {
  type: "asset",
  id: "avatar_07_lion",
};

function toOptions(entries: AvatarAssetEntry[]): AvatarOption[] {
  return entries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    value: { type: "asset", id: entry.id },
  }));
}

export const SUPERHERO_AVATARS: AvatarAssetEntry[] = [
  { id: "superheld_junge_blau", label: "Held Blau", asset: superheroBoyBlue },
  { id: "superheld_junge_gruen", label: "Held Grün", asset: superheroBoyGreen },
  { id: "superheld_junge_rot", label: "Held Rot", asset: superheroBoyRed },
  { id: "superheld_junge_tuerkis", label: "Held Türkis", asset: superheroBoyTurquoise },
  { id: "superheld_junge_lila", label: "Held Lila", asset: superheroBoyPurple },
  { id: "superheld_maedchen_pink", label: "Heldin Pink", asset: superheroGirlPink },
  { id: "superheld_maedchen_tuerkis", label: "Heldin Türkis", asset: superheroGirlTurquoise },
  { id: "superheld_maedchen_gelb", label: "Heldin Gelb", asset: superheroGirlYellow },
  { id: "superheld_maedchen_blau", label: "Heldin Blau", asset: superheroGirlBlue },
  { id: "superheld_maedchen_lila", label: "Heldin Lila", asset: superheroGirlPurple },
];

/**
 * Picker contents. The emoji groups that used to live here were replaced by the
 * illustrated set — emoji rendered inconsistently across iOS versions and read
 * as placeholder art next to the rest of the app.
 */
export const avatarCategories = {
  Tiere: toOptions(ANIMAL_AVATARS),
  Helden: toOptions(HERO_AVATARS),
  Berufe: toOptions(JOB_AVATARS),
  Kinder: toOptions(KID_AVATARS),
} satisfies Record<string, AvatarOption[]>;

export type AvatarCategoryName = keyof typeof avatarCategories;

export function normalizeAvatarValue(value?: AvatarValue | null): Exclude<AvatarValue, string> {
  if (!value) {
    return DEFAULT_AVATAR_VALUE;
  }

  if (typeof value === "string") {
    return { type: "emoji", emoji: value };
  }

  if (value.type === "emoji" && value.emoji.trim()) {
    return value;
  }

  if (value.type === "asset" && getAvatarAsset(value.id)) {
    return value;
  }

  if (value.type === "photo" && value.uri.trim()) {
    return value;
  }

  return DEFAULT_AVATAR_VALUE;
}

const ALL_AVATAR_ENTRIES: AvatarAssetEntry[] = [
  ...ANIMAL_AVATARS,
  ...HERO_AVATARS,
  ...JOB_AVATARS,
  ...KID_AVATARS,
  ...SUPERHERO_AVATARS,
];

export function getAvatarAsset(id: AvatarAssetId) {
  return ALL_AVATAR_ENTRIES.find((avatar) => avatar.id === id)?.asset;
}

export function getAvatarKey(value?: AvatarValue | null) {
  const avatar = normalizeAvatarValue(value);

  if (avatar.type === "emoji") return `emoji:${avatar.emoji}`;
  if (avatar.type === "asset") return `asset:${avatar.id}`;
  return `photo:${avatar.uri}`;
}

export function areAvatarValuesEqual(left?: AvatarValue | null, right?: AvatarValue | null) {
  return getAvatarKey(left) === getAvatarKey(right);
}
