# Skill · Remotion build

**Role:** `implementer` · **Input:** Score + Storyboard + CreativeDirection +
AssetManifest + `AGENT_MOTION_GUIDE.md` + retrieved primitives ·
**Output:** the composition + `render-state.json` · **Budget:** ~60k in, ~12k out.

## Retrieve, do not dump

You may open the motion-system tree, but only by name. Read
`AGENT_MOTION_GUIDE.md` first — it lists what exists. Then open the specific
primitives you intend to use. Never load `primitives/` or `patterns/` wholesale,
and never read another film's implementation "for reference".

## Structure

- `films/<brand>/<film>/score.ts` — the typed view of `score.json`. Derives
  helpers; invents no values.
- `parts.tsx` — the film's own components. **Every one takes `t: number` in
  0–1, never a frame.** The composition owns time; the parts own shape. This
  made the refinement pass trivial and the parts previewable in isolation.
- `<Film>.tsx` — for a continuity film: one component, mounted once, for the
  whole duration. No `<Sequence>`, no scene components; every element reads its
  own state from the frame. For a shot film, use `compositions/plan.ts`.

## Use the engine

- `BrandProvider` / `useBrand` for every colour, type role and easing. No hex
  value belongs in a film file unless it is content — another company's brand
  colour, say.
- `engine/timing.ts` `progress()` for every animated value. One call, not a
  hand-rolled `interpolate(frame, [a, b], …, { clamp })`.
- `engine/easing.ts` — name the film's curves in the brand file. Naming them is
  what lets a refinement pass change *character* without touching composition.
- `engine/fonts.ts` — declare faces in the brand; loading is automatic.

## Do not force the system

If the film is not a list of shots with transitions between them, do not use
`CompositionPlan`, `ShotTransition` or `buildTimeline`. Both films to date
correctly used none of them. Forcing the shot model onto a continuity film
destroys the thing that makes it work.

Custom glue is expected. Hookflo's marker identity chain, two-leg orthogonal
migration and gutter-only route stroke could not have come from the system and
should not be pushed back into it.

## Then render

Render the film, then one still per storyboard state, then a contact sheet.
Write `render-state.json` with the artifact versions it came from and the QA
frame paths. Do not write prose about the build; the critic must not read
implementation logs.
