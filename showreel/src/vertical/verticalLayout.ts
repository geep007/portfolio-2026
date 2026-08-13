import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { fontFields } from "../typography";

/**
 * Prop contract for the 9:16 single-project reel.
 *
 * This is a different object to the 16:9 showreel, not a crop of it. A landscape
 * capture cover-cropped into 1080x1920 loses two thirds of its width, so here the
 * footage lives in a panel that keeps its own aspect and the space above it is
 * given to type — which is also what makes the thing readable muted, on a phone,
 * in a feed, which is the only way it will ever actually be watched.
 *
 * One project per reel. The 16:9 showreel argues "here is the range"; this argues
 * "here is one build and what it does", which is the post that gets saved.
 */

/** One beat of the reel. Every shot is footage + a claim about it. */
export const verticalShotSchema = z.object({
  /** Filename inside public/media. */
  clip: z.string(),
  clipStartFrom: z.number().int().min(0),
  /** Where to hold the crop, since a 16:9 capture is wider than the panel. */
  objectPosition: z.string(),
  /**
   * Crop for the detail inset. Held separately from the panel's crop because the
   * inset is aimed at one element in the capture, and the point of the frame is
   * usually not the point of a 2x crop of it.
   */
  detailPosition: z.string(),
  /** Push over the shot. Never 1→1: a static panel reads as a screenshot. */
  from: z.number().min(0.5).max(3),
  to: z.number().min(0.5).max(3),
  /** Display claim, one array entry per typeset line. */
  headline: z.array(z.string()),
  /** Mono line under the counter. The technical fact behind the claim. */
  spec: z.string(),
  /**
   * Filenames inside public/media/phones. When present the lower third becomes
   * a row of device stills instead of the detail inset — the responsive claim is
   * the one beat that has to be proved with more than one viewport.
   */
  phones: z.array(z.string()),
  /** Length of the shot in frames. Drives the composition length. */
  durationInFrames: z.number().int().min(20).max(240),
});

export type VerticalShot = z.infer<typeof verticalShotSchema>;

export const verticalSchema = z.object({
  /** Project name, set in the header and the opening knockout. */
  project: z.string(),
  /** Site URL, on the panel's title bar. */
  url: z.string(),
  /** Mono line above the opening knockout. */
  eyebrow: z.string(),
  /** Opening knockout, one array entry per line. Set in caps. */
  hook: z.array(z.string()),
  /** Mono chip on the opening plate. */
  hookChip: z.string(),
  /**
   * Footage behind the opening knockout. Held separately from the shots because
   * the letters are a small window: it needs the brightest, most saturated
   * moment in the capture, which is almost never where a shot wants to start.
   */
  hookClip: z.string(),
  hookStartFrom: z.number().int().min(0),
  hookPosition: z.string(),
  /** Frames the opening plate holds before it leaves. */
  hookDuration: z.number().int().min(30).max(150),
  shots: z.array(verticalShotSchema),
  /** Closing wordmark, one array entry per line. Set in caps. */
  wordmark: z.array(z.string()),
  /** Positioning line under the closing mark. */
  line: z.string(),
  /** The ask. Last thing on screen, so it is a CTA and not a tagline. */
  cta: z.string(),
  /** Handle, opposite the CTA. */
  handle: z.string(),
  /** Frames the closing card runs for. */
  ctaDuration: z.number().int().min(30).max(180),
  /** Mono strip that runs along the bottom edge the whole way through. */
  ticker: z.string(),
  ground: zColor(),
  accent: zColor(),
  ink: zColor(),
  ...fontFields,
});

export type VerticalProps = z.infer<typeof verticalSchema>;

/**
 * Fallback only — Root.tsx carries the copy the Studio edits and writes back.
 */
export const defaultSurrealProps: VerticalProps = {
  project: "SURREAL",
  url: "letsgetsurreal.com",
  eyebrow: "WEBFLOW BUILD · 2026",
  hook: ["LETS", "GET", "SURREAL"],
  hookChip: "BUILT BY ATOMIC DESIGNZ",
  hookClip: "surreal-carousel.mp4",
  hookStartFrom: 116,
  hookPosition: "50% 45%",
  hookDuration: 66,
  shots: [
    {
      clip: "surreal-hero.mp4",
      clipStartFrom: 26,
      objectPosition: "50% 40%",
      detailPosition: "50% 30%",
      from: 1.02,
      to: 1.14,
      headline: ["Hero tied to", "scroll.", "Not to a timer."],
      spec: "GSAP SCROLLTRIGGER · 0.00 → 1.00",
      phones: [],
      durationInFrames: 108,
    },
    {
      clip: "surreal-carousel.mp4",
      clipStartFrom: 34,
      objectPosition: "55% 38%",
      detailPosition: "30% 55%",
      from: 1.16,
      to: 1.03,
      headline: ["Drag it.", "It follows."],
      spec: "INERTIA CAROUSEL · POINTER + TOUCH",
      phones: [],
      durationInFrames: 96,
    },
    {
      clip: "surreal-globe.mp4",
      clipStartFrom: 20,
      objectPosition: "50% 34%",
      detailPosition: "62% 55%",
      from: 1.04,
      to: 1.22,
      headline: ["A globe", "that runs in", "the browser."],
      spec: "WEBGL · 60FPS ON A PHONE",
      phones: [],
      durationInFrames: 96,
    },
    {
      clip: "surreal-facility.mp4",
      clipStartFrom: 20,
      objectPosition: "50% 45%",
      detailPosition: "50% 45%",
      from: 1.2,
      to: 1.02,
      headline: ["Same build.", "Down to 320px."],
      spec: "FLUID TYPE · NO SEPARATE MOBILE SITE",
      phones: ["surreal-01.jpg", "surreal-04.jpg", "surreal-05.jpg"],
      durationInFrames: 90,
    },
  ],
  wordmark: ["ATOMIC", "DESIGNZ"],
  line: "Webflow & creative development partner",
  cta: "DM TO BUILD YOURS",
  handle: "@atomicdesignz",
  ctaDuration: 84,
  ticker: "SURREAL · WEBFLOW · GSAP · WEBGL · ATOMIC DESIGNZ ·",
  ground: "#FAFAFA",
  accent: "#1A2EF2",
  ink: "#333333",
  fontPairing: "deck",
  displayFontOverride: "",
  monoFontOverride: "",
};

/** Frame boundaries, derived so retiming any beat retimes the composition. */
export const verticalTimeline = (p: VerticalProps) => {
  const shots: { from: number; duration: number; shot: VerticalShot }[] = [];
  let cursor = p.hookDuration;

  for (const shot of p.shots) {
    shots.push({ from: cursor, duration: shot.durationInFrames, shot });
    cursor += shot.durationInFrames;
  }

  return {
    hook: { from: 0, duration: p.hookDuration },
    shots,
    cta: { from: cursor, duration: p.ctaDuration },
    total: cursor + p.ctaDuration,
  };
};
