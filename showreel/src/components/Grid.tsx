import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLOR, OUT } from "../theme";

/**
 * The deck grid — 8 verticals, 4 horizontals, at the exact 1920x1080 coordinates
 * the slides use. Built from real 1px divs: gradients rasterise into a flat wash
 * (see CASE-STUDY-SYSTEM.md §2).
 */
const X = [120, 360, 600, 840, 1080, 1320, 1560, 1800];
const Y = [180, 420, 660, 900];

export const Grid: React.FC<{
  dark?: boolean;
  /** Frames the draw-on takes. 0 = already there. */
  drawIn?: number;
  delay?: number;
}> = ({ dark = false, drawIn = 0, delay = 0 }) => {
  const frame = useCurrentFrame();
  const color = dark ? COLOR.gridDark : COLOR.gridLight;

  const progress = (index: number, total: number) => {
    if (drawIn === 0) {
      return 1;
    }
    const stagger = index * 2;
    return interpolate(
      frame,
      [delay + stagger, delay + stagger + drawIn],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: OUT },
    );
  };

  return (
    <AbsoluteFill>
      {X.map((x, i) => (
        <div
          key={`v${x}`}
          style={{
            position: "absolute",
            left: x,
            top: 0,
            width: 1,
            height: 1080,
            background: color,
            transform: `scaleY(${progress(i, X.length)})`,
            transformOrigin: "top",
          }}
        />
      ))}
      {Y.map((y, i) => (
        <div
          key={`h${y}`}
          style={{
            position: "absolute",
            left: 0,
            top: y,
            width: 1920,
            height: 1,
            background: color,
            transform: `scaleX(${progress(i + X.length, Y.length)})`,
            transformOrigin: "left",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
