import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress } from "../engine/timing";

/**
 * How a shot arrives over the one before it. Brand-aware version of
 * hero/components/ShotTransition.
 *
 * Families:
 *   reveal — fade, wipe, iris, blinds, rails: the incoming shot is masked open
 *            over the previous one.
 *   cover  — pixelate, shutter, slab: graphic shapes in the brand's accent
 *            sweep across the cut and bring the new shot with them.
 *   push   — the incoming shot slides the previous one out along an axis.
 *
 * Which names a brand may use is `brand.motion.transitions`. An unlisted
 * name falls back to `cut` — a brand cannot be made to do a move it does not
 * own by a plan naming it.
 */
export const TRANSITION_IDS = [
  "cut",
  "fade",
  "wipe",
  "iris",
  "blinds",
  "rails",
  "pixelate",
  "shutter",
  "slab",
  "push-up",
  "push-left",
  "wave",
] as const;
export type TransitionId = (typeof TRANSITION_IDS)[number];

export const isTransitionId = (s: string): s is TransitionId =>
  (TRANSITION_IDS as readonly string[]).includes(s);

export const ShotTransition: React.FC<{
  type: string;
  duration: number;
  seed?: string;
  children: React.ReactNode;
}> = ({ type, duration, seed = "t", children }) => {
  const { brand, ease, ground } = useBrand();
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const allowed = brand.motion.transitions.includes(type) && isTransitionId(type);
  const kind: TransitionId = allowed ? (type as TransitionId) : "cut";
  const accent = ground(false).accent;

  const t = progress(frame, { duration, easing: ease("enter") });

  if (kind === "cut" || t >= 1) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  if (kind === "fade") {
    return <AbsoluteFill style={{ opacity: t }}>{children}</AbsoluteFill>;
  }

  if (kind === "wipe") {
    return <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}>{children}</AbsoluteFill>;
  }

  if (kind === "iris") {
    const r = Math.hypot(width, height) / 2;
    return <AbsoluteFill style={{ clipPath: `circle(${t * r}px at 50% 50%)` }}>{children}</AbsoluteFill>;
  }

  if (kind === "push-up" || kind === "push-left") {
    const dx = kind === "push-left" ? (1 - t) * width : 0;
    const dy = kind === "push-up" ? (1 - t) * height : 0;
    return (
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px)` }}>{children}</AbsoluteFill>
    );
  }

  if (kind === "blinds") {
    const n = brand.layout.rows;
    const band = height / n;
    const mask = `repeating-linear-gradient(to bottom, #000 0px ${t * band}px, transparent ${t * band}px ${band}px)`;
    return (
      <AbsoluteFill style={{ WebkitMaskImage: mask, maskImage: mask }}>{children}</AbsoluteFill>
    );
  }

  if (kind === "rails") {
    // Vertical bands on the brand's column grid, opening top→down in sequence.
    const n = brand.layout.columns;
    const bandW = width / n;
    return (
      <AbsoluteFill>
        {new Array(n).fill(0).map((_, i) => {
          const local = interpolate(t, [i / (n * 1.6), i / (n * 1.6) + 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * bandW,
                top: 0,
                width: bandW + 1,
                height,
                overflow: "hidden",
                clipPath: `inset(0 0 ${(1 - local) * 100}% 0)`,
              }}
            >
              <div style={{ position: "absolute", left: -i * bandW, top: 0, width, height }}>
                {children}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }

  if (kind === "pixelate") {
    const cols = 16;
    const rows = 9;
    const cellW = width / cols;
    const cellH = height / rows;
    return (
      <AbsoluteFill>
        {children}
        <AbsoluteFill>
          {new Array(cols * rows).fill(0).map((_, i) => {
            const order = random(`${seed}-${i}`);
            const gone = interpolate(t, [order * 0.65, order * 0.65 + 0.35], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            if (gone >= 1) return null;
            const tint = random(`${seed}-c-${i}`);
            const cell =
              tint > 0.88
                ? accent
                : tint > 0.5
                  ? brand.colors.inverse.background
                  : brand.colors.background;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: (i % cols) * cellW,
                  top: Math.floor(i / cols) * cellH,
                  width: cellW + 1,
                  height: cellH + 1,
                  background: cell,
                  opacity: 1 - gone,
                }}
              />
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  if (kind === "wave") {
    // The incoming shot rises under a hand-drawn wave edge. Two crests across
    // the width, amplitude scaled to the frame. An SVG clipPath so the edge
    // stays crisp; the wave also drifts sideways slightly as it rises.
    const amp = height * 0.035;
    const y = (1 - t) * (height + amp * 2) - amp;
    const shift = (1 - t) * width * 0.08;
    const w = width;
    const path = `M0 ${y + amp} C ${w * 0.12 - shift} ${y - amp}, ${w * 0.3 - shift} ${y - amp}, ${w * 0.45 - shift} ${y + amp * 0.6} S ${w * 0.75 - shift} ${y + amp * 1.6}, ${w - shift + w * 0.1} ${y - amp * 0.4} L ${w} ${height} L 0 ${height} Z`;
    const id = `wave-${seed}`;
    return (
      <AbsoluteFill>
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <defs>
            <clipPath id={id} clipPathUnits="userSpaceOnUse">
              <path d={path} />
            </clipPath>
          </defs>
        </svg>
        <AbsoluteFill style={{ clipPath: `url(#${id})` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }

  if (kind === "slab") {
    // One solid plate in the accent sweeps up over the cut, then leaves upward.
    const enter = interpolate(t, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
    const leave = interpolate(t, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" });
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `inset(${(1 - enter) * 100}% 0 0 0)` }}>
          {children}
        </AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 0,
            width,
            top: (1 - enter) * height - leave * height,
            height,
            background: accent,
          }}
        />
      </AbsoluteFill>
    );
  }

  // shutter — four bands in the accent sweep across, staggered, and hand over.
  const bands = 4;
  const bandH = height / bands;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}>{children}</AbsoluteFill>
      {new Array(bands).fill(0).map((_, i) => {
        const stagger = i * 0.08;
        const enter = interpolate(t, [stagger, stagger + 0.4], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const leave = interpolate(t, [stagger + 0.45, stagger + 0.9], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * bandH,
              left: 0,
              width,
              height: bandH + 1,
              background: accent,
              clipPath: `inset(0 ${(1 - enter) * 100}% 0 ${leave * 100}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
