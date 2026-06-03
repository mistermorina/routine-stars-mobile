# Phase 1 Stability Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the main app flow after onboarding, repair the local quality tooling, and establish a repeatable smoke baseline.

**Architecture:** Keep the work narrowly scoped. Fix the Dashboard crash at its source in `TaskTimerModal`, add a small regression check for that source-order bug, align Expo SDK patch versions, and make the existing lint script executable.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router, NativeWind, TypeScript, Node-based smoke script, ESLint Expo config.

---

### Task 1: Dashboard Crash Regression

**Files:**
- Create: `scripts/check-task-timer-modal-order.mjs`
- Modify: `package.json`
- Modify: `components/routine-stars/task-timer-modal.tsx`

- [ ] **Step 1: Add a failing regression check**

Create `scripts/check-task-timer-modal-order.mjs`:

```js
import { readFileSync } from "node:fs";

const filePath = "components/routine-stars/task-timer-modal.tsx";
const source = readFileSync(filePath, "utf8");

const animatedPropsIndex = source.indexOf("const circleAnimatedProps = useAnimatedProps");
const circumferenceIndex = source.indexOf("const circumference =");

if (animatedPropsIndex === -1) {
  throw new Error("TaskTimerModal is missing circleAnimatedProps.");
}

if (circumferenceIndex === -1) {
  throw new Error("TaskTimerModal is missing circumference.");
}

if (circumferenceIndex > animatedPropsIndex) {
  throw new Error(
    "TaskTimerModal declares circumference after useAnimatedProps; this causes a TDZ crash on mount."
  );
}

console.log("TaskTimerModal geometry is declared before animated props.");
```

Add this script to `package.json`:

```json
"test:smoke": "node scripts/check-task-timer-modal-order.mjs"
```

- [ ] **Step 2: Run the check and verify it fails**

Run: `npm run test:smoke`

Expected: FAIL with `TaskTimerModal declares circumference after useAnimatedProps`.

- [ ] **Step 3: Move timer geometry above animated props**

In `components/routine-stars/task-timer-modal.tsx`, compute `isCompactLayout`, `circleSize`, `circleRadius`, `circumference`, `viewBox`, `center`, and timer text sizes before `useAnimatedProps`.

- [ ] **Step 4: Re-run the check and TypeScript**

Run:

```bash
npm run test:smoke
npm run typecheck
```

Expected: both exit 0.

### Task 2: Tooling Baseline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `eslint.config.js`

- [ ] **Step 1: Align Expo SDK patch packages**

Run:

```bash
npx expo install expo@~54.0.35 expo-asset@~12.0.13 expo-font@~14.0.12 expo-linking@~8.0.12 expo-router@~6.0.24
```

- [ ] **Step 2: Install ESLint tooling**

Run:

```bash
npm install --save-dev eslint eslint-config-expo
```

Create `eslint.config.js` using Expo's flat config.

- [ ] **Step 3: Verify quality commands**

Run:

```bash
npm run lint
npx expo-doctor
npm run typecheck
```

Expected: commands exit 0, or any remaining findings are fixed in this phase.

### Task 3: Browser Smoke

**Files:**
- No source edits expected.

- [ ] **Step 1: Start Expo web**

Run: `npm run web`

- [ ] **Step 2: Open `http://localhost:8081` in a mobile viewport**

Expected: app reaches Dashboard without the `circumference` crash.

- [ ] **Step 3: Inspect console/runtime output**

Expected: no app runtime error from `TaskTimerModal`.
