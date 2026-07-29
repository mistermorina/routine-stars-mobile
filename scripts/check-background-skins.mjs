import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const registryPath = "lib/background-skins.ts";
const backgroundSourcePath = "components/ui/themed-screen-background.tsx";
const typesPath = "lib/types.ts";
// Child normalization moved out of hooks/use-children.ts into the provider in
// Phase 1. hooks/use-children.ts is now a thin re-export, so asserting there
// only proved the compat shim still mentions the helper in a docstring.
const childrenProviderPath = "contexts/children-context.tsx";

assert.equal(existsSync(registryPath), true, "background skin registry is missing");
assert.equal(existsSync(childrenProviderPath), true, "children provider is missing");

const registrySource = readFileSync(registryPath, "utf8");
const backgroundSource = readFileSync(backgroundSourcePath, "utf8");
const typesSource = readFileSync(typesPath, "utf8");
const childrenProviderSource = readFileSync(childrenProviderPath, "utf8");

// Artwork ships at iPhone point size with an @2x companion; Metro picks the
// density variant, so only the base file is referenced from the registry.
const SKIN_WIDTH = 430;
const SKIN_HEIGHT = 932;

const expectedSkinIds = [
  "none",
  "wolken",
  "sonnenaufgang",
  "regenbogen",
  "konfetti",
  "sportplatz",
  "ozean",
  "minzwald",
  "dschungel",
  "schatzkarte",
  "schneewelt",
  "sternennacht",
  "weltraum",
];
const expectedGradientSkinIds = [
  "verlauf-blau",
  "verlauf-tuerkis",
  "verlauf-limette",
  "verlauf-gruen",
  "verlauf-bernstein",
  "verlauf-koralle",
  "verlauf-magenta",
  "verlauf-violett",
];

for (const skinId of expectedSkinIds) {
  assert.match(
    registrySource,
    new RegExp(`id: "${skinId}"`),
    `${skinId} is missing from BACKGROUND_SKINS`
  );
}

assert.equal(
  (registrySource.match(/kind: "image"/g) ?? []).length,
  expectedSkinIds.length - 1,
  `registry should contain exactly ${expectedSkinIds.length - 1} illustrated skins plus the default`
);
assert.equal(
  (registrySource.match(/kind: "none"/g) ?? []).length,
  1,
  "registry should contain exactly one default background"
);

for (const skinId of expectedGradientSkinIds) {
  assert.match(
    registrySource,
    new RegExp(`\\["${skinId}",\\s*"\\w+"\\]`),
    `${skinId} is missing from GRADIENT_SKINS`
  );
  assert.match(
    typesSource,
    new RegExp(`\\| "${skinId}"`),
    `${skinId} is missing from GradientSkinId`
  );
}

