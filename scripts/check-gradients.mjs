import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

/**
 * Contrast gate for the gradient palette.
 *
 * check-background-skins.mjs does this job for image skins by decoding PNGs
 * and sampling rows. A gradient has no file, so this computes the same numbers
 * analytically: interpolate the ramp, sample the band where content sits, take
 * the worst ratio. Same maths, same failure style — see that script for the
 * pixel-based counterpart.
 */

const gradientsPath = "lib/gradients.ts";
const designModePath = "lib/design-mode.ts";
const routineVisualsPath = "lib/routine-visuals.ts";
const routineCardPath = "components/routine-stars/routine-card.tsx";
const rewardsOverviewPath = "components/routine-stars/rewards-overview.tsx";
const taskItemPath = "components/routine-stars/task-item.tsx";

assert.equal(existsSync(gradientsPath), true, "lib/gradients.ts is missing");

const gradientsSource = readFileSync(gradientsPath, "utf8");
const designModeSource = readFileSync(designModePath, "utf8");
const routineVisualsSource = readFileSync(routineVisualsPath, "utf8");
const routineCardSource = readFileSync(routineCardPath, "utf8");
const rewardsOverviewSource = readFileSync(rewardsOverviewPath, "utf8");
const taskItemSource = readFileSync(taskItemPath, "utf8");

// --- colour maths (identical to check-background-skins.mjs) ------------------

const FOREGROUND = [0x1a, 0x1a, 0x2e]; // semanticColors.foreground
const MUTED = [0x4a, 0x4a, 0x4a]; // semanticColors.mutedForeground
const WHITE = [0xff, 0xff, 0xff];
const MIN_CONTRAST = 4.5;

/** Glass card fill over the backdrop — see getSurfaceTokens in lib/design-mode. */
const CARD_FILL_ALPHA = 0.42;

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

function ratio(fg, bg) {
  return contrastRatio(relativeLuminance(fg), relativeLuminance(bg));
}

function parseHex(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function mix(a, b, t) {
  return a.map((channel, index) => channel + (b[index] - channel) * t);
}

/** Colour of a multi-stop ramp at position t (0..1). */
function sampleRamp(colors, locations, t) {
  for (let i = 0; i < locations.length - 1; i += 1) {
    if (t >= locations[i] && t <= locations[i + 1]) {
      const span = locations[i + 1] - locations[i];
      const local = span === 0 ? 0 : (t - locations[i]) / span;
      return mix(parseHex(colors[i]), parseHex(colors[i + 1]), local);
    }
  }
  return parseHex(colors[colors.length - 1]);
}

// --- extract the palette from source ---------------------------------------
// Reading the module directly would need a TS loader; these shapes are simple
// and stable, so a scrape keeps the check dependency-free.

function extractRecord(source, constName) {
  const start = source.indexOf(`${constName}: Record<HueId, string> = {`);
  const alt = source.indexOf(`${constName}: Record<HueId, [string, string]> = {`);
  const from = start !== -1 ? start : alt;
  assert.notEqual(from, -1, `${constName} not found in ${gradientsPath}`);
  const end = source.indexOf("};", from);
  return source.slice(from, end);
}

function parsePairs(block) {
  const entries = {};
  for (const match of block.matchAll(/(\w+):\s*\["(#[0-9A-Fa-f]{6})",\s*"(#[0-9A-Fa-f]{6})"\]/g)) {
    entries[match[1]] = [match[2], match[3]];
  }
  return entries;
}

function parseSingles(block) {
  const entries = {};
  for (const match of block.matchAll(/(\w+):\s*"(#[0-9A-Fa-f]{6})"/g)) {
    entries[match[1]] = match[2];
  }
  return entries;
}

const brandHues = parseSingles(extractRecord(gradientsSource, "BRAND_HUES"));
const screenRamps = parsePairs(extractRecord(gradientsSource, "SCREEN_RAMPS"));

const ctaBlock = gradientsSource.slice(
  gradientsSource.indexOf("CTA_PAIRS: Record<HueId, GradientPair> = {"),
  gradientsSource.indexOf("};", gradientsSource.indexOf("CTA_PAIRS"))
);
const ctaPairs = {};
for (const match of ctaBlock.matchAll(
  /(\w+):\s*\{\s*from:\s*"(#[0-9A-Fa-f]{6})",\s*to:\s*"(#[0-9A-Fa-f]{6})"\s*\}/g
)) {
  ctaPairs[match[1]] = { from: match[2], to: match[3] };
}

const blobBlock = gradientsSource.slice(
  gradientsSource.indexOf("BLOB_MAX_ALPHA: Record<HueId, number> = {"),
  gradientsSource.indexOf("};", gradientsSource.indexOf("BLOB_MAX_ALPHA"))
);
const blobMaxAlpha = {};
for (const match of blobBlock.matchAll(/(\w+):\s*([\d.]+)/g)) {
  blobMaxAlpha[match[1]] = Number(match[2]);
}

const blobAlphaMatch = /BLOB_ALPHA = ([\d.]+)/.exec(gradientsSource);
assert.notEqual(blobAlphaMatch, null, "BLOB_ALPHA not found");
const blobAlpha = Number(blobAlphaMatch[1]);

const hues = Object.keys(brandHues);
assert.equal(hues.length, 8, `expected 8 brand hues, found ${hues.length}`);

// --- assertions -------------------------------------------------------------

/** Where content sits: below the white cap, above the tab-bar foot. */
const CONTENT_BAND = [0.26, 0.72];
const FOOT_BAND = [0.72, 1];
const SAMPLES = 100;

function worstOverBand(colors, locations, [from, to], fg) {
  let worst = Infinity;
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = from + ((to - from) * i) / SAMPLES;
    worst = Math.min(worst, ratio(fg, sampleRamp(colors, locations, t)));
  }
  return worst;
}

