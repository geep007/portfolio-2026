/**
 * Timeline — the edit as data. Brand-independent.
 *
 * Lifted from hero/timeline.ts (which now re-exports this). Only order, length
 * and on/off are stored; absolute positions are derived. Switch a shot off and
 * the rest close up. Retime one and everything after it moves.
 *
 * Transitions are stored by *name*; which names are legal for a brand is
 * decided by `brand.motion.transitions`, not here.
 */

export type ShotEntry = {
  id: string;
  enabled: boolean;
  duration: number;
  /** How this shot arrives over the previous one. */
  transition: string;
  transitionFrames: number;
};

export type TimelineShot = ShotEntry & {
  from: number;
  /** Extra frames this shot stays mounted so the *next* transition has something to reveal over. */
  outroFrames: number;
  index: number;
};

export type Timeline = {
  shots: TimelineShot[];
  total: number;
};

export const buildTimeline = (entries: ShotEntry[]): Timeline => {
  const on = entries.filter((e) => e.enabled && e.duration > 0);
  let from = 0;

  const shots: TimelineShot[] = on.map((e, i) => {
    const next = on[i + 1];
    const shot: TimelineShot = {
      ...e,
      from,
      index: i,
      outroFrames: next ? Math.min(next.transitionFrames, e.duration) : 0,
    };
    from += e.duration;
    return shot;
  });

  return { shots, total: Math.max(1, from) };
};

/** Absolute frame range of a shot, or null if it is switched off. */
export const rangeOf = (timeline: Timeline, id: string) => {
  const s = timeline.shots.find((x) => x.id === id);
  return s ? { from: s.from, to: s.from + s.duration } : null;
};

/** Which shot is under an absolute frame. */
export const shotAt = (timeline: Timeline, frame: number) =>
  timeline.shots.find((s) => frame >= s.from && frame < s.from + s.duration) ?? null;

/* ------------------------------------------------------------------ *
 * Shot-relative keys — the mechanism behind the cursor path.
 * ------------------------------------------------------------------ */

export type ShotKey<T> = T & {
  shot: string;
  /** Frame within that shot. */
  at: number;
};

export type ResolvedKey<T> = T & { frame: number };

/**
 * Place shot-relative keys on the absolute timeline. Keys for switched-off
 * shots drop out; keys past a shortened shot's end clamp to its last frame.
 */
export const resolveKeys = <T extends object>(
  keys: ShotKey<T>[],
  timeline: Timeline,
): ResolvedKey<T>[] => {
  const out: ResolvedKey<T>[] = [];
  for (const k of keys) {
    const s = timeline.shots.find((x) => x.id === k.shot);
    if (!s) {
      continue;
    }
    const { shot: _shot, at, ...rest } = k;
    out.push({ ...(rest as T), frame: s.from + Math.min(at, s.duration) });
  }
  out.sort((a, b) => a.frame - b.frame);
  return out;
};
