# Architecture decisions

Short. One entry per decision that shapes the system. Evidence is from the two
authored films — Hookflo ("The Missing Dot", brand-derived) and GROW+ ("What
Holds It Up", design-derived).

The promotion bar: something becomes shared only if it appeared independently
in two films, OR is plainly infrastructure, OR clearly removes future
complexity. Aesthetics never qualify.

---

### 1 · Seven artifacts, not one document

**Decision.** Split the pipeline into AssetManifest, BrandBrief,
CreativeDirection, Storyboard, Score, RenderState (+ write-only direction
candidates), each a small JSON file with its own version.

**Why.** Each answers a different question and changes at a different rate. A
single blob makes every edit invalidate everything and makes every stage read
everything.

**Evidence.** Hookflo's knowledge was spread across a 29KB source study, a 53KB
storyboard, `directions.md`, `direction.ts`, `score.ts` and a 297-line
PROCESS.md — five formats, no versioning, and no way to change one state
without re-reading all of it. The migrated set is ≈8.8k tokens total.

**Not generalised.** No global "film" object that owns all seven. The layers
stay addressable separately, which is what makes local regeneration possible.

---

### 2 · `CreativeDirection` promoted to core

**Decision.** Move it out of `brands/hookflo/direction.ts` into
`core/schemas/`. BrandSystem/BrandBrief = identity; CreativeDirection = this
film.

**Why.** It did real work rather than documenting intent.

**Evidence.** Hookflo's `forbiddenBehaviours` and `visualDensityArc` were
checked against every storyboard frame and against the render, and the motion
critique was scored against them. Three of the four refinement findings cite a
`forbiddenBehaviours` entry directly.

**Not generalised.** Hookflo's actual forbidden list stays Hookflo's. The field
is general; the contents are a brand-and-film fact.

---

### 3 · `Score` as a first-class second composition mode

**Decision.** Keep `CompositionPlan` for edits; add `Score` — named state
boundaries, flat cue sheet, geometry table — for continuous systems.

**Why.** The engine modelled only shot films, so both authored films were
off-road.

**Evidence.** Two independent votes. Hookflo's `films/hookflo/score.ts` and
GROW+'s `grow/timeline.ts` were written months apart, for opposite ingestion
modes, by different reasoning — and arrived at the same shape. Both films
explicitly rejected `buildTimeline` for the same reason: their beats are causal
and reordering them would be nonsense.

**Not generalised.** Hookflo's eight state names, GROW+'s one→two→six→band
sequence. Those are films.

---

### 4 · Frame numbers and coordinates live only in the Score

**Decision.** An invariant, not a convention: no frame number and no coordinate
in composition code.

**Why.** It makes the refinement pass — the most iterative, most expensive part
of the process — a data edit.

**Evidence.** Hookflo: "the entire refinement pass touched cues and geometry
without reading the render code." All four critique findings were implemented
that way.

---

### 5 · `score.json` is canonical; `score.ts` is a typed view

**Decision.** The numbers live in the JSON artifact; the TypeScript file reads
it and adds types and derived helpers.

**Why.** A Score is the unit a UI regenerates. If the numbers live in code,
"regenerate one cue" means running an implementer.

**Evidence.** Migrating Hookflo this way produced **eight of eight QA stills
byte-identical** to the pre-migration render, which is also the proof that the
architecture change carried no visual cost.

**Not generalised.** `parts.tsx` and `MissingDot.tsx` stay hand-written code.
Only the data moved.

---

### 6 · Progress, not frames, for film parts

**Decision.** Every component a film defines takes `t: number` in 0–1.

**Why.** The composition owns time; parts own shape. Parts become previewable
in isolation and retiming never touches them.

**Evidence.** Hookflo: "All take *progress as a number*, never a frame… It made
the refinement pass trivial." Written into `AGENT_MOTION_GUIDE.md` and
`SYSTEM_PRINCIPLES.md` as a rule.

---

### 7 · "How to ruin this brand" is a required archaeology output

**Decision.** `BrandBrief.failureModes` is mandatory, and it is written before
any design work.

**Why.** Cheapest quality in the pipeline: it kills bad ideas before they cost
anything.

**Evidence.** Hookflo: "Writing the failure modes *before* designing was more
useful than the rules were. It is the artefact that killed the floating-cards
idea, the glow, and the camera push before any time was spent on them."

---

### 8 · The mark is read as a diagram, not extracted as an asset

**Decision.** `BrandBrief.markLogic` — one string, filled first.

**Why.** A mark that encodes the product is the highest-value thing a brand can
give a film, and it is exactly what a token-extraction pass discards.

**Evidence.** Hookflo's whole film exists because someone noticed the nav SVG
is a 3×3 grid with a hole. "It was almost missed."

**Not generalised.** The missing-dot chain itself — mark dot → row rail → the
slot Hookflo fills → routed packet → the card's marker → the mark's white dot.
That only works because *this* mark has a hole in it; generalising it would
produce a pattern nobody could use honestly.

---

### 9 · Two ingestion modes, and Mode B skips archaeology

**Decision.** Mode A (brand-derived) runs the full chain. Mode B
(design-derived) starts at visual-state analysis: no archaeology, no direction
generation.

**Why.** When the creative direction has already been approved, re-deriving it
is expensive and disrespectful of the approval.

**Evidence.** GROW+: "There was no `directions.md` because there were no
directions to score… **a film translated from approved stills needs a different
pipeline from a film derived from a brand.** The system currently models only
the second."

---

### 10 · Design coordinate space is preserved and scaled once

**Decision.** `Score.space` holds the source coordinate space; the composition
scales once at the root.

**Why.** Checking a render against an approved design becomes reading two
numbers rather than eyeballing two images.

**Evidence.** GROW+: "the highest-leverage decision in the build… It cost one
`transform` and removed an entire class of error." General for any
design-derived film; Hookflo also carried its storyboard's 1920×1080 verbatim,
which is the same idea arriving from the other direction.

---

### 11 · Stage read-contracts, not stage prompts

**Decision.** `core/stages.ts` declares per stage: `reads`, `readsSource`,
`neverReads`, `cacheKey`. The orchestrator hands a stage exactly its `reads`.

**Why.** Cost in this pipeline came from later stages re-reading earlier
stages' inputs — not from any stage being verbose. A stage cannot re-read what
it is never given.

**Evidence.** Only `extract` and `archaeology` list `raw-source`. Nothing lists
`prose-research`, because PROCESS.md is a research output written at the end and
was never needed as generation input — everything in it that generation needs
now has a field.

---

### 12 · Roles, not models

**Decision.** `runRole("creativeDirector", …)`; `models.config.ts` is the only
file naming a model; the runner is injected.

**Why.** Routing one stage to a different model later should be a config edit.

**Not built.** Multiple providers, automatic routing, a marketplace. Every role
maps to `"default"` today, deliberately.

---

### 13 · Telemetry measures re-reads, not just totals

**Decision.** `StageMetric` records `rereadRawSource`, `cacheHit` and
`filesRead` alongside tokens.

**Why.** The totals cannot tell you whether the architecture is working. A
stage past `archaeology` opening the website is the specific failure this
system exists to prevent, so it is the thing that gets measured.

---

### 14 · What was deliberately NOT generalised

- **Hookflo's missing-dot identity chain** — a film fact, dependent on one mark.
- **Hookflo's two-leg orthogonal migration and gutter route** — right because
  *this* brand's grammar is rectangular. A brand with organic geometry must not
  inherit it.
- **Hookflo's ban on camera movement** — a brand rule, not an engine rule.
- **The delivery log, the alert card, the source monogram tiles, `03:14`, the
  `410 · endpoint secret rotated` copy** — content for one film about one
  product.
- **GROW+'s one→two→six→band sequence** — right because *those* frames were
  designed that way.
- **GROW+'s bone/forest/blue/yellow palette** — a campaign look for one deck,
  not an EdelGive brand system. The foundation's own site is blush, navy and
  terracotta; conflating them would corrupt the brand file.
- **`useScanReveal` and `StatusChip`** — both nominated by Hookflo's PROCESS as
  future primitives, both still one-film ideas. They are on `TODO-NEXT.md` and
  will be promoted when a second film needs them, per the bar above.
- **`loadFonts(faces)` decoupled from `BrandSystem`** — real duplication
  (GROW+ copies 27 lines of `engine/fonts.ts` because it has no brand), but
  infrastructure work with no bearing on the pipeline architecture. Also on
  `TODO-NEXT.md`.
