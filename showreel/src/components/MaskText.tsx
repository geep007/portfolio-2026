import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { OUT } from "../theme";

/**
 * Line-by-line clip reveal. The line rises inside a fixed box rather than fading —
 * the mask edge is the point, it reads as typesetting rather than as a transition.
 */
export const MaskText: React.FC<{
  lines: string[];
  delay?: number;
  stagger?: number;
  duration?: number;
  style?: React.CSSProperties;
  lineHeight?: number;
  /** Horizontal alignment of each line inside its mask box. */
  align?: "left" | "center" | "right";
}> = ({
  lines,
  delay = 0,
  stagger = 5,
  duration = 22,
  style,
  lineHeight = 1.0,
  align = "left",
}) => {
  const frame = useCurrentFrame();

  // Each line is its own overflow box, so the alignment has to be applied to
  // the box rather than inherited as text-align from an ancestor.
  const justify =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {lines.map((line, i) => {
        const start = delay + i * stagger;
        const t = interpolate(frame, [start, start + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: OUT,
        });
        const fontSize = Number(style?.fontSize ?? 100);
        return (
          <div
            key={line}
            style={{
              overflow: "hidden",
              height: fontSize * lineHeight,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: justify,
            }}
          >
            <div
              style={{
                ...style,
                lineHeight,
                transform: `translateY(${(1 - t) * 100}%)`,
                whiteSpace: "pre",
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};