for (const hue of hues) {
  const [mid, foot] = screenRamps[hue];
  const colors = ["#FFFFFF", "#FFFFFF", mid, foot];
  const locations = [0, 0.26, 0.72, 1];

  // 1. Content band carries body AND secondary text.
  for (const [label, fg] of [
    ["Fließtext", FOREGROUND],
    ["Sekundärtext", MUTED],
  ]) {
    const worst = worstOverBand(colors, locations, CONTENT_BAND, fg);
    assert.ok(
      worst >= MIN_CONTRAST,
      `screen ramp "${hue}" leaves ${label} at ${worst.toFixed(2)}:1 in the content band ` +
        `(needs ${MIN_CONTRAST}:1). Lighten its mid stop in SCREEN_RAMPS.`
    );
  }

  // 2. The foot only has to carry body text — no bare secondary text belongs
  //    there. What does sit there are glass cards, so check that composite.
  const footWorst = worstOverBand(colors, locations, FOOT_BAND, FOREGROUND);
  assert.ok(
    footWorst >= MIN_CONTRAST,
    `screen ramp "${hue}" leaves body text at ${footWorst.toFixed(2)}:1 in the foot band ` +
      `(needs ${MIN_CONTRAST}:1). Lighten its foot stop in SCREEN_RAMPS.`
  );

  const footColor = sampleRamp(colors, locations, 1);
  const overCard = mix(footColor, WHITE, CARD_FILL_ALPHA);
  const cardWorst = ratio(MUTED, overCard);
  assert.ok(
    cardWorst >= MIN_CONTRAST,
    `screen ramp "${hue}": secondary text inside a glass card over the foot is ` +
      `${cardWorst.toFixed(2)}:1 (needs ${MIN_CONTRAST}:1).`
  );

  // 3. CTA: white label against the LIGHTER stop is the governing number —
  //    averaging or checking the dark stop would pass a broken button.
  const cta = ctaPairs[hue];
  assert.ok(cta, `CTA_PAIRS is missing "${hue}"`);
  const ctaLight = ratio(WHITE, parseHex(cta.from));
  const ctaDark = ratio(WHITE, parseHex(cta.to));
  assert.ok(
    ctaLight >= MIN_CONTRAST,
    `CTA "${hue}" leaves its white label at ${ctaLight.toFixed(2)}:1 on the lighter stop ` +
      `(needs ${MIN_CONTRAST}:1). Darken \`from\` in CTA_PAIRS.`
  );
  assert.ok(
    ctaDark > ctaLight,
    `CTA "${hue}" has its stops the wrong way round — \`to\` must be the darker end.`
  );

  // 4. Blob at its cap, over the ramp's mid tone.
  const cap = Math.min(blobAlpha, blobMaxAlpha[hue]);
  const overMid = mix(sampleRamp(colors, locations, 0.5), parseHex(brandHues[hue]), cap);
  const blobWorst = ratio(MUTED, overMid);
  assert.ok(
    blobWorst >= MIN_CONTRAST,
    `blob "${hue}" at alpha ${cap} drops secondary text to ${blobWorst.toFixed(2)}:1 ` +
      `(needs ${MIN_CONTRAST}:1). Lower BLOB_MAX_ALPHA for this hue.`
  );

  // 5. Routine card: dark text over its softer, independent card wash.
  const cardRamp = screenRamps[hue];
  const titleOnWash = Math.min(
    ratio(FOREGROUND, WHITE),
    ratio(FOREGROUND, parseHex(cardRamp[0])),
    ratio(FOREGROUND, parseHex(cardRamp[1]))
  );
  assert.ok(
    titleOnWash >= MIN_CONTRAST,
    `card title for "${hue}" is ${titleOnWash.toFixed(2)}:1 on its own wash ` +
      `(needs ${MIN_CONTRAST}:1).`
  );
}

