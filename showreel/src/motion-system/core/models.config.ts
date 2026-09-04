import type { RoleId, RoleSpec } from "./roles";

/**
 * The only file that names a model.
 *
 * "default" means: whatever the host runner is already configured to use.
 * Nothing in the pipeline hardcodes a provider or a model id, so routing a
 * single role to a cheaper model later is a one-line change here.
 *
 * `tools` turned out to matter as much as the model does. Measured on the
 * Claude CLI adapter: a call with the default tool set carries ~16,500 tokens
 * of tool definitions before the prompt is even considered; the same call with
 * `tools: ["Read"]` carries ~3,400. Tool definitions are prompt, and a role
 * that cannot use a tool should not be shown it.
 */
export const MODELS: Record<RoleId, RoleSpec> = {
  extractor: {
    model: "default",
    purpose: "Turn a URL or design file into an AssetManifest with stable ref ids.",
    budget: { contextTokens: 40_000, outputTokens: 2_000, images: 12 },
    /** The one role that fetches. */
    tools: ["Read", "WebFetch", "Glob"],
  },
  brandAnalyst: {
    model: "default",
    purpose: "Read the mark as a diagram and the compositions as rules. Emit a BrandBrief.",
    budget: { contextTokens: 60_000, outputTokens: 2_500, images: 12 },
    /** Reads the screenshots the extractor named, and nothing else. */
    tools: ["Read", "WebFetch"],
  },
  creativeDirector: {
    model: "default",
    purpose: "Pitch three directions, score them, promote one. Emit a CreativeDirection.",
    budget: { contextTokens: 12_000, outputTokens: 2_500, images: 3 },
    /** Pure reasoning over the brief. No fetching — that is the whole point. */
    tools: ["Read"],
  },
  storyboarder: {
    model: "default",
    purpose: "Turn a direction into visual states, then critique them as static design.",
    budget: { contextTokens: 16_000, outputTokens: 4_000, images: 6 },
    tools: ["Read"],
  },
  scorer: {
    model: "default",
    purpose: "Assign frames and coordinates. Emit a Score; no prose.",
    budget: { contextTokens: 12_000, outputTokens: 3_000, images: 2 },
    tools: ["Read"],
  },
  implementer: {
    model: "default",
    purpose: "Write the Remotion composition from the Score. Retrieve code, never dump it.",
    budget: { contextTokens: 60_000, outputTokens: 12_000, images: 2 },
    tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
  },
  critic: {
    model: "default",
    purpose: "Judge the render against the direction. Findings only, each citing what it violates.",
    budget: { contextTokens: 12_000, outputTokens: 2_000, images: 2 },
    /** Read, so it can open the contact sheet. Nothing that could edit. */
    tools: ["Read"],
  },
  fixer: {
    model: "default",
    purpose: "Apply findings to the named files. No redesign, no new ideas.",
    budget: { contextTokens: 30_000, outputTokens: 6_000, images: 1 },
    tools: ["Read", "Edit", "Bash"],
  },
};

/**
 * Per-call spend ceiling, in USD. A guard against a runaway loop, not a budget:
 * a stage that hits it has gone wrong and should fail loudly.
 */
export const MAX_USD_PER_CALL = 3.0;

/**
 * Optional fallback pricing, used ONLY if the provider reports no cost. The
 * Claude CLI adapter reports real cost, so this stays empty and the run report
 * never mixes real and estimated money.
 */
export const PRICING: Record<string, { inPerMTok: number; outPerMTok: number }> = {};
