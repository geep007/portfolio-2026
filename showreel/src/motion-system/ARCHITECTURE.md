# Brand Motion System — architecture (V1)

The research question: **what is the smallest structured representation of a brand that lets an agent compose motion graphics that feel native to that brand?**

V0 answer: a `BrandSystem` (look + move, ~120 fields) plus a `MotionVocabulary` (which of ~15 engine patterns the brand speaks, with per-brand guidance and fixed options). Everything else is engine.

**V1 adds the second half of the question: what is the smallest set of artifacts that lets an agent take a URL to a finished film, autonomously, without any stage re-reading the last one's inputs?** V0 modelled the *film*. V1 models the *pipeline that produces the film* — seven small typed artifacts, a stage contract that says what each stage may open, and a cache that makes changing one storyboard state cost one call instead of a rerun. Sections 11-15 below. `TOKEN_STRATEGY.md` is the cost half; `ARCHITECTURE_DECISIONS.md` records what was deliberately not generalised.

```
src/motion-system/
  brand/          schema.ts (BrandSystem)  vocabulary.ts (MotionVocabulary)  BrandProvider.tsx
  engine/         timeline.ts  timing.ts  easing.ts  fonts.ts
  primitives/     Media  TextReveal  Mask (Mask/CircleMask/RailMask)  BrowserFrame  LabelFlash  RuleGrid
  patterns/       15 LEVEL-2 patterns + types.ts + registry.ts
  transitions/    ShotTransition.tsx (11 named transitions)
  compositions/   plan.ts (CompositionPlan)  render.tsx (validate/plan→timeline/PlanFilm)  BrandLaunchFilm.tsx  plans.ts
  brands/         atomic/{brand,vocabulary}.ts   edelgive/{analysis.md,brand,vocabulary}.ts   index.ts
  core/           schemas/ (the seven artifacts)  artifacts.ts  roles.ts  models.config.ts  stages.ts  telemetry.ts  node/store.ts
  pipeline/       run.ts (orchestrator: contract -> cache -> stage -> telemetry)
  agent/          SYSTEM_PRINCIPLES.md  AGENT_MOTION_GUIDE.md  skills/
  films/          hookflo/{score.ts, parts.tsx, MissingDot.tsx} — authored films
  Root.tsx        registers Launch-<brand>, Plan-* and authored film compositions

projects/<brand>/           assets.json  brand-brief.json
projects/<brand>/<film>/    creative-direction.json  storyboard.json  score.json  render-state.json
runs/<run-id>/              metrics.json
```

## 1. What is the engine?

Brand-independent Remotion infrastructure. It knows about frames, sequences, clip-paths and beziers; it does not know what any brand looks like.

