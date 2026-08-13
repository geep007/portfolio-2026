import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { OUT } from "../../theme";

/**
 * Directional clip reveal. Used for cuts where the answer to "why are these two
 * shots together" is shared geometry rather than shared movement — the new shot
 * arrives through the old one's edge instead of over it.
 */
export const MaskReveal: React.FC<{
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}> = ({ direction = "right", delay = 0, duration = 14, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  const rest = (1 - t) * 100;
  const clip =
    direction === "right"
      ? `inset(0 ${rest}% 0 0)`
      : direction === "left"
        ? `inset(0 0 0 ${rest}%)`
        : direction === "down"
          ? `inset(0 0 ${rest}% 0)`
          : `inset(${rest}% 0 0 0)`;

  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>;
};

/**
 * Circular reveal — the mechanism behind the reel's circle match-cut chain.
 * The new shot opens out of the exact spot the previous shot's circle occupied.
 */
export const CircleReveal: React.FC<{
  cx: number;
  cy: number;
  from?: number;
  to?: number;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}> = ({ cx, cy, from = 0, to = 1400, delay = 0, duration = 16, children }) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [delay, delay + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  return (
    <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
