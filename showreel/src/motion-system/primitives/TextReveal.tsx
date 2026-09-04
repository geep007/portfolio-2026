import React from "react";
import { useCurrentFrame } from "remotion";
import { useBrand } from "../brand/BrandProvider";
import { progress, type DurationTier, type StaggerTier } from "../engine/timing";

/**
 * LEVEL 1 · Lines of type arriving.
 *
 * Four behaviours, chosen by the brand's vocabulary rather than by the caller:
 *   mask-rise   — each line rises inside its own overflow box (typesetting, not transition)
 *   clip-wipe   — each line clips open left→right
 *   mask-drop   — each line drops down inside its box (the inverse of rise)
 *   hard        — lines appear whole, one per stagger step. No easing at all.
 *
 * Fading is deliberately not an option. If a brand needs it, that is a new
 * behaviour to argue for, not a prop to flip.
 */
export type TextBehaviour = "mask-rise" | "mask-drop" | "clip-wipe" | "hard";

export const TextReveal: React.FC<{
  lines: string[];
  behaviour?: TextBehaviour;
  role?: "headline" | "subhead" | "body" | "label" | "wordmark";
  size?: number;
  align?: "left" | "center" | "right";
  color?: string;
  /** Per-line colour override; undefined entries fall back to `color`. */
  lineColors?: (string | undefined)[];
  delay?: number;
  duration?: DurationTier | number;
  stagger?: StaggerTier | number;
  /** 0→1 exit progress, applied as the reverse of the entrance. */
  exit?: number;
  style?: React.CSSProperties;
}> = ({
  lines,
  behaviour = "mask-rise",
  role = "headline",
  size,
  align = "left",
  color,
  lineColors,
  delay = 0,
  duration = "standard",
  stagger = "normal",
  exit = 0,
  style,
}) => {
  const { brand, ease, frames, stagger: stag, type } = useBrand();
  const frame = useCurrentFrame();
  const d = frames(duration);
  const s = stag(stagger);
  const typeStyle = type(role, size);
  const fontSize = Number(typeStyle.fontSize ?? 100);
  const lineHeight = Number(typeStyle.lineHeight ?? 1);
  const justify = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: justify, ...style }}>
      {lines.map((line, i) => {
        const enter = progress(frame, { delay: delay + i * s, duration: d, easing: ease("enter") });
        // Exit reverses in the same order, so the first line leaves first.
        const t = Math.min(enter, 1 - exit);
        const boxH = fontSize * lineHeight;

        const inner: React.CSSProperties = {
          ...typeStyle,
          color: lineColors?.[i] ?? color ?? brand.colors.foreground,
          // Body copy wraps inside its column; display lines are set by the caller.
          whiteSpace: role === "body" && behaviour !== "mask-rise" && behaviour !== "mask-drop" ? "pre-wrap" : "pre",
          lineHeight,
        };

        if (behaviour === "hard") {
          return (
            <div key={i} style={{ ...inner, opacity: t > 0 ? 1 : 0 }}>
              {line}
            </div>
          );
        }

        if (behaviour === "clip-wipe") {
          return (
            <div
              key={i}
              style={{ ...inner, clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` }}
            >
              {line}
            </div>
          );
        }

        const dir = behaviour === "mask-drop" ? -1 : 1;
        return (
          <div
            key={i}
            style={{
              overflow: "hidden",
              height: boxH,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: justify,
            }}
          >
            <div style={{ ...inner, transform: `translateY(${dir * (1 - t) * 100}%)` }}>{line}</div>
          </div>
        );
      })}
    </div>
  );
};
