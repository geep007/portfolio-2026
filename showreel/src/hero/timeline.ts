import { z } from "zod";
import { SHOTS } from "./shots";

/**
 * The edit, as data.
 *
 * Shot positions used to be hardcoded `from` frames, which meant deleting a shot
 * left a hole and renumbering everything by hand. Here only order, length and
 * on/off are stored; absolute positions are derived. Switch a shot off and the
 * rest close up behind it and the composition gets shorter.
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
export const defaultShotEntries: ShotEntry[] = SHOTS.map((s, i) => ({
  id: s.id,
  enabled: true,
  duration: s.duration,
  // The opening shot has nothing to arrive over.
  transition: i === 0 ? "cut" : "cut",
  transitionFrames: 12,
}));

export type TimelineShot = ShotEntry & {
  from: number;
  /** The transition of the shot that follows, if any. */
  outroFrames: number;
};

export type Timeline = {
  shots: TimelineShot[];
  total: number;
};

/**
 * Lay the enabled shots end to end.
 *
 * Each shot is kept alive for the length of the *next* shot's transition, so a
 * reveal-style transition has something real underneath it to reveal over
 * rather than the empty background.
 */
export const buildTimeline = (entries: ShotEntry[]): Timeline => {
  const on = entries.filter((e) => e.enabled && e.duration > 0);
  let from = 0;

  const shots: TimelineShot[] = on.map((e, i) => {
    const next = on[i + 1];
    const shot: TimelineShot = {
      ...e,
      from,
      outroFrames: next ? Math.min(next.transitionFrames, e.duration) : 0,
    };
    from += e.duration;
    return shot;
  });

  // Never hand Remotion a zero-length composition.
  return { shots, total: Math.max(1, from) };
};

/** Absolute frame range of a shot, or null if it has been switched off. */
export const rangeOf = (timeline: Timeline, id: string) => {
  const s = timeline.shots.find((x) => x.id === id);
  return s ? { from: s.from, to: s.from + s.duration } : null;
};