// 6. The glass accent carries white text and lives outside lib/theme.ts, so
//    check-color-contrast.mjs never sees it. It failed once at 4.34:1.
const accentMatch = /const GLASS_AZURE = getCtaGradient\("(\w+)"\)\.from;/.exec(designModeSource);
assert.notEqual(
  accentMatch,
  null,
  "GLASS_AZURE must derive from a CTA gradient so its contrast stays verified"
);
const accentRatio = ratio(WHITE, parseHex(ctaPairs[accentMatch[1]].from));
assert.ok(
  accentRatio >= MIN_CONTRAST,
  `glass accent is ${accentRatio.toFixed(2)}:1 against white text (needs ${MIN_CONTRAST}:1).`
);

// 7. Wiring: the analytical guarantees only matter if the visible components
//    consume the guarded roles instead of falling back to old ad-hoc colours.
assert.match(
  routineVisualsSource,
  /resolveHue\(routine\.color \?\? fallbackAccent\)/,
  "generic routines do not map stored hex/HSL colours through resolveHue"
);
assert.match(
  routineVisualsSource,
  /const cardGradient = getCardGradient\(hue\);/,
  "routine visuals do not expose the guarded card gradient"
);
assert.match(
  routineCardSource,
  /colors=\{visual\.cardGradient\.colors\}/,
  "routine cards do not render the guarded card gradient"
);
assert.match(
  routineCardSource,
  /locations=\{visual\.cardGradient\.locations\}/,
  "routine cards do not use the reference gradient curve"
);
assert.match(
  routineCardSource,
  /style=\{StyleSheet\.absoluteFillObject\}/,
  "routine card gradient must cover the full card instead of ending in a hard header edge"
);
assert.match(
  routineCardSource,
  /style=\{\{ color: visual\.onCard \}\}/,
  "routine card titles do not use the guarded on-card text colour"
);
assert.match(
  rewardsOverviewSource,
  /colors=\{visual\.cardGradient\.colors\}/,
  "reward cards do not render the guarded card gradient"
);
assert.doesNotMatch(
  taskItemSource,
  /<(?:BlurView|GlassTile)\b/,
  "task rows must not mount per-item blur surfaces; the parent card already blurs"
);
assert.match(
  taskItemSource,
  /const swipeBackdropAnimatedStyle = useAnimatedStyle/,
  "task swipe action must stay hidden until the row moves"
);
assert.match(
  taskItemSource,
  /backgroundColor: semanticColors\.successStrong/,
  "task swipe action must keep an accessible soft-mode fallback"
);
assert.match(
  taskItemSource,
  /<GradientFill hue="green" \/>/,
  "task swipe action must render the green CTA gradient under the glass row"
);

console.log(`Gradient checks passed (${hues.length} hues, contrast verified)`);
