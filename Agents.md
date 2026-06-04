# Agent Orchestration — Routine Stars Mobile

## Execution Log

**Date**: 2026-03-02
**Status**: Completed (Sprint 1+2, Tasks 1-6 + Bug-Fix)

---

## Shared Contracts (Phase 0 — Orchestrator)

### Types Extended (`lib/types.ts`)
- `AgeGroup`, `TimeOfDay`, `RoutineCategory` — union types
- `TaskTemplate`, `RoutineTemplate` — for routine template system
- `RewardCategory`, `RewardSuggestion`, `RewardCategoryInfo` — for reward browser
- `IconCategory`, `IconEntry` — for icon picker categorization
- `TaskSuggestion` — for smart task suggestions

### Storage Keys (unchanged)
- `CUSTOM_ROUTINES` and `CUSTOM_REWARDS` — sufficient for all data

---

## Agent-1: Foundation (Phase 1)

**Created**:
- `hooks/use-routines.ts` — CRUD + `toggleTaskCompletion()` + `resetDailyProgress()`
- `hooks/use-rewards.ts` — CRUD for rewards

**Modified**:
- `app/(tabs)/index.tsx` — replaced `mockRoutines` with `useRoutines()` hook
- `app/(tabs)/rewards.tsx` — replaced `mockRewards` with `useRewards()` hook
- `app/settings/children.tsx` — replaced mock imports with hook data

**Bug Fixed**: Dashboard and Rewards now read from AsyncStorage (user data) instead of hardcoded mocks.

---

## Agent-2: Content (Phase 1)

**Created**:
- `lib/routine-templates.ts` — 15 templates (Morgen, Abend, Hausaufgaben, Haushalt, Sport, etc.)
- `lib/reward-suggestions.ts` — 47 rewards in 7 categories
- `lib/task-suggestions.ts` — 41 tasks with keyword-based suggestion engine
- `lib/default-values.ts` — Smart defaults for routine names, colors, star costs

---

## Agent-3: IconRegistry (Phase 1)

**Modified**:
- `lib/icons.tsx` — expanded from 37 to 70 icons (35 new lucide + 2 custom SVG)

**Created**:
- `lib/icon-registry.ts` — 55 categorized icon entries across 11 categories
- `components/ui/icon-picker.tsx` — modal icon picker with search + category tabs

**Note**: `Broom` was not available in lucide-react-native, replaced with custom SVG `BroomIcon`.

---

## Agent-4: Onboarding (Phase 3)

**Created**:
- `components/routine-templates/template-card.tsx` — single template card UI
- `components/routine-templates/template-selector.tsx` — horizontal scrollable template picker with category filters
- `components/rewards/reward-category.tsx` — collapsible reward category section
- `components/rewards/reward-browser.tsx` — full reward browsing UI

**Rebuilt**:
- `components/onboarding/routine-setup.tsx` — template selector integration, auto-fill from templates
- `components/onboarding/reward-setup.tsx` — reward browser integration, multi-select chips
- `app/(auth)/onboarding.tsx` — updated data shape for arrays, backward compat

---

## Verification Checklist

- [x] `npm run typecheck` — 0 errors
- [x] All `iconName` strings resolve to valid registry entries (68 unique icons)
- [x] No file ownership conflicts between agents
- [x] Onboarding saves to AsyncStorage → Dashboard/Rewards read from AsyncStorage
- [x] Backward compatibility: legacy single-reward format still supported in onboarding
- [x] Mock data used as seed only (first-launch fallback)

---

## File Manifest

### New Files (13)
| File | Agent |
|------|-------|
| `hooks/use-routines.ts` | Agent-1 |
| `hooks/use-rewards.ts` | Agent-1 |
| `lib/routine-templates.ts` | Agent-2 |
| `lib/reward-suggestions.ts` | Agent-2 |
| `lib/task-suggestions.ts` | Agent-2 |
| `lib/default-values.ts` | Agent-2 |
| `lib/icon-registry.ts` | Agent-3 |
| `components/ui/icon-picker.tsx` | Agent-3 |
| `components/routine-templates/template-card.tsx` | Agent-4 |
| `components/routine-templates/template-selector.tsx` | Agent-4 |
| `components/rewards/reward-category.tsx` | Agent-4 |
| `components/rewards/reward-browser.tsx` | Agent-4 |
| `Agents.md` | Orchestrator |

