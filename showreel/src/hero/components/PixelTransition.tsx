import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLOR, OUT } from "../../theme";

/**
 * Pixel fragments from the deck's identity, used as a cut cover.
 *
 * Graphic, not glitchy: the cells are large, on a fixed grid, and resolve in a
 * seeded random order so the break-up reads as designed rather than as an error
 * state. Kept under ~0.4s wherever it is used.
 */
const COLS = 16;
const ROWS = 9;

export const PixelTransition: React.FC<{
  duration?: number;
  /** "in" covers the frame, "out" clears it, "through" does both. */
  mode?: "in" | "out" | "through";
  color?: string;
  seed?: string;
}> = ({ duration = 12, mode = "through", color = COLOR.cobalt, seed = "px" }) => {
  const frame = useCurrentFrame();
  const cellW = 1920 / COLS;
  const cellH = 1080 / ROWS;

  return (
    <AbsoluteFill>
      {new Array(COLS * ROWS).fill(0).map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const order = random(`${seed}-${i}`);

        const half = duration / 2;
        const stagger = order * (mode === "through" ? half * 0.7 : duration * 0.55);

        let on = 1;
        if (mode === "in" || mode === "through") {
          on = interpolate(frame, [stagger, stagger + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          });
        }
        if (mode === "out") {
          on = 1 - interpolate(frame, [stagger, stagger + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          });
        }
        if (mode === "through") {
          const off = interpolate(frame, [half + stagger, half + stagger + 4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: OUT,
          });
          on = on * (1 - off);
        }

        if (on <= 0.001) {
          return null;
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: col * cellW,
              top: row * cellH,
              width: cellW + 1,
              height: cellH + 1,
              background: color,
              opacity: on,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
