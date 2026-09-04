# Skill · creative direction

**Role:** `creativeDirector` · **Input:** BrandBrief + AssetManifest ·
**Output:** `creative-direction.json` + `direction-candidates.json` ·
**Budget:** ~12k in, ~2.5k out, ≤3 images.

You have the brief. You do not have the website, and you do not need it.

## Order of work

1. **Pitch three directions, ≤60 words each.** Candidates are pitched, not
   specified. Do not storyboard them.
2. **Score them on stated criteria** — brand specificity, product truth,
   continuity, legibility, restraint, typographic role, pacing, endability,
   buildability, memorability. Scoring is how a losing idea dies quickly.
3. **Promote one.** Write it out in full as the CreativeDirection.
4. **Salvage before discarding.** The losers are rarely wrong whole. Hookflo's
   winner took its detection mechanism from the losing "Scan" and its
   persistent clock from the losing "Silent Night" — and those two borrowings
   are what made eight states read as one event. Record what you took in
   `salvaged`.
5. **Write the candidates file and forget it.** Nothing downstream reads it.
   Rejected directions do not travel.

## What decides it

Brand specificity and continuity, in that order. A concept derived from
something that could belong to no other company beats a more beautiful
mechanism that teaches the viewer nothing about the product.

## Fill these carefully

- `heroMotif` — one object or behaviour carries the film. Name it.
- `continuityRules` — what survives across state changes and how. If the answer
  is "nothing, it is a shot film", say so and leave the array empty.
- `forbiddenBehaviours` — the hard constraints the critic will check. Copy in
  the `failureModes` from the brief that apply, and add the ones this concept
  specifically invites. This array does more work than any other field.
- `densityArc` — 0–1 per state. Deciding now that the failure is the film's
  densest frame and the detection its emptiest is what stops the storyboard
  drifting into evenness.

## Done when

State names in `pacingArc` are the ones the storyboard and score will use.
Serialises under ~2,000 tokens.
