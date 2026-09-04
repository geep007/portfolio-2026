/**
 * JSON Schemas for provider-enforced structured output.
 *
 * These mirror the TypeScript types in this folder but describe ONLY the
 * fields a role produces: `kind`, `id` and `provenance` are stamped by the
 * orchestrator, so asking a model to emit them wastes output tokens and
 * invites it to invent a version number.
 *
 * They are also where output size is capped. `maxItems` and `maxLength` here
 * are the real enforcement of the output budgets in `models.config.ts` — a
 * budget nothing checks is a wish.
 */
const str = (maxLength: number) => ({ type: "string", maxLength });
const strList = (maxItems: number, maxLength = 240) => ({
  type: "array",
  maxItems,
  items: str(maxLength),
});

const ruleList = (maxItems: number) => ({
  type: "array",
  maxItems,
  items: {
    type: "object",
    properties: {
      id: str(8),
      name: str(40),
      rule: str(360),
      refs: strList(4, 60),
    },
    required: ["id", "name", "rule"],
    additionalProperties: false,
  },
});

export const ASSET_MANIFEST_SCHEMA = {
  type: "object",
  properties: {
    source: str(300),
    mode: { type: "string", enum: ["brand-derived", "design-derived"] },
    assets: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        properties: {
          ref: str(60),
          kind: {
            type: "string",
            enum: [
              "screenshot", "logo", "font", "image", "video",
              "product-ui", "icon", "keyframe", "palette",
            ],
          },
          path: str(300),
          /** The ONE prose description of this asset in the whole system. */
          caption: str(120),
          section: str(60),
        },
        required: ["ref", "kind", "path", "caption"],
        additionalProperties: false,
      },
    },
  },
  required: ["source", "mode", "assets"],
  additionalProperties: false,
} as const;

export const BRAND_BRIEF_SCHEMA = {
  type: "object",
  properties: {
    brand: str(40),
    identitySummary: str(700),
    productTruth: str(400),
    audience: str(200),
    /** The mark read as a diagram. `null` only if it genuinely encodes nothing. */
    markLogic: { type: ["string", "null"], maxLength: 900 },
    inversions: strList(3, 500),
    visualRules: ruleList(10),
    compositionRules: ruleList(5),
    motionImplications: ruleList(8),
    /** Required output. How a generic film would ruin THIS brand. */
    failureModes: ruleList(10),
    tokens: { type: "object", additionalProperties: { type: ["string", "number"] } },
    signatureRefs: strList(6, 60),
  },
  required: [
    "brand", "identitySummary", "productTruth", "audience", "markLogic",
    "visualRules", "compositionRules", "motionImplications", "failureModes",
    "signatureRefs",
  ],
  additionalProperties: false,
} as const;

/**
 * The direction stage returns the winner AND the candidate scorecard in one
 * call — the losers are written to their own file and never travel downstream,
 * but re-pitching them in a second call would pay for the same thinking twice.
 */
export const DIRECTION_SCHEMA = {
  type: "object",
  properties: {
    direction: {
      type: "object",
      properties: {
        brand: str(40),
        title: str(80),
        concept: str(1100),
        productTruth: str(400),
        motionThesis: str(500),
        heroMotif: str(300),
        spatialLogic: str(700),
        transitionLogic: str(500),
        typographyRole: str(500),
        imageryRole: str(500),
        pacingArc: {
          type: "array", maxItems: 8,
          items: {
            type: "object",
            properties: { state: str(20), note: str(220) },
            required: ["state", "note"], additionalProperties: false,
          },
        },
        densityArc: {
          type: "array", maxItems: 8,
          items: {
            type: "object",
            properties: { state: str(20), density: { type: "number", minimum: 0, maximum: 1 } },
            required: ["state", "density"], additionalProperties: false,
          },
        },
        continuityRules: strList(8, 300),
        permittedMotionVerbs: strList(14, 20),
        forbiddenBehaviours: strList(14, 220),
      },
      required: [
        "brand", "title", "concept", "productTruth", "motionThesis", "heroMotif",
        "spatialLogic", "transitionLogic", "typographyRole", "imageryRole",
        "pacingArc", "densityArc", "continuityRules", "permittedMotionVerbs",
        "forbiddenBehaviours",
      ],
      additionalProperties: false,
    },
    candidates: {
      type: "array", minItems: 3, maxItems: 3,
      items: {
        type: "object",
        properties: {
          id: str(40),
          title: str(80),
          /** Candidates are pitched, not specified. */
          pitch: str(500),
          scores: { type: "object", additionalProperties: { type: "number" } },
          total: { type: "number" },
          selected: { type: "boolean" },
          salvaged: str(300),
        },
        required: ["id", "title", "pitch", "scores", "total", "selected"],
        additionalProperties: false,
      },
    },
    decidedBy: str(400),
  },
  required: ["direction", "candidates", "decidedBy"],
  additionalProperties: false,
} as const;

export const STORYBOARD_SCHEMA = {
  type: "object",
  properties: {
    directionId: str(80),
    aspectRatio: str(10),
    durationTarget: { type: "number", minimum: 5, maximum: 60 },
    states: {
      type: "array", minItems: 5, maxItems: 8,
      items: {
        type: "object",
        properties: {
          id: str(20),
          purpose: str(220),
          visual: str(900),
          hierarchy: strList(4, 80),
          persists: strList(8, 80),
          entering: strList(8, 80),
          leaving: strList(8, 80),
          refs: strList(4, 60),
          copy: strList(6, 120),
          weight: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["id", "purpose", "visual", "hierarchy", "persists", "entering", "leaving"],
        additionalProperties: false,
      },
    },
    /** The self-critique pass. Empty is a failed storyboard, not a clean one. */
    critique: {
      type: "array", minItems: 2, maxItems: 9,
      items: {
        type: "object",
        properties: {
          stateId: { type: ["string", "null"], maxLength: 20 },
          problem: str(400),
          fix: str(400),
        },
        required: ["stateId", "problem", "fix"],
        additionalProperties: false,
      },
    },
  },
  required: ["directionId", "aspectRatio", "durationTarget", "states", "critique"],
  additionalProperties: false,
} as const;

/**
 * The Score's `cues`, `geometry` and `content` are film-specific by nature, so
 * the schema constrains their SHAPE and leaves their vocabulary open. Trying
 * to enumerate what a film may contain is how a schema starts refusing films.
 */
export const SCORE_SCHEMA = {
  type: "object",
  properties: {
    storyboardId: str(80),
    fps: { type: "number", enum: [24, 25, 30, 60] },
    duration: { type: "number", minimum: 60, maximum: 3600 },
    space: {
      type: "object",
      properties: { w: { type: "number" }, h: { type: "number" } },
      required: ["w", "h"], additionalProperties: false,
    },
    states: {
      type: "array", minItems: 5, maxItems: 9,
      items: {
        type: "object",
        properties: { id: str(20), from: { type: "number" }, to: { type: "number" } },
        required: ["id", "from", "to"], additionalProperties: false,
      },
    },
    /** Named moments. A number, or an array for a metronome. */
    cues: {
      type: "object",
      additionalProperties: {
        anyOf: [{ type: "number" }, { type: "array", items: { type: "number" }, maxItems: 32 }],
      },
    },
    /** Coordinates in `space` units, nested by object. */
    geometry: { type: "object", additionalProperties: true },
    /** Data tables the composition renders: copy, rows, figures. */
    content: { type: "object", additionalProperties: true },
    continuity: strList(10, 300),
  },
  required: ["storyboardId", "fps", "duration", "space", "states", "cues", "geometry", "content", "continuity"],
  additionalProperties: false,
} as const;