### Modified Files (7)
| File | Agent | Change |
|------|-------|--------|
| `lib/types.ts` | Orchestrator | +65 lines (new types) |
| `lib/icons.tsx` | Agent-3 | 37→70 icons |
| `app/(tabs)/index.tsx` | Agent-1 | useRoutines() hook |
| `app/(tabs)/rewards.tsx` | Agent-1 | useRewards() hook |
| `app/settings/children.tsx` | Agent-1 | hooks instead of mocks |
| `components/onboarding/routine-setup.tsx` | Agent-4 | template selector |
| `components/onboarding/reward-setup.tsx` | Agent-4 | reward browser |
| `app/(auth)/onboarding.tsx` | Agent-4 | array data shape |

---

## Sticker Reward System — V1 Integration

**Date**: 2026-06-04
**Status**: Implemented and verified locally

### Agent Split

- **Produkt und UX Agent**: confirmed the existing gap that stickers were unlocked after whole-day completion instead of completed routines, and recommended a child gallery plus parent-controlled reward mode.
- **Asset und Creative Agent**: verified the existing animal sticker PNGs as V1-ready assets with transparent background and consistent style.
- **App Integration Agent**: implemented storage, pure unlock logic, dashboard trigger, gallery UI, parent settings, docs, and smoke checks.

### Decisions

- Existing animal PNG stickers remain the V1 asset pack.
- Newly generated `Weltraum` and `Gute Nacht` PNG stickers are added as V2 theme worlds.
- Canonical sticker metadata lives in `lib/animal-stickers.ts` via `STICKER_CATALOG`.
- `ANIMAL_STICKERS` remains as a compatibility alias for earlier code.
- New collection state is stored in `STICKER_COLLECTION`; legacy `STICKER_WALL` data is read for migration.
- Default unlock mode is `routine_complete`: one sticker offer when a task completion finishes its routine.
- Parent settings can switch to `daily_complete`: one sticker offer after all routines are finished for the day.

### New Files

| File | Purpose |
|------|---------|
| `lib/sticker-reward-logic.ts` | Pure unlock event and idempotency logic |
| `app/settings/stickers.tsx` | Parent overview and reward-mode control |
| `scripts/check-sticker-reward-logic.mjs` | Sticker unlock and asset smoke test |
| `docs/sticker-reward-system.md` | Decisions, user journey, storage, and asset docs |
| `docs/superpowers/plans/2026-06-04-sticker-reward-system.md` | Implementation plan |

### Modified Files

| File | Change |
|------|--------|
| `lib/types.ts` | Added sticker catalog, collection, rarity, and settings contracts |
| `lib/storage.ts` | Added `STICKER_COLLECTION` and `STICKER_REWARD_SETTINGS` keys |
| `lib/animal-stickers.ts` | Added theme, rarity, dimensions, source path, transparency, and order metadata |
| `hooks/use-sticker-wall.ts` | Migrated wall hook into collection hook with legacy compatibility aliases |
| `app/(tabs)/index.tsx` | Added routine-completion sticker reward trigger |
| `app/(tabs)/star-account.tsx` | Uses the new collection entries for compact gallery preview |
| `app/sticker-album.tsx` | Renamed visible screen to Sticker-Galerie |
| `components/stickers/sticker-wall.tsx` | Renders catalog-based gallery with locked and collected states |
| `components/stickers/sticker-reward-sheet.tsx` | Uses routine-aware reward copy |
| `components/routine-stars/daily-mission-card.tsx` | Avoids competing Sticker-Album copy for milestones |
| `app/settings/index.tsx` | Adds Sticker-System entry |
| `app/settings/_layout.tsx` | Adds Sticker-System settings route |
| `package.json` | Adds `test:stickers` |

### Asset Manifest

