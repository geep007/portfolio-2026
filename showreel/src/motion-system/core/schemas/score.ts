import type { Artifact, Extensible } from "./common";

/**
 * Score — "how does the visual system evolve through time?"
 *
 * The second composition mode, alongside `compositions/plan.ts`'s
 * `CompositionPlan`. A plan is an edit: ordered shots with transitions, where
 * beats can be reordered or switched off. A score is a continuous system: named
 * state boundaries, a flat cue sheet, and a geometry table.
 *
 * Both authored films arrived at this shape independently (Hookflo's
 * `films/hookflo/score.ts`, GROW+'s `grow/timeline.ts`), which is why it is
 * core rather than film-specific.
 *
 * INVARIANT: no frame number and no coordinate appears anywhere in the
 * composition code. All of them live here. That is what made Hookflo's
 * refinement pass touch only this file.
 */
export type ScoreState = { id: string; from: number; to: number };

/** A named moment or interval. Arrays are metronomes (one entry per beat). */
export type Cue = number | number[];

export type ScoreBody = Extensible & {
  storyboardId: string;
  fps: number;
  /** Total frames. */
  duration: number;

  /**
   * The coordinate space every number in `geometry` is expressed in. For a
   * design-derived film this is the design file's own space and the
   * composition scales once at the root — a rect in the code and a rect in the
   * keyframe are then literally the same number.
   */
  space: { w: number; h: number };

  /** Named states, in order. `from` inclusive, `to` exclusive. */
  states: ScoreState[];

  /**
   * Every animated moment in the film. Flat and addressable: a UI edits
   * `score.cues.travel` without touching anything else.
   */
  cues: Record<string, Cue>;

  /**
   * Every coordinate in the film, in `space` units. Nested by object, so a UI
   * can address `score.geometry.panel.open.x`. Film-specific by nature — the
   * schema does not try to enumerate what a film can contain.
   */
  geometry: Record<string, unknown>;

  /**
   * Film-specific data tables the composition renders (log rows, copy blocks,
   * stat lists). Structured so copy and timing are editable without code.
   */
  content?: Record<string, unknown>;

  /** What the implementation must preserve. Checked by the critic. */
  continuity?: string[];
};

export type Score = Artifact<"score", ScoreBody>;

/** Which state a frame belongs to. Clamps past the end. */
export const stateAtFrame = (score: Pick<ScoreBody, "states">, frame: number) =>
  (score.states.find((s) => frame >= s.from && frame < s.to) ??
    score.states[score.states.length - 1]).id;
