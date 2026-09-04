/**
 * Stage modules.
 *
 * Each stage is the same four things and nothing else:
 *
 *   1. a contract (declared in `core/stages.ts`, not here)
 *   2. the extra, non-artifact inputs its cache key depends on
 *   3. a prompt built from ONLY what the contract hands it
 *   4. a schema its output must satisfy
 *
 * Methodology lives in `agent/skills/*.md` and is loaded as the system prompt
 * by the runner. A stage that starts explaining how to do its job in the
 * prompt body is duplicating a skill file, and it pays for that duplication on
 * every call.
 */
import type { ArtifactKind } from "../../core/schemas";
import type { StageId } from "../../core/stages";

export type StageContext = {
  /** Exactly the artifacts the contract lists. Assembled by the orchestrator. */
  inputs: Partial<Record<ArtifactKind, unknown>>;
  params: PipelineParams;
  /** Record a file the stage caused to be opened. */
  noteRead: (path: string) => void;
  /** Record a URL the stage caused to be fetched. */
  noteFetch: (url: string) => void;
};

export type PipelineParams = {
  project: string;
  film: string;
  /** URL or design-file reference. The raw source, named once. */
  source: string;
  /**
   * Local directory of captured source material (screenshots, keyframes).
   * Pixels beat a text fetch for visual archaeology, and a local file can be
   * read by the analyst without another round trip to the site.
   */
  assetsDir?: string;
  mode: "brand-derived" | "design-derived";
  /** Target film length in seconds, handed to direction and storyboard. */
  durationTarget: number;
  /**
   * A one-line steer for the creative director. Part of the direction stage's
   * cache key, so asking for a different film is a miss and asking for the
   * same one is a hit.
   */
  brief?: string;
};

export type StageModule = {
  id: StageId;
  /**
   * Non-artifact cache dependencies. Everything the stage's output legitimately
   * varies with, and nothing else — a value in here that does not change the
   * output causes false misses, and one missing that does causes stale hits.
   */
  cacheExtra: (p: PipelineParams) => unknown;
  /** Skill file, relative to `agent/skills/`. */
  skill: string;
  /** Build the prompt. Must read only `ctx.inputs` and `ctx.params`. */
  prompt: (ctx: StageContext) => string;
  /** Provider-enforced output schema. */
  schema: Record<string, unknown>;
  /** Files the role may open, if any. Usually empty. */
  attachments?: (ctx: StageContext) => string[];
  /** Turn the model's output into the artifact body (and any side files). */
  finish?: (
    output: unknown,
    ctx: StageContext,
  ) => { body: Record<string, unknown>; sidecars?: { file: string; data: unknown }[] };
};

export { extractStage } from "./extract";
export { archaeologyStage } from "./archaeology";
export { directionStage } from "./direction";
export { storyboardStage } from "./storyboard";
export { scoreStage } from "./score";
export { critiqueStage } from "./critique";
