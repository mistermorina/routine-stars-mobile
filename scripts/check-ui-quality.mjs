#!/usr/bin/env node
/**
 * UI quality guardrails for the token contract in
 * `.claude/skills/routine-stars-polish/SKILL.md` / `docs/ai/DESIGN_DIRECTION.md`.
 *
 * Checks (all scoped to `app/` + `components/`):
 *   1. no horizontal ScrollView in visible UI
 *   2. no arbitrary `text-[<14px]` classes
 *   3. no interactive target smaller than 44x44
 *   4. no `fontSize:` style value below 12 (no exemptions — tab labels included)
 *   5. no inline `shadowOpacity` above 0.08 (use `shadowPresets` from lib/theme)
 *   6. no RN-`Modal` `animationType="fade"` (dialogs animate via Reanimated)
 *   7. no NEW raw hex literals beyond `scripts/hex-allowlist.json`
 *
 * Hex sources of truth are `lib/theme.ts` and `tailwind.config.ts`; both live
 * outside the scanned directories and are listed as `exemptPaths` for the record.
 *
 * Regenerate the allowlist after a sanctioned sweep:
 *   node scripts/check-ui-quality.mjs --write-allowlist
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "components"];
const SOURCE_EXTENSIONS = new Set([".tsx", ".ts"]);
const ALLOWLIST_PATH = path.join(ROOT, "scripts", "hex-allowlist.json");

const WRITE_ALLOWLIST = process.argv.includes("--write-allowlist");

const MIN_FONT_SIZE = 12;
const MAX_SHADOW_OPACITY = 0.08;

/** Colour sources of truth — these files are supposed to contain hex. */
const EXEMPT_PATHS = ["lib/theme.ts", "tailwind.config.ts"];

// Hex colour literal: 3, 4, 6 or 8 digits, longest match first.
const HEX_PATTERN =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;

const failures = [];

function walk(dir) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) return [];

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(path.relative(ROOT, fullPath)));
      continue;
    }
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split("\n").length;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function addFailure(file, line, message) {
  failures.push(`${relative(file)}:${line} ${message}`);
}

function readAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    return { exemptPaths: EXEMPT_PATHS, allowed: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, "utf8"));
    return {
      exemptPaths: parsed.exemptPaths ?? EXEMPT_PATHS,
      allowed: parsed.allowed ?? {},
    };
  } catch (error) {
    console.error(`Could not parse ${relative(ALLOWLIST_PATH)}: ${error.message}`);
    process.exit(1);
  }
}

/** file -> { "#RRGGBB": occurrences } for every hex literal currently in the tree. */
function collectHexUsage(files) {
  const usage = {};

  for (const file of files) {
    if (EXEMPT_PATHS.includes(relative(file))) continue;

    const content = fs.readFileSync(file, "utf8");
    const counts = {};

    for (const match of content.matchAll(HEX_PATTERN)) {
      const value = match[0].toUpperCase();
      counts[value] = (counts[value] ?? 0) + 1;
    }

    if (Object.keys(counts).length > 0) {
      usage[relative(file)] = Object.fromEntries(
        Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))
      );
    }
  }

  return Object.fromEntries(
    Object.entries(usage).sort(([left], [right]) => left.localeCompare(right))
  );
}

const files = SOURCE_DIRS.flatMap(walk);

