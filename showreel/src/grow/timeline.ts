import { interpolate } from "remotion";
import { bezier, REFERENCE_EASINGS } from "../motion-system/engine/easing";

/**
 * The film as a list of named boundary states, in seconds.
 *
 * There are no shots and no cuts. Every entry below is a window during which
 * one persistent object changes; the visual state either side of a window is
 * whatever the previous window left behind. Read the table top to bottom and
 * you have the whole edit.
 */
export const FPS = 30;
export const DURATION_SECONDS = 12.5;
export const TOTAL_FRAMES = Math.round(DURATION_SECONDS * FPS);

export const T = {
  /** The frame is cut open and the landscape is under it. */
  stripEnter: [0.15, 0.9],
  headlineOne: [1.3, 1.6],
  /** Headline 01 is lifted on the same beat the incision starts. */
  headlineOneOut: 2.5,
  /** One strip becomes two; the gap between them is the motion. */
  stripSplit: [2.5, 3.6],
  /** "But." is uncovered by the gap itself, so it has no window of its own. */
  butOut: 4.9,
  /** Two become six, uncovered from the seams the split left. */
  stripMultiply: [4.9, 6.0],
  /** Six converge into one band, filling it exactly. */
  stripCollapse: [6.6, 7.4],
  /** The word is printed before the ground arrives under it. */
  bandType: [7.0, 7.25],
  /** Bone opens from the band's own centre line out to its edges. */
  bandInk: [7.4, 7.95],
  /** The same boundary keeps opening, to the whole frame. */
  bandOpen: [9.0, 9.65],
  bandTypeOut: 9.65,
  /** The band has finished its job and left the artefact behind. */
  ringLand: 9.75,
  ringSettle: [9.75, 9.9],
  beliefOne: [9.95, 10.2],
  beliefTwo: [10.3, 10.55],
  /** Second ink pass, not a crossfade. */
  flourishColour: 10.7,
  /** Frame 05 is lifted; the ring stays exactly where it is. */
  beliefOut: 11.05,
  closingOne: [11.1, 11.4],
  closingTwo: [11.3, 11.6],
  /** The ring dims only once the headline is over it — a printed underlay. */
  ringUnderlay: 11.6,
  closingMeta: [11.7, 11.85],
  /** The only high-chroma moment in the film. */
  yellowDraw: [11.9, 12.15],
} as const;

/** Sound hooks, should a mix ever be cut to this. Frame numbers, not seconds. */
export const MARKERS = {
  stripReveal: Math.round(T.stripEnter[0] * FPS),
  split: Math.round(T.stripSplit[0] * FPS),
  multiply: Math.round(T.stripMultiply[0] * FPS),
  collapse: Math.round(T.stripCollapse[0] * FPS),
  ink: Math.round(T.bandInk[0] * FPS),
  ringLand: Math.round(T.ringLand * FPS),
  yellow: Math.round(T.yellowDraw[0] * FPS),
};

/**
 * Easing. Four curves for the whole film, and most of the piece uses the first
 * two. Nothing overshoots; nothing springs.
 */
export const EASE = {
  /** Boundaries travelling. Near-linear with soft ends. */
  boundary: bezier(REFERENCE_EASINGS.travel),
  /** Openings and collapses. Symmetrical, mechanical. */
  open: bezier(REFERENCE_EASINGS.cubicInOut),
  /** Things landing: reveals, the ring settle. */
  settle: bezier(REFERENCE_EASINGS.quartOut),
  /** The site's own curve — quick, soft ease-out. */
  site: bezier([0.2, 0, 0, 1]),
  linear: bezier(REFERENCE_EASINGS.linear),
};

/** 0 → 1 across a [fromSeconds, toSeconds] window, clamped both sides. */
export const span = (
  frame: number,
  window: readonly [number, number] | number[],
  easing: (t: number) => number = EASE.boundary,
) =>
  interpolate(frame, [window[0] * FPS, window[1] * FPS], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** True once the given second has been reached — for hard, print-like changes. */
export const past = (frame: number, seconds: number) => frame >= seconds * FPS;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
