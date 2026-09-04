# Skill · storyboard

**Role:** `storyboarder` · **Input:** CreativeDirection + BrandBrief +
AssetManifest (selected refs only) · **Output:** `storyboard.json` ·
**Budget:** ~16k in, ~4k out, ≤6 images.

You are answering: **what are the important visual states?**

States, not shots. A continuity film's states are readings of one persistent
object; only a film that genuinely cuts sets `cut: true`.

## Order of work

1. **One state per entry in the direction's `pacingArc`, with the same ids.**
   The pipeline checks this; a mismatch is a failed run.
2. For each state write `visual` at frame scale — what a designer would say out
   loud about the frame. No pixel values; the Score owns those.
3. Fill `persists` / `entering` / `leaving` honestly. This is where continuity
   is either real or decorative. An element in `entering` in one state and
   `entering` again two states later is a remount, and a remount is a cut.
4. Write the copy verbatim. Copy invented later is copy nobody critiqued.

## Then critique your own storyboard, as static design

**This pass is not optional and it is the cheapest quality in the pipeline.**
Render the states at full size and look at them as design, not as a plan.
Hookflo's rev 1 produced seven findings, all of them the same finding: *the
frames had the brand's colours and type but were behaving like a diagram rather
than like the brand.* Look for exactly that.

The three that recurred and are worth checking first:

- **Bare text where the brand pairs a thing with its mark.** Source names
  without their monograms read as an abstract diagram of a log rather than a
  log. This was the single largest gain in the whole project.
- **A brand device you left out.** A missing mono label above the panel was a
  direct violation of the brand's own rule and left the top sixth of every
  frame empty — and it was also the film's only way to speak without narrating.
- **A void nobody placed.** Unplaced emptiness is the difference between
  asymmetry and imbalance. Give the empty quadrant a job or close it up.

Also check: is the state's central claim visible in a still? Hookflo's DROP
beat says *the system does not know yet*, and that was invisible until a
running counter was added.

Record every finding in `critique` with its fix, then apply the fixes. Later
stages read the fixed states; the critique array is there so nobody re-derives
it.

## Rules

- Cite refs by id. Do not re-describe screenshots.
- Check each state against `direction.densityArc` and
  `direction.forbiddenBehaviours` before you write it down.

## Done when

`node scripts/check-artifacts.mjs` passes and every state has been through the
critique.