| Asset | Size | Alpha |
|-------|------|-------|
| `assets/routinestars_tier_sticker_einzeln/routinestars_01_loewe.png` | 325x359 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_03_giraffe.png` | 297x362 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_04_panda.png` | 301x329 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_05_hase.png` | 288x362 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_06_fuchs.png` | 294x362 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_07_baer.png` | 336x362 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_09_katze.png` | 294x346 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_10_hund.png` | 307x347 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_11_eule.png` | 288x336 | yes |
| `assets/routinestars_tier_sticker_einzeln/routinestars_12_schildkroete.png` | 325x326 | yes |
| `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_01_rakete.png` | 360x360 | yes |
| `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_02_planet.png` | 360x360 | yes |
| `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_03_astronautenhelm.png` | 360x360 | yes |
| `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_04_mondrover.png` | 360x360 | yes |
| `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_01_schlafmond.png` | 360x360 | yes |
| `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_02_traumwolke.png` | 360x360 | yes |
| `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_03_sternenbuch.png` | 360x360 | yes |
| `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_04_pyjama_baer.png` | 360x360 | yes |

### Generated Master Assets

| Asset | Size | Alpha |
|-------|------|-------|
| `assets/sticker-masters/weltraum/routinestars_weltraum_01_rakete_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/weltraum/routinestars_weltraum_02_planet_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/weltraum/routinestars_weltraum_03_astronautenhelm_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/weltraum/routinestars_weltraum_04_mondrover_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/gute-nacht/routinestars_gute_nacht_01_schlafmond_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/gute-nacht/routinestars_gute_nacht_02_traumwolke_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/gute-nacht/routinestars_gute_nacht_03_sternenbuch_master.png` | 1024x1024 | yes |
| `assets/sticker-masters/gute-nacht/routinestars_gute_nacht_04_pyjama_baer_master.png` | 1024x1024 | yes |

### Review Assets

| Asset | Purpose |
|-------|---------|
| `assets/review/stickers-v2/source/routinestars_sticker_v2_weltraum_gute_nacht_sheet_chromakey.png` | Generated source sheet |
| `assets/review/stickers-v2/contact-sheets/routinestars_stickers_v2_contact_sheet.png` | Visual QA contact sheet |

### Sticker Reward System — V3 Asset Expansion

**Date**: 2026-06-04
**Status**: 30 additional stickers generated, integrated, and smoke-tested

#### Agent Split

- **Asset und Creative Agent**: generated three 10-sticker sheets for `Magie`, `Fahrzeuge`, and `Natur`; rejected the first vehicle sheet because it mixed in unrelated motifs, then regenerated a vehicle-only sheet.
- **App Integration Agent**: exported transparent master/app PNGs, added the new IDs to type contracts, and extended the central sticker catalog.
- **QA Agent**: verified the contact sheet visually and extended `test:stickers` to assert 48 catalog entries plus all generated PNG dimensions and alpha channels.

#### New Theme Worlds

| Theme | Count | Unlock Orders | App Asset Directory | Master Asset Directory |
|------|------:|---------------|---------------------|------------------------|
| Magie | 10 | 19-28 | `assets/routinestars_magie_sticker_einzeln` | `assets/sticker-masters/magie` |
| Fahrzeuge | 10 | 29-38 | `assets/routinestars_fahrzeuge_sticker_einzeln` | `assets/sticker-masters/fahrzeuge` |
| Natur | 10 | 39-48 | `assets/routinestars_natur_sticker_einzeln` | `assets/sticker-masters/natur` |

#### New Review Assets

| Asset | Purpose |
|-------|---------|
| `assets/review/stickers-v3/source/routinestars_sticker_v3_magie_sheet_chromakey.png` | Generated Magie source sheet |
| `assets/review/stickers-v3/source/routinestars_sticker_v3_fahrzeuge_sheet_chromakey.png` | Generated Fahrzeuge source sheet |
| `assets/review/stickers-v3/source/routinestars_sticker_v3_natur_sheet_chromakey.png` | Generated Natur source sheet |
| `assets/review/stickers-v3/transparent-sheets/routinestars_sticker_v3_magie_sheet_alpha.png` | Transparent Magie working sheet |
| `assets/review/stickers-v3/transparent-sheets/routinestars_sticker_v3_fahrzeuge_sheet_alpha.png` | Transparent Fahrzeuge working sheet |
| `assets/review/stickers-v3/transparent-sheets/routinestars_sticker_v3_natur_sheet_alpha.png` | Transparent Natur working sheet |
| `assets/review/stickers-v3/contact-sheets/routinestars_stickers_v3_contact_sheet.png` | Visual QA contact sheet for all 30 V3 stickers |

