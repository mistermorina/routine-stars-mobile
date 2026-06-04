# Sticker Reward System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete V1 sticker reward system where children unlock themed stickers after completed routines, see them in a gallery, and parents can review collection progress plus the active unlock rule.

**Architecture:** Keep existing high-quality animal PNG stickers as the V1 asset pack, but replace the narrow "daily wall" concept with a typed sticker catalog, collection state, and parent-configurable reward settings. Unlock decisions live in a pure logic module so smoke tests can verify routine-completion idempotency without rendering React Native.

**Tech Stack:** Expo Router, React Native, NativeWind, AsyncStorage, expo-image, TypeScript, Node smoke tests.

---

### Task 1: Pure Sticker Reward Rules

**Files:**
- Create: `lib/sticker-reward-logic.ts`
- Create: `scripts/check-sticker-reward-logic.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the failing smoke test**

Create a Node smoke test that compiles `lib/sticker-reward-logic.ts`, imports it, and asserts:

```js
const settings = { rewardMode: "routine_complete", selectionMode: "child_choice" };
const event = createStickerRewardEvent({
  childId: "child-1",
  routineId: "routine-morning",
  routineName: "Morgenroutine",
  date: "2026-06-04",
  completedRoutineCountToday: 1,
  totalRoutineCountToday: 2,
  settings,
});
assert.equal(event?.reason, "routine_complete");
assert.equal(event?.eventKey, "2026-06-04:routine-morning");
```

It also asserts duplicate event keys cannot unlock twice and `daily_complete` waits until all routines are complete.

- [x] **Step 2: Run test to verify it fails**

Run: `node scripts/check-sticker-reward-logic.mjs`

Expected: FAIL because `lib/sticker-reward-logic.ts` does not exist yet.

- [ ] **Step 3: Implement pure reward rules**

Add exported helpers:

```ts
export const DEFAULT_STICKER_REWARD_SETTINGS = {
  rewardMode: "routine_complete",
  selectionMode: "child_choice",
} as const;

export function createStickerRewardEvent(params: CreateStickerRewardEventParams) { ... }
export function canClaimStickerRewardEvent(claimedEventKeys: string[], eventKey?: string) { ... }
export function getStickerRewardModeLabel(mode: StickerRewardMode) { ... }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/check-sticker-reward-logic.mjs`

Expected: PASS.

### Task 2: Sticker Catalog and Storage Contracts

**Files:**
- Modify: `lib/types.ts`
- Replace or extend: `lib/animal-stickers.ts`
- Modify: `lib/storage.ts`
- Modify: `hooks/use-sticker-wall.ts`

- [ ] **Step 1: Extend types**

Add `StickerThemeWorld`, `StickerRarity`, `StickerCollectionEntry`, `StickerCollectionState`, `StickerRewardSettings`, and use the existing `AnimalStickerId` values as `StickerAssetId`.

- [ ] **Step 2: Expand animal sticker registry**

Add catalog metadata to each sticker:

```ts
themeWorld: "tierfreunde";
category: "tiere";
rarity: "common" | "rare" | "epic";
unlockOrder: number;
assetSourcePath: string;
appSize: 160;
masterSize: { width: number; height: number };
hasTransparentBackground: true;
```

- [ ] **Step 3: Update storage keys**

Add `STICKER_COLLECTION` and `STICKER_REWARD_SETTINGS` while reading legacy `STICKER_WALL` for migration.

- [ ] **Step 4: Update hook API**

Expose:

```ts
collectionState;
collectedEntries;
availableStickers;
settings;
rewardModeLabel;
claimStickerReward(event, stickerId);
updateRewardSettings(updates);
```

Keep legacy names (`placedStickers`, `availableDailyStickers`, `claimDailySticker`) as compatibility aliases until consumers are updated.

### Task 3: Dashboard Unlock Integration

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `components/stickers/sticker-reward-sheet.tsx`

- [ ] **Step 1: Detect just-completed routine**

When a task completion makes its parent routine complete, call `createStickerRewardEvent` with selected child, routine id, routine name, current local date, routine counts, and current settings.

- [ ] **Step 2: Show sticker selector from event**

If `canClaimStickerRewardEvent` succeeds, show the selection sheet with copy tied to the completed routine. On selection, persist a collection entry and navigate to the gallery.

- [ ] **Step 3: Keep legacy whole-day mode**

If parents choose `daily_complete`, only show sticker reward after all routines are complete.

### Task 4: Child Sticker Gallery

**Files:**
- Modify: `components/stickers/sticker-wall.tsx`
- Modify: `app/sticker-album.tsx`
- Modify: `app/(tabs)/star-account.tsx`

- [ ] **Step 1: Rename UI language from wall to gallery where visible**

Use "Sticker-Galerie" for the route and child-facing headers.

- [ ] **Step 2: Render collection cards with metadata**

Show collected count, theme badge, rarity badge, earned date, and locked slots using the catalog order.

- [ ] **Step 3: Preserve compact profile preview**

The profile tab keeps a compact preview and routes into `/sticker-album`.

### Task 5: Parent Sticker Settings

**Files:**
- Create: `app/settings/stickers.tsx`
- Modify: `app/settings/_layout.tsx`
- Modify: `app/settings/index.tsx`

- [ ] **Step 1: Add settings route**

Add a parent-protected Sticker route in the settings stack and menu.

- [ ] **Step 2: Add overview**

Show selected child, collected count, remaining count, theme pack, and the last unlocked stickers.

- [ ] **Step 3: Add control**

Let parents choose between "Jede abgeschlossene Routine" and "Ganzer Tag abgeschlossen"; persist with `useStickerWall`.

### Task 6: Documentation and Verification

**Files:**
- Create: `docs/sticker-reward-system.md`
- Modify: `Agents.md`
- Modify: `package.json`

- [ ] **Step 1: Document decisions**

Document V1 asset choice, storage model, unlock logic, parent controls, and the complete user journey.

- [ ] **Step 2: Add smoke script to npm**

Add `test:stickers` and include it in the final verification command list.

- [ ] **Step 3: Verify**

Run:

```bash
npm run test:stickers
npm run test:smoke
npm run test:progress-smoke
npm run test:contrast-smoke
npm run typecheck
```

Expected: all pass.
