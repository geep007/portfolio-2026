# Athina — PROCESS

What we learned taking athina.ai from a URL to an 18-second film through the
new artifact pipeline, and what it taught us about the architecture.

> **Not pipeline input.** Research and debugging, written at the end, for
> humans. See `motion-system/TOKEN_STRATEGY.md` rule 5.

| | file |
|---|---|
| Captured source | `source/*.jpg` (5 screenshots) |
| Asset manifest | `assets.json` — 16 refs |
| Brand brief | `brand-brief.json` |
| Three directions + scoring | `first/direction-candidates.json` |
| The chosen brief | `first/creative-direction.json` |
| Brand + engine half | `../../src/motion-system/brands/athina/brand.ts` |
| Storyboard (+ self-critique) | `first/storyboard.json` |
| Score | `first/score.json` |
| Film | `../../src/motion-system/films/athina/{score.ts, parts.tsx, OneRunObserved.tsx}` |
| Render + QA | `../../out/athina/{one-run-observed.mp4, frames/, contact-sheet.png}` |
| Critique + limits | `first/render-state.json` |
| Metrics | `../../runs/athina-0{1,2,3}*/metrics.json` |

---

## What the website taught us

**The mark is the product drawn, and it is used everywhere except as a logo.**
The nav glyph is a set of short stacked horizontal rules with one dot riding one
line. The same drawing scales three ways on the site: the bullet beside every
persona name, the cursor glyph on "Watch demo", and — blown to full bleed — an
entire black band of thin rules with peach dots parked on individual lines. Dots
never sit between lines; they always land ON a line. Read it and it says: many
parallel runs, one of them observed. Scoring, not generating.

That reading came out of the archaeology stage, and it is the reason the film
exists in the form it does.

**The inversion is withholding.** The category default for LLM observability is
an oversized dark dashboard bled off-frame with neon graphs. Athina's hero shows
no product at all: a headline you can barely read, physically occluded by three
matte spheres. It withholds where competitors overwhelm.

**The marketing is night; the tool is daylight.** The page is black, white and
peach. Every saturated colour on the site — mint, plum, olive, blue charts,
pastel score tints, the defocused rainbow wash — appears only inside a product
surface. Colour is a property of working, not of branding. That one observation
generated the film's hardest constraint and its best-looking frames.

**The numbers are unflattering on purpose.** 0.42, 0.34, 57% coherence, 72.3%
pass rate. The brand advertises its own product finding problems, which is why
the eval tints are pale washes rather than red/green alarm.

## How to ruin this brand

