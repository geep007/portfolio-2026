import type { Artifact, Extensible } from "./common";

/**
 * CreativeDirection — "what is THIS film trying to communicate?"
 *
 * BrandSystem/BrandBrief say what the brand is. This says what one piece is.
 * A second film for the same brand writes a new direction and touches neither.
 *
 * Promoted to core because on Hookflo it did real work: `forbiddenBehaviours`
 * and `densityArc` were checked against every storyboard frame and against the
 * render, and they are what the motion critique was scored against.
 *
 * Budget: ~800 tokens. It is read by the storyboarder, the implementer AND the
 * critic, so every word is paid for three times.
 */
export type CreativeDirectionBody = Extensible & {
  brand: string;
  title: string;
  /** The film in 2–4 sentences: what literally happens on screen. */
  concept: string;
  /** The one true thing the film exists to make felt. */
  productTruth: string;
  /** Why motion is the right medium for it. One sentence. */
  motionThesis: string;
  /** The single object or behaviour that carries the film. */
  heroMotif: string;

  /** Where things live and how the frame behaves. Camera lives here. */
  spatialLogic: string;
  /** How one state becomes the next — including "there are no transitions". */
  transitionLogic: string;
  typographyRole: string;
  /** Imagery / product UI / footage — whichever this film actually uses. */
  imageryRole: string;

  /** Ordered, one line per state. Names must match Storyboard state ids. */
  pacingArc: { state: string; note: string }[];
  /** 0–1 per state. How full the frame is permitted to be. */
  densityArc: { state: string; density: number }[];

  /** What must survive across state changes, and how. Empty for shot films. */
  continuityRules: string[];
  /** Verbs the film is allowed to perform. A closed list. */
  permittedMotionVerbs: string[];
  /**
   * Hard constraints, checked by the critic. Inherits nothing automatically —
   * copy in the BrandBrief failureModes that apply to this piece.
   */
  forbiddenBehaviours: string[];
};

export type CreativeDirection = Artifact<"creative-direction", CreativeDirectionBody>;

/**
 * A candidate direction during selection. Candidates are scored, ONE is
 * promoted to a CreativeDirection artifact, and the rest are written to
 * `direction-candidates.json` and never travel downstream again.
 */
export type DirectionCandidate = {
  id: string;
  title: string;
  /** ≤60 words. Candidates are pitched, not specified. */
  pitch: string;
  scores: Record<string, number>;
  total: number;
  selected: boolean;
  /** What of a losing candidate was absorbed into the winner, if anything. */
  salvaged?: string;
};
