import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandSystem } from "../brand/schema";
import { easingOf, type EasingName } from "./easing";

/**
 * Semantic timing.
 *
 * Components never say "22 frames". They say `standard`, and the brand's tempo
 * decides what that is. Atomic at tempo 1.0 resolves `standard` to 22; a slower
 * editorial brand at 1.3 gets 29 without any component knowing.
 */

export type DurationTier = "micro" | "short" | "standard" | "hero";
export type StaggerTier = "tight" | "normal" | "loose";

export const framesOf = (brand: BrandSystem, tier: DurationTier | number) => {
  if (typeof tier === "number") {
    return Math.round(tier * brand.motion.tempo);
  }
  return Math.max(1, Math.round(brand.motion.durations[tier] * brand.motion.tempo));
};

export const staggerOf = (brand: BrandSystem, tier: StaggerTier | number) => {
  if (typeof tier === "number") {
    return Math.round(tier * brand.motion.tempo);
  }
  return Math.max(0, Math.round(brand.motion.stagger[tier] * brand.motion.tempo));
};

/** Reference values (tempo 1.0). A brand file usually starts from these. */
export const REFERENCE_DURATIONS = { micro: 6, short: 12, standard: 22, hero: 36 };
export const REFERENCE_STAGGER = { tight: 3, normal: 6, loose: 12 };

/* ------------------------------------------------------------------ *
 * Progress helpers — one implementation of the clamp-and-ease that every
 * component used to hand-roll.
 * ------------------------------------------------------------------ */

export type ProgressOpts = {
  delay?: number;
  duration: number;
  easing?: (t: number) => number;
};

/** 0 → 1 across [delay, delay + duration], clamped both sides. */
export const progress = (frame: number, o: ProgressOpts) =>
  interpolate(frame, [o.delay ?? 0, (o.delay ?? 0) + Math.max(1, o.duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: o.easing,
  });

/**
 * A shot's own clock, in three phases. Patterns read this rather than the raw
 * frame so an exit lands on the shot's real end even after it is retimed.
 */
export type ShotClock = {
  frame: number;
  duration: number;
  fps: number;
  /** 0→1 over the whole shot, linear. */
  t: number;
  /** 0→1 over the entrance window. */
  enter: number;
  /** 0→1 over the exit window (starts at duration - exitFrames). */
  exit: number;
  /** 1 while fully present, i.e. enter done and exit not started. */
  hold: number;
  enterFrames: number;
  exitFrames: number;
  /** Frames left until the shot ends. */
  remaining: number;
};

export const useShotClock = (
  brand: BrandSystem,
  o: {
    /** Override the shot length; defaults to the enclosing Sequence's. */
    duration?: number;
    enter?: DurationTier | number;
    exit?: DurationTier | number;
    enterEasing?: EasingName;
    exitEasing?: EasingName;
    /** Set false for shots that are cut off by a transition and never exit. */
    exits?: boolean;
  } = {},
): ShotClock => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const duration = o.duration ?? durationInFrames;
  const enterFrames = framesOf(brand, o.enter ?? "standard");
  const exitFrames = o.exits === false ? 0 : framesOf(brand, o.exit ?? "short");

  const enter = progress(frame, {
    duration: enterFrames,
    easing: easingOf(brand, o.enterEasing ?? "enter"),
  });
  const exit =
    exitFrames > 0
      ? progress(frame, {
          delay: duration - exitFrames,
          duration: exitFrames,
          easing: easingOf(brand, o.exitEasing ?? "exit"),
        })
      : 0;

  return {
    frame,
    duration,
    fps,
    t: Math.min(1, Math.max(0, frame / Math.max(1, duration))),
    enter,
    exit,
    hold: enter >= 1 && exit <= 0 ? 1 : 0,
    enterFrames,
    exitFrames,
    remaining: duration - frame,
  };
};

/** Seconds → frames at the composition's fps. */
export const sec = (fps: number, s: number) => Math.round(s * fps);
