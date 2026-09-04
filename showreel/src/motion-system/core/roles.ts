/**
 * Logical roles, not models.
 *
 * Stages call `runRole("creativeDirector", …)`. Which model that is, is a
 * config question answered in `models.config.ts` and nowhere else. Today every
 * role resolves to the same model; the point is that changing that later is a
 * config edit rather than a pipeline redesign.
 */
export type RoleId =
  /** URL / design file -> AssetManifest. Cheap, mechanical, no taste. */
  | "extractor"
  /** Raw sources -> BrandBrief. The one stage that may read the whole site. */
  | "brandAnalyst"
  /** BrandBrief -> candidates -> CreativeDirection. Small context, high reasoning. */
  | "creativeDirector"
  /** Direction -> Storyboard, including its own self-critique. */
  | "storyboarder"
  /** Storyboard -> Score. Arithmetic and geometry, little prose. */
  | "scorer"
  /** Score -> Remotion. Code retrieval on demand, never whole-repo. */
  | "implementer"
  /** Contact sheet + direction -> findings. Never sees implementation logs. */
  | "critic"
  /** Findings -> targeted edits. Sees the findings and the named files only. */
  | "fixer";

/**
 * What a role is allowed to consume, and roughly how much.
 *
 * These budgets are ceilings for design, not enforced quotas — but a stage that
 * wants to exceed one is a design smell, and `reads`/`neverReads` ARE checked
 * (see stages.ts `assertReadable`).
 */
export type RoleBudget = {
  /** Rough input ceiling in tokens, including images. */
  contextTokens: number;
  /** Rough output ceiling in tokens. Compact artifacts, not essays. */
  outputTokens: number;
  /** Images the role may look at per call. */
  images: number;
};

export type RoleSpec = {
  model: string;
  budget: RoleBudget;
  /** One line. This is the whole job description. */
  purpose: string;
  /**
   * Tools the role may use. Tool definitions are prompt: showing a role a tool
   * it cannot use costs real tokens on every call. Keep these minimal.
   */
  tools: string[];
};

export type RunRoleInput = {
  role: RoleId;
  /** The prompt body. Skills are loaded by the runner, not pasted by callers. */
  input: string;
  /** File paths the role may read, resolved lazily by the runner. */
  attachments?: string[];
  /**
   * Skill file to use as the system prompt, relative to `agent/`. The runner
   * loads it and `SYSTEM_PRINCIPLES.md`; callers never paste methodology into
   * `input`. This is what keeps per-stage prompts small.
   */
  skill?: string;
  /**
   * JSON Schema the output must satisfy. Passed to the provider for enforced
   * structured output, and re-checked locally. Without it, a stage is trusting
   * prose to be JSON.
   */
  schema?: Record<string, unknown>;
  /** Working directory for any tool the role is allowed to use. */
  cwd?: string;
};

/**
 * What every provider adapter must report. A field the provider genuinely does
 * not expose is `null` — never estimated, because a mixed real/estimated
 * number is worse than a missing one.
 */
export type RunRoleResult<T = unknown> = {
  output: T;
  /** The model that actually served the call, as the provider named it. */
  model: string | null;
  /**
   * Total input volume actually sent: uncached input + cache reads + cache
   * writes. On adapters that cache the whole request, `inputTokens` alone is
   * near zero and tells you nothing — this is the number that means something.
   */
  promptTokens: number | null;
  /**
   * Exact character length of the prompt the pipeline built. A byte count, not
   * a token estimate: the provider's token figures aggregate across internal
   * iterations, so they over-count the logical prompt and cannot be compared
   * across stages safely. This can.
   */
  promptChars: number | null;
  /** Provider round-trips inside one logical call. >1 inflates token figures. */
  iterations: number | null;
  /** Uncached input only. */
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  /** Tokens written to the prompt cache on this call (paid at a premium). */
  cacheCreationTokens: number | null;
  /** Real cost from the provider, if it reports one. Never computed here. */
  costUsd: number | null;
  latencyMs: number;
  retryCount: number;
  finishReason: string | null;
  providerRequestId: string | null;
};

/**
 * The runner is injected. The pipeline never imports a provider SDK, so the
 * architecture stays model-agnostic and testable with a stub.
 */
export type RoleRunner = <T>(input: RunRoleInput) => Promise<RunRoleResult<T>>;

let runner: RoleRunner | null = null;

export const setRoleRunner = (r: RoleRunner) => {
  runner = r;
};

export const runRole = async <T>(
  role: RoleId,
  input: string,
  opts: Omit<RunRoleInput, "role" | "input"> = {},
): Promise<RunRoleResult<T>> => {
  if (!runner) {
    throw new Error(
      `No RoleRunner configured. Call setRoleRunner() before runRole("${role}").`,
    );
  }
  return runner<T>({ role, input, ...opts });
};
