# Run report

Two things were tested: whether the architecture written in the previous pass
actually runs, and whether it generalises to a brand it has never seen.

Both did. Numbers below are provider-reported, never estimated. Where a figure
could not be measured it says so.

---

## Did the architecture work end to end?

Yes, with one honest gap.

`URL → AssetManifest → BrandBrief → CreativeDirection → Storyboard → Score →
composition → render → critique → refinement → final render` ran for
`https://www.athina.ai/` with no human approval between stages. Seven of the
eight stages executed through `runRole`; the implement stage was written in the
parent agent session, and its usage is recorded as `null` rather than guessed.

The film is `Athina-OneRunObserved` — "One Run, Observed", 18s, and its
artifacts are in `projects/athina/`.

## How the runner works

`core/node/role-runner.ts` drives the Claude CLI in headless mode. It is the
provider access this repo has: no API key in the environment and no SDK
installed. It reports real input, output, cache-read and cache-creation tokens,
real cost, the model that served the call, latency and a session id.

Three flags do the token work. `--tools` carries the role's tool list;
`--system-prompt` carries the skill; `--json-schema` enforces structured output.
**Tool definitions are prompt**: the same call costs ~16,500 tokens of overhead
with the default tool set and ~3,400 with one tool. That finding is now encoded
as a `tools` field per role in `models.config.ts`, and it is the single largest
lever found in this pass.

## Cache behaviour

The test was a second Hookflo direction from the same brand brief.

```
RUN hookflo-direction-02
extract        CACHE HIT   assets@1          0 calls
archaeology    CACHE HIT   brand-brief@1     0 calls
direction      ran         creative-direction@1
storyboard     ran         storyboard@1
```

Exactly as designed. It works because the cache key is built from **content**,
not from files or versions:

```
key = hash({ <kind>: contentHash(artifact), … , extra })
```

`contentHash` excludes `provenance`, so re-stamping a date upstream does not
invalidate anything downstream. `extra` carries each stage's non-artifact
dependencies — the source URL for `extract`, the steer and target duration for
`direction`. The dependency graph:

| stage | artifact inputs | extra |
|---|---|---|
| extract | — | source, mode, assetsDir |
| archaeology | assets | source, assetsDir |
| direction | brand-brief, assets | brief, durationTarget |
| storyboard | brand-brief, creative-direction, assets | durationTarget |
| score | storyboard, creative-direction | durationTarget |
| critique | creative-direction, storyboard, render-state | — |

Two implementation facts made it real:

**Artifacts have a declared scope.** `assets` and `brand-brief` are brand-scoped
(`projects/<brand>/`); the rest are film-scoped (`projects/<brand>/<film>/`).
The first implementation read up-scope but always wrote down-scope, which
silently shadowed the shared brief with a per-film copy the moment anything
touched it — and would have made the shared-brief cache hit a fiction. Reads and
writes now resolve identically.

**Migrated artifacts needed real keys.** The Hookflo migration wrote
`inputHash: "migrated"`. `--seed` recomputes the key with the same function the
runtime uses, touching nothing else. All four Hookflo `missing-dot` stages are
now seeded, so re-running that film is a full cache hit and **cannot** regenerate
the shipped work.

## Actual tokens and cost

`PROMPT` is total input volume (uncached + cache reads + cache writes) — the
provider's `input_tokens` alone is near zero because whole requests cache.
`BASE` is the measured adapter floor for that role. `STAGE` is the difference:
what the pipeline itself spent.

**Athina, URL → storyboard** (`runs/athina-01`)

| stage | prompt | base | stage | output | cost |
|---|---|---|---|---|---|
| extract | 81,950 | 11,301 | 70,649 | 4,232 | $0.3257 |
| archaeology | 49,465 | 10,747 | 38,718 | 5,905 | $0.3254 |
| direction | 42,446 | 4,929 | 37,517 | 11,160 | $0.4373 |
| storyboard | 26,519 | 5,090 | 21,429 | 10,316 | $0.3907 |

4 calls · 0 retries · 411s · **$1.4792**

**Athina, score** (`runs/athina-02-score`) — 4 cache hits, 1 call, **$0.2274**
**Athina, critique** (`runs/athina-03-critique`) — 5 cache hits, 1 call, **$0.3511**

**Total for one Athina film through the pipeline: $2.06, 6 model calls, 0
retries.** Implementation, rendering and the refinement pass are not in that
figure; they were agent-executed.

**Hookflo second direction** (`runs/hookflo-direction-02`) — 2 cache hits,
2 calls, **$0.6745**. A second film for a known brand costs a third of the
first, which is the cache doing exactly what it was built for.

## Largest consumers

- **By input: `extract` (70,649).** It fetches the page and looks at five
  screenshots. Images dominate, and this is the stage the architecture
  deliberately pays once so nothing downstream pays again.
- **By output: `direction` (11,160).** Three pitches, ten scores each, and a
  full CreativeDirection. Reasoning is the product here; this is money well
  spent.
- **`critique` is second by input (69,698)** for the same reason as extract —
  it reads seven rendered PNGs.

## Raw source rereads

**None past archaeology, on any run.** `assertReadable()` is called from the
orchestrator's `noteFetch`, so a stage whose contract forbids raw source throws
rather than quietly re-crawling. `direction`, `storyboard`, `score` and
`critique` fetched nothing; they worked from the brief.

Rejected directions did not leak: `direction-candidates.json` is written once
and read by nothing. The storyboard prompt contains the brief, the direction and
the asset captions — 12,890 characters — and no website, no candidates, no
PROCESS.md, no repo.

## Did compression hurt quality?

No, and this is the result that matters most.

The archaeology stage — working only from five screenshots and the page — found
that Athina's mark is "many parallel runs, one of them observed", that the
category default is an oversized dark dashboard while Athina's hero shows no
product at all, and that "the marketing is night, the tool is daylight". The
direction stage, which never saw the website, built a film on the mark's own
logic and cited brand rule ids in its forbidden list. The storyboard stage
caught its own remounts, an off-grid dot move and a logo-build reveal.

The critic, seeing only frames and the direction, found six real problems
including two I had also found by eye, and every one of its fixes was a removal
or a geometry correction. Its findings are in
`projects/athina/first/render-state.json`.

## What to optimise next

1. **`extract` and `critique` are image-bound.** Fewer, better-chosen frames
   would cut both. The critic does not need seven full-resolution stills; one
   contact sheet would do, and `out/athina/contact-sheet.png` now exists.
2. **The adapter baseline is 4,900–11,300 tokens per call.** The fetching roles
   pay double the reasoning roles purely in tool definitions. Trimming
   `extractor` and `brandAnalyst` to the tools they actually use is a
   one-line change per role.
3. **`score` cost $0.23 for 3,508 tokens of input.** It is the cheapest stage
   and a strong first candidate for a smaller model.

## Ready for the first UI?

Yes for reading, not yet for writing. Every artifact is addressable and
versioned, the cache invalidates correctly, and a run's metrics are one JSON
file. What is missing is a stage implementation for `implement`, so a UI cannot
yet ask for "rebuild the film from this edited Score" — see `TODO-NEXT.md`.
