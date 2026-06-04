import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const tempDir = mkdtempSync(join(tmpdir(), "routine-stars-stickers-"));
const requireFromTemp = createRequire(join(tempDir, "index.js"));
const catalogSource = [
  readFileSync("lib/animal-stickers.ts", "utf8"),
  readFileSync("lib/generated-stickers-v4.ts", "utf8"),
].join("\n");

const generatedV3StickerSpecs = [
  ["magie", "01", "zauberhut", "magie_zauberhut"],
  ["magie", "02", "sternenstab", "magie_sternenstab"],
  ["magie", "03", "sternendrache", "magie_sternendrache"],
  ["magie", "04", "kristalle", "magie_kristalle"],
  ["magie", "05", "einhorn", "magie_einhorn"],
  ["magie", "06", "sternentrank", "magie_sternentrank"],
  ["magie", "07", "zauberbuch", "magie_zauberbuch"],
  ["magie", "08", "schlossturm", "magie_schlossturm"],
  ["magie", "09", "schatztruhe", "magie_schatztruhe"],
  ["magie", "10", "mondlaterne", "magie_mondlaterne"],
  ["fahrzeuge", "01", "feuerwehr", "fahrzeuge_feuerwehr"],
  ["fahrzeuge", "02", "lokomotive", "fahrzeuge_lokomotive"],
  ["fahrzeuge", "03", "schulbus", "fahrzeuge_schulbus"],
  ["fahrzeuge", "04", "heissluftballon", "fahrzeuge_heissluftballon"],
  ["fahrzeuge", "05", "hubschrauber", "fahrzeuge_hubschrauber"],
  ["fahrzeuge", "06", "roller", "fahrzeuge_roller"],
  ["fahrzeuge", "07", "traktor", "fahrzeuge_traktor"],
  ["fahrzeuge", "08", "uboot", "fahrzeuge_uboot"],
  ["fahrzeuge", "09", "raketenboard", "fahrzeuge_raketenboard"],
  ["fahrzeuge", "10", "baukran", "fahrzeuge_baukran"],
  ["natur", "01", "sonnenblume", "natur_sonnenblume"],
  ["natur", "02", "regenbogen", "natur_regenbogen"],
  ["natur", "03", "berg", "natur_berg"],
  ["natur", "04", "pilzhaus", "natur_pilzhaus"],
  ["natur", "05", "apfelbaum", "natur_apfelbaum"],
  ["natur", "06", "wasserfall", "natur_wasserfall"],
  ["natur", "07", "herbstblatt", "natur_herbstblatt"],
  ["natur", "08", "muschel", "natur_muschel"],
  ["natur", "09", "regenwolke", "natur_regenwolke"],
  ["natur", "10", "tannenzapfen", "natur_tannenzapfen"],
];

