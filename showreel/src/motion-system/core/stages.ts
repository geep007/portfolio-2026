import type {
  ArtifactKind,
  AssetManifest,
  BrandBrief,
  CreativeDirection,
  DirectionCandidate,
  RenderState,
  Score,
  Storyboard,
} from "./schemas";
import type { RoleId } from "./roles";

/**
 * Pipeline stage contracts.
 *
 * The important thing here is not the function signatures — it is `reads` and
 * `neverReads`. Token cost in this pipeline is not caused by any one stage
 * being verbose; it is caused by later stages re-reading earlier stages'
 * inputs. Writing that down as a contract is what makes it checkable.
 */
export type SourceClass =
  /** The website, the design file, the raw screenshots. */
  | "raw-source"
  /** PROCESS.md, notes, long-form markdown. Research output, never input. */
  | "prose-research"
  /** Losing direction candidates. */
  | "rejected-candidates"
  /** Build logs, render logs, error output. */
  | "implementation-log"
  /** The motion-system source tree. */
  | "repo";

export type StageId =
  | "extract"
  | "archaeology"
  | "direction"
  | "storyboard"
  | "score"
  | "implement"
  | "critique"
  | "refine";

export type StageContract = {
  id: StageId;
  role: RoleId;
  /** Artifacts this stage is given, in full. */
  reads: ArtifactKind[];
  /** Raw material it may open. Empty for most stages — that is the point. */
  readsSource: SourceClass[];
  /**
   * Hard exclusions. A stage that finds itself wanting one of these has a
   * missing upstream field, and the fix is to add the field upstream, not to
   * widen the read.
   */
  neverReads: SourceClass[];
  produces: ArtifactKind | "candidates" | "render";
  /**
   * Inputs whose hash decides cache validity. If they are unchanged, the
   * stage is skipped and the existing artifact is reused verbatim.
   */
  cacheKey: (ArtifactKind | SourceClass)[];
};

export const STAGES: Record<StageId, StageContract> = {
  extract: {
    id: "extract",
    role: "extractor",
    reads: [],
    readsSource: ["raw-source"],
    neverReads: ["prose-research", "implementation-log", "repo"],
    produces: "assets",
    cacheKey: ["raw-source"],
  },
  archaeology: {
    id: "archaeology",
    role: "brandAnalyst",
    reads: ["assets"],
    /** The ONE stage permitted to read the site. After it, the brief is memory. */
    readsSource: ["raw-source"],
    neverReads: ["prose-research", "implementation-log", "repo"],
    produces: "brand-brief",
    cacheKey: ["assets", "raw-source"],
  },
  direction: {
    id: "direction",
    role: "creativeDirector",
    reads: ["brand-brief", "assets"],
    readsSource: [],
    neverReads: ["raw-source", "prose-research", "implementation-log", "repo"],
    produces: "creative-direction",
    cacheKey: ["brand-brief"],
  },
  storyboard: {
    id: "storyboard",
    role: "storyboarder",
    reads: ["brand-brief", "creative-direction", "assets"],
    readsSource: [],
    neverReads: [
      "raw-source",
      "prose-research",
      "rejected-candidates",
      "implementation-log",
      "repo",
    ],
    produces: "storyboard",
    cacheKey: ["creative-direction", "brand-brief"],
  },
  score: {
    id: "score",
    role: "scorer",
    reads: ["storyboard", "creative-direction"],
    readsSource: [],
    neverReads: ["raw-source", "prose-research", "rejected-candidates", "repo"],
    produces: "score",
    cacheKey: ["storyboard"],
  },
  implement: {
    id: "implement",
    role: "implementer",
    reads: ["score", "storyboard", "creative-direction", "assets"],
    /** Targeted retrieval only: named primitives, the engine, the agent guide. */
    readsSource: ["repo"],
    neverReads: ["raw-source", "prose-research", "rejected-candidates"],
    produces: "render",
    cacheKey: ["score"],
  },
  critique: {
    id: "critique",
    role: "critic",
    reads: ["creative-direction", "storyboard", "render-state"],
    readsSource: [],
    neverReads: [
      "raw-source",
      "prose-research",
      "rejected-candidates",
      "implementation-log",
      "repo",
    ],
    produces: "render-state",
    cacheKey: ["render-state"],
  },
  refine: {
    id: "refine",
    role: "fixer",
    reads: ["render-state", "score", "creative-direction"],
    readsSource: ["repo"],
    neverReads: ["raw-source", "prose-research", "rejected-candidates"],
    produces: "render",
    cacheKey: ["render-state"],
  },
};

/**
 * Mode A — brand-derived. A URL becomes a film. Hookflo is the reference.
 * Mode B — design-derived. Approved keyframes become a film. GROW+ is the
 * reference: there is no archaeology and no direction generation, because the
 * creative direction was approved before the pipeline started. Both modes
 * converge on Storyboard -> Score -> implement -> critique.
 */
export const MODE_A: StageId[] = [
  "extract",
  "archaeology",
  "direction",
  "storyboard",
  "score",
  "implement",
  "critique",
  "refine",
];

export const MODE_B: StageId[] = [
  "extract",
  "storyboard",
  "score",
  "implement",
  "critique",
  "refine",
];

export const stagesFor = (mode: "brand-derived" | "design-derived") =>
  mode === "brand-derived" ? MODE_A : MODE_B;

/** Throws if a stage is about to open something its contract forbids. */
export const assertReadable = (stage: StageId, source: SourceClass) => {
  const c = STAGES[stage];
  if (c.neverReads.includes(source)) {
    throw new Error(
      `Stage "${stage}" may not read ${source}. If it needs that information, ` +
        `add a field to an upstream artifact instead of widening this stage.`,
    );
  }
};

/* ------------------------------------------------------------------ *
 * Stage function shapes. Implementations live in pipeline/<stage>/.
 * ------------------------------------------------------------------ */
export type Stage<I, O> = (input: I) => Promise<O>;

export type ExtractStage = Stage<{ source: string; mode: "brand-derived" | "design-derived" }, AssetManifest>;
export type ArchaeologyStage = Stage<{ assets: AssetManifest }, BrandBrief>;
export type DirectionStage = Stage<
  { brief: BrandBrief; assets: AssetManifest; durationTarget: number },
  { direction: CreativeDirection; candidates: DirectionCandidate[] }
>;
export type StoryboardStage = Stage<
  { brief?: BrandBrief; direction: CreativeDirection; assets: AssetManifest },
  Storyboard
>;
export type ScoreStage = Stage<{ storyboard: Storyboard; direction: CreativeDirection }, Score>;
export type ImplementStage = Stage<
  { score: Score; storyboard: Storyboard; direction: CreativeDirection; assets: AssetManifest },
  RenderState
>;
export type CritiqueStage = Stage<
  { render: RenderState; direction: CreativeDirection; storyboard: Storyboard },
  RenderState
>;