### Sticker Reward System — V4 Style Expansion

**Date**: 2026-06-04
**Status**: 50 additional stickers generated, integrated, and smoke-tested

#### Agent Split

- **Produkt und UX Agent**: interpreted `weitere 50 sticker a 10` as five themed packs with 10 stickers each, continuing the existing unlock order after V3.
- **Asset und Creative Agent**: generated five style-distinct sheets: comic patch, kawaii bento clay, paper collage, flat vinyl, and watercolor gouache.
- **App Integration Agent**: exported transparent master/app PNGs, added V4 type contracts, and attached a separate `lib/generated-stickers-v4.ts` pack module to the central catalog.
- **QA Agent**: verified the V4 contact sheet visually and extended `test:stickers` to assert 98 catalog entries plus all generated PNG dimensions and alpha channels.

#### New 10er Packs

| Theme | Count | Unlock Orders | Style Direction | App Asset Directory | Master Asset Directory |
|------|------:|---------------|-----------------|---------------------|------------------------|
| Helden | 10 | 49-58 | Comic patch / embroidered badge | `assets/routinestars_helden_sticker_einzeln` | `assets/sticker-masters/helden` |
| Essen | 10 | 59-68 | Kawaii bento clay | `assets/routinestars_essen_sticker_einzeln` | `assets/sticker-masters/essen` |
| Musik | 10 | 69-78 | Paper collage / cut-paper | `assets/routinestars_musik_sticker_einzeln` | `assets/sticker-masters/musik` |
| Sport | 10 | 79-88 | Flat vinyl sticker | `assets/routinestars_sport_sticker_einzeln` | `assets/sticker-masters/sport` |
| Meer | 10 | 89-98 | Watercolor gouache | `assets/routinestars_meer_sticker_einzeln` | `assets/sticker-masters/meer` |

#### New Review Assets

| Asset | Purpose |
|-------|---------|
| `assets/review/stickers-v4/source/routinestars_sticker_v4_helden_sheet_chromakey.png` | Generated Helden source sheet |
| `assets/review/stickers-v4/source/routinestars_sticker_v4_essen_sheet_chromakey.png` | Generated Essen source sheet |
| `assets/review/stickers-v4/source/routinestars_sticker_v4_musik_sheet_chromakey.png` | Generated Musik source sheet |
| `assets/review/stickers-v4/source/routinestars_sticker_v4_sport_sheet_chromakey.png` | Generated Sport source sheet |
| `assets/review/stickers-v4/source/routinestars_sticker_v4_meer_sheet_chromakey.png` | Generated Meer source sheet |
| `assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_helden_sheet_alpha.png` | Transparent Helden working sheet |
| `assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_essen_sheet_alpha.png` | Transparent Essen working sheet |
| `assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_musik_sheet_alpha.png` | Transparent Musik working sheet |
| `assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_sport_sheet_alpha.png` | Transparent Sport working sheet |
| `assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_meer_sheet_alpha.png` | Transparent Meer working sheet |
| `assets/review/stickers-v4/contact-sheets/routinestars_stickers_v4_contact_sheet.png` | Visual QA contact sheet for all 50 V4 stickers |

### Verification Checklist

- [x] `npm run test:stickers`
- [x] `npm run test:smoke`
- [x] `npm run test:progress-smoke`
- [x] `npm run test:contrast-smoke`
- [x] `npm run typecheck`
- [x] `npm run lint` — 0 errors, 2 pre-existing warnings in `lib/routine-visuals.ts`
- [x] `npx expo export --platform ios --output-dir /tmp/routine-stars-mobile-export`