Ten failure modes were written before any design work, and three of them killed
ideas that would otherwise have cost a render each: *AI-purple gradient
background*, *making the hero readable* (the instinct to drop a scrim under the
occluded headline destroys the brand's whole claim), and *counting numbers up* —
an odometer roll on 72.3% reads as advertising, and a measured value should
appear measured.

## Why the selected concept won

Three were pitched and scored on ten criteria.

- **"One Run, Observed"** (48/50) — one peach dot is one inference; it is born
  from the sphere eclipse, lands on a rule, and never leaves the rule system.
- **"The Failing Cell"** (39) — an argument with one number; tints wash in row
  by row until one lands peach. A better single frame, a weaker film.
- **"Night and Day"** (35) — black editorial frames alternating with pastel
  product slabs. Rejected as a shot film: nothing survives a state change.

Brand specificity, then continuity. The winner comes from the mark's own logic,
so it could carry no other company's logo, and one dot mounted for 18 seconds
makes seven states read as one event. The losers were salvaged rather than
discarded: the winner took "The Failing Cell"'s unbroken hold on 0.42 and "Night
and Day"'s daylight-tool luminance rule.

## What the storyboard changed after self-critique

Nine findings, applied before anything was built. The load-bearing four:

- **"Spheres converge and disappear" implied an unmount, which is a cut.**
  Rewritten as the terminator rotating to collapse the lit crescents into one
  disc while the outer spheres drop to black in place.
- **The dot "descending onto the rule" would be an off-grid vertical move.**
  Inverted: the dot stays fixed and the wiping rule arrives underneath it. The
  grid registers to the dot, not the reverse. This is a better idea than the one
  it replaced.
- **"Panels disappear and the glyph appears" is a logo-build reveal** — the
  brand's own forbidden list. Rewritten so panels drain by luminance and the
  already-present rule stack resolves at glyph scale.
- **Product panels were bare UI.** Unmarked panels read as a generic dashboard
  from any company; each now carries the dot-and-rule glyph and a real label.

## What the motion critique changed

Six findings after the first render, all removals or geometry corrections.
Nothing was added. Full text in `first/render-state.json`.

1. **The spheres never fell to black.** A fully lit grey sphere sat over the
   headline in four states, brighter than the peach dot in every one of them —
   two lit objects per frame, and the dot was no longer the lit unit. The middle
   sphere now hands its light to the dot as the dot is born, and is black
   immediately after.
2. **The rainbow wash escaped its panel**, spilling saturated green and red
   across the black editorial frame. It is now clipped to the panel's rounded
   rect: no saturated pixel reaches the frame.
3. **The headline collided with the panel** — tan "evidence" sitting on white
   panel glass. Reduced to about a third of frame width so its right edge clears
   the panel in every state. No scrim was added, per the brand's own rule.
4. **The right body column covered the SCORE column** at exactly the beat the
   score is claimed. Moved above the panels.
5. **The eval panel was 650px tall with four rows in its top 15%** — the
   largest, brightest object in frame, mostly blank. Sized to its content.
6. **Rules rendered as ragged unequal segments.** One uniform value, knocked out
   only where the headline actually sits.

A seventh finding is mine, recorded in the same place: the Score's `worldScale`
of 0.42 could not make full-bleed rules read as a mark — scaled, 22 rules are a
hatch block. The pull-back is now the rule field *contracting* to the glyph's
own width while every rule the dot never travelled falls dark. Same drawing,
reached by framing rather than assembly, but it is a contraction and not a
camera scale, and that is a deviation from the direction's stated mechanism.

## What was reusable

Roughly 80/20 infrastructure to film-specific glue, which is close to Hookflo's
ratio from the opposite starting point.

**Used as-is and load-bearing:**

- `BrandProvider` / `useBrand` — every colour, type role and easing resolves
  through it. `brand/schema.ts` took a fifth brand with no schema change,
  including one whose `inverse` ground is the product itself. The `semantic`
  colour map again absorbed everything the schema had no field for.
- `engine/timing.ts` `progress()` — every animated value in the film is one call
  to it, wrapped once as `at(frame, cue, lenCue, easing)`.
- `engine/easing.ts` — four named curves in the brand file, so the refinement
  pass could change character without touching geometry.
- `engine/fonts.ts` — faces declared in `brand.ts`, injected and render-blocked
  automatically. Zero film-side code.
- The Score model itself, and the rule that no frame number or coordinate
  appears in composition code. **Four of the six critique fixes were edits to
  `score.json` and never opened the composition.** That is the strongest
  evidence yet for the invariant.

**Not used, correctly:** `compositions/plan.ts`, `ShotTransition`,
`buildTimeline`, and every LEVEL-2 pattern. Three of three authored films have
now been continuity films that the shot model cannot express.

## What required custom glue

`films/athina/` — three files, ~900 lines. The parts that could not have come
from the system: the rule field with per-rule wipe, luminance and contraction;
the sphere terminator; the dot's quantised rule-index travel; the score-tint
wash behind an already-resolved number; the stacked non-unmounting panels.

One thing earned its place as a shared idea rather than a component:
`ruleYAt(i, collapse, originY)` is exported and used by both the rules and the
dot, because the dot has to sit exactly on a rule at every frame including
mid-contraction. Deriving its y separately is how a dot drifts off its line.

## What should NOT be generalised

- **The dot-on-a-rule chain.** It exists because *this* mark is rules and dots.
- **The eclipse.** Athina's spheres are one brand's light source, not a motif.
- **The night-page/daylight-panel inversion.** A brand fact.
- **`0.42`, `72.3%`, `SELECT * FROM inferences WHERE score < 0.5`** — content
  for one film about one product.
- **Geist.** The site sets a geometric grotesque this repo does not license;
  Geist is the closest available and is the one place the film is not the site.

## Token usage

| stage | stage input | output | cost |
|---|---|---|---|
| extract | 70,649 | 4,232 | $0.3257 |
| archaeology | 38,718 | 5,905 | $0.3254 |
| direction | 37,517 | 11,160 | $0.4373 |
| storyboard | 21,429 | 10,316 | $0.3907 |
| score | 3,508 | 5,684 | $0.2274 |
| critique | 69,698 | 2,690 | $0.3511 |

**$2.06 total, 6 model calls, 0 retries, no raw-source reread past archaeology.**
Implementation, rendering and refinement were agent-executed and are not in that
figure.

**Biggest consumer: `extract`** (70,649 in), because it fetches the page and
looks at five screenshots. `critique` is second for the same reason — seven
rendered PNGs. Both are image-bound, and both are the stages where images are
genuinely the work.

## Did progressive compression hurt quality?

No, and this run is the clearest evidence available.

The direction stage never saw the website. It worked from a 1,900-token brief
and produced a concept built on the mark's own logic, with a forbidden list that
cites brand rule ids. The storyboard stage never saw the website or the rejected
candidates, and caught three continuity errors in its own first pass. The critic
saw only rendered frames and the direction, and found six real problems.

The compression is not lossless — it is lossy in the direction of *decisions*.
What survives into the BrandBrief is what someone decided mattered, and the run
stands or falls on that judgement. `markLogic` is one string, and it carried the
entire film.

## What this run taught us about the architecture

- **Contracts beat prompts.** No stage re-read the website, not because it was
  told not to, but because the orchestrator never handed it the URL and
  `assertReadable` would have thrown.
- **The scope bug was only findable by running it.** Reading up-scope and
  writing down-scope looks fine in review and silently makes shared artifacts
  per-film on first write. Two runs exposed it immediately.
- **Tool definitions are prompt.** ~16,500 tokens of overhead per call with the
  default tool set versus ~3,400 with one tool. Nothing in the architecture pass
  predicted this; it is now a `tools` field per role.
- **The Score invariant is the highest-value rule in the system.** Four of six
  critique fixes were data edits.
- **The provider's `input_tokens` is a lie on a caching adapter.** It reports
  only the uncached remainder — near zero when whole requests cache. Real input
  volume is uncached + cache reads + cache writes, and the report says so.

## Honest limits

- **No sound.**
- **The implement stage was executed in the parent agent session**, so its usage
  is `null` in `runs/` rather than measured. The pipeline records the gap rather
  than guessing at it.
- **The ending is a contraction, not a camera pull-back** (critique F7).
- **Five screenshots is thin archaeology.** The privacy, pricing and testimonial
  sections were never captured, so nothing in the brief speaks for them.
- **The film asserts one product truth well** — every inference gets a score, and
  the honest ones are mixed — but says little about collaboration, which the site
  puts at its centre.
