import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress } from "../engine/timing";

/**
 * LEVEL 1 · Hairline grid drawn from the brand's column/row count.
 *
 * Verticals draw top→down, horizontals left→right, on a tight stagger. Real
 * 1px divs, not gradients — gradients rasterise into a flat wash.
 *
 * `columns`/`rows` override the brand's when a composition wants a coarser
 * grid than the layout grid (Atomic composes on 12 but draws 8).
 */
export const RuleGrid: React.FC<{
  columns?: number;
  rows?: number;
  dark?: boolean;
  drawIn?: number | false;
  delay?: number;
  color?: string;
  /** Inset the grid from the frame edge by the brand margin. */
  inset?: boolean;
}> = ({ columns, rows, dark = false, drawIn, delay = 0, color, inset = false }) => {
  const { brand, ease, frames, stagger, ground } = useBrand();
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const cols = columns ?? brand.layout.columns;
  const rws = rows ?? brand.layout.rows;
  const stroke = color ?? ground(dark).rule;
  const d = drawIn === false ? 0 : (drawIn ?? frames("short"));
  const s = stagger("tight");
  const m = inset ? brand.spacing.margin : 0;

  const p = (i: number) =>
    d === 0 ? 1 : progress(frame, { delay: delay + i * s, duration: d, easing: ease("enter") });

  const xs = new Array(cols + 1).fill(0).map((_, i) => m + ((width - 2 * m) / cols) * i);
  const ys = new Array(rws + 1).fill(0).map((_, i) => m + ((height - 2 * m) / rws) * i);

  return (
    <AbsoluteFill>
      {xs.map((x, i) => (
        <div
          key={`v${i}`}
          style={{
            position: "absolute",
            left: Math.round(x),
            top: m,
            width: 1,
            height: height - 2 * m,
            background: stroke,
            transform: `scaleY(${p(i)})`,
            transformOrigin: "top",
          }}
        />
      ))}
      {ys.map((y, i) => (
        <div
          key={`h${i}`}
          style={{
            position: "absolute",
            left: m,
            top: Math.round(y),
            width: width - 2 * m,
            height: 1,
            background: stroke,
            transform: `scaleX(${p(i + xs.length)})`,
            transformOrigin: "left",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
