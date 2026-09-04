# Skill · design translation (Mode B)

**Role:** `storyboarder` then `scorer` · **Input:** approved keyframes as an
AssetManifest · **Output:** `storyboard.json` + `score.json`.

For films that start from approved design rather than from a brand. GROW+ is
the reference: six Paper keyframes, already signed off.

**There is no archaeology and no direction generation.** The creative direction
was approved before the pipeline started. Do not re-derive a brand, do not
score three concepts, do not write a BrandBrief. The narrower and harder
question is: *what happens between frame 01 and frame 02 such that both remain
true?*

## Order of work

1. **Read the keyframes as a sequence, not as compositions.** GROW+'s six
   frames are one horizontal strip of landscape worked on six times: frame 02
   contains frame 01's material, cut. Once that is seen, the film's rule writes
   itself — *reveal by removal* — and every downstream decision follows.
2. **Write each keyframe as a storyboard state**, with `persists` doing the
   real work: which object in frame 02 *is* an object from frame 01, rather
   than a new object that resembles it. That distinction is invisible in stills
   and is usually the piece's most careful decision.
3. **Infer continuity, then state it.** Anything the stills cannot prove goes
   in `score.continuity` so the implementation is answerable to it.
4. **Adopt the design file's coordinate space.** `score.space` is the artboard,
   and the composition scales once at the root. A rect in the code and a rect
   in the keyframe are then the same number — the highest-leverage decision in
   the GROW+ build.
5. **Score it in seconds, convert once.** Edits are discussed in seconds and
   rendered in frames.

## Rules

- The keyframes are the approved design. Do not improve them. Where the render
  is arithmetically clean and a designer would want it ragged, note it as a
  limit rather than changing it.
- Do not register a campaign palette as a brand. A look for one deck is not a
  reusable identity, and conflating the two corrupts the brand file.
- Expose no props. Every number is a keyframe; props would imply they are
  choices.

## Done when

`node scripts/check-artifacts.mjs` passes and one QA still per keyframe matches
the approved design at the same coordinates.
