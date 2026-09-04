import type { CreativeDirection, RenderState, Storyboard } from "../../core/schemas";
import type { StageModule } from "./index";

/**
 * CRITIQUE — judge the render against what it promised to be.
 *
 * The critic sees the rendered frames, the direction and the relevant
 * storyboard states. It does not see the brand brief, the website, the score,
 * the code, or any build output: a critic that can read the implementation
 * starts reviewing the implementation.
 */
const FINDING_SCHEMA = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["passed", "changes-requested"] },
    findings: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          id: { type: "string", maxLength: 8 },
          stateId: { type: ["string", "null"], maxLength: 20 },
          /** `direction.forbiddenBehaviours[3]`, `score.continuity[2]`, or "taste". */
          violates: { type: "string", maxLength: 80 },
          problem: { type: "string", maxLength: 400 },
          fix: { type: "string", maxLength: 400 },
        },
        required: ["id", "stateId", "violates", "problem", "fix"],
        additionalProperties: false,
      },
    },
  },
  required: ["status", "findings"],
  additionalProperties: false,
} as const;

export const critiqueStage: StageModule = {
  id: "critique",
  skill: "visual-critique.md",
  /** A new render is a new set of frames; the paths carry the version. */
  cacheExtra: () => null,
  schema: FINDING_SCHEMA as unknown as Record<string, unknown>,

  attachments: (ctx) => (ctx.inputs["render-state"] as RenderState).qaFrames.map((f) => f.path),

  prompt: (ctx) => {
    const dir = ctx.inputs["creative-direction"] as CreativeDirection;
    const sb = ctx.inputs.storyboard as Storyboard;
    const rs = ctx.inputs["render-state"] as RenderState;

    return [
      `Critique the render of "${dir.title}".`,
      "",
      "Look at every frame listed at the end of this message before writing",
      "anything. Each is one storyboard state as it actually rendered.",
      "",
      "## What each frame promised to be",
      ...rs.qaFrames.map((f) => {
        const st = sb.states.find((s) => s.id === f.stateId);
        return `\n${f.path}  —  state "${f.stateId}"\n  purpose: ${st?.purpose}\n  intended: ${st?.visual}`;
      }),
      "",
      "## Hard constraints",
      `Spatial logic: ${dir.spatialLogic}`,
      "Forbidden:",
      ...dir.forbiddenBehaviours.map((f) => `  - ${f}`),
      "Continuity:",
      ...dir.continuityRules.map((c) => `  - ${c}`),
      "",
      "## Task",
      "Report the 3-6 highest-impact problems, worst first. Each finding cites",
      "what it violates by path (`direction.forbiddenBehaviours[3]`,",
      "`direction.continuityRules[1]`, `direction.spatialLogic`) or the literal",
      "string `taste` if it is judgement rather than a broken rule.",
      "",
      "Prefer removals and simplifications. Do not propose additions, do not",
      "re-open decisions the direction already made, and do not pitch a",
      "different film. Layout collisions, elements that should have gone dark",
      "and did not, and beats that are invisible because something covers them",
      "are all worth more than a nudge to a value.",
    ].join("\n");
  },

  /** Merge findings into the existing render state rather than replacing it. */
  finish: (output, ctx) => {
    const rs = ctx.inputs["render-state"] as RenderState;
    const o = output as { status: string; findings: unknown[] };
    const { kind: _k, id: _i, provenance: _p, ...body } = rs as unknown as Record<string, unknown>;
    return { body: { ...body, critique: { status: o.status, findings: o.findings } } };
  },
};
