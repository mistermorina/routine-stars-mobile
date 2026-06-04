# Sticker Reward System

**Date:** 2026-06-04  
**Status:** Integrated V4 with 98 total stickers

## Product Decision

Routine Stars now treats collectible stickers as a child-facing reward for completed routines. The V1 system used the existing transparent animal PNG sticker pack. V2 added generated `Weltraum` and `Gute Nacht` sticker worlds. V3 added 30 more generated stickers across `Magie`, `Fahrzeuge`, and `Natur`. V4 adds 50 more stickers across five 10-sticker packs with distinct visual style directions.

The old milestone badge logic in `lib/child-progression.ts` remains as progress logic, but the visible sticker experience is now the catalog-based sticker collection.

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

Generated V3 theme worlds:

| Order Range | Theme | Category | Count | Id Prefix | App Asset Pattern |
|---:|---|---|---:|---|---|
| 19-28 | Magie | Magie | 10 | `magie_` | `assets/routinestars_magie_sticker_einzeln/routinestars_magie_<nn>_<slug>.png` |
| 29-38 | Fahrzeuge | Fahrzeuge | 10 | `fahrzeuge_` | `assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_<nn>_<slug>.png` |
| 39-48 | Natur | Natur | 10 | `natur_` | `assets/routinestars_natur_sticker_einzeln/routinestars_natur_<nn>_<slug>.png` |

V3 IDs:

```text
magie_zauberhut
magie_sternenstab
magie_sternendrache
magie_kristalle
magie_einhorn
magie_sternentrank
magie_zauberbuch
magie_schlossturm
magie_schatztruhe
magie_mondlaterne
fahrzeuge_feuerwehr
fahrzeuge_lokomotive
fahrzeuge_schulbus
fahrzeuge_heissluftballon
fahrzeuge_hubschrauber
fahrzeuge_roller
fahrzeuge_traktor
fahrzeuge_uboot
fahrzeuge_raketenboard
fahrzeuge_baukran
natur_sonnenblume
natur_regenbogen
natur_berg
natur_pilzhaus
natur_apfelbaum
natur_wasserfall
natur_herbstblatt
natur_muschel
natur_regenwolke
natur_tannenzapfen
```

Generated V4 theme worlds and style directions:

| Order Range | Theme | Category | Count | Style Direction | Id Prefix | App Asset Pattern |
|---:|---|---|---:|---|---|---|
| 49-58 | Helden | Helden | 10 | Comic patch / embroidered badge | `helden_` | `assets/routinestars_helden_sticker_einzeln/routinestars_helden_<nn>_<slug>.png` |
| 59-68 | Essen | Essen | 10 | Kawaii bento clay | `essen_` | `assets/routinestars_essen_sticker_einzeln/routinestars_essen_<nn>_<slug>.png` |
| 69-78 | Musik | Musik | 10 | Cut-paper collage | `musik_` | `assets/routinestars_musik_sticker_einzeln/routinestars_musik_<nn>_<slug>.png` |
| 79-88 | Sport | Sport | 10 | Flat vinyl sticker | `sport_` | `assets/routinestars_sport_sticker_einzeln/routinestars_sport_<nn>_<slug>.png` |
| 89-98 | Meer | Meer | 10 | Watercolor gouache | `meer_` | `assets/routinestars_meer_sticker_einzeln/routinestars_meer_<nn>_<slug>.png` |

V4 IDs:

```text
helden_sternencape
helden_mut_schild
helden_helferhelm
helden_freundlichkeits_megafon
helden_mutkompass
helden_rettungsrucksack
helden_teamhandschuhe
helden_funkelmaske
helden_leuchtturm
helden_heldenmedaille
essen_erdbeere
essen_banane
essen_porridge
essen_sandwich
essen_suppe
essen_cupcake
essen_sternkeks
essen_bento_box
essen_orangensaft
essen_eiswaffel
musik_trommel
musik_gitarre
musik_tamburin
musik_mikrofon
musik_kopfhoerer
musik_klavier
musik_trompete
musik_noten
musik_plattenspieler
musik_konzertkarte
sport_fussball
sport_basketball
sport_sneaker
sport_pokal
sport_schwimmbrille
sport_springseil
sport_zielscheibe
sport_skateboard
sport_yogamatte
sport_zielflagge
meer_wal
meer_segelboot
meer_seestern
meer_leuchtturm
meer_schatzkarte
meer_muschel
meer_delfin
meer_korallenriff
meer_flaschenpost
meer_mondwelle
```

Generated master assets:

```text
assets/sticker-masters/weltraum/routinestars_weltraum_<nn>_<slug>_master.png
assets/sticker-masters/gute-nacht/routinestars_gute_nacht_<nn>_<slug>_master.png
assets/sticker-masters/magie/routinestars_magie_<nn>_<slug>_master.png
assets/sticker-masters/fahrzeuge/routinestars_fahrzeuge_<nn>_<slug>_master.png
assets/sticker-masters/natur/routinestars_natur_<nn>_<slug>_master.png
assets/sticker-masters/helden/routinestars_helden_<nn>_<slug>_master.png
assets/sticker-masters/essen/routinestars_essen_<nn>_<slug>_master.png
assets/sticker-masters/musik/routinestars_musik_<nn>_<slug>_master.png
assets/sticker-masters/sport/routinestars_sport_<nn>_<slug>_master.png
assets/sticker-masters/meer/routinestars_meer_<nn>_<slug>_master.png
```

Generated app assets:

```text
assets/routinestars_weltraum_sticker_einzeln/routinestars_weltraum_<nn>_<slug>.png
assets/routinestars_gute_nacht_sticker_einzeln/routinestars_gute_nacht_<nn>_<slug>.png
assets/routinestars_magie_sticker_einzeln/routinestars_magie_<nn>_<slug>.png
assets/routinestars_fahrzeuge_sticker_einzeln/routinestars_fahrzeuge_<nn>_<slug>.png
assets/routinestars_natur_sticker_einzeln/routinestars_natur_<nn>_<slug>.png
assets/routinestars_helden_sticker_einzeln/routinestars_helden_<nn>_<slug>.png
assets/routinestars_essen_sticker_einzeln/routinestars_essen_<nn>_<slug>.png
assets/routinestars_musik_sticker_einzeln/routinestars_musik_<nn>_<slug>.png
assets/routinestars_sport_sticker_einzeln/routinestars_sport_<nn>_<slug>.png
assets/routinestars_meer_sticker_einzeln/routinestars_meer_<nn>_<slug>.png
```

The generated source sheet and contact sheet are stored for review:

```text
assets/review/stickers-v2/source/routinestars_sticker_v2_weltraum_gute_nacht_sheet_chromakey.png
assets/review/stickers-v2/contact-sheets/routinestars_stickers_v2_contact_sheet.png
assets/review/stickers-v3/source/routinestars_sticker_v3_magie_sheet_chromakey.png
assets/review/stickers-v3/source/routinestars_sticker_v3_fahrzeuge_sheet_chromakey.png
assets/review/stickers-v3/source/routinestars_sticker_v3_natur_sheet_chromakey.png
assets/review/stickers-v3/transparent-sheets/routinestars_sticker_v3_magie_sheet_alpha.png
assets/review/stickers-v3/transparent-sheets/routinestars_sticker_v3_fahrzeuge_sheet_alpha.png
assets/review/stickers-v3/transparent-sheets/routinestars_sticker_v3_natur_sheet_alpha.png
assets/review/stickers-v3/contact-sheets/routinestars_stickers_v3_contact_sheet.png
assets/review/stickers-v4/source/routinestars_sticker_v4_helden_sheet_chromakey.png
assets/review/stickers-v4/source/routinestars_sticker_v4_essen_sheet_chromakey.png
assets/review/stickers-v4/source/routinestars_sticker_v4_musik_sheet_chromakey.png
assets/review/stickers-v4/source/routinestars_sticker_v4_sport_sheet_chromakey.png
assets/review/stickers-v4/source/routinestars_sticker_v4_meer_sheet_chromakey.png
assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_helden_sheet_alpha.png
assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_essen_sheet_alpha.png
assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_musik_sheet_alpha.png
assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_sport_sheet_alpha.png
assets/review/stickers-v4/transparent-sheets/routinestars_sticker_v4_meer_sheet_alpha.png
assets/review/stickers-v4/contact-sheets/routinestars_stickers_v4_contact_sheet.png
```

## Generation Prompt

Built-in image generation was used first, then local chroma-key removal.

V2 prompt summary:

```text
Create a cohesive set of 8 premium child-friendly collectible stickers on a perfectly flat solid #00ff00 chroma-key background. Use a clean 4x2 grid with generous padding and no overlap. Top row: friendly rocket with gold star window, smiling ringed planet, cozy astronaut helmet, moon rover. Bottom row: sleepy crescent moon with nightcap, soft cloud with gold star, bedtime story book with star bookmark, teddy bear holding a star. Style: polished soft-3D toy-like sticker illustrations, rounded forms, warm cream surfaces, deep teal accents, muted sky blue, soft gold stars, no text, no logos, no watermark.
```

V3 prompt summary:

```text
Create three cohesive sheets of premium child-friendly collectible stickers on flat chroma-key backgrounds. Use clean 5x2 grids with generous padding and no overlap. Themes: Magie, Fahrzeuge, Natur. Style: polished soft-3D toy-like sticker illustrations, rounded forms, thick clean silhouettes, warm cream highlights, deep teal accents, muted sky blue, soft gold stars, subtle white sticker rim, no text, no logos, no watermark.
```

V4 prompt summary:

```text
Create five cohesive sheets of 10 premium child-friendly collectible stickers on flat chroma-key backgrounds. Use clean 5x2 grids with generous padding and no overlap. Packs: Helden in comic patch / embroidered badge style, Essen in kawaii bento clay style, Musik in paper collage / cut-paper style, Sport in flat vinyl sticker style, Meer in watercolor gouache style. Keep each sticker freestanding with a white sticker rim, no text, no logos, no watermark.
```

Local processing:

1. Copy generated sheet into `assets/review/stickers-v2/source/`.
2. Copy generated V3 sheets into `assets/review/stickers-v3/source/`.
3. Copy generated V4 sheets into `assets/review/stickers-v4/source/`.
4. Remove #00ff00 or #ff00ff chroma key with `remove_chroma_key.py`.
5. Crop by grid cell and remove small edge-touching fragments.
6. Export 1024x1024 master PNGs.
7. Export 360x360 app PNGs.

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
- Image Generation Agent: generated the 8-sticker `Weltraum` and `Gute Nacht` V2 sheet, three 10-sticker V3 sheets for `Magie`, `Fahrzeuge`, and `Natur`, and five 10-sticker V4 sheets for `Helden`, `Essen`, `Musik`, `Sport`, and `Meer`; removed chroma-key locally, cropped assets, cleaned edge fragments, and exported master/app PNGs.

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
