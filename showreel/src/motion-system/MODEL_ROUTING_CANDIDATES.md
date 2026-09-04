# Model routing candidates

Every role runs on the same high-quality model today, deliberately: this pass
was for a clean quality/cost baseline. Nothing here has been switched. The
recommendations below are drawn from two real runs — `runs/athina-01` (a new
brand, URL to storyboard) and `runs/hookflo-direction-02` (a second film for a
known brand).

Routing a role is a one-line change in `models.config.ts`. Nothing else moves.

| role | stage tokens (in / out) | cost | judgement |
|---|---|---|---|
| extractor | 70,649 / 4,232 | $0.33 | **TEST CHEAPER** |
| brandAnalyst | 38,718 / 5,905 | $0.33 | **KEEP STRONG** |
| creativeDirector | 37,517 / 11,160 | $0.44 | **KEEP STRONG** |
| storyboarder | 21,429 / 10,316 | $0.39 | **KEEP STRONG** |
| scorer | 3,508 / 5,684 | $0.23 | **TEST CHEAPER** |
| implementer | not measured | — | KEEP STRONG (unmeasured) |
| critic | 69,698 / 2,690 | $0.35 | **KEEP STRONG** |
| fixer | not yet implemented | — | **TEST CHEAPER** when built |

---

### extractor — TEST CHEAPER

Mechanical: list what is on a page, name it, caption it in fifteen words. No
taste, no judgement, and a schema that constrains the output tightly. It is also
the single largest input consumer (70,649 tokens, mostly images), so a cheaper
model saves more here than anywhere else.

*Risk:* captions are the only prose description of an asset that exists
anywhere downstream. A weak caption silently degrades archaeology. Mitigate by
checking that every asset's caption names what is IN the image rather than that
it exists.

### brandAnalyst — KEEP STRONG

The highest-leverage reasoning in the pipeline. This run produced "the mark is
the product drawn… many parallel runs, one of them observed", the
night-marketing/daylight-tool inversion, and the observation that Athina
advertises its own unflattering numbers. Every one of those decided something
downstream. A brief that is merely accurate rather than perceptive costs
nothing to produce and ruins everything after it.

### creativeDirector — KEEP STRONG

Highest creative leverage, moderate token volume, and the largest output in the
pipeline because reasoning *is* the product. It also has to hold ten scoring
criteria across three candidates and salvage from the losers. This is the last
role that should ever be routed down.

### storyboarder — KEEP STRONG

Its self-critique is doing real work: this run caught a remount disguised as a
transition, a dot moving off-grid, and a logo-build reveal — three continuity
errors that would have surfaced only after a render. That is exactly the kind of
finding a weaker model misses, and it is cheap here and expensive later.

### scorer — TEST CHEAPER

Mostly arithmetic: distribute weighted states across a frame budget, name cues,
place coordinates. The output schema is strict, `check-artifacts.mjs` verifies
contiguity and bounds mechanically, and errors are caught before a model call is
wasted downstream. Smallest input in the pipeline (3,508 tokens).

*Risk:* geometry that is valid but ugly. The check script catches invalid, not
ugly. Worth testing behind the existing artifact check.

### implementer — KEEP STRONG (and measure it first)

Not measured: this run's implementation was written in the parent agent session,
so there is no usage to route on. It is the largest code-generation surface in
the system and the place where a weak model produces plausible-looking
choreography that violates continuity. Build the stage, measure it, then decide.

### critic — KEEP STRONG

Second-largest input (69,698, mostly rendered frames) but only 2,690 tokens out.
The job is to look at images and notice that a sphere never went dark, that a
gradient escaped its panel, and that a headline is sitting on the evidence. That
is visual judgement, and the whole refinement pass depends on it being right.
Cheap in output, expensive to get wrong.

### fixer — TEST CHEAPER when built

Mechanical by definition: apply named findings to named files, no redesign.
Potentially high token volume because it reads code. The best cost/risk ratio in
the system once it exists — but it does not exist yet.

---

## Before switching anything

1. Build the `implement` and `refine` stages so all eight roles are measured.
2. Re-run Athina end to end on one changed role at a time, and compare the
   artifact against the current one — the artifacts are diffable, which is what
   makes this testable at all.
3. Watch `check-artifacts.mjs` and the critic's finding count. A cheaper model
   that produces more critique findings has not saved money.
