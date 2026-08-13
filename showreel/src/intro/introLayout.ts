import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { fontFields } from "../typography";

/**
 * Shared prop contract for the two standalone intro variants.
 *
 * They are separate compositions on purpose: the intro is the frame that has to
 * survive being seen above the fold on its own, so it gets judged and rendered
 * on its own before it is ever cut into the reel. Both variants take the same
 * props, so a decision made on one (copy, clip, colour) carries to the other.
 *
 * Everything a review note would ever ask to change is a prop, which means the
 * Studio props panel is the whole edit surface — no code change to retime, to
 * swap the footage, or to rewrite the line.
 */
export const introSchema = z.object({
  /** Filename inside public/media — Clip prepends the folder. */
  clip: z.string(),
  /** Which frame of the source capture to open on. */
  clipStartFrom: z.number().int().min(0),
  /** URL on the browser chrome (Intro B), so the capture reads as a client's
   *  site rather than as my own headline. Must match the clip. */
  url: z.string(),
  /** Mono line above the headline. Kept to system-label register. */
  eyebrow: z.string(),
  /** Display headline, one array entry per typeset line. */
  headline: z.array(z.string()),
  /** Mono chip that lands last. The only piece of positioning copy. */
  chip: z.string(),
  ground: zColor(),
  accent: zColor(),
  ink: zColor(),
  /** Type pairing + optional family overrides. See typography.ts. */
  ...fontFields,
  /** Length of the intro. Drives the composition, so retiming is a prop edit. */
  durationInFrames: z.number().int().min(30).max(300),
});

export type IntroProps = z.infer<typeof introSchema>;

/**
 * Fallback only — Root.tsx carries the copy the Studio actually edits and
 * writes back. This exists so a partial `--props` on the CLI cannot crash a
 * render, matching how HeroReel merges over defaultHeroProps.
 */
export const defaultIntroProps: IntroProps = {
  clip: "surreal-carousel.mp4",
  clipStartFrom: 34,
  url: "letsgetsurreal.com",
  eyebrow: "ATOMIC DESIGNZ · WEBFLOW & CREATIVE DEV",
  headline: ["Built", "to move"],
  chip: "SELECTED WORK 2026",
  ground: "#FAFAFA",
  accent: "#1A2EF2",
  ink: "#333333",
  fontPairing: "deck",
  displayFontOverride: "",
  monoFontOverride: "",
  durationInFrames: 90,
};
