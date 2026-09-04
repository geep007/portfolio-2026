# Showreel audit — before the Brand Motion System refactor

Date: 2026-09-03. Baseline: `npx tsc --noEmit` clean, 10.5k lines across 76 files, Remotion 4.0.418.

## 1. Composition hierarchy

Twelve compositions registered in `src/Root.tsx`, four separate timeline systems:

| Composition | Timeline system | Notes |
|---|---|---|
| `HeroReel` (30s) | `hero/timeline.ts` — id-keyed shot table, enable/disable, reflow, per-shot transition | The strongest system. Cursor keys stored as (shotId, localFrame). Edit overlay writes to Root.tsx. |
| `HeroAnimatic` | same table | held-still pacing rig |
| `ShowreelShort` (12s) | `theme.ts SCENE` — hardcoded absolute `from` frames | oldest; absolute-frame debt |
| `SiteReel` (23s) | `site/siteLayout.ts` — durations as props, positions derived | good idea, second copy of reflow logic |
| `SurrealVertical` (9:16) | `vertical/verticalLayout.ts` — shots[] with durationInFrames | third copy of reflow; only crop-aware layout |
| `IntroA–D`, `OutroA–B` | single-scene, `durationInFrames` prop | font pairing picker (`typography.ts`) |
| `Mascot`, `SigMark` | frame sequences | asset generators, not films |

## 2. Classification

### A. GENERIC ENGINE (keep, promote)
- `hero/timeline.ts` — `buildTimeline`, `rangeOf`, enable/disable/reflow, next-shot transition overlap. Brand-independent. **Becomes `engine/timeline.ts`.**
- `hero/cursorPath.ts` — shot-relative cursor keys resolved against a timeline. Generic mechanism; the KEYS array is content.
- `hero/EditLayer.tsx` — drag/pick overlay via `saveDefaultProps`. Generic mechanism, hardcoded to `HeroReel` comp id + hero prop paths.
- `hero/layout.ts` `setAtPath/moveAtPath` — generic.
- `fonts.ts` — font injection with `delayRender`. Mechanism generic, face list is Atomic.
- `MaskText` line-mask reveal, `MaskReveal`/`CircleReveal` clip reveals, `Clip` (push + startFrom), `KnockoutPlate` SVG text mask — generic mechanics with Atomic defaults baked in.

### B. MOTION PRIMITIVES / PATTERNS (reusable behaviour, styling must become brand-driven)
- `Mosaic` — 12×8 cell grid, drift, arrival. Strong constraint. Grid dims + font + colours hardcoded.
- `WebGallery`, `Gallery3D`, `MobileGrid`, `LogoWall`, `FloatingCards`, `WindowStack` — media/layout patterns; radius, shadow, ground, chrome baked in.
- `BrowserWindow` (inner chrome), `SiteFrame` (outer chrome), `Frame` (deck OS window) — three window styles = one primitive with a brand-chosen style.
- `Annotated` — callout pattern; window style + type baked in.
- `SystemLabel`, `SpecLabel`, `Chrome` — label register; mono font, cobalt chip baked in.
- `ShotTransition` (7 types) + `Shutter` + `PixelTransition` — transition vocabulary. `pixelate`/`shutter` are Atomic-identity covers; `fade/wipe/iris/blinds` are neutral.
- `FigmaFrame`, `Cursor`, `Crosshair` — UI choreography primitives; accent colour baked in.

### C. BRAND-SPECIFIC (Atomic)
- `theme.ts` COLOR/FONT/OUT/LINEAR_ISH — this *is* the Atomic brand; wrong home.
- `typography.ts` pairings — Atomic shortlist.
- `DotField`, `Sparkles`, mascot, `SigMark`, `Grid` (deck's 8×4 rule grid at exact px), `Shutter` cobalt bands, pixel confetti tint rule, `{PROJECT` wordmark form, Neue Haas/Tronica pairing, "Geet Parmar" in `Chrome`.
- Per-project palettes sampled in `HeroReel.tsx` (GROW_CREAM, CREO_GREEN…) — content-level colours, not brand.

### D. CONTENT
- `hero/shots.ts` table, `defaultHeroProps`, cursor KEYS, `Root.tsx` defaultProps for every comp, `public/media/**`, `public/site/**`, copy strings, callouts, URLs.

### E. TECHNICAL DEBT
- `1920`/`1080` literals in ~20 files (Mosaic cells, transitions, MobileGrid centring, DotField, Grid, iris radius). Only `KnockoutPlate` takes width/height. Should read `useVideoConfig()`.
- Three copies of "durations → derived starts" (hero/site/vertical) + one absolute table (`SCENE`).
- Every component re-implements `interpolate(frame,[d,d+N],[0,1],{clamp,easing:OUT})` — ~40 copies. No shared `useReveal`/`progress` helper.
- Reveal durations are magic numbers per component (6, 12, 14, 18, 20, 22, 26). No semantic tier.
- `Annotated` window geometry `left=490 top=200 940×620` hardcoded; `mediaSpotsAt` duplicates it.
- `EditLayer` hardcodes `COMPOSITION_ID = "HeroReel"` and knows hero prop paths — not reusable for another comp without a copy.
- `Clip` prepends `media/`; `WebGallery` prepends `media/gallery/` — path convention scattered.
- `MascotTitle`/`FinalTitle` duplicate the title block layout.
- `typography.ts` and `fonts.ts` split one concern (face → file, tracking, weights).

## 3. What is already genuinely reusable
Timeline reflow · shot-relative cursor choreography · editable defaultProps + drag overlay · mask/clip reveal mechanics · grid-constrained mosaic · knockout SVG mask · browser-in-a-window with drawn-on chrome · logo/phone/gallery drift patterns · cover-style transitions with seeded randomness · deterministic (frame-derived, `random(seed)`) everything.

## 4. Decision
Evolutionary: leave every existing file in place and rendering. Add `src/motion-system/` alongside, make `theme.ts` *derive* from the Atomic BrandSystem so old components pick up the brand through the same constants they already import, and build the brand-aware primitives/patterns as new modules that the old components can migrate onto one at a time.
