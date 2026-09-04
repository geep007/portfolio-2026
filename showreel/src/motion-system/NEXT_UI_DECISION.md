# Score → still, or Remotion stills?

`TODO-NEXT.md` proposed a tiny renderer that draws `score.geometry` as flat
rectangles at a given frame, as the cheapest possible feedback loop and the
natural first canvas for a UI.

**Recommendation: do not build it. Render real Remotion stills at state
boundaries instead.** (Option B.)

## Why

**The Athina run answered the question empirically.** Every problem the critic
found — a sphere that never went dark, a gradient escaping its panel, a headline
sitting on the evidence, a panel two-thirds empty — is a problem of *luminance,
z-order, type metrics and real content*. A flat-rectangle renderer shows none of
those. It would have passed all six findings as fine.

The one class of error it would have caught — the dot sitting off its rule — was
caught anyway, by reading a real still.

**A parallel renderer is a second implementation of the truth.** It would have
to reimplement luminance ramps, panel washes, contraction and type layout to be
useful, and the moment it diverged from the composition it would be worse than
nothing: a preview that lies is more expensive than no preview.

**Remotion stills are already fast enough.** A single frame renders in a few
seconds. Eight — one per storyboard state — is well inside an interactive loop,
and `out/athina/contact-sheet.png` shows the whole film on one image.

## What to build instead

A thin `qa` command, not a renderer:

```
node scripts/qa.mjs <project>/<film>
```

1. read `score.json`, take each state's midpoint (or the hold cue if named)
2. `remotion still` each one into `out/<project>/frames/`
3. tile them into a contact sheet
4. write the frame list into `render-state.json`

That is roughly forty lines, reuses the tiling code already written for the
Athina sheet, and produces exactly the artifact the `critique` stage consumes.
It is also what a UI's "preview this state" button would call — the same path,
one frame instead of eight.

## The one thing worth taking from option A

The idea underneath it — that a Score should be inspectable without a render —
is right, and it is already satisfied cheaply: `check-artifacts.mjs` verifies
contiguity, bounds, cue ranges and duration agreement in milliseconds with no
model and no render. Extend *that* when a new class of geometry error appears,
rather than building a second renderer to look for them by eye.
