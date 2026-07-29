#!/usr/bin/env python3
"""Generate lib/avatar-catalog.ts from the PNG set."""
import os, re

SRC = "/Users/morina/Documents/RoutineStars-mobile/assets/avatars/Avatare_512x512"
OUT = "/Users/morina/Documents/RoutineStars-mobile/lib/avatar-catalog.ts"

LABELS = {
 "golden_retriever":"Golden Retriever","gray_cat":"Graue Katze","fox":"Fuchs","bear":"Bär",
 "panda":"Panda","white_rabbit":"Hase","lion":"Löwe","tiger":"Tiger","monkey":"Affe",
 "koala":"Koala","cow":"Kuh","pig":"Schwein","mouse":"Maus","raccoon":"Waschbär","wolf":"Wolf",
 "deer":"Reh","elephant":"Elefant","giraffe":"Giraffe","zebra":"Zebra","graduate_owl":"Eule",
 "penguin":"Pinguin","duck":"Ente","frog":"Frosch","turtle":"Schildkröte","unicorn":"Einhorn",
 "green_dragon":"Grüner Drache","shark":"Hai","otter":"Otter","red_panda":"Roter Panda",
 "hedgehog":"Igel","superhero_boy":"Superheld","astronaut_girl":"Astronautin",
 "pirate_boy":"Pirat","ninja":"Ninja","knight":"Ritter","princess":"Prinzessin",
 "wizard":"Zauberer","fairy":"Fee","mermaid":"Meerjungfrau","king":"König","queen":"Königin",
 "firefighter":"Feuerwehr","police_officer":"Polizei","doctor":"Ärztin","chef":"Koch",
 "royal_girl":"Krone","pilot":"Pilot","explorer_girl":"Entdeckerin","cowboy":"Cowboy",
 "construction_worker":"Bauarbeiter","magician":"Magier","gamer":"Gamer",
 "scientist":"Forscherin","detective":"Detektiv","robot":"Roboter",
 "purple_hair_girl":"Lila Haare","green_glasses_boy":"Grüne Brille",
 "curly_hair_girl":"Lockenkopf","blue_hair_boy":"Blaue Haare","pink_hair_girl":"Pinke Haare",
 "blue_dragon":"Blauer Drache","white_cat":"Weiße Katze","alpaca":"Alpaka","sloth":"Faultier",
 "border_collie":"Border Collie","orange_cat":"Rote Katze","corgi":"Corgi","peacock":"Pfau",
 "squirrel":"Eichhörnchen","parrot":"Papagei",
}

# Category by file number.
HEROES = set(range(31, 42)) | {46, 51, 55}
JOBS   = {42, 43, 44, 45, 47, 48, 49, 50, 52, 53, 54}
KIDS   = set(range(56, 61))

def category(num):
    if num in HEROES: return "Helden"
    if num in JOBS:   return "Berufe"
    if num in KIDS:   return "Kinder"
    return "Tiere"

files = sorted(f for f in os.listdir(SRC) if f.endswith(".png"))
entries = []
for f in files:
    m = re.match(r"avatar_(\d+)_(.+)\.png$", f)
    num, slug = int(m.group(1)), m.group(2)
    entries.append({
        "id": f[:-4],
        "var": "av" + str(num).zfill(2),
        "file": f,
        "label": LABELS.get(slug, slug.replace("_", " ").title()),
        "cat": category(num),
    })

imports = "\n".join(
    f'import {e["var"]} from "@/assets/avatars/Avatare_512x512/{e["file"]}";' for e in entries
)

def block(cat):
    rows = [e for e in entries if e["cat"] == cat]
    body = "\n".join(
        f'  {{ id: "{e["id"]}", label: "{e["label"]}", asset: {e["var"]} }},' for e in rows
    )
    return body, len(rows)

parts = []
for cat, const in [("Tiere","ANIMAL_AVATARS"),("Helden","HERO_AVATARS"),
                   ("Berufe","JOB_AVATARS"),("Kinder","KID_AVATARS")]:
    body, n = block(cat)
    parts.append(f"/** {n} entries. */\nexport const {const}: AvatarAssetEntry[] = [\n{body}\n];")

union = "\n".join(f'  | "{e["id"]}"' for e in entries)

out = f'''// GENERATED — do not edit by hand.
// Regenerate with scripts/generate-avatar-catalog.mjs after changing the PNG set
// in assets/avatars/Avatare_512x512.
//
// Metro needs literal require paths, so every avatar is imported explicitly.
import type {{ AvatarAssetEntry }} from "@/lib/avatars";

{imports}

/** Ids of the illustrated avatar set, mirrored by AvatarAssetId in lib/types. */
export type IllustratedAvatarId =
{union};

{chr(10).join(parts)}

/** Display order of the picker's category chips. */
export const AVATAR_CATEGORY_ORDER = ["Tiere", "Helden", "Berufe", "Kinder"] as const;
'''

with open(OUT, "w") as fh:
    fh.write(out)

print("entries:", len(entries))
for c in ["Tiere","Helden","Berufe","Kinder"]:
    print(" ", c, sum(1 for e in entries if e["cat"] == c))
