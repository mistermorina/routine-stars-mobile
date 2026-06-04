import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const tempDir = mkdtempSync(join(tmpdir(), "routine-stars-stickers-"));
const requireFromTemp = createRequire(join(tempDir, "index.js"));
const catalogSource = readFileSync("lib/animal-stickers.ts", "utf8");
const requiredCatalogIds = [
  "weltraum_rakete",
  "weltraum_planet",
  "weltraum_astronautenhelm",
  "weltraum_mondrover",
  "gute_nacht_schlafmond",
  "gute_nacht_traumwolke",
  "gute_nacht_sternenbuch",
  "gute_nacht_pyjama_baer",
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
];

for (const stickerId of requiredCatalogIds) {
  assert.match(catalogSource, new RegExp(`id: "${stickerId}"`), `${stickerId} is missing from catalog`);
}

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
