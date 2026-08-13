import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { fontFields } from "../typography";

/**
 * Shared prop contract for the two standalone outro variants.
 *
 * Both close on the intro's knockout plate, so the reel ends on the device it
 * opened with and the loop back to frame 0 is a match rather than a jump. What
 * differs is what the letters do once the plate has landed: A holds them open
 * on the work, B fills them solid and ends on a flat card.
 */
export const outroSchema = z.object({
  /** Filename inside public/media — Clip prepends the folder. */
  clip: z.string(),
  clipStartFrom: z.number().int().min(0),
  /** URL on the browser chrome, so the capture reads as a client's site. */
  url: z.string(),
  /** The wordmark, one array entry per typeset line. Set in caps by the outro. */
  wordmark: z.array(z.string()),
  /** The single line of positioning copy under the mark. */
  line: z.string(),
  /** Mono chip: the call to action. The last thing on screen. */
  chip: z.string(),
  /** Contact, set in mono opposite the chip. */
  contact: z.string(),
  ground: zColor(),
  accent: zColor(),
  ink: zColor(),
  /** Type pairing + optional family overrides. See typography.ts. */
  ...fontFields,
  durationInFrames: z.number().int().min(30).max(300),
});

export type OutroProps = z.infer<typeof outroSchema>;

/** Fallback only — Root.tsx carries what the Studio edits and writes back. */
export const defaultOutroProps: OutroProps = {
  clip: "creo-circle.mp4",
  clipStartFrom: 6,
  url: "creo-agency.com",
  wordmark: ["Atomic", "Designz"],
  line: "Webflow & creative development partner",
  chip: "BOOKING 2026",
  contact: "hello@atomicdesignz.com",
  ground: "#FAFAFA",
  accent: "#1A2EF2",
  ink: "#333333",
  fontPairing: "deck",
  displayFontOverride: "",
  monoFontOverride: "",
  durationInFrames: 100,
};
