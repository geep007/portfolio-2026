# GROW+ — PROCESS

What we learned turning six approved Paper keyframes into a 12.5-second film,
and what of it belongs back in the Brand Motion System.

> **Not pipeline input.** Research and debugging, written at the end, for
> humans. See `motion-system/TOKEN_STRATEGY.md` rule 5. GROW+ is the reference
> film for Mode B (design-derived) in `motion-system/ARCHITECTURE.md` §13; it
> has not been migrated into `projects/` yet — see `TODO-NEXT.md` item 6.

Artefacts, in order of production:

| | file |
|---|---|
| Source design | Paper file *Grow+*, artboard `03 · FINAL SIX` (six keyframes) |
| Brand context | `../motion-system/brands/edelgive/analysis.md` |
| Tokens (lifted, not extracted) | `tokens.ts` |
| The edit | `timeline.ts` (`T`, `MARKERS`, `EASE`) |
| The geometry | `strips.ts` (`stripsAt`, `gapAt`) |
| The film | `WhatHoldsItUp.tsx` |
| Font loading | `fonts.ts` |
| Registration | `../Root.tsx` → `GrowWhatHoldsItUp` |
| Render + QA | `out/grow-what-holds-it-up.mp4`, `out/grow-qa/keyframe-*.png` |
| Command | `npm run render:grow` |

---

## What this film is, and how it differs from Hookflo

The Hookflo film started from a website and worked forward: archaeology →
rules → three directions → storyboard → film. **This one started from the
other end.** Six frames had already been designed and approved in Paper. The
job was not to invent a concept; it was to answer a narrower and harder
question: *what happens between frame 01 and frame 02 such that both remain
true?*

That inversion decided nearly everything downstream. There was no `directions.md`
because there were no directions to score. There is no `source-study.html`
because the source was not a website. There is no `CreativeDirection`, no
`BrandSystem`, no `vocabulary.ts` — GROW+ is not registered in
`motion-system/brands/`, because the piece is authored, like `hero/`, not
generated from a brand.

The useful generalisation: **a film translated from approved stills needs a
different pipeline from a film derived from a brand.** The system currently
models only the second.

## The one rule the keyframes implied

Read as a sequence, the six frames are not six compositions. They are one
horizontal strip of landscape, worked on six times. Frame 02 contains the
material of frame 01, cut. Frame 03 contains frame 02's lower half, gone, and
what was behind it. Frame 04 is frame 03's six strips at the same total height.

So the film's single rule wrote itself: **reveal by removal.** Nothing fades in.
Nothing enters from off-frame. Nothing is composited on top of anything. Every
appearance in the piece is something else moving out of the way, and every
disappearance is a boundary travelling.

Consequences, all of them load-bearing:

- **The frame never travels.** No camera, no push, no parallax, no scale on the
  ground. The only object that scales in the whole film is the ring, by 1.2%,
  once, as it settles.
- **Fade is not in the vocabulary.** Opacity is a *property of a surface*
  (0.85 for the parent strip, 0.38–0.6 for the six, 0.75 collapsed), never a
  transition. The only opacity change over time is the six converging on a
  common value so the collapsed band reads as one surface rather than six.
- **Type appears; it does not perform.** `Block` takes a whole-block clip and
  nothing else. No per-word stagger, no per-character reveal, no letter-spacing
  animation. Given a brand whose live site never animates type at all
  (`analysis.md`), anything else would have been a different company.

## What "one number, one space" bought

Every number in `strips.ts`, `timeline.ts` and `WhatHoldsItUp.tsx` is in the
Paper artboard's own coordinate space — 1240 × 698 — and the whole composition
is scaled once at the root by `SCALE = 1920 / 1240`. A rect in the code and a
rect in the keyframe are literally the same number.

This is the highest-leverage decision in the build. It meant checking the render
against the approved design was reading two numbers, not eyeballing two images,
and it meant a note like "the band should start at 304" could be applied without
a conversion step. **Any film translated from a design file should adopt the
design file's coordinate space and scale once.** It cost one `transform` and
removed an entire class of error.

## What required a genuinely new mechanism

The split. Frame 01 is one photograph; frame 02 is two surfaces holding the
*same* photograph in the same place. If each surface cover-crops independently,
the cut reads as two different pictures appearing — which kills the film's only
idea in its first second.

`inheritedCover()` is the fix: a slice expresses its crop against the parent's
rect, so the photograph stays welded to the frame while the surfaces carrying it
move apart. `stripsAt(frame)` is a pure function returning every surface in the
frame, derived from the surface it came out of:

```
one strip → incision → two surfaces → six → one band
```

There is no mount/unmount and no `<Sequence>` anywhere in the film. Strips are
keyed by identity (`a`, `b`, `s1`…`s6`), and `s1` is *the same object* as the
top half of the split — it travels into its new position rather than being
replaced by a new strip that looks like it. That is invisible in a still and is
the whole difference between "a cut" and "a piece being worked".

## The band is a boundary, not a rectangle

The film's centre of gravity is `plateAt()`. The six strips collapse into one
band; the word `institutional strength.` is printed on the forest ground
*before* the ground arrives under it; then a bone plate opens from the band's
own centre line out to the band's edges, and the same word below that edge is
forest-on-bone.

One boundary, two moves — first to the band's edges, then, two seconds later,
from those edges to the whole frame. It is never a dissolve, never a flash,
never a cut. The word being sliced mid-glyph by an opening edge is the piece's
one piece of real craft, and it exists only because the plate is modelled as a
travelling boundary with the type rendered twice, rather than as a colour
transition.