if (WRITE_ALLOWLIST) {
  const usage = collectHexUsage(files);
  const total = Object.values(usage).reduce(
    (sum, counts) => sum + Object.values(counts).reduce((inner, n) => inner + n, 0),
    0
  );

  const payload = {
    $comment: [
      "Sanctioned remainder of raw hex literals in app/ + components/.",
      "SHRINK THIS LIST, NEVER GROW IT. Every entry is design debt: the token",
      "contract (.claude/skills/routine-stars-polish/SKILL.md) says colours come",
      "from Tailwind classes, getThemePalette() or semanticColors — in that order.",
      "Values are per-file occurrence caps; adding one more fails the check.",
      "Regenerate only after a sanctioned sweep:",
      "  node scripts/check-ui-quality.mjs --write-allowlist",
    ],
    exemptPaths: EXEMPT_PATHS,
    generatedFrom: SOURCE_DIRS,
    totalAllowedOccurrences: total,
    allowed: usage,
  };

  fs.writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Wrote ${relative(ALLOWLIST_PATH)}: ${Object.keys(usage).length} files, ${total} sanctioned hex occurrences.`
  );
  process.exit(0);
}

const allowlist = readAllowlist();

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = relative(file);

  for (const match of content.matchAll(/<ScrollView[\s\S]*?\bhorizontal\b[\s\S]*?>/g)) {
    addFailure(file, lineNumberFor(content, match.index ?? 0), "horizontal ScrollView is not allowed in visible UI");
  }

  for (const match of content.matchAll(/text-\[(?:9|10|11|12|13)px\]/g)) {
    addFailure(file, lineNumberFor(content, match.index ?? 0), "arbitrary text below 14px is not allowed");
  }

  for (const match of content.matchAll(/<(?:Pressable|Button)\b[\s\S]*?>/g)) {
    const tag = match[0];
    if (/\b(?:h-9|h-10\s+w-10|h-8\s+w-8|h-6\s+w-6|h-5\s+w-5)\b/.test(tag)) {
      addFailure(file, lineNumberFor(content, match.index ?? 0), "interactive target appears smaller than 44x44");
    }
  }

  // Type floor — applies everywhere, tab labels included.
  for (const match of content.matchAll(/fontSize:\s*(\d+(?:\.\d+)?)/g)) {
    const size = Number.parseFloat(match[1]);
    if (size < MIN_FONT_SIZE) {
      addFailure(
        file,
        lineNumberFor(content, match.index ?? 0),
        `fontSize: ${match[1]} is below the ${MIN_FONT_SIZE}px floor`
      );
    }
  }

  // Elevation — presets cap at 0.08, ad-hoc shadow objects are out.
  for (const match of content.matchAll(/shadowOpacity:\s*(\d*\.?\d+)/g)) {
    const opacity = Number.parseFloat(match[1]);
    if (opacity > MAX_SHADOW_OPACITY) {
      addFailure(
        file,
        lineNumberFor(content, match.index ?? 0),
        `inline shadowOpacity ${match[1]} exceeds ${MAX_SHADOW_OPACITY} — use shadowPresets from lib/theme`
      );
    }
  }

  // RN modal fade double-animates the Reanimated overlay in components/ui/dialog.tsx.
  for (const match of content.matchAll(/animationType=(?:"fade"|'fade'|\{\s*"fade"\s*\}|\{\s*'fade'\s*\})/g)) {
    addFailure(
      file,
      lineNumberFor(content, match.index ?? 0),
      'animationType="fade" is not allowed — dialogs animate via Reanimated (animationType="none")'
    );
  }

  // Raw hex literals beyond the sanctioned remainder. Colour sources of truth
  // (`exemptPaths`) are skipped wholesale — they are *supposed* to hold hex.
  if (!allowlist.exemptPaths.includes(rel)) {
    const allowedForFile = allowlist.allowed[rel] ?? {};
    const seen = {};

    for (const match of content.matchAll(HEX_PATTERN)) {
      const value = match[0].toUpperCase();
      seen[value] = (seen[value] ?? 0) + 1;

      if (seen[value] > (allowedForFile[value] ?? 0)) {
        const budget = allowedForFile[value] ?? 0;
        addFailure(
          file,
          lineNumberFor(content, match.index ?? 0),
          budget === 0
            ? `new hex literal ${match[0]} — use a Tailwind token, getThemePalette() or semanticColors`
            : `hex literal ${match[0]} exceeds its allowlisted budget of ${budget}`
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error("UI quality check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(
    "\nHex findings that are genuinely sanctioned (one-off SVG illustration fills) belong in\n" +
      "scripts/hex-allowlist.json — regenerate with: node scripts/check-ui-quality.mjs --write-allowlist"
  );
  process.exit(1);
}

console.log("UI quality checks passed.");
