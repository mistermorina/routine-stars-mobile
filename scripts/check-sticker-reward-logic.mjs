import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const tempDir = mkdtempSync(join(tmpdir(), "routine-stars-stickers-"));
const requireFromTemp = createRequire(join(tempDir, "index.js"));

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

  console.log("Sticker reward logic checks passed.");
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}
