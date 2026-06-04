import { existsSync, readFileSync } from "node:fs";

const journeyPath = "lib/onboarding-journey.ts";
const welcomePath = "app/(auth)/welcome.tsx";
const setupPath = "app/(auth)/onboarding.tsx";

if (!existsSync(journeyPath)) {
  throw new Error("Missing onboarding journey content module.");
}

const journeySource = readFileSync(journeyPath, "utf8");
const welcomeSource = readFileSync(welcomePath, "utf8");
const setupSource = readFileSync(setupPath, "utf8");

const requiredScreenIds = [
  "welcome",
  "parent-value",
  "child-play",
  "stars-routines",
  "rewards-progress",
  "parent-safety",
  "ready",
];

for (const id of requiredScreenIds) {
  if (!journeySource.includes(`id: "${id}"`)) {
    throw new Error(`Onboarding journey is missing screen id "${id}".`);
  }
}

const screenCount = (journeySource.match(/id: "/g) ?? []).length;
if (screenCount !== requiredScreenIds.length) {
  throw new Error(`Expected ${requiredScreenIds.length} onboarding screens, found ${screenCount}.`);
}

const requiredCopy = [
  "Routinen werden zu kleinen Erfolgen",
  "Kinder sammeln Sterne",
  "Fortschritt wird sichtbar",
  "Belohnungen motivieren",
  "Eltern behalten den Überblick",
  "Elternbereich",
  "lokal",
];

for (const copy of requiredCopy) {
  if (!journeySource.includes(copy)) {
    throw new Error(`Onboarding copy is missing "${copy}".`);
  }
}

if (!journeySource.includes("primaryCta") || !journeySource.includes("secondaryCta")) {
  throw new Error("Onboarding screens need explicit primary and secondary CTAs.");
}

if (!welcomeSource.includes("onboardingJourney")) {
  throw new Error("Welcome screen is not driven by onboardingJourney.");
}

if (!welcomeSource.includes("screen.stepLabel")) {
  throw new Error("Welcome screen does not expose per-screen step labels.");
}

if (!setupSource.includes("TOTAL_STEPS = 3")) {
  throw new Error("Setup wizard step count changed unexpectedly.");
}

console.log("Onboarding journey content and welcome integration checks passed.");
