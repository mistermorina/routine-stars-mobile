# Routine Stars Mobile Asset System Goal

**Date:** 2026-06-03
**Status:** Draft for planning

## Goal

Create a complete, consistent image-asset system for Routine Stars Mobile, covering app branding, PNG illustrations, stickers, empty states, routine/reward visuals, and technical integration rules, so every required visual asset can be produced, reviewed, versioned, and used directly in the Expo app.

## Current Asset Baseline

The app already has these asset groups:

- App branding assets in `assets/icon.png`, `assets/adaptive-icon.png`, and `assets/splash-icon.png`.
- UI illustration PNGs in `assets/images/`, including onboarding, empty states, routine/reward visuals, theme previews, and the sticker album cover.
- Animal sticker PNGs in `assets/routinestars_tier_sticker_einzeln/`, currently wired through `lib/animal-stickers.ts`.
- Functional icons through `lucide-react-native` plus custom SVG icons in `lib/icons.tsx`.

The current code suggests PNG production should focus on app branding, illustrations, empty states, theme art, and stickers. Routine/task/reward functional icons should mostly remain vector icons through the existing icon registry unless a specific screen needs richer illustration.

## Scope

Included:

- App icon, adaptive icon, and splash icon review or redesign.
- Onboarding hero image.
- Empty-state illustrations for routines and rewards.
- Routine category illustrations, especially morning, evening, trophy/progress, and reward moments.
- Sticker album cover and sticker wall supporting visuals.
- Animal or character sticker set expansion.
- Theme preview images.
- Naming, dimensions, transparency, export format, and integration rules.
- QA checklist for file presence, image dimensions, transparency, and runtime references.

Excluded unless explicitly requested:

- Full App Store screenshots and marketing campaign assets.
- Replacing all lucide functional icons with PNGs.
- Rebuilding the visual design system or app layout.
- Backend, storage, or reward/routine logic changes.

## Recommended Work Mode

Use Plan Mode for the next phase.

Reason: this is a multi-step creative-production and integration workflow. Plan Mode is better for locking scope, asking structured visual questions, and producing a checklist before agents generate or modify many files. Default mode is fine for inspection and drafting, but direct asset creation should wait until the brief is approved.

## Multi-Agent Split

After the brief is approved, split work by asset family:

1. **Branding Agent**
   - Owns `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`.
   - Produces app-branding concepts and final Expo-compatible exports.

2. **Illustration Agent**
   - Owns `assets/images/`.
   - Produces onboarding, empty-state, routine, reward, and theme PNGs.

3. **Sticker Agent**
   - Owns `assets/routinestars_tier_sticker_einzeln/` and any future sticker folders.
   - Produces a consistent sticker set with transparent backgrounds and matching character style.

4. **Integration and QA Agent**
   - Owns asset references in `app/`, `components/`, and `lib/animal-stickers.ts`.
   - Verifies imports, dimensions, transparent backgrounds, Expo bundling, and TypeScript checks.

## Asset Production Rules

- Keep existing functional icons in `lib/icons.tsx` unless there is a clear product reason to use PNGs.
- Prefer transparent PNGs for stickers and standalone object illustrations.
- Use fixed, documented dimensions per asset family.
- Use stable kebab-case or existing German filename conventions consistently.
- Avoid replacing existing app references before new files are verified.
- Keep generated assets grouped by purpose so future agents do not overwrite unrelated work.

## Open Decisions

Before production starts, decide:

- Whether existing assets should be preserved and extended, or replaced with a unified new style.
- Whether the sticker set should stay animal-based or move toward stars, mascots, badges, or mixed rewards.
- Whether the target style is soft 3D, flat vector, watercolor, clay-like, or another direction.
- Which asset family should be produced first.
- Whether visual review should happen through a browser-based companion or plain file previews.

## Immediate Next Step

Switch to Plan Mode or continue with a planning pass, then finalize:

- Asset inventory table.
- Required asset list.
- Style brief.
- Production prompts.
- Agent task briefs.
- QA checklist.
