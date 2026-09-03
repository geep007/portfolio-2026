import { z } from "zod";
import { SHOTS } from "./shots";
import {
  buildTimeline as build,
  rangeOf as range,
  type ShotEntry as EngineShotEntry,
  type Timeline as EngineTimeline,
  type TimelineShot as EngineTimelineShot,
} from "../motion-system/engine/timeline";

/**
 * Hero-reel timeline. The mechanism lives in `motion-system/engine/timeline.ts`
 * now; this file keeps the zod schema for the Studio props panel and the
 * default entries built from the canonical shot table.
 */

export const TRANSITIONS = [
  "cut",
  "fade",
  "wipe",
  "iris",
  "blinds",
  "pixelate",
  "shutter",
] as const;

export const transitionType = z.enum(TRANSITIONS);
export type TransitionType = (typeof TRANSITIONS)[number];

export const shotEntrySchema = z.object({
  id: z.string(),
  /** Uncheck to drop the shot from the edit entirely. */
  enabled: z.boolean(),
  duration: z.number().step(1),
  /** How this shot arrives over the one before it. */
  transition: transitionType,
  transitionFrames: z.number().step(1),
});

export type ShotEntry = z.infer<typeof shotEntrySchema>;

/** Built from the canonical shot table so the two can never drift apart. */
export const defaultShotEntries: ShotEntry[] = SHOTS.map((s) => ({
  id: s.id,
  enabled: true,
  duration: s.duration,
  transition: "cut",
  transitionFrames: 12,
}));

export type TimelineShot = EngineTimelineShot & { transition: TransitionType };
export type Timeline = EngineTimeline;

export const buildTimeline = (entries: ShotEntry[]): Timeline =>
  build(entries as EngineShotEntry[]);

export const rangeOf = range;
