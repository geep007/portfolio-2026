import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { COLOR } from "../../theme";

/**
 * The portfolio's hero pattern, ported into the reel.
 *
 * This is a faithful port of `atomic-designz/src/scripts/dot-field.ts`: a wide
 * sparse cobalt lattice, quiet enough to read as paper texture, with one soft
 * nucleus that lifts the handful of dots nearest it.
 *
 * The original is pointer-driven and runs on a rAF loop with easing. Here the
 * nucleus is fed the reel's own cursor position and everything is computed from
 * the frame number, so it renders identically every time — a rAF loop would
 * desync from Remotion's frame-by-frame rendering and produce a different
 * result on every pass.
 *
 * Drawn as DOM nodes rather than canvas: at this lattice spacing it is a few
 * hundred divs, and it keeps the pattern deterministic and inspectable.
 */

const SPACING = 112; // px between lattice points — the portfolio's value
const LIFT = 190; // px radius where lattice dots respond
const BRAND = "26, 46, 242";

export const DotField: React.FC<{
  /** Where the nucleus sits, usually the cursor. */
  x?: number;
  y?: number;
  /** 0–1, how present the nucleus is. */
  presence?: number;
  /** Base opacity of the resting lattice. */
  opacity?: number;
  dark?: boolean;
}> = ({ x = -9999, y = -9999, presence = 0, opacity = 1, dark = false }) => {
  const cols = Math.round(1920 / SPACING);
  const rows = Math.round(1080 / SPACING);
  const stepX = 1920 / cols;
  const stepY = 1080 / rows;

  const tint = dark ? "250, 250, 250" : BRAND;
  const dots: React.ReactNode[] = [];

  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const px = col * stepX;
      const py = row * stepY;
      // Resting variance, so the grid does not read as a print artefact.
      const seed = 0.55 + random(`dot-${col}-${row}`) * 0.45;

      let radius = 1.1;
      let alpha = 0.22 * seed;

      if (presence > 0.002) {
        const dist = Math.hypot(x - px, y - py);
        if (dist < LIFT) {
          const near = 1 - dist / LIFT;
          const eased = near * near * presence;
          radius += eased * 1.5;
          alpha += eased * 0.5;
        }
      }

      dots.push(
        <div
          key={`${col}-${row}`}
          style={{
            position: "absolute",
            left: px - radius,
            top: py - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: "50%",
            background: `rgba(${tint}, ${Math.min(alpha, 1) * opacity})`,
          }}
        />,
      );
    }
  }

  return (
    <AbsoluteFill>
      {dots}
      {presence > 0.002 ? (
        <>
          {/* Soft halo, then a solid centre — the trailing nucleus. */}
          <div
            style={{
              position: "absolute",
              left: x - 54,
              top: y - 54,
              width: 108,
              height: 108,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${tint}, ${
                0.14 * presence * opacity
              }) 0%, rgba(${tint}, 0) 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: x - 5,
              top: y - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: `rgba(${tint}, ${0.9 * presence * opacity})`,
            }}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * The portfolio's other motif: a mark that assembles itself, particles springing
 * out from the centre and overshooting before they settle.
 *
 * Reduced here to the sparkle that appears on the mascot — four-point stars that
 * pop in on a stagger. Same idea, small enough not to compete.
 */
export const Sparkles: React.FC<{
  points: { x: number; y: number; size: number; delay: number }[];
  frame: number;
  color?: string;
}> = ({ points, frame, color = COLOR.cobalt }) => (
  <AbsoluteFill>
    {points.map((p, i) => {
      const t = interpolate(frame, [p.delay, p.delay + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      // Overshoot then settle, the mark choreography in miniature.
      const scale = t < 0.6 ? t * 1.9 : 1.14 - (t - 0.6) * 0.35;
      if (t <= 0) {
        return null;
      }
      return (
        <svg
          key={i}
          width={p.size}
          height={p.size}
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            transform: `scale(${Math.max(0, scale)}) rotate(${t * 45}deg)`,
            opacity: Math.min(1, t * 2),
          }}
        >
          <path
            d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z"
            fill={color}
          />
        </svg>
      );
    })}
  </AbsoluteFill>
);
