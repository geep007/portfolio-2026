import type { Artifact, Extensible } from "./common";

/**
 * RenderState — "what was actually generated?"
 *
 * The join between the artifacts and the files on disk. It is what lets a
 * later run answer "is the render stale?" without reading the render, and it
 * is what the critic reads to know which frames to look at.
 */
export type RenderStateBody = Extensible & {
  /** Remotion composition id. */
  composition: string;
  /** Versions of the artifacts this render was produced from. */
  from: {
    brandBrief?: number;
    direction: number;
    storyboard: number;
    score: number;
    assets: number;
  };
  renderPath: string;
  /** One still per storyboard state — the cheapest useful critique input. */
  qaFrames: { stateId: string; frame: number; path: string }[];
  /** A single sheet of the qaFrames. One image beats N images in a prompt. */
  contactSheet?: string;

  critique?: {
    status: "pending" | "passed" | "changes-requested";
    /**
     * Findings, each citing what it violates. A finding with no `violates` is
     * taste, and taste findings are allowed but must say so.
     */
    findings: {
      id: string;
      stateId?: string;
      /** e.g. `direction.forbiddenBehaviours[3]`, `brief.visualRules.R4`. */
      violates?: string;
      problem: string;
      fix: string;
      applied?: boolean;
    }[];
  };

  /** Known gaps, carried forward rather than rediscovered. */
  limits?: string[];
};

export type RenderState = Artifact<"render-state", RenderStateBody>;
