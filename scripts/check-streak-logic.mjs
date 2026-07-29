import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repoRoot = resolve(process.cwd());
const tempDir = mkdtempSync(join(tmpdir(), "routine-stars-streak-"));
const requireFromTemp = createRequire(join(tempDir, "index.js"));

/**
 * Compile the real modules instead of reimplementing them, so this test fails
 * when the shipped logic changes. `child-progression.ts` pulls in
 * `activity-insights.ts`, `local-date.ts` and `types.ts` transitively.
 */
function compileRealModules() {
  const tsconfigPath = join(tempDir, "tsconfig.json");

  writeFileSync(
    tsconfigPath,
    JSON.stringify({
      compilerOptions: {
        module: "node16",
        target: "ES2020",
        moduleResolution: "node16",
        esModuleInterop: true,
        skipLibCheck: true,
        noCheck: true,
        noResolve: true,
        outDir: tempDir,
        rootDir: join(repoRoot, "lib"),
      },
      files: [
        join(repoRoot, "lib", "activity-insights.ts"),
        join(repoRoot, "lib", "child-progression.ts"),
        join(repoRoot, "lib", "local-date.ts"),
      ],
    })
  );

  execFileSync("npx", ["tsc", "--project", tsconfigPath], { stdio: "pipe" });

  // tsc keeps the "@/..." specifiers in its output; rewrite them to the sibling
  // files it just emitted so plain node can require them.
  for (const fileName of readdirSync(tempDir)) {
    if (!fileName.endsWith(".js")) continue;

    const filePath = join(tempDir, fileName);
    const source = readFileSync(filePath, "utf8");
    const rewritten = source.replaceAll('require("@/lib/', 'require("./');

    if (rewritten !== source) {
      writeFileSync(filePath, rewritten);
    }

    assert.doesNotMatch(
      rewritten,
      /require\("@\//,
      `${fileName} still contains an unresolvable alias import`
    );
  }
}

function isoDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** ISO date `offset` days before the given anchor, on the local calendar. */
function daysBefore(anchorIso, offset) {
  const date = new Date(`${anchorIso}T12:00:00`);
  date.setDate(date.getDate() - offset);
  return isoDate(date);
}

let logCounter = 0;

function makeLog(date, stars = 1, childId = "child-1") {
  logCounter += 1;
  return {
    id: `log-${logCounter}`,
    childId,
    taskId: `task-${logCounter}`,
    taskTitle: "Zähne putzen",
    date,
    stars,
  };
}

try {
  compileRealModules();

  const { getCurrentStreak, getActivityInsights } = requireFromTemp(
    join(tempDir, "activity-insights.js")
  );
  const {
    getCumulativeEarnedStars,
    getStickerAlbumEntries,
    mergeUnlockedStickerIds,
    normalizeChildProgressState,
  } = requireFromTemp(join(tempDir, "child-progression.js"));

  // A fixed anchor keeps the streak cases independent of the machine clock.
  const anchor = "2026-03-11";
  const day = (offset) => daysBefore(anchor, offset);

  assert.equal(getCurrentStreak([], anchor), 0, "empty logs must yield no streak");

  assert.equal(
    getCurrentStreak([makeLog(day(0)), makeLog(day(1)), makeLog(day(2))], anchor),
    3,
    "three consecutive days ending today must be a streak of 3"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(1)), makeLog(day(2))], anchor),
    2,
    "grace rule: a streak ending yesterday must still be shown"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(3)), makeLog(day(4)), makeLog(day(5))], anchor),
    0,
    "a streak that ended three days ago must be broken"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(2))], anchor),
    0,
    "a single active day before yesterday must be broken"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(0)), makeLog(day(1)), makeLog(day(3)), makeLog(day(4))], anchor),
    2,
    "a gap must cut the streak at the gap, not count total active days"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(0)), makeLog(day(0)), makeLog(day(0)), makeLog(day(1))], anchor),
    2,
    "several logs on the same day must count as one day"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(-1)), makeLog(day(0)), makeLog(day(1))], anchor),
    2,
    "future-dated logs must not extend the streak"
  );

  assert.equal(
    getCurrentStreak([makeLog(day(6)), makeLog(day(0))], anchor),
    1,
    "an old active day must not be chained onto today"
  );

  // The default parameter must anchor on the real local day, not on the last log.
  const realToday = isoDate(new Date());
  assert.equal(
    getCurrentStreak([makeLog(daysBefore(realToday, 1)), makeLog(daysBefore(realToday, 2))]),
    2,
    "without an explicit date the streak must anchor on the real local day"
  );
  assert.equal(
    getCurrentStreak([makeLog(daysBefore(realToday, 4)), makeLog(daysBefore(realToday, 5))]),
    0,
    "without an explicit date an old streak must still be broken"
  );

  // getActivityInsights must expose the same anchored value.
  const insights = getActivityInsights([
    makeLog(daysBefore(realToday, 0)),
    makeLog(daysBefore(realToday, 1)),
  ]);
  assert.equal(insights.currentStreak, 2, "getActivityInsights must use the anchored streak");

  const staleInsights = getActivityInsights([
    makeLog(daysBefore(realToday, 8)),
    makeLog(daysBefore(realToday, 9)),
  ]);
  assert.equal(
    staleInsights.currentStreak,
    0,
    "getActivityInsights must not report a streak from stale logs"
  );

  // Star milestones read cumulative earnings, so redeeming never rolls them back.
  const starLogs = [
    makeLog(day(3), 12),
    makeLog(day(2), 10),
    makeLog(day(1), 8),
  ];
  const progressState = normalizeChildProgressState({});
  const richChild = { id: "child-1", name: "Mia", stars: 30 };
  const brokeChild = { id: "child-1", name: "Mia", stars: 2 };

  assert.equal(getCumulativeEarnedStars(starLogs, richChild), 30);
  assert.equal(
    getCumulativeEarnedStars(starLogs, brokeChild),
    30,
    "redeeming rewards must not shrink cumulative earnings"
  );
  assert.equal(
    getCumulativeEarnedStars([], richChild),
    30,
    "the current balance is the floor for children without logs"
  );

  const entriesBefore = getStickerAlbumEntries(richChild, starLogs, [], progressState);
  const entriesAfter = getStickerAlbumEntries(brokeChild, starLogs, [], progressState);
  const findEntry = (entries, id) => entries.find((entry) => entry.sticker.id === id);

  assert.equal(findEntry(entriesBefore, "stars_25").current, 25);
  assert.equal(findEntry(entriesBefore, "stars_50").current, 30);
  assert.equal(
    findEntry(entriesAfter, "stars_25").current,
    25,
    "stars_25 progress must not drop after a redemption"
  );
  assert.equal(
    findEntry(entriesAfter, "stars_50").current,
    30,
    "stars_50 progress must not drop after a redemption"
  );
  assert.equal(findEntry(entriesAfter, "stars_50").progressPercent, 60);

  assert.equal(
    mergeUnlockedStickerIds(brokeChild, starLogs, [], progressState).includes("stars_25"),
    true,
    "stars_25 must stay unlocked after the balance was spent"
  );

  console.log("Streak anchoring and cumulative star milestones behave correctly.");
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}
