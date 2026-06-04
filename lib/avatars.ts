import type { AvatarAssetId, AvatarValue } from "@/lib/types";
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

export const DEFAULT_AVATAR_VALUE: Extract<AvatarValue, { type: "emoji" }> = {
  type: "emoji",
  emoji: "🦁",
};

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

export const avatarCategories = {
  Tiere: [
    { id: "a1", label: "Löwe", value: { type: "emoji", emoji: "🦁" } },
    { id: "a2", label: "Hase", value: { type: "emoji", emoji: "🐰" } },
    { id: "a3", label: "Bär", value: { type: "emoji", emoji: "🐻" } },
    { id: "a4", label: "Fuchs", value: { type: "emoji", emoji: "🦊" } },
  ],
  Plüschis: [
    { id: "a5", label: "Teddy", value: { type: "emoji", emoji: "🧸" } },
    { id: "a6", label: "Einhorn", value: { type: "emoji", emoji: "🦄" } },
    { id: "a7", label: "Dino", value: { type: "emoji", emoji: "🦕" } },
    { id: "a8", label: "Ente", value: { type: "emoji", emoji: "🐥" } },
  ],
  Stars: [
    { id: "a9", label: "Stern", value: { type: "emoji", emoji: "⭐" } },
    { id: "a10", label: "Rakete", value: { type: "emoji", emoji: "🚀" } },
    { id: "a11", label: "Regenbogen", value: { type: "emoji", emoji: "🌈" } },
    { id: "a12", label: "Sonne", value: { type: "emoji", emoji: "☀️" } },
  ],
  Superhelden: SUPERHERO_AVATARS.map((avatar) => ({
    id: avatar.id,
    label: avatar.label,
    value: { type: "asset", id: avatar.id },
  })),
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

export function getAvatarAsset(id: AvatarAssetId) {
  return SUPERHERO_AVATARS.find((avatar) => avatar.id === id)?.asset;
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