assert.equal(
  (registrySource.match(/\["verlauf-/g) ?? []).length,
  expectedGradientSkinIds.length,
  `registry should contain exactly ${expectedGradientSkinIds.length} gradient choices`
);

assert.match(typesSource, /export type BackgroundSkinId/, "BackgroundSkinId type is missing");
assert.match(typesSource, /backgroundSkin\?: BackgroundSkinId/, "Child.backgroundSkin is missing");
assert.match(
  registrySource,
  /const LEGACY_SKIN_ALIASES/,
  "legacy skin aliases are missing — devices on the pre-illustration ids would lose their skin"
);
assert.match(
  childrenProviderSource,
  /import\s*\{[^}]*normalizeBackgroundSkin[^}]*\}\s*from\s*"@\/lib\/background-skins"/,
  "children provider does not import normalizeBackgroundSkin"
);
assert.match(
  childrenProviderSource,
  /backgroundSkin:\s*normalizeBackgroundSkin\(/,
  "children provider does not normalize Child.backgroundSkin on read/write"
);
assert.match(
  backgroundSource,
  /backgroundSkin\?: BackgroundSkinId/,
  "ThemedScreenBackground does not accept backgroundSkin"
);
assert.match(
  backgroundSource,
  /getBackgroundSkinRamp\(skin\)/,
  "ThemedScreenBackground is not using the shared neutral-or-hued ramp"
);

// --- artwork + contrast -----------------------------------------------------
// A skin is painted over the light themed background at `imageOpacity`, so a
// dark illustration at full cover would leave body text unreadable. Measure the
// real pixels and assert the composite still clears WCAG AA for body text.

const FOREGROUND = [0x1a, 0x1a, 0x2e]; // semanticColors.foreground
// Darkest of the three themed backgrounds (lib/theme.ts) — worst case.
const BACKGROUND_BASE = [0xf6, 0xf7, 0xff];
const SCRIM_OPACITY = 0.08; // matches ThemedScreenBackground
const MIN_CONTRAST = 4.5;

function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(a, b) {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/** Skin over the themed base at `opacity`, then the renderer's 8% scrim. */
function composite(skinRgb, opacity) {
  return skinRgb.map((channel, index) => {
    const base = BACKGROUND_BASE[index];
    const mixed = base * (1 - opacity) + channel * opacity;
    return mixed * (1 - SCRIM_OPACITY) + base * SCRIM_OPACITY;
  });
}

/** Decode a 24-bit BMP (bottom-up, rows padded to 4 bytes). */
function readBmpRows(path) {
  const data = readFileSync(path);
  const pixelOffset = data.readUInt32LE(10);
  const width = data.readInt32LE(18);
  const rawHeight = data.readInt32LE(22);
  const bitsPerPixel = data.readUInt16LE(28);
  assert.equal(bitsPerPixel, 24, `${path}: expected a 24-bit BMP`);

  const bottomUp = rawHeight > 0;
  const height = Math.abs(rawHeight);
  const rowBytes = Math.ceil((width * 3) / 4) * 4;

  return Array.from({ length: height }, (_, y) => {
    const sourceY = bottomUp ? height - 1 - y : y;
    const base = pixelOffset + sourceY * rowBytes;
    let r = 0;
    let g = 0;
    let b = 0;
    for (let x = 0; x < width; x += 1) {
      b += data[base + x * 3];
      g += data[base + x * 3 + 1];
      r += data[base + x * 3 + 2];
    }
    return [r / width, g / width, b / width];
  });
}

const skinEntries = [
  ...registrySource.matchAll(
    /\{\s*id: "([^"]+)",\s*kind: "(?:none|image)"[\s\S]*?imageOpacity: ([\d.]+)/g
  ),
].map(([, id, opacity]) => ({ id, opacity: Number(opacity) }));

assert.equal(
  skinEntries.length,
  expectedSkinIds.length,
  "every skin must declare an imageOpacity"
);

const workDir = mkdtempSync(join(tmpdir(), "routine-stars-skins-"));

try {
  for (const { id, opacity } of skinEntries) {
    if (id === "none") continue;

    const assetPath = `assets/background-skins/skin-${id}.png`;
    const retinaPath = `assets/background-skins/skin-${id}@2x.png`;
    assert.equal(existsSync(assetPath), true, `${assetPath} is missing`);
    assert.equal(existsSync(retinaPath), true, `${retinaPath} is missing`);

    const metadata = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", assetPath], {
      encoding: "utf8",
    });
    assert.match(metadata, new RegExp(`pixelWidth: ${SKIN_WIDTH}`), `${assetPath} width changed`);
    assert.match(metadata, new RegExp(`pixelHeight: ${SKIN_HEIGHT}`), `${assetPath} height changed`);

    const retinaMetadata = execFileSync(
      "sips",
      ["-g", "pixelWidth", "-g", "pixelHeight", retinaPath],
      { encoding: "utf8" }
    );
    assert.match(
      retinaMetadata,
      new RegExp(`pixelWidth: ${SKIN_WIDTH * 2}`),
      `${retinaPath} is not exactly 2x the base asset`
    );
    assert.match(
      retinaMetadata,
      new RegExp(`pixelHeight: ${SKIN_HEIGHT * 2}`),
      `${retinaPath} is not exactly 2x the base asset`
    );

    // Downscale into a small BMP; averages are all this check needs.
    const bmpPath = join(workDir, `${id}.bmp`);
    execFileSync(
      "sips",
      ["-z", "93", "43", "-s", "format", "bmp", assetPath, "--out", bmpPath],
      { stdio: "ignore" }
    );

    const rows = readBmpRows(bmpPath);
    // Content band: below the header, above the tab bar — where text sits.
    const from = Math.floor(rows.length * 0.12);
    const to = Math.floor(rows.length * 0.78);
    const band = rows.slice(from, to);

    let worstRatio = Infinity;
    for (const row of band) {
      const ratio = contrastRatio(
        relativeLuminance(FOREGROUND),
        relativeLuminance(composite(row, opacity))
      );
      worstRatio = Math.min(worstRatio, ratio);
    }

    assert.ok(
      worstRatio >= MIN_CONTRAST,
      `skin "${id}" leaves body text at ${worstRatio.toFixed(2)}:1 (needs ${MIN_CONTRAST}:1). ` +
        `Lower its imageOpacity (currently ${opacity}) so the light background shows through.`
    );
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(
  `Background skin checks passed (${skinEntries.length - 1} illustrated skins, ` +
    `${expectedGradientSkinIds.length} gradients, contrast verified)`
);
