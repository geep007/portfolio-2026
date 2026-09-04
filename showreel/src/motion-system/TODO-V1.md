# TODO — V1

## NOW (required for this experiment)

- [ ] **EdelGive photography.** `public/media/edelgive/` holds three landscapes only; the site's register needs people at work (portraits, 4:5). Every stat-tile and split-reveal is waiting on them. Source: EdelGive's own assets or a licensed set — not scraped from the site.
- [ ] **Manrope.** Not installed; body falls to Avenir Next. Add the OFL files under `public/fonts/` and list them in `edelgive/brand.ts` `typography.body.files`.
- [ ] **Watch the three EdelGive pieces in Studio end to end** and tune: photo-statement headline rise feels long at tempo 1.35 (consider `hero` → 34); pillar-index body copy delay; wave amplitude on 9:16.
- [ ] **Render both `Launch-*` compositions to mp4** and put them side by side. Judge: does EdelGive read as a different *person*, not a different palette? Record the verdict in `docs/COMPARISON.md`.
- [ ] `validatePlan` is not called anywhere at build time. Add a `npm run plans:check` script that validates every plan in `plans.ts` and fails on issues.
- [ ] `PanelMosaic` layouts assume 12×8; EdelGive's grid is 4×2. Either express layouts in fractions or give the pattern a per-brand layout table.
- [ ] `KnockoutStatement` mask id derives from the headline — two beats with the same words collide. Use the shot id.
- [ ] 9:16 pass: `photo-statement`, `headline-reveal`, `stat-tiles` (columns → 2), `logo-outro`. Everything else can wait.

## NEXT (if Atomic + EdelGive succeeds)

- [ ] Migrate `HeroReel` scenes onto the new primitives one at a time (`Mosaic`→`PanelMosaic`, `BrowserWindow`→`BrowserFrame`, `SystemLabel`→`LabelFlash`), keeping the Studio drag overlay working. Delete `hero/components/*` duplicates as they empty.
- [ ] Fold `site/`, `vertical/`, `intro/`, `outro/` timelines onto `engine/timeline.ts`. `ShowreelShort`'s absolute `SCENE` table last.
- [ ] Generic edit layer: a `PlanEditor` overlay that maps hotspots from pattern meta instead of hardcoded hero prop paths.
- [ ] Cursor as a brand-optional overlay pattern (`brand.motion.cursor`), keys stored per beat id.
- [ ] Third brand with a very different register (dense/dark/fast) to see whether the schema bends or breaks. Candidates: a fintech, a fashion house.
- [ ] Per-brand layout tables (cell arrangements) so `stat-tiles`/`panel-mosaic` compose on the brand's real column count.
- [ ] A `brand-analysis.md` → `brand.ts` checklist so the analysis step is repeatable by an agent.
- [ ] Music beats: let a plan pin beat boundaries to audio markers.

## LATER (product)

- Automatic site capture → analysis draft (screenshots + computed styles → agent).
- Figma variables → BrandSystem import.
- Plan authoring UI on top of the Studio props panel.
- Cloud render, accounts, billing. None of this before the creative abstraction is proven.
