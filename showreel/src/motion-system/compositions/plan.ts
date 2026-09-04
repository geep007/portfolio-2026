import type { Beat } from "../brand/vocabulary";

/**
 * CompositionPlan — the bridge between an agent's reasoning and a render.
 *
 * The agent decides WHAT: which beats, in what order, with which pattern and
 * content. The engine decides HOW: the brand resolves every visual and timing
 * decision the plan leaves open.
 *
 * Plain JSON. A plan must validate against the brand's vocabulary before it
 * renders — see `validatePlan` in `render.ts`.
 */

export type Format = "16:9" | "9:16" | "1:1" | "4:5";

export const FORMAT_SIZE: Record<Format, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
};

/** Media reference: path under public/. Kind is inferred from extension if omitted. */
export type MediaRef = {
  src: string;
  kind?: "image" | "video";
  /** For video: frame of the source to start on. */
  startFrom?: number;
  /** CSS object-position for the crop. */
  position?: string;
  /** Short caption/label the pattern may show. */
  label?: string;
};

export type BeatContent = {
  headline?: string[];
  subhead?: string;
  label?: string;
  body?: string;
  media?: MediaRef[];
  logos?: MediaRef[];
  logo?: MediaRef;
  url?: string;
  cta?: string;
  stat?: { value: string; caption: string };
  stats?: { value: string; caption: string }[];
  /** Free per-pattern options the vocabulary allows (validated per pattern). */
  options?: Record<string, unknown>;
};

export type PlanBeat = {
  /** Unique id for this beat in the plan; becomes the shot id. */
  id?: string;
  beat: Beat;
  pattern: string;
  content: BeatContent;
  /** Frames. Omit to use the vocabulary's preferred duration. */
  duration?: number;
  /** Transition INTO this beat. Omit for the brand's default. */
  transition?: string;
  transitionFrames?: number;
  /** Dark ground for this beat, if the pattern supports it. */
  dark?: boolean;
};

export type CompositionPlan = {
  /** Which brand renders it. */
  brand: string;
  intent: string;
  format: Format;
  fps?: number;
  /** Target seconds. Beats without explicit durations are scaled to fit. */
  duration?: number;
  story: PlanBeat[];
  /** Optional soundtrack under public/. */
  music?: { src: string; startSeconds?: number; volume?: number };
};
