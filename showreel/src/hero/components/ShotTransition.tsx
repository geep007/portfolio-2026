import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLOR, OUT } from "../../theme";
import type { TransitionType } from "../timeline";

/**
 * How a shot arrives over the one before it.
 *
 * Two families:
 *   reveal  (fade, wipe, iris, blinds) — the incoming shot is masked open, so
 *           the previous shot is visible underneath while it happens
 *   cover   (pixelate, shutter) — graphic shapes in the accent colour sweep
 *           across the cut and take the new shot with them
 *
 * Both rely on the previous shot still being mounted during the overlap, which
 * `buildTimeline` arranges by extending each shot by the next one's transition.
 */

const BLIND_COUNT = 8;
const PIXEL_COLS = 16;
const PIXEL_ROWS = 9;

export const ShotTransition: React.FC<{
  type: TransitionType;
  duration: number;
  /** Accent for the cover-style transitions. */
  color?: string;
  seed?: string;
  children: React.ReactNode;
}> = ({ type, duration, color = COLOR.cobalt, seed = "t", children }) => {
  const frame = useCurrentFrame();

  // 0 → 1 across the transition; 1 for the rest of the shot.
  const t = interpolate(frame, [0, Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: OUT,
  });

  if (type === "cut" || t >= 1) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  if (type === "fade") {
    return <AbsoluteFill style={{ opacity: t }}>{children}</AbsoluteFill>;
  }

  if (type === "wipe") {
    return (
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (type === "iris") {
    // 1100 covers the diagonal of a 1920x1080 frame from its centre.
    return (
      <AbsoluteFill style={{ clipPath: `circle(${t * 1150}px at 50% 50%)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (type === "blinds") {
    const band = 1080 / BLIND_COUNT;
    // Each band opens downward from its own top edge, all at once.
    const mask = `repeating-linear-gradient(to bottom, #000 0px ${t * band}px, transparent ${
      t * band
    }px ${band}px)`;
    return (
      <AbsoluteFill
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  if (type === "pixelate") {
    const cellW = 1920 / PIXEL_COLS;
    const cellH = 1080 / PIXEL_ROWS;
    return (
      <AbsoluteFill>
        {children}
        {/* Opaque cells sitting on the new shot, clearing in a seeded order. */}
        <AbsoluteFill>
          {new Array(PIXEL_COLS * PIXEL_ROWS).fill(0).map((_, i) => {
            const order = random(`${seed}-${i}`);
            const gone = interpolate(
              t,
              [order * 0.65, order * 0.65 + 0.35],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            if (gone >= 1) {
              return null;
            }
            // Black and white cells with an occasional accent — the deck's
            // pixel confetti. A single flat colour disappears whenever the
            // shot underneath happens to share it (cobalt cells on the cobalt
            // Athina ground were invisible).
            const tint = random(`${seed}-c-${i}`);
            const cell =
              tint > 0.88 ? color : tint > 0.5 ? COLOR.groundDark : COLOR.groundLight;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: (i % PIXEL_COLS) * cellW,
                  top: Math.floor(i / PIXEL_COLS) * cellH,
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

  // shutter — four bands sweep across, staggered, and hand over the new shot.
  const bandH = 1080 / 4;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}>
        {children}
      </AbsoluteFill>
      {new Array(4).fill(0).map((_, i) => {
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
              width: 1920,
              height: bandH + 1,
              background: color,
              clipPath: `inset(0 ${(1 - enter) * 100}% 0 ${leave * 100}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
