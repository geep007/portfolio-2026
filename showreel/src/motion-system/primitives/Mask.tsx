import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, type DurationTier } from "../engine/timing";

/**
 * LEVEL 1 · Clip-path reveals. The mechanism behind every hard-edged entrance.
 *
 * `Mask` — rectangular inset from one edge.
 * `CircleMask` — circular reveal from a point (the match-cut device).
 * `RailMask` — N vertical or horizontal bands opening in sequence: the reveal
 *   follows a grid rather than an edge.
 *
 * All read `brand.surfaces.clipping`: "hard" is a pure clip, "soft" feathers
 * the edge with a mask-image gradient. The caller never chooses.
 */
type Direction = "left" | "right" | "up" | "down";

const inset = (dir: Direction, rest: number) =>
  dir === "right"
    ? `inset(0 ${rest}% 0 0)`
    : dir === "left"
      ? `inset(0 0 0 ${rest}%)`
      : dir === "down"
        ? `inset(0 0 ${rest}% 0)`
        : `inset(${rest}% 0 0 0)`;

export const Mask: React.FC<{
  direction?: Direction;
  delay?: number;
  duration?: DurationTier | number;
  /** 0→1 progress override (drive it from a parent clock). */
  t?: number;
  children: React.ReactNode;
}> = ({ direction = "right", delay = 0, duration = "short", t, children }) => {
  const { ease, frames } = useBrand();
  const frame = useCurrentFrame();
  const p = t ?? progress(frame, { delay, duration: frames(duration), easing: ease("enter") });
  return <AbsoluteFill style={{ clipPath: inset(direction, (1 - p) * 100) }}>{children}</AbsoluteFill>;
};

export const CircleMask: React.FC<{
  cx: number;
  cy: number;
  from?: number;
  to?: number;
  delay?: number;
  duration?: DurationTier | number;
  children: React.ReactNode;
}> = ({ cx, cy, from = 0, to, delay = 0, duration = "short", children }) => {
  const { ease, frames } = useBrand();
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const full = to ?? Math.hypot(width, height);
  const r = interpolate(frame, [delay, delay + frames(duration)], [from, full], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease("enter"),
  });
  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>{children}</AbsoluteFill>
  );
};

/**
 * Bands open one after another along the brand's grid. `count` defaults to
 * the brand's column count for vertical rails, row count for horizontal.
 */
export const RailMask: React.FC<{
  axis?: "vertical" | "horizontal";
  count?: number;
  delay?: number;
  duration?: DurationTier | number;
  /** Frames between bands. */
  stagger?: number;
  /** Which way each band opens along its own length. */
  open?: "start" | "end" | "center";
  children: React.ReactNode;
}> = ({ axis = "vertical", count, delay = 0, duration = "standard", stagger, open = "start", children }) => {
  const { brand, ease, frames, stagger: stag } = useBrand();
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const n = count ?? (axis === "vertical" ? brand.layout.columns : brand.layout.rows);
  const s = stagger ?? stag("tight");
  const d = frames(duration);

  return (
    <AbsoluteFill>
      {new Array(n).fill(0).map((_, i) => {
        const p = progress(frame, { delay: delay + i * s, duration: d, easing: ease("enter") });
        const rest = (1 - p) * 100;
        const band =
          axis === "vertical"
            ? { left: (width / n) * i, top: 0, width: width / n + 1, height }
            : { left: 0, top: (height / n) * i, width, height: height / n + 1 };
        const clip =
          axis === "vertical"
            ? open === "end"
              ? `inset(${rest}% 0 0 0)`
              : open === "center"
                ? `inset(${rest / 2}% 0 ${rest / 2}% 0)`
                : `inset(0 0 ${rest}% 0)`
            : open === "end"
              ? `inset(0 0 0 ${rest}%)`
              : open === "center"
                ? `inset(0 ${rest / 2}% 0 ${rest / 2}%)`
                : `inset(0 ${rest}% 0 0)`;
        return (
          <div key={i} style={{ position: "absolute", ...band, overflow: "hidden", clipPath: clip }}>
            <div
              style={{
                position: "absolute",
                left: -band.left,
                top: -band.top,
                width,
                height,
              }}
            >
              {children}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
