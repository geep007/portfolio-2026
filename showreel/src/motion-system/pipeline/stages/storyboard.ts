import { STORYBOARD_SCHEMA } from "../../core/schemas/json-schema";
import type { AssetManifest, BrandBrief, CreativeDirection } from "../../core/schemas";
import type { StageModule } from "./index";

/**
 * STORYBOARD — the direction becomes visual states, then critiques itself.
 *
 * It is handed the brief, the direction and the asset captions. It is not
 * handed the website, the rejected candidates, PROCESS.md, or the repo. The
 * self-critique happens inside this one call: two passes in one context is
 * cheaper than two calls, and the second pass needs the first pass's reasoning
 * anyway.
 */
export const storyboardStage: StageModule = {
  id: "storyboard",
  skill: "storyboard.md",
  cacheExtra: (p) => ({ durationTarget: p.durationTarget }),
  schema: STORYBOARD_SCHEMA as unknown as Record<string, unknown>,

  prompt: (ctx) => {
    const brief = ctx.inputs["brand-brief"] as BrandBrief;
    const dir = ctx.inputs["creative-direction"] as CreativeDirection;
    const assets = ctx.inputs.assets as AssetManifest;

    return [
      `Storyboard "${dir.title}" — ${ctx.params.durationTarget}s, 16:9.`,
      "",
      "## Direction",
      `Concept: ${dir.concept}`,
      `Product truth: ${dir.productTruth}`,
      `Motion thesis: ${dir.motionThesis}`,
      `Hero motif: ${dir.heroMotif}`,
      `Spatial logic: ${dir.spatialLogic}`,
      `Transition logic: ${dir.transitionLogic}`,
      `Typography: ${dir.typographyRole}`,
      `Imagery / product: ${dir.imageryRole}`,
      "",
      "States (use these ids, in this order):",
      ...dir.pacingArc.map((s) => {
        const d = dir.densityArc.find((x) => x.state === s.state);
        return `  ${s.state} — ${s.note}  [density ${d?.density ?? "?"}]`;
      }),
      "",
      `Continuity:\n  - ${dir.continuityRules.join("\n  - ")}`,
      `Permitted verbs: ${dir.permittedMotionVerbs.join(", ")}`,
      `Forbidden:\n  - ${dir.forbiddenBehaviours.join("\n  - ")}`,
      "",
      "## Brand constraints",
      ...brief.visualRules.map((r) => `  ${r.id} ${r.name}: ${r.rule}`),
      ...brief.compositionRules.map((r) => `  ${r.id} ${r.name}: ${r.rule}`),
      "",
      "## Material you may reference (by ref id only)",
      ...assets.assets.map((a) => `  ${a.ref} — ${a.caption}`),
      "",
      "## Task",
      "One state per entry in the arc above, same ids. `visual` is what a",
      "designer would say out loud about the frame — at frame scale, no pixel",
      "values; the Score owns those. Write `copy` verbatim.",
      "",
      "`persists` / `entering` / `leaving` is where continuity is either real or",
      "decorative. An element that enters, leaves, and enters again is a remount,",
      "and a remount is a cut. Be honest about it.",
      "",
      "Then critique your own storyboard as static design, and apply the fixes",
      "before you return it. The `states` you return are the FIXED ones; the",
      "`critique` array records what was wrong so nobody re-derives it. Look",
      "specifically for: frames that carry the brand's colours and type but",
      "behave like a diagram; bare text where the brand pairs a thing with its",
      "mark; a brand device you left out; an unplaced void; and a state whose",
      "central claim is invisible in a still.",
    ].join("\n");
  },
};
