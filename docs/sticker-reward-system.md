# Sticker Reward System

**Date:** 2026-06-04  
**Status:** Integrated V2 with generated themed stickers

## Product Decision

Routine Stars now treats collectible stickers as a child-facing reward for completed routines. The V1 system used the existing transparent animal PNG sticker pack. V2 adds newly generated `Weltraum` and `Gute Nacht` sticker worlds with master and app-optimized PNG assets.

The old milestone badge logic in `lib/child-progression.ts` remains as progress logic, but the visible sticker experience is the animal sticker collection.

## Sticker Catalog

Canonical registry: `lib/animal-stickers.ts`

Primary export: `STICKER_CATALOG`

Compatibility export: `ANIMAL_STICKERS`

Canonical assets:

```text
assets/routinestars_tier_sticker_einzeln/routinestars_<nn>_<slug>.png
```

Rules:

- PNG with real transparency.
- Freestanding sticker object, no background plate.
- ASCII slugs without umlauts, for example `schildkroete`.
- Stable IDs are never reused.
- Missing numbers `02` and `08` are reserved legacy gaps.
- V1 app display size is 58-82px in compact UI and up to 160px in catalog metadata.

V1 theme world:

| Order | Id | Theme | Category | Rarity |
|---:|---|---|---|---|
| 1 | `hase` | Tierfreunde | Tiere | Normal |
| 2 | `hund` | Tierfreunde | Tiere | Normal |
| 3 | `katze` | Tierfreunde | Tiere | Normal |
| 4 | `panda` | Tierfreunde | Tiere | Normal |
| 5 | `schildkroete` | Tierfreunde | Tiere | Besonders |
| 6 | `fuchs` | Tierfreunde | Tiere | Besonders |
| 7 | `baer` | Tierfreunde | Tiere | Besonders |
| 8 | `giraffe` | Tierfreunde | Tiere | Selten |
| 9 | `eule` | Tierfreunde | Tiere | Selten |
| 10 | `loewe` | Tierfreunde | Tiere | Episch |

Generated V2 theme worlds:

| Order | Id | Theme | Category | Rarity | App Asset |
|---:|---|---|---|---|---|
| 11 | `weltraum_rakete` | Weltraum | Weltraum | Normal | `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_01_rakete.png` |
| 12 | `weltraum_planet` | Weltraum | Weltraum | Normal | `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_02_planet.png` |
| 13 | `weltraum_astronautenhelm` | Weltraum | Weltraum | Selten | `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_03_astronautenhelm.png` |
| 14 | `weltraum_mondrover` | Weltraum | Weltraum | Besonders | `assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_04_mondrover.png` |
| 15 | `gute_nacht_schlafmond` | Gute Nacht | Gute Nacht | Normal | `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_01_schlafmond.png` |
| 16 | `gute_nacht_traumwolke` | Gute Nacht | Gute Nacht | Normal | `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_02_traumwolke.png` |
| 17 | `gute_nacht_sternenbuch` | Gute Nacht | Gute Nacht | Besonders | `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_03_sternenbuch.png` |
| 18 | `gute_nacht_pyjama_baer` | Gute Nacht | Gute Nacht | Selten | `assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_04_pyjama_baer.png` |

Generated master assets:

```text
assets/sticker-masters/weltraum/routinestars_weltraum_<nn>_<slug>_master.png
assets/sticker-masters/gute-nacht/routinestars_gute_nacht_<nn>_<slug>_master.png
```

Generated app assets:

```text
assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_<nn>_<slug>.png
assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_<nn>_<slug>.png
```

The generated source sheet and contact sheet are stored for review:

```text
assets/review/stickers-v2/source/routinestars_sticker_v2_weltraum_gute_nacht_sheet_chromakey.png
assets/review/stickers-v2/contact-sheets/routinestars_stickers_v2_contact_sheet.png
```

## Generation Prompt

Built-in image generation was used first, then local chroma-key removal.

Prompt summary:

```text
Create a cohesive set of 8 premium child-friendly collectible stickers on a perfectly flat solid #00ff00 chroma-key background. Use a clean 4x2 grid with generous padding and no overlap. Top row: friendly rocket with gold star window, smiling ringed planet, cozy astronaut helmet, moon rover. Bottom row: sleepy crescent moon with nightcap, soft cloud with gold star, bedtime story book with star bookmark, teddy bear holding a star. Style: polished soft-3D toy-like sticker illustrations, rounded forms, warm cream surfaces, deep teal accents, muted sky blue, soft gold stars, no text, no logos, no watermark.
```

Local processing:

1. Copy generated sheet into `assets/review/stickers-v2/source/`.
2. Remove #00ff00 chroma key with `remove_chroma_key.py`.
3. Crop by grid cell and remove small edge-touching fragments.
4. Export 1024x1024 master PNGs.
5. Export 360x360 app PNGs.

## Storage Model

New keys in `lib/storage.ts`:

- `STICKER_COLLECTION`: per-child collection state.
- `STICKER_REWARD_SETTINGS`: active parent-controlled unlock mode.

Legacy key:

- `STICKER_WALL`: still read for migration into `STICKER_COLLECTION`.

Collection entry fields:

- `stickerId`: catalog sticker ID.
- `eventKey`: idempotency key, for example `2026-06-04:routine-morning`.
- `reason`: `routine_complete` or `daily_complete`.
- `routineId` and `routineName`: source routine context.
- `earnedDate`, `slot`, `createdAt`: display and ordering metadata.

## Unlock Logic

Pure rules live in `lib/sticker-reward-logic.ts`.

Default mode:

- `routine_complete`: a sticker is offered when a task completion makes its parent routine complete.

Parent optional mode:

- `daily_complete`: a sticker is offered only when all routines for the local day are complete.

Duplicate prevention:

- Every reward event has an `eventKey`.
- Claimed event keys are stored per child.
- The same routine completion event cannot unlock twice.

## Child Journey

1. Child opens `Routinen`.
2. Child completes tasks.
3. When the current task completes its routine, a sticker selection sheet appears.
4. Child chooses one available sticker from the themed catalog.
5. The sticker is stored in the child's collection with date and routine name.
6. The app navigates to `/sticker-album`, now shown as `Sticker-Galerie`.
7. The profile tab shows a compact gallery preview and links back into the full gallery.

## Parent Journey

1. Parent opens the PIN-protected settings area.
2. Parent selects `Sticker-System`.
3. Parent sees collected count, open count, current theme world, recent unlocks, and the child's gallery.
4. Parent controls the active unlock mode:
   - `Jede abgeschlossene Routine`
   - `Ganzer Tag abgeschlossen`

## Agent Split Used

- Product and UX Agent: reviewed current journey and identified the mismatch between whole-day unlocks and routine-completion unlocks.
- Asset and Creative Agent: verified the 10 animal PNG stickers, recommended V2 theme worlds, and provided production specs for generated stickers.
- App Integration Agent: implemented storage contracts, hook migration, dashboard trigger, gallery UI, parent settings, and smoke verification.
- Image Generation Agent: generated one 8-sticker `Weltraum` and `Gute Nacht` sheet, removed chroma-key locally, cropped assets, and exported master/app PNGs.

## Verification

Sticker-specific verification:

```bash
npm run test:stickers
```

Full final verification:

```bash
npm run test:stickers
npm run test:smoke
npm run test:progress-smoke
npm run test:contrast-smoke
npm run typecheck
npm run lint
npx expo export --platform ios --output-dir /tmp/routine-stars-mobile-export
```
