# Token strategy

The Hookflo film worked. It was also expensive, and not because any one step
was verbose — it was expensive because **later steps kept re-reading earlier
steps' inputs**: the website, the screenshots, a 29KB source study, a 53KB
storyboard, a 297-line PROCESS.md.

The fix is not shorter prompts. It is **progressive context compression**: each
stage converts expensive raw material into a compact canonical artifact, and
every later stage reads the artifact instead.

```
website ──▶ extract ──▶ assets.json          (refs + 15-word captions)
            archaeology ──▶ brand-brief.json  ← the LAST stage that opens the site
            direction   ──▶ creative-direction.json  (+ candidates, which die here)
            storyboard  ──▶ storyboard.json
            score       ──▶ score.json
            implement   ──▶ composition + render-state.json
            critique    ──▶ findings on render-state.json
```

Measured on the migrated Hookflo project: the full artifact set is **≈8.8k
tokens**, against **≈30k+ tokens** of raw source study, storyboard HTML,
directions and process notes it replaces — and, more importantly, the artifact
set is what every stage after archaeology sees, once, instead of the raw
material being re-read at each step.

## The ten rules

**1 · Read once, summarise once.** An expensive raw source is converted exactly
one time. `extract` and `archaeology` are the only stages that may open the
website; `core/stages.ts` states that as a contract and `assertReadable()`
enforces it.

**2 · Artifacts are memory.** A downstream stage trusts the structured artifact
above it rather than repeating its reasoning. If the storyboarder needs to know
what the mark means, it reads `brandBrief.markLogic` — it does not re-look at
the logo.

**3 · Retrieve, don't dump.** When code is needed, locate the named primitive.
`AGENT_MOTION_GUIDE.md` is the index; the implementer opens what it names and
nothing else. Never load `primitives/` or `patterns/` wholesale, and never read
another film's implementation "for reference".

**4 · Output JSON before prose.** Anything a machine will read is structured
and short. A 4,000-word markdown analysis that another agent must re-read is
the failure this architecture exists to prevent.

**5 · PROCESS.md is not pipeline context.** It is a research and debugging
artifact, written at the END for humans. It is never an input to generation.
Everything in it that generation actually needs has a field:
`brief.failureModes`, `storyboard.critique`, `renderState.limits`,
`direction.forbiddenBehaviours`.

**6 · Rejected directions die early.** Candidates are ≤60-word pitches. Once
one is promoted, the rest are written to `direction-candidates.json` and never
travel downstream. What was worth keeping from a loser is recorded in its
`salvaged` field, in one sentence, and then it is gone.

**7 · Visual references by id.** `ref.hero`, `ref.logo.mark`,
`ref.product.failure`. Each asset gets ONE ≤15-word caption in
`assets.json`, and that caption is what downstream stages read instead of the
image. Screenshots are never re-described in prose.

**8 · Cache everything.** `isFresh()` hashes a stage's declared inputs against
the artifact's `provenance.inputHash`. Unchanged inputs mean the stage is
skipped entirely — no model call. Changing state 04 of a storyboard must not
re-run brand archaeology, and with the cache in place it cannot.

**9 · Local regeneration.** Every artifact is addressable
(`core/artifacts.ts`): `score.cues.travel`, `storyboard.states.drop.visual`,
`direction.densityArc.scan.density`. Arrays of objects address by `id` before
index, so inserting a state does not invalidate every address after it. This is
what makes "regenerate one cue" a real operation rather than a rerun.

**10 · Context budgets.** Per role, in `models.config.ts`:

| stage | context | output | images | notes |
|---|---|---|---|---|
| extract | 40k | 2k | 12 | mechanical, no taste |
| archaeology | 60k | 2.5k | 12 | the one expensive read; output must be tiny |
| direction | 12k | 2.5k | 3 | small context, high reasoning |
| storyboard | 16k | 4k | 6 | selected refs only |
| score | 12k | 3k | 2 | arithmetic; almost no prose |
| implement | 60k | 12k | 2 | code retrieval on demand |
| critique | 12k | 2k | 2 | contact sheet + direction + relevant states |
| refine | 30k | 6k | 1 | findings + the named files |

These are design ceilings, not enforced quotas. A stage that wants more is a
design smell — usually a missing field upstream.

## What this does NOT try to save

- **Reasoning inside a stage.** Creative direction should think hard; it just
  should not think hard about a website it can read a brief of.
- **The archaeology read itself.** Looking properly at the site once is what
  produced `markLogic`, which is the single most valuable line in the project.
  Compress the output, never the looking.
- **The storyboard self-critique.** It costs one pass and it is the cheapest
  quality in the pipeline.

## Verifying it works

`node scripts/run-report.mjs` prints tokens by stage. Two lines matter more
than the totals:

- **RAW SOURCE REREADS** must only ever list `extract` and `archaeology`.
- **CACHE HITS** — a second run that changes only the storyboard should hit the
  cache on extract, archaeology and direction.