const generatedV4StickerSpecs = [
  ["helden", "01", "sternencape", "helden_sternencape"],
  ["helden", "02", "mut_schild", "helden_mut_schild"],
  ["helden", "03", "helferhelm", "helden_helferhelm"],
  ["helden", "04", "freundlichkeits_megafon", "helden_freundlichkeits_megafon"],
  ["helden", "05", "mutkompass", "helden_mutkompass"],
  ["helden", "06", "rettungsrucksack", "helden_rettungsrucksack"],
  ["helden", "07", "teamhandschuhe", "helden_teamhandschuhe"],
  ["helden", "08", "funkelmaske", "helden_funkelmaske"],
  ["helden", "09", "leuchtturm", "helden_leuchtturm"],
  ["helden", "10", "heldenmedaille", "helden_heldenmedaille"],
  ["essen", "01", "erdbeere", "essen_erdbeere"],
  ["essen", "02", "banane", "essen_banane"],
  ["essen", "03", "porridge", "essen_porridge"],
  ["essen", "04", "sandwich", "essen_sandwich"],
  ["essen", "05", "suppe", "essen_suppe"],
  ["essen", "06", "cupcake", "essen_cupcake"],
  ["essen", "07", "sternkeks", "essen_sternkeks"],
  ["essen", "08", "bento_box", "essen_bento_box"],
  ["essen", "09", "orangensaft", "essen_orangensaft"],
  ["essen", "10", "eiswaffel", "essen_eiswaffel"],
  ["musik", "01", "trommel", "musik_trommel"],
  ["musik", "02", "gitarre", "musik_gitarre"],
  ["musik", "03", "tamburin", "musik_tamburin"],
  ["musik", "04", "mikrofon", "musik_mikrofon"],
  ["musik", "05", "kopfhoerer", "musik_kopfhoerer"],
  ["musik", "06", "klavier", "musik_klavier"],
  ["musik", "07", "trompete", "musik_trompete"],
  ["musik", "08", "noten", "musik_noten"],
  ["musik", "09", "plattenspieler", "musik_plattenspieler"],
  ["musik", "10", "konzertkarte", "musik_konzertkarte"],
  ["sport", "01", "fussball", "sport_fussball"],
  ["sport", "02", "basketball", "sport_basketball"],
  ["sport", "03", "sneaker", "sport_sneaker"],
  ["sport", "04", "pokal", "sport_pokal"],
  ["sport", "05", "schwimmbrille", "sport_schwimmbrille"],
  ["sport", "06", "springseil", "sport_springseil"],
  ["sport", "07", "zielscheibe", "sport_zielscheibe"],
  ["sport", "08", "skateboard", "sport_skateboard"],
  ["sport", "09", "yogamatte", "sport_yogamatte"],
  ["sport", "10", "zielflagge", "sport_zielflagge"],
  ["meer", "01", "wal", "meer_wal"],
  ["meer", "02", "segelboot", "meer_segelboot"],
  ["meer", "03", "seestern", "meer_seestern"],
  ["meer", "04", "leuchtturm", "meer_leuchtturm"],
  ["meer", "05", "schatzkarte", "meer_schatzkarte"],
  ["meer", "06", "muschel", "meer_muschel"],
  ["meer", "07", "delfin", "meer_delfin"],
  ["meer", "08", "korallenriff", "meer_korallenriff"],
  ["meer", "09", "flaschenpost", "meer_flaschenpost"],
  ["meer", "10", "mondwelle", "meer_mondwelle"],
];

const requiredCatalogIds = [
  "weltraum_rakete",
  "weltraum_planet",
  "weltraum_astronautenhelm",
  "weltraum_mondrover",
  "gute_nacht_schlafmond",
  "gute_nacht_traumwolke",
  "gute_nacht_sternenbuch",
  "gute_nacht_pyjama_baer",
  ...generatedV3StickerSpecs.map(([, , , id]) => id),
  ...generatedV4StickerSpecs.map(([, , , id]) => id),
];
const expectedStickerAssets = [
  ["assets/routinestars_tier_sticker_einzeln/routinestars_01_loewe.png", 325, 359],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_03_giraffe.png", 297, 362],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_04_panda.png", 301, 329],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_05_hase.png", 288, 362],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_06_fuchs.png", 294, 362],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_07_baer.png", 336, 362],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_09_katze.png", 294, 346],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_10_hund.png", 307, 347],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_11_eule.png", 288, 336],
  ["assets/routinestars_tier_sticker_einzeln/routinestars_12_schildkroete.png", 325, 326],
  ["assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_01_rakete.png", 360, 360],
  ["assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_02_planet.png", 360, 360],
  ["assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_03_astronautenhelm.png", 360, 360],
  ["assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_04_mondrover.png", 360, 360],
  ["assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_01_schlafmond.png", 360, 360],
  ["assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_02_traumwolke.png", 360, 360],
  ["assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_03_sternenbuch.png", 360, 360],
  ["assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_04_pyjama_baer.png", 360, 360],
  ["assets/sticker-masters/weltraum/routinestars_weltraum_01_rakete_master.png", 1024, 1024],
  ["assets/sticker-masters/weltraum/routinestars_weltraum_02_planet_master.png", 1024, 1024],
  ["assets/sticker-masters/weltraum/routinestars_weltraum_03_astronautenhelm_master.png", 1024, 1024],
  ["assets/sticker-masters/weltraum/routinestars_weltraum_04_mondrover_master.png", 1024, 1024],
  ["assets/sticker-masters/gute-nacht/routinestars_gute_nacht_01_schlafmond_master.png", 1024, 1024],
  ["assets/sticker-masters/gute-nacht/routinestars_gute_nacht_02_traumwolke_master.png", 1024, 1024],
  ["assets/sticker-masters/gute-nacht/routinestars_gute_nacht_03_sternenbuch_master.png", 1024, 1024],
  ["assets/sticker-masters/gute-nacht/routinestars_gute_nacht_04_pyjama_baer_master.png", 1024, 1024],
  ...generatedV3StickerSpecs.flatMap(([theme, number, slug]) => [
    [`assets/routinestars_${theme}_sticker_einzeln/routinestars_${theme}_${number}_${slug}.png`, 360, 360],
    [`assets/sticker-masters/${theme}/routinestars_${theme}_${number}_${slug}_master.png`, 1024, 1024],
  ]),
  ...generatedV4StickerSpecs.flatMap(([theme, number, slug]) => [
    [`assets/routinestars_${theme}_sticker_einzeln/routinestars_${theme}_${number}_${slug}.png`, 360, 360],
    [`assets/sticker-masters/${theme}/routinestars_${theme}_${number}_${slug}_master.png`, 1024, 1024],
  ]),
];

