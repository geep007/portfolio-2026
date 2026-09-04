# TODO next

Updated after the runtime pass and the Athina generation run. What was on this
list and is now done has been removed; what the two runs revealed has been
added.

## Done since the architecture pass

- **A real `RoleRunner`** — `core/node/role-runner.ts`, driving the Claude CLI in
  headless mode with real usage, real cost and provider-enforced JSON schemas.
- **Six registered stages** — extract, archaeology, direction, storyboard, score,
  critique.
- **Cache proven** — a second Hookflo direction cache-hit extract and
  archaeology and ran only direction and storyboard.
- **Real telemetry** — `runs/*/metrics.json` plus `npm run report`.
- **Athina end to end** — URL to an 18-second film, $2.06 through the pipeline.

## Build next, in order

1. **The `implement` stage.** The one gap in the chain, and the reason a UI
   cannot yet say "rebuild from this edited Score". It is also the last
   unmeasured role, so `MODEL_ROUTING_CANDIDATES.md` cannot be acted on until it
   exists. Give it the Score, the storyboard, the direction, the asset manifest
   and the agent guide, and `Read`/`Write`/`Edit`/`Bash` scoped to
   `films/<brand>/`.

2. **The `refine` stage (fixer).** Reads `render-state.critique.findings` and the
   named files, applies them, marks `applied: true`. Mechanical by definition and
   the best cost/risk ratio in the system. Four of Athina's six fixes were edits
   to `score.json`, so this stage should prefer data edits and only touch code
   when the finding names a behaviour rather than a value.

3. **`scripts/qa.mjs`.** One command that renders a still per storyboard state,
   tiles a contact sheet, and writes both into `render-state.json` — the artifact
   the critique stage already consumes. About forty lines; the tiling code exists
   (it produced `out/athina/contact-sheet.png`). See `NEXT_UI_DECISION.md` for
   why this rather than a Score→still renderer.

4. **Trim the two fetching roles' tool lists.** `extractor` and `brandAnalyst`
   carry ~11,000 tokens of adapter baseline against ~5,000 for the reasoning
   roles, purely in tool definitions. One line each in `models.config.ts`.

5. **Give the critic a contact sheet instead of seven stills.** 69,698 input
   tokens, almost all images. One tiled image should cost a fraction.

6. **Mode B end to end on GROW+.** Still the only way to know whether the
   design-derived stage list is right. Should be a pure data migration, as
   Hookflo's was.

7. **`loadFonts(faces)` decoupled from `BrandSystem`**, and **`span()` in
   seconds** alongside `progress()`. Both nominated by two films each; both
   still small infrastructure jobs.

## Promote when a second film asks for them

- **`useScanReveal`** — a constant-speed reading head over a list. Hookflo only.
- **`StatusChip`** — semantic state at chip scale. Hookflo only.
- **A score-tint primitive** — a pale wash arriving behind an already-resolved
  number. Athina only, but it is the correct place to enforce "numbers do not
  count up", and a second product film will want it. Closest to the bar.
- **`ruleYAt`-style shared geometry** — the rule that one expression owns where
  a thing sits, so a travelling object cannot drift off it. Appeared in Athina;
  Hookflo solved the same problem ad hoc with `rowMarker`. Two instances, but of
  a pattern rather than of code — write it into the score skill before extracting
  a component.

## What the first UI should consume

Unchanged from the architecture pass, and now demonstrated on two brands: the
seven artifacts and nothing else. `core/artifacts.ts` `getAt`/`setAt` is the
read/write API; arrays address by `id` before index.

The Athina run added one piece of evidence for the design: **four of six
critique fixes were edits to `score.json` that never opened the composition.**
That is exactly the "select a cue, change it, re-render" loop a UI is for.

## Known gaps

- `implement` and `refine` have no stage modules; the orchestrator records the
  gap and continues.
- The adapter's token figures aggregate across internal iterations, so `PROMPT`
  over-counts the logical prompt. `promptChars` is recorded as an exact
  comparison basis; a tokeniser would be better.
- `check-artifacts.mjs` validates structure, not taste. It cannot tell a valid
  Score from a good one.