The ring lands *after* the band has finished, at object scale, where the band's
edge was. It arrives once and never moves again — including through the closing
lockup, which overlaps it and dims it to 50% as a printed underlay rather than
moving it out of the way.

## What was deliberately not done

- **No camera move of any kind.** The brand is institutional and calm; a push-in
  would have been the single most generic available choice.
- **No crossfade at the colour flourish.** `they flourish.` changes from ink to
  blue on one frame — a print change, not an animation. `past()` exists for
  exactly this and is used four times.
- **No stagger with an ease on the six strips.** Each has its own `open` window
  (5.05→5.45, 5.15→5.6, …), overlapping and slightly ragged, because they are
  being uncovered from different seams — not emitted by a machine on an interval
  (which is Hookflo's grammar) and not placed by a designer on a curve.
- **No high chroma until the last 0.25s.** The yellow chip is the only saturated
  moment in 12.5 seconds and it draws left-to-right, last. Nothing moves after
  it.
- **No props.** Unlike every other composition in `Root.tsx`, this one takes
  none, because every number in it is a keyframe. Exposing them as props would
  imply they are choices; they are the approved design.

## What existing motion components were useful

Very little — correctly. Reuse is roughly 5% by line count, and the 5% is the
right 5%.

**Used:**

- `engine/easing.ts` — `bezier()` and `REFERENCE_EASINGS`. Four named curves for
  the whole film (`boundary`, `open`, `settle`, `site`), and most of the piece
  uses the first two. Naming them meant the character of the motion could be
  tuned without touching geometry.
- Remotion's `interpolate`, wrapped once as `span(frame, window, easing)` taking
  **seconds**, not frames. Same idea as `engine/timing.ts` `progress()`, but
  second-denominated because the edit was reviewed as an edit.

**Not used, correctly:**

- `brand/schema.ts` + `BrandProvider`. GROW+ is a client campaign look, not a
  brand system with a vocabulary — the palette here belongs to one film, and
  registering it would have implied a reusable identity that does not exist.
- `compositions/plan.ts` / `render.tsx` / `ShotTransition`. There are no shots
  and no transitions. Same conclusion Hookflo reached, from the opposite
  direction — which is now two of two authored films that could not use the shot
  model.
- `engine/timeline.ts` `buildTimeline`. Its value is that beats can be reordered
  or disabled; here the beats are causal (nothing can uncover `But.` except the
  gap that the split opens) and reordering would be nonsense.
- `engine/fonts.ts`. It takes a `BrandSystem`; this film has none, so `fonts.ts`
  is a 27-line copy of the same `delayRender` mechanism for one face. That
  duplication is a real signal — see below.
- Every LEVEL-2 pattern. None of them is a landscape strip being cut.

## What should become reusable system logic

Ranked by confidence.

1. **`loadFonts(faces)` decoupled from `BrandSystem`.** `grow/fonts.ts` exists
   only because `engine/fonts.ts` insists on a brand. The mechanism — inject
   `@font-face`, hold the render on `document.fonts.ready` — has nothing to do
   with brands. Take a face list; let the brand path be a thin wrapper.
2. **A `Score`/keyframe-table mode, second vote.** `timeline.ts` here and
   `films/hookflo/score.ts` arrived at the same shape independently: named
   boundary windows, a flat marker list, no shot objects. Two films is a
   pattern. The engine should support continuity films as a first-class second
   mode instead of leaving them off-road.
3. **`span()` in seconds alongside `progress()` in frames.** Edits are discussed
   in seconds and rendered in frames. Both films wrote the same wrapper.
4. **`edgeClip(reveal, anchor)` as a primitive.** A one-edge `inset()` clip is
   the atom of reveal-by-removal and is used here for photographs, for type, and
   for the yellow chip. It is smaller and more honest than `MaskReveal`.
5. **`inheritedCover()` — cover-crop expressed against a parent rect.** Narrow,
   but it is the only correct way to slice one photograph into several surfaces,
   and any film that cuts an image will need it.
6. **"Adopt the design file's coordinate space and scale once" as a documented
   rule** in `agent/AGENT_MOTION_GUIDE.md`, for any translated-from-stills film.

## What should remain film-specific

- The palette. Bone/forest/blue/yellow is a campaign look for one deck, not an
  EdelGive brand system — the foundation's own site is blush, navy and
  terracotta (`analysis.md`), and the two must not be conflated.
- The six landscape photographs, the tree ring, and every rect in `strips.ts`.
  They are the approved keyframes.
- The copy, `GROW+`, and `askgrow@edelgive.org`.
- Sora as the display face.
- The specific sequence one → two → six → band. It is right because *these*
  frames were designed that way, not because it is a good general structure.

## Honest limits

- **No sound.** `MARKERS` exports frame numbers for the six moments a mix would
  need to hit (strip reveal, split, multiply, collapse, ink, ring land, yellow).
  Nothing consumes them. The film reads silent, but the collapse and the ink are
  designed to land on something.
- **The band's collapse is the weakest 0.8 seconds.** Six strips converging on
  proportional slots is arithmetically clean and a little mechanical; a designer
  would probably ask for the two thinnest strips to arrive fractionally late.
  Left as-is because it is what the keyframes show.
- **QA is six stills, not a contact sheet.** `out/grow-qa/keyframe-*.png` samples
  one frame per approved keyframe to check the translation. Motion between them
  was reviewed in the player, not on a sheet — so a jitter shorter than a beat
  could still be hiding in the multiply window.
- **The `s1` identity chain is unverifiable from stills.** That the surviving
  half of the split *travels* into strip one, rather than being replaced, is the
  piece's most careful decision and is invisible in every artefact except the
  moving render.
