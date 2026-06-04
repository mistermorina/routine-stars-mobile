# Routine Stars Mobile Asset Production Brief

**Date:** 2026-06-03
**Status:** Corrected reference-based brief

## Style Brief

The V1 asset style must match the existing reference assets:

- `assets/images/empty-rewards.png`
- `assets/images/empty-routines.png`

This is a polished soft-3D still-life style, not a flat icon style and not a simple programmatic clay placeholder. Assets should look like carefully rendered toy-like objects photographed in a warm studio setup.

Reference characteristics:

- Square 1254x1254 canvas for full illustrations.
- Warm cream background with a subtle radial glow and very soft vignette.
- Centered hero object with generous negative space.
- Three-quarter front view, slight top-down perspective, realistic object depth.
- Rounded forms, bevels, soft material texture, realistic ambient occlusion, and gentle contact shadows.
- Deep teal-blue structure, warm cream object surfaces, gold stars, muted sage accents, and occasional natural wood.
- No text, no random letters, no logos, no watermarks, no UI labels inside the image.
- No hard vector outlines, black oval cartoon shadows, emoji-like characters, rough geometric placeholders, or visibly hand-coded shapes.

The visual bar is: each asset should sit next to `empty-rewards.png` and `empty-routines.png` without looking cheaper, flatter, more childish, or more artificial.

## Production Prompts

Use the existing reference files as style anchors whenever generating or briefing new image assets.

Base prompt:

```text
Create a polished soft-3D rendered still-life illustration for a warm child routine app, matching the style of the provided Routine Stars reference assets. Use a square composition with a warm cream radial background, deep teal-blue accents, warm gold stars, rounded toy-like forms, soft bevels, subtle material texture, realistic ambient occlusion, and gentle studio lighting. Center the main object with generous negative space. No text, no letters, no logos, no watermark.
```

Negative prompt:

```text
flat vector art, simple geometric placeholder, black oval shadow, emoji style, sticker icon grid, cartoon outline, low-detail clay blob, harsh outline, random letters, UI text, watermark, photorealistic people, dark background, busy composition
```

Asset-specific prompt patterns:

- App icon: a refined Routine Stars object mark using the same teal, cream, and gold material language; simple enough for 1024x1024 app icon use, but not blank or flat.
- Onboarding hero: a soft-3D routine board or family routine object scene, no people unless quality matches the references, no readable text.
- Theme previews: one premium still-life per theme, not patterned backgrounds; keep object scale and lighting consistent with the references.
- Sticker/collectible assets: only produce if they can match the same render quality; otherwise keep the existing high-quality animal sticker files until a better set is generated.

## Agent Task Briefs

Branding Agent:

- Remove or ignore all low-quality generated placeholders from the previous pass.
- Use `empty-rewards.png` and `empty-routines.png` as non-negotiable style references.
- Produce only high-quality app icon, adaptive icon, and splash candidates that match the teal/cream/gold material system.

Illustration Agent:

- Extend the current `assets/images/` family in the reference style.
- Keep `empty-rewards.png` and `empty-routines.png`.
- Do not replace good existing soft-3D assets with lower-fidelity generated drawings.
- Reject outputs that look like icons, emojis, vector art, or hand-coded shape compositions.

Sticker Agent:

- Do not use the removed `assets/wall-stickers/` generated set.
- Existing animal stickers may remain until a higher-quality set is produced.
- If a new sticker system is generated later, each sticker must be premium-rendered and visually compatible with the reference image material quality.

Integration and QA Agent:

- Keep the current app code on the legacy animal sticker registry until final replacement assets exist.
- Do not wire generated placeholders into the app.
- Use contact sheets only for review, not as an excuse to accept mismatched quality.

## QA Checklist

- Reference comparison: every new asset is reviewed next to `empty-rewards.png` and `empty-routines.png`.
- Quality gate: reject any asset that looks flatter, cheaper, more cartoonish, or less polished than the references.
- Composition gate: centered object, warm cream background, soft studio lighting, no text.
- Technical gate: dimensions match the consuming app slot; PNG format; transparent background only where the consuming component needs it.
- Integration gate: do not update imports or registries until replacement assets have passed visual review.
- Verification gate: run `npm run typecheck` after code or import changes.
