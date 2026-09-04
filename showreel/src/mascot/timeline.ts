import { NEUTRAL, type Pose } from "./MascotArt";

/**
 * The mascot's master timeline.
 *
 * This file is the authoring half of `aval/mascot/motion.json`: AVAL slices one
 * rendered sequence into units by frame range, so the ranges below and the ones
 * in that project file have to agree exactly. Change a length here and you must
 * change it there.
 *
 * Layout (30fps, 144 frames):
 *
 *   [  0,  30)  intro   one-shot   pops the mascot in on first paint
 *   [ 30,  78)  idle    loop       breathing + a blink, 1.6s
 *   [ 78,  96)  lean    reversible idle <-> curious, played both directions
 *   [ 96, 144)  curious loop       leaned in, sparkle spun up, 1.6s
 *
 * ## Why the loops are built out of a 24-frame sine
 *
 * AVAL can only leave a looping body at a frame listed in that unit's
 * `portalFrames`, and a transition out of a portal is authored against one
 * specific pose. So every portal frame of a loop must render *identically*.
 *
 * Both loops drive every animated value from `s = sin(2*pi*n/24)`, which is
 * exactly 0 at n = 0, 12, 24 and 36. Those four frames are therefore pixel-wise
 * identical, which is what lets both loops list all four as portals — capping
 * the wait for a hover response at 12 frames (0.4s) instead of a full 1.6s
 * lap. The blinks are deliberately placed between portal frames so they never
 * break that equality.
 */

export const FPS = 30;

export const SEGMENT = {
  intro: { from: 0, duration: 30 },
  idle: { from: 30, duration: 48 },
  lean: { from: 78, duration: 18 },
  curious: { from: 96, duration: 48 },
} as const;

export const TOTAL =
  SEGMENT.curious.from + SEGMENT.curious.duration; /* 144 */

/** Frames within a loop whose poses are identical, so AVAL may exit there. */
export const PORTAL_FRAMES = [0, 12, 24, 36];

/** The pose both loops return to whenever `s` is zero. */
const IDLE_NEUTRAL: Pose = { ...NEUTRAL };

const CURIOUS_NEUTRAL: Pose = {
  ...NEUTRAL,
  scale: 1.06,
  tilt: -7,
  eyeScale: 1.18,
  sparkleScale: 1.45,
  sparkleTilt: 30,
};

const TAU = Math.PI * 2;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  scale: lerp(a.scale, b.scale, t),
  bob: lerp(a.bob, b.bob, t),
  tilt: lerp(a.tilt, b.tilt, t),
  eyeOpen: lerp(a.eyeOpen, b.eyeOpen, t),
  eyeScale: lerp(a.eyeScale, b.eyeScale, t),
  sparkleScale: lerp(a.sparkleScale, b.sparkleScale, t),
  sparkleTilt: lerp(a.sparkleTilt, b.sparkleTilt, t),
  opacity: lerp(a.opacity, b.opacity, t),
});

/** Symmetric ease. A reversible transition has to read the same played backwards. */
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** Overshoot, for the entrance only. */
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

/**
 * A blink centred on `at`, `span` frames wide. Returns 1 (open) everywhere
 * outside the window, so callers can multiply it into `eyeOpen` freely.
 */
const blink = (n: number, at: number, span = 5) => {
  const d = Math.abs(n - at);
  if (d > span / 2) return 1;
  return clamp(d / (span / 2));
};

const introPose = (n: number): Pose => {
  // (n + 1) / (duration + 1) so the last rendered frame lands just short of
  // neutral — frame 0 of the idle loop completes the move without a duplicate.
  const p = (n + 1) / (SEGMENT.intro.duration + 1);
  const e = easeOutBack(p);
  const rest = 1 - e;
  return {
    scale: e,
    bob: -14 * rest,
    tilt: -18 * rest,
    // Eyes stay shut for the first third, then the mascot wakes up.
    eyeOpen: clamp((p - 0.3) / 0.25),
    eyeScale: 1,
    sparkleScale: clamp(e),
    sparkleTilt: -120 * rest,
    opacity: clamp(p * 3),
  };
};

const idlePose = (n: number): Pose => {
  const s = Math.sin((TAU * n) / 24);
  return {
    ...IDLE_NEUTRAL,
    bob: -4 * s,
    tilt: 1.5 * s,
    // Sits between the portals at 12 and 24.
    eyeOpen: blink(n, 18),
    sparkleScale: 1 + 0.12 * s,
    sparkleTilt: 12 * s,
  };
};

const curiousPose = (n: number): Pose => {
  const s = Math.sin((TAU * n) / 24);
  return {
    ...CURIOUS_NEUTRAL,
    bob: -7 * s,
    tilt: CURIOUS_NEUTRAL.tilt + 3 * s,
    // Sits after the portal at 36 and closes well before the loop point.
    eyeOpen: blink(n, 40),
    sparkleScale: CURIOUS_NEUTRAL.sparkleScale + 0.25 * s,
    sparkleTilt: CURIOUS_NEUTRAL.sparkleTilt + 40 * s,
  };
};

const leanPose = (n: number): Pose => {
  // Same off-by-one trick as the intro, at both ends: frame 0 is a step past
  // idle-neutral and the last frame stops a step short of curious-neutral, so
  // neither direction of this reversible transition repeats a pose.
  const t = (n + 1) / (SEGMENT.lean.duration + 1);
  return mixPose(IDLE_NEUTRAL, CURIOUS_NEUTRAL, easeInOut(t));
};

/** Pose for an absolute frame on the master timeline. */
export const poseAt = (frame: number): Pose => {
  const f = Math.max(0, Math.min(TOTAL - 1, Math.round(frame)));
  if (f < SEGMENT.idle.from) return introPose(f - SEGMENT.intro.from);
  if (f < SEGMENT.lean.from) return idlePose(f - SEGMENT.idle.from);
  if (f < SEGMENT.curious.from) return leanPose(f - SEGMENT.lean.from);
  return curiousPose(f - SEGMENT.curious.from);
};
