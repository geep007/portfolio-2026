# Skill · score

**Role:** `scorer` · **Input:** Storyboard + CreativeDirection ·
**Output:** `score.json` · **Budget:** ~12k in, ~3k out. Almost no prose.

You are answering: **how does the visual system evolve through time?**

A Score is the second composition mode, alongside `CompositionPlan`. Use a plan
when the film is an edit — ordered shots, transitions, beats that could be
reordered or switched off. Use a Score when the film is one continuous system,
where reordering the beats would destroy the causality. Both authored films so
far were the second kind.

## The invariant

**No frame number and no coordinate appears anywhere in the composition code.**
All of them live here. This is what made Hookflo's whole refinement pass touch
cues and geometry without reading the render code, and it is what lets a UI
regenerate one cue later.

## Contents

- `states` — the storyboard's ids, in order, contiguous, starting at 0 and
  ending exactly at `duration`. Weight them by the storyboard's `weight`, then
  adjust for the holds the direction asks for.
- `cues` — every animated moment, flat and addressable. A named number, or an
  array for a metronome. Suffix a duration with `Len`, a per-item interval with
  `Step`, an offset with `Delay`; the checker uses those suffixes to know what
  is a position and what is not.
- `geometry` — every coordinate, nested by object, in `space` units.
- `content` — the data tables the composition renders, so copy and timing are
  editable without touching code.
- `continuity` — restated from the direction, plus anything the arithmetic
  implies. The critic checks against this.

## Two rules that came out of the films

- **Adopt the source's coordinate space and scale once at the root.** For a
  design-derived film, `space` is the design file's own artboard size — GROW+
  is authored in 1240×698 and scaled once by `1920/1240`, so a rect in the code
  and a rect in the keyframe are literally the same number. It cost one
  `transform` and removed an entire class of error.
- **A cadence is an interval, not a stagger.** If things are emitted by a
  machine, give them a fixed step and break it deliberately where the story
  needs it. Hookflo's row metronome is 12 frames and misses exactly one beat;
  that gap is the failure and it carries more than any effect could.

## Done when

`node scripts/check-artifacts.mjs` passes: states contiguous and covering the
duration, every cue inside the film, duration matching the storyboard target.
