import { DIRECTION_SCHEMA } from "../../core/schemas/json-schema";
import type { AssetManifest, BrandBrief } from "../../core/schemas";
import type { StageModule } from "./index";

/**
 * DIRECTION — three pitches, scored, one promoted.
 *
 * This stage does not get the website, and that is the load-bearing claim of
 * the whole architecture: the brief is enough. It also does not emit the
 * losers downstream — they go to a sidecar file for audit and stop there.
 */
export const directionStage: StageModule = {
  id: "direction",
  skill: "creative-direction.md",
  /**
   * A different steer or a different length is a different film; the same one
   * is the same film. The brief's CONTENT is already in the key via the
   * artifact hash, so a re-stamped brief does not invalidate a direction.
   */
  cacheExtra: (p) => ({ brief: p.brief ?? null, durationTarget: p.durationTarget }),
  schema: DIRECTION_SCHEMA as unknown as Record<string, unknown>,

  prompt: (ctx) => {
    const brief = ctx.inputs["brand-brief"] as BrandBrief;
    const assets = ctx.inputs.assets as AssetManifest;
    const rules = (r: { id: string; name: string; rule: string }[]) =>
      r.map((x) => `  ${x.id} ${x.name}: ${x.rule}`).join("\n");

    return [
      `Direct a ${ctx.params.durationTarget}-second film for ${brief.brand}.`,
      ctx.params.brief ? `\nSteer: ${ctx.params.brief}` : "",
      "",
      "## BrandBrief",
      `Identity: ${brief.identitySummary}`,
      `Product truth: ${brief.productTruth}`,
      `Audience: ${brief.audience}`,
      `Mark logic: ${brief.markLogic ?? "(the mark encodes nothing)"}`,
      brief.inversions?.length ? `Inversions:\n  - ${brief.inversions.join("\n  - ")}` : "",
      "",
      "Visual rules:", rules(brief.visualRules),
      "Composition rules:", rules(brief.compositionRules),
      "Motion implications:", rules(brief.motionImplications),
      "How to ruin this brand:", rules(brief.failureModes),
      "",
      "## Available material",
      ...assets.assets.map((a) => `  ${a.ref} — ${a.caption}`),
      "",
      "## Task",
      "Pitch three genuinely different concepts — different ideas, not three",
      "treatments of one idea. Score each on brandSpecificity, productTruth,",
      "continuity, legibility, restraint, typeRole, pacing, endability,",
      "buildability, memorability (1-5 each).",
      "",
      "Promote one and write it out in full. Brand specificity and continuity",
      "decide it: a concept derived from something that could belong to no other",
      "company beats a prettier mechanism that teaches the viewer nothing.",
      "",
      "Salvage before discarding — record in `salvaged` what the winner takes",
      "from each loser. Then the losers are done; nothing downstream sees them.",
      "",
      "`pacingArc` state ids are the ids the storyboard and score will use:",
      "short, lowercase, one word. `densityArc` must name the same states.",
      "`forbiddenBehaviours` must include the failureModes above that this",
      "concept specifically invites — it is what the critic checks the render",
      "against, and it does more work than any other field.",
    ]
      .filter(Boolean)
      .join("\n");
  },

  /** The losers are written beside the direction and never read again. */
  finish: (output) => {
    const o = output as { direction: Record<string, unknown>; candidates: unknown[]; decidedBy: string };
    return {
      body: o.direction,
      sidecars: [
        {
          file: "direction-candidates.json",
          data: {
            note: "Written once, at selection time. Nothing downstream reads this file.",
            candidates: o.candidates,
            decidedBy: o.decidedBy,
          },
        },
      ],
    };
  },
};