- `engine/timeline.ts` — the edit as data: ordered shot entries with enable/disable, derived absolute positions, transition overlap, shot-relative key resolution (the cursor mechanism). Lifted unchanged from the hero reel.
- `engine/timing.ts` — semantic durations (`micro/short/standard/hero`), stagger tiers, `progress()` (the one clamp-and-ease every component used to hand-roll), `useShotClock()` (a shot's own enter/hold/exit clock).
- `engine/easing.ts` — bezier data → memoised `Easing` functions; reference curves.
- `engine/fonts.ts` — @font-face injection from the brand's face list, render held until parsed.
- `transitions/ShotTransition.tsx` — reveal, cover, push and wave families. Reads frame size from `useVideoConfig`, colours from the brand, and refuses transitions the brand does not list.

## 2. What is a brand?

`BrandSystem` (`brand/schema.ts`): plain JSON-compatible data in two halves.

- **Look**: identity, colors (with a full inverse ground), typography (faces, scale, roles with weight/tracking/leading/casing), spacing, layout (columns/rows/alignment/symmetry/density), surfaces (radius, border, shadow, clipping hard/soft), imagery (crop, treatment, push, drift).
- **Move**: `motion` — tempo (scales every semantic duration), amplitude (scales every travel distance), three named easings (+ extras), overshoot, stagger tiers, duration tiers, allowed transitions and frame range, preferred entrances/exits, camera, cursor.
- **Motifs** and **rules** (always / sometimes / never) — prose for the agent, not for the engine.

`MotionVocabulary` (`brand/vocabulary.ts`): the subset of patterns the brand uses, each with an alias, roles, energy, brand-scaled duration range, constraints, goodFor/avoidWhen, and `brandOptions` — the fixed pattern options that make a generic pattern the brand's own (Atomic's gallery flies, EdelGive's clips open on rails; same pattern).

Brands are wired in `brands/index.ts`. `theme.ts` (legacy) now derives its constants from the Atomic brand so every old component reads the brand without changing.

## 3. What is a primitive?

LEVEL 1. A small building block with one visual behaviour and no content semantics: `Media` (image/video with brand push), `TextReveal` (mask-rise / mask-drop / clip-wipe / hard — no fade), `Mask` family, `BrowserFrame` (hairline / plain / titled chrome), `LabelFlash`, `RuleGrid`. They call `useBrand()` and never accept colours or fonts as props. They accept a semantic duration, not a frame count.

## 4. What is a motion pattern?

LEVEL 2. A complete shot behaviour that takes `content` and renders a frame-filling composition. Fifteen exist:

| Typography | Media | Layout | Product | Logo |
|---|---|---|---|---|
| headline-reveal, knockout-statement, stat-reveal | photo-statement, structured-gallery, floating-cards | panel-mosaic, split-reveal, stat-tiles, pillar-index | browser-scroll, annotated-window, device-grid | logo-wall, logo-outro |

Each exports `{ meta, Component }`. `meta` is the machine-readable card (roles, compatible content, energy, duration, constraints, avoidWhen, declared options). Positions inside a pattern are cell slots on the brand grid, never free pixels. Options are enumerated and declared; an undeclared option fails validation.

## 5. What is a scene?

LEVEL 3 — a beat in a plan: `{ beat, pattern, content, transition }`. In V0 scenes are not React components; they are rows in a `CompositionPlan`. `render.tsx` mounts the pattern in a `Sequence` sized by the timeline, wrapped in the brand's transition. The legacy `HeroReel` scenes (`MosaicOpen`, `FigmaToLive`…) are the hand-authored equivalent and stay as they are.

## 6. What is content?

`BeatContent`: headline lines, subhead, label, body, media refs (path under public/, start frame, crop position), logos, stat(s), url, cta. Content never carries a colour, a size, or a frame number. Media paths are explicit — no folder magic.

## 7. How does timing work?

- A composition is a `Timeline` built from ordered entries; positions are derived. Disable or retime a beat and the rest reflow. Unchanged from the hero reel.
- Inside a beat, a pattern reads its own duration from the enclosing `Sequence` and uses `useShotClock` for enter/hold/exit, so retiming a beat never breaks its exit.
- Every animation length is a tier (`micro 6 · short 12 · standard 22 · hero 36` at tempo 1.0). The brand's `tempo` multiplies them: EdelGive at 1.35 makes `standard` 35 frames without any pattern changing.
- Each shot stays mounted for the *next* shot's transition length so reveals have something real underneath.
- Plans may set a target `duration` in seconds; unpinned beats scale to fit.

## 8. How does a brand influence motion?

Not by skinning. The same plan under two brands differs in:

1. **Which pattern tells each beat** — vocabulary preferences per beat (Atomic hook → panel-mosaic, EdelGive hook → photo-statement).
2. **How a shared pattern behaves** — `brandOptions` (gallery `fly` vs `rail`, logo `drift` vs `grid`, headline `grid: true` vs `emphasisLine: last`).
3. **Pace** — tempo, stagger tiers, transition frame range.
4. **Physics** — easing set, amplitude, overshoot, drift on/off, push amount.
5. **Cuts** — the allowed transition list; the engine refuses others.
6. **Surfaces** — radius, clipping hard/soft (masks vs fades), shadow, border.
7. **Type** — faces, roles, casing, line-breaking preference.

`BrandLaunchFilm` is the proof: identical content, Atomic gives dark mosaic → hairline browser opening to full bleed → flying gallery → title on rule grid; EdelGive gives dimmed landscape with centred serif → rounded split spread → three rounded cards on rails → mark with a pill.

## 9. How should an agent use the system?

Read `agent/AGENT_MOTION_GUIDE.md`. In short: pick a brand, write a `CompositionPlan` using only pattern ids from that brand's vocabulary, respect constraints, run `validatePlan`, register it in `compositions/plans.ts`, render. The agent chooses WHAT (beats, patterns, content); the brand and patterns decide HOW.

## 10. What should NOT be generalised?

- The hero reel's match-cut chain, cursor choreography and mascot ending. They are authored film, not patterns. They stay in `hero/`.
- Project palettes sampled from client sites (GROW cream, Creo green) — content, not brand.
- Pixel positions inside patterns. They are cell slots and stay that way.
- The Studio drag overlay — it is bound to `HeroReel` props and should stay that way until a plan editor exists.
- Fade as a text entrance. It is not a behaviour any brand here owns, so `TextReveal` does not offer it.

---

## 11. What are the seven artifacts?

Seven layers, deliberately not collapsed into one giant JSON document or one
giant prompt. Each answers one question, and each is small enough to paste
whole into the next stage.

| artifact | question | scope | ~tokens (Hookflo) |
|---|---|---|---|
| `AssetManifest` | what source material exists? | brand | 590 |
| `BrandBrief` | what does this identity permit? | brand | 1,930 |
| `CreativeDirection` | what is this film trying to communicate? | film | 1,360 |
| `Storyboard` | what are the important visual states? | film | 2,430 |
| `Score` | how does the system evolve through time? | film | 1,120 |
| `RenderState` | what was actually generated? | film | 810 |
| `direction-candidates` | what was considered? (write-only) | film | 590 |

Types in `core/schemas/`. Two are worth calling out:

**`BrandBrief.markLogic`** — the mark read as a *diagram*, not as an asset.
Hookflo's is a 3x3 grid with one position empty and one dot white: a stream of
deliveries in which one is missing and one is caught, which is exactly the
product. A token-extraction pass files that as "logo, PNG". It was the single
highest-value line in the project, and it is one string.

**`BrandBrief.failureModes`** — "how to ruin this brand", written *before*
designing. It is what killed the floating-cards idea, the glow and the camera
push before any time was spent on them. Required output, not optional.

## 12. What is a Score, and when is it right?

`CompositionPlan` is the **edit** model: ordered shots with transitions, beats
that can be reordered or disabled. `Score` (`core/schemas/score.ts`) is the
**continuous system** model: named state boundaries, a flat cue sheet, a
geometry table, and film-specific content.

Both authored films arrived at this shape independently — Hookflo's
`films/hookflo/score.ts` and GROW+'s `grow/timeline.ts` — and both correctly
used no plan, no `ShotTransition` and no `buildTimeline`. Two independent votes
is why it is core.

Choose by asking: *could these beats be reordered?* Yes -> plan. No -> score.

The Score carries one invariant: **no frame number and no coordinate appears
anywhere in composition code.** Hookflo's entire refinement pass touched cues
and geometry without reading the render code.

`Score.space` is the coordinate space every geometry number is in. For a
design-derived film that is the design file's own artboard, scaled once at the
root — GROW+ is authored in 1240x698 and scaled by `1920/1240`, so a rect in
the code and a rect in the keyframe are literally the same number.

## 13. Two ingestion modes

**Mode A · brand-derived.** URL -> extract -> archaeology -> direction ->
storyboard -> score -> implement -> critique -> refine. Hookflo is the
reference.

**Mode B · design-derived.** Approved keyframes -> extract -> storyboard
(visual-state analysis + continuity inference) -> score -> implement ->
critique. GROW+ is the reference. **No archaeology and no direction generation**
— the creative direction was approved before the pipeline started, and forcing
it through brand archaeology would be re-deriving a decision that has already
been made.

Both converge on Storyboard + Score + Remotion. `stagesFor(mode)` in
`core/stages.ts`.

## 14. How is a stage stopped from re-reading everything?

`core/stages.ts` gives every stage a contract: `reads` (which artifacts it is
handed), `readsSource` (which classes of raw material it may open),
`neverReads` (hard exclusions), and `cacheKey`.

Only `extract` and `archaeology` list `raw-source`. Nothing lists
`prose-research` — PROCESS.md is a research output, never an input. The
storyboarder never sees rejected candidates; the critic never sees
implementation logs.

The orchestrator (`pipeline/run.ts`) assembles exactly the artifacts a
contract lists and hands the stage that object. **A stage cannot re-read what
it is never given.** Before running, it hashes those inputs against the
existing artifact's `provenance.inputHash`; unchanged means the stage is
skipped with no model call.

## 15. Roles, not models

Stages call `runRole("creativeDirector", ...)`. Which model that is, is
answered in `models.config.ts` and nowhere else — the only file in the system
that names a model, and today every role maps to `"default"`. The runner is
injected via `setRoleRunner()`, so the pipeline imports no provider SDK and can
be exercised with a stub.

`models.config.ts` also carries each role's context/output/image budget, which
is where the token ceilings in `TOKEN_STRATEGY.md` live.

## 16. Observability

`core/telemetry.ts` records per stage: model, input/output/cached tokens, ms,
retries, calls, artifact produced, files actually read, cache hit, and whether
raw sources were reread. Written to `runs/<run-id>/metrics.json`; read with
`node scripts/run-report.mjs`.

The totals are the least interesting numbers on it. **RAW SOURCE REREADS** must
only ever list `extract` and `archaeology`, and **CACHE HITS** should be high
on any run that changes one thing.

## 17. What V1 did NOT generalise

See `ARCHITECTURE_DECISIONS.md` for the full list with evidence. In short:
Hookflo's missing-dot chain, its orthogonal routing and its ban on camera
movement; GROW+'s one-two-six-band sequence and its campaign palette. Those are
film and brand facts. Aesthetics do not get promoted.