for (const stickerId of requiredCatalogIds) {
  assert.match(catalogSource, new RegExp(`id: "${stickerId}"`), `${stickerId} is missing from catalog`);
}

assert.equal((catalogSource.match(/id: "/g) ?? []).length, 98, "catalog should contain 98 stickers");

for (const [assetPath, width, height] of expectedStickerAssets) {
  assert.equal(existsSync(assetPath), true, `${assetPath} is missing`);
  const metadata = execFileSync(
    "sips",
    ["-g", "pixelWidth", "-g", "pixelHeight", "-g", "hasAlpha", assetPath],
    { encoding: "utf8" }
  );

  assert.match(metadata, new RegExp(`pixelWidth: ${width}`), `${assetPath} width changed`);
  assert.match(metadata, new RegExp(`pixelHeight: ${height}`), `${assetPath} height changed`);
  assert.match(metadata, /hasAlpha: yes/, `${assetPath} must keep transparency`);
}

try {
  execFileSync(
    "npx",
    [
      "tsc",
      "lib/sticker-reward-logic.ts",
      "--outDir",
      tempDir,
      "--module",
      "commonjs",
      "--target",
      "ES2020",
      "--esModuleInterop",
      "--skipLibCheck",
      "--strict",
      "--moduleResolution",
      "node",
    ],
    { stdio: "pipe" }
  );

  const {
    DEFAULT_STICKER_REWARD_SETTINGS,
    canClaimStickerRewardEvent,
    createStickerRewardEvent,
    getStickerRewardModeLabel,
  } = requireFromTemp(join(tempDir, "sticker-reward-logic.js"));

  const routineSettings = {
    ...DEFAULT_STICKER_REWARD_SETTINGS,
    rewardMode: "routine_complete",
  };
  const routineEvent = createStickerRewardEvent({
    childId: "child-1",
    routineId: "routine-morning",
    routineName: "Morgenroutine",
    date: "2026-06-04",
    completedRoutineCountToday: 1,
    totalRoutineCountToday: 2,
    settings: routineSettings,
  });

  assert.equal(routineEvent.reason, "routine_complete");
  assert.equal(routineEvent.eventKey, "2026-06-04:routine-morning");
  assert.equal(routineEvent.routineName, "Morgenroutine");
  assert.equal(
    canClaimStickerRewardEvent(["2026-06-04:routine-evening"], routineEvent.eventKey),
    true
  );
  assert.equal(
    canClaimStickerRewardEvent(["2026-06-04:routine-morning"], routineEvent.eventKey),
    false
  );

  const waitingDailyEvent = createStickerRewardEvent({
    childId: "child-1",
    routineId: "routine-morning",
    routineName: "Morgenroutine",
    date: "2026-06-04",
    completedRoutineCountToday: 1,
    totalRoutineCountToday: 2,
    settings: {
      ...DEFAULT_STICKER_REWARD_SETTINGS,
      rewardMode: "daily_complete",
    },
  });
  assert.equal(waitingDailyEvent, null);

  const dailyEvent = createStickerRewardEvent({
    childId: "child-1",
    routineId: "routine-evening",
    routineName: "Abendroutine",
    date: "2026-06-04",
    completedRoutineCountToday: 2,
    totalRoutineCountToday: 2,
    settings: {
      ...DEFAULT_STICKER_REWARD_SETTINGS,
      rewardMode: "daily_complete",
    },
  });

  assert.equal(dailyEvent.reason, "daily_complete");
  assert.equal(dailyEvent.eventKey, "2026-06-04:daily-complete");
  assert.equal(getStickerRewardModeLabel("routine_complete"), "Jede abgeschlossene Routine");
  assert.equal(getStickerRewardModeLabel("daily_complete"), "Ganzer Tag abgeschlossen");

  console.log("Sticker reward logic and asset checks passed.");
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}
