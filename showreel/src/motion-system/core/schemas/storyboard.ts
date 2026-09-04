import type { Artifact, Extensible, RefId } from "./common";

/**
 * Storyboard — "what are the important visual states?"
 *
 * Deliberately called states, not shots. A shot film's states are its shots; a
 * continuity film's states are readings of one persistent object. Both films
 * built so far were the second kind, so the schema defaults to states and lets
 * a shot film say so via `cut: true`.
 *
 * Budget: ~1,500 tokens for 6–8 states. `visual` is what a designer would say
 * out loud about the frame — not a CSS description of it.
 */
export type StoryboardState = Extensible & {
  /** Stable, lowercase, matches CreativeDirection pacingArc + Score states. */
  id: string;
  /** Why this state exists in the film. One sentence. */
  purpose: string;
  /** What is on screen. 2–4 sentences, at frame scale, no pixel values. */
  visual: string;
  /** What the eye is meant to go to first, then second. */
  hierarchy: string[];
  /** Ids of elements that carry over from the previous state unchanged. */
  persists: string[];
  entering: string[];
  leaving: string[];
  /** Evidence this state is derived from. Ids only, never descriptions. */
  refs?: RefId[];
  /** Copy that appears in this state, verbatim. */
  copy?: string[];
  /** True only for films that actually cut between shots. */
  cut?: boolean;
  /** Approximate share of the film, 0–1. The Score assigns real frames. */
  weight?: number;
};

export type StoryboardBody = Extensible & {
  directionId: string;
  aspectRatio: string;
  /** Seconds. The Score turns this into frames. */
  durationTarget: number;
  states: StoryboardState[];
  /**
   * The self-critique pass. Rev 1 of the Hookflo storyboard was inspected as
   * static design and produced seven fixes; recording them here is what stops
   * a later stage re-deriving them. Empty until the critique has run.
   */
  critique?: { stateId: string | null; problem: string; fix: string }[];
};

export type Storyboard = Artifact<"storyboard", StoryboardBody>;

export const stateById = (s: Storyboard, id: string) =>
  s.states.find((x) => x.id === id);
