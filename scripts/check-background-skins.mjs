import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const registryPath = "lib/background-skins.ts";
const backgroundSourcePath = "components/ui/themed-screen-background.tsx";
const typesPath = "lib/types.ts";
const useChildrenPath = "hooks/use-children.ts";

assert.equal(existsSync(registryPath), true, "background skin registry is missing");

const registrySource = readFileSync(registryPath, "utf8");
const backgroundSource = readFileSync(backgroundSourcePath, "utf8");
const typesSource = readFileSync(typesPath, "utf8");
const useChildrenSource = readFileSync(useChildrenPath, "utf8");

const expectedSkinIds = ["none", "space", "animals", "magic", "nature", "heroes"];
const expectedAssets = [
  "assets/background-skins/space.png",
  "assets/background-skins/animals.png",
  "assets/background-skins/magic.png",
  "assets/background-skins/nature.png",
  "assets/background-skins/heroes.png",
];

for (const skinId of expectedSkinIds) {
  assert.match(
    registrySource,
    new RegExp(`id: "${skinId}"`),
    `${skinId} is missing from BACKGROUND_SKINS`
  );
}

assert.match(typesSource, /export type BackgroundSkinId/, "BackgroundSkinId type is missing");
assert.match(typesSource, /backgroundSkin\?: BackgroundSkinId/, "Child.backgroundSkin is missing");
assert.match(useChildrenSource, /normalizeBackgroundSkin/, "children are not normalizing background skins");
assert.match(
  backgroundSource,
  /backgroundSkin\?: BackgroundSkinId/,
  "ThemedScreenBackground does not accept backgroundSkin"
);

assert.equal(
  (registrySource.match(/id: "/g) ?? []).length,
  expectedSkinIds.length,
  "registry should contain exactly six skin choices"
);

for (const assetPath of expectedAssets) {
  assert.equal(existsSync(assetPath), true, `${assetPath} is missing`);
  const metadata = execFileSync(
    "sips",
    ["-g", "pixelWidth", "-g", "pixelHeight", assetPath],
    { encoding: "utf8" }
  );

  assert.match(metadata, /pixelWidth: 900/, `${assetPath} width changed`);
  assert.match(metadata, /pixelHeight: 1600/, `${assetPath} height changed`);
}

console.log("Background skin checks passed");
